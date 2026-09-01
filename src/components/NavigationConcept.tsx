import React, { useState } from 'react';
import { SITEMAP_NODES } from '../data/architectureData';
import { Layout, Compass, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, Layers, Smartphone, Monitor } from 'lucide-react';

export const NavigationConcept: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState(SITEMAP_NODES[0]);

  return (
    <div className="space-y-10">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" /> Pillar 01 & 02
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Information Architecture & Sitemap</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              Engineered around real patient questions. Every navigation pathway minimizes cognitive load, enabling immediate discovery of doctors, clinical services, and rapid appointment booking.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#007E70]" />
            <span>Strict Single-Tier Top Navigation</span>
          </div>
        </div>

        {/* The 5 Non-Negotiable Top Navigation Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#007E70]" />
              <span>Clean 5-Link Top Bar</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Desktop navigation is strictly limited to <strong>Home, Doctors, Services, About, FAQs</strong> with a prominent <strong>Book Appointment</strong> CTA button.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
              <Layers className="w-4 h-4 text-[#0D9488]" />
              <span>Departments as Discovery Layer</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Departments are placed as an intuitive visual routing layer (Department → Doctors → Services → Appointment) rather than a cluttered top-level dropdown menu.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Strict Anti-Clutter Boundary</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              No top-level gallery, patient reviews, or secondary booking buttons in the header. These reside contextually inside relevant pages to preserve visual clarity.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sitemap Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sitemap Tree */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#475569] px-1 flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#007E70]" /> CareOn Core Route Nodes
          </h3>
          
          <div className="space-y-2">
            {SITEMAP_NODES.map((node) => {
              const isSelected = selectedNode.path === node.path;
              return (
                <button
                  key={node.path}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-white border-[#007E70] shadow-sm ring-1 ring-[#007E70]/20'
                      : 'bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {node.path}
                      </span>
                      <span className="text-sm font-bold text-[#0F172A]">{node.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      node.type.includes('Top-Level')
                        ? 'bg-emerald-50 text-[#007E70] border border-emerald-200'
                        : 'bg-teal-50 text-[#0D9488] border border-teal-200'
                    }`}>
                      {node.type}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-2 line-clamp-2">
                    {node.patientIntent}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Node Anatomy */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono text-[#007E70] font-semibold">{selectedNode.path}</span>
              <h4 className="text-xl font-bold text-[#0F172A]">{selectedNode.title} Page Architecture</h4>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {selectedNode.type}
            </span>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-2">Patient Primary Intent</h5>
              <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-sm font-medium text-[#0F172A] leading-relaxed">
                "{selectedNode.patientIntent}"
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3">Internal Sections & UI Blocks</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedNode.subsections.map((sub, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#007E70]/10 text-[#007E70] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Logic Matrix */}
            <div className="p-4 bg-slate-900 text-white rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-teal-400 mb-2">
                <span>Discovery & Conversion Funnel</span>
                <span>Patient Outcome</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Land on {selectedNode.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Discover Doctor / Service</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="bg-[#007E70] text-white px-2.5 py-1 rounded font-bold">1-Click Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile vs Desktop Navigation Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
            <Monitor className="w-5 h-5 text-[#007E70]" />
            <span>Desktop Experience Architecture</span>
          </div>
          <ul className="space-y-2 text-xs text-[#475569] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#007E70] font-bold">•</span>
              <span>Ultra-clean single-tier sticky navigation with subtle backdrop blur.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#007E70] font-bold">•</span>
              <span>Contextual WhatsApp trigger for clinical triage assistance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#007E70] font-bold">•</span>
              <span>High-visibility appointment CTA permanently accessible on scroll.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
            <Smartphone className="w-5 h-5 text-[#0D9488]" />
            <span>Mobile-First Priority Hierarchy</span>
          </div>
          <ul className="space-y-2 text-xs text-[#475569] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#0D9488] font-bold">1.</span>
              <span><strong>Logo + WhatsApp Quick Chat:</strong> Instant brand reassurance and direct assistance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0D9488] font-bold">2.</span>
              <span><strong>Persistent Bottom Booking Bar:</strong> 44px+ touch-target for immediate doctor or service booking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0D9488] font-bold">3.</span>
              <span><strong>Frictionless Drawer Menu:</strong> Fast access to Doctors directory, Services, and FAQs.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
