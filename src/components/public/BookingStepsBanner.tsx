import React from 'react';
import { PlusCircle, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface BookingStepsBannerProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
}

export const BookingStepsBanner: React.FC<BookingStepsBannerProps> = ({
  lang,
  onOpenBooking
}) => {
  const steps = [
    {
      id: 1,
      icon: PlusCircle,
      title: lang === 'en' ? 'Select Visit Type' : 'সেবার ধরন নির্বাচন',
      description:
        lang === 'en'
          ? 'Choose the type of appointment you need.'
          : 'ডাক্তার চেম্বার, ল্যাব টেস্ট বা হোম কালেকশন বেছে নিন।'
    },
    {
      id: 2,
      icon: Calendar,
      title: lang === 'en' ? 'Choose Date & Time' : 'তারিখ ও সময় নির্ধারণ',
      description:
        lang === 'en'
          ? 'Pick a time that works for you.'
          : 'আপনার সুবিধাজনক দিন ও উপযুক্ত সময় নির্বাচন করুন।'
    },
    {
      id: 3,
      icon: FileText,
      title: lang === 'en' ? 'Provide Information' : 'তথ্য প্রদান করুন',
      description:
        lang === 'en'
          ? 'Tell us a little about you or your family.'
          : 'রোগীর নাম, বয়স ও যোগাযোগের সঠিক বিবরণ দিন।'
    },
    {
      id: 4,
      icon: CheckCircle2,
      title: lang === 'en' ? 'Get Confirmation' : 'তাৎক্ষণিক নিশ্চিতকরণ',
      description:
        lang === 'en'
          ? "You'll receive an email and text confirmation."
          : 'এসএমএস ও হোয়াটসঅ্যাপে নিশ্চিত বার্তা পাবেন।'
    }
  ];

  return (
    <section className="bg-[#0B192C] text-white py-12 lg:py-14 font-sans-ui relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {lang === 'en'
              ? 'Book Your Appointment in 4 Simple Steps'
              : 'মাত্র ৪টি সহজ ধাপে অ্যাপয়েন্টমেন্ট বুক করুন'}
          </h2>
        </div>

        {/* 4 Steps Row with Connecting Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Subtle connecting dotted line for desktop */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-slate-700 pointer-events-none z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center text-center space-y-3 group"
              >
                {/* Step Circle Icon */}
                <div className="w-14 h-14 rounded-full bg-[#132337] border-2 border-teal-500/50 group-hover:border-teal-400 group-hover:bg-[#007E70] text-white flex items-center justify-center transition-all duration-300 shadow-md">
                  <Icon className="w-6 h-6 text-teal-300 group-hover:text-white transition-colors" />
                </div>

                {/* Step Title & Description */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Link to Open Booking */}
        <div className="text-center mt-8">
          <button
            onClick={onOpenBooking}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0B192C] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>{lang === 'en' ? 'Start Easy Booking' : 'এখনই অ্যাপয়েন্টমেন্ট নিন'}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
