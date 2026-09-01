/**
 * English to Bengali Real-time Translation & Transliteration Helper
 * Provides vocabulary mapping, medical dictionaries, and phonetic transliteration
 * for instant automatic Bengali field population in Admin forms.
 */

const DICTIONARY: Record<string, string> = {
  // Common Medical & Clinic Terms
  'doctor': 'ডাক্তার',
  'dr.': 'ডা.',
  'dr': 'ডা.',
  'clinic': 'ক্লিনিক',
  'hospital': 'হাসপাতাল',
  'medical': 'মেডিক্যাল',
  'healthcare': 'স্বাস্থ্যসেবা',
  'health': 'স্বাস্থ্য',
  'care': 'কেয়ার',
  'careon': 'কেয়ারঅন',
  'careon medical clinic': 'কেয়ারঅন মেডিক্যাল ক্লিনিক',
  'careon clinic': 'কেয়ারঅন ক্লিনিক',
  'department': 'বিভাগ',
  'service': 'সেবা',
  'consultation': 'পরামর্শ',
  'consultant': 'কনসালট্যান্ট',
  'specialist': 'বিশেষজ্ঞ',
  'physician': 'চিকিৎসক',
  'surgeon': 'সার্জন',
  'visiting': 'ভিজিটিং',
  'senior': 'সিনিয়র',
  'junior': 'জুনিয়র',
  'resident': 'রেসিডেন্ট',
  'head': 'বিভাগীয় প্রধান',
  'director': 'পরিচালক',
  'officer': 'অফিসার',
  'in-charge': 'ইন-চার্জ',

  // Medical Specialties
  'cardiology': 'হৃদরোগ বিভাগ',
  'cardiologist': 'হৃদরোগ বিশেষজ্ঞ',
  'pediatrics': 'শিশু ও নবজাতক বিভাগ',
  'pediatrician': 'শিশু বিশেষজ্ঞ',
  'pediatric': 'শিশু সংক্রান্ত',
  'gynecology': 'স্ত্রীরোগ ও প্রসূতি বিভাগ',
  'gynecologist': 'স্ত্রীরোগ বিশেষজ্ঞ',
  'obstetrics': 'প্রসূতিবিদ্যা',
  'orthopedics': 'অস্থি ও জয়েন্ট বিভাগ',
  'orthopedic': 'অস্থিরোগ',
  'orthopedist': 'অস্থিরোগ বিশেষজ্ঞ',
  'general medicine': 'জেনারেল মেডিসিন',
  'internal medicine': 'ইন্টারনাল মেডিসিন',
  'medicine': 'মেডিসিন',
  'neurology': 'স্নায়ুরোগ বিভাগ',
  'neurologist': 'স্নায়ুরোগ বিশেষজ্ঞ',
  'dermatology': 'চর্ম ও এলার্জি বিভাগ',
  'dermatologist': 'চর্মরোগ বিশেষজ্ঞ',
  'gastroenterology': 'গ্যাস্ট্রোএন্টারোলজি',
  'gastroenterologist': 'গ্যাস্ট্রোএন্টারোলজিস্ট',
  'nephrology': 'কিডনি ও রেনাল বিভাগ',
  'nephrologist': 'কিডনি রোগ বিশেষজ্ঞ',
  'ent': 'নাক, কান ও গলা বিভাগ',
  'ear nose throat': 'নাক, কান ও গলা',
  'otolaryngology': 'ইএনটি বিশেষজ্ঞ',
  'ophthalmology': 'চক্ষু রোগ বিভাগ',
  'ophthalmologist': 'চক্ষু বিশেষজ্ঞ',
  'eye': 'চক্ষু',
  'dental': 'দন্ত চিকিৎসা বিভাগ',
  'dentist': 'দন্ত চিকিৎসক',
  'dental surgeon': 'ডেন্টাল সার্জন',
  'psychiatry': 'মনোরোগ বিভাগ',
  'psychiatrist': 'মনোরোগ বিশেষজ্ঞ',
  'pulmonology': 'বক্ষব্যাধি বিভাগ',
  'pulmonologist': 'বক্ষব্যাধি বিশেষজ্ঞ',
  'urology': 'ইউরোলজি বিভাগ',
  'urologist': 'ইউরোলজিস্ট',
  'endocrinology': 'হরমোন ও ডায়াবেটিস',
  'endocrinologist': 'এন্ডোক্রিনোলজিস্ট',
  'diabetology': 'ডায়াবেটিস বিশেষজ্ঞ',
  'pathology': 'প্যাথলজি ও ল্যাব বিভাগ',
  'pathologist': 'প্যাথলজিস্ট',
  'radiology': 'রেডিওলজি ও ইমেজিং',
  'radiologist': 'রেডিওলজিস্ট',

  // Common Services & Tests
  'ecg': 'ইসিজি (ECG)',
  'blood test': 'রক্ত পরীক্ষা',
  'blood': 'রক্ত',
  'sugar': 'সুগার',
  'diabetes': 'ডায়াবেটিস',
  'thyroid': 'থাইরয়েড টেস্ট',
  'lipid profile': 'লিপিড প্রোফাইল',
  'liver function test': 'লিভার ফাংশন টেস্ট (LFT)',
  'kidney function test': 'কিডনি ফাংশন টেস্ট (KFT)',
  'cbc': 'সম্পূর্ণ রক্ত গণনা (CBC)',
  'urine': 'ইউরিন টেস্ট',
  'x-ray': 'ডিজিটাল এক্স-রে',
  'ultrasound': 'আল্ট্রাসাউন্ড (USG)',
  'home sample collection': 'বাড়িতে রক্তের নমুনা সংগ্রহ',
  'home collection': 'হোম স্যাম্পল কালেকশন',
  'home service': 'হোম সার্ভিস',
  'clinic service': 'ক্লিনিক সার্ভিস',
  'doctor consultation': 'ডাক্তার কনসালটেশন',
  'routine checkup': 'নিয়মিত স্বাস্থ্য পরীক্ষা',
  'full body checkup': 'সম্পূর্ণ শরীর পরীক্ষা',
  'telemedicine': 'টেলিমেডিসিন / ভিডিও কনসালটেশন',
  'video consultation': 'ভিডিও কনসালটেশন',
  'dressing': 'ক্ষত ড্রেসিং',
  'injection': 'ইনজেকশন সেবা',
  'nebulization': 'নেবুলাইজেশন',
  'physiotherapy': 'ফিজিওথেরাপি',
  'physiotherapist': 'ফিজিওথেরাপিস্ট',

  // Days & Times
  'monday': 'সোমবার',
  'tuesday': 'মঙ্গলবার',
  'wednesday': 'বুধবার',
  'thursday': 'বৃহস্পতিবার',
  'friday': 'শুক্রবার',
  'saturday': 'শনিবার',
  'sunday': 'রবিবার',
  'mon': 'সোম',
  'tue': 'মঙ্গল',
  'wed': 'বুধ',
  'thu': 'বৃহস্পতি',
  'fri': 'শুক্র',
  'sat': 'শনি',
  'sun': 'রবি',
  'morning': 'সকাল',
  'evening': 'সন্ধ্যা',
  'afternoon': 'দুপুর',
  'night': 'রাত',
  'daily': 'প্রতিদিন',
  'weekly': 'সাপ্তাহিক',

  // Common Words & Phrases
  'trusted healthcare for you & your family': 'আপনার ও পরিবারের জন্য নির্ভরযোগ্য স্বাস্থ্যসেবা',
  'trusted healthcare for you and your family': 'আপনার ও পরিবারের জন্য নির্ভরযোগ্য স্বাস্থ্যসেবা',
  'caring beyond treatment': 'চিকিৎসার বাইরেও আন্তরিক সেবা',
  'compassionate care': 'আন্তরিক ও নির্ভরযোগ্য চিকিৎসা',
  'experienced': 'অভিজ্ঞ',
  'experienced doctors': 'অভিজ্ঞ চিকিৎসকবৃন্দ',
  'diagnostic center': 'ডায়াগনস্টিক সেন্টার',
  'modern facilities': 'আধুনিক যন্ত্রপাতি ও সুবিধা',
  'contai': 'কাঁথি',
  'purba medinipur': 'পূর্ব মেদিনীপুর',
  'kumarpur': 'কুমারপুর',
  'west bengal': 'পশ্চিমবঙ্গ',
  'reception': 'রিসেপশন ডেস্ক',
  'emergency': 'জরুরি সহায়তা',
  'ambulance': 'অ্যাম্বুলেন্স',
  'pharmacy': 'ফার্মেসি',
  'insurance': 'স্বাস্থ্য বীমা',
  'govt health scheme': 'সরকারি স্বাস্থ্য প্রকল্প',
  'swasthya sathi': 'স্বাস্থ্য সাথী',
  'star health': 'স্টার হেলথ ইন্স্যুরেন্স',
  'hdfc ergo': 'এইচডিএফসি এর্গো',
  'care insurance': 'কেয়ার হেলথ ইন্স্যুরেন্স',
  'icici lombard': 'আইসিআইসিআই লম্বার্ড',
  'niva bupa': 'নিভা বুপা',
  'general insurance': 'জেনারেল ইন্স্যুরেন্স',
  'health insurance': 'হেলথ ইন্স্যুরেন্স',
  'comprehensive health': 'সম্পূর্ণ স্বাস্থ্য সুরক্ষা',
  'cashless': 'ক্যাশলেস সুবিধা',
  'available': 'উপলব্ধ',
  'open daily': 'প্রতিদিন খোলা',
  'sunday closed': 'রবিবার বন্ধ',
  'appointment': 'অ্যাপয়েন্টমেন্ট',
  'book appointment': 'অ্যাপয়েন্টমেন্ট বুকিং',
  'patient': 'রোগী',
  'patients': 'রোগীগণ',
  'about us': 'আমাদের সম্পর্কে',
  'contact us': 'যোগাযোগ',
  'frequently asked questions': 'সাধারণ প্রশ্নোত্তর',
  'faq': 'সাধারণ প্রশ্নোত্তর',
  'qualification': 'শিক্ষাগত যোগ্যতা',
  'designation': 'পদবী',
  'experience': 'অভিজ্ঞতা',
  'room': 'রুম',
  'chamber': 'চেম্বার',
  'fees': 'ফি',
  'charges': 'চার্জ'
};

// Phonetic English to Bengali Transliteration Character Map
const PHONETIC_MAP: Record<string, string> = {
  'k': 'ক', 'kh': 'খ', 'g': 'গ', 'gh': 'ঘ', 'ng': 'ঙ',
  'ch': 'চ', 'chh': 'ছ', 'j': 'জ', 'jh': 'ঝ', 'ny': 'ঞ',
  't': 'ট', 'th': 'ঠ', 'd': 'ড', 'dh': 'ঢ', 'n': 'ন',
  'p': 'প', 'ph': 'ফ', 'f': 'ফ', 'b': 'ব', 'bh': 'ভ', 'v': 'ভ', 'm': 'ম',
  'r': 'র', 'l': 'ল', 'sh': 'শ', 's': 'স', 'h': 'হ', 'y': 'য়', 'w': 'ওয়',
  'z': 'জ', 'q': 'ক', 'x': 'ক্স'
};

const VOWEL_MAP: Record<string, string> = {
  'a': 'া', 'aa': 'া', 'i': 'ি', 'ee': 'ী', 'u': 'ু', 'oo': 'ূ',
  'e': 'ে', 'ai': 'ৈ', 'o': 'ো', 'au': 'ৌ', 'ou': 'ৌ'
};

const INITIAL_VOWELS: Record<string, string> = {
  'a': 'অ', 'aa': 'আ', 'i': 'ই', 'ee': 'ঈ', 'u': 'উ', 'oo': 'ঊ',
  'e': 'এ', 'ai': 'ঐ', 'o': 'ও', 'au': 'ঔ', 'ou': 'ঔ'
};

/**
 * Phonetically transliterate an English word to Bengali characters
 */
function phoneticWord(word: string): string {
  const lower = word.toLowerCase();
  if (DICTIONARY[lower]) {
    return DICTIONARY[lower];
  }

  // Handle common prefixes like Dr, Prof, MBBS
  if (lower === 'dr' || lower === 'dr.') return 'ডা.';
  if (lower === 'prof' || lower === 'prof.') return 'প্রফেসর';
  if (lower === 'mbbs') return 'এমবিবিএস';
  if (lower === 'md') return 'এমডি';
  if (lower === 'ms') return 'এমএস';
  if (lower === 'dnb') return 'ডিএনবি';
  if (lower === 'dm') return 'ডিএম';
  if (lower === 'mch') return 'এমসিএইচ';
  if (lower === 'dgo') return 'ডিজিও';
  if (lower === 'dch') return 'ডিসিএইচ';
  if (lower === 'frc') return 'এফআরসি';
  if (lower === 'frcs') return 'এফআরসিএস';
  if (lower === 'mrco') return 'এমআরসিওজি';

  // Common Indian Names Quick Dictionary
  const nameMap: Record<string, string> = {
    'siba': 'শিবা',
    'prasad': 'প্রসাদ',
    'debasish': 'দেবাশিস',
    'debjit': 'দেবজিৎ',
    'subrata': 'সুব্রত',
    'sourav': 'সৌরভ',
    'soumen': 'সৌমেন',
    'amit': 'অমিত',
    'animesh': 'অনিমেষ',
    'rahul': 'রাহুল',
    'rohit': 'রোহিত',
    'rajesh': 'রাজেশ',
    'sneha': 'স্নেহা',
    'priya': 'প্রিয়া',
    'ananya': 'অনন্যা',
    'monalisa': 'মোনালিসা',
    'sujata': 'সুজাতা',
    'tanushree': 'তনুশ্রী',
    'mousumi': 'মৌসুমী',
    'roy': 'রায়',
    'das': 'দাস',
    'ghosh': 'ঘোষ',
    'banerjee': 'ব্যানার্জী',
    'chatterjee': 'চ্যাটার্জী',
    'mukherjee': 'মুখার্জী',
    'bhattacharya': 'ভট্টাচার্য',
    'dutta': 'দত্ত',
    'mondal': 'মন্ডল',
    'jana': 'জানা',
    'sen': 'সেন',
    'dey': 'দে',
    'patra': 'পাত্র',
    'bera': 'বেড়া',
    'maity': 'মাইতি',
    'kundu': 'কুন্ডু',
    'adak': 'আদক',
    'mishra': 'মিশ্র',
    'pandit': 'পন্ডিত',
    'samanta': 'সামন্ত',
    'sasmal': 'শাশমল',
    'karan': 'করণ',
    'pradhan': 'প্রধান',
    'guha': 'গুহ',
    'contai': 'কাঁথি',
    'careon': 'কেয়ারঅন'
  };

  if (nameMap[lower]) {
    return nameMap[lower];
  }

  // Transliteration Fallback
  let result = '';
  let i = 0;
  let isStart = true;

  while (i < lower.length) {
    // Check 3-char clusters
    const three = lower.slice(i, i + 3);
    const two = lower.slice(i, i + 2);
    const one = lower[i];

    if (isStart && INITIAL_VOWELS[two]) {
      result += INITIAL_VOWELS[two];
      i += 2;
      isStart = false;
      continue;
    }
    if (isStart && INITIAL_VOWELS[one]) {
      result += INITIAL_VOWELS[one];
      i += 1;
      isStart = false;
      continue;
    }

    if (PHONETIC_MAP[two]) {
      result += PHONETIC_MAP[two];
      i += 2;
      isStart = false;
      continue;
    }

    if (PHONETIC_MAP[one]) {
      result += PHONETIC_MAP[one];
      i += 1;
      isStart = false;
      continue;
    }

    if (VOWEL_MAP[two]) {
      result += VOWEL_MAP[two];
      i += 2;
      isStart = false;
      continue;
    }

    if (VOWEL_MAP[one]) {
      result += VOWEL_MAP[one];
      i += 1;
      isStart = false;
      continue;
    }

    // Pass through punctuation/numbers
    result += one;
    i++;
    if (/\s/.test(one)) isStart = true;
  }

  return result;
}

/**
 * Main auto-translation function from English to Bengali
 */
export function autoTranslateToBengali(text: string): string {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();

  // 1. Direct match in dictionary
  if (DICTIONARY[lower]) {
    return DICTIONARY[lower];
  }

  // 2. Check multi-word matching
  const words = text.split(/(\s+|[,.:;()/-])/);
  const translated = words.map((chunk) => {
    if (!chunk || /^\s+$/.test(chunk) || /^[,.:;()/-]$/.test(chunk)) {
      return chunk;
    }
    const clean = chunk.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (DICTIONARY[clean]) {
      return DICTIONARY[clean];
    }
    return phoneticWord(chunk);
  });

  return translated.join('');
}
