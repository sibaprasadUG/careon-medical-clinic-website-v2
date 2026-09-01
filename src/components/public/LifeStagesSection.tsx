import React from 'react';
import {
  Baby,
  User,
  Heart,
  Users,
  Shield,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface LifeStagesSectionProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
}

export const LifeStagesSection: React.FC<LifeStagesSectionProps> = ({
  lang,
  onOpenBooking
}) => {
  const stages = [
    {
      icon: Baby,
      title: lang === 'en' ? 'Pediatric & Child Wellness' : 'শিশু স্বাস্থ্য ও পুষ্টি সেবা',
      subtitle: lang === 'en' ? 'From Infancy to Adolescence' : 'নবজাতক থেকে কৈশোর',
      points: [
        lang === 'en' ? 'Growth & developmental milestone reviews' : 'শিশুর বৃদ্ধি ও শারীরিক বিকাশ পর্যবেক্ষণ',
        lang === 'en' ? 'Pediatric immunizations & seasonal care' : 'প্রয়োজনীয় টিকাদান ও মৌসুমি রোগের চিকিৎসা',
        lang === 'en' ? 'Childhood nutrition & allergy advice' : 'পুষ্টি পরামর্শ ও অ্যালার্জি ব্যবস্থাপনা'
      ]
    },
    {
      icon: User,
      title: lang === 'en' ? 'Adult Preventive Health' : 'প্রাপ্তবয়স্ক প্রতিরোধমূলক যত্ন',
      subtitle: lang === 'en' ? 'Active Years & Daily Wellness' : 'কর্মব্যস্ত জীবনের স্বাস্থ্য সুরক্ষা',
      points: [
        lang === 'en' ? 'Executive & annual wellness blood screenings' : 'বার্ষিক স্বাস্থ্য পরীক্ষা ও ব্লাড প্রোফাইল',
        lang === 'en' ? 'Lifestyle, hypertension & stress management' : 'উচ্চ রক্তচাপ, স্ট্রেস ও লাইফস্টাইল ব্যবস্থাপনা',
        lang === 'en' ? 'Metabolic & lipid health assessments' : 'মেটাবলিক ও কোলেস্টেরল নিয়ন্ত্রণ পরামর্শ'
      ]
    },
    {
      icon: Heart,
      title: lang === 'en' ? "Women's Health & Wellness" : 'নারী স্বাস্থ্য ও সার্বিক যত্ন',
      subtitle: lang === 'en' ? 'Compassionate & Confidential' : 'গোপনীয় ও সহানুভূতিশীল পরামর্শ',
      points: [
        lang === 'en' ? 'Gynecological consultations & routine checkups' : 'গাইনি কনসালটেশন ও নিয়মিত পরীক্ষা',
        lang === 'en' ? 'Hormonal, thyroid & PCOS guidance' : 'হরমোন, থাইরয়েড ও পিসিওএস চিকিৎসা',
        lang === 'en' ? 'Antenatal care & maternal health advice' : 'মাতৃস্বাস্থ্য ও গর্ভাবস্থাকালীন পরামর্শ'
      ]
    },
    {
      icon: Users,
      title: lang === 'en' ? 'Senior Care & Chronic Illness' : 'প্রবীণ স্বাস্থ্য ও দীর্ঘস্থায়ী রোগ',
      subtitle: lang === 'en' ? 'Dignity, Mobility & Vitality' : 'সম্মানজনক ও নিয়মিত পরিচর্যা',
      points: [
        lang === 'en' ? 'Long-term diabetes & cardiac supervision' : 'ডায়াবেটিস ও হৃদরোগের নিয়মিত মনিটরিং',
        lang === 'en' ? 'Joint pain, arthritis & mobility reviews' : 'হাড়ের ব্যথা, বাত ও জয়েন্ট কেয়ার',
        lang === 'en' ? 'Comprehensive geriatric medication reviews' : 'বয়স্কদের ঔষধ ব্যবস্থাপনা ও পরামর্শ'
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Comprehensive Family Medicine' : 'পারিবারিক সার্বিক স্বাস্থ্যসেবা'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en'
              ? 'Healthcare for Every Stage of Life'
              : 'জীবনের প্রতিটি ধাপে কেয়ারঅনের সাথে'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'From early childhood immunizations to senior geriatric care, we provide tailored medical attention for every generation of your family.'
              : 'শিশুর প্রথম টিকা থেকে শুরু করে বয়োজ্যেষ্ঠদের সার্বিক যত্ন — প্রতিটি প্রজন্মের জন্য আমাদের বিশেষায়িত সেবা।'}
          </p>
        </div>

        {/* Life Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#007E70] hover:shadow-lg transition-all flex flex-col justify-between space-y-6 text-left group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] group-hover:bg-[#007E70] group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-teal-800 font-semibold mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {stage.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#007E70] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
