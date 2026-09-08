-- ============================================================
-- CAREON MEDICAL CLINIC — SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Project: careon-medical-clinic
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. CORE CLINICAL TABLES
-- ============================================================

-- 2.1 DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    short_description_bn TEXT,
    description TEXT,
    description_bn TEXT,
    image_url TEXT,
    icon TEXT DEFAULT 'Stethoscope',
    featured BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.2 SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    short_description_bn TEXT,
    description TEXT,
    description_bn TEXT,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    category TEXT DEFAULT 'Clinical',
    service_type TEXT DEFAULT 'BOTH' CHECK (service_type IN ('CLINIC', 'HOME', 'BOTH')),
    available_for_home BOOLEAN DEFAULT false,
    available_at_clinic BOOLEAN DEFAULT true,
    preparation_instructions JSONB DEFAULT '[]'::jsonb,
    report_turnaround_time TEXT,
    booking_enabled BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    icon TEXT DEFAULT 'Activity',
    image_url TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.3 DOCTORS
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT,
    slug TEXT NOT NULL,
    photo_url TEXT,
    profile_photo_url TEXT,
    photo_asset_id TEXT,
    profile_photo_asset_id TEXT,
    profile_photo_alt TEXT,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    specialty_id TEXT,
    designation TEXT DEFAULT 'Consultant',
    qualification TEXT DEFAULT 'MBBS',
    registration_number TEXT,
    consultation_fee NUMERIC(10, 2),
    short_bio TEXT,
    areas_of_expertise JSONB DEFAULT '[]'::jsonb,
    schedules JSONB DEFAULT '[]'::jsonb,
    chamber_id TEXT DEFAULT 'CareOn Medical Clinic',
    chamber_custom TEXT,
    service_ids JSONB DEFAULT '[]'::jsonb,
    consultation_days JSONB DEFAULT '[]'::jsonb,
    consultation_time TEXT,
    room_number TEXT DEFAULT 'CareOn Medical Clinic',
    weekly_schedule JSONB,
    custom_schedules JSONB,
    schedule_exceptions JSONB,
    appointment_enabled BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.4 DOCTOR SCHEDULES (Relational Normalization)
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room_number TEXT,
    location TEXT DEFAULT 'CareOn Medical Clinic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.5 SITE SETTINGS (JSONB configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'careon_main_settings',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2.6 ADMIN USERS & SESSIONS
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'ADMIN' CHECK (role = 'ADMIN'),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 3. FUTURE-PROOF MODULES (Healthcare CRM / Clinic Management)
-- ============================================================

-- 3.1 PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    blood_group TEXT,
    address TEXT,
    emergency_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.2 APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    service_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT,
    appointment_type TEXT DEFAULT 'CLINIC' CHECK (appointment_type IN ('CLINIC', 'HOME_VISIT', 'TELEMEDICINE')),
    symptoms TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.3 BILLS & INVOICING
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    appointment_id TEXT REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00,
    net_payable NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED')),
    invoice_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.4 PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    bill_id TEXT REFERENCES public.bills(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'UPI', 'CARD', 'NET_BANKING')),
    transaction_reference TEXT,
    payment_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.5 LABORATORY INVESTIGATION ORDERS
CREATE TABLE IF NOT EXISTS public.laboratory_orders (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    sample_type TEXT,
    sample_collected_at TIMESTAMPTZ,
    status TEXT DEFAULT 'ORDERED' CHECK (status IN ('ORDERED', 'COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    report_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.6 PHARMACY INVENTORY
CREATE TABLE IF NOT EXISTS public.pharmacy_items (
    id TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.7 CLINIC EXPENSES
CREATE TABLE IF NOT EXISTS public.clinic_expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    recorded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3.8 AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    entity_title TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_doctors_department_id ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON public.doctors(status);
CREATE INDEX IF NOT EXISTS idx_doctors_display_order ON public.doctors(display_order);
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON public.doctors(slug);

CREATE INDEX IF NOT EXISTS idx_services_department_id ON public.services(department_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

CREATE INDEX IF NOT EXISTS idx_departments_status ON public.departments(status);
CREATE INDEX IF NOT EXISTS idx_departments_slug ON public.departments(slug);

CREATE INDEX IF NOT EXISTS idx_doctor_schedules_doctor_id ON public.doctor_schedules(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_preferred_date ON public.appointments(preferred_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5.1 Public Read-Only for Active Content
CREATE POLICY "Public can view active departments" ON public.departments
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Public can view active doctors" ON public.doctors
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Public can view active schedules" ON public.doctor_schedules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- 5.2 Full Server-Side / Service-Role Management (Netlify Functions & Admin API)
CREATE POLICY "Service role full access on departments" ON public.departments
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on services" ON public.services
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on doctors" ON public.doctors
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on doctor_schedules" ON public.doctor_schedules
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on site_settings" ON public.site_settings
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on admin_users" ON public.admin_users
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on appointments" ON public.appointments
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on audit_logs" ON public.audit_logs
    FOR ALL USING (auth.role() = 'service_role' OR current_user = 'postgres');

-- Allow public to submit appointment requests
CREATE POLICY "Public can insert appointment requests" ON public.appointments
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- 6. DEFAULT FOUNDATION DATA (DEPARTMENTS & SERVICES)
-- ============================================================

INSERT INTO public.departments (id, name, name_bn, slug, short_description, icon, featured, display_order, status)
VALUES
('dept-gen-med', 'General Medicine & Family Health', 'জেনারেল মেডিসিন ও পারিবারিক স্বাস্থ্য', 'general-medicine', 'Comprehensive acute illness management, chronic disease prevention, and regular health assessments.', 'Stethoscope', true, 1, 'ACTIVE'),
('dept-pediatrics', 'Pediatrics & Child Wellness', 'শিশু চিকিৎসা ও যত্ন', 'pediatrics', 'Gentle, attentive clinical care for newborns, infants, children, and adolescents.', 'Baby', true, 2, 'ACTIVE'),
('dept-cardiology', 'Cardiology & Preventive Heart Care', 'কার্ডিওলজি ও হৃদরোগ প্রতিরোধ', 'cardiology', 'Cardiac risk evaluation, diagnostic ECG, blood pressure regulation, and lifestyle cardiology.', 'Heart', true, 3, 'ACTIVE'),
('dept-gynecology', 'Obstetrics & Gynecology', 'স্ত্রী ও প্রসূতি রোগ বিশেষজ্ঞ', 'gynecology', 'Compassionate women’s health across every phase of life, antenatal consultation, and wellness.', 'ShieldCheck', true, 4, 'ACTIVE'),
('dept-orthopedics', 'Orthopedics & Joint Care', 'অর্থোপেডিকস ও হাড়-জয়েন্ট কেয়ার', 'orthopedics', 'Diagnosis and conservative management of bone, joint, ligament, and spine conditions.', 'Activity', false, 5, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.services (id, name, name_bn, slug, short_description, department_id, category, service_type, available_for_home, available_at_clinic, booking_enabled, featured, display_order, status)
VALUES
('srv-01', 'Comprehensive Health & Preventive Checkup', 'সার্বিক স্বাস্থ্য পরীক্ষা ও প্রতিরোধমূলক চেকআপ', 'comprehensive-health-checkup', 'Full clinical evaluation including complete blood count, blood sugar, lipid profile, liver & kidney panels, and doctor consultation.', 'dept-gen-med', 'Preventive', 'BOTH', true, true, true, true, 1, 'ACTIVE'),
('srv-02', '12-Lead Diagnostic ECG & Rhythm Evaluation', '১২-লিড ইসিজি ও রিদম মূল্যায়ন', 'diagnostic-ecg', 'High-precision digital 12-lead Electrocardiogram interpreted by our consultant cardiologists.', 'dept-cardiology', 'Diagnostic', 'BOTH', true, true, true, true, 2, 'ACTIVE'),
('srv-03', 'Pediatric Growth & Developmental Screening', 'শিশু বৃদ্ধি ও বিকাশ পরীক্ষা', 'pediatric-growth-screening', 'Detailed physical growth assessment, milestone charting, and childhood wellness monitoring.', 'dept-pediatrics', 'Clinical', 'CLINIC', false, true, true, true, 3, 'ACTIVE'),
('srv-04', 'Antenatal Wellness & Maternal Consultation', 'গর্ভকালীন যত্ন ও মাতৃত্বকালীন পরামর্শ', 'antenatal-maternal-wellness', 'Routine pregnancy checks, gestational diabetes screening, blood pressure monitoring, and fetal wellbeing review.', 'dept-gynecology', 'Clinical', 'CLINIC', false, true, true, true, 4, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 7. REAL CLINIC DOCTORS (CAREON MEDICAL FACULTY)
-- Note: Real doctors only. No mock or demo doctors.
INSERT INTO public.doctors (
    id, name, name_bn, slug, photo_url, profile_photo_url, department_id, designation, qualification, registration_number,
    areas_of_expertise, consultation_days, consultation_time, room_number, chamber_id,
    appointment_enabled, featured, active, display_order, status
)
VALUES
(
    'doc-1788365117465',
    'DR. DEBDUTTA NAYAK',
    'ডাঃ দেবদত্ত নায়ক',
    'dr-debdutta-nayak',
    'https://careonclinic.com/assets/doctors/dr-debdutta-nayak.jpg',
    'https://careonclinic.com/assets/doctors/dr-debdutta-nayak.jpg',
    'dept-gen-med',
    'Consultant Physician & Family Health Specialist',
    'MBBS (Cal), MD (Medicine)',
    'WBMC-74892',
    '["General Medicine", "Diabetes & Metabolic Disorders", "Hypertension", "Cardiovascular Risk Prevention"]'::jsonb,
    '["Mon", "Wed", "Fri", "Sat"]'::jsonb,
    '10:30 AM – 01:30 PM & 05:30 PM – 08:30 PM',
    'Chamber 1 (Ground Floor)',
    'CareOn Medical Clinic',
    true, true, true, 1, 'ACTIVE'
),
(
    'doc-1788365288192',
    'DR. ARKA DEY',
    'ডাঃ অর্ক দে',
    'dr-arka-dey',
    'https://careonclinic.com/assets/doctors/dr-arka-dey.jpg',
    'https://careonclinic.com/assets/doctors/dr-arka-dey.jpg',
    'dept-pediatrics',
    'Consultant Pediatrician & Neonatologist',
    'MBBS, DCH, MD (Pediatrics)',
    'WBMC-81204',
    '["Pediatric Care", "Newborn Care", "Growth & Milestone Tracking", "Childhood Immunization"]'::jsonb,
    '["Tue", "Thu", "Sat", "Sun"]'::jsonb,
    '11:00 AM – 02:00 PM & 06:00 PM – 08:30 PM',
    'Chamber 2 (Pediatric Suite)',
    'CareOn Medical Clinic',
    true, true, true, 2, 'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;
