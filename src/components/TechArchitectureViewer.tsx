import React from 'react';
import { ROADMAP_PHASES } from '../data/architectureData';
import { Cpu, FolderTree, GitBranch, CheckCircle2, Clock, ShieldCheck, Zap, Globe, Layers } from 'lucide-react';

export const TechArchitectureViewer: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Overview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" /> Pillar 11, 12 & 13
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Technical Architecture & Implementation Roadmap</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              Engineered for high performance, accessibility, Netlify production builds, and clean modularity without unnecessary framework dependencies.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
            <Zap className="w-4 h-4 text-[#007E70]" />
            <span>React 19 + TypeScript + Tailwind 4</span>
          </div>
        </div>

        {/* Recommended Tech Stack Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">Frontend Core</span>
            <p className="text-xs font-semibold text-[#0F172A]">React 19 & TypeScript 5.8</p>
            <p className="text-[11px] text-slate-500 mt-1">Strict type checking, zero runtime exceptions, accessible component tree.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">Styling Engine</span>
            <p className="text-xs font-semibold text-[#0F172A]">Tailwind CSS v4 & Lucide Icons</p>
            <p className="text-[11px] text-slate-500 mt-1">Lightweight utility CSS, sub-millisecond styling, WCAG AA verified tokens.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">Build & Bundling</span>
            <p className="text-xs font-semibold text-[#0F172A]">Vite 6 + ESBuild</p>
            <p className="text-[11px] text-slate-500 mt-1">Instant development boots, optimized tree-shaken static assets for Netlify.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-[#007E70] block mb-1">Hosting & Edge</span>
            <p className="text-xs font-semibold text-[#0F172A]">Netlify / Google Cloud Run</p>
            <p className="text-[11px] text-slate-500 mt-1">Global CDN edge routing, immutable builds, automated SSL & security headers.</p>
          </div>
        </div>

        {/* Scalable Folder Structure */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-3 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#007E70]" /> Clean Architecture Folder Structure
          </h3>

          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
            <pre className="text-teal-300 font-bold mb-2">careon-medical-clinic/</pre>
            <pre>{`├── public/                    # Static assets, favicon, clinic logos & web manifest
├── src/
│   ├── assets/                # Optimized imagery & brand marks
│   ├── components/            # Reusable atomic & composite UI components
│   │   ├── common/            # Buttons, Badges, Modals, Inputs, Accordions
│   │   ├── doctors/           # DoctorCard, DoctorFilter, DoctorDrawer
│   │   ├── services/          # ServiceCard, ServiceFilter, ServiceModal
│   │   ├── departments/       # DepartmentDiscoveryCard, DepartmentGrid
│   │   ├── booking/           # 3-Step AppointmentRequestModal & Drawers
│   │   ├── layout/            # Header, Footer, MobileNav, WhatsAppButton
│   │   └── home/              # Hero, WhyCareOn, CareJourney, FamilyStages
│   ├── data/                  # Normalized seed data & schema mocks
│   │   ├── doctors.ts         # Verified doctor profiles & schedules
│   │   ├── services.ts        # Diagnostic & clinical test descriptions
│   │   ├── departments.ts     # Patient-friendly department taxonomy
│   │   ├── testimonials.ts    # Permission-verified patient stories
│   │   └── faqs.ts            # Bilingual patient FAQs
│   ├── lib/                   # Data Access Layer (DAL) & API connectors
│   │   ├── dal.ts             # Abstracted CRUD methods (getDoctors, getServices, bookAppointment)
│   │   └── utils.ts           # Date formatting, Indian phone sanitization, class mergers
│   ├── types.ts               # Centralized TypeScript definitions & domain models
│   ├── App.tsx                # Main Application Orchestration & Routing
│   ├── main.tsx               # Client bootstrap & hydration
│   └── index.css              # Tailwind v4 theme layer & Bengali font declarations
├── index.html                 # Semantic HTML5 document with SEO & OpenGraph meta
├── vite.config.ts             # Vite configuration with bundle optimization
└── package.json               # Dependencies & build scripts`}</pre>
          </div>
        </div>

        {/* 5-Phase Implementation Roadmap */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#007E70]" /> 5-Phase Engineering Roadmap
          </h3>

          <div className="space-y-4">
            {ROADMAP_PHASES.map((phase, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border transition-all ${
                  phase.status === 'current'
                    ? 'bg-teal-50/50 border-[#007E70] ring-1 ring-[#007E70]/30'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                      phase.status === 'current'
                        ? 'bg-[#007E70] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {phase.phase}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F172A]">{phase.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">{phase.deliverableCategory}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      phase.status === 'current'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {phase.timeline}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {phase.deliverables.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                        phase.status === 'current' ? 'text-[#007E70]' : 'text-slate-400'
                      }`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
