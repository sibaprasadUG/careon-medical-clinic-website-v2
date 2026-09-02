import React, { useState } from 'react';
import { HOMEPAGE_WIREFRAME_SECTIONS } from '../data/architectureData';
import {
  Stethoscope,
  HeartHandshake,
  Users,
  Sparkles,
  Calendar,
  Layers,
  Milestone,
  ShieldCheck,
  Quote,
  Image as ImageIcon,
  HelpCircle,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const HomepageWireframe: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>("sec-02");

  const activeSection = HOMEPAGE_WIREFRAME_SECTIONS.find(s => s.id === activeSectionId) || HOMEPAGE_WIREFRAME_SECTIONS[1];

  return (
    <div className="space-y-10">
      {/* Wireframe Introduction */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" /> Pillar 04
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Homepage Wireframe & Patient Journey</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              12 purposeful, sequenced sections designed to answer the patient's immediate questions in their natural cognitive order: <em>Trust → Discovery → Decision → Booking → Reassurance</em>.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#007E70]" />
            <span>Zero Slop / Medically Responsible</span>
          </div>
        </div>

        {/* Section Flow Timeline Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {HOMEPAGE_WIREFRAME_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectionId(sec.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all border shrink-0 ${
                activeSectionId === sec.id
                  ? 'bg-[#007E70] text-white border-[#007E70] shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-[#475569] border-slate-200'
              }`}
            >
              {sec.title.split('. ')[0]}. {sec.title.split('. ')[1]?.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Wireframe View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Wireframe Mockup Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-t-xl text-xs font-mono flex items-center justify-between">
            <span className="text-teal-400 font-bold">CareOn Homepage Wireframe Simulation</span>
            <span className="text-slate-400">Section Blueprint View</span>
          </div>

          <div className="bg-slate-100 p-4 sm:p-6 rounded-b-xl border border-slate-300 space-y-4 max-h-[850px] overflow-y-auto">
            {/* Section 01 Header Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-01")}
              className={`p-3 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-01" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-bold text-[#0F172A]">01. Global Header</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Sticky Top</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-[#007E70]">
                  <Stethoscope className="w-3.5 h-3.5" /> CareOn Clinic
                </div>
                <div className="hidden sm:flex gap-3 text-[11px] text-slate-600 font-medium">
                  <span>Home</span>
                  <span>Doctors</span>
                  <span>Services</span>
                  <span>About</span>
                  <span>FAQs</span>
                </div>
                <div className="flex gap-2">
                  <span className="bg-teal-50 text-[#007E70] px-2 py-0.5 rounded text-[10px] font-bold">WhatsApp</span>
                  <span className="bg-[#007E70] text-white px-2 py-0.5 rounded text-[10px] font-bold">Book</span>
                </div>
              </div>
            </div>

            {/* Section 02 Hero Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-02")}
              className={`p-5 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-02" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono text-[#007E70] font-bold mb-1">02. HERO SECTION</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded">
                    Caring Beyond Treatment
                  </span>
                  <h4 className="text-base font-extrabold text-[#0F172A] leading-tight">
                    Trusted Healthcare for You & Your Family
                  </h4>
                  <p className="text-xs text-slate-500">
                    Experienced doctors, compassionate care, and personalized wellness for your loved ones.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <span className="bg-[#007E70] text-white text-xs px-3 py-1.5 rounded-lg font-bold">Find Your Doctor</span>
                    <span className="bg-white border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold">Book Appointment</span>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-br from-teal-50 to-slate-100 rounded-lg border border-teal-100 flex flex-col items-center justify-center p-3 text-center">
                  <HeartHandshake className="w-8 h-8 text-[#007E70] mb-1 opacity-80" />
                  <span className="text-[11px] font-semibold text-slate-600">Authentic Consultation Visual</span>
                  <span className="text-[10px] text-slate-400">Doctor-patient human connection</span>
                </div>
              </div>
            </div>

            {/* Section 03 Why CareOn Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-03")}
              className={`p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-03" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono text-[#007E70] font-bold mb-1">03. WHY CAREON FEELS DIFFERENT</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {["Experienced Care", "Patient-Centred", "Multiple Specialities", "Simple Experience"].map((p, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="font-bold text-slate-800 text-[11px] block">{p}</span>
                    <span className="text-[9px] text-slate-500">Verified standards</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 04 Meet Our Doctors Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-04")}
              className={`p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-04" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono text-[#007E70] font-bold mb-1">04. MEET OUR DOCTORS</div>
              <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 text-[10px]">
                <span className="bg-[#007E70] text-white px-2 py-0.5 rounded font-bold">All</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">General Medicine</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Pediatrics</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Cardiology</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-[#007E70]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#0F172A]">Visiting Physician</div>
                    <div className="text-[9px] text-[#007E70] font-semibold">General Medicine</div>
                    <div className="text-[9px] text-slate-500">Mon - Sat • 10 AM - 2 PM</div>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex gap-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-[#007E70]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#0F172A]">Specialist Doctor</div>
                    <div className="text-[9px] text-[#007E70] font-semibold">Pediatric Specialist</div>
                    <div className="text-[9px] text-slate-500">Tue, Thu, Sat • 4 PM - 7 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 05 & 06 Services & Discovery Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-05")}
              className={`p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-05" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono text-[#007E70] font-bold mb-1">05. CARE BEYOND CONSULTATION</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {["Preventive Health Checks", "Diagnostic Pathology", "Cardiology Diagnostics"].map((s, i) => (
                  <div key={i} className="p-2 bg-teal-50/50 rounded border border-teal-100">
                    <span className="font-bold text-slate-800 text-[10px] block">{s}</span>
                    <span className="text-[9px] text-[#007E70]">Book Service →</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 07 Care Journey Mockup */}
            <div
              onClick={() => setActiveSectionId("sec-07")}
              className={`p-4 bg-white rounded-xl border transition-all cursor-pointer ${
                activeSectionId === "sec-07" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="text-[10px] font-mono text-[#007E70] font-bold mb-1">07. YOUR CARE JOURNEY</div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                <span>1. Discover</span>
                <span>→</span>
                <span>2. Consult</span>
                <span>→</span>
                <span>3. Understand</span>
                <span>→</span>
                <span>4. Care</span>
                <span>→</span>
                <span>5. Follow Up</span>
              </div>
            </div>

            {/* Section 08 - 12 Bottom Stack */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => setActiveSectionId("sec-08")}
                className={`p-3 bg-white rounded-lg border transition-all cursor-pointer ${
                  activeSectionId === "sec-08" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300'
                }`}
              >
                <span className="font-bold text-[10px] text-[#0F172A] block">08. Family Life Stages</span>
                <span className="text-[9px] text-slate-500">Children, Women, Adults, Seniors</span>
              </div>
              <div
                onClick={() => setActiveSectionId("sec-09")}
                className={`p-3 bg-white rounded-lg border transition-all cursor-pointer ${
                  activeSectionId === "sec-09" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300'
                }`}
              >
                <span className="font-bold text-[10px] text-[#0F172A] block">09. Real Experiences</span>
                <span className="text-[9px] text-slate-500">Authentic patient stories</span>
              </div>
              <div
                onClick={() => setActiveSectionId("sec-10")}
                className={`p-3 bg-white rounded-lg border transition-all cursor-pointer ${
                  activeSectionId === "sec-10" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300'
                }`}
              >
                <span className="font-bold text-[10px] text-[#0F172A] block">10. Clinic Environment</span>
                <span className="text-[9px] text-slate-500">Hygiene & facilities gallery</span>
              </div>
              <div
                onClick={() => setActiveSectionId("sec-11")}
                className={`p-3 bg-white rounded-lg border transition-all cursor-pointer ${
                  activeSectionId === "sec-11" ? 'ring-2 ring-[#007E70] border-[#007E70]' : 'border-slate-300'
                }`}
              >
                <span className="font-bold text-[10px] text-[#0F172A] block">11. FAQs & WhatsApp</span>
                <span className="text-[9px] text-slate-500">Accordion & contextual triage</span>
              </div>
            </div>

            {/* Section 12 Footer */}
            <div
              onClick={() => setActiveSectionId("sec-12")}
              className={`p-3 bg-slate-900 text-white rounded-xl transition-all cursor-pointer ${
                activeSectionId === "sec-12" ? 'ring-2 ring-teal-400' : ''
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-bold text-white">CareOn Medical Clinic</span>
                  <p className="text-[9px] text-teal-300">Caring Beyond Treatment</p>
                </div>
                <div className="text-[9px] text-slate-400 text-right">
                  Kolkata, WB • Helpline: +91 9933335131
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Section Blueprint Inspector */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-mono font-bold text-[#007E70] uppercase">Detailed Specification</span>
              <h3 className="text-xl font-bold text-[#0F172A] mt-1">{activeSection.title}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Patient Question Addressed</h4>
                <div className="mt-1.5 p-3.5 bg-teal-50/80 border border-teal-100 rounded-xl text-sm font-semibold text-[#0F172A]">
                  "{activeSection.patientQuestion}"
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Brand & UX Positioning</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {activeSection.brandFocus}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">Key Functional Components</h4>
                <ul className="mt-2 space-y-2">
                  {activeSection.keyElements.map((elem, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#007E70] shrink-0 mt-0.5" />
                      <span>{elem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-900 block mb-0.5">Implementation Note:</span>
                <span className="text-xs text-[#475569] leading-relaxed">{activeSection.notes}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-[#475569]">
            <span>Section ID: <strong className="font-mono text-slate-900">{activeSection.id}</strong></span>
            <span className="text-[#007E70] font-bold">100% Patient-Centred</span>
          </div>
        </div>
      </div>
    </div>
  );
};
