import React, { useState } from 'react';
import { Database, ShieldCheck, FileCode, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

export const DataArchitectureViewer: React.FC = () => {
  const [selectedSchema, setSelectedSchema] = useState<'doctor' | 'service' | 'department' | 'booking' | 'faq'>('doctor');

  const schemas = {
    doctor: {
      name: "DoctorEntity (Data-Driven Schema)",
      description: "Encapsulates all medical practitioner metadata. Never hardcoded into UI components. Enforces verified registration, qualification, and schedule integrity.",
      code: `export interface Doctor {
  id: string;                    // Unique UUID (e.g., 'doc_sourav_mukherjee')
  name: string;                  // Full Practitioner Name with Honorific
  nameBn?: string;               // Natural Indian Bengali Name Rendering
  departmentId: string;          // Foreign Key to DepartmentEntity
  qualification: string;         // e.g., 'MBBS, MD (General Medicine)'
  designation: string;           // e.g., 'Senior Consultant Physician'
  registrationNumber?: string;   // Verified State Medical Council Number (e.g., 'WBMC-12940')
  experienceYears?: number;      // Verified clinical experience in years
  photoUrl: string;              // High-resolution clinic portrait asset
  consultationSchedule: {        // Multi-day consultation schedule slots
    dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    startTime: string;           // e.g., '10:00'
    endTime: string;             // e.g., '14:00'
    roomNumber?: string;         // Clinic consultation room
  }[];
  languagesSpoken: string[];     // e.g., ['English', 'Bengali', 'Hindi']
  bio?: string;                  // Concise medical background & focus areas
  isFeatured: boolean;           // Featured toggle for homepage spotlight
  status: 'draft' | 'active' | 'inactive' | 'archived'; // Lifecycle Status
  displayOrder: number;          // Integer display ranking (1, 2, 3...)
  createdAt: string;             // ISO-8601 Timestamp
  updatedAt: string;             // ISO-8601 Timestamp
}`
    },
    service: {
      name: "ServiceEntity (Clinical & Diagnostic Schema)",
      description: "Defines clinical tests, diagnostic packages, and health programs with clear patient-facing guidance.",
      code: `export interface Service {
  id: string;                    // Unique UUID (e.g., 'srv_executive_panel')
  title: string;                 // Patient-friendly Service Title
  titleBn?: string;              // Bengali Rendering
  shortDescription: string;      // 1-2 sentence overview for cards
  fullDescription: string;       // Detailed clinical scope & testing parameters
  departmentId: string;          // Associated Department
  category: 'Diagnostic' | 'Preventive' | 'Consultation' | 'Specialized';
  preparationInstructions?: string[]; // e.g., ['10-12 hours fasting required']
  reportTurnaroundTime?: string; // e.g., 'Same Day (Within 6 Hours)'
  imageUrl?: string;             // Authentic clinical equipment/facility photo
  isBookableOnline: boolean;     // Enable/disable 1-click booking
  isFeatured: boolean;           // Homepage spotlight flag
  status: 'draft' | 'active' | 'inactive' | 'archived';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}`
    },
    department: {
      name: "DepartmentEntity (Discovery Layer Schema)",
      description: "Connects patient symptoms and family health needs to doctors and clinical services.",
      code: `export interface Department {
  id: string;                    // e.g., 'dept_general_medicine'
  name: string;                  // e.g., 'General Medicine & Family Health'
  nameBn?: string;               // Bengali Translation
  slug: string;                  // URL-friendly slug (e.g., 'general-medicine')
  iconName: string;              // Lucide icon identifier
  patientCareScope: string;      // Simple plain-language explanation of what is treated
  commonSymptomsAddressed: string[]; // e.g., ['Fever', 'Diabetes Management', 'Hypertension']
  status: 'active' | 'inactive';
  displayOrder: number;
}`
    },
    booking: {
      name: "AppointmentRequestEntity (Conversion Schema)",
      description: "Captures patient booking intents safely. Separated from internal clinic ERP.",
      code: `export interface AppointmentRequest {
  id: string;                    // Unique booking reference ID (e.g., 'APT-202608-019')
  type: 'doctor' | 'service';    // Clear selection type
  doctorId?: string;             // Optional foreign key to Doctor
  serviceId?: string;            // Optional foreign key to Service
  patientName: string;           // Full Patient Name
  patientPhone: string;          // 10-digit Indian Mobile Number
  patientEmail?: string;         // Optional Email
  preferredDate: string;         // YYYY-MM-DD
  preferredTimeSlot: string;     // e.g., 'Morning (10:00 AM - 01:00 PM)'
  isFirstVisit: boolean;         // New patient vs. Returning patient
  notes?: string;                // Brief note from patient
  status: 'pending' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}`
    },
    faq: {
      name: "FAQEntity (Patient Knowledge Base Schema)",
      description: "Data-driven accordion entries addressing frequent patient questions with category filtering.",
      code: `export interface FAQ {
  id: string;                    // Unique identifier
  question: string;              // Patient question in English
  questionBn?: string;          // Bengali translation
  answer: string;                // Clear, empathetic, verified answer
  answerBn?: string;             // Bengali translation
  category: 'Appointments' | 'Consultations' | 'Services' | 'Visiting';
  status: 'published' | 'hidden';
  displayOrder: number;
}`
    }
  };

  return (
    <div className="space-y-10">
      {/* Introduction */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" /> Pillar 09 & 31
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Data Architecture & Schema Integrity</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              Strictly decoupled data access layer. Public website components consume normalized TypeScript models backed by resilient data stores, eliminating hard-coded content.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Hard-Coded Medical Data</span>
          </div>
        </div>

        {/* 4 Core Data Architecture Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">1. Decoupled DAL</span>
            <p className="text-xs text-[#475569]">
              UI components query a unified Data Access Layer (DAL) interface, facilitating seamless switches between mock stores, Firestore, or headless CMS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">2. Lifecycle Statuses</span>
            <p className="text-xs text-[#475569]">
              Strict adherence to <strong>Draft → Active → Inactive → Archived</strong> lifecycle. Deactivating preserves historical appointment linkages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">3. Content Safety</span>
            <p className="text-xs text-[#475569]">
              Guards against unverified qualifications or fake ratings. Only verified clinic data is populated.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">4. Non-ERP Boundary</span>
            <p className="text-xs text-[#475569]">
              No patient health records (EMR/EHR), billing ledger, pharmacy inventory, or internal clinic ERP architectures are mixed into the website.
            </p>
          </div>
        </div>

        {/* Schema Switcher & Inspector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['doctor', 'service', 'department', 'booking', 'faq'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedSchema(key)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                  selectedSchema === key
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {key} Schema
              </button>
            ))}
          </div>

          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-teal-300">{schemas[selectedSchema].name}</span>
              </div>
              <span className="text-[10px] text-slate-400">TypeScript 5.8+ Strict Mode</span>
            </div>
            <p className="text-slate-300 font-sans text-xs mb-3 italic">
              {schemas[selectedSchema].description}
            </p>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-200">
              {schemas[selectedSchema].code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
