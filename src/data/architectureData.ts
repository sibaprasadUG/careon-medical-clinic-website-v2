import { ColorToken, TypeScaleToken, WireframeSection, RoadmapPhase } from '../types';

export const BRAND_CONSTANTS = {
  name: "CareOn Medical Clinic",
  tagline: "Caring Beyond Treatment",
  positioning: "Trusted Healthcare for You & Your Family",
  location: "Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401",
  phone: "9933335131",
  call: "9933520248",
  whatsapp: "9933335131",
  email: "info@careonmedical.in",
};

export const COLOR_SYSTEM: ColorToken[] = [
  {
    name: "Medical Green (Primary)",
    role: "Brand Anchor, Primary Accents, Health Indicators",
    hex: "#007E70",
    rgb: "0, 126, 112",
    contrastOnWhite: "4.8:1 (WCAG AA)",
    contrastOnDark: "6.2:1 (WCAG AAA on Navy)",
    usage: "Primary buttons, active indicators, brand symbols, badges"
  },
  {
    name: "CareOn Medical Teal",
    role: "Secondary Brand, Interactive Highlights, Soft Badges",
    hex: "#0D9488",
    rgb: "13, 148, 136",
    contrastOnWhite: "4.5:1 (WCAG AA)",
    contrastOnDark: "7.1:1",
    usage: "Hover transitions, secondary interactive states, category pills"
  },
  {
    name: "Deep Navy (Midnight Healthcare)",
    role: "High-contrast Typography, Structural Surfaces, Footers",
    hex: "#0F172A",
    rgb: "15, 23, 42",
    contrastOnWhite: "15.4:1 (WCAG AAA)",
    contrastOnDark: "1:1",
    usage: "H1-H4 Headings, primary body text, dark footer banner"
  },
  {
    name: "Teal Light Tint",
    role: "Subtle Surface Highlights, Soft Card Backgrounds",
    hex: "#F0FDFA",
    rgb: "240, 253, 250",
    contrastOnWhite: "1.05:1",
    contrastOnDark: "14.8:1",
    usage: "Hero accent cards, featured doctor background tint, active badge bg"
  },
  {
    name: "Pure Neutral White",
    role: "Card Surfaces, Navigation Background, Modals",
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
    contrastOnWhite: "1:1",
    contrastOnDark: "15.4:1",
    usage: "Main card backgrounds, dialogs, form containers"
  },
  {
    name: "Slate Surface (Off-White Canvas)",
    role: "Page Base Background, Section Contrast Alternations",
    hex: "#F8FAFC",
    rgb: "248, 250, 252",
    contrastOnWhite: "1.08:1",
    contrastOnDark: "14.2:1",
    usage: "Global body canvas, subtle zebra-striping between sections"
  },
  {
    name: "Slate Border Subdued",
    role: "Delicate 1px Dividers, Input Outlines, Card Borders",
    hex: "#E2E8F0",
    rgb: "226, 232, 240",
    contrastOnWhite: "1.3:1",
    contrastOnDark: "11.8:1",
    usage: "Form inputs, card borders, horizontal dividers"
  },
  {
    name: "Muted Body Slate",
    role: "Secondary Text, Consultation Timings, Meta Labels",
    hex: "#475569",
    rgb: "71, 85, 105",
    contrastOnWhite: "5.5:1 (WCAG AA)",
    contrastOnDark: "3.2:1",
    usage: "Supporting paragraphs, timestamps, credentials subheadings"
  }
];

export const TYPOGRAPHY_SCALE: TypeScaleToken[] = [
  {
    level: "Display / Hero (H1)",
    size: "40px — 52px (clamp(2.5rem, 4vw, 3.25rem))",
    lineHeight: "1.15",
    weight: "800 (Extra Bold)",
    tracking: "-0.025em",
    usage: "Hero main headline (Trusted Healthcare for You & Your Family)",
    sampleEn: "Trusted Healthcare for You & Your Family",
    sampleBn: "আপনার এবং আপনার পরিবারের বিশ্বস্ত স্বাস্থ্যসেবা"
  },
  {
    level: "Section Title (H2)",
    size: "28px — 36px (clamp(1.75rem, 3vw, 2.25rem))",
    lineHeight: "1.25",
    weight: "700 (Bold)",
    tracking: "-0.02em",
    usage: "Major section headers (Why CareOn feels different, Meet Our Doctors)",
    sampleEn: "Meet Our Experienced Doctors",
    sampleBn: "আমাদের অভিজ্ঞ চিকিৎসকদের সাথে পরিচিত হন"
  },
  {
    level: "Subsection / Card Title (H3)",
    size: "20px — 24px (clamp(1.25rem, 2vw, 1.5rem))",
    lineHeight: "1.35",
    weight: "600 (Semi-Bold)",
    tracking: "-0.01em",
    usage: "Doctor names, Service titles, Department card headers",
    sampleEn: "General Medicine & Family Health",
    sampleBn: "জেনারেল মেডিসিন ও পারিবারিক স্বাস্থ্য"
  },
  {
    level: "Subhead / Feature Label (H4)",
    size: "16px — 18px",
    lineHeight: "1.4",
    weight: "600 (Semi-Bold)",
    tracking: "normal",
    usage: "Doctor qualification, Consultation timing headers, Step titles",
    sampleEn: "Consultation Hours & Schedule",
    sampleBn: "পরামর্শের সময় ও সময়সূচী"
  },
  {
    level: "Body Regular (P)",
    size: "16px (1rem)",
    lineHeight: "1.6",
    weight: "400 (Regular)",
    tracking: "normal",
    usage: "Standard paragraph copy, service descriptions, care journey text",
    sampleEn: "CareOn delivers comprehensive, human-centred healthcare for your everyday wellness.",
    sampleBn: "কেয়ারঅন আপনার দৈনন্দিন সুস্থতার জন্য মানবকেন্দ্রিক যত্ন প্রদান করে।"
  },
  {
    level: "Body Small / Caption",
    size: "14px (0.875rem)",
    lineHeight: "1.5",
    weight: "500 (Medium)",
    tracking: "normal",
    usage: "Badges, doctor qualifications, disclaimer notes, input helper text",
    sampleEn: "MBBS, MD (General Medicine) • Reg: WBMC-12940",
    sampleBn: "এমবিবিএস, এমডি (জেনারেল মেডিসিন)"
  },
  {
    level: "Micro / Overline",
    size: "12px (0.75rem)",
    lineHeight: "1.4",
    weight: "700 (Bold)",
    tracking: "0.05em (Uppercase)",
    usage: "Brand taglines, status pills (Active/Inactive), category tags",
    sampleEn: "CARING BEYOND TREATMENT",
    sampleBn: "চিকিৎসার বাইরেও আন্তরিক সেবা"
  }
];

export const SITEMAP_NODES = [
  {
    path: "/",
    title: "Home",
    type: "Top-Level Nav",
    patientIntent: "Understand CareOn's identity, trust signals, doctors overview, core services, and care journey.",
    subsections: [
      "Hero (Brand Statement + Primary CTAs)",
      "Why CareOn Feels Different (4 Value Pillars)",
      "Featured Doctors (Quick Filter & Booking Entry)",
      "Care Beyond Consultation (Service Highlights)",
      "Department Discovery Layer",
      "Your Care Journey (5-Step Patient Roadmap)",
      "Care for Every Stage of Life (Family Life Stages)",
      "Real Experiences (Authentic Patient Stories)",
      "Clinic Environment & Facilities Gallery",
      "Frequently Asked Questions (Accordion)",
      "Location, Timings & Quick Contact Footer"
    ]
  },
  {
    path: "/doctors",
    title: "Doctors",
    type: "Top-Level Nav",
    patientIntent: "Search, filter by department, review qualifications, consultation schedules, and book specific doctor.",
    subsections: [
      "Department Filter Tabs & Search Bar",
      "Doctor Profile Cards with Qualifications & Timing",
      "Doctor Profile Drawer / Detail Modal",
      "Direct 'Book Doctor' Action Trigger"
    ]
  },
  {
    path: "/services",
    title: "Services",
    type: "Top-Level Nav",
    patientIntent: "Explore clinical services, diagnostic facilities, preventive health checkups, and book service appointments.",
    subsections: [
      "Service Category Filters",
      "Rich Service Cards with Detailed Descriptions",
      "What to Expect / Preparation Guidelines",
      "Direct 'Book Service' Action Trigger"
    ]
  },
  {
    path: "/about",
    title: "About",
    type: "Top-Level Nav",
    patientIntent: "Learn the story behind CareOn, clinic care philosophy, clinical leadership, and clinic atmosphere.",
    subsections: [
      "CareOn Founding Story & Mission",
      "Caring Beyond Treatment Philosophy",
      "Doctor & Healthcare Team Gallery",
      "Hygiene, Safety & Clinical Standards"
    ]
  },
  {
    path: "/faqs",
    title: "FAQs",
    type: "Top-Level Nav",
    patientIntent: "Get fast answers on booking, clinic timings, walk-in consultation, test reports, and visit preparation.",
    subsections: [
      "Category Tabs (Appointments, Consultations, Services, Visiting)",
      "Searchable Accordion Questions",
      "WhatsApp Support Escalation Action"
    ]
  },
  {
    path: "/departments/:slug",
    title: "Department Discovery (Contextual Page)",
    type: "Discovery Layer (Non-Header)",
    patientIntent: "Connect specific medical symptoms or needs to relevant doctors and associated clinical services.",
    subsections: [
      "Department Overview & Scope of Care",
      "Specialist Doctors in this Department",
      "Associated Diagnostic & Clinical Services",
      "Direct Appointment Booking CTA"
    ]
  },
  {
    path: "/book",
    title: "Book Appointment (Dedicated Flow)",
    type: "Primary Action Modal / Dedicated Flow",
    patientIntent: "Frictionless 3-step appointment request (Doctor or Service selection -> Patient details -> Confirmation).",
    subsections: [
      "Step 1: Choose Type (Doctor vs. Service)",
      "Step 2: Select Practitioner / Service & Preferred Date/Time",
      "Step 3: Patient Contact Information & Confirmation"
    ]
  }
];

export const HOMEPAGE_WIREFRAME_SECTIONS: WireframeSection[] = [
  {
    id: "sec-01",
    title: "01. Global Header & Action Bar",
    brandFocus: "CareOn Medical Clinic logo, clean 5-link navigation, prominent 'Book Appointment' button, subtle WhatsApp icon.",
    patientQuestion: "Where am I, and how do I take immediate action?",
    keyElements: [
      "Left: CareOn Medical Clinic Brand Logo",
      "Center: Home • Doctors • Services • About • FAQs",
      "Right: WhatsApp Chat Action + 'Book Appointment' Primary Button"
    ],
    notes: "Strict adherence to non-cluttered header rule. No sub-menus or secondary links in top bar."
  },
  {
    id: "sec-02",
    title: "02. Hero Experience",
    brandFocus: "Tagline: 'Caring Beyond Treatment' | Headline: 'Trusted Healthcare for You & Your Family'.",
    patientQuestion: "Is CareOn the right clinic for me and my loved ones?",
    keyElements: [
      "Eyebrow: Small brand statement 'Caring Beyond Treatment'",
      "H1 Headline: 'Trusted Healthcare for You & Your Family'",
      "Concise description of personalized, warm clinical excellence",
      "Dual CTA Group: Primary 'Find Your Doctor' (links to Doctors) + Secondary 'Book Appointment'",
      "Visual: High-authenticity medical consultation photo with balanced negative space"
    ],
    notes: "Human connection + clinical professionalism + calm confidence. No generic stock clutter."
  },
  {
    id: "sec-03",
    title: "03. Why CareOn Feels Different (Value Pillars)",
    brandFocus: "4 Core Value Propositions grounded in authentic clinic principles.",
    patientQuestion: "Why should I choose CareOn over other clinics?",
    keyElements: [
      "Pillar 1: Experienced Care (Qualified practitioners & specialists)",
      "Pillar 2: Patient-Centred Approach (Listening first, personalized treatment)",
      "Pillar 3: Multiple Specialities (Comprehensive family care under one roof)",
      "Pillar 4: Simple Healthcare Experience (Hassle-free booking and clear guidance)"
    ],
    notes: "Strictly NO unsupported claims, fake success rates, or exaggerated stats."
  },
  {
    id: "sec-04",
    title: "04. Meet Our Doctors (Data-Driven Showcase)",
    brandFocus: "Highlighting trusted doctors with verified qualifications and schedules.",
    patientQuestion: "Which specialist can treat my condition?",
    keyElements: [
      "Department quick filter pills (All, General Medicine, Pediatrics, Cardiology, Gynecology, Orthopedics)",
      "Doctor cards with photo, name, designation, department, qualification, consultation hours",
      "Action buttons: 'View Profile' & 'Book Appointment'",
      "'View All Doctors' link directing to the full directory"
    ],
    notes: "Dynamic schema backing. Supports Active/Inactive status and display ordering."
  },
  {
    id: "sec-05",
    title: "05. Care Beyond Consultation (Services Showcase)",
    brandFocus: "Comprehensive clinical and diagnostic services designed with visual elegance.",
    patientQuestion: "What tests, health checks, or specialized care can I get here?",
    keyElements: [
      "Non-generic card layout with contextual healthcare illustrations/images",
      "Service name, brief clear description, department tag",
      "Interactive 'Learn More' & 'Book Service' triggers"
    ],
    notes: "Eliminates generic icon grids in favor of richly designed clinical service cards."
  },
  {
    id: "sec-06",
    title: "06. Department Discovery Layer",
    brandFocus: "Intelligent navigation layer mapping patient symptoms to departments.",
    patientQuestion: "What department should I choose for my health need?",
    keyElements: [
      "Interactive symptom/need guide cards",
      "Direct bridge: Department → Relevant Doctors → Relevant Services → Fast Booking",
      "Patient-friendly terminology (avoiding alienating medical jargon)"
    ],
    notes: "Treats departments as a guided discovery layer instead of a top-heavy navigation item."
  },
  {
    id: "sec-07",
    title: "07. Your Care Journey (5-Step Patient Path)",
    brandFocus: "Transparent, comforting visual roadmap of the clinic visit experience.",
    patientQuestion: "What happens when I visit CareOn?",
    keyElements: [
      "Step 1: Discover (Find the right doctor or service)",
      "Step 2: Consult (Meet your healthcare professional in person)",
      "Step 3: Understand (Clear explanation of findings & options)",
      "Step 4: Care (Personalized, evidence-based treatment)",
      "Step 5: Follow Up (Continuous monitoring and recovery support)"
    ],
    notes: "Medically responsible language without promising guaranteed cure outcomes."
  },
  {
    id: "sec-08",
    title: "08. Care for Every Stage of Life (Family Care)",
    brandFocus: "Single trusted healthcare destination for every generation of the family.",
    patientQuestion: "Can CareOn take care of my kids, parents, and myself?",
    keyElements: [
      "Life Stage 1: Children (Pediatrics, growth tracking, immunization)",
      "Life Stage 2: Women (Obstetrics, wellness, preventive screenings)",
      "Life Stage 3: Adults (Lifestyle health, routine checkups, acute care)",
      "Life Stage 4: Seniors (Chronic disease management, geriatric wellness)"
    ],
    notes: "Warm, empathetic layout with family-focused photography and clear care tags."
  },
  {
    id: "sec-09",
    title: "09. Real Experiences. Real People.",
    brandFocus: "Verified patient testimonials reflecting authentic human care.",
    patientQuestion: "How have other patients and families experienced CareOn?",
    keyElements: [
      "Authentic patient quote, verified patient name, associated doctor/service",
      "Refined card design with subtle elevation and typography hierarchy",
      "No fake ratings, stars, or stock personas"
    ],
    notes: "Admin-managed collection with published/hidden toggles."
  },
  {
    id: "sec-10",
    title: "10. Clinic Environment & Facilities Gallery",
    brandFocus: "Visual transparency showing the real clinic, consultation rooms, and clean environment.",
    patientQuestion: "Is the clinic clean, well-equipped, and welcoming?",
    keyElements: [
      "Categories: Clinic Spaces, Consultation Rooms, Diagnostic Lab, Healthcare Team",
      "High-resolution clean presentation without noisy masonry effects"
    ],
    notes: "Reinforces hygiene, safety, and modern clinic infrastructure."
  },
  {
    id: "sec-11",
    title: "11. Frequently Asked Questions (Accordion)",
    brandFocus: "Immediate resolution of common patient queries.",
    patientQuestion: "How do I prepare, what are clinic hours, and do I need an appointment?",
    keyElements: [
      "Categorized accordion items (Appointments, Timings, Reports, Visiting)",
      "Contextual WhatsApp card: 'Need help choosing a doctor? Chat with CareOn'"
    ],
    notes: "Data-driven structure managed via CMS."
  },
  {
    id: "sec-12",
    title: "12. Comprehensive Patient Footer",
    brandFocus: "CareOn Medical Clinic brand identity, verified contact details, quick access links.",
    patientQuestion: "Where is CareOn located and how do I contact the front desk?",
    keyElements: [
      "Brand block: CareOn Medical Clinic + 'Caring Beyond Treatment'",
      "Clinic address, clinic working hours, emergency helpline notes",
      "Direct Phone and WhatsApp click-to-contact links",
      "Clean footer navigation and copyright compliance"
    ],
    notes: "Deep Navy surface background with high-contrast text and interactive states."
  }
];

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: "Phase 01",
    title: "Master Foundation & Architectural Blueprint",
    timeline: "Completed (Current Milestone)",
    status: "current",
    deliverableCategory: "Strategy, IA & Design Tokens",
    deliverables: [
      "Complete 13-point architectural and UX foundation specification",
      "Information Architecture and patient-first sitemap mapping",
      "Color, typography, and mathematical spacing token systems",
      "Data layer schemas (Doctors, Services, Departments, Bookings, FAQs)",
      "Admin lifecycle specification (Draft → Active → Inactive → Archived)",
      "Technical stack configuration (Vite, React 19, TypeScript, Tailwind 4)"
    ]
  },
  {
    phase: "Phase 02",
    title: "Design System & Core UI Components",
    timeline: "Next Phase",
    status: "upcoming",
    deliverableCategory: "Component Engineering",
    deliverables: [
      "Accessible Navigation Header with mobile menu & sticky transition",
      "Doctor Card component with dynamic status pills and badges",
      "Service Card component with category tagging and booking hooks",
      "3-Step Modal/Drawer Appointment Booking flow",
      "FAQ Accordion system with search and category filters",
      "Interactive Bengali/English typography validation and switcher"
    ]
  },
  {
    phase: "Phase 03",
    title: "Full Patient Experience & Page Assembly",
    timeline: "Upcoming",
    status: "planned",
    deliverableCategory: "Page Assembly",
    deliverables: [
      "Complete Homepage with all 12 wireframe sections rendered",
      "Dedicated /doctors directory with real-time department filtering & search",
      "Dedicated /services catalog with preparation instructions",
      "Dedicated /about page with clinic story, philosophy, and gallery",
      "Dedicated /faqs knowledge base with contextual WhatsApp assistance",
      "Dedicated /departments discovery pages connecting doctors & services"
    ]
  },
  {
    phase: "Phase 04",
    title: "Data Access Layer & Local Persistence",
    timeline: "Upcoming",
    status: "planned",
    deliverableCategory: "Data & Storage",
    deliverables: [
      "Type-safe Data Access Layer (DAL) abstracting CRUD operations",
      "Seed dataset of verified medical departments, doctors, and services",
      "Appointment request queue with client-side state / Firestore bridge",
      "Active/Inactive filtering guards on all public data feeds"
    ]
  },
  {
    phase: "Phase 05",
    title: "Lightweight Admin Experience & Production Readiness",
    timeline: "Upcoming",
    status: "planned",
    deliverableCategory: "Administration & Deployment",
    deliverables: [
      "Secure Admin Login & Dashboard for clinic staff",
      "Doctor & Service management (Add, Edit, Activate/Deactivate, Reorder)",
      "Appointment Request status manager (Pending, Confirmed, Completed)",
      "SEO Meta tags, OpenGraph configuration, WCAG AA compliance audit",
      "Production Netlify / Cloud Run deployment verification"
    ]
  }
];
