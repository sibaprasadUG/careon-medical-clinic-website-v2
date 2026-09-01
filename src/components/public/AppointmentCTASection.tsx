import React from 'react';
import {
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface AppointmentCTASectionProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
  settings: WebsiteSettings;
}

export const AppointmentCTASection: React.FC<AppointmentCTASectionProps> = ({
  lang,
  onOpenBooking,
  settings
}) => {
  const cleanWhatsAppNumber = (settings.whatsapp || settings.phone || '').replace(/[^0-9]/g, '');

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#0F172A] via-[#112436] to-[#004d44] text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider border border-white/10 backdrop-blur-xs">
          <HeartHandshake className="w-4 h-4" />
          <span>{lang === 'en' ? 'Quality Family Healthcare' : 'আন্তরিক ও নির্ভরযোগ্য স্বাস্থ্যসেবা'}</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {lang === 'en'
              ? 'Ready to take the next step in your healthcare journey?'
              : 'আপনার সুস্থতার পরবর্তী পদক্ষেপ নিতে প্রস্তুত?'}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {lang === 'en'
              ? 'Request an appointment with our specialist physicians or schedule your routine clinical checkup online.'
              : 'বিশেষজ্ঞ ডাক্তারের সাথে পরামর্শ বা নিয়মিত স্বাস্থ্য পরীক্ষার জন্য এখনই অনলাইনে সহজে অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠান।'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] text-white text-sm font-bold rounded-2xl shadow-xl shadow-teal-950/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'en' ? 'Book Appointment' : 'অ্যাপয়েন্টমেন্ট বুক করুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {cleanWhatsAppNumber && (
            <a
              href={`https://wa.me/${cleanWhatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-xs"
            >
              <MessageCircle className="w-4 h-4 text-teal-300" />
              <span>{lang === 'en' ? 'WhatsApp Help Desk' : 'হোয়াটসঅ্যাপে যোগাযোগ'}</span>
            </a>
          )}
        </div>

        {/* Reassurance text */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>{lang === 'en' ? 'Coordinated Confirmation' : 'হেল্প ডেস্ক থেকে সময় নিশ্চিতকরণ'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>{lang === 'en' ? 'Unrushed Consultations' : 'মনোযোগ সহকারে চিকিৎসা'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
