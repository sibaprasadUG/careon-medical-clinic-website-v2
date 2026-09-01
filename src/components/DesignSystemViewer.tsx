import React, { useState } from 'react';
import { COLOR_SYSTEM, TYPOGRAPHY_SCALE } from '../data/architectureData';
import { Palette, Type, Component, CheckCircle, Stethoscope, Calendar, ArrowRight, Clock, Star, ShieldCheck, Sparkles } from 'lucide-react';

export const DesignSystemViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'components'>('colors');
  const [bengaliDemoWord, setBengaliDemoWord] = useState<'জল' | 'পানি'>('জল');

  return (
    <div className="space-y-10">
      {/* Sub-navigation Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-[#007E70] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Pillar 05, 06, 07 & 08
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">CareOn Design System & Visual Tokens</h2>
            <p className="text-sm text-[#475569] mt-1 max-w-2xl">
              Engineered with mathematical precision: WCAG AA/AAA contrast ratios, a calibrated 1.25 typography scale, authentic Indian Bengali Unicode support, and bespoke healthcare components.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'colors' ? 'bg-white text-[#007E70] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Color System
              </span>
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'typography' ? 'bg-white text-[#007E70] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Typography & Bengali
              </span>
            </button>
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'components' ? 'bg-white text-[#007E70] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Component className="w-3.5 h-3.5" /> Core UI Components
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Colors */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLOR_SYSTEM.map((color, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                  <div
                    className="h-28 flex flex-col justify-end p-3 text-white transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span className="text-xs font-mono font-bold drop-shadow-xs">{color.hex}</span>
                    <span className="text-[10px] text-white/80 font-mono">RGB({color.rgb})</span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{color.name}</h4>
                      <p className="text-xs text-[#007E70] font-medium">{color.role}</p>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>WCAG Contrast:</strong> {color.contrastOnWhite}
                    </div>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {color.usage}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Anti-Slop Color Philosophy Alert */}
            <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#007E70] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <strong className="text-[#0F172A] block text-sm">Anti-Slop Color Integrity:</strong>
                <p>
                  Strictly prohibited: purple-to-blue AI gradients, neon glows, washed-out green flooding, and low-contrast grey text on medical backgrounds. Every hex code is anchored in authentic clinical professionalism and meets strict WCAG AA/AAA legibility standards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Typography & Bengali Unicode */}
        {activeTab === 'typography' && (
          <div className="space-y-8">
            {/* Bengali Rule Highlight Box */}
            <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Mandatory Brand Rule
                </span>
                <h4 className="text-sm font-bold text-amber-950 mt-1">Section 29: Bengali Content Rule</h4>
                <p className="text-xs text-amber-900 mt-0.5">
                  Natural Indian Bengali (West Bengal standard). Use correct medical terminology, proper glyph rendering, and strict preference for <strong>"জল"</strong> over "পানি".
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold">
                <span>Bengali Word Check:</span>
                <span className="font-bengali font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  জল ✓ (Approved)
                </span>
                <span className="font-bengali line-through text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  পানি ✗
                </span>
              </div>
            </div>

            {/* Typography Scale Table */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 text-xs font-bold text-[#475569] grid grid-cols-12 gap-4">
                  <span className="col-span-3">Type Level & Specs</span>
                  <span className="col-span-4">English Rendering (Plus Jakarta Sans)</span>
                  <span className="col-span-5">Bengali Rendering (Noto Sans Bengali)</span>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {TYPOGRAPHY_SCALE.map((item, idx) => (
                    <div key={idx} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/60 transition-colors">
                      <div className="col-span-3 space-y-1">
                        <span className="text-xs font-bold text-[#0F172A] block">{item.level}</span>
                        <span className="text-[10px] font-mono text-slate-500 block">{item.size} • {item.weight}</span>
                        <span className="text-[10px] text-[#007E70] block">{item.usage}</span>
                      </div>
                      <div className="col-span-4">
                        <p className={`text-[#0F172A] ${
                          item.level.includes('Display') ? 'text-xl font-extrabold' :
                          item.level.includes('Section') ? 'text-lg font-bold' :
                          item.level.includes('Card') ? 'text-base font-semibold' :
                          'text-sm'
                        }`}>
                          {item.sampleEn}
                        </p>
                      </div>
                      <div className="col-span-5">
                        <p className={`font-bengali text-[#0F172A] ${
                          item.level.includes('Display') ? 'text-xl font-bold' :
                          item.level.includes('Section') ? 'text-lg font-bold' :
                          item.level.includes('Card') ? 'text-base font-semibold' :
                          'text-sm'
                        }`}>
                          {item.sampleBn}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Core UI Component Library */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            {/* Buttons & Interactive Controls */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-3">1. Button Hierarchy & States</h4>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
                <button className="px-5 py-2.5 text-xs font-bold text-white bg-[#007E70] hover:bg-[#00685c] active:bg-[#00554b] rounded-lg shadow-sm transition-all flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Primary Booking CTA
                </button>
                <button className="px-5 py-2.5 text-xs font-bold text-[#007E70] bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-all flex items-center gap-2">
                  Secondary Action Button
                </button>
                <button className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all flex items-center gap-2">
                  Tertiary Outline Button
                </button>
                <button className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Status Pill
                </button>
              </div>
            </div>

            {/* Doctor Card Mockup Blueprint */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#475569] mb-3">2. Doctor Profile Card Blueprint</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#007E70] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-50 to-slate-100 border border-teal-100 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-8 h-8 text-[#007E70]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#007E70] bg-teal-50 px-2 py-0.5 rounded">
                          General Medicine
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#0F172A]">Dr. Sourav Mukherjee</h4>
                      <p className="text-xs text-slate-600 font-medium">MBBS, MD (General Medicine)</p>
                      <p className="text-[11px] text-slate-400">Senior Consultant Physician • 14+ Yrs Exp</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#007E70]" />
                      <span>Mon - Sat (10:00 AM - 02:00 PM)</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors">
                      View Profile
                    </button>
                    <button className="py-2 text-xs font-bold text-white bg-[#007E70] hover:bg-[#00685c] rounded-lg text-center transition-colors">
                      Book Appointment
                    </button>
                  </div>
                </div>

                {/* Service Card Blueprint */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-[#007E70] transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#007E70] bg-teal-50 px-2.5 py-0.5 rounded">
                        Diagnostic Pathology
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Same-Day Reporting</span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#0F172A]">Comprehensive Executive Health Panel</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Complete metabolic screening, lipid profile, CBC, liver function, and personalized consultation review.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-[#007E70] font-semibold flex items-center gap-1">
                      Learn More <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <button className="px-4 py-1.5 text-xs font-bold text-white bg-[#007E70] hover:bg-[#00685c] rounded-lg transition-colors">
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
