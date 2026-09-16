import React from 'react';
import { Calendar, Phone, Stethoscope, ChevronRight, Lock, ShieldCheck } from 'lucide-react';
import { WhatsAppIcon } from './common/WhatsAppIcon';
import { BRAND_CONSTANTS } from '../data/architectureData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  onOpenBookingModal?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  onOpenBookingModal,
  onOpenAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200">
      {/* Top Micro-Bar for Clinic Helpline, Admin Control Center Link & Bengali Switcher */}
      <div className="bg-[#0F172A] text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Phone className="w-3 h-3 text-[#0D9488]" />
            <span>Clinic Helpline: <strong className="text-white">{BRAND_CONSTANTS.phone}</strong></span>
          </span>
          <span className="hidden md:inline-block text-slate-500">|</span>
          <span className="hidden md:inline-block text-slate-400">
            {lang === 'en' ? BRAND_CONSTANTS.positioning : 'আপনার এবং আপনার পরিবারের বিশ্বস্ত স্বাস্থ্যসেবা'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Control Center Portal Button */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white border border-slate-700 transition-colors text-[11px] font-bold cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal (Phase 03)</span>
            </button>
          )}

          <div className="flex items-center bg-slate-800 rounded px-1.5 py-0.5 border border-slate-700">
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                lang === 'en' ? 'bg-[#007E70] text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                lang === 'bn' ? 'bg-[#007E70] text-white font-semibold font-bengali' : 'text-slate-400 hover:text-white font-bengali'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm border border-slate-200/80 overflow-hidden shrink-0">
            <img
              src="https://tgwthqwivtmarjsslxxn.supabase.co/storage/v1/object/public/careon-media/assets/doctor/asset-1789066744779-h4uevf-careon_logo_png.png"
              alt="CareOn Medical Clinic"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to stylized icon if image fails
                (e.currentTarget.style as any).display = 'none';
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.className = "w-11 h-11 rounded-xl bg-gradient-to-br from-[#007E70] to-[#0D9488] flex items-center justify-center text-white shadow-sm shadow-teal-900/10";
                  e.currentTarget.parentElement.innerHTML = '<svg class="w-6 h-6 stroke-[2.2]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>';
                }
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">CareOn</span>
              <span className="text-sm font-semibold text-[#007E70] uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                Medical Clinic
              </span>
            </div>
            <p className="text-xs text-[#475569] font-medium tracking-wide">
              {lang === 'en' ? 'Caring Beyond Treatment' : 'চিকিৎসার বাইরেও আন্তরিক সেবা'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/80">
          {[
            { id: 'overview', label: lang === 'en' ? 'Overview' : 'সারসংক্ষেপ' },
            { id: 'ia-sitemap', label: lang === 'en' ? 'IA & Sitemap' : 'সাইটম্যাপ' },
            { id: 'wireframe', label: lang === 'en' ? 'Homepage Wireframe' : 'ওয়্যারফ্রেম' },
            { id: 'design-system', label: lang === 'en' ? 'Design & Typography' : 'ডিজাইন সিস্টেম' },
            { id: 'data-admin', label: lang === 'en' ? 'Data & Admin' : 'ডেটা ও অ্যাডমিন' },
            { id: 'tech-roadmap', label: lang === 'en' ? 'Tech & Roadmap' : 'প্রযুক্তি ও রোডম্যাপ' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white text-[#007E70] shadow-xs border border-slate-200'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${BRAND_CONSTANTS.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#007E70] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg transition-colors"
            title="Chat with CareOn Help Desk on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={onOpenBookingModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#007E70] hover:bg-[#00685c] active:bg-[#00554b] rounded-lg shadow-sm shadow-teal-900/10 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'en' ? 'Book Appointment' : 'অ্যাপয়েন্টমেন্ট বুক করুন'}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
};
