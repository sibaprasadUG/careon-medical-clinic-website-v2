import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  ShieldCheck,
  Stethoscope,
  ChevronDown,
  ArrowRight,
  Phone,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Building2,
  Home
} from 'lucide-react';
import { Doctor, Service, WebsiteSettings, BookingType } from '../../types';

interface HeroSectionProps {
  doctors?: Doctor[];
  services?: Service[];
  navigateTo: (path: string) => void;
  lang: 'en' | 'bn';
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
  settings: WebsiteSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  doctors = [],
  services = [],
  navigateTo,
  lang,
  onOpenBooking,
  settings
}) => {
  const [visitType, setVisitType] = useState<string>('DOCTOR_CONSULTATION');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('Morning (09:00 AM - 01:00 PM)');

  // Filter active doctors and services
  const activeDoctors = doctors.filter((d) => d.status === 'ACTIVE');
  const activeServices = services.filter((s) => s.status === 'ACTIVE');
  const clinicServices = activeServices.filter((s) => s.serviceType === 'CLINIC' || s.serviceType === 'BOTH');
  const homeServices = activeServices.filter((s) => s.serviceType === 'HOME' || s.serviceType === 'BOTH');

  // Tomorrow as default date string
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Skip Sunday
    return d.toISOString().split('T')[0];
  };

  const handleHeroBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (visitType === 'DOCTOR_CONSULTATION') {
      onOpenBooking({
        type: 'DOCTOR_CONSULTATION',
        id: selectedTargetId || activeDoctors[0]?.id
      });
    } else if (visitType === 'HOME_SERVICE') {
      onOpenBooking({
        type: 'HOME_SERVICE',
        id: selectedTargetId || homeServices[0]?.id
      });
    } else {
      onOpenBooking({
        type: 'CLINIC_SERVICE',
        id: selectedTargetId || clinicServices[0]?.id
      });
    }
  };

  const cleanPhone = (settings.phone || '9933520248').replace(/[^0-9+]/g, '');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F1F5F9]/80 via-white to-slate-50 pt-8 pb-14 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-3xl pointer-events-none -translate-y-24" />
      <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: HEADLINE, DESCRIPTION, VALUE PROPOSITIONS & BACKGROUND PHOTO */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>
                {lang === 'en'
                  ? 'Compassionate care. Proven results.'
                  : 'চিকিৎসার বাইরেও আন্তরিক সেবা'}
              </span>
            </div>

            {/* Main Editorial Headline (Matching Reference Typography) */}
            <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight leading-[1.12]">
              {lang === 'en' ? (
                <>
                  Your Family's <br className="hidden sm:inline" />
                  Health Comes First
                </>
              ) : (
                <>
                  আপনার পরিবারের <br className="hidden sm:inline" />
                  স্বাস্থ্য আমাদের অগ্রাধিকার
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              {lang === 'en'
                ? 'Comprehensive, personalized primary care for every member of your family—because healthier families build happier lives.'
                : 'প্রতিটি বয়সের জন্য যত্নশীল পরামর্শ, আধুনিক ল্যাব টেস্ট এবং প্রতিটি রোগীর প্রতি গভীর মনোযোগ নিয়ে কেয়ারঅন আপনার পরিবারের পাশে।'}
            </p>

            {/* Family Care Photo Collage / Atmospheric Visual */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white aspect-[16/9] max-h-72">
              <img
                src={
                  settings.sectionMedia?.heroImage ||
                  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200'
                }
                alt="Happy family and doctor care consultation at CareOn Medical Clinic"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/80 via-transparent to-transparent flex items-end p-4 sm:p-5">
                <div className="text-white space-y-0.5">
                  <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CareOn Medical Clinic • Contai</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200">
                    {lang === 'en'
                      ? 'Outpatient Consultations • Diagnostic Pathology • Home Care'
                      : 'বহির্বিভাগ চেম্বার • প্যাথলজি টেস্ট • হোম সার্ভিস'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Core Trust Badges (Exact match to Reference) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Badge 1: Whole Family Care */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#007E70] flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B192C]">
                    {lang === 'en' ? 'Whole Family Care' : 'সমগ্র পরিবারের স্বাস্থ্য'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'en' ? 'All ages. All stages.' : 'সকল বয়সের জন্য যত্ন'}
                  </p>
                </div>
              </div>

              {/* Badge 2: Same-Day Appointments */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#007E70] flex items-center justify-center shrink-0 shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B192C]">
                    {lang === 'en' ? 'Same-Day Consults' : 'একই দিনে অ্যাপয়েন্টমেন্ট'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'en' ? 'When you need us.' : 'জরুরি সময়ে পাশে'}
                  </p>
                </div>
              </div>

              {/* Badge 3: Trusted & Experienced */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-[#007E70] flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B192C]">
                    {lang === 'en' ? 'Trusted & Experienced' : 'অভিজ্ঞ চিকিৎসকবৃন্দ'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'en' ? 'Board-certified team.' : 'সার্টিফাইড বিশেষজ্ঞ'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: INTERACTIVE QUICK BOOKING CARD WIDGET (Matching Reference) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/5 border border-slate-200 text-left relative">
              {/* Card Header */}
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-[#0B192C] tracking-tight">
                  {lang === 'en' ? 'Book an Appointment' : 'অ্যাপয়েন্টমেন্ট নিন'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'en' ? 'Fast, easy, and secure.' : 'সহজ, দ্রুত ও সুরক্ষিত'}
                </p>
              </div>

              {/* Booking Form Fields */}
              <form onSubmit={handleHeroBookingSubmit} className="space-y-4 pt-4">
                
                {/* 1. Visit Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Visit Type' : 'সেবার ধরন'}
                  </label>
                  <select
                    value={visitType}
                    onChange={(e) => {
                      setVisitType(e.target.value);
                      setSelectedTargetId('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-colors"
                  >
                    <option value="DOCTOR_CONSULTATION">
                      {lang === 'en' ? 'Doctor Consultation (Chamber)' : 'ডাক্তার কনসালটেশন (চেম্বার)'}
                    </option>
                    <option value="CLINIC_SERVICE">
                      {lang === 'en' ? 'Clinic Lab Test / Diagnostic' : 'ক্লিনিক ল্যাব টেস্ট ও পরীক্ষা'}
                    </option>
                    <option value="HOME_SERVICE">
                      {lang === 'en' ? '🏠 Doorstep Home Sample Collection' : '🏠 বাড়িতে রক্ত সংগ্রহ ও সেবা'}
                    </option>
                  </select>
                </div>

                {/* 2. Select Specific Doctor or Service */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {visitType === 'DOCTOR_CONSULTATION'
                      ? (lang === 'en' ? 'Select Doctor / Specialty' : 'চিকিৎসক বা বিভাগ নির্বাচন')
                      : (lang === 'en' ? 'Select Test or Service' : 'টেস্ট বা প্যাকেজ নির্বাচন')}
                  </label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-colors"
                  >
                    {visitType === 'DOCTOR_CONSULTATION' && (
                      <>
                        <option value="">{lang === 'en' ? 'Any Available Specialist' : 'উপলব্ধ চিকিৎসক নির্বাচন করুন'}</option>
                        {activeDoctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} — {doc.designation}
                          </option>
                        ))}
                      </>
                    )}

                    {visitType === 'CLINIC_SERVICE' && (
                      <>
                        <option value="">{lang === 'en' ? 'Select Diagnostic Service' : 'ডায়াগনস্টিক টেস্ট নির্বাচন করুন'}</option>
                        {clinicServices.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name}
                          </option>
                        ))}
                      </>
                    )}

                    {visitType === 'HOME_SERVICE' && (
                      <>
                        <option value="">{lang === 'en' ? 'Select Home Service / Blood Collection' : 'হোম সেবা বা রক্ত সংগ্রহ নির্বাচন'}</option>
                        {homeServices.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} (Home Collection)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {/* 3. Preferred Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Preferred Date' : 'পছন্দের তারিখ'}
                  </label>
                  <input
                    type="date"
                    min={getTomorrowDate()}
                    value={preferredDate || getTomorrowDate()}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-colors"
                  />
                </div>

                {/* 4. Preferred Time Window */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Preferred Time' : 'পছন্দের সময়'}
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-colors"
                  >
                    <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM – 01:00 PM)</option>
                    <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM – 04:00 PM)</option>
                    <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM – 07:00 PM)</option>
                  </select>
                </div>

                {/* Action CTA Button (Exact Deep Navy matching reference) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>{lang === 'en' ? 'Find Available Times' : 'উপলব্ধ সময় খুঁজুন ও বুক করুন'}</span>
                    <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Bottom Call Fallback */}
                <div className="text-center pt-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="text-xs text-slate-500 hover:text-[#007E70] font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{lang === 'en' ? 'Or call us' : 'অথবা সরাসরি ফোন করুন'}:</span>
                    <span className="text-[#0B192C] font-bold">
                      {cleanPhone}
                    </span>
                  </a>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
