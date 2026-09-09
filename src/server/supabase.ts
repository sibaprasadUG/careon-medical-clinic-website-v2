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
  DayOfWeek
} from '../types';
import { DEFAULT_DEPARTMENTS, DEFAULT_SERVICES, DEFAULT_WEBSITE_SETTINGS } from '../data/seedData';

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
