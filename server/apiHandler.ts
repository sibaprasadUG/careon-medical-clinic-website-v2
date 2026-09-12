import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Doctor, Department, Service, WebsiteSettings, MediaAsset, AdminUser, AppointmentRequest, ServerStore } from '../src/types';
import { DEFAULT_DEPARTMENTS, DEFAULT_SERVICES, DEFAULT_WEBSITE_SETTINGS } from '../src/data/seedData';
import { PROJECT_ASSETS_MANIFEST } from '../src/data/assetsManifest';
import { INITIAL_PRODUCTION_STORE } from '../src/data/productionStoreSnapshot';
import {
  isSupabaseConfigured,
  getSupabaseDoctors,
  getSupabaseDoctor,
  upsertSupabaseDoctor,
  deleteSupabaseDoctor,
  reorderSupabaseDoctors,
  getSupabaseDepartments,
  getSupabaseServices,
  getSupabaseSettings,
  saveSupabaseSettings,
  checkSupabaseHealth,
  getSupabaseMediaAssets,
  deleteSupabaseMediaAsset,
  saveSupabaseMediaAssets,
  getSupabaseDeletedAssetIds,
  uploadFileToSupabaseStorageAndSaveMetadata,
  getSupabaseAppointments,
  saveSupabaseAppointments,
  createSupabaseAppointment,
  updateSupabaseAppointment,
  deleteSupabaseAppointment
} from './supabase';

// Persistent data file paths for local server / container fallback
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'careon_store.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'careon_store.json');

/**
 * Secret key for HMAC session token signing (server-side only).
 * Strictly sourced from process.env.SESSION_SECRET.
 * If unset in non-production/local container, generates an ephemeral 256-bit random key.
 * This guarantees zero hardcoded secrets in repository or build output.
 */
let ephemeralSessionSecret: string | null = null;
function getSessionSecret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }
  if (!ephemeralSessionSecret) {
    ephemeralSessionSecret = crypto.randomBytes(32).toString('hex');
  }
  return ephemeralSessionSecret;
}

/**
 * Retrieves the admin credentials securely from server environment variables.
 * Fails securely if ADMIN_EMAIL or ADMIN_PASSWORD is not configured.
 * Never hardcodes default credentials or exposes passwords.
 */
export function getAdminCredentials(): { email: string; password: string } {
  const email = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : '';
  const password = process.env.ADMIN_PASSWORD ? String(process.env.ADMIN_PASSWORD) : '';

  if (!email || !password) {
    throw new Error(
      'ADMIN_AUTH_NOT_CONFIGURED: Both ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be configured on the server.'
    );
  }

  return { email, password };
}

// In-memory cache for fast lookups
let inMemoryStore: ServerStore | null = null;
let lastLoadedMtime = 0;

const DEMO_DOCTOR_NAMES = [
  'Dr. Arindam Banerjee',
  'Dr. Sarmistha Mukherjee',
  'Dr. Debabrata Roy',
  'Dr. Nandini Sengupta'
];

export function isRealDoctor(d: any): boolean {
  if (!d || typeof d !== 'object' || !d.name || typeof d.name !== 'string') return false;
  const name = d.name.trim();
  if (!name) return false;
  if (DEMO_DOCTOR_NAMES.includes(name)) return false;
  if (['doc-01', 'doc-02', 'doc-03', 'doc-04'].includes(d.id) && DEMO_DOCTOR_NAMES.includes(name)) return false;
  if (d.serviceType || d.category === 'Preventive' || d.category === 'Diagnostic' || d.category === 'Specialized') return false;
  return true;
}

/**
 * Load local file store (used as fallback when Supabase is not yet configured)
 */
export async function getLocalStore(): Promise<ServerStore> {
  let activeFilePath: string | null = null;
  let activeMtime = 0;

  try {
    const dataFileExists = fs.existsSync(DATA_FILE);
    const dataFileMtime = dataFileExists ? fs.statSync(DATA_FILE).mtimeMs : 0;

    const tmpFileExists = fs.existsSync(TMP_DATA_FILE);
    const tmpFileMtime = tmpFileExists ? fs.statSync(TMP_DATA_FILE).mtimeMs : 0;

    if (tmpFileExists && tmpFileMtime > dataFileMtime) {
      activeFilePath = TMP_DATA_FILE;
      activeMtime = tmpFileMtime;
    } else if (dataFileExists) {
      activeFilePath = DATA_FILE;
      activeMtime = dataFileMtime;
    }
  } catch {
    // Continue
  }

  if (inMemoryStore && activeFilePath && activeMtime <= lastLoadedMtime) {
    return inMemoryStore;
  }

  if (activeFilePath) {
    try {
      const raw = fs.readFileSync(activeFilePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.doctors)) {
        parsed.doctors = parsed.doctors.filter(isRealDoctor);
        inMemoryStore = parsed;
        lastLoadedMtime = activeMtime;
        return inMemoryStore!;
      }
    } catch {
      // Fallback
    }
  }

  if (inMemoryStore) {
    return inMemoryStore;
  }

  // Fallback to bundled snapshot (contains real clinic faculty DR. DEBDUTTA NAYAK & DR. ARKA DEY)
  const initialStore: ServerStore = {
    ...INITIAL_PRODUCTION_STORE,
    doctors: INITIAL_PRODUCTION_STORE.doctors.filter(isRealDoctor),
    lastUpdated: new Date().toISOString()
  };

  await persistLocalStore(initialStore);
  return initialStore;
}

/**
 * Persist to local filesystem
 */
export async function persistLocalStore(store: ServerStore): Promise<void> {
  store.lastUpdated = new Date().toISOString();
  store.doctors = store.doctors.filter(isRealDoctor);
  inMemoryStore = store;

  const jsonStr = JSON.stringify(store, null, 2);

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, jsonStr, 'utf-8');
    lastLoadedMtime = fs.statSync(DATA_FILE).mtimeMs;
  } catch {
    // Read-only filesystem in serverless
  }

  try {
    fs.writeFileSync(TMP_DATA_FILE, jsonStr, 'utf-8');
    const tmpMtime = fs.statSync(TMP_DATA_FILE).mtimeMs;
    if (tmpMtime > lastLoadedMtime) {
      lastLoadedMtime = tmpMtime;
    }
  } catch {
    // Tmp write error
  }
}

/**
 * Universal store retrieval
 * When Supabase is configured: reads from Supabase PostgreSQL.
 * Otherwise: falls back to local file store.
 */
export async function getPersistentStore(): Promise<ServerStore> {
  if (isSupabaseConfigured()) {
    try {
      const [doctors, departments, services, settings, assets] = await Promise.all([
        getSupabaseDoctors(),
        getSupabaseDepartments(),
        getSupabaseServices(),
        getSupabaseSettings(),
        getSupabaseMediaAssets()
      ]);

      const store: ServerStore = {
        doctors: doctors.filter(isRealDoctor),
        departments: departments && departments.length > 0 ? departments : DEFAULT_DEPARTMENTS,
        services: services && services.length > 0 ? services : DEFAULT_SERVICES,
        settings: settings || DEFAULT_WEBSITE_SETTINGS,
        assets: assets && assets.length > 0 ? assets : PROJECT_ASSETS_MANIFEST,
        invalidatedTokens: inMemoryStore?.invalidatedTokens || [],
        lastUpdated: new Date().toISOString()
      };
      inMemoryStore = store;
      return store;
    } catch (err: any) {
      console.warn('[CareOn API] Supabase fetch error, using local cache:', err.message);
      return getLocalStore();
    }
  }

  return getLocalStore();
}

/**
 * Universal store persist
 */
export async function persistStore(store: ServerStore): Promise<void> {
  await persistLocalStore(store);
}

// Synchronous wrapper for token verification and quick lookups
export function getCachedStoreSync(): ServerStore {
  if (inMemoryStore) return inMemoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed) {
        parsed.doctors = (parsed.doctors || []).filter(isRealDoctor);
        inMemoryStore = parsed;
        return inMemoryStore!;
      }
    }
  } catch {
    // Ignore
  }
  inMemoryStore = {
    ...INITIAL_PRODUCTION_STORE,
    doctors: INITIAL_PRODUCTION_STORE.doctors.filter(isRealDoctor)
  };
  return inMemoryStore;
}

// Cryptographic token helpers
export function createSessionToken(user: AdminUser): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifySessionToken(token: string): { valid: boolean; user?: AdminUser; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'No token provided' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed token' };
  }

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    return { valid: false, error: 'Invalid token signature' };
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && Date.now() > data.exp) {
      return { valid: false, error: 'Token expired' };
    }

    const store = getCachedStoreSync();
    if (store.invalidatedTokens && store.invalidatedTokens.includes(token)) {
      return { valid: false, error: 'Token has been invalidated/logged out' };
    }

    return {
      valid: true,
      user: {
        id: data.sub || 'usr-admin-01',
        email: data.email || 'administrator',
        name: data.name || 'CareOn Administrator',
        role: 'ADMIN'
      }
    };
  } catch {
    return { valid: false, error: 'Invalid token payload' };
  }
}

export async function invalidateSessionToken(token: string) {
  const store = await getLocalStore();
  if (!store.invalidatedTokens.includes(token)) {
    store.invalidatedTokens.push(token);
    if (store.invalidatedTokens.length > 500) {
      store.invalidatedTokens = store.invalidatedTokens.slice(-500);
    }
    await persistLocalStore(store);
  }
}

// Request & Response Interfaces
export interface ApiRequest {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  body?: any;
  query?: Record<string, string>;
}

export interface ApiResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

/**
 * Universal API Request Handler
 * Backed by Supabase PostgreSQL (Project: careon-medical-clinic)
 * Supported endpoints:
 * - /api/health
 * - /api/auth/login, /api/auth/verify, /api/auth/logout
 * - /api/doctors (GET, POST)
 * - /api/doctors/:id (GET, PUT, PATCH, DELETE)
 * - /api/doctors/reorder (POST)
 * - /api/data (GET)
 * - /api/data/sync (POST)
 * - /api/assets (GET)
 */
export async function handleApiRequest(req: ApiRequest): Promise<ApiResponse> {
  const cleanPath = req.path.replace(/^\/api/, '').replace(/\/$/, '') || '/';
  const method = (req.method || 'GET').toUpperCase();

  // Extract session token from Authorization header or HttpOnly Cookie
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'] || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  if (!token && req.headers) {
    const rawCookie = req.headers['cookie'] || req.headers['Cookie'] || '';
    const cookieMatch = rawCookie.match(/(?:^|;\s*)careon_admin_session=([^;]+)/);
    if (cookieMatch) {
      token = decodeURIComponent(cookieMatch[1].trim());
    }
  }

  const jsonResponse = (statusCode: number, data: any, customHeaders: Record<string, string> = {}): ApiResponse => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      ...customHeaders
    },
    body: JSON.stringify(data)
  });

  // CORS preflight
  if (method === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  // --- HEALTH CHECK ENDPOINT ---
  if (cleanPath === '/health' || cleanPath === '') {
    const supabaseConfigured = isSupabaseConfigured();
    if (supabaseConfigured) {
      const health = await checkSupabaseHealth();
      return jsonResponse(200, {
        status: 'ok',
        version: 'careon-supabase-3.0',
        time: new Date().toISOString(),
        database: {
          provider: 'supabase_postgresql',
          project: 'careon-medical-clinic',
          connected: health.connected,
          tablesReady: health.tablesReady,
          permissionsGranted: health.permissionsGranted,
          doctorsCount: health.doctorsCount,
          departmentsCount: health.departmentsCount,
          servicesCount: health.servicesCount,
          sqlGrantScript: health.sqlGrantScript,
          error: health.error
        }
      });
    }

    const store = await getLocalStore();
    return jsonResponse(200, {
      status: 'ok',
      version: 'careon-supabase-3.0',
      time: new Date().toISOString(),
      database: {
        provider: 'local_file_fallback',
        project: 'careon-medical-clinic',
        connected: false,
        hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect live Supabase PostgreSQL database.',
        doctorsCount: store.doctors.length,
        lastUpdated: store.lastUpdated
      }
    });
  }

  // --- AUTH ENDPOINTS ---
  if (cleanPath === '/auth/login' && method === 'POST') {
    let adminCreds: { email: string; password: string };
    try {
      adminCreds = getAdminCredentials();
    } catch {
      console.error('[CareOn Auth] Server configuration error: ADMIN_EMAIL or ADMIN_PASSWORD environment variable is missing.');
      return jsonResponse(500, {
        success: false,
        error: 'Admin authentication is not configured on the server. Please ensure ADMIN_EMAIL and ADMIN_PASSWORD environment variables are set.'
      });
    }

    const { email, password } = req.body || {};
    if (!email || !password) {
      return jsonResponse(400, { success: false, error: 'Admin email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const isEmailMatch = cleanEmail === adminCreds.email;
    const isPassMatch = String(password) === adminCreds.password;

    if (!isEmailMatch || !isPassMatch) {
      return jsonResponse(401, { success: false, error: 'Invalid admin credentials.' });
    }

    const adminUser: AdminUser = {
      id: 'usr-admin-01',
      email: adminCreds.email,
      name: 'CareOn Administrator',
      role: 'ADMIN'
    };

    const sessionToken = createSessionToken(adminUser);
    const isProd = process.env.NODE_ENV === 'production';
    const cookieHeaderVal = `careon_admin_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isProd ? '; Secure' : ''}`;

    return jsonResponse(200, {
      success: true,
      token: sessionToken,
      user: adminUser
    }, {
      'Set-Cookie': cookieHeaderVal
    });
  }

  if (cleanPath === '/auth/verify' && (method === 'GET' || method === 'POST')) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { valid: false, error: auth.error || 'Unauthorized' });
    }
    return jsonResponse(200, { valid: true, user: auth.user });
  }

  if (cleanPath === '/auth/logout' && method === 'POST') {
    if (token) {
      await invalidateSessionToken(token);
    }
    const isProd = process.env.NODE_ENV === 'production';
    const clearCookieVal = `careon_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProd ? '; Secure' : ''}`;
    return jsonResponse(200, { success: true, message: 'Logged out successfully.' }, {
      'Set-Cookie': clearCookieVal
    });
  }

  // --- DOCTOR CRUD ENDPOINTS ---

  // 1. GET /api/doctors (List all doctors, with optional department/status filter)
  if (cleanPath === '/doctors' && method === 'GET') {
    if (isSupabaseConfigured()) {
      try {
        const doctors = await getSupabaseDoctors({
          department: req.query?.department,
          status: req.query?.status
        });
        const validDoctors = doctors.filter(isRealDoctor);
        return jsonResponse(200, {
          success: true,
          doctors: validDoctors,
          total: validDoctors.length,
          source: 'supabase_postgresql',
          lastUpdated: new Date().toISOString()
        });
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase GET /doctors error:', sbErr.message);
        return jsonResponse(200, {
          success: true,
          doctors: [],
          total: 0,
          source: 'supabase_postgresql',
          error: sbErr.message,
          lastUpdated: new Date().toISOString()
        });
      }
    }

    const store = await getLocalStore();
    let doctors = store.doctors.filter(isRealDoctor);

    if (req.query?.department && req.query.department !== 'all') {
      doctors = doctors.filter((d) => d.departmentId === req.query!.department);
    }
    if (req.query?.status) {
      doctors = doctors.filter((d) => d.status === req.query!.status);
    }

    return jsonResponse(200, {
      success: true,
      doctors,
      total: doctors.length,
      source: 'local_store',
      lastUpdated: store.lastUpdated
    });
  }

  // 2. GET /api/doctors/:id (Single doctor details by ID or Slug)
  if (cleanPath.startsWith('/doctors/') && cleanPath.split('/').length === 3 && method === 'GET') {
    const docIdOrSlug = cleanPath.split('/')[2];

    if (isSupabaseConfigured()) {
      try {
        const doctor = await getSupabaseDoctor(docIdOrSlug);
        if (doctor && isRealDoctor(doctor)) {
          return jsonResponse(200, { success: true, doctor, source: 'supabase_postgresql' });
        }
      } catch (err: any) {
        console.warn('[CareOn API] Supabase GET doctor/:id error:', err.message);
      }
    }

    const store = await getLocalStore();
    const doctor = store.doctors.find((d) => (d.id === docIdOrSlug || d.slug === docIdOrSlug) && isRealDoctor(d));

    if (!doctor) {
      return jsonResponse(404, { success: false, error: `Doctor ${docIdOrSlug} not found.` });
    }

    return jsonResponse(200, { success: true, doctor, source: 'local_store' });
  }

  // 3. POST /api/doctors (Create new doctor - Admin only)
  if (cleanPath === '/doctors' && method === 'POST') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const doctorData = req.body as Partial<Doctor>;
    if (!doctorData || !doctorData.name || !doctorData.departmentId) {
      return jsonResponse(400, { success: false, error: 'Doctor name and department are required.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const savedDoctor = await upsertSupabaseDoctor(doctorData);
        // Also update local cache
        const localStore = await getLocalStore();
        const existingIdx = localStore.doctors.findIndex((d) => d.id === savedDoctor.id);
        if (existingIdx >= 0) {
          localStore.doctors[existingIdx] = savedDoctor;
        } else {
          localStore.doctors.push(savedDoctor);
        }
        await persistLocalStore(localStore);

        const allDocs = await getSupabaseDoctors();
        return jsonResponse(201, {
          success: true,
          doctor: savedDoctor,
          doctors: allDocs.filter(isRealDoctor),
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase doctor create error:', sbErr.message);
        return jsonResponse(500, { success: false, error: `Supabase insert failed: ${sbErr.message}` });
      }
    }

    // Fallback to local store
    const store = await getLocalStore();
    const existingIndex = store.doctors.findIndex(
      (d) => (doctorData.id && d.id === doctorData.id) || d.name.trim().toLowerCase() === doctorData.name!.trim().toLowerCase()
    );

    let savedDoctor: Doctor;
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      savedDoctor = {
        ...store.doctors[existingIndex],
        ...doctorData,
        id: store.doctors[existingIndex].id,
        updatedAt: now
      };
      store.doctors[existingIndex] = savedDoctor;
    } else {
      const maxOrder = store.doctors.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
      savedDoctor = {
        id: doctorData.id || `doc-${Date.now()}`,
        name: doctorData.name,
        nameBn: doctorData.nameBn || '',
        slug: doctorData.slug || doctorData.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
        photoUrl: doctorData.profilePhotoUrl || doctorData.photoUrl || '',
        profilePhotoUrl: doctorData.profilePhotoUrl || doctorData.photoUrl || '',
        photoAssetId: doctorData.photoAssetId || doctorData.profilePhotoAssetId || '',
        profilePhotoAssetId: doctorData.photoAssetId || doctorData.profilePhotoAssetId || '',
        profilePhotoAlt: doctorData.profilePhotoAlt || `Dr. ${doctorData.name} - CareOn Medical Clinic`,
        departmentId: doctorData.departmentId,
        specialtyId: doctorData.specialtyId || '',
        designation: doctorData.designation || 'Consultant',
        qualification: doctorData.qualification || 'MBBS',
        registrationNumber: doctorData.registrationNumber || '',
        shortBio: doctorData.shortBio || '',
        areasOfExpertise: doctorData.areasOfExpertise || [],
        schedules: doctorData.schedules || [],
        chamberId: doctorData.chamberId || 'CareOn Medical Clinic',
        chamberCustom: doctorData.chamberCustom || '',
        serviceIds: doctorData.serviceIds || [],
        active: doctorData.status !== 'INACTIVE' && doctorData.active !== false,
        published: doctorData.status !== 'INACTIVE' && doctorData.active !== false,
        consultationDays: doctorData.consultationDays || ['Sat'],
        consultationTime: doctorData.consultationTime || '10:30 AM – 11:30 AM',
        roomNumber: doctorData.roomNumber || 'CareOn Medical Clinic',
        weeklySchedule: doctorData.weeklySchedule,
        customSchedules: doctorData.customSchedules,
        scheduleExceptions: doctorData.scheduleExceptions,
        appointmentEnabled: doctorData.appointmentEnabled !== undefined ? doctorData.appointmentEnabled : true,
        featured: Boolean(doctorData.featured),
        displayOrder: doctorData.displayOrder || maxOrder + 1,
        status: doctorData.status || (doctorData.active === false ? 'INACTIVE' : 'ACTIVE'),
        createdAt: now,
        updatedAt: now
      };
      store.doctors.push(savedDoctor);
    }

    await persistLocalStore(store);

    return jsonResponse(201, {
      success: true,
      doctor: savedDoctor,
      doctors: store.doctors.filter(isRealDoctor),
      source: 'local_store'
    });
  }

  // 4. PUT /api/doctors/:id or PATCH /api/doctors/:id (Update doctor - Admin only)
  if (
    cleanPath.startsWith('/doctors/') &&
    cleanPath.split('/').length === 3 &&
    (method === 'PUT' || method === 'PATCH')
  ) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const doctorId = cleanPath.split('/')[2];
    const updateData = req.body as Partial<Doctor>;

    if (isSupabaseConfigured()) {
      try {
        const updated = await upsertSupabaseDoctor({ ...updateData, id: doctorId });
        const allDocs = await getSupabaseDoctors();
        return jsonResponse(200, {
          success: true,
          doctor: updated,
          doctors: allDocs.filter(isRealDoctor),
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase update doctor error:', sbErr.message);
        return jsonResponse(500, { success: false, error: `Supabase update failed: ${sbErr.message}` });
      }
    }

    const store = await getLocalStore();
    const index = store.doctors.findIndex((d) => d.id === doctorId);

    if (index === -1) {
      return jsonResponse(404, { success: false, error: `Doctor ${doctorId} not found.` });
    }

    const existing = store.doctors[index];
    const updatedDoctor: Doctor = {
      ...existing,
      ...updateData,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    store.doctors[index] = updatedDoctor;
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      doctor: updatedDoctor,
      doctors: store.doctors.filter(isRealDoctor),
      source: 'local_store'
    });
  }

  // 5. DELETE /api/doctors/:id (Delete doctor - Admin only)
  if (cleanPath.startsWith('/doctors/') && cleanPath.split('/').length === 3 && method === 'DELETE') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const doctorId = cleanPath.split('/')[2];

    if (isSupabaseConfigured()) {
      try {
        await deleteSupabaseDoctor(doctorId);
        const allDocs = await getSupabaseDoctors();

        // Also remove from local cache
        const localStore = await getLocalStore();
        localStore.doctors = localStore.doctors.filter((d) => d.id !== doctorId);
        await persistLocalStore(localStore);

        return jsonResponse(200, {
          success: true,
          message: `Doctor ${doctorId} permanently removed from Supabase production database.`,
          doctors: allDocs.filter(isRealDoctor),
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase delete doctor error:', sbErr.message);
        return jsonResponse(500, { success: false, error: `Supabase delete failed: ${sbErr.message}` });
      }
    }

    const store = await getLocalStore();
    const beforeCount = store.doctors.length;
    const removedDoctor = store.doctors.find((d) => d.id === doctorId);

    store.doctors = store.doctors.filter((d) => d.id !== doctorId);

    if (store.doctors.length !== beforeCount) {
      await persistLocalStore(store);
    }

    return jsonResponse(200, {
      success: true,
      message: `Doctor ${doctorId} (${removedDoctor?.name || 'Doctor'}) permanently deleted.`,
      doctors: store.doctors.filter(isRealDoctor),
      source: 'local_store'
    });
  }

  // 6. POST /api/doctors/reorder (Reorder doctors - Admin only)
  if (cleanPath === '/doctors/reorder' && method === 'POST') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const { orders } = req.body || {};
    if (!Array.isArray(orders)) {
      return jsonResponse(400, { success: false, error: 'orders array is required.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const reordered = await reorderSupabaseDoctors(orders);
        return jsonResponse(200, {
          success: true,
          doctors: reordered.filter(isRealDoctor),
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase reorder error:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    for (const item of orders) {
      const doc = store.doctors.find((d) => d.id === item.id);
      if (doc && typeof item.displayOrder === 'number') {
        doc.displayOrder = item.displayOrder;
      }
    }

    store.doctors.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      doctors: store.doctors.filter(isRealDoctor),
      source: 'local_store'
    });
  }

  // --- FULL DATA SYNC & SYSTEM RESTORE ---

  // GET /api/data (Full unified dataset)
  if (cleanPath === '/data' && method === 'GET') {
    const store = await getPersistentStore();
    return jsonResponse(200, {
      success: true,
      doctors: store.doctors.filter(isRealDoctor),
      departments: store.departments,
      services: store.services,
      settings: store.settings,
      assets: store.assets,
      source: isSupabaseConfigured() ? 'supabase_postgresql' : 'local_store',
      lastUpdated: store.lastUpdated
    });
  }

  // POST /api/data/sync (Admin full dataset sync / restore)
  if (cleanPath === '/data/sync' && method === 'POST') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const payload = req.body || {};

    if (isSupabaseConfigured()) {
      try {
        if (Array.isArray(payload.doctors)) {
          for (const doc of payload.doctors.filter(isRealDoctor)) {
            await upsertSupabaseDoctor(doc);
          }
        }
        if (payload.settings && typeof payload.settings === 'object') {
          await saveSupabaseSettings(payload.settings);
        }
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase full sync error:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    if (Array.isArray(payload.doctors)) {
      store.doctors = payload.doctors.filter(isRealDoctor);
    }
    if (Array.isArray(payload.departments) && payload.departments.length > 0) {
      store.departments = payload.departments;
    }
    if (Array.isArray(payload.services) && payload.services.length > 0) {
      store.services = payload.services;
    }
    if (payload.settings && typeof payload.settings === 'object') {
      store.settings = { ...store.settings, ...payload.settings };
    }
    if (Array.isArray(payload.assets) && payload.assets.length > 0) {
      store.assets = payload.assets;
    }

    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      message: 'Production database synchronized successfully.',
      doctors: store.doctors.filter(isRealDoctor),
      source: isSupabaseConfigured() ? 'supabase_postgresql' : 'local_store',
      lastUpdated: store.lastUpdated
    });
  }

  // GET /api/departments (List all clinical departments from Supabase or fallback)
  if (cleanPath === '/departments' && method === 'GET') {
    if (isSupabaseConfigured()) {
      try {
        const departments = await getSupabaseDepartments();
        return jsonResponse(200, {
          success: true,
          departments,
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase GET /departments note:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    return jsonResponse(200, {
      success: true,
      departments: store.departments,
      source: 'local_store'
    });
  }

  // GET /api/services (List all clinical services from Supabase or fallback)
  if (cleanPath === '/services' && method === 'GET') {
    if (isSupabaseConfigured()) {
      try {
        const services = await getSupabaseServices();
        return jsonResponse(200, {
          success: true,
          services,
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase GET /services note:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    return jsonResponse(200, {
      success: true,
      services: store.services,
      source: 'local_store'
    });
  }

  // GET /api/settings (Website settings from Supabase or fallback)
  if (cleanPath === '/settings' && method === 'GET') {
    if (isSupabaseConfigured()) {
      try {
        const settings = await getSupabaseSettings();
        return jsonResponse(200, {
          success: true,
          settings,
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase GET /settings note:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    return jsonResponse(200, {
      success: true,
      settings: store.settings,
      source: 'local_store'
    });
  }

  // PUT or POST /api/settings/section-media (Update section media visual settings in Supabase & local store)
  if ((cleanPath === '/settings/section-media' || cleanPath === '/section-media') && (method === 'PUT' || method === 'POST')) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const mediaUpdates = req.body || {};
    if (typeof mediaUpdates !== 'object') {
      return jsonResponse(400, { success: false, error: 'Invalid section media payload.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const currentSettings = await getSupabaseSettings();
        const mergedSettings: WebsiteSettings = {
          ...currentSettings,
          sectionMedia: {
            ...(currentSettings.sectionMedia || {}),
            ...mediaUpdates
          }
        };

        const saved = await saveSupabaseSettings(mergedSettings);
        if (!saved) {
          return jsonResponse(500, {
            success: false,
            error: 'Failed to write updated section media to Supabase site_settings.'
          });
        }

        // Keep local store in sync
        try {
          const store = await getLocalStore();
          store.settings = mergedSettings;
          await persistLocalStore(store);
        } catch {}

        return jsonResponse(200, {
          success: true,
          sectionMedia: mergedSettings.sectionMedia,
          settings: mergedSettings,
          message: 'Section media successfully saved and persisted to Supabase database.',
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase update section media error:', sbErr.message);
        return jsonResponse(500, {
          success: false,
          error: `Failed to persist section media to Supabase: ${sbErr.message}`
        });
      }
    }

    // Local fallback
    const store = await getLocalStore();
    const current = store.settings || DEFAULT_WEBSITE_SETTINGS;
    current.sectionMedia = {
      ...(current.sectionMedia || {}),
      ...mediaUpdates
    };
    store.settings = current;
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      sectionMedia: current.sectionMedia,
      settings: current,
      message: 'Section media saved to local store.',
      source: 'local_store'
    });
  }

  // PUT or POST /api/settings (Update full or partial website settings in Supabase & local store)
  if (cleanPath === '/settings' && (method === 'PUT' || method === 'POST')) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const updates = req.body || {};
    if (typeof updates !== 'object') {
      return jsonResponse(400, { success: false, error: 'Invalid settings payload.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const currentSettings = await getSupabaseSettings();
        const mergedSettings: WebsiteSettings = {
          ...currentSettings,
          ...updates,
          sectionMedia: updates.sectionMedia !== undefined
            ? { ...(currentSettings.sectionMedia || {}), ...updates.sectionMedia }
            : currentSettings.sectionMedia,
          brand: updates.brand !== undefined
            ? { ...(currentSettings.brand || {}), ...updates.brand }
            : currentSettings.brand,
          socialLinks: updates.socialLinks !== undefined
            ? { ...(currentSettings.socialLinks || {}), ...updates.socialLinks }
            : currentSettings.socialLinks
        };

        const saved = await saveSupabaseSettings(mergedSettings);
        if (!saved) {
          return jsonResponse(500, {
            success: false,
            error: 'Failed to write updated settings to Supabase site_settings table.'
          });
        }

        // Keep local store in sync
        try {
          const store = await getLocalStore();
          store.settings = mergedSettings;
          await persistLocalStore(store);
        } catch {}

        return jsonResponse(200, {
          success: true,
          settings: mergedSettings,
          message: 'Website settings successfully saved and persisted to Supabase database.',
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.error('[CareOn API] Supabase update settings error:', sbErr.message);
        return jsonResponse(500, {
          success: false,
          error: `Failed to persist settings to Supabase: ${sbErr.message}`
        });
      }
    }

    // Local fallback
    const store = await getLocalStore();
    const current = store.settings || DEFAULT_WEBSITE_SETTINGS;
    const merged = { ...current, ...updates };
    store.settings = merged;
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      settings: merged,
      message: 'Website settings saved to local store.',
      source: 'local_store'
    });
  }

  // GET /api/assets or GET /api/media (List all media assets from Supabase or fallback)
  if ((cleanPath === '/assets' || cleanPath === '/media') && method === 'GET') {
    if (isSupabaseConfigured()) {
      try {
        const assets = await getSupabaseMediaAssets();
        return jsonResponse(200, {
          success: true,
          assets,
          source: 'supabase_postgresql'
        });
      } catch (sbErr: any) {
        console.warn('[CareOn API] Supabase GET /assets note:', sbErr.message);
      }
    }

    const store = await getLocalStore();
    return jsonResponse(200, {
      success: true,
      assets: store.assets || PROJECT_ASSETS_MANIFEST,
      source: 'local_store'
    });
  }

  // POST /api/assets/upload or POST /api/media/upload or POST /api/media (Media upload to Supabase Storage + Database)
  const isMediaUpload =
    (cleanPath === '/assets/upload' ||
      cleanPath === '/media/upload' ||
      cleanPath === '/media' ||
      cleanPath === '/assets') &&
    method === 'POST';

  if (isMediaUpload) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const body = req.body || {};
    const { fileName, fileData, mimeType, category, altText, width, height } = body;

    if (!fileData) {
      return jsonResponse(400, {
        success: false,
        error: 'File data is required (base64 encoded string).'
      });
    }

    try {
      const rawBase64 = String(fileData).includes(',')
        ? String(fileData).split(',')[1]
        : String(fileData);
      const fileBuffer = Buffer.from(rawBase64, 'base64');

      if (isSupabaseConfigured()) {
        const uploadResult = await uploadFileToSupabaseStorageAndSaveMetadata({
          fileBuffer,
          fileName: fileName || `careon-upload-${Date.now()}.jpg`,
          mimeType: mimeType || 'image/jpeg',
          category: category || 'CLINIC',
          altText: altText || '',
          adminEmail: auth.user.email,
          width,
          height
        });

        if (!uploadResult.success) {
          return jsonResponse(400, {
            success: false,
            error: uploadResult.error || 'Failed to upload asset to Supabase Storage.'
          });
        }

        // Sync local store
        try {
          const store = await getLocalStore();
          if (uploadResult.asset) {
            store.assets = [uploadResult.asset, ...(store.assets || [])];
            await persistLocalStore(store);
          }
        } catch {}

        return jsonResponse(201, {
          success: true,
          asset: uploadResult.asset,
          source: 'supabase_storage_postgresql'
        });
      }

      // Fallback if Supabase is not configured
      const uniqueId = `asset-${Date.now()}`;
      const safeName = (fileName || `asset-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const fallbackAsset: MediaAsset = {
        id: uniqueId,
        fileName: safeName,
        originalName: fileName || safeName,
        mimeType: mimeType || 'image/jpeg',
        category: (category as any) || 'CLINIC',
        url: fileData.startsWith('data:')
          ? fileData
          : `data:${mimeType || 'image/jpeg'};base64,${rawBase64}`,
        storageKey: `local/${safeName}`,
        storageBucket: 'careon-media',
        fileSize: fileBuffer.length,
        width,
        height,
        altText: altText || safeName,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: auth.user.email,
        updatedBy: auth.user.email,
        version: 1
      };

      const store = await getLocalStore();
      store.assets = [fallbackAsset, ...(store.assets || [])];
      await persistLocalStore(store);

      return jsonResponse(201, {
        success: true,
        asset: fallbackAsset,
        source: 'local_store'
      });
    } catch (uploadErr: any) {
      console.error('[CareOn API] Upload handling error:', uploadErr.message);
      return jsonResponse(500, {
        success: false,
        error: `Upload processing failed: ${uploadErr.message}`
      });
    }
  }

  // DELETE /api/assets/:id or DELETE /api/media/:id (Permanent asset deletion from database & Supabase Storage)
  const isAssetsDelete = cleanPath === '/assets' || cleanPath.startsWith('/assets/');
  const isMediaDelete = cleanPath === '/media' || cleanPath.startsWith('/media/');
  if ((isAssetsDelete || isMediaDelete) && method === 'DELETE') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    let assetId = '';
    if (cleanPath.startsWith('/assets/') && cleanPath.length > '/assets/'.length) {
      assetId = decodeURIComponent(cleanPath.slice('/assets/'.length));
    } else if (cleanPath.startsWith('/media/') && cleanPath.length > '/media/'.length) {
      assetId = decodeURIComponent(cleanPath.slice('/media/'.length));
    }

    const query = req.query || {};
    const body = req.body || {};

    const targetId = assetId || String(query.id || body.id || '');
    const fileName = String(query.fileName || body.fileName || '');
    const storageKey = String(query.storageKey || body.storageKey || '');
    const url = String(query.url || body.url || '');
    const category = String(query.category || body.category || '');

    if (!targetId && !fileName && !storageKey) {
      return jsonResponse(400, { success: false, error: 'Asset ID, filename, or storageKey is required for deletion.' });
    }

    const force =
      query.force === 'true' ||
      String(query.force) === 'true' ||
      body.force === true;

    console.log(`[CareOn API] Admin ${auth.user.email} initiated permanent deletion of asset: ${targetId || fileName} (force: ${force})`);

    let deletedAsset: MediaAsset | undefined;
    let storageDeleted = false;
    let storageDetails: any = null;
    let diagnostics: any = null;

    if (isSupabaseConfigured()) {
      try {
        const result = await deleteSupabaseMediaAsset({
          id: targetId,
          fileName,
          storageKey,
          url,
          category,
          force,
          adminEmail: auth.user.email
        });
        if (!result.success) {
          console.error(`[CareOn API] Supabase media delete returned failure:`, result.error);
          return jsonResponse(400, {
            success: false,
            error: result.error || 'Failed to delete asset from production database and storage.'
          });
        }
        deletedAsset = result.deletedAsset;
        storageDeleted = Boolean(result.storageDeleted);
        storageDetails = result.storageDetails;
        diagnostics = (result as any).diagnostics;
      } catch (err: any) {
        console.error('[CareOn API] Fatal error in Supabase asset deletion:', err.message);
        return jsonResponse(500, {
          success: false,
          error: `Storage/database deletion error: ${err.message}`
        });
      }
    }

    // Synchronize local fallback store
    try {
      const store = await getLocalStore();
      if (Array.isArray(store.assets)) {
        const matchFn = (a: MediaAsset) =>
          (targetId && (a.id === targetId || a.fileName === targetId || a.storageKey === targetId)) ||
          (fileName && a.fileName.toLowerCase() === fileName.toLowerCase()) ||
          (storageKey && a.storageKey === storageKey);

        const found = store.assets.find(matchFn);
        if (!deletedAsset && found) {
          deletedAsset = found;
        }
        store.assets = store.assets.filter((a) => !matchFn(a));
        await persistLocalStore(store);
      }
    } catch (storeErr: any) {
      console.warn('[CareOn API] Note syncing local store on asset delete:', storeErr.message);
    }

    return jsonResponse(200, {
      success: true,
      message: `Asset "${deletedAsset?.fileName || targetId || fileName}" permanently deleted from database and Supabase Storage.`,
      deletedAsset,
      storageDeleted,
      storageDetails,
      diagnostics,
      source: isSupabaseConfigured() ? 'supabase_postgresql' : 'local_store'
    });
  }

  // --- APPOINTMENT SYSTEM ENDPOINTS (Persists directly to Supabase PostgreSQL site_settings) ---

  // 1. GET /api/appointments (List all appointment requests - Admin only)
  if (cleanPath === '/appointments' && method === 'GET') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const appointments = await getSupabaseAppointments();
        return jsonResponse(200, {
          success: true,
          appointments,
          total: appointments.length,
          source: 'supabase_postgresql'
        });
      } catch (err: any) {
        console.warn('[CareOn API] Supabase appointments load note:', err.message);
      }
    }

    const store = await getLocalStore();
    const appts = (store as any).appointments || [];
    return jsonResponse(200, {
      success: true,
      appointments: appts,
      total: appts.length,
      source: 'local_store'
    });
  }

  // 2. POST /api/appointments (Create/submit an appointment request - Public or Admin)
  if (cleanPath === '/appointments' && method === 'POST') {
    const payload = req.body || {};

    if (!payload.patientName || !String(payload.patientName).trim()) {
      return jsonResponse(400, { success: false, error: 'Patient name is required.' });
    }
    const phone = payload.phone || payload.mobile || payload.patientPhone || '';
    if (!phone || !String(phone).trim()) {
      return jsonResponse(400, { success: false, error: 'Valid phone number is required.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const result = await createSupabaseAppointment(payload);
        if (!result.success) {
          return jsonResponse(400, { success: false, error: result.error });
        }

        // Sync local store
        try {
          const store = await getLocalStore();
          (store as any).appointments = [
            result.appointment,
            ...(((store as any).appointments || []).filter((a: any) => a.id !== result.appointment?.id))
          ];
          await persistLocalStore(store);
        } catch {}

        return jsonResponse(201, {
          success: true,
          appointment: result.appointment,
          message: 'Appointment request submitted successfully.',
          source: 'supabase_postgresql'
        });
      } catch (err: any) {
        console.error('[CareOn API] Supabase create appointment error:', err.message);
        return jsonResponse(500, {
          success: false,
          error: `Database appointment error: ${err.message}`
        });
      }
    }

    // Local store fallback
    const id = `APT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();
    const newAppt: AppointmentRequest = {
      id,
      requestType: payload.requestType || (payload.doctorId ? 'DOCTOR' : 'SERVICE'),
      bookingType:
        payload.bookingType || (payload.doctorId ? 'DOCTOR_CONSULTATION' : 'CLINIC_SERVICE'),
      doctorId: payload.doctorId,
      doctorName: payload.doctorName,
      department: payload.department,
      serviceId: payload.serviceId,
      serviceName: payload.serviceName,
      serviceType: payload.serviceType,
      serviceMode: payload.serviceMode || 'CLINIC',
      locationType: payload.locationType || 'CLINIC',
      preferredDate: payload.preferredDate || payload.requestedDate || '',
      preferredTime: payload.preferredTime || payload.requestedTimeWindow || '',
      requestedDate: payload.requestedDate || payload.preferredDate || '',
      requestedTimeWindow: payload.requestedTimeWindow || payload.preferredTime || '',
      patientName: String(payload.patientName).trim(),
      phone: String(phone).trim(),
      mobile: String(phone).trim(),
      patientPhone: String(phone).trim(),
      email: payload.email?.trim() || payload.patientEmail?.trim(),
      address: payload.address?.trim(),
      notes: payload.notes || payload.patientNotes || payload.reason,
      status: payload.status || 'NEW',
      adminNotes: payload.adminNotes || '',
      createdAt: now,
      updatedAt: now
    };

    const store = await getLocalStore();
    (store as any).appointments = [
      newAppt,
      ...(((store as any).appointments || []).filter((a: any) => a.id !== id))
    ];
    await persistLocalStore(store);

    return jsonResponse(201, {
      success: true,
      appointment: newAppt,
      message: 'Appointment request submitted successfully.',
      source: 'local_store'
    });
  }

  // 3. PUT or PATCH /api/appointments/:id (Update appointment status, schedule, or notes - Admin only)
  if (cleanPath.startsWith('/appointments/') && (method === 'PUT' || method === 'PATCH')) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const apptId = decodeURIComponent(cleanPath.slice('/appointments/'.length));
    if (!apptId) {
      return jsonResponse(400, { success: false, error: 'Appointment ID is required.' });
    }

    const updates = req.body || {};

    if (isSupabaseConfigured()) {
      try {
        const result = await updateSupabaseAppointment(apptId, updates);
        if (!result.success) {
          return jsonResponse(400, { success: false, error: result.error });
        }

        // Sync local store
        try {
          const store = await getLocalStore();
          const list = (store as any).appointments || [];
          const idx = list.findIndex((a: any) => a.id === apptId);
          if (idx !== -1) {
            list[idx] = result.appointment;
            (store as any).appointments = list;
            await persistLocalStore(store);
          }
        } catch {}

        return jsonResponse(200, {
          success: true,
          appointment: result.appointment,
          source: 'supabase_postgresql'
        });
      } catch (err: any) {
        console.error('[CareOn API] Supabase update appointment error:', err.message);
        return jsonResponse(500, {
          success: false,
          error: `Database appointment error: ${err.message}`
        });
      }
    }

    // Local fallback
    const store = await getLocalStore();
    const list = (store as any).appointments || [];
    const idx = list.findIndex((a: any) => a.id === apptId);
    if (idx === -1) {
      return jsonResponse(404, { success: false, error: `Appointment ${apptId} not found.` });
    }

    const updated = { ...list[idx], ...updates, id: apptId, updatedAt: new Date().toISOString() };
    list[idx] = updated;
    (store as any).appointments = list;
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      appointment: updated,
      source: 'local_store'
    });
  }

  // 4. DELETE /api/appointments/:id (Delete appointment - Admin only)
  if (cleanPath.startsWith('/appointments/') && method === 'DELETE') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const apptId = decodeURIComponent(cleanPath.slice('/appointments/'.length));
    if (!apptId) {
      return jsonResponse(400, { success: false, error: 'Appointment ID is required.' });
    }

    if (isSupabaseConfigured()) {
      try {
        const result = await deleteSupabaseAppointment(apptId);
        if (!result.success) {
          return jsonResponse(400, { success: false, error: result.error });
        }

        // Sync local store
        try {
          const store = await getLocalStore();
          (store as any).appointments = ((store as any).appointments || []).filter(
            (a: any) => a.id !== apptId
          );
          await persistLocalStore(store);
        } catch {}

        return jsonResponse(200, {
          success: true,
          message: `Appointment ${apptId} deleted successfully.`,
          source: 'supabase_postgresql'
        });
      } catch (err: any) {
        return jsonResponse(500, { success: false, error: err.message });
      }
    }

    const store = await getLocalStore();
    (store as any).appointments = ((store as any).appointments || []).filter(
      (a: any) => a.id !== apptId
    );
    await persistLocalStore(store);

    return jsonResponse(200, {
      success: true,
      message: `Appointment ${apptId} deleted.`,
      source: 'local_store'
    });
  }

  return jsonResponse(404, { error: `Endpoint ${method} ${cleanPath} not found` });
}
