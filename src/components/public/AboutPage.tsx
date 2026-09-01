import React from 'react';
import {
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface AboutPageProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
  settings: WebsiteSettings;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  lang,
  onOpenBooking,
  settings
}) => {
  return (
    <div className="py-12 sm:py-16 bg-white space-y-16">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Our Guiding Philosophy' : 'আমাদের আদর্শ ও লক্ষ্য'}</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {lang === 'en' ? 'Caring Beyond Treatment' : 'চিকিৎসার বাইরেও আন্তরিক পরিচর্যা'}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'CareOn Medical Clinic is founded on the principle that genuine healthcare goes beyond prescribing medication — it requires listening, understanding, and walking alongside families at every step.'
              : 'কেয়ারঅন মেডিক্যাল ক্লিনিক বিশ্বাস করে প্রকৃত স্বাস্থ্যসেবা কেবল ঔষধ প্রেসক্রিপশনের মধ্যে সীমাবদ্ধ নয় — এটি রোগীর কথা মনোযোগ দিয়ে শোনা, পরিবারের সমস্যা বোঝা এবং প্রতিটি পদক্ষেপে পাশে থাকার অঙ্গীকার।'}
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#007E70] transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#007E70] flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A]">
              {lang === 'en' ? 'Evidence-Based Clinical Care' : 'প্রমাণ-ভিত্তিক আধুনিক চিকিৎসা'}
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'Our medical practitioners follow contemporary, peer-reviewed clinical guidelines to ensure safe, rational, and effective treatment plans.'
                : 'আমাদের বিশেষজ্ঞ চিকিৎসকরা আধুনিক ও নির্ভরযোগ্য চিকিৎসা নীতি অনুসরণ করে রোগীদের সঠিক ও নিরাপদ পরামর্শ প্রদান করেন।'}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#007E70] transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#007E70] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A]">
              {lang === 'en' ? 'Family-Oriented Healthcare' : 'পারিবারিক সার্বিক স্বাস্থ্যসেবা'}
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'We care for all generations under one roof — from infant vaccinations to senior geriatric assessments, treating the whole family with warmth.'
                : 'শিশুর স্বাস্থ্য সুরক্ষা থেকে প্রবীণদের দীর্ঘস্থায়ী রোগের পরিচর্যা — একটি ছাদের নিচে সমগ্র পরিবারের চিকিৎসা সহায়তা।'}
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#007E70] transition-all space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#007E70] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#0F172A]">
              {lang === 'en' ? 'Transparent & Respectful' : 'স্বচ্ছতা ও শ্রদ্ধাশীল সেবা'}
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'Clear explanations of diagnoses, transparent diagnostic testing, and coordinated support with no rushed consultations.'
                : 'রোগের বিষয়ে পরিষ্কার ব্যাখ্যা, স্বচ্ছ ডায়াগনস্টিক রিপোর্ট এবং ধৈর্য সহকারে পরামর্শ যাতে রোগী আশ্বস্ত হতে পারেন।'}
            </p>
          </div>
        </div>
      </div>

      {/* Outpatient Facility Standards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {lang === 'en' ? 'Clinical Facility Standards' : 'ক্লিনিকের মান ও পরিষেবা'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'en'
                ? 'Designed for Patient Peace of Mind'
                : 'রোগীর স্বাচ্ছন্দ্য ও নির্ভরযোগ্য পরিবেশ'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'CareOn operates clean outpatient consultation suites, dedicated sample collection stations, and digital record archives to ensure consistent medical follow-ups.'
                : 'পরিচ্ছন্ন চেম্বার, নিরাপদ নমুনা সংগ্রহ ব্যবস্থা এবং সুশৃঙ্খল ফলো-আপ সমন্বয়ের মাধ্যমে রোগীদের নির্ভরযোগ্য সেবা নিশ্চিত করা হয়।'}
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{lang === 'en' ? 'Sterile Diagnostic Phlebotomy' : 'নিরাপদ স্যাম্পল কালেকশন'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{lang === 'en' ? 'Quiet Consultation Chambers' : 'শান্ত ও নিরিবিলি চেম্বার'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{lang === 'en' ? 'Helpdesk Coordinator Support' : 'হেল্প ডেস্ক সহায়তা'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{lang === 'en' ? 'Request Appointment' : 'অ্যাপয়েন্টমেন্ট বুক করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
