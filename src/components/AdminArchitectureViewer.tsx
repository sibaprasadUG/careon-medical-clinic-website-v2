import React from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Stethoscope,
  Briefcase,
  CalendarCheck,
  HelpCircle,
  Image as ImageIcon,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AdminArchitectureViewerProps {
  onOpenAdmin?: () => void;
}

export const AdminArchitectureViewer: React.FC<AdminArchitectureViewerProps> = ({ onOpenAdmin }) => {
  return (
    <div className="space-y-10">
      {/* Intro */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> Pillar 10, 32, 33 & 34 (Phase 03 Active)
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Admin Control Architecture & Non-ERP Boundary</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              A streamlined, highly secure content and appointment management layer for CareOn clinic administrators. Designed exclusively for public web operations without crossing into internal hospital ERP boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-4 py-2 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-teal-900/10 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Launch Live Admin CMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3.5 py-2 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>RBAC Protected</span>
            </div>
          </div>
        </div>

        {/* The 7 Core Admin Modules */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569]">
            1. Authorized Admin Management Modules (Phase 03 Implemented)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <Stethoscope className="w-4 h-4 text-[#007E70]" />
                <span>Doctor Directory CMS</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Add, edit qualifications, update consultation hours, reorder display hierarchy, and toggle Active/Inactive state.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Add</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Edit</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Activate/Deactivate</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Reorder</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <Briefcase className="w-4 h-4 text-[#007E70]" />
                <span>Clinical Services CMS</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Manage diagnostic tests, preventive health packages, descriptions, turnaround times, and featured flags.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Packages</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Instructions</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Pricing Toggle</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <CalendarCheck className="w-4 h-4 text-[#007E70]" />
                <span>Appointment Intake Desk</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Review website inquiries, 1-click WhatsApp/Call patient, update confirmation status, and write coordinator notes.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Review</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">WhatsApp</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Status Sync</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <HelpCircle className="w-4 h-4 text-[#007E70]" />
                <span>Patient FAQs CMS</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Categorized questions for booking, emergency, payment, and test preparation with English & Bengali translations.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Categorize</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Bilingual</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Order</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <ImageIcon className="w-4 h-4 text-[#007E70]" />
                <span>Clinic Facility Gallery</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Curate real photographs of consultation chambers, waiting lounge, pathology desk, and hygiene infrastructure.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Real Photos</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Captions</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Categories</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
                <UserCheck className="w-4 h-4 text-[#007E70]" />
                <span>Patient Stories CMS</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed mb-3">
                Verified family testimonials, recovery feedback, and patient ratings with consent verification flags.
              </p>
              <div className="flex gap-1.5 text-[10px] font-mono text-slate-600">
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Consent Check</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Ratings</span>
                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Featured</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strict ERP Boundary */}
      <div className="bg-gradient-to-br from-rose-50 to-orange-50/50 p-6 sm:p-8 rounded-2xl border border-rose-200 space-y-4">
        <div className="flex items-center gap-2 text-rose-800 font-bold">
          <AlertOctagon className="w-5 h-5" />
          <h3 className="text-base">2. Strict Architectural Boundary: Non-ERP Exclusions</h3>
        </div>
        <p className="text-xs text-rose-950 leading-relaxed">
          The CareOn web administrative platform is purposefully restricted to <strong>marketing, patient education, facility transparency, and appointment intake coordination</strong>. To preserve system security, compliance, and clinical performance, the following internal enterprise modules are strictly forbidden from this web architecture:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-rose-900 font-medium">
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Inpatient/Bed Management</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Electronic Health Record (EHR)</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Billing & Invoicing Gateways</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Pharmacy Inventory & Dispensing</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Staff Payroll & HR Systems</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>No Diagnostic Lab Machine Interfacing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
