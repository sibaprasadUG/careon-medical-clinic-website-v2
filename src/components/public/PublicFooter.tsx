import React from 'react';
import {
  Heart,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Calendar,
  ShieldAlert,
  ChevronRight,
  Facebook,
  Instagram,
  Globe,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  Lock
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface PublicFooterProps {
  navigateTo: (path: string) => void;
  lang: 'en' | 'bn';
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
  settings: WebsiteSettings;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  navigateTo,
  lang,
  onOpenBooking,
  settings
}) => {
  const receptionPhone = '9933520248';
  const whatsappNumber = '9933335131';
  const helplinePhone = '9933335131';

  const quickLinks = [
    { path: '/', label: lang === 'en' ? 'Home' : 'হোম' },
    { path: '/services', label: lang === 'en' ? 'Services' : 'সেবাসমূহ' },
    { path: '/doctors', label: lang === 'en' ? 'Our Doctors' : 'ডাক্তারগণ' },
    { path: '/departments', label: lang === 'en' ? 'Departments' : 'বিভাগসমূহ' },
    { path: '/about', label: lang === 'en' ? 'About Us' : 'আমাদের সম্পর্কে' },
    { path: '/contact', label: lang === 'en' ? 'Contact' : 'যোগাযোগ' },
    { path: '/admin', label: lang === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল' }
  ];

  const patientLinks = [
    { label: lang === 'en' ? 'Book Appointment' : 'বুক অ্যাপয়েন্টমেন্ট', action: () => onOpenBooking() },
    { label: lang === 'en' ? 'Our Doctors' : 'ডাক্তারগণ', action: () => navigateTo('/doctors') },
    { label: lang === 'en' ? 'Medical Services' : 'মেডিকেল সেবাসমূহ', action: () => navigateTo('/services') },
    { label: lang === 'en' ? 'Departments' : 'বিভাগসমূহ', action: () => navigateTo('/departments') },
    { label: lang === 'en' ? 'Help & FAQs' : 'সাধারণ প্রশ্নাবলি (FAQ)', action: () => navigateTo('/faqs') },
    { label: lang === 'en' ? 'Staff & Admin Login' : 'স্টাফ ও অ্যাডমিন লগইন', action: () => navigateTo('/admin') }
  ];

  return (
    <footer className="bg-[#0B192C] text-white border-t border-slate-800 font-sans-ui">
      
      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.2fr_1.1fr] gap-8 lg:gap-6 xl:gap-8 items-start">
          
          {/* Col 1: Brand & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-[#007E70] flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 text-white fill-white/30" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-white tracking-tight leading-tight">
                  Care<span className="text-teal-400">On</span>
                  <span className="text-xs font-semibold text-slate-400 ml-1.5 font-sans-ui">
                    Clinic
                  </span>
                </div>
                <div className="text-[10px] text-teal-300 font-medium">
                  {lang === 'en' ? 'Caring Beyond Treatment' : 'চিকিৎসার বাইরেও আন্তরিক সেবা'}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Compassionate, comprehensive care for your family\'s health and wellness.'
                : 'আপনার ও পুরো পরিবারের সুস্বাস্থ্যের জন্য নির্ভরযোগ্য বহির্বিভাগ ক্লিনিক ও প্যাথলজি সেবা।'}
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={settings.socialLinks?.facebook?.url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#007E70] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.instagram?.url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#007E70] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.googleBusiness?.url || 'https://share.google/1rR9CTJqmxgGnvW7I'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Find CareOn Medical Clinic on Google Maps"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#007E70] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks?.whatsapp?.url || `https://wa.me/91${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#007E70] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {lang === 'en' ? 'Quick Links' : 'দ্রুত লিঙ্ক'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => {
                      navigateTo(link.path);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-teal-300 transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Patients & Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {lang === 'en' ? 'Patients' : 'রোগী সহায়তা'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              {patientLinks.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={item.action}
                    className="hover:text-teal-300 transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {lang === 'en' ? 'Contact Us' : 'যোগাযোগ'}
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-slate-400">Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div>
                  <span className="text-slate-400 mr-1.5">{lang === 'en' ? 'Reception Desk:' : 'রিসেপশন ডেস্ক:'}</span>
                  <a href={`tel:${receptionPhone}`} className="font-bold text-white hover:text-teal-300 transition-colors">
                    {receptionPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 mr-1.5">{lang === 'en' ? 'WhatsApp:' : 'হোয়াটসঅ্যাপ:'}</span>
                  <a
                    href={`https://wa.me/91${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {whatsappNumber}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <a href="mailto:info@careonmedical.in" className="hover:text-teal-300 transition-colors truncate text-slate-400">
                  info@careonmedical.in
                </a>
              </div>
            </div>
          </div>

          {/* Col 5: Reception Desk & Support Card */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-[#132337] rounded-2xl p-4 sm:p-5 border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-teal-400">
                <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === 'en' ? 'Reception & Support' : 'রিসেপশন ও জরুরি সহায়তা'}
                </h4>
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href={`tel:${receptionPhone}`}
                  className="w-full min-h-[44px] py-2 px-3 bg-teal-950/80 hover:bg-teal-900/80 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-teal-700/60"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{lang === 'en' ? 'Reception Desk' : 'রিসেপশন ডেস্ক'}: {receptionPhone}</span>
                </a>

                <a
                  href={`https://wa.me/91${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] py-2 px-3 bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-emerald-700/60"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>WhatsApp: {whatsappNumber}</span>
                </a>

                <div className="text-[11px] text-teal-300 font-semibold text-center pt-0.5">
                  {lang === 'en' ? 'Mon – Sat: 09:00 AM – 07:00 PM' : 'সোম – শনি: সকাল ৯টা – সন্ধ্যা ৭টা'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} CareOn Medical Clinic. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
            <button onClick={() => navigateTo('/about')} className="hover:text-slate-200 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('/about')} className="hover:text-slate-200 transition-colors cursor-pointer">
              Terms of Use
            </button>
            <span>•</span>
            <button onClick={() => navigateTo('/about')} className="hover:text-slate-200 transition-colors cursor-pointer">
              Notice of Privacy Practices
            </button>
            <span>•</span>
            <button
              onClick={() => {
                navigateTo('/admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-[#007E70] text-teal-300 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700/80"
              title="Admin Login & Staff Portal"
            >
              <Lock className="w-3 h-3 text-teal-400" />
              <span>{lang === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
