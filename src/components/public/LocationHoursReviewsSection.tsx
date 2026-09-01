import React from 'react';
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
  ExternalLink,
  Quote,
  CheckCircle2
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface LocationHoursReviewsSectionProps {
  lang: 'en' | 'bn';
  settings: WebsiteSettings;
}

export const LocationHoursReviewsSection: React.FC<LocationHoursReviewsSectionProps> = ({
  lang,
  settings
}) => {
  const schedule = [
    { day: lang === 'en' ? 'Monday' : 'সোমবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Tuesday' : 'মঙ্গলবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Wednesday' : 'বুধবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Thursday' : 'বৃহস্পতিবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Friday' : 'শুক্রবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Saturday' : 'শনিবার', hours: '8:00 AM – 7:00 PM' },
    { day: lang === 'en' ? 'Sunday' : 'রবিবার', hours: lang === 'en' ? 'Closed' : 'বন্ধ' }
  ];

  const mapAddress = 'Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401';
  const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent('CareOn Medical Clinic ' + mapAddress)}`;

  return (
    <section className="bg-[#F8FAFC] py-12 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* ========================================================================= */}
          {/* COL 1: OUR LOCATION (Map Preview & Address) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#007E70] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-serif-heading text-lg sm:text-xl font-extrabold text-[#0B192C]">
                  {lang === 'en' ? 'Our Location' : 'আমাদের অবস্থান'}
                </h3>
              </div>

              {/* Map Graphic Preview */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-slate-200 bg-slate-100">
                <iframe
                  title="CareOn Medical Clinic Location Map"
                  src="https://maps.google.com/maps?q=Contai%20Kumarpur%20West%20Bengal&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
                
                {/* Floating Map Pin Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-[#0B192C]">CareOn Medical Clinic</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{mapAddress}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#007E70] hover:text-[#0B192C] transition-colors inline-flex items-center gap-1.5"
              >
                <span>{lang === 'en' ? 'Get Directions' : 'মানচিত্রে দিকনির্দেশনা পান'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COL 2: OPENING HOURS (Timetable) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#007E70] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-serif-heading text-lg sm:text-xl font-extrabold text-[#0B192C]">
                  {lang === 'en' ? 'Opening Hours' : 'সময়সূচী'}
                </h3>
              </div>

              {/* Timetable */}
              <div className="space-y-2 pt-1 text-xs">
                {schedule.map((item) => {
                  const isClosed = item.hours.includes('Closed') || item.hours.includes('বন্ধ');
                  return (
                    <div
                      key={item.day}
                      className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-semibold text-slate-700">{item.day}</span>
                      <span
                        className={`font-bold ${
                          isClosed ? 'text-rose-600' : 'text-[#0B192C]'
                        }`}
                      >
                        {item.hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <span>
                {lang === 'en'
                  ? 'Doctor consultation chambers operate as per scheduled rosters.'
                  : 'ডাক্তারদের চেম্বারের সময় নির্ধারিত সূচি অনুযায়ী পরিচালিত হয়।'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COL 3: WHAT OUR PATIENTS SAY (Reviews & Rating Card) */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-heading text-lg sm:text-xl font-extrabold text-[#0B192C]">
                  {lang === 'en' ? 'What Our Patients Say' : 'রোগীদের অভিজ্ঞতা'}
                </h3>
              </div>

              {/* Star Rating Header */}
              <div className="flex items-center gap-2 bg-amber-50/80 px-3.5 py-2 rounded-xl border border-amber-200/80">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0" />
                <div>
                  <span className="text-sm font-extrabold text-slate-900">4.9</span>
                  <span className="text-xs text-slate-600 font-medium ml-1">
                    {lang === 'en' ? 'Average Rating (320+ verified reviews)' : 'গড় রেটিং (৩২০+ রিভিউ)'}
                  </span>
                </div>
              </div>

              {/* Testimonial Quote */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 relative">
                <Quote className="w-5 h-5 text-teal-600/30 absolute top-3 right-3" />
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  {lang === 'en'
                    ? '"The doctors are caring and thorough. We trust CareOn Medical Clinic with our entire family\'s health. The diagnostic report turnaround was fast and accurate. Highly recommend!"'
                    : '"ডাক্তারবাবু অত্যন্ত যত্নসহকারে পরীক্ষা করেছেন এবং পরামর্শ দিয়েছেন। পুরো পরিবারের চিকিৎসার জন্য আমরা নিশ্চিন্তে কেয়ারঅন ক্লিনিকে আসি।"'}
                </p>
                <div className="text-xs font-bold text-[#0B192C] pt-1">
                  — {lang === 'en' ? 'Jessica M. / Subhashish M.' : 'শুভাশিস মুখার্জী ও পরিবার'}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Verified Patient Review' : 'যাচাইকৃত রোগী পর্যালোচনা'}</span>
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
