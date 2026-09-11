import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Doctor,
  Department,
  Service,
  WebsiteSettings,
  DoctorScheduleItem,
  DoctorWeeklyScheduleSlot,
  DoctorCustomSchedule,
  DoctorScheduleException,
  DayOfWeek,
  MediaAsset,
  MediaCategory,
  AppointmentRequest,
  AppointmentStatus
} from '../types';
import { DEFAULT_DEPARTMENTS, DEFAULT_SERVICES, DEFAULT_WEBSITE_SETTINGS } from '../data/seedData';
import { PROJECT_ASSETS_MANIFEST } from '../data/assetsManifest';

/**
 * CareOn Medical Clinic - Server-side Supabase PostgreSQL Integration
 *
 * Project: careon-medical-clinic
 * Architecture: AI Studio / Netlify Functions -> Supabase PostgreSQL
 * Database Schema:
 *  - doctors (id, name, department_id, specialty, qualification, registration_no,
 *             photo_url, consultation_fee, doctor_type, bio, is_active, display_order,
 *             created_at, updated_at)
 *  - doctor_schedules (id, doctor_id, day_of_week, start_time, end_time,
 *                      chamber_name, is_active, created_at, updated_at)
 *  - departments (id, name, slug, description, image_url, is_active, display_order,
 *                 created_at, updated_at)
 *  - services (id, name, slug, department_id, description, price, image_url,
 *              is_active, display_order, created_at, updated_at)
 *  - site_settings (id, setting_key, setting_value, created_at, updated_at)
 *
 * Security: Uses SUPABASE_SERVICE_ROLE_KEY exclusively on the server side.
 * Never exposed to browser / Vite client bundle.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

export const DAY_NAMES: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DAY_INDEX_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6
};

export const SQL_GRANT_SCRIPT = `GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;`;

export function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_URL.startsWith('http') &&
      SUPABASE_SERVICE_ROLE_KEY &&
      SUPABASE_SERVICE_ROLE_KEY.length > 10
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedClient;
}

// --- Row to Application Model Mappers ---

export function mapRowToDoctor(row: any, schedules: any[] = []): Doctor {
  const doctorSchedules: DoctorScheduleItem[] = schedules
    .filter((s) => s.doctor_id === row.id && s.is_active !== false)
    .map((s) => {
      const dayIndex = typeof s.day_of_week === 'number' ? s.day_of_week : 1;
      const dayName = (DAY_NAMES[dayIndex] || 'Monday') as DayOfWeek;
      return {
        id: s.id,
        day: dayName,
        startTime: s.start_time ? s.start_time.slice(0, 5) : '10:00 AM',
        endTime: s.end_time ? s.end_time.slice(0, 5) : '01:00 PM'
      };
    });

  const consultationDays = doctorSchedules.map((s) => {
    const idx = DAY_NAMES.indexOf(s.day);
    return idx >= 0 ? DAY_ABBR[idx] : s.day;
  });

  const consultationTime =
    doctorSchedules.length > 0
      ? `${doctorSchedules[0].startTime} – ${doctorSchedules[0].endTime}`
      : 'By Appointment';

  const weeklySchedule: DoctorWeeklyScheduleSlot[] = doctorSchedules.map((s) => {
    const match = schedules.find((sch) => sch.id === s.id);
    return {
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      roomNumber: match?.chamber_name || 'CareOn Medical Clinic',
      isActive: true
    };
  });

  const chamberName = schedules.find((s) => s.doctor_id === row.id)?.chamber_name || 'CareOn Medical Clinic';
  const isActive = row.is_active !== false;

  const { bio, meta } = parseDoctorBio(row.bio);
  const consultationFee = row.consultation_fee
    ? Number(row.consultation_fee)
    : meta.fees?.newPatient;

  return {
    id: row.id,
    name: row.name,
    nameBn: '',
    slug: (row.name || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-'),
    photoUrl: row.photo_url || '',
    profilePhotoUrl: row.photo_url || '',
    photoAssetId: '',
    profilePhotoAssetId: '',
    profilePhotoAlt: `Dr. ${row.name}`,
    gender: meta.gender,
    departmentId: row.department_id || '',
    departmentName: meta.departmentName || '',
    specialtyId: row.specialty || '',
    designation: row.doctor_type || 'Consultant',
    doctorType: row.doctor_type || 'Consultant',
    qualification: row.qualification || 'MBBS',
    registrationNumber: row.registration_no || '',
    experienceYears: meta.experienceYears,
    shortBio: bio,
    areasOfExpertise: row.specialty ? [row.specialty] : [],
    schedules: doctorSchedules,
    chamberId: chamberName,
    chamberCustom: chamberName,
    serviceIds: meta.serviceIds || [],
    serviceNames: meta.serviceNames || [],
    consultationFee,
    followUpFee: meta.fees?.followUp,
    emergencyFee: meta.fees?.emergency,
    telemedicineFee: meta.fees?.telemedicine,
    otherServiceFee: meta.fees?.other,
    fees: meta.fees || (consultationFee ? { newPatient: consultationFee } : undefined),
    appointmentDuration: meta.appointmentDuration ?? 30,
    bufferTime: meta.bufferTime ?? 0,
    maxAppointmentsPerSlot: meta.maxAppointmentsPerSlot,
    active: isActive,
    published: isActive,
    consultationDays,
    consultationTime,
    roomNumber: chamberName,
    weeklySchedule,
    customSchedules: meta.customSchedules || [],
    scheduleExceptions: meta.scheduleExceptions || [],
    appointmentEnabled: isActive,
    featured: false,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

const META_TAG_START = '<!--CAREON_DOC_META:';
const META_TAG_END = ':CAREON_DOC_META-->';

export interface DoctorExtendedMeta {
  gender?: string;
  experienceYears?: number | string;
  serviceIds?: string[];
  serviceNames?: string[];
  fees?: {
    newPatient?: number;
    followUp?: number;
    emergency?: number;
    telemedicine?: number;
    other?: number;
  };
  customSchedules?: DoctorCustomSchedule[];
  scheduleExceptions?: DoctorScheduleException[];
  appointmentDuration?: number;
  bufferTime?: number;
  maxAppointmentsPerSlot?: number;
  departmentName?: string;
}

export function parseDoctorBio(rawBio?: string | null): { bio: string; meta: DoctorExtendedMeta } {
  if (!rawBio) return { bio: '', meta: {} };
  const startIndex = rawBio.indexOf(META_TAG_START);
  const endIndex = rawBio.indexOf(META_TAG_END);
  if (startIndex >= 0 && endIndex > startIndex) {
    const metaJson = rawBio.slice(startIndex + META_TAG_START.length, endIndex);
    const cleanBio = (rawBio.slice(0, startIndex) + rawBio.slice(endIndex + META_TAG_END.length)).trim();
    try {
      const meta = JSON.parse(metaJson);
      return { bio: cleanBio, meta: meta || {} };
    } catch {
      return { bio: rawBio.trim(), meta: {} };
    }
  }
  return { bio: rawBio.trim(), meta: {} };
}

export function serializeDoctorBio(bio?: string | null, meta?: DoctorExtendedMeta): string | null {
  const cleanBio = bio?.trim() || '';
  const hasMeta = meta && Object.keys(meta).length > 0;
  if (!hasMeta) {
    return cleanBio || null;
  }
  const metaString = `${META_TAG_START}${JSON.stringify(meta)}${META_TAG_END}`;
  return cleanBio ? `${cleanBio}\n\n${metaString}` : metaString;
}

export function mapDoctorToRow(doc: Partial<Doctor>): Record<string, any> {
  const consultationFee =
    typeof doc.consultationFee === 'number'
      ? doc.consultationFee
      : typeof doc.fees?.newPatient === 'number'
      ? doc.fees.newPatient
      : null;

  const meta: DoctorExtendedMeta = {};
  if (doc.gender) meta.gender = doc.gender;
  if (doc.experienceYears) meta.experienceYears = doc.experienceYears;
  if (doc.serviceIds && doc.serviceIds.length > 0) meta.serviceIds = doc.serviceIds;
  if (doc.serviceNames && doc.serviceNames.length > 0) meta.serviceNames = doc.serviceNames;
  if (doc.fees) meta.fees = doc.fees;
  if (doc.customSchedules && doc.customSchedules.length > 0) meta.customSchedules = doc.customSchedules;
  if (doc.scheduleExceptions && doc.scheduleExceptions.length > 0) meta.scheduleExceptions = doc.scheduleExceptions;
  if (typeof doc.appointmentDuration === 'number') meta.appointmentDuration = doc.appointmentDuration;
  if (typeof doc.bufferTime === 'number') meta.bufferTime = doc.bufferTime;
  if (typeof doc.maxAppointmentsPerSlot === 'number') meta.maxAppointmentsPerSlot = doc.maxAppointmentsPerSlot;
  if (doc.departmentName) meta.departmentName = doc.departmentName;

  const row: Record<string, any> = {
    name: doc.name?.trim() || '',
    department_id: isValidUuid(doc.departmentId) ? doc.departmentId : null,
    specialty: doc.areasOfExpertise?.[0] || doc.specialtyId || doc.designation || 'General Medicine',
    qualification: doc.qualification?.trim() || 'MBBS',
    registration_no: doc.registrationNumber?.trim() || null,
    photo_url: doc.profilePhotoUrl || doc.photoUrl || null,
    consultation_fee: consultationFee,
    doctor_type: doc.doctorType || doc.designation || 'Consultant',
    bio: serializeDoctorBio(doc.shortBio, meta),
    is_active: doc.status !== 'INACTIVE' && doc.active !== false,
    display_order: typeof doc.displayOrder === 'number' ? doc.displayOrder : 0,
    updated_at: new Date().toISOString()
  };

  if (isValidUuid(doc.id)) {
    row.id = doc.id;
  }

  return row;
}

export function mapSchedulesToRows(
  doctorId: string,
  schedules?: (DoctorScheduleItem | DoctorWeeklyScheduleSlot)[]
): any[] {
  if (!Array.isArray(schedules) || schedules.length === 0) return [];
  return schedules.map((s: any) => {
    const dayStr = String(s.day || '').trim().toLowerCase();
    const dayOfWeek = DAY_INDEX_MAP[dayStr] ?? 1;
    return {
      doctor_id: doctorId,
      day_of_week: dayOfWeek,
      start_time: s.startTime ? s.startTime.replace(/\s*[AP]M/i, '') : '10:00',
      end_time: s.endTime ? s.endTime.replace(/\s*[AP]M/i, '') : '13:00',
      chamber_name: s.roomNumber || s.chamberCustom || s.chamberName || 'CareOn Medical Clinic',
      is_active: s.isActive !== false,
      updated_at: new Date().toISOString()
    };
  });
}

export function mapRowToDepartment(row: any): Department {
  const isActive = row.is_active !== false;
  return {
    id: row.id,
    name: row.name,
    nameBn: '',
    slug: row.slug || (row.name || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
    shortDescription: row.description || '',
    shortDescriptionBn: '',
    description: row.description || '',
    descriptionBn: '',
    imageUrl: row.image_url || '',
    icon: 'Stethoscope',
    featured: false,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

export function mapRowToService(row: any): Service {
  const isActive = row.is_active !== false;
  return {
    id: row.id,
    name: row.name,
    nameBn: '',
    slug: row.slug || (row.name || '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
    shortDescription: row.description || '',
    shortDescriptionBn: '',
    description: row.description || '',
    descriptionBn: '',
    departmentId: row.department_id || '',
    category: 'Clinical',
    serviceType: 'BOTH',
    availableForHome: true,
    availableAtClinic: true,
    price: row.price ? Number(row.price) : undefined,
    imageUrl: row.image_url || '',
    bookingEnabled: isActive,
    featured: false,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    status: isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

// --- Supabase Data Access Operations ---

/**
 * Fetch doctors from Supabase PostgreSQL
 */
export async function getSupabaseDoctors(filters?: {
  department?: string;
  status?: string;
}): Promise<Doctor[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  let query = client.from('doctors').select('*').order('display_order', { ascending: true });

  if (filters?.department && filters.department !== 'all' && isValidUuid(filters.department)) {
    query = query.eq('department_id', filters.department);
  }
  if (filters?.status) {
    if (filters.status === 'ACTIVE') {
      query = query.eq('is_active', true);
    } else if (filters.status === 'INACTIVE') {
      query = query.eq('is_active', false);
    }
  }

  const { data: doctorsData, error: doctorsError } = await query;
  if (doctorsError) {
    if (doctorsError.code === '42501' || doctorsError.message?.includes('permission denied')) {
      console.warn(
        '[Supabase] Permission denied on doctors table. Run GRANT script in Supabase SQL Editor.'
      );
      return [];
    }
    console.error('[Supabase] Error fetching doctors:', doctorsError.message);
    return [];
  }

  if (!doctorsData || doctorsData.length === 0) {
    return [];
  }

  // Fetch all schedules for these doctors
  const doctorIds = doctorsData.map((d) => d.id).filter(Boolean);
  let schedulesData: any[] = [];
  if (doctorIds.length > 0) {
    const { data: sData, error: sError } = await client
      .from('doctor_schedules')
      .select('*')
      .in('doctor_id', doctorIds);
    if (!sError && sData) {
      schedulesData = sData;
    }
  }

  return doctorsData.map((row) => mapRowToDoctor(row, schedulesData));
}

/**
 * Fetch a single doctor by ID or Slug from Supabase
 */
export async function getSupabaseDoctor(idOrSlug: string): Promise<Doctor | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  let query = client.from('doctors').select('*');
  if (isValidUuid(idOrSlug)) {
    query = query.eq('id', idOrSlug);
  } else {
    query = query.ilike('name', `%${idOrSlug}%`);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const { data: sData } = await client
    .from('doctor_schedules')
    .select('*')
    .eq('doctor_id', data.id);

  return mapRowToDoctor(data, sData || []);
}

/**
 * Upsert doctor in Supabase PostgreSQL
 */
export async function upsertSupabaseDoctor(docData: Partial<Doctor>): Promise<Doctor> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  const row = mapDoctorToRow(docData);
  let doctorId = row.id;
  let savedRow: any = null;

  if (doctorId && isValidUuid(doctorId)) {
    // Update existing doctor
    const { data, error } = await client
      .from('doctors')
      .update(row)
      .eq('id', doctorId)
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase] Error updating doctor:', error.message);
      throw new Error(`Failed to update doctor in Supabase: ${error.message}`);
    }
    savedRow = data;
  } else {
    // Create new doctor
    const newId = crypto.randomUUID();
    row.id = newId;
    row.created_at = new Date().toISOString();

    const { data, error } = await client
      .from('doctors')
      .insert(row)
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase] Error inserting doctor:', error.message);
      throw new Error(`Failed to create doctor in Supabase: ${error.message}`);
    }
    savedRow = data;
    doctorId = savedRow.id;
  }

  // Sync schedules
  const rawSchedules = docData.schedules || docData.weeklySchedule;
  let savedSchedules: any[] = [];
  if (Array.isArray(rawSchedules) && doctorId) {
    try {
      await client.from('doctor_schedules').delete().eq('doctor_id', doctorId);
      const scheduleRows = mapSchedulesToRows(doctorId, rawSchedules);
      if (scheduleRows.length > 0) {
        const { data: sData, error: sErr } = await client
          .from('doctor_schedules')
          .insert(scheduleRows)
          .select('*');
        if (!sErr && sData) {
          savedSchedules = sData;
        }
      }
    } catch (schErr: any) {
      console.warn('[Supabase] Schedules sync note:', schErr?.message);
    }
  }

  return mapRowToDoctor(savedRow, savedSchedules);
}

/**
 * Delete doctor from Supabase PostgreSQL
 */
export async function deleteSupabaseDoctor(doctorId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  if (isValidUuid(doctorId)) {
    try {
      await client.from('doctor_schedules').delete().eq('doctor_id', doctorId);
    } catch {
      // Ignore if foreign key CASCADE handles it
    }

    const { error } = await client.from('doctors').delete().eq('id', doctorId);
    if (error) {
      console.error('[Supabase] Error deleting doctor:', error.message);
      throw new Error(`Failed to delete doctor from Supabase: ${error.message}`);
    }
  }

  return true;
}

/**
 * Reorder doctors in Supabase
 */
export async function reorderSupabaseDoctors(
  orders: { id: string; displayOrder: number }[]
): Promise<Doctor[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  for (const item of orders) {
    if (isValidUuid(item.id)) {
      await client
        .from('doctors')
        .update({ display_order: item.displayOrder, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    }
  }

  return getSupabaseDoctors();
}

/**
 * Fetch all departments from Supabase
 */
export async function getSupabaseDepartments(): Promise<Department[]> {
  const client = getSupabaseClient();
  if (!client) return DEFAULT_DEPARTMENTS;

  const { data, error } = await client
    .from('departments')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_DEPARTMENTS;
  }

  return data.map(mapRowToDepartment);
}

/**
 * Fetch all services from Supabase
 */
export async function getSupabaseServices(): Promise<Service[]> {
  const client = getSupabaseClient();
  if (!client) return DEFAULT_SERVICES;

  const { data, error } = await client
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_SERVICES;
  }

  return data.map(mapRowToService);
}

/**
 * Fetch website settings from Supabase site_settings table
 */
export async function getSupabaseSettings(): Promise<WebsiteSettings> {
  const client = getSupabaseClient();
  if (!client) return DEFAULT_WEBSITE_SETTINGS;

  const { data, error } = await client
    .from('site_settings')
    .select('setting_key, setting_value');

  if (error || !data || data.length === 0) {
    return DEFAULT_WEBSITE_SETTINGS;
  }

  const settingsMap: Record<string, any> = {};
  for (const item of data) {
    try {
      settingsMap[item.setting_key] = JSON.parse(item.setting_value);
    } catch {
      settingsMap[item.setting_key] = item.setting_value;
    }
  }

  if (settingsMap['main_settings']) {
    return settingsMap['main_settings'] as WebsiteSettings;
  }

  return DEFAULT_WEBSITE_SETTINGS;
}

/**
 * Save website settings to Supabase site_settings table
 */
export async function saveSupabaseSettings(settings: WebsiteSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('site_settings').upsert(
    {
      setting_key: 'main_settings',
      setting_value: JSON.stringify(settings),
      updated_at: new Date().toISOString()
    },
    { onConflict: 'setting_key' }
  );

  return !error;
}

/**
 * Check Supabase health & PostgreSQL permissions
 */
export async function checkSupabaseHealth(): Promise<{
  connected: boolean;
  tablesReady?: boolean;
  permissionsGranted?: boolean;
  sqlGrantScript?: string;
  doctorsCount: number;
  departmentsCount: number;
  servicesCount: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      doctorsCount: 0,
      departmentsCount: 0,
      servicesCount: 0,
      error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.'
    };
  }

  try {
    const [docsRes, deptsRes, srvsRes] = await Promise.all([
      client.from('doctors').select('id').limit(1),
      client.from('departments').select('id').limit(1),
      client.from('services').select('id').limit(1)
    ]);

    const isPermissionError = (res: any) =>
      res?.status === 403 ||
      res?.error?.code === '42501' ||
      res?.error?.message?.includes('permission denied');

    if (
      isPermissionError(docsRes) ||
      isPermissionError(deptsRes) ||
      isPermissionError(srvsRes)
    ) {
      return {
        connected: true,
        tablesReady: true,
        permissionsGranted: false,
        sqlGrantScript: SQL_GRANT_SCRIPT,
        doctorsCount: 0,
        departmentsCount: 0,
        servicesCount: 0,
        error:
          'Supabase connected, but service_role lacks PostgreSQL GRANT permissions. Run the SQL GRANT script in Supabase SQL Editor.'
      };
    }

    const isMissingTable = (res: any) => {
      const err = res?.error;
      return (
        err &&
        (err.code === 'PGRST205' ||
          err.code === '42P01' ||
          err.message?.includes('schema cache') ||
          err.message?.includes('does not exist'))
      );
    };

    if (
      isMissingTable(docsRes) ||
      isMissingTable(deptsRes) ||
      isMissingTable(srvsRes)
    ) {
      return {
        connected: true,
        tablesReady: false,
        permissionsGranted: true,
        doctorsCount: 0,
        departmentsCount: 0,
        servicesCount: 0,
        error:
          'Database connected. Supabase tables not yet created in PostgreSQL.'
      };
    }

    // Now get accurate counts
    const [dCount, deptCount, sCount] = await Promise.all([
      client.from('doctors').select('id', { count: 'exact', head: true }),
      client.from('departments').select('id', { count: 'exact', head: true }),
      client.from('services').select('id', { count: 'exact', head: true })
    ]);

    return {
      connected: true,
      tablesReady: true,
      permissionsGranted: true,
      doctorsCount: dCount.count ?? (docsRes.data?.length ?? 0),
      departmentsCount: deptCount.count ?? (deptsRes.data?.length ?? 0),
      servicesCount: sCount.count ?? (srvsRes.data?.length ?? 0)
    };
  } catch (err: any) {
    return {
      connected: false,
      doctorsCount: 0,
      departmentsCount: 0,
      servicesCount: 0,
      error: err.message
    };
  }
}

/**
 * ============================================================================
 * SUPABASE MEDIA ASSETS & PHYSICAL STORAGE MANAGEMENT
 * ============================================================================
 */

export const PRIMARY_STORAGE_BUCKET = 'careon-media';
export const FALLBACK_STORAGE_BUCKETS = ['careon-media', 'assets', 'media'];

/**
 * Ensure the primary storage bucket exists in Supabase Storage.
 */
export async function ensureStorageBucketReady(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { data: bData } = await client.storage.getBucket(PRIMARY_STORAGE_BUCKET);
    if (!bData) {
      const { error } = await client.storage.createBucket(PRIMARY_STORAGE_BUCKET, {
        public: true
      });
      if (error && !error.message?.includes('already exists')) {
        console.warn('[CareOn Storage] Note creating bucket:', error.message);
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch list of permanently deleted asset IDs / keys from Supabase site_settings
 */
export async function getSupabaseDeletedAssetIds(): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  try {
    const { data } = await client
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'deleted_media_ids')
      .maybeSingle();

    if (data?.setting_value) {
      const parsed = JSON.parse(data.setting_value);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err: any) {
    console.warn('[CareOn Storage] Error fetching deleted_media_ids:', err.message);
  }
  return [];
}

/**
 * Record a deleted asset ID/key into Supabase site_settings
 */
export async function recordSupabaseDeletedAssetId(idOrKeys: string | string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const current = await getSupabaseDeletedAssetIds();
    const toAdd = Array.isArray(idOrKeys) ? idOrKeys : [idOrKeys];
    const set = new Set([...current, ...toAdd.filter(Boolean)]);
    const updated = Array.from(set);

    const { error } = await client.from('site_settings').upsert(
      {
        setting_key: 'deleted_media_ids',
        setting_value: JSON.stringify(updated),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'setting_key' }
    );
    return !error;
  } catch (err: any) {
    console.error('[CareOn Storage] Error recording deleted_media_ids:', err.message);
    return false;
  }
}

/**
 * Fetch all media assets from Supabase PostgreSQL (site_settings table).
 * Filters out any assets that have been marked as permanently deleted.
 */
export async function getSupabaseMediaAssets(): Promise<MediaAsset[]> {
  const client = getSupabaseClient();
  if (!client) return PROJECT_ASSETS_MANIFEST;

  try {
    const [deletedIds, settingsRes] = await Promise.all([
      getSupabaseDeletedAssetIds(),
      client.from('site_settings').select('setting_value').eq('setting_key', 'media_assets').maybeSingle()
    ]);

    const deletedSet = new Set(deletedIds);

    let assets: MediaAsset[] = [];
    if (settingsRes.data?.setting_value) {
      try {
        const parsed = JSON.parse(settingsRes.data.setting_value);
        if (Array.isArray(parsed)) {
          assets = parsed;
        }
      } catch {
        // Fallback
      }
    }

    if (assets.length === 0) {
      // Initialize with PROJECT_ASSETS_MANIFEST if not yet stored
      assets = [...PROJECT_ASSETS_MANIFEST];
      await client.from('site_settings').upsert(
        {
          setting_key: 'media_assets',
          setting_value: JSON.stringify(assets),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'setting_key' }
      );
    }

    // Filter out any permanently deleted assets
    const cleanAssets = assets.filter((a) => {
      if (deletedSet.has(a.id)) return false;
      if (a.fileName && deletedSet.has(a.fileName)) return false;
      if (a.storageKey && deletedSet.has(a.storageKey)) return false;
      return true;
    });

    return cleanAssets;
  } catch (err: any) {
    console.warn('[CareOn Storage] getSupabaseMediaAssets error:', err.message);
    return PROJECT_ASSETS_MANIFEST;
  }
}

/**
 * Save media assets array to Supabase site_settings table.
 */
export async function saveSupabaseMediaAssets(assets: MediaAsset[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('site_settings').upsert(
      {
        setting_key: 'media_assets',
        setting_value: JSON.stringify(assets),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'setting_key' }
    );
    return !error;
  } catch (err: any) {
    console.error('[CareOn Storage] saveSupabaseMediaAssets error:', err.message);
    return false;
  }
}

export interface DeleteMediaAssetOptions {
  id?: string;
  fileName?: string;
  storageKey?: string;
  url?: string;
  category?: string;
  force?: boolean;
  adminEmail?: string;
}

/**
 * Delete physical file from Supabase Storage.
 * Uses batch removal in the primary 'careon-media' bucket without slow directory scanning loops.
 * Returns atomic result: if storage deletion encounters an error, reports failure.
 */
export async function deleteFileFromSupabaseStorage(asset: {
  storageKey?: string;
  fileName?: string;
  category?: string;
  url?: string;
}): Promise<{
  success: boolean;
  deletedCount: number;
  deletedObjects: { bucket: string; path: string }[];
  error?: string;
  pathsAttempted: string[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      deletedCount: 0,
      deletedObjects: [],
      error: 'Supabase client is not configured or unavailable.',
      pathsAttempted: []
    };
  }

  // 1. Resolve candidate buckets - primary is always 'careon-media'
  const primaryBucket = 'careon-media';
  const candidateBuckets = [primaryBucket];
  if (asset.url) {
    const match = asset.url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (match && match[1] && !candidateBuckets.includes(match[1])) {
      candidateBuckets.push(match[1]);
    }
  }

  // 2. Resolve candidate file paths to account for different historical path formats
  const candidatePaths = new Set<string>();

  if (asset.storageKey) {
    const raw = asset.storageKey.trim();
    candidatePaths.add(raw);
    const noLeading = raw.replace(/^\/+/, '');
    candidatePaths.add(noLeading);

    // If storageKey contains bucket prefix, strip it
    for (const b of candidateBuckets) {
      if (noLeading.startsWith(`${b}/`)) {
        candidatePaths.add(noLeading.slice(b.length + 1));
      }
    }
    if (noLeading.startsWith('assets/')) {
      candidatePaths.add(noLeading.slice('assets/'.length));
    }
  }

  if (asset.fileName) {
    const fn = asset.fileName.trim();
    candidatePaths.add(fn);
    candidatePaths.add(`assets/${fn}`);

    const cat = asset.category ? asset.category.toLowerCase() : '';
    if (cat) {
      candidatePaths.add(`assets/${cat}s/${fn}`);
      candidatePaths.add(`assets/${cat}/${fn}`);
      candidatePaths.add(`${cat}s/${fn}`);
      candidatePaths.add(`${cat}/${fn}`);
    }

    // Always check standard clinic directories
    candidatePaths.add(`assets/doctors/${fn}`);
    candidatePaths.add(`assets/departments/${fn}`);
    candidatePaths.add(`assets/banners/${fn}`);
    candidatePaths.add(`assets/gallery/${fn}`);
    candidatePaths.add(`assets/logo/${fn}`);
    candidatePaths.add(`doctors/${fn}`);
    candidatePaths.add(`departments/${fn}`);
  }

  if (asset.url) {
    const match = asset.url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
    if (match && match[2]) {
      try {
        candidatePaths.add(decodeURIComponent(match[2]));
      } catch {
        candidatePaths.add(match[2]);
      }
    }
    try {
      const urlObj = new URL(asset.url);
      const urlFileName = urlObj.pathname.split('/').pop();
      if (urlFileName && urlFileName.includes('.')) {
        candidatePaths.add(urlFileName);
        candidatePaths.add(`assets/doctors/${urlFileName}`);
        candidatePaths.add(`assets/departments/${urlFileName}`);
        candidatePaths.add(`assets/banners/${urlFileName}`);
        candidatePaths.add(`assets/gallery/${urlFileName}`);
        candidatePaths.add(`assets/logo/${urlFileName}`);
      }
    } catch {
      // Ignored
    }
  }

  const pathsList = Array.from(candidatePaths).filter(Boolean);
  const deletedObjects: { bucket: string; path: string }[] = [];
  const pathsAttempted: string[] = [];

  console.log(`[CareOn Storage] Initiating storage deletion for asset "${asset.fileName || asset.storageKey}"`);
  console.log(`[CareOn Storage] Checking candidate paths (${pathsList.length}):`, pathsList);

  for (const bucket of candidateBuckets) {
    pathsList.forEach((p) => pathsAttempted.push(`${bucket}/${p}`));

    try {
      const { data, error } = await client.storage.from(bucket).remove(pathsList);
      if (error) {
        console.error(`[CareOn Storage] Supabase Storage error for bucket ${bucket}:`, error.message);
        return {
          success: false,
          deletedCount: deletedObjects.length,
          deletedObjects,
          error: `Supabase Storage error (${bucket}): ${error.message}`,
          pathsAttempted
        };
      }

      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`[CareOn Storage] Successfully deleted physical file(s) in ${bucket}:`, data);
        data.forEach((item: any) => {
          deletedObjects.push({ bucket, path: item.name || item.id || '' });
        });
      }
    } catch (err: any) {
      console.error(`[CareOn Storage] Storage exception for bucket ${bucket}:`, err.message);
      return {
        success: false,
        deletedCount: deletedObjects.length,
        deletedObjects,
        error: `Storage exception on bucket ${bucket}: ${err.message}`,
        pathsAttempted
      };
    }
  }

  console.log(`[CareOn Storage] Completed storage deletion. Physical objects deleted: ${deletedObjects.length}`);
  return {
    success: true,
    deletedCount: deletedObjects.length,
    deletedObjects,
    pathsAttempted
  };
}

/**
 * Permanently delete a media asset from both Supabase PostgreSQL database and Supabase Storage.
 * ATOMIC GUARANTEE: If Supabase Storage removal fails, the database record is NOT deleted.
 * ORPHAN RECOVERY: If the database record is missing, resolves storage path and removes physical file.
 */
export async function deleteSupabaseMediaAsset(
  target: string | DeleteMediaAssetOptions,
  forceOption = false
): Promise<{
  success: boolean;
  error?: string;
  deletedAsset?: MediaAsset;
  storageDeleted?: boolean;
  storageDetails?: any;
  diagnostics?: any;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized.' };
  }

  const options: DeleteMediaAssetOptions =
    typeof target === 'string'
      ? {
          id: target,
          fileName: target.includes('.') ? target.split('/').pop() : undefined,
          storageKey: target.includes('/') ? target : undefined,
          force: forceOption
        }
      : { ...target, force: target.force ?? forceOption };

  const targetId = options.id?.trim() || '';
  const targetFileName = options.fileName?.trim() || '';
  const targetStorageKey = options.storageKey?.trim() || '';
  const targetUrl = options.url?.trim() || '';
  const targetCategory = options.category?.trim() || '';
  const force = Boolean(options.force);

  console.log(`[CareOn Media DB] Starting permanent delete operation for:`, {
    targetId,
    targetFileName,
    targetStorageKey,
    force
  });

  // 1. Fetch current raw assets from database (without pre-filtering deleted_media_ids)
  let rawDbAssets: MediaAsset[] = [];
  try {
    const { data: sData } = await client
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'media_assets')
      .maybeSingle();

    if (sData?.setting_value) {
      const parsed = JSON.parse(sData.setting_value);
      if (Array.isArray(parsed)) {
        rawDbAssets = parsed;
      }
    }
  } catch (dbErr: any) {
    console.warn(`[CareOn Media DB] Warning loading raw site_settings media_assets:`, dbErr.message);
  }

  // Also query active assets via standard getter as fallback
  const activeAssets = await getSupabaseMediaAssets();
  const pool = [...rawDbAssets, ...activeAssets, ...PROJECT_ASSETS_MANIFEST];

  // Match asset from pool using ID, fileName, storageKey, or URL
  const matchedAsset = pool.find((a) => {
    if (targetId && (a.id === targetId || a.fileName === targetId || a.storageKey === targetId)) {
      return true;
    }
    if (targetFileName && a.fileName.toLowerCase() === targetFileName.toLowerCase()) {
      return true;
    }
    if (targetStorageKey && (a.storageKey === targetStorageKey || a.storageKey?.endsWith(targetStorageKey))) {
      return true;
    }
    if (targetUrl && a.url === targetUrl) {
      return true;
    }
    return false;
  });

  // Extract resolved metadata
  const effectiveFileName =
    targetFileName ||
    matchedAsset?.fileName ||
    (targetId.includes('.') ? targetId.split('/').pop() : '') ||
    (targetStorageKey.includes('.') ? targetStorageKey.split('/').pop() : '') ||
    'asset_file';

  const effectiveStorageKey =
    targetStorageKey ||
    matchedAsset?.storageKey ||
    (effectiveFileName ? `assets/doctors/${effectiveFileName}` : undefined);

  const effectiveCategory = targetCategory || matchedAsset?.category || 'DOCTOR';
  const effectiveUrl = targetUrl || matchedAsset?.url || '';

  const effectiveAsset: MediaAsset = matchedAsset || {
    id: targetId || `orphan-${Date.now()}`,
    fileName: effectiveFileName,
    originalName: effectiveFileName,
    mimeType: effectiveFileName.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg',
    category: effectiveCategory as MediaCategory,
    url: effectiveUrl,
    storageKey: effectiveStorageKey,
    altText: effectiveFileName,
    status: 'ACTIVE',
    fileSize: 0,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin'
  };

  // 2. Safety reference check against active doctors if not forced
  if (!force) {
    try {
      const { data: docs } = await client.from('doctors').select('id, name, photo_url');
      if (docs && Array.isArray(docs)) {
        const matches = docs.filter((d) => {
          if (!d.photo_url) return false;
          if (effectiveFileName && d.photo_url.includes(effectiveFileName)) return true;
          if (matchedAsset && (d.photo_url.includes(matchedAsset.fileName) || d.photo_url.includes(matchedAsset.id))) return true;
          if (effectiveStorageKey && d.photo_url.includes(effectiveStorageKey)) return true;
          return false;
        });
        if (matches.length > 0) {
          const names = matches.map((d) => d.name).join(', ');
          return {
            success: false,
            error: `Asset is referenced by active doctor(s): ${names}. Remove references or confirm forced delete.`
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. STEP A: Delete the physical file from Supabase Storage
  const storageResult = await deleteFileFromSupabaseStorage({
    storageKey: effectiveStorageKey,
    fileName: effectiveFileName,
    category: effectiveCategory,
    url: effectiveUrl
  });

  if (!storageResult.success) {
    console.error(`[CareOn Media DB] Storage deletion failed. Aborting database deletion to maintain consistency:`, storageResult.error);
    return {
      success: false,
      error: `Storage deletion failed: ${storageResult.error}. Database record was preserved.`
    };
  }

  // 4. STEP B: Delete the media record from production database (site_settings)
  let rawDbList = [...rawDbAssets];
  if (rawDbList.length === 0) {
    rawDbList = [...PROJECT_ASSETS_MANIFEST];
  }

  const remainingAssets = rawDbList.filter((a) => {
    if (targetId && (a.id === targetId || a.fileName === targetId || a.storageKey === targetId)) return false;
    if (matchedAsset && (a.id === matchedAsset.id || a.fileName === matchedAsset.fileName || a.storageKey === matchedAsset.storageKey)) return false;
    if (effectiveFileName && a.fileName.toLowerCase() === effectiveFileName.toLowerCase()) return false;
    if (effectiveStorageKey && (a.storageKey === effectiveStorageKey || a.storageKey?.endsWith(effectiveStorageKey))) return false;
    return true;
  });

  const dbSaved = await saveSupabaseMediaAssets(remainingAssets);
  if (!dbSaved) {
    console.error(`[CareOn Media DB] Failed to save updated media_assets array in Supabase site_settings.`);
    return {
      success: false,
      error: 'Failed to update database record in Supabase site_settings.'
    };
  }

  // 5. STEP C: Add asset ID, filename, and storageKey to deleted_media_ids blacklist
  const blacklistKeys = Array.from(
    new Set(
      [
        targetId,
        targetFileName,
        targetStorageKey,
        effectiveFileName,
        effectiveStorageKey,
        matchedAsset?.id,
        matchedAsset?.fileName,
        matchedAsset?.storageKey
      ].filter(Boolean) as string[]
    )
  );

  await recordSupabaseDeletedAssetId(blacklistKeys);

  const diagnosticLog = {
    authenticatedAdmin: options.adminEmail || 'system',
    assetId: targetId || matchedAsset?.id || 'unknown',
    filename: effectiveFileName,
    bucket: 'careon-media',
    storageKey: effectiveStorageKey || 'unknown',
    supabaseDeleteResult: storageResult,
    databaseDeleteResult: {
      success: true,
      originalDbCount: rawDbList.length,
      remainingCount: remainingAssets.length,
      blacklistedKeys: blacklistKeys
    }
  };

  console.log(`[CareOn Production Delete Audit]`, JSON.stringify(diagnosticLog, null, 2));

  return {
    success: true,
    deletedAsset: effectiveAsset,
    storageDeleted: storageResult.deletedCount > 0,
    storageDetails: storageResult,
    diagnostics: diagnosticLog
  };
}

/**
 * Upload a file directly to Supabase Storage ('careon-media' bucket) and record metadata in PostgreSQL (site_settings)
 * Implements full atomic transaction rollback: if DB insert fails, Storage file is removed.
 */
export async function uploadFileToSupabaseStorageAndSaveMetadata(options: {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  category?: string;
  altText?: string;
  adminEmail?: string;
  width?: number;
  height?: number;
}): Promise<{
  success: boolean;
  asset?: MediaAsset;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase client is not configured or unavailable.'
    };
  }

  const ALLOWED_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml'
  ];

  const mime = (options.mimeType || 'image/jpeg').toLowerCase();
  if (!ALLOWED_MIMES.includes(mime)) {
    return {
      success: false,
      error: `Invalid file format (${mime}). Allowed types: JPG, PNG, WebP, SVG.`
    };
  }

  // Max 5 MB
  const MAX_BYTES = 5 * 1024 * 1024;
  if (options.fileBuffer.length > MAX_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 5 MB maximum limit.`
    };
  }

  const rawName = options.fileName || `upload-${Date.now()}`;
  const ext = rawName.includes('.')
    ? rawName.split('.').pop()!.toLowerCase()
    : mime === 'image/png'
    ? 'png'
    : mime === 'image/webp'
    ? 'webp'
    : mime === 'image/svg+xml'
    ? 'svg'
    : 'jpg';
  const baseName = rawName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const safeFileName = `${baseName}.${ext}`;
  const category = (options.category || 'CLINIC').toUpperCase() as MediaCategory;
  const catFolder = category.toLowerCase().replace(/[^a-z0-9]/g, '');
  const uniqueId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const storageKey = `assets/${catFolder}/${uniqueId}-${safeFileName}`;

  // STEP 1: Upload to Supabase Storage bucket 'careon-media'
  const { error: uploadError } = await client.storage
    .from('careon-media')
    .upload(storageKey, options.fileBuffer, {
      contentType: mime,
      upsert: true
    });

  if (uploadError) {
    console.error('[CareOn Storage] Upload failed:', uploadError.message);
    return {
      success: false,
      error: `Supabase Storage upload failed: ${uploadError.message}`
    };
  }

  // STEP 2: Get public URL
  const { data: pubData } = client.storage.from('careon-media').getPublicUrl(storageKey);
  const publicUrl = pubData?.publicUrl || '';

  const newAsset: MediaAsset = {
    id: uniqueId,
    fileName: safeFileName,
    originalName: rawName,
    mimeType: mime,
    category,
    url: publicUrl,
    storageKey,
    storageBucket: 'careon-media',
    fileSize: options.fileBuffer.length,
    width: options.width,
    height: options.height,
    altText: options.altText || `${baseName.replace(/[_-]/g, ' ')} - CareOn Medical Clinic`,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: options.adminEmail || 'system',
    updatedBy: options.adminEmail || 'system',
    version: 1
  };

  // STEP 3: Save metadata in Supabase PostgreSQL (site_settings table, key 'media_assets')
  try {
    const existingAssets = await getSupabaseMediaAssets();
    // Prepend new asset and remove duplicates
    const updatedAssets = [
      newAsset,
      ...existingAssets.filter((a) => a.id !== newAsset.id && a.storageKey !== newAsset.storageKey)
    ];
    const saved = await saveSupabaseMediaAssets(updatedAssets);

    if (!saved) {
      // Rollback: delete the uploaded file from storage
      await client.storage.from('careon-media').remove([storageKey]);
      return {
        success: false,
        error: 'Failed to record asset metadata in Supabase database. Storage file was rolled back.'
      };
    }

    console.log(
      `[CareOn Production Upload] Successfully uploaded & registered asset: ${newAsset.id} (${storageKey})`
    );
    return {
      success: true,
      asset: newAsset
    };
  } catch (dbErr: any) {
    // Rollback storage upload
    await client.storage.from('careon-media').remove([storageKey]);
    return {
      success: false,
      error: `Database metadata save failed: ${dbErr?.message || 'Unknown database error'}. Storage was rolled back.`
    };
  }
}

/**
 * Fetch all appointments from Supabase PostgreSQL (site_settings table)
 */
export async function getSupabaseAppointments(): Promise<AppointmentRequest[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'appointments')
      .maybeSingle();

    if (error) {
      console.warn('[CareOn DB] Error loading appointments from site_settings:', error.message);
      return [];
    }

    if (data?.setting_value) {
      const parsed = JSON.parse(data.setting_value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (err: any) {
    console.warn('[CareOn DB] Failed to parse appointments:', err.message);
    return [];
  }
}

/**
 * Save appointments array to Supabase PostgreSQL (site_settings table)
 */
export async function saveSupabaseAppointments(appointments: AppointmentRequest[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('site_settings').upsert(
      {
        setting_key: 'appointments',
        setting_value: JSON.stringify(appointments),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'setting_key' }
    );
    if (error) {
      console.error('[CareOn DB] Error saving appointments to site_settings:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[CareOn DB] Failed to save appointments:', err.message);
    return false;
  }
}

/**
 * Create a new appointment and persist into Supabase PostgreSQL
 */
export async function createSupabaseAppointment(
  payload: Partial<AppointmentRequest>
): Promise<{ success: boolean; appointment?: AppointmentRequest; error?: string }> {
  if (!payload.patientName || !payload.patientName.trim()) {
    return { success: false, error: 'Patient name is required.' };
  }
  const phone = payload.phone || payload.mobile || payload.patientPhone || '';
  if (!phone || !phone.trim()) {
    return { success: false, error: 'Phone number is required.' };
  }

  const existing = await getSupabaseAppointments();
  const id =
    payload.id && payload.id.startsWith('APT-')
      ? payload.id
      : `APT-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  const newAppt: AppointmentRequest = {
    id,
    requestType:
      payload.requestType ||
      (payload.bookingType === 'DOCTOR_CONSULTATION' || payload.doctorId ? 'DOCTOR' : 'SERVICE'),
    bookingType: payload.bookingType || (payload.doctorId ? 'DOCTOR_CONSULTATION' : 'CLINIC_SERVICE'),
    doctorId: payload.doctorId,
    doctorName: payload.doctorName,
    department: payload.department,
    serviceId: payload.serviceId,
    serviceName: payload.serviceName,
    serviceType: payload.serviceType,
    serviceMode: payload.serviceMode || 'CLINIC',
    locationType: payload.locationType || (payload.serviceMode === 'HOME' ? 'HOME' : 'CLINIC'),
    preferredDate: payload.preferredDate || payload.requestedDate || '',
    preferredTime: payload.preferredTime || payload.requestedTimeWindow || '',
    requestedDate: payload.requestedDate || payload.preferredDate || '',
    requestedTimeWindow: payload.requestedTimeWindow || payload.preferredTime || '',
    confirmedDate: payload.confirmedDate,
    confirmedTime: payload.confirmedTime,
    confirmedDoctorId: payload.confirmedDoctorId,
    confirmedDoctorName: payload.confirmedDoctorName,
    confirmedDepartment: payload.confirmedDepartment,
    confirmedServiceId: payload.confirmedServiceId,
    confirmedServiceName: payload.confirmedServiceName,
    confirmedAt: payload.confirmedAt,
    confirmedBy: payload.confirmedBy,
    contactedAt: payload.contactedAt,
    contactedBy: payload.contactedBy,
    patientName: payload.patientName.trim(),
    phone: phone.trim(),
    mobile: phone.trim(),
    patientPhone: phone.trim(),
    email: payload.email?.trim() || payload.patientEmail?.trim(),
    patientEmail: payload.patientEmail?.trim() || payload.email?.trim(),
    address: payload.address?.trim(),
    area: payload.area?.trim(),
    landmark: payload.landmark?.trim(),
    notes: payload.notes || payload.patientNotes || payload.reason,
    patientNotes: payload.patientNotes || payload.notes || payload.reason,
    reason: payload.reason || payload.notes,
    status: payload.status || 'NEW',
    adminNotes: payload.adminNotes || '',
    createdAt: payload.createdAt || now,
    updatedAt: now
  };

  const updated = [newAppt, ...existing.filter((a) => a.id !== newAppt.id)];
  const saved = await saveSupabaseAppointments(updated);
  if (!saved) {
    return { success: false, error: 'Failed to persist appointment in Supabase PostgreSQL.' };
  }

  console.log(`[CareOn Production DB] Appointment saved in Supabase: ${newAppt.id} for ${newAppt.patientName}`);
  return { success: true, appointment: newAppt };
}

/**
 * Update an existing appointment in Supabase PostgreSQL
 */
export async function updateSupabaseAppointment(
  id: string,
  updates: Partial<AppointmentRequest>
): Promise<{ success: boolean; appointment?: AppointmentRequest; error?: string }> {
  if (!id) return { success: false, error: 'Appointment ID is required.' };

  const existing = await getSupabaseAppointments();
  const idx = existing.findIndex((a) => a.id === id);
  if (idx === -1) {
    return { success: false, error: `Appointment ${id} not found in database.` };
  }

  const current = existing[idx];
  const updatedAppt: AppointmentRequest = {
    ...current,
    ...updates,
    id: current.id, // Immutable ID
    updatedAt: new Date().toISOString()
  };

  existing[idx] = updatedAppt;
  const saved = await saveSupabaseAppointments(existing);
  if (!saved) {
    return { success: false, error: 'Failed to update appointment in Supabase PostgreSQL.' };
  }

  return { success: true, appointment: updatedAppt };
}

/**
 * Delete an appointment from Supabase PostgreSQL
 */
export async function deleteSupabaseAppointment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!id) return { success: false, error: 'Appointment ID is required.' };

  const existing = await getSupabaseAppointments();
  const remaining = existing.filter((a) => a.id !== id);
  if (remaining.length === existing.length) {
    return { success: false, error: `Appointment ${id} not found.` };
  }

  const saved = await saveSupabaseAppointments(remaining);
  if (!saved) {
    return { success: false, error: 'Failed to delete appointment from Supabase PostgreSQL.' };
  }

  return { success: true };
}


