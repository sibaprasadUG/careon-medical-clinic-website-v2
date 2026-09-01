import React, { useState, useEffect } from 'react';
import {
  Video,
  Check,
  ShieldCheck,
  Building,
  HeartHandshake,
  ArrowRight,
  Phone,
  Home
} from 'lucide-react';
import { WebsiteSettings, InsurancePartner } from '../../types';
import { DataAccessLayer } from '../../lib/dal';

interface HomeCareAndInsuranceSectionProps {
  lang: 'en' | 'bn';
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
  settings: WebsiteSettings;
}

export const HomeCareAndInsuranceSection: React.FC<HomeCareAndInsuranceSectionProps> = ({
  lang,
  onOpenBooking,
  settings
}) => {
  const cleanPhone = (settings.phone || '9933335131').replace(/[^0-9+]/g, '');
  const [insurancePartners, setInsurancePartners] = useState<InsurancePartner[]>(() =>
    DataAccessLayer.getActiveInsurancePartners()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setInsurancePartners(DataAccessLayer.getActiveInsurancePartners());
    };
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const homeCareImg =
    settings.sectionMedia?.homeCareImage ||
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900';

  return (
    <section className="bg-white py-12 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT: VIDEO / HOME CARE CONSULTATION CALLOUT CARD */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#007E70] flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-heading text-xl sm:text-2xl font-extrabold text-[#0B192C]">
                    {lang === 'en' ? 'Video & Home Consultation' : 'ভিডিও ও হোম কনসালটেশন'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'en'
                      ? 'See a doctor from the comfort of your home. Secure, private, and convenient.'
                      : 'বাড়ি থেকেই চিকিৎসকের পরামর্শ এবং রক্ত পরীক্ষা নিন। সুরক্ষিত ও সুবিধাজনক।'}
                  </p>
                </div>
              </div>

              {/* Consultation Photo */}
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[16/9] border border-slate-200">
                <img
                  src={homeCareImg}
                  alt="Doctor video consultation from home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'en' ? 'Online Doctors Available' : 'অনলাইন ডাক্তার উপলব্ধ'}</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#007E70] shrink-0" />
                  <span>{lang === 'en' ? 'Licensed providers' : 'লাইসেন্সপ্রাপ্ত ডাক্তার'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#007E70] shrink-0" />
                  <span>{lang === 'en' ? 'Same-day availability' : 'একই দিনে উপলব্ধ'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#007E70] shrink-0" />
                  <span>{lang === 'en' ? 'Verified reports' : 'নির্ভরযোগ্য রিপোর্ট'}</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => onOpenBooking({ type: 'HOME_SERVICE' })}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{lang === 'en' ? 'Start Home / Video Visit' : 'হোম / ভিডিও ভিজিট বুক করুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: WE ACCEPT MOST MAJOR INSURANCE PLANS & HEALTH SCHEMES */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 bg-slate-50/80 rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif-heading text-xl sm:text-2xl font-extrabold text-[#0B192C]">
                  {lang === 'en' ? 'We Accept Most Major Insurance Plans' : 'সকল প্রধান স্বাস্থ্য বীমা ও স্কিম গ্রহণযোগ্য'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'en'
                    ? 'Hassle-free documentation and reimbursement assistance for your family.'
                    : 'আপনার চিকিৎসা খরচ ও রিপোর্টের জন্য প্রয়োজনীয় রিইমবার্সমেন্ট সহায়তা।'}
                </p>
              </div>

              {/* Insurance Brand Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {insurancePartners.map((item) => (
                  <div
                    key={item.id || item.name}
                    className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-center text-center shadow-2xs hover:shadow-xs transition-all"
                  >
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.name} className="w-8 h-8 object-contain mb-1.5" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center mb-1.5 font-extrabold text-xs">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="text-xs font-bold text-[#0B192C]">
                      {lang === 'bn' && item.nameBn ? item.nameBn : item.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      {lang === 'bn' && item.typeBn ? item.typeBn : item.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Support Note */}
            <div className="pt-5 mt-4 border-t border-slate-200/80 text-center sm:text-left">
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'en'
                  ? "And many more. Not sure? Call us and we'll check for you:"
                  : 'অন্যান্য বীমা স্কিমের জন্য সরাসরি আমাদের হেল্পলাইনে কথা বলুন:'}{' '}
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-bold text-[#0B192C] hover:text-[#007E70] transition-colors ml-1"
                >
                  {cleanPhone}
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
