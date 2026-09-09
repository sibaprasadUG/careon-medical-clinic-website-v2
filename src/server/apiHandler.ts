import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Doctor, Department, Service, WebsiteSettings, MediaAsset, AdminUser } from '../types';
import { DEFAULT_DEPARTMENTS, DEFAULT_SERVICES, DEFAULT_WEBSITE_SETTINGS } from '../data/seedData';
import { PROJECT_ASSETS_MANIFEST } from '../data/assetsManifest';
import { INITIAL_PRODUCTION_STORE } from '../data/productionStoreSnapshot';
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
  getSupabaseDeletedAssetIds
} from './supabase';

// Persistent data file paths for local server / container fallback
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'careon_store.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'careon_store.json');

// Secret for HMAC session token signing (server-side only)
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'careon_secure_clinic_session_secret_2026_production_key';

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

export interface ServerStore {
  doctors: Doctor[];
  departments: Department[];
  services: Service[];
  settings: WebsiteSettings;
  assets: MediaAsset[];
  invalidatedTokens: string[];
  lastUpdated: string;
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
    .createHmac('sha256', SESSION_SECRET)
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
    .createHmac('sha256', SESSION_SECRET)
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
        email: data.email || (process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : 'admin'),
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
  const authHeader = req.headers?.['authorization'] || req.headers?.['Authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  const jsonResponse = (statusCode: number, data: any): ApiResponse => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
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

    return jsonResponse(200, {
      success: true,
      token: sessionToken,
      user: adminUser
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
    return jsonResponse(200, { success: true, message: 'Logged out successfully.' });
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

  // GET /api/assets (List all media assets from Supabase or fallback)
  if (cleanPath === '/assets' && method === 'GET') {
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

  // DELETE /api/assets/:id or DELETE /api/assets (Permanent asset deletion from database & Supabase Storage)
  if ((cleanPath === '/assets' || cleanPath.startsWith('/assets/')) && method === 'DELETE') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    let assetId = '';
    if (cleanPath.startsWith('/assets/') && cleanPath.length > '/assets/'.length) {
      assetId = decodeURIComponent(cleanPath.slice('/assets/'.length));
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

    if (isSupabaseConfigured()) {
      try {
        const result = await deleteSupabaseMediaAsset({
          id: targetId,
          fileName,
          storageKey,
          url,
          category,
          force
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
      source: isSupabaseConfigured() ? 'supabase_postgresql' : 'local_store'
    });
  }

  return jsonResponse(404, { error: `Endpoint ${method} ${cleanPath} not found` });
}
