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
  AdminUser
} from '../types';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@careonclinic.com',
    name: 'CareOn Administrator',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-gen-med',
    name: 'General Medicine & Family Health',
    nameBn: 'জেনারেল মেডিসিন ও পারিবারিক স্বাস্থ্য',
    slug: 'general-medicine',
    shortDescription: 'Comprehensive acute illness management, chronic disease prevention, and regular health assessments.',
    description: 'Our General Medicine department provides holistic primary care, fever management, diabetes & hypertension monitoring, and routine medical screenings for all family members.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    icon: 'Stethoscope',
    featured: true,
    displayOrder: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-pediatrics',
    name: 'Pediatrics & Child Wellness',
    nameBn: 'শিশু চিকিৎসা ও যত্ন',
    slug: 'pediatrics',
    shortDescription: 'Gentle, attentive clinical care for newborns, infants, children, and adolescents.',
    description: 'Expert pediatricians providing newborn screenings, developmental milestone assessments, pediatric nutrition, and seasonal infection care.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
    icon: 'Baby',
    featured: true,
    displayOrder: 2,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-cardiology',
    name: 'Cardiology & Preventive Heart Care',
    nameBn: 'কার্ডিওলজি ও হৃদরোগ প্রতিরোধ',
    slug: 'cardiology',
    shortDescription: 'Cardiac risk evaluation, diagnostic ECG, blood pressure regulation, and lifestyle cardiology.',
    description: 'Focusing on early detection of cardiovascular risks, hypertension management, cholesterol monitoring, and non-invasive cardiac screenings.',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    icon: 'Heart',
    featured: true,
    displayOrder: 3,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-gynecology',
    name: 'Obstetrics & Gynecology',
    nameBn: 'স্ত্রী ও প্রসূতি রোগ বিশেষজ্ঞ',
    slug: 'gynecology',
    shortDescription: 'Compassionate women’s health across every phase of life, antenatal consultation, and wellness.',
    description: 'Specialized healthcare dedicated to maternal wellness, antenatal counseling, PCOS/PCOD management, routine screening, and menopausal health.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    icon: 'ShieldCheck',
    featured: true,
    displayOrder: 4,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'dept-orthopedics',
    name: 'Orthopedics & Joint Care',
    nameBn: 'অর্থোপেডিকস ও হাড়-জয়েন্ট কেয়ার',
    slug: 'orthopedics',
    shortDescription: 'Diagnosis and conservative management of bone, joint, ligament, and spine conditions.',
    description: 'Comprehensive bone health evaluation, arthritis pain management, postural correction, osteopenia screening, and post-injury rehabilitation advice.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    icon: 'Activity',
    featured: false,
    displayOrder: 5,
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-01-10T08:00:00.000Z'
  }
];

export const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-01',
    name: 'Dr. Arindam Banerjee',
    nameBn: 'ডাঃ অরিন্দম ব্যানার্জী',
    slug: 'dr-arindam-banerjee',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    departmentId: 'dept-gen-med',
    designation: 'Senior Consultant Physician',
    qualification: 'MBBS, MD (General Medicine)',
    registrationNumber: 'WBMC-48291',
    shortBio: 'Over 16 years of clinical excellence in acute infection management, metabolic syndrome, and preventative family medicine.',
    areasOfExpertise: ['Hypertension & Diabetes', 'Infectious Diseases', 'Geriatric Primary Care', 'Preventive Screenings'],
    consultationDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    consultationTime: '05:00 PM – 08:30 PM',
    roomNumber: 'Chamber 101',
    appointmentEnabled: true,
    featured: true,
    displayOrder: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z'
  },
  {
    id: 'doc-02',
    name: 'Dr. Sarmistha Mukherjee',
    nameBn: 'ডাঃ শর্মিষ্ঠা মুখার্জী',
    slug: 'dr-sarmistha-mukherjee',
    photoUrl: 'https://images.unsplash.com/photo-1594824813580-ff61f9a2636a?auto=format&fit=crop&q=80&w=600',
    departmentId: 'dept-pediatrics',
    designation: 'Senior Pediatric Specialist',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    registrationNumber: 'WBMC-53102',
    shortBio: 'Dedicated to compassionate child care, pediatric developmental milestones, immunization tracking, and childhood nutrition.',
    areasOfExpertise: ['Newborn Care', 'Pediatric Nutrition', 'Asthma & Allergy in Children', 'Developmental Milestones'],
    consultationDays: ['Tue', 'Thu', 'Sat', 'Sun'],
    consultationTime: '10:00 AM – 01:30 PM',
    roomNumber: 'Chamber 103',
    appointmentEnabled: true,
    featured: true,
    displayOrder: 2,
    status: 'ACTIVE',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z'
  },
  {
    id: 'doc-03',
    name: 'Dr. Debabrata Roy',
    nameBn: 'ডাঃ দেবব্রত রায়',
    slug: 'dr-debabrata-roy',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    departmentId: 'dept-cardiology',
    designation: 'Consultant Cardiologist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    registrationNumber: 'WBMC-60218',
    shortBio: 'Specializing in non-invasive cardiovascular diagnostics, lipid disorder management, ischemic heart disease follow-ups, and preventative cardiology.',
    areasOfExpertise: ['Clinical Cardiology', 'ECG Analysis', 'Hypertension Optimization', 'Cardiac Risk Stratification'],
    consultationDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    consultationTime: '06:00 PM – 09:00 PM',
    roomNumber: 'Chamber 105',
    appointmentEnabled: true,
    featured: true,
    displayOrder: 3,
    status: 'ACTIVE',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z'
  },
  {
    id: 'doc-04',
    name: 'Dr. Nandini Sengupta',
    nameBn: 'ডাঃ নন্দিনী সেনগুপ্ত',
    slug: 'dr-nandini-sengupta',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    departmentId: 'dept-gynecology',
    designation: 'Consultant Obstetrician & Gynecologist',
    qualification: 'MBBS, MS (O&G), DNB',
    registrationNumber: 'WBMC-49811',
    shortBio: 'Empathetic specialist in adolescent reproductive health, antenatal consultations, PCOS wellness, and menopausal care.',
    areasOfExpertise: ['Antenatal Guidance', 'PCOS / PCOD Management', 'Adolescent Gynecology', 'Cervical Health Screenings'],
    consultationDays: ['Wed', 'Fri', 'Sat'],
    consultationTime: '11:00 AM – 03:00 PM',
    roomNumber: 'Chamber 102',
    appointmentEnabled: true,
    featured: true,
    displayOrder: 4,
    status: 'ACTIVE',
    createdAt: '2026-01-11T09:00:00.000Z',
    updatedAt: '2026-01-11T09:00:00.000Z'
  }
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-01',
    name: 'Comprehensive Health & Preventive Checkup',
    nameBn: 'সার্বিক স্বাস্থ্য পরীক্ষা ও প্রতিরোধমূলক চেকআপ',
    slug: 'comprehensive-health-checkup',
    shortDescription: 'Full clinical evaluation including complete blood count, blood sugar, lipid profile, liver & kidney panels, and doctor consultation.',
    description: 'CareOn’s signature preventive health evaluation package structured to detect early markers of metabolic and lifestyle conditions with complete clinical review.',
    departmentId: 'dept-gen-med',
    category: 'Preventive',
    serviceType: 'BOTH',
    availableForHome: true,
    availableAtClinic: true,
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Overnight fasting of 8-10 hours required for fasting glucose and lipid panel.',
      'Drink normal water as needed.',
      'Bring recent medication details and previous medical reports.'
    ],
    reportTurnaroundTime: 'Same-day evening or 24 hours',
    bookingEnabled: true,
    featured: true,
    displayOrder: 1,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'srv-02',
    name: '12-Lead Diagnostic ECG & Rhythm Evaluation',
    nameBn: '১২-লিড ইসিজি ও রিদম মূল্যায়ন',
    slug: 'diagnostic-ecg',
    shortDescription: 'High-precision digital 12-lead Electrocardiogram interpreted by our consultant cardiologists.',
    description: 'Immediate non-invasive electrical heart rhythm tracing for evaluating chest discomfort, palpitations, breathlessness, or pre-operative medical fitness.',
    departmentId: 'dept-cardiology',
    category: 'Diagnostic',
    serviceType: 'CLINIC',
    availableForHome: false,
    availableAtClinic: true,
    icon: 'Heart',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Wear loose, comfortable clothing for easy chest electrode placement.',
      'No fasting required.'
    ],
    reportTurnaroundTime: 'Immediate within 30 minutes',
    bookingEnabled: true,
    featured: true,
    displayOrder: 2,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'srv-03',
    name: 'Child Wellness & Growth Assessment',
    nameBn: 'শিশু স্বাস্থ্য ও শারীরিক বৃদ্ধি মূল্যায়ন',
    slug: 'child-growth-assessment',
    shortDescription: 'Detailed developmental milestones check, height-weight percentile mapping, and nutritional guidance.',
    description: 'Structured pediatrician-led examination for monitoring child physical growth, vision & hearing reflexes, motor skill development, and immunization schedule verification.',
    departmentId: 'dept-pediatrics',
    category: 'Consultation',
    serviceType: 'CLINIC',
    availableForHome: false,
    availableAtClinic: true,
    icon: 'Baby',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Bring child’s immunization record book and birth records.',
      'Prepare any specific dietary or sleep concerns beforehand.'
    ],
    reportTurnaroundTime: 'Delivered at consultation',
    bookingEnabled: true,
    featured: true,
    displayOrder: 3,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'srv-04',
    name: 'Women’s Wellness & Antenatal Care',
    nameBn: 'নারী স্বাস্থ্য ও প্রসূতি পরামর্শ',
    slug: 'antenatal-womens-wellness',
    shortDescription: 'Personalized clinical consultations for expectant mothers, hormonal balance, and preventative gynecological screenings.',
    description: 'CareOn provides private, empathetic clinical care for mothers-to-be, trimester-by-trimester health monitoring, and routine pelvic wellness checks.',
    departmentId: 'dept-gynecology',
    category: 'Specialized',
    serviceType: 'CLINIC',
    availableForHome: false,
    availableAtClinic: true,
    icon: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Bring previous ultrasound reports and current prescription sheets.',
      'Consultation does not require prior fasting.'
    ],
    reportTurnaroundTime: 'Immediate clinical review',
    bookingEnabled: true,
    featured: true,
    displayOrder: 4,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'srv-05',
    name: 'Doorstep Blood Sample & Lab Collection',
    nameBn: 'বাড়ি থেকে ব্লাড স্যাম্পল ও ল্যাব কালেকশন',
    slug: 'doorstep-blood-sample-collection',
    shortDescription: 'Trained phlebotomist visit to your home for safe, hygienic blood, urine and routine diagnostic sample pickup.',
    description: 'Hygienic, temperature-controlled doorstep diagnostic sample collection across Contai and surrounding localities for elderly or bedridden patients.',
    departmentId: 'dept-gen-med',
    category: 'Diagnostic',
    serviceType: 'HOME',
    availableForHome: true,
    availableAtClinic: false,
    icon: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Keep patient resting comfortably prior to sample draw.',
      'Confirm if fasting is required for the requested panel.'
    ],
    reportTurnaroundTime: 'Digital delivery within 12-24 hours',
    bookingEnabled: true,
    featured: true,
    displayOrder: 5,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  },
  {
    id: 'srv-06',
    name: 'Home Nursing & Vital Signs Monitoring',
    nameBn: 'হোম নার্সিং ও ভাইটাল মনিটরিং সেবা',
    slug: 'home-nursing-vital-monitoring',
    shortDescription: 'Professional at-home vital sign monitoring (BP, Blood Glucose, SpO2), injection administration, and dressing changes.',
    description: 'Certified healthcare assistant home visits for post-discharge wound dressing, regular blood pressure optimization, insulin education, and basic patient care support.',
    departmentId: 'dept-gen-med',
    category: 'Specialized',
    serviceType: 'HOME',
    availableForHome: true,
    availableAtClinic: false,
    icon: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    preparationInstructions: [
      'Keep recent doctor prescription sheets ready for the nursing attendant.',
      'Ensure comfortable seating / bedding arrangement.'
    ],
    reportTurnaroundTime: 'Immediate clinical recording',
    bookingEnabled: true,
    featured: true,
    displayOrder: 6,
    status: 'ACTIVE',
    createdAt: '2026-01-12T10:00:00.000Z',
    updatedAt: '2026-01-12T10:00:00.000Z'
  }
];

export const DEFAULT_PATIENT_STORIES: PatientStory[] = [
  {
    id: 'story-01',
    patientDisplayName: 'Subhashish Roy',
    patientDisplayNameBn: 'শুভাশিস রায়',
    story: 'Dr. Arindam Banerjee listened with genuine patience when managing my father’s long-standing diabetes and fluctuating blood pressure. The clinic environment is exceptionally calm, clean, and unhurried.',
    storyBn: 'ডাঃ অরিন্দম ব্যানার্জী আমার বাবার দীর্ঘদিনের ডায়াবেটিস ও রক্তচাপ সংক্রান্ত সমস্যা অত্যন্ত মনোযোগ দিয়ে শুনেছেন। ক্লিনিকের পরিবেশ সত্যিই শান্ত এবং পরিচ্ছন্ন।',
    relatedDoctorId: 'doc-01',
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
    story: 'Visiting a clinic with a toddler is usually stressful, but Dr. Sarmistha Mukherjee made our 3-year-old completely comfortable during the wellness check. We deeply appreciate the gentle and attentive care.',
    storyBn: 'ছোট বাচ্চাকে নিয়ে ক্লিনিকে যাওয়া সাধারণত চিন্তার বিষয়, কিন্তু ডাঃ শর্মিষ্ঠা মুখার্জী আমাদের ৩ বছরের সন্তানকে পরম স্নেহে দেখেছেন। এই আন্তরিকতা প্রশংসনীয়।',
    relatedDoctorId: 'doc-02',
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
    story: 'The diagnostic ECG and preventive checkup was completely smooth. From reception to consultation with Dr. Debabrata Roy, everything was transparent with zero unnecessary delays.',
    storyBn: 'ডায়াগনস্টিক ইসিজি এবং প্রিভেন্টিভ চেকআপ খুব সুন্দরভাবে সম্পন্ন হয়েছে। রিসেপশন থেকে ডাঃ দেবব্রত রায়ের পরামর্শ পর্যন্ত সবকিছু ছিল স্বচ্ছ।',
    relatedDoctorId: 'doc-03',
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
    requestType: 'DOCTOR',
    bookingType: 'DOCTOR',
    doctorId: 'doc-01',
    doctorName: 'Dr. Arindam Banerjee',
    department: 'General Medicine & Diabetology',
    preferredDate: '2026-08-28',
    preferredTime: 'Evening',
    confirmedDate: '2026-08-28',
    confirmedTime: '06:30 PM',
    confirmedDoctorId: 'doc-01',
    confirmedDoctorName: 'Dr. Arindam Banerjee',
    confirmedDepartment: 'General Medicine & Diabetology',
    confirmedAt: '2026-08-27T10:15:00.000Z',
    confirmedBy: 'Reception Desk',
    patientName: 'Ramen Sen',
    phone: '9933335131',
    email: 'ramen.sen@example.com',
    reason: 'Follow-up consultation for blood sugar and routine blood pressure review.',
    status: 'CONFIRMED',
    adminNotes: 'Patient contacted on phone. Confirmed slot for Chamber 101 with Dr. Arindam Banerjee.',
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
  },
  {
    id: 'apt-req-003',
    requestType: 'DOCTOR',
    bookingType: 'DOCTOR',
    doctorId: 'doc-02',
    doctorName: 'Dr. Debarati Mukherjee',
    department: 'Paediatrics & Child Healthcare',
    preferredDate: '2026-08-30',
    preferredTime: 'Morning',
    patientName: 'Mousumi Paul',
    phone: '9933335131',
    email: 'mousumi.p@example.com',
    reason: 'Child seasonal cough and routine growth review.',
    status: 'CONTACTED',
    contactedAt: '2026-08-27T11:05:00.000Z',
    contactedBy: 'Intake Staff',
    adminNotes: 'Spoke with mother. Verifying doctor chamber timings.',
    createdAt: '2026-08-27T10:00:00.000Z',
    updatedAt: '2026-08-27T11:05:00.000Z'
  }
];

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  clinicName: 'CareOn Medical Clinic',
  tagline: 'Caring Beyond Treatment',
  positioning: 'Trusted Healthcare for You & Your Family',
  phone: '9933335131',
  emergencyPhone: '9933520248',
  whatsapp: '9933335131',
  email: 'info@careonmedical.in',
  address: 'Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401',
  locationName: 'Contai, Purba Medinipur',
  mapLink: '',
  openingHours: 'Mon – Sat: 09:00 AM – 07:00 PM | Sunday: Closed',
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
    adminEmail: 'admin@careonclinic.com',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'WebsiteSettings',
    entityId: 'settings-root',
    entityName: 'CareOn Master Settings',
    details: 'Phase 03 Content Database and CMS Control Center provisioned with verified seed records.'
  },
  {
    id: 'log-002',
    timestamp: '2026-08-27T09:15:00.000Z',
    adminUserId: 'usr-admin-01',
    adminEmail: 'admin@careonclinic.com',
    action: 'DOCTOR_ACTIVATED',
    entityType: 'Doctor',
    entityId: 'doc-01',
    entityName: 'Dr. Arindam Banerjee',
    details: 'Consultation hours verified and published to public directory.'
  },
  {
    id: 'log-003',
    timestamp: '2026-08-27T10:15:00.000Z',
    adminUserId: 'usr-appt-01',
    adminEmail: 'helpdesk@careonclinic.com',
    action: 'APPOINTMENT_STATUS_UPDATED',
    entityType: 'AppointmentRequest',
    entityId: 'apt-req-001',
    entityName: 'Ramen Sen (Dr. Arindam Banerjee)',
    details: 'Status changed from NEW to CONFIRMED after WhatsApp verification.'
  }
];
