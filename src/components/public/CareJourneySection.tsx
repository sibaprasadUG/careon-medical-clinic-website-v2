import React from 'react';
import {
  Search,
  Calendar,
  PhoneCall,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface CareJourneySectionProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
}

export const CareJourneySection: React.FC<CareJourneySectionProps> = ({
  lang,
  onOpenBooking
}) => {
  const steps = [
    {
      step: '01',
      icon: Search,
      title: lang === 'en' ? 'Find Specialist or Test' : 'চিকিৎসক বা টেস্ট নির্বাচন',
      desc:
        lang === 'en'
          ? 'Browse active physicians by department or select your required preventive diagnostic package.'
          : 'প্রয়োজনাযায়ী বিভাগীয় চিকিৎসক খুঁজুন অথবা রোগ নির্ণয় ও স্বাস্থ্য পরীক্ষা প্যাকেজ বেছে নিন।'
    },
    {
      step: '02',
      icon: Calendar,
      title: lang === 'en' ? 'Submit Preferred Slot' : 'সময় নির্ধারণ ও বুকিং',
      desc:
        lang === 'en'
          ? 'Choose your preferred date, consultation timing window, and submit your basic intake details.'
          : 'আপনার সুবিধাজনক তারিখ ও সময় নির্বাচন করে সহজেই অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠান।'
    },
    {
      step: '03',
      icon: PhoneCall,
      title: lang === 'en' ? 'Coordinator Verification' : 'হেল্প ডেস্ক সমন্বয়',
      desc:
        lang === 'en'
          ? 'A CareOn coordinator reviews doctor chamber availability and calls or messages to confirm.'
          : 'কেয়ারঅন সমন্বয়কারী চিকিৎসকের চেম্বার সময়সূচী যাচাই করে আপনার সাথে যোগাযোগ করবেন।'
    },
    {
      step: '04',
      icon: Stethoscope,
      title: lang === 'en' ? 'Clinic Consultation' : 'মনোযোগ দিয়ে পরামর্শ গ্রহণ',
      desc:
        lang === 'en'
          ? 'Arrive at our clinic for an unrushed, comprehensive physical consultation and diagnosis.'
          : 'ক্লিনিকে এসে শান্ত পরিবেশে চিকিৎসকের সাথে খোলামেলা আলোচনা ও স্বাস্থ্য পরীক্ষা করান।'
    },
    {
      step: '05',
      icon: HeartHandshake,
      title: lang === 'en' ? 'Guidance & Follow-up' : 'ফলো-আপ ও ধারাবাহিক সেবা',
      desc:
        lang === 'en'
          ? 'Receive digital prescriptions, timely lab reports, and coordinated continuity of care.'
          : 'প্রেসক্রিপশন, দ্রুত টেস্ট রিপোর্ট এবং পরবর্তী স্বাস্থ্য নির্দেশনায় আমরা সবসময় আপনার পাশে।'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Smooth & Transparent Process' : 'সহজ ও স্পষ্ট সেবা প্রক্রিয়া'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en' ? 'Your Care Journey at CareOn' : 'কেয়ারঅনে আপনার চিকিৎসা যাত্রা'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Every step from online appointment submission to chamber consultation is designed for clarity and peace of mind.'
              : 'অনলাইন বুকিং থেকে শুরু করে চেম্বারে চিকিৎসকের পরামর্শ — প্রতিটি ধাপ স্বচ্ছ ও রোগীর সুবিধাজনক।'}
          </p>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#007E70] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3 text-left group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-[#007E70] group-hover:bg-[#007E70] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-slate-400 font-mono">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Process Trust Guarantee Badge */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#007E70]" />
            <span>{lang === 'en' ? 'Structured Consultation Slots' : 'সুশৃঙ্খল পরামর্শ সময়সূচী'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#007E70]" />
            <span>{lang === 'en' ? 'Coordinator Confirmation Call' : 'ফোন বা মেসেজে নিশ্চিতকরণ'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#007E70]" />
            <span>{lang === 'en' ? 'Continuity of Care & Follow-ups' : 'ধারাবাহিক ফলো-আপ ও প্রেসক্রিপশন'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
