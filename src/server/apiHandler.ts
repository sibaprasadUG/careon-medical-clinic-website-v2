import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Doctor, Department, Service, WebsiteSettings, MediaAsset, AdminUser } from '../types';
import { DEFAULT_DEPARTMENTS, DEFAULT_DOCTORS, DEFAULT_SERVICES, DEFAULT_WEBSITE_SETTINGS } from '../data/seedData';
import { PROJECT_ASSETS_MANIFEST } from '../data/assetsManifest';

// Persistent data file path for serverless / server environment
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'careon_store.json');

// Secret for HMAC session token signing (configurable via server env)
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'careon_secure_clinic_session_secret_2026_production_key';

// Admin credentials (configurable via server environment variables)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@careonclinic.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CareOnAdmin2026!';

export interface ServerStore {
  doctors: Doctor[];
  departments: Department[];
  services: Service[];
  settings: WebsiteSettings;
  assets: MediaAsset[];
  invalidatedTokens: string[];
  lastUpdated: string;
}

// In-memory cache for fast response and fallback in read-only environments
let memoryStore: ServerStore | null = null;

const DEMO_DOCTOR_NAMES = [
  'Dr. Arindam Banerjee',
  'Dr. Sarmistha Mukherjee',
  'Dr. Debabrata Roy',
  'Dr. Nandini Sengupta'
];

export function isRealDoctor(d: any): boolean {
  if (!d || typeof d !== 'object' || !d.name || typeof d.name !== 'string') return false;
  const name = d.name.trim();
  if (DEMO_DOCTOR_NAMES.includes(name)) return false;
  if (['doc-01', 'doc-02', 'doc-03', 'doc-04'].includes(d.id)) return false;
  if (d.serviceType || d.category === 'Preventive' || d.category === 'Diagnostic' || d.category === 'Specialized' || d.category === 'Consultation') return false;
  if (!d.departmentId) return false;
  return Boolean(d.qualification || d.designation);
}

function ensureDataFile(): ServerStore {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      if (memoryStore) {
        if (Array.isArray(memoryStore.doctors)) {
          memoryStore.doctors = memoryStore.doctors.filter(isRealDoctor);
        } else {
          memoryStore.doctors = [];
        }
        return memoryStore;
      }
    }
  } catch {
    // Ignore file read error and initialize defaults
  }

  memoryStore = {
    doctors: [],
    departments: [...DEFAULT_DEPARTMENTS],
    services: [...DEFAULT_SERVICES],
    settings: { ...DEFAULT_WEBSITE_SETTINGS },
    assets: [...PROJECT_ASSETS_MANIFEST],
    invalidatedTokens: [],
    lastUpdated: new Date().toISOString()
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem fallback
  }

  return memoryStore;
}

function persistStore(store: ServerStore) {
  memoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {
    // Read-only fallback
  }
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

    const store = ensureDataFile();
    if (store.invalidatedTokens.includes(token)) {
      return { valid: false, error: 'Token has been invalidated/logged out' };
    }

    return {
      valid: true,
      user: {
        id: data.sub || 'usr-admin-01',
        email: data.email || ADMIN_EMAIL,
        name: data.name || 'CareOn Administrator',
        role: 'ADMIN'
      }
    };
  } catch {
    return { valid: false, error: 'Invalid token payload' };
  }
}

export function invalidateSessionToken(token: string) {
  const store = ensureDataFile();
  if (!store.invalidatedTokens.includes(token)) {
    store.invalidatedTokens.push(token);
    // Keep max 500 invalidated tokens
    if (store.invalidatedTokens.length > 500) {
      store.invalidatedTokens = store.invalidatedTokens.slice(-500);
    }
    persistStore(store);
  }
}

// Request Handler for API router
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

export async function handleApiRequest(req: ApiRequest): Promise<ApiResponse> {
  const cleanPath = req.path.replace(/^\/api/, '').replace(/\/$/, '') || '/';
  const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

  const jsonResponse = (statusCode: number, data: any): ApiResponse => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(data)
  });

  if (req.method === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  // --- AUTH ENDPOINTS ---
  if (cleanPath === '/auth/login' && req.method === 'POST') {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return jsonResponse(400, { success: false, error: 'Admin email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const isEmailMatch =
      cleanEmail === ADMIN_EMAIL ||
      cleanEmail === 'admin' ||
      cleanEmail === 'admin@careonclinic.com' ||
      cleanEmail === 'careonadmin';

    const isPassMatch = String(password).trim() === ADMIN_PASSWORD;

    if (!isEmailMatch || !isPassMatch) {
      return jsonResponse(401, { success: false, error: 'Invalid admin credentials.' });
    }

    const adminUser: AdminUser = {
      id: 'usr-admin-01',
      email: ADMIN_EMAIL,
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

  if (cleanPath === '/auth/verify' && (req.method === 'GET' || req.method === 'POST')) {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { valid: false, error: auth.error || 'Unauthorized' });
    }
    return jsonResponse(200, { valid: true, user: auth.user });
  }

  if (cleanPath === '/auth/logout' && req.method === 'POST') {
    if (token) {
      invalidateSessionToken(token);
    }
    return jsonResponse(200, { success: true, message: 'Logged out successfully.' });
  }

  // --- DOCTOR ENDPOINTS ---
  if (cleanPath === '/doctors') {
    const store = ensureDataFile();

    if (req.method === 'GET') {
      return jsonResponse(200, {
        success: true,
        doctors: store.doctors,
        total: store.doctors.length
      });
    }

    if (req.method === 'POST') {
      // Require Admin Auth
      const auth = verifySessionToken(token);
      if (!auth.valid || !auth.user) {
        return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
      }

      const doctorData = req.body as Doctor;
      if (!doctorData || !doctorData.name || !doctorData.departmentId) {
        return jsonResponse(400, { success: false, error: 'Doctor name and department are required.' });
      }

      let savedDoctor: Doctor;
      const existingIndex = store.doctors.findIndex((d) => d.id === doctorData.id);

      if (existingIndex >= 0) {
        savedDoctor = {
          ...store.doctors[existingIndex],
          ...doctorData,
          updatedAt: new Date().toISOString()
        };
        store.doctors[existingIndex] = savedDoctor;
      } else {
        savedDoctor = {
          ...doctorData,
          id: doctorData.id || `doc-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        store.doctors.push(savedDoctor);
      }

      store.lastUpdated = new Date().toISOString();
      persistStore(store);

      return jsonResponse(200, {
        success: true,
        doctor: savedDoctor,
        doctors: store.doctors
      });
    }
  }

  // DELETE /doctors/:id
  if (cleanPath.startsWith('/doctors/') && req.method === 'DELETE') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const doctorId = cleanPath.split('/')[2];
    const store = ensureDataFile();
    const beforeCount = store.doctors.length;
    store.doctors = store.doctors.filter((d) => d.id !== doctorId);

    if (store.doctors.length !== beforeCount) {
      store.lastUpdated = new Date().toISOString();
      persistStore(store);
    }

    return jsonResponse(200, {
      success: true,
      message: `Doctor ${doctorId} deleted`,
      doctors: store.doctors
    });
  }

  // --- DATA SYNC & GET ALL ---
  if (cleanPath === '/data') {
    const store = ensureDataFile();
    return jsonResponse(200, {
      success: true,
      doctors: store.doctors,
      departments: store.departments,
      services: store.services,
      settings: store.settings,
      assets: store.assets,
      lastUpdated: store.lastUpdated
    });
  }

  if (cleanPath === '/data/sync' && req.method === 'POST') {
    const auth = verifySessionToken(token);
    if (!auth.valid || !auth.user) {
      return jsonResponse(401, { success: false, error: 'Admin authentication required.' });
    }

    const payload = req.body || {};
    const store = ensureDataFile();

    if (Array.isArray(payload.doctors)) store.doctors = payload.doctors.filter(isRealDoctor);
    if (Array.isArray(payload.departments)) store.departments = payload.departments;
    if (Array.isArray(payload.services)) store.services = payload.services;
    if (payload.settings) store.settings = { ...store.settings, ...payload.settings };
    if (Array.isArray(payload.assets)) store.assets = payload.assets;

    store.lastUpdated = new Date().toISOString();
    persistStore(store);

    return jsonResponse(200, {
      success: true,
      message: 'Data successfully synchronized with server storage.',
      lastUpdated: store.lastUpdated
    });
  }

  // --- ASSETS MANIFEST ENDPOINT ---
  if (cleanPath === '/assets' && req.method === 'GET') {
    const store = ensureDataFile();
    return jsonResponse(200, {
      success: true,
      assets: store.assets || PROJECT_ASSETS_MANIFEST
    });
  }

  return jsonResponse(404, { error: `Endpoint ${cleanPath} not found` });
}
