// Centralized Medical Master Data for CareOn Medical Clinic
// Single Source of Truth for Departments, Specialties, Services, Designations, and Chambers

export interface MasterDepartment {
  id: string;
  name: string;
  nameBn: string;
  category:
    | 'Core Medical'
    | 'Major Specialties'
    | 'Orthopedics & Rehabilitation'
    | 'Women & Maternity'
    | 'Child Health'
    | 'Eye & ENT'
    | 'Skin & Dermatology'
    | 'Mental Health'
    | 'Dental & Oral Health'
    | 'Diagnostic & Support'
    | 'Other Specialties'
    | 'Other';
  keywords: string[];
}

export interface MasterSpecialty {
  id: string;
  name: string;
  nameBn?: string;
  departmentId: string;
}

export interface MasterService {
  id: string;
  name: string;
  nameBn?: string;
  category: string;
  departmentId?: string; // primary department mapping for suggestions
}

// ------------------------------------------------------------
// 1. DEPARTMENT MASTER (77 Departments organized by Category)
// ------------------------------------------------------------
export const MASTER_DEPARTMENTS: MasterDepartment[] = [
  // CORE MEDICAL DEPARTMENTS
  {
    id: 'dept-gen-med',
    name: 'General Medicine',
    nameBn: 'জেনারেল মেডিসিন',
    category: 'Core Medical',
    keywords: ['medicine', 'general', 'fever', 'physician', 'primary', 'health']
  },
  {
    id: 'dept-family-med',
    name: 'Family Medicine',
    nameBn: 'পারিবারিক চিকিৎসা',
    category: 'Core Medical',
    keywords: ['family', 'family health', 'primary care', 'wellness']
  },
  {
    id: 'dept-internal-med',
    name: 'Internal Medicine',
    nameBn: 'ইন্টারনাল মেডিসিন',
    category: 'Core Medical',
    keywords: ['internal', 'adult medicine', 'chronic', 'multisystem']
  },
  {
    id: 'dept-gen-surg',
    name: 'General Surgery',
    nameBn: 'জেনারেল সার্জারি',
    category: 'Core Medical',
    keywords: ['surgery', 'surgeon', 'hernia', 'appendix', 'operative']
  },
  {
    id: 'dept-emergency-med',
    name: 'Emergency Medicine',
    nameBn: 'জরুরি চিকিৎসা',
    category: 'Core Medical',
    keywords: ['emergency', 'casualty', 'urgent', 'trauma', 'acute']
  },
  {
    id: 'dept-critical-care',
    name: 'Critical Care / ICU',
    nameBn: 'ক্রিটিকাল কেয়ার / আইসিইউ',
    category: 'Core Medical',
    keywords: ['icu', 'critical', 'intensive care', 'ventilator']
  },
  {
    id: 'dept-preventive-med',
    name: 'Preventive Medicine',
    nameBn: 'প্রতিরোধমূলক চিকিৎসা',
    category: 'Core Medical',
    keywords: ['preventive', 'screening', 'health check', 'wellness', 'lifestyle']
  },
  {
    id: 'dept-geriatric-med',
    name: 'Geriatric Medicine',
    nameBn: 'জেরিয়াট্রিক মেডিসিন (প্রবীণ স্বাস্থ্য)',
    category: 'Core Medical',
    keywords: ['elderly', 'geriatric', 'senior', 'aging', 'senior citizen']
  },
  {
    id: 'dept-palliative-med',
    name: 'Palliative Medicine',
    nameBn: 'প্যালিয়েটিভ মেডিসিন',
    category: 'Core Medical',
    keywords: ['palliative', 'hospice', 'terminal', 'comfort care', 'pain relief']
  },

  // MAJOR SPECIALTIES
  {
    id: 'dept-cardiology',
    name: 'Cardiology',
    nameBn: 'কার্ডিওলজি (হৃদরোগ)',
    category: 'Major Specialties',
    keywords: ['cardio', 'heart', 'ecg', 'bp', 'chest pain', 'cardiac']
  },
  {
    id: 'dept-neurology',
    name: 'Neurology',
    nameBn: 'নিউরোলজি (স্নায়ুরোগ)',
    category: 'Major Specialties',
    keywords: ['neuro', 'brain', 'nerve', 'stroke', 'headache', 'epilepsy']
  },
  {
    id: 'dept-neurosurgery',
    name: 'Neurosurgery',
    nameBn: 'নিউরোসার্জারি',
    category: 'Major Specialties',
    keywords: ['brain surgery', 'spine surgery', 'neurosurgeon']
  },
  {
    id: 'dept-nephrology',
    name: 'Nephrology',
    nameBn: 'নেফ্রোলজি (কিডনি রোগ)',
    category: 'Major Specialties',
    keywords: ['kidney', 'nephro', 'dialysis', 'renal', 'creatinine']
  },
  {
    id: 'dept-urology',
    name: 'Urology',
    nameBn: 'ইউরোলজি',
    category: 'Major Specialties',
    keywords: ['urine', 'prostate', 'stone', 'uro', 'bladder', 'men health']
  },
  {
    id: 'dept-gastroenterology',
    name: 'Gastroenterology',
    nameBn: 'গ্যাস্ট্রোএন্টারোলজি (পরিপাকতন্ত্র)',
    category: 'Major Specialties',
    keywords: ['gastro', 'stomach', 'digestion', 'ibs', 'endoscopy', 'gastric']
  },
  {
    id: 'dept-gi-surgery',
    name: 'Gastrointestinal Surgery',
    nameBn: 'গ্যাস্ট্রোইনটেস্টাইনাল সার্জারি',
    category: 'Major Specialties',
    keywords: ['gi surgery', 'abdominal surgery', 'colorectal']
  },
  {
    id: 'dept-hepatology',
    name: 'Hepatology',
    nameBn: 'হেপাটোলজি (লিভার রোগ)',
    category: 'Major Specialties',
    keywords: ['liver', 'hepatitis', 'jaundice', 'cirrhosis', 'fatty liver']
  },
  {
    id: 'dept-pulmonology',
    name: 'Pulmonology / Respiratory Medicine',
    nameBn: 'পালমোনোলজি (ফুসফুস ও শ্বাসযন্ত্র)',
    category: 'Major Specialties',
    keywords: ['chest', 'lungs', 'asthma', 'copd', 'breath', 'cough', 'pulmo']
  },
  {
    id: 'dept-endocrinology',
    name: 'Endocrinology',
    nameBn: 'এন্ডোক্রিনোলজি (হরমোন ও ডায়াবেটিস)',
    category: 'Major Specialties',
    keywords: ['diabetes', 'thyroid', 'hormone', 'sugar', 'endocrine', 'metabolism']
  },
  {
    id: 'dept-rheumatology',
    name: 'Rheumatology',
    nameBn: 'রিউমাটোলজি (বাত ও জয়েন্ট রোগ)',
    category: 'Major Specialties',
    keywords: ['arthritis', 'rheumatic', 'autoimmune', 'lupus', 'joint swelling']
  },
  {
    id: 'dept-med-oncology',
    name: 'Medical Oncology',
    nameBn: 'মেডিক্যাল অনকোলজি (ক্যান্সার চিকিৎসা)',
    category: 'Major Specialties',
    keywords: ['cancer', 'oncology', 'chemotherapy', 'tumor']
  },
  {
    id: 'dept-surg-oncology',
    name: 'Surgical Oncology',
    nameBn: 'সার্জিক্যাল অনকোলজি',
    category: 'Major Specialties',
    keywords: ['cancer surgery', 'tumor excision', 'biopsy']
  },
  {
    id: 'dept-hematology',
    name: 'Hematology',
    nameBn: 'হেমাটোলজি (রক্তরোগ)',
    category: 'Major Specialties',
    keywords: ['blood', 'anemia', 'platelet', 'thalassemia', 'leukemia']
  },
  {
    id: 'dept-infectious-disease',
    name: 'Infectious Disease',
    nameBn: 'সংক্রামক ব্যাধি',
    category: 'Major Specialties',
    keywords: ['infection', 'fever', 'typhoid', 'dengue', 'viral', 'malaria']
  },

  // ORTHOPEDICS / REHABILITATION
  {
    id: 'dept-orthopedics',
    name: 'Orthopedics',
    nameBn: 'অর্থোপেডিকস (হাড় ও জোড়)',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['ortho', 'bone', 'joint', 'fracture', 'knee', 'spine', 'back pain']
  },
  {
    id: 'dept-pmr',
    name: 'Physical Medicine & Rehabilitation',
    nameBn: 'ফিজিক্যাল মেডিসিন ও রিহ্যাবিলিটেশন',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['pmr', 'rehab', 'paralysis', 'stroke rehab', 'physiotherapy', 'physiatrist']
  },
  {
    id: 'dept-sports-med',
    name: 'Sports Medicine',
    nameBn: 'স্পোর্টস মেডিসিন',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['sports', 'athletic', 'sprain', 'ligament', 'fitness']
  },
  {
    id: 'dept-pain-med',
    name: 'Pain Medicine',
    nameBn: 'পেইন মেডিসিন (ব্যথা নিরাময়)',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['pain', 'chronic pain', 'backache', 'interventional pain']
  },
  {
    id: 'dept-physiotherapy',
    name: 'Physiotherapy',
    nameBn: 'ফিজিওথেরাপি',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['physio', 'exercise', 'mobility', 'traction', 'ultrasound therapy']
  },
  {
    id: 'dept-occupational-therapy',
    name: 'Occupational Therapy',
    nameBn: 'অকুপেশনাল থেরাপি',
    category: 'Orthopedics & Rehabilitation',
    keywords: ['occupational', 'ergonomics', 'daily living', 'rehabilitation']
  },

  // WOMEN / MATERNITY
  {
    id: 'dept-obgyn',
    name: 'Obstetrics & Gynecology',
    nameBn: 'স্ত্রী ও প্রসূতি রোগ (অবস ও গাইনি)',
    category: 'Women & Maternity',
    keywords: ['gyne', 'gynae', 'pregnancy', 'antenatal', 'pcod', 'pcos', 'women']
  },
  {
    id: 'dept-gynecology',
    name: 'Gynecology',
    nameBn: 'গাইনোকোলজি',
    category: 'Women & Maternity',
    keywords: ['female health', 'periods', 'fibroid', 'uterus']
  },
  {
    id: 'dept-obstetrics',
    name: 'Obstetrics',
    nameBn: 'অবস্টেট্রিকস (প্রসূতি)',
    category: 'Women & Maternity',
    keywords: ['maternity', 'labor', 'delivery', 'postnatal']
  },
  {
    id: 'dept-reproductive-med',
    name: 'Reproductive Medicine / Infertility',
    nameBn: 'প্রজনন স্বাস্থ্য ও বন্ধ্যাত্ব চিকিৎসা',
    category: 'Women & Maternity',
    keywords: ['fertility', 'ivf', 'iui', 'conception', 'infertility']
  },

  // CHILD HEALTH
  {
    id: 'dept-pediatrics',
    name: 'Pediatrics',
    nameBn: 'শিশুরোগ বিশেষজ্ঞ (পেডিয়াট্রিক্স)',
    category: 'Child Health',
    keywords: ['child', 'baby', 'kid', 'pediatric', 'vaccination', 'newborn']
  },
  {
    id: 'dept-neonatology',
    name: 'Neonatology',
    nameBn: 'নিওনেটোলজি (নবজাতক)',
    category: 'Child Health',
    keywords: ['newborn', 'premature', 'infant', 'nicu']
  },
  {
    id: 'dept-ped-surgery',
    name: 'Pediatric Surgery',
    nameBn: 'পেডিয়াট্রিক সার্জারি',
    category: 'Child Health',
    keywords: ['child surgery', 'pediatric operation']
  },
  {
    id: 'dept-ped-cardiology',
    name: 'Pediatric Cardiology',
    nameBn: 'পেডিয়াট্রিক কার্ডিওলজি',
    category: 'Child Health',
    keywords: ['congenital heart', 'child heart']
  },
  {
    id: 'dept-ped-neurology',
    name: 'Pediatric Neurology',
    nameBn: 'পেডিয়াট্রিক নিউরোলজি',
    category: 'Child Health',
    keywords: ['child brain', 'seizure', 'autism', 'cerebral palsy']
  },

  // EYE / ENT
  {
    id: 'dept-ophthalmology',
    name: 'Ophthalmology',
    nameBn: 'চক্ষু রোগ (অপথালমোলজি)',
    category: 'Eye & ENT',
    keywords: ['eye', 'vision', 'cataract', 'glasses', 'glaucoma', 'retina']
  },
  {
    id: 'dept-ent',
    name: 'ENT / Otorhinolaryngology',
    nameBn: 'ইএনটি (নাক, কান ও গলা)',
    category: 'Eye & ENT',
    keywords: ['ent', 'ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing']
  },
  {
    id: 'dept-audiology',
    name: 'Audiology',
    nameBn: 'অডিওলজি (শ্রবণ পরীক্ষা)',
    category: 'Eye & ENT',
    keywords: ['hearing test', 'audiometry', 'hearing aid']
  },
  {
    id: 'dept-speech-therapy',
    name: 'Speech & Language Therapy',
    nameBn: 'স্পিচ ও ল্যাঙ্গুয়েজ থেরাপি',
    category: 'Eye & ENT',
    keywords: ['speech', 'stammering', 'articulation', 'voice therapy']
  },

  // SKIN
  {
    id: 'dept-dermatology',
    name: 'Dermatology',
    nameBn: 'ডার্মাটোলজি (চর্ম ও চুল)',
    category: 'Skin & Dermatology',
    keywords: ['skin', 'derma', 'hair', 'acne', 'rash', 'eczema', 'psoriasis']
  },
  {
    id: 'dept-venereology',
    name: 'Venereology',
    nameBn: 'ভেনেরেওলজি (যৌন রোগ)',
    category: 'Skin & Dermatology',
    keywords: ['std', 'sti', 'venereal']
  },
  {
    id: 'dept-aesthetic-derma',
    name: 'Aesthetic Dermatology',
    nameBn: 'এসথেটিক ডার্মাটোলজি',
    category: 'Skin & Dermatology',
    keywords: ['cosmetic', 'anti aging', 'pigmentation', 'laser']
  },

  // MENTAL HEALTH
  {
    id: 'dept-psychiatry',
    name: 'Psychiatry',
    nameBn: 'সাইকিয়াট্রি (মনোরোগ)',
    category: 'Mental Health',
    keywords: ['psych', 'depression', 'anxiety', 'mental health', 'sleep', 'stress']
  },
  {
    id: 'dept-clinical-psychology',
    name: 'Clinical Psychology',
    nameBn: 'ক্লিনিক্যাল সাইকোলজি',
    category: 'Mental Health',
    keywords: ['psychology', 'counseling', 'cbt', 'therapy']
  },
  {
    id: 'dept-psychology',
    name: 'Psychology',
    nameBn: 'মনোবিজ্ঞান',
    category: 'Mental Health',
    keywords: ['counselor', 'behavioral', 'emotional']
  },
  {
    id: 'dept-addiction-med',
    name: 'Addiction Medicine',
    nameBn: 'মাদকাসক্তি নিরাময়',
    category: 'Mental Health',
    keywords: ['addiction', 'deaddiction', 'substance', 'alcohol', 'smoking']
  },

  // DENTAL
  {
    id: 'dept-dentistry',
    name: 'Dentistry',
    nameBn: 'দন্ত চিকিৎসা (ডেন্টিস্ট্রি)',
    category: 'Dental & Oral Health',
    keywords: ['dental', 'teeth', 'toothache', 'filling', 'dentist']
  },
  {
    id: 'dept-omfs',
    name: 'Oral & Maxillofacial Surgery',
    nameBn: 'ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি',
    category: 'Dental & Oral Health',
    keywords: ['jaw surgery', 'oral surgery', 'wisdom tooth']
  },
  {
    id: 'dept-orthodontics',
    name: 'Orthodontics',
    nameBn: 'অর্থোডন্টিকস (দাঁতের বিন্যাস)',
    category: 'Dental & Oral Health',
    keywords: ['braces', 'aligners', 'teeth alignment']
  },
  {
    id: 'dept-prosthodontics',
    name: 'Prosthodontics',
    nameBn: 'প্রোস্থোডন্টিকস',
    category: 'Dental & Oral Health',
    keywords: ['dentures', 'implants', 'crowns', 'bridges']
  },
  {
    id: 'dept-periodontics',
    name: 'Periodontics',
    nameBn: 'পিরিওডন্টিকস (মাড়ির রোগ)',
    category: 'Dental & Oral Health',
    keywords: ['gums', 'gum bleeding', 'scaling']
  },
  {
    id: 'dept-pediatric-dentistry',
    name: 'Pediatric Dentistry',
    nameBn: 'পেডিয়াট্রিক ডেন্টিস্ট্রি',
    category: 'Dental & Oral Health',
    keywords: ['child dental', 'milk teeth']
  },

  // DIAGNOSTIC / SUPPORT SPECIALTIES
  {
    id: 'dept-radiology',
    name: 'Radiology',
    nameBn: 'রেডিওলজি (এক্স-রে ও আলট্রাসাউন্ড)',
    category: 'Diagnostic & Support',
    keywords: ['xray', 'ultrasound', 'usg', 'ct', 'mri', 'imaging']
  },
  {
    id: 'dept-interventional-rad',
    name: 'Interventional Radiology',
    nameBn: 'ইন্টারভেনশনাল রেডিওলজি',
    category: 'Diagnostic & Support',
    keywords: ['image guided', 'biopsy', 'stenting']
  },
  {
    id: 'dept-pathology',
    name: 'Pathology',
    nameBn: 'প্যাথলজি (রক্ত ও কলা পরীক্ষা)',
    category: 'Diagnostic & Support',
    keywords: ['blood test', 'lab', 'biopsy', 'histopathology']
  },
  {
    id: 'dept-lab-med',
    name: 'Laboratory Medicine',
    nameBn: 'ল্যাবরেটরি মেডিসিন',
    category: 'Diagnostic & Support',
    keywords: ['diagnostics', 'hematology lab', 'biochemistry']
  },
  {
    id: 'dept-microbiology',
    name: 'Microbiology',
    nameBn: 'মাইক্রোবায়োলজি',
    category: 'Diagnostic & Support',
    keywords: ['culture', 'sensitivity', 'bacteria', 'fungus']
  },
  {
    id: 'dept-nuclear-med',
    name: 'Nuclear Medicine',
    nameBn: 'নিউক্লিয়ার মেডিসিন',
    category: 'Diagnostic & Support',
    keywords: ['pet scan', 'isotope', 'scintigraphy']
  },
  {
    id: 'dept-anesthesiology',
    name: 'Anesthesiology',
    nameBn: 'অ্যানেস্থেসিওলজি',
    category: 'Diagnostic & Support',
    keywords: ['anesthesia', 'sedation', 'critical']
  },
  {
    id: 'dept-nutrition-dietetics',
    name: 'Clinical Nutrition / Dietetics',
    nameBn: 'ক্লিনিক্যাল নিউট্রিশন ও ডায়েটিক্স',
    category: 'Diagnostic & Support',
    keywords: ['diet', 'nutrition', 'weight loss', 'meal plan', 'dietitian']
  },
  {
    id: 'dept-pharmacy',
    name: 'Pharmacy',
    nameBn: 'ফার্মেসি',
    category: 'Diagnostic & Support',
    keywords: ['medicine', 'drugs', 'pharmacist', 'prescription']
  },

  // OTHER IMPORTANT SPECIALTIES
  {
    id: 'dept-plastic-surgery',
    name: 'Plastic & Reconstructive Surgery',
    nameBn: 'প্লাস্টিক ও রিকনস্ট্রাক্টিভ সার্জারি',
    category: 'Other Specialties',
    keywords: ['plastic', 'cosmetic surgery', 'burn', 'grafting']
  },
  {
    id: 'dept-vascular-surgery',
    name: 'Vascular Surgery',
    nameBn: 'ভাস্কুলার সার্জারি',
    category: 'Other Specialties',
    keywords: ['veins', 'artery', 'varicose veins', 'circulation']
  },
  {
    id: 'dept-cardiothoracic-surg',
    name: 'Cardiothoracic Surgery',
    nameBn: 'কার্ডিওথোরাসিক সার্জারি',
    category: 'Other Specialties',
    keywords: ['heart surgery', 'bypass', 'lung surgery']
  },
  {
    id: 'dept-colorectal-surg',
    name: 'Colorectal Surgery',
    nameBn: 'কলোরেক্টাল সার্জারি',
    category: 'Other Specialties',
    keywords: ['piles', 'fissure', 'fistula', 'colon', 'rectum']
  },
  {
    id: 'dept-breast-surgery',
    name: 'Breast Surgery',
    nameBn: 'ব্রেস্ট সার্জারি',
    category: 'Other Specialties',
    keywords: ['breast lump', 'oncoplastic']
  },
  {
    id: 'dept-bariatric-surgery',
    name: 'Bariatric & Metabolic Surgery',
    nameBn: 'ব্যারিয়াট্রিক সার্জারি (ওজন হ্রাস)',
    category: 'Other Specialties',
    keywords: ['weight loss surgery', 'obesity surgery']
  },
  {
    id: 'dept-transplant-med',
    name: 'Transplant Medicine',
    nameBn: 'ট্রান্সপ্লান্ট মেডিসিন',
    category: 'Other Specialties',
    keywords: ['organ transplant', 'kidney transplant', 'liver transplant']
  },
  {
    id: 'dept-genetics',
    name: 'Genetics',
    nameBn: 'জেনেটিক্স (বংশগতি বিদ্যা)',
    category: 'Other Specialties',
    keywords: ['genetic counseling', 'hereditary', 'dna']
  },
  {
    id: 'dept-sexual-med',
    name: 'Sexual Medicine',
    nameBn: 'সেক্সুয়াল মেডিসিন',
    category: 'Other Specialties',
    keywords: ['sexual dysfunction', 'andrology']
  },
  {
    id: 'dept-sleep-med',
    name: 'Sleep Medicine',
    nameBn: 'স্লিপ মেডিসিন (ঘুমের সমস্যা)',
    category: 'Other Specialties',
    keywords: ['insomnia', 'sleep apnea', 'snoring']
  },

  // FLEXIBILITY
  {
    id: 'dept-other',
    name: 'Other',
    nameBn: 'অন্যান্য বিভাগ',
    category: 'Other',
    keywords: ['other', 'custom', 'specialized']
  }
];

// ------------------------------------------------------------
// 2. SPECIALTY MASTER (Mapped logically by Department)
// ------------------------------------------------------------
export const MASTER_SPECIALTIES: MasterSpecialty[] = [
  // CARDIOLOGY
  { id: 'spec-cardio-prev', name: 'Preventive Cardiology', departmentId: 'dept-cardiology' },
  { id: 'spec-cardio-interv', name: 'Interventional Cardiology', departmentId: 'dept-cardiology' },
  { id: 'spec-cardio-clin', name: 'Clinical Cardiology', departmentId: 'dept-cardiology' },
  { id: 'spec-cardio-hf', name: 'Heart Failure & Cardiomyopathy', departmentId: 'dept-cardiology' },
  { id: 'spec-cardio-rehab', name: 'Cardiac Rehabilitation', departmentId: 'dept-cardiology' },

  // NEUROLOGY
  { id: 'spec-neuro-gen', name: 'General Neurology', departmentId: 'dept-neurology' },
  { id: 'spec-neuro-stroke', name: 'Stroke Medicine', departmentId: 'dept-neurology' },
  { id: 'spec-neuro-epilepsy', name: 'Epilepsy', departmentId: 'dept-neurology' },
  { id: 'spec-neuro-movement', name: 'Movement Disorders & Parkinson’s', departmentId: 'dept-neurology' },
  { id: 'spec-neuro-headache', name: 'Headache & Migraine Medicine', departmentId: 'dept-neurology' },
  { id: 'spec-neuro-rehab', name: 'Neurorehabilitation', departmentId: 'dept-neurology' },

  // ORTHOPEDICS
  { id: 'spec-ortho-joint', name: 'Joint Replacement & Arthroplasty', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-sports', name: 'Sports Injury', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-spine', name: 'Spine Care & Back Pain', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-trauma', name: 'Trauma & Fracture Management', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-arthroscopy', name: 'Arthroscopy & Minimally Invasive', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-ped', name: 'Pediatric Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-hand', name: 'Hand & Microvascular Surgery', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-foot', name: 'Foot & Ankle Care', departmentId: 'dept-orthopedics' },
  { id: 'spec-ortho-rehab', name: 'Orthopedic Rehabilitation', departmentId: 'dept-orthopedics' },

  // PHYSICAL MEDICINE & REHABILITATION (PMR)
  { id: 'spec-pmr-stroke', name: 'Stroke Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'spec-pmr-neuro', name: 'Neuro Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'spec-pmr-pain', name: 'Pain Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'spec-pmr-msk', name: 'Musculoskeletal Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'spec-pmr-sports', name: 'Sports Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'spec-pmr-disability', name: 'Disability Rehabilitation', departmentId: 'dept-pmr' },

  // OBSTETRICS & GYNECOLOGY
  { id: 'spec-obgyn-gen', name: 'General Gynecology', departmentId: 'dept-obgyn' },
  { id: 'spec-obgyn-highrisk', name: 'High Risk Pregnancy & Antenatal Care', departmentId: 'dept-obgyn' },
  { id: 'spec-obgyn-infertility', name: 'Infertility & Reproductive Health', departmentId: 'dept-obgyn' },
  { id: 'spec-obgyn-menopause', name: 'Menopause Care & Hormone Health', departmentId: 'dept-obgyn' },
  { id: 'spec-obgyn-surg', name: 'Gynecologic Surgery & Laparoscopy', departmentId: 'dept-obgyn' },

  // PEDIATRICS
  { id: 'spec-ped-gen', name: 'General Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'spec-ped-allergy', name: 'Pediatric Allergy & Pulmonology', departmentId: 'dept-pediatrics' },
  { id: 'spec-ped-cardio', name: 'Pediatric Cardiology', departmentId: 'dept-pediatrics' },
  { id: 'spec-ped-neuro', name: 'Pediatric Neurology', departmentId: 'dept-pediatrics' },
  { id: 'spec-ped-growth', name: 'Child Development & Growth', departmentId: 'dept-pediatrics' },
  { id: 'spec-ped-neonatal', name: 'Neonatal Care & Infant Health', departmentId: 'dept-pediatrics' },

  // DERMATOLOGY
  { id: 'spec-derma-gen', name: 'General Dermatology', departmentId: 'dept-dermatology' },
  { id: 'spec-derma-acne', name: 'Acne & Skin Care', departmentId: 'dept-dermatology' },
  { id: 'spec-derma-hair', name: 'Hair & Scalp Disorders (Trichology)', departmentId: 'dept-dermatology' },
  { id: 'spec-derma-allergy', name: 'Skin Allergy & Eczema', departmentId: 'dept-dermatology' },
  { id: 'spec-derma-cosmetic', name: 'Cosmetic Dermatology & Laser', departmentId: 'dept-dermatology' },
  { id: 'spec-derma-surg', name: 'Dermatosurgery', departmentId: 'dept-dermatology' },

  // GASTROENTEROLOGY
  { id: 'spec-gastro-gen', name: 'General Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'spec-gastro-liver', name: 'Liver Disease & Cirrhosis', departmentId: 'dept-gastroenterology' },
  { id: 'spec-gastro-endoscopy', name: 'Diagnostic & Therapeutic Endoscopy', departmentId: 'dept-gastroenterology' },
  { id: 'spec-gastro-ibs', name: 'IBS & Gut Motility', departmentId: 'dept-gastroenterology' },
  { id: 'spec-gastro-ibd', name: 'IBD (Crohn’s & Ulcerative Colitis)', departmentId: 'dept-gastroenterology' },
  { id: 'spec-gastro-hepatology', name: 'Hepatology', departmentId: 'dept-gastroenterology' },

  // UROLOGY
  { id: 'spec-uro-gen', name: 'General Urology', departmentId: 'dept-urology' },
  { id: 'spec-uro-stone', name: 'Kidney Stone Management', departmentId: 'dept-urology' },
  { id: 'spec-uro-prostate', name: 'Prostate & BPH Care', departmentId: 'dept-urology' },
  { id: 'spec-uro-surg', name: 'Endourology & Urological Surgery', departmentId: 'dept-urology' },
  { id: 'spec-uro-andrology', name: 'Men’s Urology & Andrology', departmentId: 'dept-urology' },

  // ENDOCRINOLOGY
  { id: 'spec-endo-diabetes', name: 'Diabetes & Metabolic Health', departmentId: 'dept-endocrinology' },
  { id: 'spec-endo-thyroid', name: 'Thyroid Disorders', departmentId: 'dept-endocrinology' },
  { id: 'spec-endo-obesity', name: 'Obesity & Weight Management', departmentId: 'dept-endocrinology' },
  { id: 'spec-endo-hormones', name: 'Hormonal & Adrenal Disorders', departmentId: 'dept-endocrinology' },

  // PSYCHIATRY
  { id: 'spec-psych-adult', name: 'Adult Psychiatry', departmentId: 'dept-psychiatry' },
  { id: 'spec-psych-child', name: 'Child & Adolescent Psychiatry', departmentId: 'dept-psychiatry' },
  { id: 'spec-psych-anxiety', name: 'Anxiety, Stress & Depression', departmentId: 'dept-psychiatry' },
  { id: 'spec-psych-addiction', name: 'Addiction Psychiatry', departmentId: 'dept-psychiatry' },
  { id: 'spec-psych-sleep', name: 'Sleep Disorders', departmentId: 'dept-psychiatry' },

  // OPHTHALMOLOGY
  { id: 'spec-opht-gen', name: 'General Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'spec-opht-cataract', name: 'Cataract Evaluation', departmentId: 'dept-ophthalmology' },
  { id: 'spec-opht-glaucoma', name: 'Glaucoma Care', departmentId: 'dept-ophthalmology' },
  { id: 'spec-opht-retina', name: 'Retina & Medical Vitreo-Retina', departmentId: 'dept-ophthalmology' },
  { id: 'spec-opht-cornea', name: 'Cornea & Refractive Error', departmentId: 'dept-ophthalmology' },
  { id: 'spec-opht-ped', name: 'Pediatric Ophthalmology', departmentId: 'dept-ophthalmology' },

  // ENT
  { id: 'spec-ent-gen', name: 'General ENT', departmentId: 'dept-ent' },
  { id: 'spec-ent-sinus', name: 'Sinus & Rhinology', departmentId: 'dept-ent' },
  { id: 'spec-ent-ear', name: 'Ear Disorders & Otology', departmentId: 'dept-ent' },
  { id: 'spec-ent-hearing', name: 'Hearing & Tinnitus Care', departmentId: 'dept-ent' },
  { id: 'spec-ent-voice', name: 'Voice, Larynx & Throat Disorders', departmentId: 'dept-ent' },

  // GENERAL SURGERY
  { id: 'spec-surg-lap', name: 'Laparoscopic Surgery', departmentId: 'dept-gen-surg' },
  { id: 'spec-surg-hernia', name: 'Hernia Surgery', departmentId: 'dept-gen-surg' },
  { id: 'spec-surg-breast', name: 'Breast Surgery', departmentId: 'dept-gen-surg' },
  { id: 'spec-surg-colorectal', name: 'Colorectal Surgery', departmentId: 'dept-gen-surg' },
  { id: 'spec-surg-proctology', name: 'Proctology & Piles Care', departmentId: 'dept-gen-surg' },

  // PULMONOLOGY
  { id: 'spec-pulmo-asthma', name: 'Asthma Management', departmentId: 'dept-pulmonology' },
  { id: 'spec-pulmo-copd', name: 'COPD & Chronic Bronchitis', departmentId: 'dept-pulmonology' },
  { id: 'spec-pulmo-sleep', name: 'Sleep Medicine & Apnea', departmentId: 'dept-pulmonology' },
  { id: 'spec-pulmo-resp', name: 'Respiratory Medicine & Allergy', departmentId: 'dept-pulmonology' },

  // NEPHROLOGY
  { id: 'spec-nephro-ckd', name: 'Chronic Kidney Disease', departmentId: 'dept-nephrology' },
  { id: 'spec-nephro-dialysis', name: 'Dialysis & Renal Replacement', departmentId: 'dept-nephrology' },
  { id: 'spec-nephro-htn', name: 'Hypertension & Kidney Care', departmentId: 'dept-nephrology' },

  // ONCOLOGY
  { id: 'spec-onco-med', name: 'Medical Oncology & Chemotherapy', departmentId: 'dept-med-oncology' },
  { id: 'spec-onco-surg', name: 'Surgical Oncology', departmentId: 'dept-surg-oncology' },
  { id: 'spec-onco-screening', name: 'Cancer Screening & Early Detection', departmentId: 'dept-med-oncology' },
  { id: 'spec-onco-followup', name: 'Cancer Follow-up & Survivorship', departmentId: 'dept-med-oncology' },

  // RHEUMATOLOGY
  { id: 'spec-rheum-arthritis', name: 'Arthritis (Rheumatoid & Osteoarthritis)', departmentId: 'dept-rheumatology' },
  { id: 'spec-rheum-autoimmune', name: 'Autoimmune Diseases & Lupus', departmentId: 'dept-rheumatology' },
  { id: 'spec-rheum-gout', name: 'Gout & Crystal Arthropathies', departmentId: 'dept-rheumatology' },

  // GENERAL MEDICINE
  { id: 'spec-genmed-family', name: 'Family Health & Primary Care', departmentId: 'dept-gen-med' },
  { id: 'spec-genmed-chronic', name: 'Chronic Disease Management', departmentId: 'dept-gen-med' },
  { id: 'spec-genmed-fever', name: 'Infectious Diseases & Fever Workup', departmentId: 'dept-gen-med' },
  { id: 'spec-genmed-geriatric', name: 'Geriatric Health Care', departmentId: 'dept-gen-med' },

  // OTHER / CUSTOM
  { id: 'spec-other', name: 'Other Clinical Specialty', departmentId: 'dept-other' }
];

// ------------------------------------------------------------
// 3. MEDICAL SERVICES MASTER
// ------------------------------------------------------------
export const MASTER_SERVICES: MasterService[] = [
  // GENERAL CONSULTATION
  { id: 'srv-gen-consult', name: 'General Consultation', category: 'General Consultation', departmentId: 'dept-gen-med' },
  { id: 'srv-spec-consult', name: 'Specialist Consultation', category: 'General Consultation' },
  { id: 'srv-followup', name: 'Follow-up Consultation', category: 'General Consultation' },
  { id: 'srv-second-opinion', name: 'Second Opinion', category: 'General Consultation' },
  { id: 'srv-prev-consult', name: 'Preventive Health Consultation', category: 'General Consultation', departmentId: 'dept-preventive-med' },
  { id: 'srv-senior-consult', name: 'Senior Citizen Health Consultation', category: 'General Consultation', departmentId: 'dept-geriatric-med' },

  // CARDIAC SERVICES
  { id: 'srv-ecg', name: 'ECG (12-Lead Diagnostic)', category: 'Cardiac Services', departmentId: 'dept-cardiology' },
  { id: 'srv-cardiac-consult', name: 'Cardiac Consultation', category: 'Cardiac Services', departmentId: 'dept-cardiology' },
  { id: 'srv-bp-check', name: 'Blood Pressure Check & Monitoring', category: 'Cardiac Services', departmentId: 'dept-cardiology' },
  { id: 'srv-heart-risk', name: 'Heart Risk Assessment', category: 'Cardiac Services', departmentId: 'dept-cardiology' },
  { id: 'srv-cardiac-followup', name: 'Cardiac Follow-up', category: 'Cardiac Services', departmentId: 'dept-cardiology' },

  // DIABETES / ENDOCRINE
  { id: 'srv-diabetes-mgmt', name: 'Diabetes Management', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },
  { id: 'srv-diabetes-screen', name: 'Diabetes Screening', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },
  { id: 'srv-thyroid-consult', name: 'Thyroid Consultation', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },
  { id: 'srv-thyroid-screen', name: 'Thyroid Screening', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },
  { id: 'srv-obesity-mgmt', name: 'Obesity Management', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },
  { id: 'srv-metabolic-consult', name: 'Metabolic Health Consultation', category: 'Diabetes / Endocrine', departmentId: 'dept-endocrinology' },

  // NEUROLOGY
  { id: 'srv-neuro-consult', name: 'Neurology Consultation', category: 'Neurology', departmentId: 'dept-neurology' },
  { id: 'srv-stroke-assess', name: 'Stroke Assessment', category: 'Neurology', departmentId: 'dept-neurology' },
  { id: 'srv-headache-assess', name: 'Headache Assessment', category: 'Neurology', departmentId: 'dept-neurology' },
  { id: 'srv-epilepsy-consult', name: 'Epilepsy Consultation', category: 'Neurology', departmentId: 'dept-neurology' },
  { id: 'srv-neuro-followup', name: 'Neurological Follow-up', category: 'Neurology', departmentId: 'dept-neurology' },
  { id: 'srv-neuro-rehab', name: 'Neuro Rehabilitation', category: 'Neurology', departmentId: 'dept-neurology' },

  // ORTHOPEDICS
  { id: 'srv-ortho-consult', name: 'Orthopedic Consultation', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-joint-pain', name: 'Joint Pain Treatment', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-knee-pain', name: 'Knee Pain Treatment', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-back-pain', name: 'Back Pain Treatment', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-neck-pain', name: 'Neck Pain Treatment', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-shoulder-pain', name: 'Shoulder Pain Treatment', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-arthritis-mgmt', name: 'Arthritis Management', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-sports-injury', name: 'Sports Injury Consultation', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-fracture-followup', name: 'Fracture Follow-up', category: 'Orthopedics', departmentId: 'dept-orthopedics' },
  { id: 'srv-spine-consult', name: 'Spine Consultation', category: 'Orthopedics', departmentId: 'dept-orthopedics' },

  // PHYSICAL MEDICINE & REHABILITATION
  { id: 'srv-physiotherapy', name: 'Physiotherapy', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-stroke-rehab', name: 'Stroke Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-paralysis-rehab', name: 'Paralysis Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-pmr-neuro-rehab', name: 'Neuro Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-pain-mgmt', name: 'Pain Management', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-msk-rehab', name: 'Musculoskeletal Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-sports-rehab', name: 'Sports Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-disability-rehab', name: 'Disability Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },
  { id: 'srv-postop-rehab', name: 'Post-operative Rehabilitation', category: 'Physical Medicine & Rehabilitation', departmentId: 'dept-pmr' },

  // GYNECOLOGY / OBSTETRICS
  { id: 'srv-gyn-consult', name: 'Gynecology Consultation', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-antenatal-consult', name: 'Antenatal Consultation', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-pregnancy-care', name: 'Pregnancy Care', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-highrisk-preg', name: 'High Risk Pregnancy Care', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-infertility-consult', name: 'Infertility Consultation', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-menopause-consult', name: 'Menopause Consultation', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },
  { id: 'srv-womens-health', name: 'Women’s Health Checkup', category: 'Gynecology / Obstetrics', departmentId: 'dept-obgyn' },

  // PEDIATRICS
  { id: 'srv-ped-consult', name: 'Pediatric Consultation', category: 'Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'srv-child-wellness', name: 'Child Wellness Checkup', category: 'Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'srv-vaccination', name: 'Vaccination', category: 'Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'srv-growth-assess', name: 'Growth & Development Assessment', category: 'Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'srv-newborn-consult', name: 'Newborn Consultation', category: 'Pediatrics', departmentId: 'dept-pediatrics' },
  { id: 'srv-child-nutrition', name: 'Child Nutrition Consultation', category: 'Pediatrics', departmentId: 'dept-pediatrics' },

  // GASTROENTEROLOGY
  { id: 'srv-gastro-consult', name: 'Gastroenterology Consultation', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'srv-liver-consult', name: 'Liver Disease Consultation', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'srv-digestive-consult', name: 'Digestive Health Consultation', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'srv-ibs-mgmt', name: 'IBS Management', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'srv-hepatitis-consult', name: 'Hepatitis Consultation', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },
  { id: 'srv-endoscopy-consult', name: 'Endoscopy Consultation', category: 'Gastroenterology', departmentId: 'dept-gastroenterology' },

  // PULMONOLOGY
  { id: 'srv-resp-consult', name: 'Respiratory Consultation', category: 'Pulmonology', departmentId: 'dept-pulmonology' },
  { id: 'srv-asthma-mgmt', name: 'Asthma Management', category: 'Pulmonology', departmentId: 'dept-pulmonology' },
  { id: 'srv-copd-mgmt', name: 'COPD Management', category: 'Pulmonology', departmentId: 'dept-pulmonology' },
  { id: 'srv-allergy-resp', name: 'Allergy-related Respiratory Care', category: 'Pulmonology', departmentId: 'dept-pulmonology' },
  { id: 'srv-sleep-breathing', name: 'Sleep-related Breathing Assessment', category: 'Pulmonology', departmentId: 'dept-pulmonology' },

  // UROLOGY
  { id: 'srv-uro-consult', name: 'Urology Consultation', category: 'Urology', departmentId: 'dept-urology' },
  { id: 'srv-kidney-stone', name: 'Kidney Stone Consultation', category: 'Urology', departmentId: 'dept-urology' },
  { id: 'srv-prostate-consult', name: 'Prostate Consultation', category: 'Urology', departmentId: 'dept-urology' },
  { id: 'srv-mens-health', name: 'Men’s Health Consultation', category: 'Urology', departmentId: 'dept-urology' },
  { id: 'srv-urinary-assess', name: 'Urinary Problem Assessment', category: 'Urology', departmentId: 'dept-urology' },

  // DERMATOLOGY
  { id: 'srv-derma-consult', name: 'Dermatology Consultation', category: 'Dermatology', departmentId: 'dept-dermatology' },
  { id: 'srv-acne-treatment', name: 'Acne Treatment', category: 'Dermatology', departmentId: 'dept-dermatology' },
  { id: 'srv-hair-scalp', name: 'Hair & Scalp Consultation', category: 'Dermatology', departmentId: 'dept-dermatology' },
  { id: 'srv-skin-allergy', name: 'Skin Allergy Consultation', category: 'Dermatology', departmentId: 'dept-dermatology' },
  { id: 'srv-pigmentation', name: 'Pigmentation Consultation', category: 'Dermatology', departmentId: 'dept-dermatology' },
  { id: 'srv-cosmetic-derma', name: 'Cosmetic Dermatology Consultation', category: 'Dermatology', departmentId: 'dept-dermatology' },

  // OPHTHALMOLOGY
  { id: 'srv-eye-consult', name: 'Eye Consultation', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'srv-cataract-eval', name: 'Cataract Evaluation', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'srv-glaucoma-eval', name: 'Glaucoma Evaluation', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'srv-retina-consult', name: 'Retina Consultation', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'srv-vision-screen', name: 'Vision Screening', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },
  { id: 'srv-ped-eye', name: 'Pediatric Eye Consultation', category: 'Ophthalmology', departmentId: 'dept-ophthalmology' },

  // ENT
  { id: 'srv-ent-consult', name: 'ENT Consultation', category: 'ENT', departmentId: 'dept-ent' },
  { id: 'srv-ear-exam', name: 'Ear Examination', category: 'ENT', departmentId: 'dept-ent' },
  { id: 'srv-hearing-assess', name: 'Hearing Assessment', category: 'ENT', departmentId: 'dept-ent' },
  { id: 'srv-sinus-consult', name: 'Sinus Consultation', category: 'ENT', departmentId: 'dept-ent' },
  { id: 'srv-throat-consult', name: 'Throat Consultation', category: 'ENT', departmentId: 'dept-ent' },
  { id: 'srv-voice-consult', name: 'Voice Consultation', category: 'ENT', departmentId: 'dept-ent' },

  // MENTAL HEALTH
  { id: 'srv-psych-consult', name: 'Psychiatry Consultation', category: 'Mental Health', departmentId: 'dept-psychiatry' },
  { id: 'srv-psychology-consult', name: 'Psychological Consultation', category: 'Mental Health', departmentId: 'dept-clinical-psychology' },
  { id: 'srv-anxiety-mgmt', name: 'Anxiety Management', category: 'Mental Health', departmentId: 'dept-psychiatry' },
  { id: 'srv-depression-mgmt', name: 'Depression Management', category: 'Mental Health', departmentId: 'dept-psychiatry' },
  { id: 'srv-stress-mgmt', name: 'Stress Management', category: 'Mental Health', departmentId: 'dept-psychiatry' },
  { id: 'srv-sleep-consult', name: 'Sleep Consultation', category: 'Mental Health', departmentId: 'dept-psychiatry' },
  { id: 'srv-child-behavior', name: 'Child Behaviour Consultation', category: 'Mental Health', departmentId: 'dept-psychiatry' },

  // SURGERY
  { id: 'srv-gensurg-consult', name: 'General Surgery Consultation', category: 'Surgery', departmentId: 'dept-gen-surg' },
  { id: 'srv-lap-consult', name: 'Laparoscopic Surgery Consultation', category: 'Surgery', departmentId: 'dept-gen-surg' },
  { id: 'srv-hernia-consult', name: 'Hernia Consultation', category: 'Surgery', departmentId: 'dept-gen-surg' },
  { id: 'srv-breast-consult', name: 'Breast Surgery Consultation', category: 'Surgery', departmentId: 'dept-gen-surg' },
  { id: 'srv-proctology-consult', name: 'Proctology Consultation', category: 'Surgery', departmentId: 'dept-gen-surg' },
  { id: 'srv-surg-followup', name: 'Surgical Follow-up', category: 'Surgery', departmentId: 'dept-gen-surg' },

  // CANCER CARE
  { id: 'srv-cancer-screen', name: 'Cancer Screening', category: 'Cancer Care', departmentId: 'dept-med-oncology' },
  { id: 'srv-onco-consult', name: 'Oncology Consultation', category: 'Cancer Care', departmentId: 'dept-med-oncology' },
  { id: 'srv-med-onco', name: 'Medical Oncology Consultation', category: 'Cancer Care', departmentId: 'dept-med-oncology' },
  { id: 'srv-surg-onco', name: 'Surgical Oncology Consultation', category: 'Cancer Care', departmentId: 'dept-surg-oncology' },
  { id: 'srv-cancer-followup', name: 'Cancer Follow-up', category: 'Cancer Care', departmentId: 'dept-med-oncology' },

  // DIAGNOSTIC / CLINIC SERVICES
  { id: 'srv-blood-test', name: 'Blood Test', category: 'Diagnostic / Clinic Services', departmentId: 'dept-pathology' },
  { id: 'srv-lab-test', name: 'Laboratory Test', category: 'Diagnostic / Clinic Services', departmentId: 'dept-lab-med' },
  { id: 'srv-health-checkup', name: 'Health Checkup', category: 'Diagnostic / Clinic Services', departmentId: 'dept-preventive-med' },
  { id: 'srv-fullbody-checkup', name: 'Full Body Health Checkup', category: 'Diagnostic / Clinic Services', departmentId: 'dept-preventive-med' },
  { id: 'srv-prev-checkup', name: 'Preventive Health Checkup', category: 'Diagnostic / Clinic Services', departmentId: 'dept-preventive-med' },
  { id: 'srv-home-sample', name: 'Home Sample Collection', category: 'Diagnostic / Clinic Services', departmentId: 'dept-pathology' },
  { id: 'srv-diag-consult', name: 'Diagnostic Consultation', category: 'Diagnostic / Clinic Services', departmentId: 'dept-pathology' },

  // OTHER
  { id: 'srv-other', name: 'Other Service', category: 'Other', departmentId: 'dept-other' }
];

// ------------------------------------------------------------
// 4. DESIGNATION MASTER
// ------------------------------------------------------------
export const MASTER_DESIGNATIONS = [
  'Consultant',
  'Senior Consultant',
  'Specialist',
  'Senior Specialist',
  'Visiting Consultant',
  'Medical Officer',
  'Surgeon',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Physician',
  'Other'
] as const;

export type MasterDesignation = typeof MASTER_DESIGNATIONS[number];

// ------------------------------------------------------------
// 5. CHAMBER MASTER
// ------------------------------------------------------------
export const MASTER_CHAMBERS = [
  'CareOn Medical Clinic',
  'Main Chamber',
  'Consultation Room 1',
  'Consultation Room 2',
  'Consultation Room 3',
  'Other'
] as const;

export type MasterChamber = typeof MASTER_CHAMBERS[number];

// ------------------------------------------------------------
// 6. DAYS OF WEEK & STANDARD TIME PRESETS
// ------------------------------------------------------------
export const MASTER_DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const MASTER_TIME_PRESETS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
  '08:00 PM',
  '08:30 PM',
  '09:00 PM',
  '09:30 PM'
];

// Helper to look up suggested services for a department
export function getSuggestedServicesForDepartment(departmentId: string): MasterService[] {
  if (!departmentId) return [];

  // Direct matches
  const directMatches = MASTER_SERVICES.filter((s) => s.departmentId === departmentId);
  if (directMatches.length > 0) return directMatches;

  // General medicine or other fallbacks
  if (departmentId === 'dept-gen-med' || departmentId === 'dept-family-med' || departmentId === 'dept-internal-med') {
    return MASTER_SERVICES.filter((s) =>
      ['srv-gen-consult', 'srv-followup', 'srv-prev-consult', 'srv-bp-check', 'srv-health-checkup'].includes(s.id)
    );
  }

  return [
    MASTER_SERVICES.find((s) => s.id === 'srv-spec-consult') || MASTER_SERVICES[1],
    MASTER_SERVICES.find((s) => s.id === 'srv-followup') || MASTER_SERVICES[2]
  ].filter(Boolean);
}

// Helper to look up specialties for a department
export function getSpecialtiesForDepartment(departmentId: string): MasterSpecialty[] {
  if (!departmentId) return [];
  const matches = MASTER_SPECIALTIES.filter((s) => s.departmentId === departmentId);
  if (matches.length > 0) return matches;

  // Fallback to related if department is specialized or other
  return [{ id: 'spec-other', name: 'Other Clinical Specialty', departmentId }];
}
