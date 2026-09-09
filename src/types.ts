// Navigation & Presentation Types
export interface NavItem {
  label: string;
  href: string;
  isCTA?: boolean;
  isWhatsApp?: boolean;
}

export interface ColorToken {
  name: string;
  role: string;
  hex: string;
  rgb: string;
  contrastOnWhite: string;
  contrastOnDark: string;
  usage: string;
}

export interface TypeScaleToken {
  level: string;
  size: string;
  lineHeight: string;
  weight: string;
  tracking: string;
  usage: string;
  sampleEn: string;
  sampleBn: string;
}

export interface WireframeSection {
  id: string;
  title: string;
  brandFocus: string;
  patientQuestion: string;
  keyElements: string[];
  notes: string;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  timeline: string;
  status: 'current' | 'upcoming' | 'planned';
  deliverables: string[];
  deliverableCategory: string;
}

// ----------------------------------------------------
// PHASE 03: CONTENT DATABASE & ADMIN SCHEMAS
// ----------------------------------------------------

export type ContentStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type AdminRole = 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl?: string;
}

// Department Model
export interface Department {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  shortDescription: string;
  shortDescriptionBn?: string;
  description: string;
  descriptionBn?: string;
  imageUrl?: string;
  icon?: string;
  featured: boolean;
  displayOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Media Asset Category & Model
export type MediaCategory =
  | 'DOCTOR'
  | 'BRAND'
  | 'FAVICON'
  | 'GALLERY'
  | 'SERVICE'
  | 'DEPARTMENT'
  | 'OTHER';

export type MediaAssetStatus = 'ACTIVE' | 'ARCHIVED';

export interface MediaAsset {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  category: MediaCategory;
  url: string;
  storageKey: string;
  width?: number;
  height?: number;
  fileSize: number;
  altText: string;
  status: MediaAssetStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version?: number;
}

// Brand Settings Model
export interface BrandSettings {
  logoUrl?: string;
  logoAssetId?: string;
  logoAlt?: string;
  faviconUrl?: string;
  faviconAssetId?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Doctor Schedule Models
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DoctorWeeklyScheduleSlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  location?: string;
  isActive: boolean;
}

export type ScheduleRecurrenceType =
  | 'WEEKLY'
  | 'EVERY_15_DAYS'
  | 'INTERVAL_DAYS'
  | 'MONTHLY'
  | 'MONTHLY_SPECIFIC_DAYS'
  | 'SPECIFIC_DATE'
  | 'SPECIFIC_DATES'
  | 'SPECIAL_CHAMBER';

export type MonthlyOccurrence = 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST';

export interface DoctorCustomSchedule {
  id: string;
  title?: string;
  scheduleType?: ScheduleRecurrenceType;
  recurrenceType: ScheduleRecurrenceType;
  specificDate?: string; // 'YYYY-MM-DD'
  specificDates?: string[]; // 'YYYY-MM-DD'
  startDate?: string; // 'YYYY-MM-DD' for interval
  intervalDays?: number; // e.g. 15
  monthlyRule?: 'NTH_DAY_OF_WEEK' | 'DAY_OF_MONTH';
  monthlyOccurrence?: MonthlyOccurrence;
  monthlyDayOfWeek?: DayOfWeek;
  monthlyDaysOfMonth?: number[]; // e.g. [5, 20]
  dayOfWeek?: DayOfWeek;
  effectiveFrom?: string;
  effectiveUntil?: string;
  startTime: string;
  endTime: string;
  location?: string;
  roomNumber?: string;
  chamber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED';
  note?: string;
  notes?: string;
}

export interface DoctorScheduleException {
  id: string;
  date: string; // 'YYYY-MM-DD'
  exceptionType: 'CANCELLED' | 'RESCHEDULED' | 'HOLIDAY' | 'NOT_AVAILABLE' | 'SPECIAL_HOURS';
  reason?: string;
  replacementDate?: string; // 'YYYY-MM-DD'
  replacementStartTime?: string;
  replacementEndTime?: string;
  location?: string;
  note?: string;
}

export interface DoctorScheduleItem {
  id?: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

// Doctor Model
export interface DoctorFees {
  newPatient?: number;
  followUp?: number;
  emergency?: number;
  telemedicine?: number;
  other?: number;
}

export interface Doctor {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  photoUrl: string;
  profilePhotoUrl?: string;
  profilePhotoAssetId?: string;
  photoAssetId?: string;
  profilePhotoAlt?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  departmentId: string;
  departmentName?: string;
  specialtyId?: string;
  designation: string;
  doctorType?: string;
  qualification: string;
  registrationNumber?: string;
  experienceYears?: number | string;
  schedules?: DoctorScheduleItem[];
  chamberId?: string;
  chamberCustom?: string;
  serviceIds?: string[];
  serviceNames?: string[];
  consultationFee?: number;
  followUpFee?: number;
  emergencyFee?: number;
  telemedicineFee?: number;
  otherServiceFee?: number;
  fees?: DoctorFees;
  appointmentDuration?: number;
  bufferTime?: number;
  maxAppointmentsPerSlot?: number;
  active?: boolean;
  published?: boolean;
  shortBio?: string;
  areasOfExpertise?: string[];
  consultationDays?: string[];
  consultationTime?: string;
  roomNumber?: string;
  weeklySchedule?: DoctorWeeklyScheduleSlot[];
  customSchedules?: DoctorCustomSchedule[];
  scheduleExceptions?: DoctorScheduleException[];
  appointmentEnabled?: boolean;
  featured?: boolean;
  displayOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Service Model
export type ServiceType = 'CLINIC' | 'HOME' | 'BOTH';

export interface Service {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  shortDescription: string;
  shortDescriptionBn?: string;
  description: string;
  descriptionBn?: string;
  departmentId: string;
  category: 'Diagnostic' | 'Preventive' | 'Consultation' | 'Specialized' | string;
  serviceType: ServiceType;
  availableForHome?: boolean;
  availableAtClinic?: boolean;
  icon?: string;
  imageUrl?: string;
  preparationInstructions?: string | string[];
  preparationInstructionsBn?: string;
  reportTurnaroundTime?: string;
  turnaroundTime?: string;
  sampleType?: string;
  sampleTypeBn?: string;
  includedParameters?: string[];
  includedParametersBn?: string[];
  price?: number;
  bookingEnabled: boolean;
  featured: boolean;
  displayOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Patient Story / Authentic Testimonial Model
export interface PatientStory {
  id: string;
  patientName?: string;
  patientNameBn?: string;
  patientDisplayName?: string;
  patientDisplayNameBn?: string;
  location?: string;
  doctorName?: string;
  treatmentCategory?: string;
  photoUrl?: string;
  quote?: string;
  quoteBn?: string;
  story?: string;
  storyBn?: string;
  doctorId?: string;
  relatedDoctorId?: string;
  serviceId?: string;
  relatedServiceId?: string;
  careTag?: string;
  tag?: string;
  rating?: number;
  published: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Gallery Item Model
export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  titleBn?: string;
  caption: string;
  captionBn?: string;
  category: 'Clinic' | 'Doctors' | 'Facilities' | 'Events' | 'Team';
  altText: string;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// FAQ Model
export interface FAQ {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  category: 'Appointments' | 'Consultations' | 'Services' | 'Visiting';
  published: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Appointment Request Model (Website booking requests ONLY - Strictly Non-ERP)
export type AppointmentStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';
export type AppointmentRequestStatus = AppointmentStatus;

export type BookingType = 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE' | 'DOCTOR' | 'SERVICE';
export type ServiceMode = 'CLINIC' | 'HOME';

export interface AppointmentRequest {
  id: string;
  requestType: 'DOCTOR' | 'SERVICE';
  bookingType?: BookingType;
  doctorId?: string;
  doctorName?: string;
  department?: string;
  serviceId?: string;
  serviceName?: string;
  serviceType?: ServiceType;
  serviceMode?: ServiceMode;
  locationType?: 'CLINIC' | 'HOME';
  requestedDate?: string;
  requestedTimeWindow?: string;
  preferredDate: string;
  preferredTime: string;
  confirmedDate?: string;
  confirmedTime?: string;
  confirmedDoctorId?: string;
  confirmedDoctorName?: string;
  confirmedDepartment?: string;
  confirmedServiceId?: string;
  confirmedServiceName?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  contactedAt?: string;
  contactedBy?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  rescheduledAt?: string;
  patientName: string;
  phone: string;
  mobile?: string;
  patientPhone?: string;
  email?: string;
  patientEmail?: string;
  address?: string;
  area?: string;
  landmark?: string;
  patientNotes?: string;
  patientNote?: string;
  notes?: string;
  reason?: string;
  status: AppointmentStatus;
  adminNotes?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

// Social Media Platform Config
export interface SocialPlatformConfig {
  url: string;
  active: boolean;
}

export interface SocialLinksConfig {
  facebook?: SocialPlatformConfig;
  instagram?: SocialPlatformConfig;
  youtube?: SocialPlatformConfig;
  whatsapp?: SocialPlatformConfig;
  googleBusiness?: SocialPlatformConfig;
}

// Insurance Partner Model
export interface InsurancePartner {
  id: string;
  name: string;
  nameBn?: string;
  type: string;
  typeBn?: string;
  color?: string;
  logoUrl?: string;
  logoAssetId?: string;
  cashlessAvailable?: boolean;
  tpaInfo?: string;
  description?: string;
  descriptionBn?: string;
  coverageDetails?: string;
  coverageDetailsBn?: string;
  helpline?: string;
  website?: string;
  isActive?: boolean;
  displayOrder: number;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

// Section Media / Images Settings
export interface SectionMediaSettings {
  heroImage?: string;
  heroImageAssetId?: string;
  homeCareImage?: string;
  homeCareImageAssetId?: string;
  aboutHeroImage?: string;
  aboutImage?: string;
  aboutHeroImageAssetId?: string;
  emergencyImage?: string;
  pediatricsImage?: string;
  pediatricsImageAssetId?: string;
  adultsImage?: string;
  adultsImageAssetId?: string;
  seniorsImage?: string;
  seniorsImageAssetId?: string;
  womenHealthImage?: string;
  womenHealthImageAssetId?: string;
  facilityImages?: string[];
}

// Website Settings
export interface WebsiteSettings {
  clinicName: string;
  clinicNameBn?: string;
  tagline: string;
  taglineBn?: string;
  positioning: string;
  phone: string;
  whatsapp?: string;
  whatsappNumber?: string;
  emergencyPhone?: string;
  email: string;
  address: string;
  locationName?: string;
  mapLink?: string;
  googleMapsUrl?: string;
  openingHours: string;
  announcement?: string;
  announcementText?: string;
  announcementTextBn?: string;
  announcementActive?: boolean;
  announcementEnabled?: boolean;
  socialLinks?: SocialLinksConfig;
  brand?: BrandSettings;
  sectionMedia?: SectionMediaSettings;
  logoUrl?: string;
  logoAssetId?: string;
  logoAlt?: string;
  faviconUrl?: string;
  faviconAssetId?: string;
}

// SEO Settings
export interface SEOSettings {
  siteTitle?: string;
  metaTitle?: string;
  metaDescription: string;
  socialSharingImage?: string;
  ogImage?: string;
  defaultKeywords: string[];
  orgDescription?: string;
  googleVerificationTag?: string;
}

// Audit Log Model
export interface AuditLog {
  id: string;
  timestamp: string;
  adminUserId?: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
}

// Schema Field Descriptors (for architecture viewers and documentation)
export interface SchemaFieldDescriptor {
  field: string;
  type: string;
  required: boolean;
  description: string;
}
