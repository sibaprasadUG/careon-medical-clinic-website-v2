import {
  Department,
  Doctor,
  Service,
  PatientStory,
  GalleryItem,
  FAQ,
  AppointmentRequest,
  WebsiteSettings,
  SEOSettings,
  AuditLog,
  AdminUser,
  InsurancePartner
} from '../types';
import { MASTER_DEPARTMENTS } from './masterDepartments';
import { MASTER_SERVICES } from './masterServices';
import { MASTER_INSURANCE_PARTNERS } from './masterInsurance';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-admin-01',
    email: 'administrator@clinic.internal',
    name: 'CareOn Administrator',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

export const DEFAULT_DEPARTMENTS: Department[] = MASTER_DEPARTMENTS;

export const DEFAULT_DOCTORS: Doctor[] = [];

export const DEFAULT_SERVICES: Service[] = MASTER_SERVICES;

export const DEFAULT_INSURANCE_PARTNERS: InsurancePartner[] = MASTER_INSURANCE_PARTNERS;

export const DEFAULT_PATIENT_STORIES: PatientStory[] = [
  {
    id: 'story-01',
    patientDisplayName: 'Subhashish Roy',
    patientDisplayNameBn: 'শুভাশিস রায়',
    story: 'The clinical team listened with genuine patience when managing my father’s long-standing diabetes and fluctuating blood pressure. The clinic environment is exceptionally calm, clean, and unhurried.',
    storyBn: 'চিকিৎসক আমার বাবার দীর্ঘদিনের ডায়াবেটিস ও রক্তচাপ সংক্রান্ত সমস্যা অত্যন্ত মনোযোগ দিয়ে শুনেছেন। ক্লিনিকের পরিবেশ সত্যিই শান্ত এবং পরিচ্ছন্ন।',
    relatedServiceId: 'srv-01',
    tag: 'Family Health Care',
    published: true,
    displayOrder: 1,
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-01-15T11:00:00.000Z'
  },
  {
    id: 'story-02',
    patientDisplayName: 'Ananya & Debasis Sen',
    patientDisplayNameBn: 'অনন্যা ও দেবাশীষ সেন',
    story: 'Visiting a clinic with a toddler is usually stressful, but the pediatrician made our 3-year-old completely comfortable during the wellness check. We deeply appreciate the gentle and attentive care.',
    storyBn: 'ছোট বাচ্চাকে নিয়ে ক্লিনিকে যাওয়া সাধারণত চিন্তার বিষয়, কিন্তু শিশু বিশেষজ্ঞ আমাদের ৩ বছরের সন্তানকে পরম স্নেহে দেখেছেন। এই আন্তরিকতা প্রশংসনীয়।',
    relatedServiceId: 'srv-03',
    tag: 'Pediatric Care',
    published: true,
    displayOrder: 2,
    createdAt: '2026-01-16T11:00:00.000Z',
    updatedAt: '2026-01-16T11:00:00.000Z'
  },
  {
    id: 'story-03',
    patientDisplayName: 'Priya Majumder',
    patientDisplayNameBn: 'প্রিয়া মজুমদার',
    story: 'The diagnostic ECG and preventive checkup was completely smooth. From reception to consultation, everything was transparent with zero unnecessary delays.',
    storyBn: 'ডায়াগনস্টিক ইসিজি এবং প্রিভেন্টিভ চেকআপ খুব সুন্দরভাবে সম্পন্ন হয়েছে। রিসেপশন থেকে কনসালটেশন পর্যন্ত সবকিছু ছিল স্বচ্ছ।',
    relatedServiceId: 'srv-02',
    tag: 'Cardiac & Preventive Care',
    published: true,
    displayOrder: 3,
    createdAt: '2026-01-17T11:00:00.000Z',
    updatedAt: '2026-01-17T11:00:00.000Z'
  }
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: 'gal-01',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    title: 'CareOn Reception & Consultation Waiting Lounge',
    caption: 'Comfortable, well-ventilated, and clean waiting environment designed for patient relaxation.',
    category: 'Clinic',
    altText: 'Clean modern reception and waiting area of CareOn Medical Clinic',
    displayOrder: 1,
    published: true,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z'
  },
  {
    id: 'gal-02',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800',
    title: 'Private Clinical Consultation Room',
    caption: 'Spacious consultation chambers equipped with modern diagnostic examination facilities.',
    category: 'Facilities',
    altText: 'Doctor consultation room with medical examination bed and equipment',
    displayOrder: 2,
    published: true,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z'
  },
  {
    id: 'gal-03',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    title: 'Diagnostic ECG & Sample Collection Station',
    caption: 'Sterilized diagnostics corner ensuring accurate sample collection and immediate ECG recording.',
    category: 'Facilities',
    altText: 'Diagnostic equipment and sample station at CareOn Clinic',
    displayOrder: 3,
    published: true,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z'
  },
  {
    id: 'gal-04',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    title: 'CareOn Healthcare & Nursing Support Team',
    caption: 'Dedicated nursing and patient support staff committed to compassionate clinical assistance.',
    category: 'Team',
    altText: 'Healthcare team members at CareOn clinic',
    displayOrder: 4,
    published: true,
    createdAt: '2026-01-14T10:00:00.000Z',
    updatedAt: '2026-01-14T10:00:00.000Z'
  }
];

export const DEFAULT_FAQS: FAQ[] = [
  {
    id: 'faq-01',
    question: 'How do I book an appointment with a doctor at CareOn?',
    questionBn: 'কেয়ারঅনে চিকিৎসকের সাথে কীভাবে অ্যাপয়েন্টমেন্ট বুক করব?',
    answer: 'You can request an appointment directly through our website booking form, call our clinic helpline (+91 9933335131), or send a message on WhatsApp. Our desk confirms your slot promptly.',
    answerBn: 'আপনি সরাসরি আমাদের ওয়েবসাইটের মাধ্যমে বুক করতে পারেন, অথবা আমাদের হেল্পলাইনে (+৯১ ৯৯৩৩৩ ৩৫১৩১) কল বা হোয়াটসঅ্যাপে বার্তা পাঠিয়ে সহজেই সময় নিশ্চিত করতে পারেন।',
    category: 'Appointments',
    published: true,
    displayOrder: 1,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'faq-02',
    question: 'What are the general clinic operating hours?',
    questionBn: 'ক্লিনিকের সাধারণ সময়সূচী কী?',
    answer: 'CareOn Medical Clinic is open Monday to Saturday from 09:00 AM to 07:00 PM. The clinic is closed on Sundays.',
    answerBn: 'কেয়ারঅন মেডিক্যাল ক্লিনিক সোমবার থেকে শনিবার সকাল ৯টা থেকে সন্ধ্যা ৭টা পর্যন্ত খোলা থাকে। রবিবার ক্লিনিক বন্ধ থাকে।',
    category: 'Visiting',
    published: true,
    displayOrder: 2,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'faq-03',
    question: 'Do I need prior fasting for routine blood tests or health checkups?',
    questionBn: 'রক্ত পরীক্ষা বা স্বাস্থ্য পরীক্ষার জন্য কি খালি পেটে থাকা প্রয়োজন?',
    answer: 'For fasting blood sugar (FBS) and lipid profile tests, 8 to 10 hours of overnight fasting is recommended. You may drink normal water (জল). Routine doctor consultations and ECG do not require fasting.',
    answerBn: 'ফাস্টিং ব্লাড সুগার এবং লিপিড প্রোফাইল পরীক্ষার জন্য ৮ থেকে ১০ ঘন্টা খালি পেটে থাকা প্রয়োজন। স্বাভাবিক জল পান করা যাবে। সাধারণ কনসালটেশন বা ইসিজির জন্য খালি পেটে থাকার প্রয়োজন নেই।',
    category: 'Services',
    published: true,
    displayOrder: 3,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'faq-04',
    question: 'Can I walk in without a prior appointment?',
    questionBn: 'পূর্ব অ্যাপয়েন্টমেন্ট ছাড়া কি সরাসরি ক্লিনিকে আসা যায়?',
    answer: 'Walk-ins are welcomed subject to doctor chamber availability. However, to avoid waiting times and ensure specialist availability, booking a slot in advance is strongly recommended.',
    answerBn: 'সরাসরি আসাও সম্ভব, তবে চিকিৎসকের উপস্থিতি এবং অপেক্ষার সময় কমাতে আগে থেকে সময় নির্ধারণ করে আসাই শ্রেয়।',
    category: 'Consultations',
    published: true,
    displayOrder: 4,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z'
  }
];

export const DEFAULT_APPOINTMENT_REQUESTS: AppointmentRequest[] = [
  {
    id: 'apt-req-001',
    requestType: 'SERVICE',
    bookingType: 'SERVICE',
    serviceId: 'srv-01',
    serviceName: 'Comprehensive Health & Preventive Checkup',
    department: 'General Medicine & Diabetology',
    preferredDate: '2026-08-28',
    preferredTime: 'Evening',
    confirmedDate: '2026-08-28',
    confirmedTime: '06:30 PM',
    confirmedDepartment: 'General Medicine & Diabetology',
    confirmedAt: '2026-08-27T10:15:00.000Z',
    confirmedBy: 'Reception Desk',
    patientName: 'Ramen Sen',
    phone: '9933335131',
    email: 'ramen.sen@example.com',
    reason: 'Follow-up consultation for blood sugar and routine blood pressure review.',
    status: 'CONFIRMED',
    adminNotes: 'Patient contacted on phone. Confirmed slot for Chamber 101.',
    createdAt: '2026-08-27T09:30:00.000Z',
    updatedAt: '2026-08-27T10:15:00.000Z'
  },
  {
    id: 'apt-req-002',
    requestType: 'SERVICE',
    bookingType: 'SERVICE',
    serviceId: 'srv-05',
    serviceName: 'Doorstep Blood Sample & Lab Collection',
    serviceType: 'HOME',
    locationType: 'HOME',
    address: 'Amartya Palli, Near High School, Contai - 721401',
    area: 'Contai Town',
    preferredDate: '2026-08-29',
    preferredTime: 'Morning',
    patientName: 'Kalyan Ganguly',
    phone: '9933520248',
    email: 'kalyan.g@example.com',
    reason: 'Home blood sample collection for senior citizen lipid and sugar panel.',
    status: 'NEW',
    adminNotes: 'Home service request. Phlebotomist coordination required.',
    createdAt: '2026-08-27T11:20:00.000Z',
    updatedAt: '2026-08-27T11:20:00.000Z'
  }
];

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  clinicName: 'CareOn Medical Clinic',
  tagline: 'Caring Beyond Treatment',
  positioning: 'Trusted Healthcare for You & Your Family',
  brand: {
    logoUrl: '/careon_logo.png',
    logoAlt: 'CareOn Medical Clinic Logo',
    updatedAt: '2026-09-11T12:00:00.000Z'
  },
  logoUrl: '/careon_logo.png',
  logoAlt: 'CareOn Medical Clinic Logo',
  phone: '9933335131',
  emergencyPhone: '9933520248',
  whatsapp: '9933335131',
  email: 'info@careonmedical.in',
  address: 'Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401',
  locationName: 'Contai, Purba Medinipur',
  mapLink: '',
  openingHours: 'Monday – Sunday: 08:00 AM – 07:00 PM',
  announcement: '',
  announcementActive: false,
  socialLinks: {
    facebook: {
      url: 'https://www.facebook.com/profile.php?id=61574354535870',
      active: true
    },
    instagram: {
      url: 'https://www.instagram.com/sibucontai/',
      active: true
    },
    youtube: {
      url: '',
      active: false
    },
    whatsapp: {
      url: 'https://wa.me/919933335131',
      active: true
    },
    googleBusiness: {
      url: 'https://share.google/1rR9CTJqmxgGnvW7I',
      active: true
    }
  }
};

export const DEFAULT_SEO_SETTINGS: SEOSettings = {
  siteTitle: 'CareOn Medical Clinic — Caring Beyond Treatment | Contai',
  metaDescription: 'CareOn Medical Clinic delivers compassionate, evidence-based healthcare with experienced physicians, pediatricians, cardiologists, and diagnostic checkups in Contai, Purba Medinipur.',
  socialSharingImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
  defaultKeywords: ['CareOn Medical Clinic', 'Doctor Consultation Contai', 'Family Clinic Contai', 'Pediatrician Contai', 'Cardiologist', 'Preventive Health Checkup Contai', 'Home Sample Collection Contai'],
  orgDescription: 'CareOn Medical Clinic is a premier family healthcare and diagnostic consultation center in Contai, Purba Medinipur, West Bengal.',
  googleVerificationTag: 'careon-verify-2026-preview'
};

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-27T08:00:00.000Z',
    adminUserId: 'usr-admin-01',
    adminEmail: 'administrator@clinic.internal',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'WebsiteSettings',
    entityId: 'settings-root',
    entityName: 'CareOn Master Settings',
    details: 'Phase 03 Content Database and CMS Control Center provisioned with verified records.'
  }
];
