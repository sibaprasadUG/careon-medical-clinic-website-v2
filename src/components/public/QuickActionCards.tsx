import React from 'react';
import {
  UserPlus,
  Users,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface QuickActionCardsProps {
  lang: 'en' | 'bn';
  navigateTo: (path: string) => void;
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
}

export const QuickActionCards: React.FC<QuickActionCardsProps> = ({
  lang,
  navigateTo,
  onOpenBooking
}) => {
  const cards = [
    {
      id: 'new-patient',
      icon: UserPlus,
      title: lang === 'en' ? 'New Patient' : 'নতুন রোগী',
      description:
        lang === 'en'
          ? 'Join our clinic and get personalized care.'
          : 'আমাদের ক্লিনিকে রেজিস্ট্রেশন করে ব্যক্তিগত যত্ন নিন।',
      actionText: lang === 'en' ? 'Learn More' : 'বিস্তারিত জানুন',
      action: () => navigateTo('/about')
    },
    {
      id: 'family-care',
      icon: Users,
      title: lang === 'en' ? 'Family Care' : 'পারিবারিক যত্ন',
      description:
        lang === 'en'
          ? 'Care for every member of your family.'
          : 'পরিবারের শিশু থেকে প্রবীণ সবার জন্য সমন্বিত সেবা।',
      actionText: lang === 'en' ? 'Learn More' : 'বিস্তারিত জানুন',
      action: () => navigateTo('/services')
    },
    {
      id: 'quick-appointment',
      icon: Clock,
      title: lang === 'en' ? 'Quick Appointment' : 'দ্রুত অ্যাপয়েন্টমেন্ট',
      description:
        lang === 'en'
          ? 'Find same-day or next-day appointment options.'
          : 'আজ বা আগামীকালের দ্রুত চেম্বার ও টেস্ট স্লট বুক করুন।',
      actionText: lang === 'en' ? 'Book Now' : 'বুক করুন',
      action: () => onOpenBooking(),
      highlight: true
    },
    {
      id: 'preventive-checkup',
      icon: ShieldCheck,
      title: lang === 'en' ? 'Preventive Check-up' : 'প্রতিরোধমূলক চেকআপ',
      description:
        lang === 'en'
          ? 'Stay ahead with regular health screenings.'
          : 'নিয়মিত স্বাস্থ্য পরীক্ষা ও ল্যাব টেস্টের মাধ্যমে সুস্থ থাকুন।',
      actionText: lang === 'en' ? 'Learn More' : 'প্যাকেজ দেখুন',
      action: () => {
        navigateTo('/services');
      }
    }
  ];

  return (
    <section className="bg-white py-8 sm:py-10 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.action}
                className="group relative bg-white hover:bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-[#0B192C] group-hover:text-[#007E70] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B192C] group-hover:text-[#007E70] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center text-xs font-bold text-[#0B192C] group-hover:text-[#007E70] transition-colors gap-1.5">
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
