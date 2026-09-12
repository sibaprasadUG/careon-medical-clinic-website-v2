import {
  Department,
  Doctor,
  Service,
  PatientStory,
  GalleryItem,
  FAQ,
  AppointmentRequest,
  AppointmentRequestStatus,
  WebsiteSettings,
  SEOSettings,
  AuditLog,
  AdminUser,
  ContentStatus,
  MediaAsset,
  BrandSettings,
  InsurancePartner,
  SectionMediaSettings
} from '../types';

import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_DOCTORS,
  DEFAULT_SERVICES,
  DEFAULT_PATIENT_STORIES,
  DEFAULT_GALLERY,
  DEFAULT_FAQS,
  DEFAULT_APPOINTMENT_REQUESTS,
  DEFAULT_WEBSITE_SETTINGS,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_AUDIT_LOGS
} from '../data/seedData';
import { PROJECT_ASSETS_MANIFEST } from '../data/assetsManifest';
import { apiClient } from './apiClient';

const STORAGE_KEYS = {
  DEPARTMENTS: 'careon_cms_departments',
  DOCTORS: 'careon_cms_doctors',
  SERVICES: 'careon_cms_services',
  PATIENT_STORIES: 'careon_cms_stories',
  GALLERY: 'careon_cms_gallery',
  FAQS: 'careon_cms_faqs',
  APPOINTMENTS: 'careon_cms_appointments',
  SETTINGS: 'careon_cms_settings',
  SEO: 'careon_cms_seo',
  AUDIT_LOGS: 'careon_cms_audit_logs',
  MEDIA_ASSETS: 'careon_cms_media_assets',
  DELETED_MEDIA_IDS: 'careon_cms_deleted_media_ids',
  INSURANCE_PARTNERS: 'careon_cms_insurance_partners'
};

export const DEFAULT_INSURANCE_PARTNERS: InsurancePartner[] = [
  {
    id: 'ins-01',
    name: 'Swasthya Sathi',
    nameBn: 'স্বাস্থ্য সাথী',
    type: 'Govt Health Scheme',
    typeBn: 'সরকারি স্বাস্থ্য প্রকল্প',
    color: 'from-emerald-700 to-teal-800',
    cashlessAvailable: true,
    tpaInfo: 'West Bengal Government Health Scheme for Family Hospitalization & Day Care Support',
    displayOrder: 1,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'ins-02',
    name: 'Star Health',
    nameBn: 'স্টার হেলথ',
    type: 'Health Insurance',
    typeBn: 'স্বাস্থ্য বীমা',
    color: 'from-blue-700 to-indigo-800',
    cashlessAvailable: true,
    tpaInfo: 'Individual & Family Optima Cashless / Reimbursement Support',
    displayOrder: 2,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'ins-03',
    name: 'HDFC ERGO',
    nameBn: 'এইচডিএফসি এর্গো',
    type: 'General Insurance',
    typeBn: 'জেনারেল ইন্স্যুরেন্স',
    color: 'from-red-700 to-rose-900',
    cashlessAvailable: true,
    tpaInfo: 'Optima Restore & Health Suraksha reimbursement claim assistance',
    displayOrder: 3,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'ins-04',
    name: 'Care Health Insurance',
    nameBn: 'কেয়ার হেলথ ইন্স্যুরেন্স',
    type: 'Health Coverage',
    typeBn: 'সম্পূর্ণ স্বাস্থ্য কভারেজ',
    color: 'from-cyan-700 to-blue-800',
    cashlessAvailable: true,
    tpaInfo: 'Care Advantage & Senior Citizen Health Insurance support',
    displayOrder: 4,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'ins-05',
    name: 'ICICI Lombard',
    nameBn: 'আইসিআইসিআই লম্বার্ড',
    type: 'Health Protection',
    typeBn: 'হেলথ প্রটেকশন',
    color: 'from-amber-700 to-orange-800',
    cashlessAvailable: true,
    tpaInfo: 'Complete Health Insurance & Critical Illness documentation',
    displayOrder: 5,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'ins-06',
    name: 'Niva Bupa',
    nameBn: 'নিভা বুপা',
    type: 'Comprehensive Health',
    typeBn: 'কম্প্রিহেনসিভ হেলথ',
    color: 'from-teal-700 to-emerald-900',
    cashlessAvailable: true,
    tpaInfo: 'ReAssure 2.0 & Health Companion claim assistance',
    displayOrder: 6,
    status: 'ACTIVE',
    createdAt: '2026-08-20T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z'
  }
];

// Initial Seed Media Assets for Doctor and Brand Assets
export const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'asset-doc-physician-consultant',
    fileName: 'consultant_physician.jpg',
    originalName: 'consultant_physician.jpg',
    mimeType: 'image/jpeg',
    category: 'DOCTOR',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    storageKey: 'assets/doctors/consultant_physician.jpg',
    width: 800,
    height: 1000,
    fileSize: 184320,
    altText: 'CareOn Consultant Physician & Specialist Doctor',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  },
  {
    id: 'asset-doc-pediatric-specialist',
    fileName: 'pediatric_specialist.jpg',
    originalName: 'pediatric_specialist.jpg',
    mimeType: 'image/jpeg',
    category: 'DOCTOR',
    url: 'https://images.unsplash.com/photo-1594824813580-ff61f9a2636a?auto=format&fit=crop&q=80&w=800',
    storageKey: 'assets/doctors/pediatric_specialist.jpg',
    width: 800,
    height: 1000,
    fileSize: 198400,
    altText: 'CareOn Senior Pediatric Specialist',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  },
  {
    id: 'asset-doc-cardiologist',
    fileName: 'cardiologist.jpg',
    originalName: 'cardiologist.jpg',
    mimeType: 'image/jpeg',
    category: 'DOCTOR',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=800',
    storageKey: 'assets/doctors/cardiologist.jpg',
    width: 800,
    height: 1000,
    fileSize: 212480,
    altText: 'CareOn Consultant Cardiologist & Heart Specialist',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  },
  {
    id: 'asset-doc-gynecologist',
    fileName: 'gynecologist.jpg',
    originalName: 'gynecologist.jpg',
    mimeType: 'image/jpeg',
    category: 'DOCTOR',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    storageKey: 'assets/doctors/gynecologist.jpg',
    width: 800,
    height: 1000,
    fileSize: 204800,
    altText: 'CareOn Consultant Gynaecologist & Obstetrician',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  },
  {
    id: 'asset-doc-sougata-roy',
    fileName: 'dr_sougata_roy.jpg',
    originalName: 'dr_sougata_roy.jpg',
    mimeType: 'image/jpeg',
    category: 'DOCTOR',
    url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=800',
    storageKey: 'assets/doctors/dr_sougata_roy.jpg',
    width: 800,
    height: 1000,
    fileSize: 189440,
    altText: 'Dr. Sougata Roy - Consultant Orthopaedic Surgeon at CareOn Medical Clinic',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  },
  {
    id: 'media-brand-logo',
    fileName: 'careon_official_brandmark.svg',
    originalName: 'careon_official_brandmark.svg',
    mimeType: 'image/svg+xml',
    category: 'BRAND',
    url: '',
    storageKey: 'careon/assets/brand/careon_official_brandmark.svg',
    width: 320,
    height: 80,
    fileSize: 4096,
    altText: 'CareOn Medical Clinic — Caring Beyond Treatment',
    status: 'ACTIVE',
    createdAt: '2026-08-27T08:00:00.000Z',
    updatedAt: '2026-08-27T08:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    version: 1
  }
];

// Global Event Dispatcher for Real-Time Reactivity across tabs/views
const DATA_CHANGE_EVENT = 'careon_data_updated';

function notifyDataChange(entity: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { entity, timestamp: Date.now() } }));
  }
}

// Memory storage fallback for non-browser / Node.js test environments
const nodeMemoryStorage: Record<string, string> = {};

// Helper to safely read from storage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    if (nodeMemoryStorage[key]) {
      try {
        return JSON.parse(nodeMemoryStorage[key]) as T;
      } catch {
        return fallback;
      }
    }
    nodeMemoryStorage[key] = JSON.stringify(fallback);
    return fallback;
  }
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error loading storage for key ${key}:`, err);
    return fallback;
  }
}

// Helper to safely write to storage
function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined' || !window.localStorage) {
    nodeMemoryStorage[key] = JSON.stringify(data);
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing to storage for key ${key}:`, err);
  }
}

// Generate URL-friendly slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Runtime in-memory doctor cache to guarantee sync across all components
let runtimeDoctorCache: Doctor[] | null = null;
let inFlightDoctorsPromise: Promise<Doctor[]> | null = null;

// Helper to retrieve active admin JWT token for backend sync
function getAdminAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('careon_admin_jwt_token') || localStorage.getItem('careon_admin_jwt_token') || null;
}

// Background sync helpers
async function syncDoctorToBackend(doctor: Doctor) {
  const token = getAdminAuthToken();
  if (!token) return;
  try {
    if (doctor.id && DataAccessLayer.getAllDoctors().some(d => d.id === doctor.id)) {
      await apiClient.updateDoctor(doctor.id, doctor);
    } else {
      await apiClient.createDoctor(doctor);
    }
  } catch (err) {
    console.warn('Doctor backend sync deferred (offline/local mode):', err);
  }
}

async function deleteDoctorFromBackend(id: string) {
  const token = getAdminAuthToken();
  if (!token) return;
  try {
    await apiClient.deleteDoctor(id);
  } catch (err) {
    console.warn('Doctor backend delete deferred:', err);
  }
}

async function syncAllDoctorsToBackend(doctors: Doctor[]) {
  const token = getAdminAuthToken();
  if (!token) return;
  try {
    await apiClient.syncFullData({ doctors });
  } catch (err) {
    console.warn('Doctors bulk sync deferred:', err);
  }
}

// Audit Logger Helper
function recordAudit(
  adminUser: AdminUser | null,
  action: string,
  entityType: AuditLog['entityType'],
  entityId: string,
  entityName?: string,
  details?: string
) {
  const logs = loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    adminUserId: adminUser?.id || 'system-action',
    adminEmail: adminUser?.email || 'system',
    action,
    entityType,
    entityId,
    entityName,
    details
  };
  const updatedLogs = [newLog, ...logs].slice(0, 150); // keep last 150
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
  notifyDataChange('AuditLog');
}

export const DataAccessLayer = {
  // ==========================================
  // PUBLIC READ DATA ACCESS (Strict Filters)
  // ==========================================

  getPublicDoctors(): Doctor[] {
    if (!runtimeDoctorCache && !inFlightDoctorsPromise && typeof window !== 'undefined') {
      DataAccessLayer.fetchDoctorsFromApi().catch(() => {});
    }
    const all = runtimeDoctorCache || loadFromStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    return all
      .filter((doc) => doc.status === 'ACTIVE' && doc.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getPublicServices(): Service[] {
    const all = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    return all
      .filter((srv) => srv.status === 'ACTIVE')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getPublicDepartments(): Department[] {
    const all = loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
    return all
      .filter((dept) => dept.status === 'ACTIVE')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getPublicPatientStories(): PatientStory[] {
    const all = loadFromStorage<PatientStory[]>(STORAGE_KEYS.PATIENT_STORIES, DEFAULT_PATIENT_STORIES);
    return all
      .filter((story) => story.published)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getPublicGallery(): GalleryItem[] {
    const all = loadFromStorage<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    return all
      .filter((item) => item.published)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getPublicFAQs(): FAQ[] {
    const all = loadFromStorage<FAQ[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
    return all
      .filter((faq) => faq.published)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getWebsiteSettings(): WebsiteSettings {
    const s = loadFromStorage<WebsiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_WEBSITE_SETTINGS);
    // Sanitize and ensure verified CareOn details
    if (!s.phone || s.phone === '+91 98300 00000' || s.phone === '+91 9933335131') {
      s.phone = '9933335131';
    }
    if (!s.emergencyPhone) {
      s.emergencyPhone = '9933520248';
    }
    if (!s.whatsapp || s.whatsapp === '+91 98300 00000' || s.whatsapp === '+91 9933335131') {
      s.whatsapp = '9933335131';
    }
    if (!s.email || s.email === 'care@careonclinic.com') {
      s.email = 'info@careonmedical.in';
    }
    if (!s.address || s.address === 'West Bengal') {
      s.address = 'Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401';
      s.locationName = 'Contai, Purba Medinipur';
    }
    if (!s.openingHours || s.openingHours.includes('08:00 AM') || s.openingHours.includes('02:00 PM')) {
      s.openingHours = 'Mon – Sat: 09:00 AM – 07:00 PM | Sunday: Closed';
    }
    if (!s.brand?.logoUrl && !s.logoUrl) {
      s.brand = {
        ...(s.brand || {}),
        logoUrl: 'https://tgwthqwivtmarjsslxxn.supabase.co/storage/v1/object/public/careon-media/assets/doctor/asset-1789066744779-h4uevf-careon_logo_png.png',
        logoAlt: s.brand?.logoAlt || 'CareOn Medical Clinic Logo'
      };
      s.logoUrl = 'https://tgwthqwivtmarjsslxxn.supabase.co/storage/v1/object/public/careon-media/assets/doctor/asset-1789066744779-h4uevf-careon_logo_png.png';
    }
    if (s.announcement && (s.announcement.toLowerCase().includes('monsoon') || s.announcement.toLowerCase().includes('preventive monsoon'))) {
      s.announcement = '';
      s.announcementActive = false;
    }

    // Normalize social links structure
    const rawSocial = s.socialLinks || {};
    s.socialLinks = {
      facebook: {
        url: typeof rawSocial.facebook === 'object' && rawSocial.facebook?.url !== undefined
          ? rawSocial.facebook.url
          : (typeof rawSocial.facebook === 'string' && rawSocial.facebook ? rawSocial.facebook : 'https://www.facebook.com/profile.php?id=61574354535870'),
        active: typeof rawSocial.facebook === 'object' && typeof rawSocial.facebook?.active === 'boolean'
          ? rawSocial.facebook.active
          : true
      },
      instagram: {
        url: typeof rawSocial.instagram === 'object' && rawSocial.instagram?.url !== undefined
          ? rawSocial.instagram.url
          : (typeof rawSocial.instagram === 'string' && rawSocial.instagram ? rawSocial.instagram : 'https://www.instagram.com/sibucontai/'),
        active: typeof rawSocial.instagram === 'object' && typeof rawSocial.instagram?.active === 'boolean'
          ? rawSocial.instagram.active
          : true
      },
      youtube: {
        url: typeof rawSocial.youtube === 'object' && rawSocial.youtube?.url !== undefined
          ? rawSocial.youtube.url
          : (typeof rawSocial.youtube === 'string' ? rawSocial.youtube : ''),
        active: typeof rawSocial.youtube === 'object' && typeof rawSocial.youtube?.active === 'boolean'
          ? rawSocial.youtube.active
          : false
      },
      whatsapp: {
        url: typeof rawSocial.whatsapp === 'object' && rawSocial.whatsapp?.url
          ? rawSocial.whatsapp.url
          : 'https://wa.me/919933335131',
        active: typeof rawSocial.whatsapp === 'object' && typeof rawSocial.whatsapp?.active === 'boolean'
          ? rawSocial.whatsapp.active
          : true
      },
      googleBusiness: {
        url: typeof rawSocial.googleBusiness === 'object' && rawSocial.googleBusiness?.url && rawSocial.googleBusiness.url !== 'https://share.google/F3PByQlgbeonGJymI'
          ? rawSocial.googleBusiness.url
          : (typeof rawSocial.googleBusiness === 'string' && rawSocial.googleBusiness && rawSocial.googleBusiness !== 'https://share.google/F3PByQlgbeonGJymI' ? rawSocial.googleBusiness : 'https://share.google/1rR9CTJqmxgGnvW7I'),
        active: typeof rawSocial.googleBusiness === 'object' && typeof rawSocial.googleBusiness?.active === 'boolean'
          ? rawSocial.googleBusiness.active
          : true
      }
    };

    return s;
  },

  getSEOSettings(): SEOSettings {
    return loadFromStorage<SEOSettings>(STORAGE_KEYS.SEO, DEFAULT_SEO_SETTINGS);
  },

  // Public Appointment Request Submission (Website Form -> Website Request Queue Only)
  submitPublicAppointmentRequest(
    payload: Omit<AppointmentRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'adminNotes'>
  ): AppointmentRequest {
    const appointments = loadFromStorage<AppointmentRequest[]>(
      STORAGE_KEYS.APPOINTMENTS,
      DEFAULT_APPOINTMENT_REQUESTS
    );

    const newRequest: AppointmentRequest = {
      ...payload,
      id: `apt-req-${Date.now()}`,
      status: 'NEW',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newRequest, ...appointments];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);

    recordAudit(
      null,
      'APPOINTMENT_REQUESTED_BY_PATIENT',
      'AppointmentRequest',
      newRequest.id,
      newRequest.patientName,
      `New website booking request submitted for ${payload.preferredDate} (${payload.preferredTime})`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.createAppointment(newRequest).catch((err) => {
      console.warn('[CareOn DAL] Background appointment sync note:', err.message);
    });

    return newRequest;
  },

  // ==========================================
  // ADMIN DATA ACCESS & MUTATIONS
  // ==========================================

  // --- DOCTORS ---
  getAllDoctors(): Doctor[] {
    if (!runtimeDoctorCache && !inFlightDoctorsPromise && typeof window !== 'undefined') {
      DataAccessLayer.fetchDoctorsFromApi().catch(() => {});
    }
    const all = runtimeDoctorCache || loadFromStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    return all.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async fetchDoctorsFromApi(force = false): Promise<Doctor[]> {
    if (inFlightDoctorsPromise && !force) {
      return inFlightDoctorsPromise;
    }
    inFlightDoctorsPromise = (async () => {
      try {
        const serverDoctors = await apiClient.getDoctors();
        if (Array.isArray(serverDoctors)) {
          runtimeDoctorCache = serverDoctors;
          saveToStorage(STORAGE_KEYS.DOCTORS, serverDoctors);
          notifyDataChange('Doctor');
          return serverDoctors;
        }
      } catch (err) {
        console.warn('Could not fetch doctors from API, using cached data:', err);
      } finally {
        inFlightDoctorsPromise = null;
      }
      return runtimeDoctorCache || loadFromStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
    })();
    return inFlightDoctorsPromise;
  },

  getDoctorById(id: string): Doctor | undefined {
    return this.getAllDoctors().find((d) => d.id === id);
  },

  getDoctorBySlug(slug: string): Doctor | undefined {
    return this.getAllDoctors().find((d) => d.slug === slug);
  },

  async saveDoctorAsync(
    doctorData: Partial<Doctor> & { name: string; departmentId: string },
    adminUser: AdminUser
  ): Promise<Doctor> {
    const isEdit = Boolean(doctorData.id && this.getAllDoctors().some((d) => d.id === doctorData.id));
    let persisted: Doctor;

    if (isEdit && doctorData.id) {
      persisted = await apiClient.updateDoctor(doctorData.id, doctorData);
    } else {
      persisted = await apiClient.createDoctor(doctorData);
    }

    // Update in-memory and local cache
    const current = this.getAllDoctors().filter((d) => d.id !== persisted.id);
    current.push(persisted);
    current.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    runtimeDoctorCache = current;
    saveToStorage(STORAGE_KEYS.DOCTORS, current);

    recordAudit(
      adminUser,
      isEdit ? 'DOCTOR_UPDATED' : 'DOCTOR_CREATED',
      'Doctor',
      persisted.id,
      persisted.name,
      isEdit ? 'Updated doctor in production database' : 'Created doctor in production database'
    );

    notifyDataChange('Doctor');
    return persisted;
  },

  saveDoctor(doctorData: Partial<Doctor> & { name: string; departmentId: string }, adminUser: AdminUser): Doctor {
    const doctors = this.getAllDoctors();
    const isEdit = Boolean(doctorData.id && doctors.some((d) => d.id === doctorData.id));

    let doctorToSave: Doctor;

    if (isEdit) {
      const existing = doctors.find((d) => d.id === doctorData.id)!;
      const targetPhotoUrl =
        doctorData.profilePhotoUrl !== undefined
          ? doctorData.profilePhotoUrl
          : (doctorData.photoUrl !== undefined ? doctorData.photoUrl : (existing.profilePhotoUrl || existing.photoUrl || ''));

      const photoChanged =
        (doctorData.profilePhotoAssetId !== undefined && doctorData.profilePhotoAssetId !== existing.profilePhotoAssetId) ||
        (doctorData.profilePhotoUrl !== undefined && doctorData.profilePhotoUrl !== existing.profilePhotoUrl) ||
        (doctorData.photoUrl !== undefined && doctorData.photoUrl !== existing.photoUrl);

      // Derive human-readable consultation schedule summary if schedules array is present
      let derivedDays = doctorData.consultationDays || existing.consultationDays || [];
      let derivedTime = doctorData.consultationTime || existing.consultationTime || '';
      if (Array.isArray(doctorData.schedules) && doctorData.schedules.length > 0) {
        derivedDays = Array.from(new Set(doctorData.schedules.map((s) => s.day.slice(0, 3))));
        derivedTime = doctorData.schedules.map((s) => `${s.day.slice(0, 3)} ${s.startTime} – ${s.endTime}`).join('; ');
      }

      const derivedChamber = doctorData.chamberId === 'Other' && doctorData.chamberCustom
        ? doctorData.chamberCustom
        : (doctorData.chamberId || doctorData.roomNumber || existing.roomNumber || 'CareOn Medical Clinic');

      const resolvedStatus = doctorData.active === false ? 'INACTIVE' : (doctorData.status || existing.status || 'ACTIVE');

      doctorToSave = {
        ...existing,
        ...doctorData,
        photoUrl: targetPhotoUrl,
        profilePhotoUrl: targetPhotoUrl,
        photoAssetId: doctorData.photoAssetId || doctorData.profilePhotoAssetId || existing.photoAssetId || existing.profilePhotoAssetId || '',
        profilePhotoAssetId: doctorData.photoAssetId || doctorData.profilePhotoAssetId || existing.photoAssetId || existing.profilePhotoAssetId || '',
        profilePhotoAlt: doctorData.profilePhotoAlt !== undefined ? doctorData.profilePhotoAlt : existing.profilePhotoAlt,
        schedules: doctorData.schedules !== undefined ? doctorData.schedules : existing.schedules,
        specialtyId: doctorData.specialtyId !== undefined ? doctorData.specialtyId : existing.specialtyId,
        chamberId: doctorData.chamberId !== undefined ? doctorData.chamberId : existing.chamberId,
        chamberCustom: doctorData.chamberCustom !== undefined ? doctorData.chamberCustom : existing.chamberCustom,
        serviceIds: doctorData.serviceIds !== undefined ? doctorData.serviceIds : existing.serviceIds,
        active: resolvedStatus === 'ACTIVE',
        published: resolvedStatus === 'ACTIVE',
        status: resolvedStatus,
        consultationDays: derivedDays,
        consultationTime: derivedTime,
        roomNumber: derivedChamber,
        weeklySchedule: doctorData.weeklySchedule !== undefined ? doctorData.weeklySchedule : existing.weeklySchedule,
        customSchedules: doctorData.customSchedules !== undefined ? doctorData.customSchedules : existing.customSchedules,
        scheduleExceptions: doctorData.scheduleExceptions !== undefined ? doctorData.scheduleExceptions : existing.scheduleExceptions,
        slug: doctorData.slug || generateSlug(doctorData.name),
        updatedAt: new Date().toISOString()
      };
      const updatedList = doctors.map((d) => (d.id === doctorToSave.id ? doctorToSave : d));
      runtimeDoctorCache = updatedList;
      saveToStorage(STORAGE_KEYS.DOCTORS, updatedList);
      recordAudit(adminUser, 'DOCTOR_UPDATED', 'Doctor', doctorToSave.id, doctorToSave.name, `Updated doctor details and consultation schedule.`);

      if (photoChanged) {
        recordAudit(
          adminUser,
          'DOCTOR_PHOTO_CHANGED',
          'Doctor',
          doctorToSave.id,
          doctorToSave.name,
          doctorToSave.photoUrl
            ? `Doctor profile photograph updated via centralized Media Library (Asset: ${doctorToSave.profilePhotoAssetId || 'custom'})`
            : `Doctor profile photograph removed. Using standard CareOn doctor fallback.`
        );
      }
    } else {
      const maxOrder = doctors.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
      const activePhoto = doctorData.profilePhotoUrl || doctorData.photoUrl || '';
      
      let derivedDays = doctorData.consultationDays || [];
      let derivedTime = doctorData.consultationTime || '10:30 AM – 11:30 AM';
      if (Array.isArray(doctorData.schedules) && doctorData.schedules.length > 0) {
        derivedDays = Array.from(new Set(doctorData.schedules.map((s) => s.day.slice(0, 3))));
        derivedTime = doctorData.schedules.map((s) => `${s.day.slice(0, 3)} ${s.startTime} – ${s.endTime}`).join('; ');
      }

      const derivedChamber = doctorData.chamberId === 'Other' && doctorData.chamberCustom
        ? doctorData.chamberCustom
        : (doctorData.chamberId || doctorData.roomNumber || 'CareOn Medical Clinic');

      const resolvedStatus = doctorData.active === false ? 'INACTIVE' : (doctorData.status || 'ACTIVE');

      doctorToSave = {
        id: `doc-${Date.now()}`,
        name: doctorData.name,
        nameBn: doctorData.nameBn || '',
        slug: generateSlug(doctorData.name),
        photoUrl: activePhoto,
        profilePhotoUrl: activePhoto,
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
        active: resolvedStatus === 'ACTIVE',
        published: resolvedStatus === 'ACTIVE',
        consultationDays: derivedDays.length > 0 ? derivedDays : ['Sat'],
        consultationTime: derivedTime,
        roomNumber: derivedChamber,
        weeklySchedule: doctorData.weeklySchedule,
        customSchedules: doctorData.customSchedules,
        scheduleExceptions: doctorData.scheduleExceptions,
        appointmentEnabled: doctorData.appointmentEnabled !== undefined ? doctorData.appointmentEnabled : true,
        featured: Boolean(doctorData.featured),
        displayOrder: doctorData.displayOrder || maxOrder + 1,
        status: resolvedStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = [...doctors, doctorToSave];
      runtimeDoctorCache = updatedList;
      saveToStorage(STORAGE_KEYS.DOCTORS, updatedList);
      recordAudit(adminUser, 'DOCTOR_CREATED', 'Doctor', doctorToSave.id, doctorToSave.name, `Added new doctor to department ${doctorToSave.departmentId}`);
    }

    // Persist asynchronously to backend server
    this.saveDoctorAsync(doctorToSave, adminUser).catch((err) => {
      console.warn('Asynchronous doctor persistence background warning:', err);
    });

    notifyDataChange('Doctor');
    return doctorToSave;
  },

  async deleteDoctorAsync(doctorId: string, adminUser: AdminUser): Promise<boolean> {
    await apiClient.deleteDoctor(doctorId);
    const updated = this.getAllDoctors().filter((d) => d.id !== doctorId);
    runtimeDoctorCache = updated;
    saveToStorage(STORAGE_KEYS.DOCTORS, updated);

    recordAudit(
      adminUser,
      'DOCTOR_DELETED',
      'Doctor',
      doctorId,
      'Doctor',
      `Permanently removed doctor from registry`
    );

    notifyDataChange('Doctor');
    return true;
  },

  deleteDoctor(doctorId: string, adminUser: AdminUser): boolean {
    const doctors = this.getAllDoctors();
    const docToDelete = doctors.find((d) => d.id === doctorId);
    if (!docToDelete) return false;

    const updated = doctors.filter((d) => d.id !== doctorId);
    runtimeDoctorCache = updated;
    saveToStorage(STORAGE_KEYS.DOCTORS, updated);

    recordAudit(
      adminUser,
      'DOCTOR_DELETED',
      'Doctor',
      docToDelete.id,
      docToDelete.name,
      `Permanently removed doctor from registry`
    );

    // Sync deletion to backend server
    this.deleteDoctorAsync(doctorId, adminUser).catch((err) => {
      console.warn('Asynchronous doctor deletion background warning:', err);
    });

    notifyDataChange('Doctor');
    return true;
  },

  toggleDoctorStatus(doctorId: string, newStatus: ContentStatus, adminUser: AdminUser) {
    const doctors = this.getAllDoctors();
    const doc = doctors.find((d) => d.id === doctorId);
    if (!doc) return;

    doc.status = newStatus;
    // An inactive/archived doctor cannot be featured
    if (newStatus !== 'ACTIVE') {
      doc.featured = false;
    }
    doc.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
    recordAudit(adminUser, `DOCTOR_STATUS_${newStatus}`, 'Doctor', doc.id, doc.name, `Status set to ${newStatus}`);
    syncAllDoctorsToBackend(doctors);
    notifyDataChange('Doctor');
  },

  toggleDoctorFeatured(doctorId: string, adminUser: AdminUser) {
    const doctors = this.getAllDoctors();
    const doc = doctors.find((d) => d.id === doctorId);
    if (!doc) return;

    if (doc.status !== 'ACTIVE' && !doc.featured) {
      throw new Error('Only ACTIVE doctors can be featured on the public website.');
    }

    doc.featured = !doc.featured;
    doc.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.DOCTORS, doctors);
    recordAudit(adminUser, doc.featured ? 'DOCTOR_FEATURED' : 'DOCTOR_UNFEATURED', 'Doctor', doc.id, doc.name, `Featured status changed`);
    syncAllDoctorsToBackend(doctors);
    notifyDataChange('Doctor');
  },

  reorderDoctors(orderedIds: string[], adminUser: AdminUser) {
    const doctors = this.getAllDoctors();
    const map = new Map<string, Doctor>(doctors.map((d) => [d.id, d]));
    const updated: Doctor[] = [];
    orderedIds.forEach((id, index) => {
      const d = map.get(id);
      if (d) {
        updated.push({ ...d, displayOrder: index + 1, updatedAt: new Date().toISOString() });
      }
    });

    saveToStorage(STORAGE_KEYS.DOCTORS, updated);
    recordAudit(adminUser, 'DOCTORS_REORDERED', 'Doctor', 'all', 'Doctor Directory', 'Updated display orders');
    syncAllDoctorsToBackend(updated);
    notifyDataChange('Doctor');
  },

  // --- DEPARTMENTS ---
  getAllDepartments(): Department[] {
    return loadFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async fetchDepartmentsFromApi(force = false): Promise<Department[]> {
    try {
      const serverDepts = await apiClient.getDepartments();
      if (Array.isArray(serverDepts) && serverDepts.length > 0) {
        saveToStorage(STORAGE_KEYS.DEPARTMENTS, serverDepts);
        notifyDataChange('Department');
        return serverDepts;
      }
    } catch (err) {
      console.warn('Could not fetch departments from API, using cached data:', err);
    }
    return this.getAllDepartments();
  },

  getDepartmentDependencies(departmentId: string): { activeDoctors: Doctor[]; activeServices: Service[] } {
    const doctors = this.getAllDoctors().filter((d) => d.departmentId === departmentId && d.status === 'ACTIVE');
    const services = this.getAllServices().filter((s) => s.departmentId === departmentId && s.status === 'ACTIVE');
    return { activeDoctors: doctors, activeServices: services };
  },

  saveDepartment(departmentData: Partial<Department> & { name: string }, adminUser: AdminUser): Department {
    const departments = this.getAllDepartments();
    const isEdit = Boolean(departmentData.id && departments.some((d) => d.id === departmentData.id));

    let deptToSave: Department;

    if (isEdit) {
      const existing = departments.find((d) => d.id === departmentData.id)!;
      deptToSave = {
        ...existing,
        ...departmentData,
        slug: departmentData.slug || generateSlug(departmentData.name),
        updatedAt: new Date().toISOString()
      };
      const updatedList = departments.map((d) => (d.id === deptToSave.id ? deptToSave : d));
      saveToStorage(STORAGE_KEYS.DEPARTMENTS, updatedList);
      recordAudit(adminUser, 'DEPARTMENT_UPDATED', 'Department', deptToSave.id, deptToSave.name, 'Updated department details');
    } else {
      const maxOrder = departments.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
      deptToSave = {
        id: `dept-${Date.now()}`,
        name: departmentData.name,
        nameBn: departmentData.nameBn || '',
        slug: generateSlug(departmentData.name),
        shortDescription: departmentData.shortDescription || '',
        description: departmentData.description || '',
        imageUrl: departmentData.imageUrl || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
        icon: departmentData.icon || 'Stethoscope',
        featured: Boolean(departmentData.featured),
        displayOrder: departmentData.displayOrder || maxOrder + 1,
        status: departmentData.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = [...departments, deptToSave];
      saveToStorage(STORAGE_KEYS.DEPARTMENTS, updatedList);
      recordAudit(adminUser, 'DEPARTMENT_CREATED', 'Department', deptToSave.id, deptToSave.name, 'Created new department');
    }

    notifyDataChange('Department');
    return deptToSave;
  },

  toggleDepartmentStatus(departmentId: string, newStatus: ContentStatus, adminUser: AdminUser) {
    const departments = this.getAllDepartments();
    const dept = departments.find((d) => d.id === departmentId);
    if (!dept) return;

    dept.status = newStatus;
    dept.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, departments);
    recordAudit(adminUser, `DEPARTMENT_STATUS_${newStatus}`, 'Department', dept.id, dept.name, `Status set to ${newStatus}`);
    notifyDataChange('Department');
  },

  deleteDepartment(departmentId: string, adminUser: AdminUser): boolean {
    const departments = this.getAllDepartments();
    const target = departments.find((d) => d.id === departmentId);
    if (!target) return false;

    const remaining = departments.filter((d) => d.id !== departmentId);
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, remaining);
    recordAudit(adminUser, 'DEPARTMENT_DELETED', 'Department', target.id, target.name, 'Permanently deleted department');
    notifyDataChange('Department');
    return true;
  },

  // --- SERVICES ---
  getAllServices(): Service[] {
    const rawServices = loadFromStorage<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    return rawServices
      .map((s) => ({
        ...s,
        serviceType: s.serviceType || (s.availableForHome ? (s.availableAtClinic !== false ? 'BOTH' : 'HOME') : 'CLINIC'),
        availableForHome: s.availableForHome !== undefined ? s.availableForHome : (s.serviceType === 'HOME' || s.serviceType === 'BOTH'),
        availableAtClinic: s.availableAtClinic !== undefined ? s.availableAtClinic : (s.serviceType === 'CLINIC' || s.serviceType === 'BOTH' || !s.serviceType)
      }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  async fetchServicesFromApi(force = false): Promise<Service[]> {
    try {
      const serverServices = await apiClient.getServices();
      if (Array.isArray(serverServices) && serverServices.length > 0) {
        saveToStorage(STORAGE_KEYS.SERVICES, serverServices);
        notifyDataChange('Service');
        return serverServices;
      }
    } catch (err) {
      console.warn('Could not fetch services from API, using cached data:', err);
    }
    return this.getAllServices();
  },

  saveService(serviceData: Partial<Service> & { name: string; departmentId: string }, adminUser: AdminUser): Service {
    const services = this.getAllServices();
    const isEdit = Boolean(serviceData.id && services.some((s) => s.id === serviceData.id));

    const sType = serviceData.serviceType || 'CLINIC';
    const forHome = serviceData.availableForHome !== undefined ? serviceData.availableForHome : (sType === 'HOME' || sType === 'BOTH');
    const forClinic = serviceData.availableAtClinic !== undefined ? serviceData.availableAtClinic : (sType === 'CLINIC' || sType === 'BOTH');

    let serviceToSave: Service;

    if (isEdit) {
      const existing = services.find((s) => s.id === serviceData.id)!;
      serviceToSave = {
        ...existing,
        ...serviceData,
        serviceType: sType,
        availableForHome: forHome,
        availableAtClinic: forClinic,
        slug: serviceData.slug || generateSlug(serviceData.name),
        updatedAt: new Date().toISOString()
      };
      const updatedList = services.map((s) => (s.id === serviceToSave.id ? serviceToSave : s));
      saveToStorage(STORAGE_KEYS.SERVICES, updatedList);
      recordAudit(adminUser, 'SERVICE_UPDATED', 'Service', serviceToSave.id, serviceToSave.name, 'Updated service');
    } else {
      const maxOrder = services.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0);
      serviceToSave = {
        id: `srv-${Date.now()}`,
        name: serviceData.name,
        nameBn: serviceData.nameBn || '',
        slug: generateSlug(serviceData.name),
        shortDescription: serviceData.shortDescription || '',
        description: serviceData.description || '',
        departmentId: serviceData.departmentId,
        category: serviceData.category || 'Diagnostic',
        serviceType: sType,
        availableForHome: forHome,
        availableAtClinic: forClinic,
        icon: serviceData.icon || 'Activity',
        imageUrl: serviceData.imageUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
        preparationInstructions: serviceData.preparationInstructions || [],
        reportTurnaroundTime: serviceData.reportTurnaroundTime || 'Same-day',
        bookingEnabled: serviceData.bookingEnabled !== undefined ? serviceData.bookingEnabled : true,
        featured: Boolean(serviceData.featured),
        displayOrder: serviceData.displayOrder || maxOrder + 1,
        status: serviceData.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = [...services, serviceToSave];
      saveToStorage(STORAGE_KEYS.SERVICES, updatedList);
      recordAudit(adminUser, 'SERVICE_CREATED', 'Service', serviceToSave.id, serviceToSave.name, 'Created new service');
    }

    notifyDataChange('Service');
    return serviceToSave;
  },

  toggleServiceStatus(serviceId: string, newStatus: ContentStatus, adminUser: AdminUser) {
    const services = this.getAllServices();
    const srv = services.find((s) => s.id === serviceId);
    if (!srv) return;

    srv.status = newStatus;
    if (newStatus !== 'ACTIVE') {
      srv.featured = false;
    }
    srv.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.SERVICES, services);
    recordAudit(adminUser, `SERVICE_STATUS_${newStatus}`, 'Service', srv.id, srv.name, `Status set to ${newStatus}`);
    notifyDataChange('Service');
  },

  deleteService(serviceId: string, adminUser: AdminUser): boolean {
    const services = this.getAllServices();
    const target = services.find((s) => s.id === serviceId);
    if (!target) return false;

    const remaining = services.filter((s) => s.id !== serviceId);
    saveToStorage(STORAGE_KEYS.SERVICES, remaining);
    recordAudit(adminUser, 'SERVICE_DELETED', 'Service', target.id, target.name, 'Permanently deleted service');
    notifyDataChange('Service');
    return true;
  },

  // --- PATIENT STORIES ---
  getAllPatientStories(): PatientStory[] {
    return loadFromStorage<PatientStory[]>(STORAGE_KEYS.PATIENT_STORIES, DEFAULT_PATIENT_STORIES)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  savePatientStory(
    storyData: Partial<PatientStory> & {
      patientName?: string;
      patientDisplayName?: string;
      story?: string;
      quote?: string;
    },
    adminUser: AdminUser
  ): PatientStory {
    const stories = this.getAllPatientStories();
    const isEdit = Boolean(storyData.id && stories.some((s) => s.id === storyData.id));

    const name = storyData.patientName || storyData.patientDisplayName || 'Verified Patient';
    const nameBn = storyData.patientNameBn || storyData.patientDisplayNameBn || '';
    const text = storyData.story || storyData.quote || '';
    const textBn = storyData.storyBn || storyData.quoteBn || '';
    const relatedDoc = storyData.doctorId || storyData.relatedDoctorId || '';
    const relatedSrv = storyData.serviceId || storyData.relatedServiceId || '';
    const tag = storyData.careTag || storyData.tag || 'Patient Experience';

    let storyToSave: PatientStory;

    if (isEdit) {
      const existing = stories.find((s) => s.id === storyData.id)!;
      storyToSave = {
        ...existing,
        ...storyData,
        patientName: name,
        patientDisplayName: name,
        patientNameBn: nameBn,
        patientDisplayNameBn: nameBn,
        story: text,
        quote: text,
        storyBn: textBn,
        quoteBn: textBn,
        doctorId: relatedDoc,
        relatedDoctorId: relatedDoc,
        serviceId: relatedSrv,
        relatedServiceId: relatedSrv,
        careTag: tag,
        tag: tag,
        updatedAt: new Date().toISOString()
      };
      const updatedList = stories.map((s) => (s.id === storyToSave.id ? storyToSave : s));
      saveToStorage(STORAGE_KEYS.PATIENT_STORIES, updatedList);
      recordAudit(adminUser, 'PATIENT_STORY_UPDATED', 'PatientStory', storyToSave.id, storyToSave.patientName, 'Updated patient story');
    } else {
      const maxOrder = stories.reduce((max, s) => Math.max(max, s.displayOrder || 0), 0);
      storyToSave = {
        id: `story-${Date.now()}`,
        patientName: name,
        patientDisplayName: name,
        patientNameBn: nameBn,
        patientDisplayNameBn: nameBn,
        photoUrl: storyData.photoUrl || '',
        story: text,
        quote: text,
        storyBn: textBn,
        quoteBn: textBn,
        doctorId: relatedDoc,
        relatedDoctorId: relatedDoc,
        serviceId: relatedSrv,
        relatedServiceId: relatedSrv,
        careTag: tag,
        tag: tag,
        rating: storyData.rating || 5,
        published: storyData.published !== undefined ? storyData.published : true,
        displayOrder: storyData.displayOrder || maxOrder + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedList = [...stories, storyToSave];
      saveToStorage(STORAGE_KEYS.PATIENT_STORIES, updatedList);
      recordAudit(adminUser, 'PATIENT_STORY_CREATED', 'PatientStory', storyToSave.id, storyToSave.patientName, 'Created authentic patient story');
    }

    notifyDataChange('PatientStory');
    return storyToSave;
  },

  togglePatientStoryPublish(storyId: string, adminUser: AdminUser) {
    const stories = this.getAllPatientStories();
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    story.published = !story.published;
    story.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.PATIENT_STORIES, stories);
    recordAudit(adminUser, story.published ? 'PATIENT_STORY_PUBLISHED' : 'PATIENT_STORY_HIDDEN', 'PatientStory', story.id, story.patientDisplayName, `Published state changed to ${story.published}`);
    notifyDataChange('PatientStory');
  },

  deletePatientStory(storyId: string, adminUser: AdminUser) {
    const stories = this.getAllPatientStories();
    const story = stories.find((s) => s.id === storyId);
    const updated = stories.filter((s) => s.id !== storyId);
    saveToStorage(STORAGE_KEYS.PATIENT_STORIES, updated);
    recordAudit(adminUser, 'PATIENT_STORY_DELETED', 'PatientStory', storyId, story?.patientDisplayName, 'Archived/deleted patient story');
    notifyDataChange('PatientStory');
  },

  // --- GALLERY ---
  getAllGallery(): GalleryItem[] {
    return loadFromStorage<GalleryItem[]>(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  saveGalleryItem(itemData: Partial<GalleryItem> & { imageUrl: string; title: string; category: GalleryItem['category'] }, adminUser: AdminUser): GalleryItem {
    const items = this.getAllGallery();
    const isEdit = Boolean(itemData.id && items.some((i) => i.id === itemData.id));

    let itemToSave: GalleryItem;

    if (isEdit) {
      const existing = items.find((i) => i.id === itemData.id)!;
      itemToSave = {
        ...existing,
        ...itemData,
        updatedAt: new Date().toISOString()
      };
      const updated = items.map((i) => (i.id === itemToSave.id ? itemToSave : i));
      saveToStorage(STORAGE_KEYS.GALLERY, updated);
      recordAudit(adminUser, 'GALLERY_ITEM_UPDATED', 'Gallery', itemToSave.id, itemToSave.title, 'Updated gallery image details');
    } else {
      const maxOrder = items.reduce((max, i) => Math.max(max, i.displayOrder || 0), 0);
      itemToSave = {
        id: `gal-${Date.now()}`,
        imageUrl: itemData.imageUrl,
        title: itemData.title,
        caption: itemData.caption || '',
        category: itemData.category,
        altText: itemData.altText || itemData.title,
        displayOrder: itemData.displayOrder || maxOrder + 1,
        published: itemData.published !== undefined ? itemData.published : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...items, itemToSave];
      saveToStorage(STORAGE_KEYS.GALLERY, updated);
      recordAudit(adminUser, 'GALLERY_ITEM_CREATED', 'Gallery', itemToSave.id, itemToSave.title, 'Uploaded/added gallery item');
    }

    notifyDataChange('Gallery');
    return itemToSave;
  },

  toggleGalleryPublish(itemId: string, adminUser: AdminUser) {
    const items = this.getAllGallery();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    item.published = !item.published;
    item.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.GALLERY, items);
    recordAudit(adminUser, item.published ? 'GALLERY_ITEM_PUBLISHED' : 'GALLERY_ITEM_HIDDEN', 'Gallery', item.id, item.title, `Published state changed to ${item.published}`);
    notifyDataChange('Gallery');
  },

  deleteGalleryItem(itemId: string, adminUser: AdminUser) {
    const items = this.getAllGallery();
    const item = items.find((i) => i.id === itemId);
    const updated = items.filter((i) => i.id !== itemId);
    saveToStorage(STORAGE_KEYS.GALLERY, updated);
    recordAudit(adminUser, 'GALLERY_ITEM_DELETED', 'Gallery', itemId, item?.title, 'Removed gallery image item');
    notifyDataChange('Gallery');
  },

  // --- FAQS ---
  getAllFAQs(): FAQ[] {
    return loadFromStorage<FAQ[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  saveFAQ(faqData: Partial<FAQ> & { question: string; answer: string; category: FAQ['category'] }, adminUser: AdminUser): FAQ {
    const faqs = this.getAllFAQs();
    const isEdit = Boolean(faqData.id && faqs.some((f) => f.id === faqData.id));

    let faqToSave: FAQ;

    if (isEdit) {
      const existing = faqs.find((f) => f.id === faqData.id)!;
      faqToSave = {
        ...existing,
        ...faqData,
        updatedAt: new Date().toISOString()
      };
      const updated = faqs.map((f) => (f.id === faqToSave.id ? faqToSave : f));
      saveToStorage(STORAGE_KEYS.FAQS, updated);
      recordAudit(adminUser, 'FAQ_UPDATED', 'FAQ', faqToSave.id, faqToSave.question.substring(0, 30), 'Updated FAQ content');
    } else {
      const maxOrder = faqs.reduce((max, f) => Math.max(max, f.displayOrder || 0), 0);
      faqToSave = {
        id: `faq-${Date.now()}`,
        question: faqData.question,
        questionBn: faqData.questionBn || '',
        answer: faqData.answer,
        answerBn: faqData.answerBn || '',
        category: faqData.category,
        published: faqData.published !== undefined ? faqData.published : true,
        displayOrder: faqData.displayOrder || maxOrder + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...faqs, faqToSave];
      saveToStorage(STORAGE_KEYS.FAQS, updated);
      recordAudit(adminUser, 'FAQ_CREATED', 'FAQ', faqToSave.id, faqToSave.question.substring(0, 30), 'Created FAQ');
    }

    notifyDataChange('FAQ');
    return faqToSave;
  },

  toggleFAQPublish(faqId: string, adminUser: AdminUser) {
    const faqs = this.getAllFAQs();
    const faq = faqs.find((f) => f.id === faqId);
    if (!faq) return;

    faq.published = !faq.published;
    faq.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.FAQS, faqs);
    recordAudit(adminUser, faq.published ? 'FAQ_PUBLISHED' : 'FAQ_HIDDEN', 'FAQ', faq.id, faq.question.substring(0, 30), `Published state changed to ${faq.published}`);
    notifyDataChange('FAQ');
  },

  deleteFAQ(faqId: string, adminUser: AdminUser) {
    const faqs = this.getAllFAQs();
    const faq = faqs.find((f) => f.id === faqId);
    const updated = faqs.filter((f) => f.id !== faqId);
    saveToStorage(STORAGE_KEYS.FAQS, updated);
    recordAudit(adminUser, 'FAQ_DELETED', 'FAQ', faqId, faq?.question.substring(0, 30), 'Deleted FAQ');
    notifyDataChange('FAQ');
  },

  // --- INSURANCE PARTNERS & SCHEMES ---
  getAllInsurancePartners(): InsurancePartner[] {
    return loadFromStorage<InsurancePartner[]>(STORAGE_KEYS.INSURANCE_PARTNERS, DEFAULT_INSURANCE_PARTNERS)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },

  getActiveInsurancePartners(): InsurancePartner[] {
    return this.getAllInsurancePartners().filter((p) => p.status === 'ACTIVE');
  },

  getInsurancePartnerById(id: string): InsurancePartner | undefined {
    return this.getAllInsurancePartners().find((p) => p.id === id);
  },

  saveInsurancePartner(
    partnerData: Partial<InsurancePartner> & { name: string; type: string },
    adminUser?: AdminUser | null
  ): InsurancePartner {
    const list = this.getAllInsurancePartners();
    const isEdit = Boolean(partnerData.id && list.some((p) => p.id === partnerData.id));

    let partnerToSave: InsurancePartner;

    if (isEdit) {
      const existing = list.find((p) => p.id === partnerData.id)!;
      partnerToSave = {
        ...existing,
        ...partnerData,
        updatedAt: new Date().toISOString()
      };
      const updated = list.map((p) => (p.id === partnerToSave.id ? partnerToSave : p));
      saveToStorage(STORAGE_KEYS.INSURANCE_PARTNERS, updated);
      recordAudit(adminUser || null, 'INSURANCE_PARTNER_UPDATED', 'InsurancePartner', partnerToSave.id, partnerToSave.name, 'Updated insurance partner details');
    } else {
      const maxOrder = list.reduce((max, p) => Math.max(max, p.displayOrder || 0), 0);
      partnerToSave = {
        id: `ins-${Date.now()}`,
        name: partnerData.name,
        nameBn: partnerData.nameBn || '',
        type: partnerData.type,
        typeBn: partnerData.typeBn || '',
        color: partnerData.color || 'from-slate-700 to-slate-900',
        logoUrl: partnerData.logoUrl || '',
        logoAssetId: partnerData.logoAssetId || '',
        cashlessAvailable: partnerData.cashlessAvailable !== undefined ? partnerData.cashlessAvailable : true,
        tpaInfo: partnerData.tpaInfo || '',
        displayOrder: partnerData.displayOrder || maxOrder + 1,
        status: partnerData.status || 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...list, partnerToSave];
      saveToStorage(STORAGE_KEYS.INSURANCE_PARTNERS, updated);
      recordAudit(adminUser || null, 'INSURANCE_PARTNER_CREATED', 'InsurancePartner', partnerToSave.id, partnerToSave.name, 'Added new insurance partner');
    }

    notifyDataChange('InsurancePartner');
    return partnerToSave;
  },

  toggleInsurancePartnerStatus(partnerId: string, adminUser?: AdminUser | null) {
    const list = this.getAllInsurancePartners();
    const partner = list.find((p) => p.id === partnerId);
    if (!partner) return;

    partner.status = partner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    partner.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.INSURANCE_PARTNERS, list);
    recordAudit(adminUser || null, 'INSURANCE_STATUS_TOGGLED', 'InsurancePartner', partner.id, partner.name, `Status set to ${partner.status}`);
    notifyDataChange('InsurancePartner');
  },

  deleteInsurancePartner(partnerId: string, adminUser?: AdminUser | null) {
    const list = this.getAllInsurancePartners();
    const partner = list.find((p) => p.id === partnerId);
    const updated = list.filter((p) => p.id !== partnerId);
    saveToStorage(STORAGE_KEYS.INSURANCE_PARTNERS, updated);
    recordAudit(adminUser || null, 'INSURANCE_PARTNER_DELETED', 'InsurancePartner', partnerId, partner?.name, 'Deleted insurance partner');
    notifyDataChange('InsurancePartner');
  },

  // --- APPOINTMENT REQUESTS (Website Queue Only - Non-ERP) ---
  getAllAppointmentRequests(): AppointmentRequest[] {
    return loadFromStorage<AppointmentRequest[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENT_REQUESTS);
  },

  async fetchAppointmentsFromApi(): Promise<AppointmentRequest[]> {
    try {
      const serverAppts = await apiClient.getAppointments();
      if (Array.isArray(serverAppts)) {
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, serverAppts);
        notifyDataChange('AppointmentRequest');
        return serverAppts;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] fetchAppointmentsFromApi notice:', err.message);
    }
    return loadFromStorage<AppointmentRequest[]>(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENT_REQUESTS);
  },

  createAppointmentRequest(request: AppointmentRequest): AppointmentRequest {
    const appointments = loadFromStorage<AppointmentRequest[]>(
      STORAGE_KEYS.APPOINTMENTS,
      DEFAULT_APPOINTMENT_REQUESTS
    );

    // Auto-resolve doctor/service names if missing
    let resolvedDoctorName = request.doctorName;
    if (!resolvedDoctorName && request.doctorId) {
      const doc = this.getAllDoctors().find((d) => d.id === request.doctorId);
      if (doc) resolvedDoctorName = doc.name;
    }

    let resolvedServiceName = request.serviceName;
    let resolvedServiceType = request.serviceType;
    if (request.serviceId) {
      const srv = this.getAllServices().find((s) => s.id === request.serviceId);
      if (srv) {
        if (!resolvedServiceName) resolvedServiceName = srv.name;
        if (!resolvedServiceType) resolvedServiceType = srv.serviceType;
      }
    }

    const resolvedBookingType = request.bookingType || (request.requestType === 'DOCTOR' ? 'DOCTOR_CONSULTATION' : (request.locationType === 'HOME' || request.serviceType === 'HOME' ? 'HOME_SERVICE' : 'CLINIC_SERVICE'));
    const resolvedServiceMode = request.serviceMode || (request.locationType === 'HOME' || request.serviceType === 'HOME' || resolvedBookingType === 'HOME_SERVICE' ? 'HOME' : 'CLINIC');
    const reqDate = request.requestedDate || request.preferredDate || '';
    const reqTime = request.requestedTimeWindow || request.preferredTime || '';
    const phoneVal = request.mobile || request.phone || request.patientPhone || '';
    const noteVal = request.patientNote || request.patientNotes || request.notes || request.reason || '';

    const normalizedRequest: AppointmentRequest = {
      ...request,
      bookingType: resolvedBookingType,
      serviceMode: resolvedServiceMode,
      locationType: resolvedServiceMode,
      requestedDate: reqDate,
      requestedTimeWindow: reqTime,
      preferredDate: reqDate,
      preferredTime: reqTime,
      doctorName: resolvedDoctorName,
      serviceName: resolvedServiceName,
      serviceType: resolvedServiceType,
      phone: phoneVal,
      mobile: phoneVal,
      patientPhone: phoneVal,
      email: request.email || request.patientEmail || '',
      patientEmail: request.patientEmail || request.email || '',
      address: request.address || '',
      area: request.area || '',
      landmark: request.landmark || '',
      notes: noteVal,
      patientNote: noteVal,
      patientNotes: noteVal,
      reason: noteVal,
      status: request.status || 'NEW',
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: request.updatedAt || new Date().toISOString()
    };

    const updated = [normalizedRequest, ...appointments];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);
    recordAudit(
      null,
      'APPOINTMENT_REQUEST_CREATED',
      'AppointmentRequest',
      normalizedRequest.id,
      normalizedRequest.patientName,
      `New website booking request submitted for ${normalizedRequest.requestedDate || normalizedRequest.preferredDate} (${normalizedRequest.requestedTimeWindow || normalizedRequest.preferredTime})`
    );
    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.createAppointment(normalizedRequest).then((persisted) => {
      if (persisted && persisted.id) {
        const currentList = loadFromStorage<AppointmentRequest[]>(STORAGE_KEYS.APPOINTMENTS, []);
        const idx = currentList.findIndex((a) => a.id === normalizedRequest.id || a.id === persisted.id);
        if (idx !== -1) {
          currentList[idx] = persisted;
        } else {
          currentList.unshift(persisted);
        }
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, currentList);
        notifyDataChange('AppointmentRequest');
      }
    }).catch((err) => {
      console.warn('[CareOn DAL] Server appointment creation note:', err.message);
    });

    return normalizedRequest;
  },

  updateAppointmentStatus(
    requestId: string,
    newStatus: AppointmentRequestStatus,
    adminNotes: string,
    adminUser: AdminUser
  ): AppointmentRequest | null {
    const requests = this.getAllAppointmentRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = newStatus;
    if (adminNotes !== undefined) {
      req.adminNotes = adminNotes;
    }
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, requests);
    recordAudit(
      adminUser,
      `APPOINTMENT_${newStatus}`,
      'AppointmentRequest',
      req.id,
      req.patientName,
      `Appointment request status set to ${newStatus}`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.updateAppointment(req.id, {
      status: newStatus,
      adminNotes
    }).catch((err) => {
      console.warn('[CareOn DAL] Server appointment status update note:', err.message);
    });

    return req;
  },

  confirmAppointment(
    requestId: string,
    confirmationData: {
      confirmedDate: string;
      confirmedTime: string;
      confirmedDoctorId?: string;
      confirmedDoctorName?: string;
      confirmedDepartment?: string;
      confirmedServiceId?: string;
      confirmedServiceName?: string;
      adminNotes?: string;
    },
    adminUser: AdminUser
  ): AppointmentRequest | null {
    const requests = this.getAllAppointmentRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    const previousStatus = req.status;
    const isReschedule = previousStatus === 'CONFIRMED' && (req.confirmedDate !== confirmationData.confirmedDate || req.confirmedTime !== confirmationData.confirmedTime);

    req.status = 'CONFIRMED';
    req.confirmedDate = confirmationData.confirmedDate;
    req.confirmedTime = confirmationData.confirmedTime;

    if (confirmationData.confirmedDoctorId !== undefined) req.confirmedDoctorId = confirmationData.confirmedDoctorId;
    if (confirmationData.confirmedDoctorName !== undefined) req.confirmedDoctorName = confirmationData.confirmedDoctorName;
    if (confirmationData.confirmedDepartment !== undefined) req.confirmedDepartment = confirmationData.confirmedDepartment;
    if (confirmationData.confirmedServiceId !== undefined) req.confirmedServiceId = confirmationData.confirmedServiceId;
    if (confirmationData.confirmedServiceName !== undefined) req.confirmedServiceName = confirmationData.confirmedServiceName;
    if (confirmationData.adminNotes !== undefined) req.adminNotes = confirmationData.adminNotes;

    req.confirmedAt = new Date().toISOString();
    req.confirmedBy = adminUser.name;
    if (isReschedule) {
      req.rescheduledAt = new Date().toISOString();
    }
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, requests);
    recordAudit(
      adminUser,
      isReschedule ? 'APPOINTMENT_RESCHEDULED' : 'APPOINTMENT_CONFIRMED',
      'AppointmentRequest',
      req.id,
      req.patientName,
      isReschedule
        ? `Rescheduled to ${confirmationData.confirmedDate} at ${confirmationData.confirmedTime}`
        : `Confirmed appointment for ${confirmationData.confirmedDate} at ${confirmationData.confirmedTime}`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.updateAppointment(req.id, {
      status: 'CONFIRMED',
      confirmedDate: confirmationData.confirmedDate,
      confirmedTime: confirmationData.confirmedTime,
      confirmedDoctorId: confirmationData.confirmedDoctorId,
      confirmedDoctorName: confirmationData.confirmedDoctorName,
      confirmedDepartment: confirmationData.confirmedDepartment,
      confirmedServiceId: confirmationData.confirmedServiceId,
      confirmedServiceName: confirmationData.confirmedServiceName,
      adminNotes: confirmationData.adminNotes
    }).catch((err) => {
      console.warn('[CareOn DAL] Server appointment confirmation note:', err.message);
    });

    return req;
  },

  async confirmAppointmentAsync(
    requestId: string,
    confirmationData: {
      confirmedDate: string;
      confirmedTime: string;
      confirmedDoctorId?: string;
      confirmedDoctorName?: string;
      confirmedDepartment?: string;
      confirmedServiceId?: string;
      confirmedServiceName?: string;
      adminNotes?: string;
    },
    adminUser: AdminUser
  ): Promise<AppointmentRequest | null> {
    const localUpdated = this.confirmAppointment(requestId, confirmationData, adminUser);
    if (!localUpdated) return null;

    try {
      const persisted = await apiClient.updateAppointment(requestId, {
        status: 'CONFIRMED',
        confirmedDate: confirmationData.confirmedDate,
        confirmedTime: confirmationData.confirmedTime,
        confirmedDoctorId: confirmationData.confirmedDoctorId,
        confirmedDoctorName: confirmationData.confirmedDoctorName,
        confirmedDepartment: confirmationData.confirmedDepartment,
        confirmedServiceId: confirmationData.confirmedServiceId,
        confirmedServiceName: confirmationData.confirmedServiceName,
        adminNotes: confirmationData.adminNotes
      });
      if (persisted) {
        const freshList = this.getAllAppointmentRequests();
        const idx = freshList.findIndex((r) => r.id === requestId);
        if (idx !== -1) {
          freshList[idx] = persisted;
          saveToStorage(STORAGE_KEYS.APPOINTMENTS, freshList);
        }
        return persisted;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] confirmAppointmentAsync server note:', err.message);
    }
    return localUpdated;
  },

  async updateAppointmentDetails(
    requestId: string,
    updates: Partial<AppointmentRequest>,
    adminUser: AdminUser
  ): Promise<AppointmentRequest | null> {
    const requests = this.getAllAppointmentRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    Object.assign(req, updates);
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, requests);
    recordAudit(
      adminUser,
      'APPOINTMENT_UPDATED',
      'AppointmentRequest',
      req.id,
      req.patientName,
      `Updated appointment details: ${updates.confirmedDoctorName ? `Doctor: ${updates.confirmedDoctorName}` : ''} ${updates.status || ''}`.trim()
    );

    notifyDataChange('AppointmentRequest');

    try {
      const persisted = await apiClient.updateAppointment(req.id, updates);
      if (persisted) {
        const freshList = this.getAllAppointmentRequests();
        const idx = freshList.findIndex((r) => r.id === req.id);
        if (idx !== -1) {
          freshList[idx] = persisted;
          saveToStorage(STORAGE_KEYS.APPOINTMENTS, freshList);
        }
        return persisted;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] updateAppointmentDetails server sync note:', err.message);
    }

    return req;
  },

  markAppointmentContacted(
    requestId: string,
    adminNotes: string | undefined,
    adminUser: AdminUser
  ): AppointmentRequest | null {
    const requests = this.getAllAppointmentRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = 'CONTACTED';
    req.contactedAt = new Date().toISOString();
    req.contactedBy = adminUser.name;
    if (adminNotes !== undefined) {
      req.adminNotes = adminNotes;
    }
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, requests);
    recordAudit(
      adminUser,
      'APPOINTMENT_CONTACTED',
      'AppointmentRequest',
      req.id,
      req.patientName,
      `Patient contacted via phone/WhatsApp for intake verification`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.updateAppointment(req.id, {
      status: 'CONTACTED',
      adminNotes
    }).catch((err) => {
      console.warn('[CareOn DAL] Server appointment contacted status note:', err.message);
    });

    return req;
  },

  cancelAppointment(
    requestId: string,
    cancellationReason: string,
    adminNotes: string | undefined,
    adminUser: AdminUser
  ): AppointmentRequest | null {
    const requests = this.getAllAppointmentRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = 'CANCELLED';
    req.cancellationReason = cancellationReason;
    req.cancelledAt = new Date().toISOString();
    req.cancelledBy = adminUser.name;
    if (adminNotes !== undefined) {
      req.adminNotes = adminNotes;
    }
    req.updatedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.APPOINTMENTS, requests);
    recordAudit(
      adminUser,
      'APPOINTMENT_CANCELLED',
      'AppointmentRequest',
      req.id,
      req.patientName,
      `Appointment cancelled: ${cancellationReason || 'Patient requested cancellation'}`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously persist to Supabase PostgreSQL database
    apiClient.updateAppointment(req.id, {
      status: 'CANCELLED',
      cancellationReason,
      adminNotes
    }).catch((err) => {
      console.warn('[CareOn DAL] Server appointment cancellation note:', err.message);
    });

    return req;
  },

  deleteAppointmentRequest(
    requestId: string,
    adminUser?: AdminUser | null
  ): boolean {
    const requests = this.getAllAppointmentRequests();
    const target = requests.find((r) => r.id === requestId);
    const updated = requests.filter((r) => r.id !== requestId);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, updated);

    recordAudit(
      adminUser || null,
      'APPOINTMENT_DELETED',
      'AppointmentRequest',
      requestId,
      target?.patientName || requestId,
      `Permanently deleted appointment request ${requestId}`
    );

    notifyDataChange('AppointmentRequest');

    // Asynchronously delete from Supabase PostgreSQL database
    apiClient.deleteAppointment(requestId).catch((err) => {
      console.warn('[CareOn DAL] Server appointment deletion note:', err.message);
    });

    return true;
  },

  recordWhatsAppInitiated(
    requestId: string,
    patientName: string,
    patientPhone: string,
    messageType: string,
    adminUser: AdminUser
  ) {
    recordAudit(
      adminUser,
      'WHATSAPP_CONFIRMATION_INITIATED',
      'AppointmentRequest',
      requestId,
      patientName,
      `WhatsApp click-to-chat initiated for ${patientPhone} (${messageType})`
    );
  },

  // --- MEDIA ASSETS ---
  getAllMediaAssets(): MediaAsset[] {
    const deletedIds = new Set(loadFromStorage<string[]>(STORAGE_KEYS.DELETED_MEDIA_IDS, []));
    const stored = loadFromStorage<MediaAsset[] | null>(STORAGE_KEYS.MEDIA_ASSETS, null);
    
    // If assets have already been stored/synced from server, use them as authoritative source
    const rawList: MediaAsset[] =
      stored !== null
        ? stored
        : [...PROJECT_ASSETS_MANIFEST, ...DEFAULT_MEDIA_ASSETS];
    
    const assetMap = new Map<string, MediaAsset>();
    rawList.forEach((a) => {
      const isDeleted =
        deletedIds.has(a.id) ||
        (a.fileName && deletedIds.has(a.fileName)) ||
        (a.storageKey && deletedIds.has(a.storageKey));
      if (!isDeleted) {
        assetMap.set(a.id, a);
      }
    });

    return Array.from(assetMap.values())
      .filter(
        (a) =>
          !deletedIds.has(a.id) &&
          (!a.fileName || !deletedIds.has(a.fileName)) &&
          (!a.storageKey || !deletedIds.has(a.storageKey))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async syncMediaAssetsWithServer(): Promise<MediaAsset[]> {
    try {
      const serverAssets = await apiClient.getAssets();
      if (Array.isArray(serverAssets)) {
        saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, serverAssets);
        notifyDataChange('MediaAsset');
        return serverAssets;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] syncMediaAssetsWithServer warning:', err.message);
    }
    return this.getAllMediaAssets();
  },

  getMediaAssetById(id: string): MediaAsset | undefined {
    return this.getAllMediaAssets().find((a) => a.id === id);
  },

  saveMediaAsset(asset: MediaAsset, adminUser?: AdminUser | null, isUpdate = false): MediaAsset {
    const assets = this.getAllMediaAssets();
    const existingIndex = assets.findIndex((a) => a.id === asset.id);

    let updatedList: MediaAsset[];
    if (existingIndex >= 0) {
      updatedList = assets.map((a) => (a.id === asset.id ? asset : a));
    } else {
      updatedList = [asset, ...assets];
    }

    saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, updatedList);

    recordAudit(
      adminUser || null,
      isUpdate ? 'MEDIA_REPLACED' : existingIndex >= 0 ? 'MEDIA_UPDATED' : 'MEDIA_UPLOADED',
      'MediaAsset',
      asset.id,
      asset.fileName,
      `${isUpdate ? 'Replaced file content' : 'Registered asset'} in category ${asset.category} (${asset.mimeType}, ${Math.round(asset.fileSize / 1024)} KB)`
    );

    notifyDataChange('MediaAsset');
    return asset;
  },

  archiveMediaAsset(id: string, adminUser?: AdminUser | null): MediaAsset | undefined {
    const assets = this.getAllMediaAssets();
    const asset = assets.find((a) => a.id === id);
    if (!asset) return undefined;

    asset.status = 'ARCHIVED';
    asset.updatedAt = new Date().toISOString();
    if (adminUser) asset.updatedBy = adminUser.email;

    saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, assets);
    recordAudit(
      adminUser || null,
      'MEDIA_ARCHIVED',
      'MediaAsset',
      asset.id,
      asset.fileName,
      `Asset archived. It will no longer appear in default media pickers.`
    );
    notifyDataChange('MediaAsset');
    return asset;
  },

  unarchiveMediaAsset(id: string, adminUser?: AdminUser | null): MediaAsset | undefined {
    const assets = this.getAllMediaAssets();
    const asset = assets.find((a) => a.id === id);
    if (!asset) return undefined;

    asset.status = 'ACTIVE';
    asset.updatedAt = new Date().toISOString();
    if (adminUser) asset.updatedBy = adminUser.email;

    saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, assets);
    recordAudit(
      adminUser || null,
      'MEDIA_RESTORED',
      'MediaAsset',
      asset.id,
      asset.fileName,
      `Asset restored to ACTIVE status.`
    );
    notifyDataChange('MediaAsset');
    return asset;
  },

  deleteMediaAsset(
    id: string,
    adminUser?: AdminUser | null,
    force = false
  ): { success: boolean; error?: string } {
    const assets = this.getAllMediaAssets();
    const asset =
      assets.find((a) => a.id === id || a.fileName === id || a.storageKey === id) ||
      PROJECT_ASSETS_MANIFEST.find((a) => a.id === id || a.fileName === id || a.storageKey === id) ||
      DEFAULT_MEDIA_ASSETS.find((a) => a.id === id || a.fileName === id || a.storageKey === id);

    if (asset && !force) {
      const usage = this.getAssetUsage(asset.id);
      if (usage.length > 0) {
        const names = usage.map((u) => `${u.type}: ${u.name}`).join(', ');
        return {
          success: false,
          error: `Asset is referenced by active content: ${names}. Remove or replace references before deleting.`
        };
      }
    }

    // Persistently blacklist asset id, filename, and storageKey
    const deletedIds = loadFromStorage<string[]>(STORAGE_KEYS.DELETED_MEDIA_IDS, []);
    const keysToAdd = [id, asset?.id, asset?.fileName, asset?.storageKey].filter(Boolean) as string[];
    for (const k of keysToAdd) {
      if (!deletedIds.includes(k)) deletedIds.push(k);
    }
    saveToStorage(STORAGE_KEYS.DELETED_MEDIA_IDS, deletedIds);

    const updated = assets.filter(
      (a) =>
        a.id !== id &&
        (!asset || (a.id !== asset.id && a.fileName !== asset.fileName && a.storageKey !== asset.storageKey))
    );
    saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, updated);

    recordAudit(
      adminUser || null,
      'MEDIA_DELETED',
      'MediaAsset',
      id,
      asset?.fileName || id,
      `Permanently deleted asset ${asset?.fileName || id} (${asset?.category || 'DOCTOR'})`
    );

    notifyDataChange('MediaAsset');
    return { success: true };
  },

  getAssetUsage(assetId: string): { type: string; name: string; id: string }[] {
    const usage: { type: string; name: string; id: string }[] = [];

    // Check Doctors
    const doctors = this.getAllDoctors();
    for (const doc of doctors) {
      if (doc.profilePhotoAssetId === assetId || doc.photoUrl === assetId || doc.profilePhotoUrl === assetId) {
        usage.push({ type: 'Doctor Profile Photo', name: doc.name, id: doc.id });
      }
    }

    // Check Settings / Brand
    const settings = this.getWebsiteSettings();
    if (settings.logoAssetId === assetId || settings.brand?.logoAssetId === assetId) {
      usage.push({ type: 'Clinic Brand Logo', name: 'Website Header & Footer', id: 'settings-root' });
    }
    if (settings.faviconAssetId === assetId || settings.brand?.faviconAssetId === assetId) {
      usage.push({ type: 'Browser Favicon', name: 'Browser Tab Icon', id: 'settings-root' });
    }

    // Check Gallery
    const gallery = this.getAllGallery();
    for (const item of gallery) {
      if (item.imageUrl === assetId) {
        usage.push({ type: 'Gallery Image', name: item.title, id: item.id });
      }
    }

    // Check Departments
    const departments = this.getAllDepartments();
    for (const dept of departments) {
      if (dept.imageUrl === assetId) {
        usage.push({ type: 'Department Cover', name: dept.name, id: dept.id });
      }
    }

    return usage;
  },

  // --- BRAND SETTINGS ---
  getBrandSettings(): BrandSettings {
    const settings = this.getWebsiteSettings();
    return (
      settings.brand || {
        logoUrl: settings.logoUrl || '',
        logoAssetId: settings.logoAssetId || '',
        logoAlt: settings.logoAlt || 'CareOn Medical Clinic - Caring Beyond Treatment',
        faviconUrl: settings.faviconUrl || '',
        faviconAssetId: settings.faviconAssetId || '',
        updatedAt: new Date().toISOString()
      }
    );
  },

  saveBrandSettings(brand: BrandSettings, adminUser?: AdminUser | null): BrandSettings {
    const settings = this.getWebsiteSettings();
    const prevLogoUrl = settings.brand?.logoUrl || settings.logoUrl || '';
    const newLogoUrl = brand.logoUrl || '';

    const prevFaviconUrl = settings.brand?.faviconUrl || settings.faviconUrl || '';
    const newFaviconUrl = brand.faviconUrl || '';

    const updatedSettings: WebsiteSettings = {
      ...settings,
      brand: {
        ...brand,
        updatedAt: new Date().toISOString(),
        updatedBy: adminUser?.email || 'system'
      },
      logoUrl: brand.logoUrl !== undefined ? brand.logoUrl : settings.logoUrl,
      logoAssetId: brand.logoAssetId !== undefined ? brand.logoAssetId : settings.logoAssetId,
      logoAlt: brand.logoAlt !== undefined ? brand.logoAlt : settings.logoAlt,
      faviconUrl: brand.faviconUrl !== undefined ? brand.faviconUrl : settings.faviconUrl,
      faviconAssetId: brand.faviconAssetId !== undefined ? brand.faviconAssetId : settings.faviconAssetId
    };

    saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);

    // Audit logs for Logo
    if (newLogoUrl && !prevLogoUrl) {
      recordAudit(
        adminUser || null,
        'LOGO_UPLOADED',
        'BrandSettings',
        brand.logoAssetId || 'brand-logo',
        'CareOn Clinic Logo',
        'Official clinic brand logo uploaded and activated across all public and admin pages.'
      );
    } else if (newLogoUrl && prevLogoUrl && newLogoUrl !== prevLogoUrl) {
      recordAudit(
        adminUser || null,
        'LOGO_REPLACED',
        'BrandSettings',
        brand.logoAssetId || 'brand-logo',
        'CareOn Clinic Logo',
        'Official clinic brand logo replaced with updated asset.'
      );
    } else if (!newLogoUrl && prevLogoUrl) {
      recordAudit(
        adminUser || null,
        'LOGO_REMOVED',
        'BrandSettings',
        'brand-logo',
        'CareOn Clinic Logo',
        'Official clinic brand logo removed; reverted to default vector brandmark.'
      );
    }

    // Audit logs for Favicon
    if (newFaviconUrl !== prevFaviconUrl) {
      recordAudit(
        adminUser || null,
        'FAVICON_UPDATED',
        'BrandSettings',
        brand.faviconAssetId || 'brand-favicon',
        'Browser Favicon',
        newFaviconUrl
          ? 'Browser tab favicon updated with custom brandmark asset.'
          : 'Browser tab favicon reset to default CareOn vector emblem.'
      );
    }

    notifyDataChange('WebsiteSettings');
    return updatedSettings.brand!;
  },

  // --- SETTINGS ---
  saveWebsiteSettings(settings: WebsiteSettings, adminUser?: AdminUser | null): WebsiteSettings {
    const existing = this.getWebsiteSettings();
    const prevLogo = existing.brand?.logoUrl || existing.logoUrl || '';
    const nextLogo = settings.brand?.logoUrl !== undefined ? settings.brand.logoUrl : settings.logoUrl || '';

    const prevFavicon = existing.brand?.faviconUrl || existing.faviconUrl || '';
    const nextFavicon = settings.brand?.faviconUrl !== undefined ? settings.brand.faviconUrl : settings.faviconUrl || '';

    const updatedSettings: WebsiteSettings = {
      ...settings,
      brand: settings.brand || {
        logoUrl: settings.logoUrl || existing.logoUrl,
        logoAssetId: settings.logoAssetId || existing.logoAssetId,
        logoAlt: settings.logoAlt || existing.logoAlt || 'CareOn Medical Clinic — Caring Beyond Treatment',
        faviconUrl: settings.faviconUrl || existing.faviconUrl,
        faviconAssetId: settings.faviconAssetId || existing.faviconAssetId
      }
    };

    saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
    recordAudit(adminUser || null, 'WEBSITE_SETTINGS_SAVED', 'WebsiteSettings', 'settings-root', 'Master Clinic Settings', 'Updated website info & announcement banner');

    if (nextLogo && !prevLogo) {
      recordAudit(adminUser || null, 'LOGO_UPLOADED', 'BrandSettings', updatedSettings.brand?.logoAssetId || 'brand-logo', 'CareOn Clinic Logo', 'Official clinic brand logo uploaded.');
    } else if (nextLogo && prevLogo && nextLogo !== prevLogo) {
      recordAudit(adminUser || null, 'LOGO_REPLACED', 'BrandSettings', updatedSettings.brand?.logoAssetId || 'brand-logo', 'CareOn Clinic Logo', 'Official clinic brand logo replaced.');
    } else if (!nextLogo && prevLogo) {
      recordAudit(adminUser || null, 'LOGO_REMOVED', 'BrandSettings', 'brand-logo', 'CareOn Clinic Logo', 'Official clinic brand logo removed.');
    }

    if (nextFavicon !== prevFavicon) {
      recordAudit(adminUser || null, 'FAVICON_UPDATED', 'BrandSettings', updatedSettings.brand?.faviconAssetId || 'brand-favicon', 'Browser Favicon', 'Browser tab favicon updated.');
    }

    notifyDataChange('WebsiteSettings');

    // Asynchronously push to Supabase PostgreSQL site_settings table
    apiClient.updateSettings(updatedSettings).catch((err) => {
      console.warn('[CareOn DAL] Background settings sync note:', err.message);
    });

    return updatedSettings;
  },

  async fetchWebsiteSettingsFromApi(): Promise<WebsiteSettings> {
    try {
      const serverSettings = await apiClient.getSettings();
      if (serverSettings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, serverSettings);
        notifyDataChange('WebsiteSettings');
        return serverSettings;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] fetchWebsiteSettingsFromApi note:', err.message);
    }
    return this.getWebsiteSettings();
  },

  async saveWebsiteSettingsAsync(settings: WebsiteSettings, adminUser?: AdminUser | null): Promise<WebsiteSettings> {
    const updated = this.saveWebsiteSettings(settings, adminUser);
    try {
      const serverSettings = await apiClient.updateSettings(settings);
      if (serverSettings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, serverSettings);
        notifyDataChange('WebsiteSettings');
        return serverSettings;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] saveWebsiteSettingsAsync server error:', err.message);
      throw err;
    }
    return updated;
  },

  async saveSectionMediaAsync(sectionMedia: SectionMediaSettings, adminUser?: AdminUser | null): Promise<WebsiteSettings> {
    const current = this.getWebsiteSettings();
    const updatedSettings: WebsiteSettings = {
      ...current,
      sectionMedia
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
    recordAudit(
      adminUser || null,
      'SECTION_MEDIA_SAVED',
      'WebsiteSettings',
      'section-media',
      'Hero & Section Visuals',
      'Updated section visual images for website'
    );
    notifyDataChange('WebsiteSettings');

    try {
      const serverSettings = await apiClient.updateSectionMedia(sectionMedia);
      if (serverSettings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, serverSettings);
        notifyDataChange('WebsiteSettings');
        return serverSettings;
      }
    } catch (err: any) {
      console.warn('[CareOn DAL] saveSectionMediaAsync server error:', err.message);
      throw err;
    }
    return updatedSettings;
  },

  updateWebsiteSettings(settings: WebsiteSettings, adminUser?: AdminUser | null): WebsiteSettings {
    return this.saveWebsiteSettings(settings, adminUser);
  },

  saveSEOSettings(seo: SEOSettings, adminUser?: AdminUser | null): SEOSettings {
    saveToStorage(STORAGE_KEYS.SEO, seo);
    recordAudit(adminUser || null, 'SEO_SETTINGS_SAVED', 'SEOSettings', 'seo-root', 'SEO Meta Settings', 'Updated site title, meta description & keywords');
    notifyDataChange('SEOSettings');
    return seo;
  },

  updateSEOSettings(seo: SEOSettings, adminUser?: AdminUser | null): SEOSettings {
    return this.saveSEOSettings(seo, adminUser);
  },

  // --- AUDIT LOGS ---
  getAuditLogs(): AuditLog[] {
    return loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
  },

  // --- AUTOMATIC PURGE OF OBSOLETE LEGACY KEYS & STORAGE VALIDATION ---
  autoRecoverClientDoctorRecords(): Doctor[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];

    try {
      // Remove only obsolete deprecated keys to avoid resurrecting demo doctors
      const legacyKeys = [
        'careon_doctors',
        'careon_doctors_backup',
        'careon_custom_doctors',
        'careon_admin_doctors',
        'doctors'
      ];
      legacyKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      });

      const currentInStorage = loadFromStorage<Doctor[]>(STORAGE_KEYS.DOCTORS, []);
      const realOnly = currentInStorage.filter(
        (doc: any) =>
          doc &&
          typeof doc === 'object' &&
          doc.name &&
          typeof doc.name === 'string' &&
          !['Dr. Arindam Banerjee', 'Dr. Sarmistha Mukherjee', 'Dr. Debabrata Roy', 'Dr. Nandini Sengupta'].includes(doc.name.trim()) &&
          !['doc-01', 'doc-02', 'doc-03', 'doc-04'].includes(doc.id) &&
          !doc.serviceType &&
          !doc.category &&
          doc.departmentId
      );

      if (realOnly.length !== currentInStorage.length) {
        saveToStorage(STORAGE_KEYS.DOCTORS, realOnly);
      }
      return realOnly;
    } catch {
      return [];
    }
  },

  // --- SERVER & DATA SYNCHRONIZATION ---
  async syncWithServer() {
    try {
      this.autoRecoverClientDoctorRecords();

      const data = await apiClient.getAllData();
      if (data && Array.isArray(data.doctors)) {
        const DEMO_NAMES = [
          'Dr. Arindam Banerjee',
          'Dr. Sarmistha Mukherjee',
          'Dr. Debabrata Roy',
          'Dr. Nandini Sengupta'
        ];
        const DEMO_IDS = ['doc-01', 'doc-02', 'doc-03', 'doc-04'];
        const cleanDoctors = data.doctors.filter(
          (d: any) =>
            d &&
            d.name &&
            typeof d.name === 'string' &&
            !DEMO_NAMES.includes(d.name.trim()) &&
            !DEMO_IDS.includes(d.id) &&
            !d.serviceType &&
            !d.category &&
            d.departmentId
        );
        runtimeDoctorCache = cleanDoctors;
        saveToStorage(STORAGE_KEYS.DOCTORS, cleanDoctors);
      }
      if (Array.isArray(data.departments) && data.departments.length > 0) {
        saveToStorage(STORAGE_KEYS.DEPARTMENTS, data.departments);
      }
      if (Array.isArray(data.services) && data.services.length > 0) {
        saveToStorage(STORAGE_KEYS.SERVICES, data.services);
      }
      if (data.settings && typeof data.settings === 'object') {
        saveToStorage(STORAGE_KEYS.SETTINGS, data.settings);
      }
      notifyDataChange('ServerSync');
    } catch (err) {
      console.warn('Production server sync note:', err);
    }
  },

  // Reset to verified demo seeds (Preserves doctor registry)
  resetToDefaults(adminUser: AdminUser) {
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, DEFAULT_DEPARTMENTS);
    saveToStorage(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
    saveToStorage(STORAGE_KEYS.PATIENT_STORIES, DEFAULT_PATIENT_STORIES);
    saveToStorage(STORAGE_KEYS.GALLERY, DEFAULT_GALLERY);
    saveToStorage(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, DEFAULT_APPOINTMENT_REQUESTS);
    saveToStorage(STORAGE_KEYS.SETTINGS, DEFAULT_WEBSITE_SETTINGS);
    saveToStorage(STORAGE_KEYS.SEO, DEFAULT_SEO_SETTINGS);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS);
    saveToStorage(STORAGE_KEYS.MEDIA_ASSETS, DEFAULT_MEDIA_ASSETS);
    saveToStorage(STORAGE_KEYS.INSURANCE_PARTNERS, DEFAULT_INSURANCE_PARTNERS);

    recordAudit(adminUser, 'SYSTEM_RESET_TO_VERIFIED_DEFAULTS', 'WebsiteSettings', 'system', 'Database', 'Admin triggered reset to default seed records');
    notifyDataChange('All');
  }
};
