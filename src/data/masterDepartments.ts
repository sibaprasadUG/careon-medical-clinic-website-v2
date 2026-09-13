import { Department } from '../types';

export function deterministicUuid(str: string): string {
  // Generate deterministic RFC4122 v4 UUID from string
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = ('00000000' + (h1 >>> 0).toString(16)).slice(-8);
  const hex2 = ('00000000' + (h2 >>> 0).toString(16)).slice(-8);
  const hex3 = ('00000000' + ((h1 ^ 0x12345678) >>> 0).toString(16)).slice(-8);
  const hex4 = ('00000000' + ((h2 ^ 0x87654321) >>> 0).toString(16)).slice(-8);
  const raw = `${hex1}${hex2}${hex3}${hex4}`;
  return `${raw.substring(0, 8)}-${raw.substring(8, 12)}-4${raw.substring(13, 16)}-a${raw.substring(17, 20)}-${raw.substring(20, 32)}`;
}

export interface MasterDepartmentDef {
  order: number;
  name: string;
  nameBn: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  category: string;
}

export const MASTER_DEPARTMENT_DEFINITIONS: MasterDepartmentDef[] = [
  {
    order: 1,
    name: 'General Medicine / Internal Medicine',
    nameBn: 'জেনারেল মেডিসিন ও অভ্যন্তরীণ রোগ',
    slug: 'general-medicine',
    shortDescription: 'Comprehensive primary care, acute illness management, and adult chronic disease prevention.',
    description: 'Diagnosis and non-surgical management of common fevers, infections, metabolic disorders, hypertension, diabetes, and multi-system medical conditions.',
    icon: 'Stethoscope',
    category: 'Core Medical'
  },
  {
    order: 2,
    name: 'Family Medicine',
    nameBn: 'পারিবারিক চিকিৎসা ও সাধারণ স্বাস্থ্য',
    slug: 'family-medicine',
    shortDescription: 'Continuous, comprehensive healthcare for individuals and families across all ages.',
    description: 'Holistic family-centric healthcare, preventive health checks, routine disease screening, and continuous primary medical management.',
    icon: 'Users',
    category: 'Core Medical'
  },
  {
    order: 3,
    name: 'Emergency Medicine',
    nameBn: 'জরুরি চিকিৎসা সেবা ও ট্রমা কেয়ার',
    slug: 'emergency-medicine',
    shortDescription: 'Immediate evaluation, stabilization, and resuscitation for acute medical and trauma emergencies.',
    description: 'Round-the-clock clinical triage, acute cardiopulmonary resuscitation, stabilization of critical illnesses, and emergency referral coordination.',
    icon: 'AlertCircle',
    category: 'Critical Care'
  },
  {
    order: 4,
    name: 'Preventive & Lifestyle Medicine',
    nameBn: 'প্রতিরোধমূলক ও লাইফস্টাইল মেডিসিন',
    slug: 'preventive-lifestyle-medicine',
    shortDescription: 'Evidence-based interventions to prevent, treat, and reverse chronic lifestyle-related diseases.',
    description: 'Personalized preventive health screening, metabolic syndrome reversal, cardiovascular risk mitigation, and lifestyle modification plans.',
    icon: 'ShieldCheck',
    category: 'Preventive & Wellness'
  },
  {
    order: 5,
    name: 'Geriatric Medicine',
    nameBn: 'প্রবীণ স্বাস্থ্য ও জেরিয়াট্রিক কেয়ার',
    slug: 'geriatric-medicine',
    shortDescription: 'Specialized medical care addressing the unique, complex health needs of elderly adults.',
    description: 'Comprehensive geriatric assessment, polypharmacy management, cognitive screening, mobility support, and age-related chronic disease monitoring.',
    icon: 'UserCheck',
    category: 'Core Medical'
  },
  {
    order: 6,
    name: 'Cardiology',
    nameBn: 'কার্ডিওলজি ও হৃদরোগ বিভাগ',
    slug: 'cardiology',
    shortDescription: 'Advanced clinical diagnosis, ECG rhythm evaluation, and preventive cardiovascular care.',
    description: 'Expert management of hypertension, ischemic heart disease, heart failure, arrhythmias, and comprehensive post-cardiac rehabilitation guidance.',
    icon: 'Heart',
    category: 'Cardiovascular'
  },
  {
    order: 7,
    name: 'Cardiothoracic & Vascular Surgery',
    nameBn: 'কার্ডিওথোরাসিক ও ভাস্কুলার সার্জারি',
    slug: 'ctvs',
    shortDescription: 'Surgical management of disorders affecting organs inside the thorax and peripheral vessels.',
    description: 'Evaluation and pre/post-operative surgical guidance for coronary bypass, valvular conditions, thoracic pathologies, and major vascular disorders.',
    icon: 'Activity',
    category: 'Surgical Disciplines'
  },
  {
    order: 8,
    name: 'Diabetology',
    nameBn: 'ডায়াবেটোলজি ও বহুমূত্র রোগ',
    slug: 'diabetology',
    shortDescription: 'Dedicated diabetes management, HbA1c control, and diabetic complication screening.',
    description: 'Comprehensive glycemic optimization, insulin therapy management, diabetic neuropathy/nephropathy screening, and customized diabetic dietary advice.',
    icon: 'Activity',
    category: 'Endocrinology'
  },
  {
    order: 9,
    name: 'Endocrinology',
    nameBn: 'এন্ডোক্রাইনোলজি ও হরমোন রোগ',
    slug: 'endocrinology',
    shortDescription: 'Specialized diagnosis and treatment of hormonal imbalances and metabolic conditions.',
    description: 'Expert care for thyroid disorders (hypo/hyperthyroidism), pituitary conditions, adrenal disorders, osteoporosis, and reproductive endocrinology.',
    icon: 'Layers',
    category: 'Endocrinology'
  },
  {
    order: 10,
    name: 'Nephrology',
    nameBn: 'নেফ্রোলজি ও কিডনি রোগ',
    slug: 'nephrology',
    shortDescription: 'Comprehensive management of acute and chronic kidney disease and renal disorders.',
    description: 'Clinical evaluation of renal impairment, proteinuria, glomerular diseases, hypertension-related kidney injury, and dialysis management guidance.',
    icon: 'Filter',
    category: 'Renal & Urology'
  },
  {
    order: 11,
    name: 'Neurology',
    nameBn: 'নিউরোলজি ও স্নায়ুরোগ',
    slug: 'neurology',
    shortDescription: 'Diagnosis and clinical care for brain, spinal cord, and peripheral nerve disorders.',
    description: 'Specialized management of headaches, epilepsy, stroke recovery, Parkinson’s disease, peripheral neuropathy, and neuromuscular disorders.',
    icon: 'Zap',
    category: 'Neurosciences'
  },
  {
    order: 12,
    name: 'Neurosurgery',
    nameBn: 'নিউরোসার্জারি ও স্পাইন সার্জারি',
    slug: 'neurosurgery',
    shortDescription: 'Surgical management of brain tumors, spinal trauma, and neurovascular diseases.',
    description: 'Pre-operative neurosurgical consultation, brain injury management, spinal cord compression relief, and post-neurosurgical rehabilitation care.',
    icon: 'Brain',
    category: 'Neurosciences'
  },
  {
    order: 13,
    name: 'Psychiatry & Mental Health',
    nameBn: 'সাইকিয়াট্রি ও মানসিক স্বাস্থ্য',
    slug: 'psychiatry-mental-health',
    shortDescription: 'Compassionate medical care for emotional, behavioral, and psychiatric conditions.',
    description: 'Evidence-based psychiatric evaluation, mood disorder treatment (depression, bipolar), anxiety disorders, sleep disturbances, and psychotic illness care.',
    icon: 'Smile',
    category: 'Mental Health'
  },
  {
    order: 14,
    name: 'Psychology / Clinical Psychology',
    nameBn: 'ক্লিনিক্যাল সাইকোলজি ও কাউন্সেলিং',
    slug: 'clinical-psychology',
    shortDescription: 'Psychological assessment, cognitive behavioral therapy, and behavioral counselling.',
    description: 'Individual psychotherapy, stress and trauma management, child behavioral assessments, and family relationship counselling sessions.',
    icon: 'HeartHandshake',
    category: 'Mental Health'
  },
  {
    order: 15,
    name: 'Pulmonology / Respiratory Medicine',
    nameBn: 'পালমোনোলজি ও বক্ষব্যাধি',
    slug: 'pulmonology',
    shortDescription: 'Diagnosis and management of pulmonary disorders, asthma, and chronic chest conditions.',
    description: 'Clinical care for bronchial asthma, COPD, pulmonary tuberculosis, interstitial lung diseases, chronic cough, and allergy-induced bronchospasm.',
    icon: 'Wind',
    category: 'Respiratory'
  },
  {
    order: 16,
    name: 'Sleep Medicine',
    nameBn: 'স্লিপ মেডিসিন ও ঘুম সম্পর্কিত ব্যাধি',
    slug: 'sleep-medicine',
    shortDescription: 'Assessment and therapy for sleep apnea, insomnia, and nocturnal breathing disorders.',
    description: 'Polysomnography guidance, obstructive sleep apnea (OSA) evaluation, CPAP therapy monitoring, and chronic insomnia behavioral solutions.',
    icon: 'Moon',
    category: 'Respiratory'
  },
  {
    order: 17,
    name: 'Gastroenterology',
    nameBn: 'গ্যাস্ট্রোএন্টারোলজি ও পরিপাকতন্ত্র',
    slug: 'gastroenterology',
    shortDescription: 'Diagnosis and treatment of disorders of the esophagus, stomach, intestines, and pancreas.',
    description: 'Expert care for acid reflux, peptic ulcers, irritable bowel syndrome (IBS), chronic constipation, inflammatory bowel diseases (IBD), and pancreatitis.',
    icon: 'Cross',
    category: 'Gastroenterology'
  },
  {
    order: 18,
    name: 'Hepatology',
    nameBn: 'হেপাটোলজি ও লিভার রোগ',
    slug: 'hepatology',
    shortDescription: 'Dedicated specialized care for liver, gallbladder, and biliary system disorders.',
    description: 'Management of viral hepatitis, non-alcoholic fatty liver disease (NAFLD), cirrhosis, jaundice, and comprehensive metabolic liver screening.',
    icon: 'Shield',
    category: 'Gastroenterology'
  },
  {
    order: 19,
    name: 'Rheumatology',
    nameBn: 'রিউমাটোলজি ও বাতব্যাধি',
    slug: 'rheumatology',
    shortDescription: 'Specialized diagnosis and medical care for autoimmune and joint inflammatory diseases.',
    description: 'Expert care for rheumatoid arthritis, ankylosing spondylitis, lupus (SLE), gout, scleroderma, and chronic joint inflammatory conditions.',
    icon: 'Activity',
    category: 'Musculoskeletal'
  },
  {
    order: 20,
    name: 'Clinical Immunology',
    nameBn: 'ক্লিনিক্যাল ইমিউনোলজি ও অ্যালার্জি',
    slug: 'clinical-immunology',
    shortDescription: 'Diagnosis and management of immune system deficiencies, auto-inflammatory disorders, and severe allergies.',
    description: 'Clinical workup of recurrent atypical infections, primary immunodeficiencies, systemic autoimmune conditions, and anaphylaxis prevention.',
    icon: 'Shield',
    category: 'Allied & Support'
  },
  {
    order: 21,
    name: 'Infectious Diseases',
    nameBn: 'সংক্রামক রোগ বিভাগ',
    slug: 'infectious-diseases',
    shortDescription: 'Expert management of complex bacterial, viral, fungal, and tropical infections.',
    description: 'Evaluation of fever of unknown origin (FUO), vector-borne diseases (dengue, malaria), post-COVID sequelae, and antimicrobial stewardship.',
    icon: 'ShieldAlert',
    category: 'Core Medical'
  },
  {
    order: 22,
    name: 'Medical Oncology',
    nameBn: 'মেডিকেল অনকোলজি ও কেমোথেরাপি',
    slug: 'medical-oncology',
    shortDescription: 'Medical management of cancer using systemic chemotherapy, immunotherapy, and targeted therapies.',
    description: 'Cancer diagnosis, staging, systemic chemotherapy planning, immunotherapy guidance, and personalized cancer supportive care.',
    icon: 'Activity',
    category: 'Oncology'
  },
  {
    order: 23,
    name: 'Surgical Oncology',
    nameBn: 'সার্জিক্যাল অনকোলজি ও ক্যান্সার অস্ত্রোপচার',
    slug: 'surgical-oncology',
    shortDescription: 'Surgical management and resection of solid benign and malignant tumors.',
    description: 'Pre-operative oncological evaluation, tumor excision guidance, biopsy review, and multidisciplinary cancer surgical planning.',
    icon: 'Scissors',
    category: 'Oncology'
  },
  {
    order: 24,
    name: 'Radiation Oncology',
    nameBn: 'রেডিয়েশন অনকোলজি ও রেডিওথেরাপি',
    slug: 'radiation-oncology',
    shortDescription: 'Radiation therapy consultation and planning for benign and malignant neoplasms.',
    description: 'Consultation for external beam radiation therapy (EBRT), brachytherapy planning, radiation side-effect management, and palliative radiation.',
    icon: 'Sun',
    category: 'Oncology'
  },
  {
    order: 25,
    name: 'General Surgery',
    nameBn: 'জেনারেল সার্জারি ও সাধারণ অস্ত্রোপচার',
    slug: 'general-surgery',
    shortDescription: 'Comprehensive surgical diagnosis and care for general abdominal and soft tissue conditions.',
    description: 'Evaluation and surgical management of hernias, appendicitis, gallstones, hydrocele, hemorrhoids, and minor soft-tissue lesions.',
    icon: 'Scissors',
    category: 'Surgical Disciplines'
  },
  {
    order: 26,
    name: 'Laparoscopic / Minimal Access Surgery',
    nameBn: 'ল্যাপারোস্কোপিক ও মিনিম্যাল অ্যাক্সেস সার্জারি',
    slug: 'laparoscopic-surgery',
    shortDescription: 'Minimally invasive keyhole surgical techniques for rapid recovery and minimal scarring.',
    description: 'Advanced laparoscopic cholecystectomy, hernia repair, appendectomy, diagnostic laparoscopy, and fast-track surgical recovery.',
    icon: 'Maximize2',
    category: 'Surgical Disciplines'
  },
  {
    order: 27,
    name: 'Gastrointestinal Surgery',
    nameBn: 'গ্যাস্ট্রোইনটেস্টাইনাল সার্জারি',
    slug: 'gi-surgery',
    shortDescription: 'Advanced surgical care for complex diseases of the gastrointestinal tract.',
    description: 'Surgical treatment for stomach, bowel, pancreatic, and biliary tract diseases, bowel obstructions, and complex abdominal surgery.',
    icon: 'PlusSquare',
    category: 'Surgical Disciplines'
  },
  {
    order: 28,
    name: 'Colorectal Surgery',
    nameBn: 'কোলোরেক্টাল সার্জারি ও প্রোক্টোলজি',
    slug: 'colorectal-surgery',
    shortDescription: 'Surgical and medical management of colon, rectum, and anal canal disorders.',
    description: 'Specialized treatment for piles (hemorrhoids), anal fissure, fistula-in-ano, pilonidal sinus, and colorectal screening consultations.',
    icon: 'Activity',
    category: 'Surgical Disciplines'
  },
  {
    order: 29,
    name: 'Breast Surgery',
    nameBn: 'ব্রেস্ট সার্জারি ও স্তন রোগ বিভাগ',
    slug: 'breast-surgery',
    shortDescription: 'Specialized clinical assessment, screening, and surgery for benign and malignant breast disorders.',
    description: 'Evaluation of breast lumps, mastitis, fibroadenomas, breast cancer screening, and oncoplastic surgical guidance.',
    icon: 'Shield',
    category: 'Surgical Disciplines'
  },
  {
    order: 30,
    name: 'Vascular Surgery',
    nameBn: 'ভাস্কুলার ও রক্তনালী সার্জারি',
    slug: 'vascular-surgery',
    shortDescription: 'Diagnosis and treatment of arterial, venous, and lymphatic circulatory disorders.',
    description: 'Management of varicose veins, deep vein thrombosis (DVT), peripheral arterial disease (PAD), diabetic foot ulcers, and arteriovenous fistula creation.',
    icon: 'GitBranch',
    category: 'Surgical Disciplines'
  },
  {
    order: 31,
    name: 'Plastic & Reconstructive Surgery',
    nameBn: 'প্লাস্টিক ও পুনর্গঠনমূলক সার্জারি',
    slug: 'plastic-reconstructive-surgery',
    shortDescription: 'Restoration, reconstruction, and cosmetic enhancement of body structures.',
    description: 'Post-trauma reconstruction, burn scar management, cosmetic procedures, wound coverage flaps, and cleft lip/palate corrective consultation.',
    icon: 'Sparkles',
    category: 'Surgical Disciplines'
  },
  {
    order: 32,
    name: 'Paediatric Medicine',
    nameBn: 'শিশু চিকিৎসা ও পেডিয়াট্রিক্স',
    slug: 'paediatric-medicine',
    shortDescription: 'Comprehensive health assessment, vaccination, and illness care for infants, children, and teens.',
    description: 'Routine developmental milestone checks, nutritional assessment, pediatric infectious disease management, and childhood asthma care.',
    icon: 'Baby',
    category: 'Child Health'
  },
  {
    order: 33,
    name: 'Paediatric Surgery',
    nameBn: 'শিশু সার্জারি ও পেডিয়াট্রিক সার্জারি',
    slug: 'paediatric-surgery',
    shortDescription: 'Surgical care tailored specifically for neonates, infants, and pediatric patients.',
    description: 'Surgical management of pediatric congenital anomalies, hernias, undescended testes, appendicitis, and childhood surgical emergencies.',
    icon: 'Scissors',
    category: 'Child Health'
  },
  {
    order: 34,
    name: 'Neonatology',
    nameBn: 'নিওনেটোলজি ও নবজাতক যত্ন',
    slug: 'neonatology',
    shortDescription: 'Intensive medical care for premature, low-birth-weight, and critically ill newborns.',
    description: 'Neonatal jaundice management, feeding guidance, premature infant growth monitoring, and high-risk newborn follow-up.',
    icon: 'Heart',
    category: 'Child Health'
  },
  {
    order: 35,
    name: 'Paediatric Cardiology',
    nameBn: 'শিশু হৃদরোগ ও পেডিয়াট্রিক কার্ডিওলজি',
    slug: 'paediatric-cardiology',
    shortDescription: 'Diagnosis and non-invasive management of congenital and acquired heart conditions in children.',
    description: 'Pediatric heart murmurs, ventricular septal defects (VSD), atrial septal defects (ASD), tetralogy of Fallot, and pediatric rhythm monitoring.',
    icon: 'HeartPulse',
    category: 'Child Health'
  },
  {
    order: 36,
    name: 'Paediatric Neurology',
    nameBn: 'শিশু স্নায়ুরোগ ও পেডিয়াট্রিক নিউরোলজি',
    slug: 'paediatric-neurology',
    shortDescription: 'Specialized care for neurological and developmental disorders in pediatric patients.',
    description: 'Management of childhood epilepsy, febrile seizures, cerebral palsy, autism spectrum disorder, ADHD, and developmental delays.',
    icon: 'Brain',
    category: 'Child Health'
  },
  {
    order: 37,
    name: 'Obstetrics & Gynaecology',
    nameBn: 'প্রসূতি ও স্ত্রীরোগ বিশেষজ্ঞ',
    slug: 'obstetrics-gynaecology',
    shortDescription: 'Comprehensive healthcare for women covering pregnancy, childbirth, and reproductive wellness.',
    description: 'Antenatal care, high-risk pregnancy monitoring, menstrual disorders, PCOS/PCOD management, cervical cancer screening, and menopausal wellness.',
    icon: 'UserCheck',
    category: 'Women & Maternity'
  },
  {
    order: 38,
    name: 'Maternal-Fetal Medicine',
    nameBn: 'মাতৃ ও গর্ভস্থ ভ্রূণ চিকিৎসা',
    slug: 'maternal-fetal-medicine',
    shortDescription: 'Advanced clinical care for high-risk pregnancies and fetal developmental health.',
    description: 'Fetal anomaly scan interpretation, maternal hypertension/gestational diabetes management, and high-risk obstetric monitoring.',
    icon: 'HeartHandshake',
    category: 'Women & Maternity'
  },
  {
    order: 39,
    name: 'Reproductive Medicine / Infertility',
    nameBn: 'বন্ধ্যাত্ব ও প্রজনন চিকিৎসা',
    slug: 'reproductive-medicine',
    shortDescription: 'Evidence-based fertility evaluation and assisted reproductive technology consultation.',
    description: 'Ovulation induction guidance, fertility counseling for couples, semen analysis evaluation, IUI/IVF readiness, and hormonal reproductive support.',
    icon: 'Heart',
    category: 'Women & Maternity'
  },
  {
    order: 40,
    name: 'Urology',
    nameBn: 'ইউরোলজি ও মূত্রনালী রোগ',
    slug: 'urology',
    shortDescription: 'Medical and surgical care for the urinary tract system and male reproductive organs.',
    description: 'Treatment of kidney stones, benign prostatic hyperplasia (BPH), urinary tract infections, urinary incontinence, and male urological conditions.',
    icon: 'Filter',
    category: 'Renal & Urology'
  },
  {
    order: 41,
    name: 'Andrology',
    nameBn: 'অ্যান্ড্রোলজি ও পুরুষ স্বাস্থ্য',
    slug: 'andrology',
    shortDescription: 'Specialized clinical diagnosis and care for male sexual and reproductive health.',
    description: 'Management of erectile dysfunction, male factor subfertility, hypogonadism, testosterone replacement therapy, and prostate wellness.',
    icon: 'User',
    category: 'Renal & Urology'
  },
  {
    order: 42,
    name: 'Orthopaedics',
    nameBn: 'অর্থোপেডিকস ও হাড়-জোড় চিকিৎসা',
    slug: 'orthopaedics',
    shortDescription: 'Diagnosis, conservative therapy, and surgical management of bones, joints, and ligaments.',
    description: 'Expert care for bone fractures, osteoarthritis, osteoporosis, back pain, sciatica, tendonitis, and musculoskeletal trauma.',
    icon: 'Activity',
    category: 'Musculoskeletal'
  },
  {
    order: 43,
    name: 'Joint Replacement',
    nameBn: 'জয়েন্ট রিপ্লেসমেন্ট সার্জারি',
    slug: 'joint-replacement',
    shortDescription: 'Advanced surgical consultation and rehabilitation for knee and hip arthroplasty.',
    description: 'Total knee replacement (TKR) and total hip replacement (THR) clinical evaluation, pre-operative counseling, and rapid recovery protocols.',
    icon: 'Layers',
    category: 'Musculoskeletal'
  },
  {
    order: 44,
    name: 'Sports Medicine',
    nameBn: 'স্পোর্টস মেডিসিন ও ক্রীড়া আঘাত',
    slug: 'sports-medicine',
    shortDescription: 'Prevention, diagnosis, and rehabilitation of athletic injuries and sports physical performance.',
    description: 'Clinical management of ACL/meniscal tears, rotator cuff injuries, sprains, stress fractures, and return-to-play sports rehabilitation.',
    icon: 'Zap',
    category: 'Musculoskeletal'
  },
  {
    order: 45,
    name: 'Physical Medicine & Rehabilitation',
    nameBn: 'ফিজিক্যাল মেডিসিন ও রিহ্যাবিলিটেশন',
    slug: 'pmr',
    shortDescription: 'Non-surgical restoration of functional mobility and quality of life for physical impairments.',
    description: 'Multidisciplinary rehabilitation for stroke, spinal cord injury, chronic musculoskeletal pain, neuropathy, and post-surgical functional deficit.',
    icon: 'Activity',
    category: 'Rehabilitation'
  },
  {
    order: 46,
    name: 'Pain Medicine',
    nameBn: 'পেইন মেডিসিন ও ব্যথা নিরাময়',
    slug: 'pain-medicine',
    shortDescription: 'Comprehensive interventional and clinical management of acute and chronic pain conditions.',
    description: 'Specialized treatment for chronic spine pain, sciatica, trigeminal neuralgia, cancer pain, joint pain, and neuropathic pain syndromes.',
    icon: 'Shield',
    category: 'Core Medical'
  },
  {
    order: 47,
    name: 'Rheumatology & Musculoskeletal Medicine',
    nameBn: 'রিউমাটোলজি ও পেশী-হাড়ের ব্যাধি',
    slug: 'rheumatology-musculoskeletal',
    shortDescription: 'Comprehensive care for autoimmune disorders affecting connective tissues and joints.',
    description: 'In-depth clinical care for lupus, scleroderma, polymyositis, vasculitis, and complex connective tissue disorders.',
    icon: 'Layers',
    category: 'Musculoskeletal'
  },
  {
    order: 48,
    name: 'Dermatology',
    nameBn: 'ডার্মাটোলজি ও ত্বক-চর্মরোগ',
    slug: 'dermatology',
    shortDescription: 'Comprehensive medical and cosmetic diagnosis for skin, hair, and nail conditions.',
    description: 'Expert treatment of eczema, psoriasis, acne, fungal infections, alopecia, vitiligo, and clinical dermatological procedures.',
    icon: 'Sparkles',
    category: 'Skin & Dermatology'
  },
  {
    order: 49,
    name: 'Venereology / Sexual Medicine',
    nameBn: 'যৌন রোগ ও ভেনেরিওলজি',
    slug: 'venereology',
    shortDescription: 'Confidential clinical diagnosis and treatment of sexually transmitted infections and wellness.',
    description: 'Diagnosis of STIs, confidential partner notification and management, genital dermatoses, and sexual health counselling.',
    icon: 'Shield',
    category: 'Skin & Dermatology'
  },
  {
    order: 50,
    name: 'ENT / Otorhinolaryngology',
    nameBn: 'ইএনটি (নাক, কান ও গলা বিভাগ)',
    slug: 'ent',
    shortDescription: 'Diagnosis and medical/surgical care for ear, nose, throat, and head-neck conditions.',
    description: 'Treatment of hearing loss, otitis media, sinusitis, allergic rhinitis, tonsillitis, voice disorders, and vertigo evaluation.',
    icon: 'Headphones',
    category: 'Eye & ENT'
  },
  {
    order: 51,
    name: 'Ophthalmology',
    nameBn: 'চক্ষুরোগ বিভাগ ও অপথালমোলজি',
    slug: 'ophthalmology',
    shortDescription: 'Comprehensive visual testing, refractive care, and medical treatment for eye conditions.',
    description: 'Assessment of refractive errors, cataract evaluation, diabetic retinopathy screening, glaucoma monitoring, and dry eye treatment.',
    icon: 'Eye',
    category: 'Eye & ENT'
  },
  {
    order: 52,
    name: 'Dental / Dentistry',
    nameBn: 'দন্ত চিকিৎসা ও ডেন্টিস্ট্রি',
    slug: 'dental-dentistry',
    shortDescription: 'Preventive, restorative, and aesthetic oral healthcare and dental surgery.',
    description: 'Dental scaling, root canal therapy (RCT), dental fillings, tooth extractions, crown & bridge placement, and periodontal care.',
    icon: 'Smile',
    category: 'Dental & Oral Health'
  },
  {
    order: 53,
    name: 'Oral & Maxillofacial Surgery',
    nameBn: 'মুখ ও চোয়াল সার্জারি',
    slug: 'maxillofacial-surgery',
    shortDescription: 'Surgical treatment of diseases, injuries, and defects involving the face, mouth, and jaws.',
    description: 'Impacted wisdom tooth extraction, facial bone fracture repair, cyst excision, and corrective jaw surgery consultations.',
    icon: 'Scissors',
    category: 'Dental & Oral Health'
  },
  {
    order: 54,
    name: 'Radiology & Imaging',
    nameBn: 'রেডিওলজি ও মেডিকেল ইমেজিং',
    slug: 'radiology-imaging',
    shortDescription: 'Diagnostic medical imaging including X-rays, ultrasonography, and specialized scans.',
    description: 'High-resolution digital X-ray interpretation, abdominal/pelvic USG, Doppler scans, fetal scans, and radiological reporting.',
    icon: 'Camera',
    category: 'Diagnostic & Support'
  },
  {
    order: 55,
    name: 'Interventional Radiology',
    nameBn: 'ইন্টারভেনশনাল রেডিওলজি',
    slug: 'interventional-radiology',
    shortDescription: 'Minimally invasive image-guided diagnosis and therapeutic medical procedures.',
    description: 'Image-guided biopsies, drainage procedures, vascular embolization guidance, and catheter placements.',
    icon: 'Crosshair',
    category: 'Diagnostic & Support'
  },
  {
    order: 56,
    name: 'Pathology / Laboratory Medicine',
    nameBn: 'প্যাথলজি ও ল্যাবরেটরি মেডিসিন',
    slug: 'pathology-laboratory',
    shortDescription: 'Accurate clinical diagnostic laboratory testing covering blood, body fluids, and tissues.',
    description: 'Automated haematology, clinical chemistry, routine urine/stool analysis, serological testing, and quality-controlled lab reporting.',
    icon: 'FlaskConical',
    category: 'Diagnostic & Support'
  },
  {
    order: 57,
    name: 'Microbiology',
    nameBn: 'ক্লিনিক্যাল মাইক্রোবায়োলজি',
    slug: 'microbiology',
    shortDescription: 'Identification of infectious pathogens and antimicrobial sensitivity testing.',
    description: 'Blood, urine, and sputum cultures, fungal stains, Gram staining, antibiotic sensitivity panels, and hospital infection surveillance.',
    icon: 'Bug',
    category: 'Diagnostic & Support'
  },
  {
    order: 58,
    name: 'Clinical Biochemistry',
    nameBn: 'ক্লিনিক্যাল বায়োকেমিস্ট্রি',
    slug: 'clinical-biochemistry',
    shortDescription: 'Biochemical analysis of bodily fluids for metabolic, organ function, and hormonal evaluation.',
    description: 'Blood glucose testing, liver function tests (LFT), kidney function tests (KFT), lipid profiles, electrolytes, and cardiac enzymes.',
    icon: 'TestTube',
    category: 'Diagnostic & Support'
  },
  {
    order: 59,
    name: 'Haematology',
    nameBn: 'হেমাটোলজি ও রক্তরোগ বিভাগ',
    slug: 'haematology',
    shortDescription: 'Clinical and laboratory investigation of blood diseases, anemias, and coagulation disorders.',
    description: 'Evaluation of iron deficiency, thalassaemia screening, leukemias, bleeding and clotting disorders, and complete blood counts.',
    icon: 'Droplet',
    category: 'Diagnostic & Support'
  },
  {
    order: 60,
    name: 'Transfusion Medicine / Blood Bank',
    nameBn: 'ব্লাড ব্যাংক ও ট্রান্সফিউশন মেডিসিন',
    slug: 'transfusion-medicine',
    shortDescription: 'Safe blood grouping, crossmatching, and blood component therapy coordination.',
    description: 'ABO and Rh typing, antibody screening, packed red blood cells and platelet component counseling, and safe transfusion guidance.',
    icon: 'Droplets',
    category: 'Diagnostic & Support'
  },
  {
    order: 61,
    name: 'Anaesthesiology',
    nameBn: 'অ্যানেস্থেসিওলজি ও সংবেদন বিভাগ',
    slug: 'anaesthesiology',
    shortDescription: 'Pre-operative anesthetic fitness assessment, surgical pain relief, and resuscitation.',
    description: 'Comprehensive pre-anesthesia evaluation, risk stratification, pain management techniques, and post-procedural recovery monitoring.',
    icon: 'Activity',
    category: 'Critical Care'
  },
  {
    order: 62,
    name: 'Critical Care / Intensive Care',
    nameBn: 'ক্রিটিক্যাল কেয়ার ও আইসিইউ',
    slug: 'critical-care',
    shortDescription: 'Intensive medical monitoring and organ support for life-threatening acute illnesses.',
    description: 'Management of septic shock, acute respiratory distress (ARDS), multi-organ failure, hemodynamic instability, and ICU care pathways.',
    icon: 'HeartPulse',
    category: 'Critical Care'
  },
  {
    order: 63,
    name: 'Trauma & Emergency Surgery',
    nameBn: 'ট্রমা ও জরুরি ট্রমা সার্জারি',
    slug: 'trauma-surgery',
    shortDescription: 'Rapid surgical intervention and management for acute polytrauma and accidental injuries.',
    description: 'Initial trauma stabilization, surgical wound debridement, fracture management, internal organ injury triage, and emergency surgical care.',
    icon: 'AlertTriangle',
    category: 'Surgical Disciplines'
  },
  {
    order: 64,
    name: 'Burns & Reconstructive Surgery',
    nameBn: 'বার্ন ও পুনর্গঠনমূলক চিকিৎসা',
    slug: 'burns-surgery',
    shortDescription: 'Specialized care for acute thermal injuries, chemical burns, and contracture releases.',
    description: 'Acute burn wound dressings, infection prevention, skin grafting consultation, and functional post-burn physical rehabilitation.',
    icon: 'Flame',
    category: 'Surgical Disciplines'
  },
  {
    order: 65,
    name: 'Nutrition & Dietetics',
    nameBn: 'পুষ্টি ও ক্লিনিক্যাল ডায়েটেটিক্স',
    slug: 'nutrition-dietetics',
    shortDescription: 'Clinical dietary planning and nutritional therapy for metabolic and health conditions.',
    description: 'Personalized diet charts for diabetes, renal disease, fatty liver, cardiovascular health, pregnancy nutrition, and weight management.',
    icon: 'Apple',
    category: 'Allied & Support'
  },
  {
    order: 66,
    name: 'Physiotherapy',
    nameBn: 'ফিজিওথেরাপি ও শারীরিক পুনর্বাসন',
    slug: 'physiotherapy',
    shortDescription: 'Physical rehabilitation, therapeutic exercises, and pain-relieving modalities for mobility.',
    description: 'Targeted electrotherapy, ultrasound therapy, joint mobilization, postural correction, stroke rehabilitation, and spine pain relief.',
    icon: 'Activity',
    category: 'Rehabilitation'
  },
  {
    order: 67,
    name: 'Occupational Therapy',
    nameBn: 'অকুপেশনাল থেরাপি',
    slug: 'occupational-therapy',
    shortDescription: 'Therapeutic interventions helping patients regain independence in activities of daily living.',
    description: 'Fine motor skill retraining, sensory integration therapy, cognitive rehabilitation, adaptive equipment counseling, and pediatric developmental support.',
    icon: 'Briefcase',
    category: 'Rehabilitation'
  },
  {
    order: 68,
    name: 'Speech & Language Therapy',
    nameBn: 'স্পিচ ও ল্যাঙ্গুয়েজ থেরাপি',
    slug: 'speech-language-therapy',
    shortDescription: 'Assessment and therapy for communication, articulation, and swallowing disorders.',
    description: 'Speech therapy for stammering, childhood speech delay, aphasia post-stroke, voice strain disorders, and dysphagia (swallowing) management.',
    icon: 'Volume2',
    category: 'Rehabilitation'
  },
  {
    order: 69,
    name: 'Audiology',
    nameBn: 'অডিওলজি ও শ্রবণ পরীক্ষা',
    slug: 'audiology',
    shortDescription: 'Comprehensive hearing assessments and auditory diagnostic testing across all age groups.',
    description: 'Pure tone audiometry (PTA), tympanometry, newborn hearing screening, tinnitus evaluation, and digital hearing aid trials.',
    icon: 'Headphones',
    category: 'Diagnostic & Support'
  },
  {
    order: 70,
    name: 'Rehabilitation Medicine',
    nameBn: 'রিহ্যাবিলিটেশন মেডিসিন',
    slug: 'rehabilitation-medicine',
    shortDescription: 'Medical coordination of comprehensive physical, neurological, and cognitive rehabilitation.',
    description: 'Integrated recovery plans following stroke, spinal injuries, traumatic brain injuries, major surgeries, and severe sports trauma.',
    icon: 'ShieldCheck',
    category: 'Rehabilitation'
  },
  {
    order: 71,
    name: 'Palliative Care',
    nameBn: 'প্যালিয়েটিভ কেয়ার ও উপশমকারী সেবা',
    slug: 'palliative-care',
    shortDescription: 'Compassionate medical care focusing on relief from pain and stress of serious illnesses.',
    description: 'Specialized symptom management, cancer pain relief, psychosocial support for families, and enhancement of patient comfort and dignity.',
    icon: 'Heart',
    category: 'Allied & Support'
  },
  {
    order: 72,
    name: 'Home Healthcare',
    nameBn: 'হোম হেলথকেয়ার ও গৃহভিত্তিক সেবা',
    slug: 'home-healthcare',
    shortDescription: 'Professional clinical nursing, phlebotomy, and doctor consultations delivered at home.',
    description: 'Doorstep blood sample collection, home vital monitoring, catheter care, post-surgical wound dressings, and elderly companion nursing.',
    icon: 'Home',
    category: 'Home Care'
  },
  {
    order: 73,
    name: 'De-addiction & Rehabilitation',
    nameBn: 'মাদকাসক্তি মুক্তি ও পুনর্বাসন',
    slug: 'de-addiction-rehab',
    shortDescription: 'Medical detoxification, psychological support, and relapse prevention for substance use.',
    description: 'Comprehensive alcohol and substance detox protocols, motivational enhancement therapy, and structured family support programs.',
    icon: 'ShieldAlert',
    category: 'Mental Health'
  },
  {
    order: 74,
    name: 'Addiction Medicine',
    nameBn: 'অ্যাডিকশন মেডিসিন ও আসক্তি নিরাময়',
    slug: 'addiction-medicine',
    shortDescription: 'Medical management and pharmacotherapy for chemical and behavioral dependencies.',
    description: 'Pharmacological management of withdrawal syndromes, anti-craving medications, tobacco cessation, and chronic addiction care.',
    icon: 'Activity',
    category: 'Mental Health'
  },
  {
    order: 75,
    name: 'Sexual Medicine',
    nameBn: 'যৌন স্বাস্থ্য ও চিকিৎসা',
    slug: 'sexual-medicine',
    shortDescription: 'Evidence-based clinical care for male and female sexual function and health concerns.',
    description: 'Assessment of sexual dysfunction, psychosexual counseling, hormonal evaluations, and confidential lifestyle sexual guidance.',
    icon: 'Heart',
    category: 'Core Medical'
  },
  {
    order: 76,
    name: 'Family Planning',
    nameBn: 'পরিবার পরিকল্পনা ও প্রজনন স্বাস্থ্য',
    slug: 'family-planning',
    shortDescription: 'Counseling and clinical services for contraception, birth spacing, and reproductive choice.',
    description: 'Contraceptive counseling, oral contraceptive guidance, emergency contraception, and comprehensive reproductive choices for couples.',
    icon: 'Users',
    category: 'Women & Maternity'
  },
  {
    order: 77,
    name: 'Vaccination & Immunization',
    nameBn: 'টিকা ও টিকাদান কর্মসূচি',
    slug: 'vaccination-immunization',
    shortDescription: 'Complete immunization programs for infants, children, adults, and international travelers.',
    description: 'Universal pediatric immunization schedules, cervical cancer (HPV) vaccines, adult influenza and pneumococcal vaccines, and hepatitis prophylaxis.',
    icon: 'ShieldCheck',
    category: 'Preventive & Wellness'
  },
  {
    order: 78,
    name: 'Health Checkup / Preventive Health',
    nameBn: 'প্রতিরোধমূলক স্বাস্থ্য পরীক্ষা প্যাকেজ',
    slug: 'health-checkup',
    shortDescription: 'Master health screening packages and early detection protocols for lifestyle conditions.',
    description: 'Full-body wellness checks, executive health profiles, cardiac risk assessment, diabetic panels, and comprehensive clinical doctor reviews.',
    icon: 'ClipboardCheck',
    category: 'Preventive & Wellness'
  },
  {
    order: 79,
    name: 'Occupational Health',
    nameBn: 'কর্মক্ষেত্রের স্বাস্থ্য ও সুরক্ষা',
    slug: 'occupational-health',
    shortDescription: 'Workplace health assessments, pre-employment checkups, and occupational hazard prevention.',
    description: 'Corporate employee wellness screenings, ergonomics consultations, pre-employment fitness certifications, and workplace injury management.',
    icon: 'Building',
    category: 'Allied & Support'
  },
  {
    order: 80,
    name: 'Travel Medicine',
    nameBn: 'ট্রাভেল মেডিসিন ও আন্তর্জাতিক স্বাস্থ্য',
    slug: 'travel-medicine',
    shortDescription: 'Health guidance, vaccinations, and preventive prescriptions for domestic and international travel.',
    description: 'Yellow fever and typhoid travel vaccines, malaria prophylaxis, traveler’s diarrhea management advice, and high-altitude medical counseling.',
    icon: 'Compass',
    category: 'Preventive & Wellness'
  },
  {
    order: 81,
    name: 'Telemedicine',
    nameBn: 'টেলিমেডিসিন ও ভিডিও কনসালটেশন',
    slug: 'telemedicine',
    shortDescription: 'Secure online remote video doctor consultations and digital prescription services.',
    description: 'Virtual consultations with general physicians and specialists, digital prescription delivery, remote report reviews, and follow-ups.',
    icon: 'Video',
    category: 'Consultation & Remote Care'
  },
  {
    order: 82,
    name: 'AYUSH',
    nameBn: 'আয়ুষ সামগ্রিক স্বাস্থ্য ব্যবস্থা',
    slug: 'ayush',
    shortDescription: 'Traditional and holistic healthcare systems recognized by the Ministry of AYUSH, India.',
    description: 'Integrative holistic wellness, preventive natural therapies, and traditional Indian healthcare consultation.',
    icon: 'Leaf',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 83,
    name: 'Ayurveda',
    nameBn: 'আয়ুর্বেদ চিকিৎসা ও ভেষজ সেবা',
    slug: 'ayurveda',
    shortDescription: 'Classical Ayurvedic diagnosis, herbal medicine formulations, and dosha-balancing treatments.',
    description: 'Ayurvedic pulse assessment (Nadi Pariksha), dietary and herbal formulations, lifestyle regulation, and chronic ailment management.',
    icon: 'Leaf',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 84,
    name: 'Yoga & Naturopathy',
    nameBn: 'যোগ ও প্রাকৃতিক চিকিৎসা',
    slug: 'yoga-naturopathy',
    shortDescription: 'Therapeutic yoga practices, pranayama breathing, and drugless natural therapies for wellness.',
    description: 'Therapeutic yoga for spine and stress relief, lifestyle detox therapy, hydrotherapy guidance, and natural dietary cleansing.',
    icon: 'Sun',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 85,
    name: 'Unani',
    nameBn: 'ইউনানি চিকিৎসা পদ্ধতি',
    slug: 'unani',
    shortDescription: 'Traditional Unani medical diagnosis and herbal treatments based on bodily humors.',
    description: 'Classical Unani consultation, temperament (Mizaj) evaluation, herbal remedies, and dietary restorative therapies.',
    icon: 'Feather',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 86,
    name: 'Siddha',
    nameBn: 'সিদ্ধ চিকিৎসা পদ্ধতি',
    slug: 'siddha',
    shortDescription: 'Ancient South Indian holistic healing system utilizing herbal and mineral preparations.',
    description: 'Siddha diagnostic evaluations, natural mineral-herbal preparations, and rejuvenation therapeutic guidance.',
    icon: 'Compass',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 87,
    name: 'Homoeopathy',
    nameBn: 'হোমিওপ্যাথি চিকিৎসা',
    slug: 'homoeopathy',
    shortDescription: 'Individualized homeopathic constitutional prescribing for acute and chronic conditions.',
    description: 'Comprehensive holistic case-taking, constitutional remedy selection, chronic skin/allergy treatment, and safe pediatric homeopathy.',
    icon: 'Droplet',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 88,
    name: 'Panchakarma',
    nameBn: 'পঞ্চকর্ম থেরাপি ও ডিটক্সিফিকেশন',
    slug: 'panchakarma',
    shortDescription: 'Traditional Ayurvedic five-fold detoxification and rejuvenation therapies.',
    description: 'Therapeutic massage (Abhyanga), Shirodhara, herbal steam, Nasya, and systemic seasonal detoxification programs.',
    icon: 'Sparkles',
    category: 'AYUSH & Traditional Medicine'
  },
  {
    order: 89,
    name: 'Other / Multispecialty',
    nameBn: 'অন্যান্য মাল্টিস্পেশালিটি ক্লিনিক্যাল সেবা',
    slug: 'multispecialty-other',
    shortDescription: 'Interdisciplinary medical care and collaborative visiting specialist consultations.',
    description: 'Collaborative multispecialty diagnostic reviews, super-specialist visiting clinics, and customized cross-specialty clinical pathways.',
    icon: 'Layers',
    category: 'Other'
  }
];

export const MASTER_DEPARTMENTS: Department[] = MASTER_DEPARTMENT_DEFINITIONS.map((def) => {
  const stableId = deterministicUuid(`careon-dept-${def.slug}`);
  return {
    id: stableId,
    name: def.name,
    nameBn: def.nameBn,
    slug: def.slug,
    shortDescription: def.shortDescription,
    shortDescriptionBn: def.nameBn,
    description: def.description,
    descriptionBn: def.description,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    icon: def.icon,
    featured: def.order <= 6,
    displayOrder: def.order,
    status: 'ACTIVE',
    createdAt: '2026-09-13T00:00:00.000Z',
    updatedAt: '2026-09-13T00:00:00.000Z'
  };
});
