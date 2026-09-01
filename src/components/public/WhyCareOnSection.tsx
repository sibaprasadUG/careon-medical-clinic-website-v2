import React from 'react';
import {
  HeartHandshake,
  UserCheck,
  Activity,
  ShieldCheck,
  Clock,
  Sparkles,
  Stethoscope,
  Smile
} from 'lucide-react';

interface WhyCareOnSectionProps {
  lang: 'en' | 'bn';
}

export const WhyCareOnSection: React.FC<WhyCareOnSectionProps> = ({ lang }) => {
  const pillars = [
    {
      icon: UserCheck,
      title: lang === 'en' ? 'Attentive Consultations' : 'মনোযোগ সহকারে পরামর্শ',
      description:
        lang === 'en'
          ? 'Physicians allocate dedicated time to review symptoms, medical background, and individual health questions.'
          : 'চিকিৎসকরা আপনার পূর্ববর্তী স্বাস্থ্য ইতিহাস, লক্ষণ ও স্বাস্থ্যগত প্রশ্ন মনোযোগ সহকারে শুনে পরামর্শ দেন।'
    },
    {
      icon: Stethoscope,
      title: lang === 'en' ? 'Doctor Consultations' : 'অভিজ্ঞ চিকিৎসক',
      description:
        lang === 'en'
          ? 'Consultations across general medicine, pediatrics, cardiology, gynecology, and family health.'
          : 'মেডিসিন, শিশু চিকিৎসা, হৃদরোগ, স্ত্রীরোগ ও পারিবারিক স্বাস্থ্যের জন্য চিকিৎসকদের পরামর্শ।'
    },
    {
      icon: Activity,
      title: lang === 'en' ? 'Diagnostic Testing' : 'ডায়াগনস্টিক টেস্ট ও রিপোর্ট',
      description:
        lang === 'en'
          ? 'Routine pathology tests, preventive health panels, and clear reports to support doctor evaluations.'
          : 'নিয়মিত প্যাথলজি টেস্ট, প্রতিরোধমূলক স্বাস্থ্য পরীক্ষা এবং সঠিক সময়ে রিপোর্ট সরবরাহ।'
    },
    {
      icon: HeartHandshake,
      title: lang === 'en' ? 'Caring Beyond Treatment' : 'চিকিৎসার বাইরেও আন্তরিক সেবা',
      description:
        lang === 'en'
          ? 'Clear booking assistance, appointment coordination, and patient-first reception at every visit.'
          : 'সহজ বুকিং সহায়তা, অ্যাপয়েন্টমেন্ট সমন্বয় এবং ক্লিনিকে প্রতিটি পদক্ষেপে আন্তরিক সহযোগিতা।'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Patient-First Focus' : 'রোগী-কেন্দ্রিক সেবা'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en'
              ? 'Our Commitment to Patient Care'
              : 'রোগীদের সেবায় আমাদের অঙ্গীকার'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'CareOn Medical Clinic is organized to provide organized, attentive outpatient care and responsive diagnostic support.'
              : 'সুশৃঙ্খল আউটপেশেন্ট চিকিৎসা, আন্তরিক সেবা ও নির্ভরযোগ্য ডায়াগনস্টিক সহায়তার জন্য কেয়ারঅন ক্লিনিক প্রতিশ্রুতিবদ্ধ।'}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-[#007E70] hover:bg-white hover:shadow-md transition-all space-y-4 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-[#007E70] group-hover:bg-[#007E70] group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#007E70] transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
