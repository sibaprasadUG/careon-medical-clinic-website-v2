import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  Calendar,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  User,
  CreditCard,
  FileText,
  Clock,
  MapPin,
  Heart,
  Stethoscope,
  Lock
} from 'lucide-react';
import { WebsiteSettings } from '../../types';
import { CareOnLogo } from '../common/CareOnMedia';

interface PublicHeaderProps {
  currentPath: string;
  navigateTo: (path: string) => void;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
  settings: WebsiteSettings;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPath,
  navigateTo,
  lang,
  setLang,
  onOpenBooking,
  settings
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isServicesOpen, setIsServicesOpen] = useState<boolean>(false);
  const [isPatientsOpen, setIsPatientsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: lang === 'en' ? 'Home' : 'হোম' },
    { path: '/services', label: lang === 'en' ? 'Services' : 'সেবাসমূহ', hasDropdown: true },
    { path: '/doctors', label: lang === 'en' ? 'Our Doctors' : 'ডাক্তারগণ' },
    { path: '/departments', label: lang === 'en' ? 'Departments' : 'বিভাগসমূহ', hasDropdown: true },
    { path: '/about', label: lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে' },
    { path: '/contact', label: lang === 'en' ? 'Contact' : 'যোগাযোগ' }
  ];

  const handleNavClick = (path: string) => {
    navigateTo(path);
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsPatientsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = (settings.phone || '9933335131').replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (settings.whatsapp || '9933335131').replace(/[^0-9]/g, '');

  const formatDisplayPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2)}`;
    }
    return raw || '9933335131';
  };

  return (
    <header className="sticky top-0 z-40 w-full font-sans-ui shadow-xs">
      {/* 1. Top Utility Bar — Clean, Calm, Professional Medical Trust Info */}
      <div className="bg-[#0B192C] text-slate-200 text-xs py-2 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Trusted care badge & location */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-300 font-medium truncate">
            <div className="flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-slate-200">
                {lang === 'en' ? 'CareOn Medical Clinic' : 'কেয়ারঅন মেডিক্যাল ক্লিনিক'}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-[11px] text-slate-300">
              {lang === 'en'
                ? 'Mon – Sat: 09:00 AM – 07:00 PM (Sunday Closed)'
                : 'সোম – শনি: সকাল ৯টা – সন্ধ্যা ৭টা (রবিবার বন্ধ)'}
            </span>
          </div>

          {/* Middle: Trusted Care slogan in Top Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] font-semibold text-teal-300 tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>
              {lang === 'en'
                ? 'Trusted Care. Personal Attention.'
                : 'নির্ভরযোগ্য সেবা ও ব্যক্তিগত যত্ন'}
            </span>
          </div>

          {/* Right: Location & Language Switcher & Admin Portal */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-slate-300 font-medium">
            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3 h-3 text-teal-400" />
              <span>Contai, Purba Medinipur</span>
            </div>

            {/* Language Switcher Dropdown / Pill */}
            <div className="flex items-center bg-slate-800/90 rounded-md p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#007E70] text-white shadow-2xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-[#007E70] text-white font-bengali shadow-2xs'
                    : 'text-slate-400 hover:text-white font-bengali'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Staff / Admin Portal Shortcut */}
            <button
              onClick={() => handleNavClick('/admin')}
              className="text-[10px] sm:text-[11px] font-semibold text-slate-300 hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Admin & Staff Portal"
            >
              <Lock className="w-3 h-3 text-teal-400" />
              <span className="hidden xs:inline">{lang === 'en' ? 'Admin' : 'অ্যাডমিন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div
        className={`bg-white transition-all duration-200 border-b border-slate-200 ${
          isScrolled ? 'shadow-md py-2.5 sm:py-3' : 'py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo Section */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B192C] to-[#007E70] flex items-center justify-center text-white shadow-sm border border-slate-200/50">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#0B192C] tracking-tight leading-tight">
                Care<span className="text-[#007E70]">On</span>
                <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans-ui">
                  Medical Clinic
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#007E70] tracking-normal">
                {lang === 'en' ? 'Caring Beyond Treatment' : 'চিকিৎসার বাইরেও আন্তরিক সেবা'}
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <button
              onClick={() => handleNavClick('/')}
              className={`transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                currentPath === '/' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
              }`}
            >
              {lang === 'en' ? 'Home' : 'হোম'}
            </button>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                onClick={() => handleNavClick('/services')}
                className={`flex items-center gap-1 transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                  currentPath === '/services' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
                }`}
              >
                <span>{lang === 'en' ? 'Services' : 'সেবাসমূহ'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#007E70] transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 w-64 pt-2 hidden group-hover:block animate-in fade-in-50 duration-150 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1">
                  <button
                    onClick={() => handleNavClick('/services')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-teal-50 hover:text-[#007E70] transition-colors"
                  >
                    {lang === 'en' ? 'All Medical Services' : 'সকল স্বাস্থ্যসেবা'}
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('/services');
                      onOpenBooking({ type: 'CLINIC_SERVICE' });
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-[#007E70] transition-colors"
                  >
                    {lang === 'en' ? '🏥 In-Clinic Diagnostics & ECG' : '🏥 ইন-ক্লিনিক ডায়াগনস্টিক ও ইসিজি'}
                  </button>
                  <button
                    onClick={() => {
                      handleNavClick('/services');
                      onOpenBooking({ type: 'HOME_SERVICE' });
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-purple-800 hover:bg-purple-50 transition-colors"
                  >
                    {lang === 'en' ? '🏠 Doorstep Sample Collection' : '🏠 বাড়িতে রক্ত সংগ্রহ ও সেবা'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('/doctors')}
              className={`transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                currentPath === '/doctors' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
              }`}
            >
              {lang === 'en' ? 'Our Doctors' : 'ডাক্তারগণ'}
            </button>

            <button
              onClick={() => handleNavClick('/departments')}
              className={`transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                currentPath === '/departments' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
              }`}
            >
              {lang === 'en' ? 'Departments' : 'বিভাগসমূহ'}
            </button>

            <button
              onClick={() => handleNavClick('/about')}
              className={`transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                currentPath === '/about' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
              }`}
            >
              {lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে'}
            </button>

            <button
              onClick={() => handleNavClick('/contact')}
              className={`transition-colors hover:text-[#007E70] cursor-pointer py-1 ${
                currentPath === '/contact' ? 'text-[#007E70] font-extrabold border-b-2 border-[#007E70]' : ''
              }`}
            >
              {lang === 'en' ? 'Contact' : 'যোগাযোগ'}
            </button>
          </nav>

          {/* Right Action Area (Phone + Book Appointment Pill Button) */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {/* Phone Info Block */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-teal-50 text-[#007E70] flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#0B192C] group-hover:text-[#007E70] transition-colors leading-tight tracking-tight">
                  {cleanPhone}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold leading-tight">
                  {lang === 'en' ? 'Mon–Sat 9am–7pm' : 'সোম–শনি সকাল ৯টা–সন্ধ্যা ৭টা'}
                </div>
              </div>
            </a>

            {/* Book Appointment Pill Button (Matching exact deep navy / teal style in reference) */}
            <button
              onClick={() => onOpenBooking()}
              className="px-4 py-2.5 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer group"
            >
              <Calendar className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
              <span>{lang === 'en' ? 'Book Appointment' : 'বুক অ্যাপয়েন্টমেন্ট'}</span>
            </button>
          </div>

          {/* Mobile Actions: Phone Call + Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`tel:${cleanPhone}`}
              className="p-2 text-[#007E70] bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center justify-center transition-colors"
              aria-label="Call Clinic Helpline"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() => onOpenBooking()}
              className="px-3 py-2 bg-[#0B192C] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden xs:inline">{lang === 'en' ? 'Book' : 'বুকিং'}</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-[#007E70]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 px-4 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>{lang === 'en' ? 'Book Appointment' : 'অ্যাপয়েন্টমেন্ট নিন'}</span>
            </button>

            <a
              href={`https://wa.me/${cleanWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-[#007E70] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-teal-200"
            >
              <MessageCircle className="w-4 h-4 text-teal-600" />
              <span>{lang === 'en' ? 'WhatsApp Clinic Support' : 'হোয়াটসঅ্যাপ সহায়তা'}</span>
            </a>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleNavClick('/admin');
              }}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-teal-600" />
              <span>{lang === 'en' ? 'Staff & Admin Portal' : 'স্টাফ ও অ্যাডমিন পোর্টাল'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
