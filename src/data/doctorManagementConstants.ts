// CareOn Medical Clinic - Doctor Management Constants & Masters
// Centralized enterprise-grade medical master lists for departments, services, schedules & fees

export interface ClinicDepartment {
  id: string;
  name: string;
  nameBn?: string;
  category: string;
  keywords: string[];
}

export interface ClinicService {
  id: string;
  name: string;
  category: string;
}

export const CAREON_DEPARTMENTS: ClinicDepartment[] = [
  { id: 'dept-gen-med', name: 'General Medicine', nameBn: 'জেনারেল মেডিসিন', category: 'Core Medical', keywords: ['medicine', 'general', 'fever', 'physician'] },
  { id: 'dept-family-med', name: 'Family Medicine', nameBn: 'পারিবারিক চিকিৎসা', category: 'Core Medical', keywords: ['family', 'primary care', 'wellness'] },
  { id: 'dept-cardio', name: 'Cardiology', nameBn: 'কার্ডিওলজি (হৃদরোগ)', category: 'Major Specialties', keywords: ['heart', 'cardio', 'cardiac', 'ecg', 'blood pressure'] },
  { id: 'dept-neuro', name: 'Neurology', nameBn: 'নিউরোলজি (স্নায়ুরোগ)', category: 'Major Specialties', keywords: ['brain', 'nerve', 'neuro', 'headache', 'stroke'] },
  { id: 'dept-psychiatry', name: 'Psychiatry', nameBn: 'সাইকিয়াট্রি (মানসিক স্বাস্থ্য)', category: 'Mental Health', keywords: ['mental', 'depression', 'anxiety', 'psych'] },
  { id: 'dept-gastro', name: 'Gastroenterology', nameBn: 'গ্যাস্ট্রোএন্টারোলজি', category: 'Major Specialties', keywords: ['stomach', 'digestion', 'gastric', 'liver', 'endoscopy'] },
  { id: 'dept-hepatology', name: 'Hepatology', nameBn: 'হেপাটোলজি (লিভার রোগ)', category: 'Major Specialties', keywords: ['liver', 'hepatitis', 'jaundice', 'cirrhosis'] },
  { id: 'dept-pulmono', name: 'Pulmonology / Respiratory Medicine', nameBn: 'পালমোনোলজি / বক্ষব্যাধি', category: 'Major Specialties', keywords: ['lungs', 'chest', 'asthma', 'breathing', 'cough'] },
  { id: 'dept-nephro', name: 'Nephrology', nameBn: 'নেফ্রোলজি (কিডনি রোগ)', category: 'Major Specialties', keywords: ['kidney', 'renal', 'dialysis', 'creatinine'] },
  { id: 'dept-uro', name: 'Urology', nameBn: 'ইউরোলজি', category: 'Major Specialties', keywords: ['urine', 'bladder', 'prostate', 'stone'] },
  { id: 'dept-endo', name: 'Endocrinology', nameBn: 'এন্ডোক্রাইনোলজি (হরমোন রোগ)', category: 'Major Specialties', keywords: ['hormone', 'thyroid', 'endocrine', 'metabolism'] },
  { id: 'dept-diabeto', name: 'Diabetology', nameBn: 'ডায়াবেটোলজি', category: 'Major Specialties', keywords: ['diabetes', 'sugar', 'glucose', 'insulin'] },
  { id: 'dept-derma', name: 'Dermatology', nameBn: 'ডার্মাটোলজি (চর্ম ও যৌন রোগ)', category: 'Skin & Dermatology', keywords: ['skin', 'hair', 'allergy', 'rash', 'dermatologist'] },
  { id: 'dept-gyn-obs', name: 'Gynecology & Obstetrics', nameBn: 'গাইনোকোলজি ও অবস্টেট্রিক্স', category: 'Women & Maternity', keywords: ['women', 'pregnancy', 'maternity', 'gynecologist'] },
  { id: 'dept-pedia', name: 'Pediatrics', nameBn: 'পেডিয়াট্রিক্স (শিশু রোগ)', category: 'Child Health', keywords: ['child', 'baby', 'pediatrician', 'vaccination'] },
  { id: 'dept-neonatal', name: 'Neonatology', nameBn: 'নিওনেটোলজি (নবজাতক সেবা)', category: 'Child Health', keywords: ['newborn', 'neonatal', 'infant'] },
  { id: 'dept-ortho', name: 'Orthopedics', nameBn: 'অর্থোপেডিক্স (হাড় ও জোড়)', category: 'Orthopedics & Rehabilitation', keywords: ['bone', 'joint', 'fracture', 'spine', 'orthopedic'] },
  { id: 'dept-pmr', name: 'Physical Medicine & Rehabilitation', nameBn: 'ফিজিক্যাল মেডিসিন ও রিহ্যাবিলিটেশন', category: 'Orthopedics & Rehabilitation', keywords: ['rehab', 'physiotherapy', 'paralysis', 'mobility'] },
  { id: 'dept-pain', name: 'Pain Medicine', nameBn: 'পেইন মেডিসিন (ব্যথা নিরাময়)', category: 'Major Specialties', keywords: ['pain', 'back pain', 'chronic pain', 'spine'] },
  { id: 'dept-opht', name: 'Ophthalmology', nameBn: 'অপথালমোলজি (চক্ষু রোগ)', category: 'Eye & ENT', keywords: ['eye', 'vision', 'cataract', 'glasses', 'sight'] },
  { id: 'dept-ent', name: 'ENT', nameBn: 'ইএনটি (নাক, কান ও গলা)', category: 'Eye & ENT', keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil'] },
  { id: 'dept-gen-surg', name: 'General Surgery', nameBn: 'জেনারেল সার্জারি', category: 'Surgical Disciplines', keywords: ['surgery', 'surgeon', 'appendix', 'hernia'] },
  { id: 'dept-gastro-surg', name: 'Gastro Surgery', nameBn: 'গ্যাস্ট্রো সার্জারি', category: 'Surgical Disciplines', keywords: ['gastro surgery', 'laparoscopy', 'bowel surgery'] },
  { id: 'dept-onco-surg', name: 'Onco Surgery', nameBn: 'অনকো সার্জারি (ক্যান্সার অস্ত্রোপচার)', category: 'Surgical Disciplines', keywords: ['cancer', 'oncology', 'tumor', 'biopsy'] },
  { id: 'dept-neuro-surg', name: 'Neurosurgery', nameBn: 'নিউরোসার্জারি', category: 'Surgical Disciplines', keywords: ['brain surgery', 'spine surgery', 'neurosurgeon'] },
  { id: 'dept-dental', name: 'Dental', nameBn: 'ডেন্টাল (দাঁতের চিকিৎসা)', category: 'Dental & Oral Health', keywords: ['dental', 'teeth', 'dentist', 'root canal', 'oral'] },
  { id: 'dept-physio', name: 'Physiotherapy', nameBn: 'ফিজিওথেরাপি', category: 'Orthopedics & Rehabilitation', keywords: ['physio', 'exercise', 'posture', 'therapy'] },
  { id: 'dept-nutrition', name: 'Nutrition & Dietetics', nameBn: 'পুষ্টি ও ডায়েট চার্ট', category: 'Allied & Support', keywords: ['diet', 'nutrition', 'weight', 'dietitian'] },
  { id: 'dept-radiology', name: 'Radiology / Imaging', nameBn: 'রেডিওলজি ও ইমেজিং', category: 'Diagnostic & Support', keywords: ['x-ray', 'usg', 'ultrasound', 'scan', 'imaging'] },
  { id: 'dept-pathology', name: 'Pathology / Laboratory', nameBn: 'প্যাথলজি ও ল্যাব টেস্ট', category: 'Diagnostic & Support', keywords: ['lab', 'blood test', 'pathology', 'urine test'] },
  { id: 'dept-preventive', name: 'Preventive & Health Checkup', nameBn: 'প্রতিরোধমূলক স্বাস্থ্য পরীক্ষা', category: 'Preventive & Wellness', keywords: ['screening', 'package', 'full body checkup'] },
  { id: 'dept-rehab', name: 'Rehabilitation', nameBn: 'রিহ্যাবিলিটেশন', category: 'Orthopedics & Rehabilitation', keywords: ['rehabilitation', 'recovery', 'stroke rehab'] },
  { id: 'dept-telemed', name: 'Telemedicine', nameBn: 'টেলিমেডিসিন কনসালটেশন', category: 'Consultation & Remote Care', keywords: ['online', 'video call', 'teleconsultation', 'remote'] },
  { id: 'dept-other', name: 'Other', nameBn: 'অন্যান্য বিশেষত্ব', category: 'Other', keywords: ['other', 'specialist'] }
];

export const CAREON_SERVICES: ClinicService[] = [
  { id: 'srv-gen-consult', name: 'General Consultation', category: 'Consultations' },
  { id: 'srv-spec-consult', name: 'Specialist Consultation', category: 'Consultations' },
  { id: 'srv-followup-consult', name: 'Follow-up Consultation', category: 'Consultations' },
  { id: 'srv-pedia-consult', name: 'Pediatric Consultation', category: 'Consultations' },
  { id: 'srv-cardio-consult', name: 'Cardiology Consultation', category: 'Consultations' },
  { id: 'srv-neuro-consult', name: 'Neurology Consultation', category: 'Consultations' },
  { id: 'srv-psych-consult', name: 'Psychiatry Consultation', category: 'Consultations' },
  { id: 'srv-gastro-consult', name: 'Gastroenterology Consultation', category: 'Consultations' },
  { id: 'srv-diabeto-consult', name: 'Diabetology Consultation', category: 'Consultations' },
  { id: 'srv-endo-consult', name: 'Endocrinology Consultation', category: 'Consultations' },
  { id: 'srv-thyroid-consult', name: 'Thyroid Consultation', category: 'Consultations' },
  { id: 'srv-derma-consult', name: 'Dermatology Consultation', category: 'Consultations' },
  { id: 'srv-gyn-consult', name: 'Gynecology Consultation', category: 'Consultations' },
  { id: 'srv-obs-consult', name: 'Obstetrics Consultation', category: 'Consultations' },
  { id: 'srv-ortho-consult', name: 'Orthopedic Consultation', category: 'Consultations' },
  { id: 'srv-ent-consult', name: 'ENT Consultation', category: 'Consultations' },
  { id: 'srv-opht-consult', name: 'Ophthalmology Consultation', category: 'Consultations' },
  { id: 'srv-uro-consult', name: 'Urology Consultation', category: 'Consultations' },
  { id: 'srv-nephro-consult', name: 'Nephrology Consultation', category: 'Consultations' },
  { id: 'srv-pulmo-consult', name: 'Pulmonology Consultation', category: 'Consultations' },
  { id: 'srv-gen-surg-consult', name: 'General Surgery Consultation', category: 'Consultations' },
  { id: 'srv-physio', name: 'Physiotherapy', category: 'Therapy & Rehab' },
  { id: 'srv-pmr', name: 'Physical Medicine & Rehabilitation', category: 'Therapy & Rehab' },
  { id: 'srv-pain-mgmt', name: 'Pain Management', category: 'Therapy & Rehab' },
  { id: 'srv-nutrition-counsel', name: 'Nutrition Counselling', category: 'Wellness & Nutrition' },
  { id: 'srv-telemed-consult', name: 'Telemedicine Consultation', category: 'Telemedicine' },
  { id: 'srv-health-checkup', name: 'Health Checkup', category: 'Checkups & Diagnostics' },
  { id: 'srv-ecg', name: 'ECG', category: 'Checkups & Diagnostics' },
  { id: 'srv-blood-tests', name: 'Blood Tests', category: 'Checkups & Diagnostics' },
  { id: 'srv-pathology-tests', name: 'Pathology / Lab Tests', category: 'Checkups & Diagnostics' },
  { id: 'srv-home-sample', name: 'Home Sample Collection', category: 'Checkups & Diagnostics' },
  { id: 'srv-xray', name: 'X-Ray', category: 'Checkups & Diagnostics' },
  { id: 'srv-usg', name: 'Ultrasound / USG', category: 'Checkups & Diagnostics' },
  { id: 'srv-vaccination', name: 'Vaccination', category: 'Clinical Procedures' },
  { id: 'srv-wound-dressing', name: 'Wound Dressing', category: 'Clinical Procedures' },
  { id: 'srv-minor-proc', name: 'Minor Procedures', category: 'Clinical Procedures' },
  { id: 'srv-prev-care', name: 'Preventive Care', category: 'Wellness & Nutrition' },
  { id: 'srv-health-cert', name: 'Health Certificate', category: 'Clinical Procedures' },
  { id: 'srv-rehabilitation', name: 'Rehabilitation', category: 'Therapy & Rehab' },
  { id: 'srv-other', name: 'Other', category: 'Other' }
];

export const DOCTOR_TYPES = [
  'Visiting Consultant',
  'Senior Consultant',
  'Consultant',
  'Specialist',
  'Resident Physician',
  'Surgeon',
  'Head of Department (HOD)',
  'Medical Officer',
  'Honorary Consultant'
];

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
];

export const APPOINTMENT_DURATIONS = [
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes (Standard)' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes (Comprehensive)' }
];

export const BUFFER_TIMES = [
  { value: 0, label: 'No buffer (0 min)' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' }
];

export const UNAVAILABLE_REASONS = [
  'Doctor on Annual / Casual Leave',
  'Attending Medical Conference / Workshop',
  'Emergency Personal Leave',
  'Clinic Closed / Public Holiday',
  'Duty in Hospital / Operation Theater',
  'Other'
];

export const TIME_PRESETS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM'
];
