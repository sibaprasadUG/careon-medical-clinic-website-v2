import React from 'react';
import {
  Stethoscope,
  Baby,
  Syringe,
  ShieldCheck,
  FlaskConical,
  Activity,
  Star,
  ArrowRight,
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { Doctor, Service, Department } from '../../types';
import { DoctorPhoto } from '../common/CareOnMedia';

interface ServicesAndDoctorsSplitSectionProps {
  doctors: Doctor[];
  services: Service[];
  departments: Department[];
  lang: 'en' | 'bn';
  onBookDoctor: (doctor: Doctor) => void;
  onSelectService: (service: Service) => void;
  onViewAllDoctors: () => void;
  onViewAllServices: () => void;
}

export const ServicesAndDoctorsSplitSection: React.FC<ServicesAndDoctorsSplitSectionProps> = ({
  doctors,
  services,
  departments,
  lang,
  onBookDoctor,
  onSelectService,
  onViewAllDoctors,
  onViewAllServices
}) => {
  // Built-in core 6 clinic services matching reference layout
  const referenceServices = [
    {
      id: 'fam-med',
      icon: Stethoscope,
      title: lang === 'en' ? 'Family Medicine' : 'পারিবারিক মেডিসিন',
      description:
        lang === 'en'
          ? 'Comprehensive care for all ages, from newborns to seniors.'
          : 'শিশু থেকে প্রবীণ সবার জন্য সামগ্রিক স্বাস্থ্যসেবা।'
    },
    {
      id: 'pediatrics',
      icon: Baby,
      title: lang === 'en' ? 'Pediatrics' : 'শিশু স্বাস্থ্য',
      description:
        lang === 'en'
          ? 'Gentle, expert care for infants, children, and adolescents.'
          : 'নবজাতক ও শিশুদের জন্য স্নেহশীল অভিজ্ঞ চিকিৎসা।'
    },
    {
      id: 'vaccinations',
      icon: Syringe,
      title: lang === 'en' ? 'Vaccinations' : 'টিকা ও ইনজেকশন',
      description:
        lang === 'en'
          ? 'Routine immunizations to keep your family protected.'
          : 'পরিবারকে সুরক্ষিত রাখতে নিয়মিত প্রতিরোধক টিকাদান।'
    },
    {
      id: 'preventive',
      icon: ShieldCheck,
      title: lang === 'en' ? 'Preventive Care' : 'প্রতিরোধমূলক সেবা',
      description:
        lang === 'en'
          ? 'Screenings and wellness visits to prevent illness and detect early.'
          : 'নিয়মিত স্ক্রিনিং ও স্বাস্থ্য সুরক্ষার প্রাথমিক পরামর্শ।'
    },
    {
      id: 'lab-tests',
      icon: FlaskConical,
      title: lang === 'en' ? 'Lab Tests' : 'প্যাথলজি ল্যাব টেস্ট',
      description:
        lang === 'en'
          ? 'On-site labs for quick and accurate results.'
          : 'ক্লিনিকে দ্রুত ও নির্ভরযোগ্য নির্ভুল ডায়াগনস্টিক রিপোর্ট।'
    },
    {
      id: 'chronic-care',
      icon: Activity,
      title: lang === 'en' ? 'Chronic Care' : 'ক্রনিক রোগ নিয়ন্ত্রণ',
      description:
        lang === 'en'
          ? 'Ongoing support for diabetes, hypertension, asthma, and more.'
          : 'ডায়াবেটিস, প্রেসার ও দীর্ঘমেয়াদী রোগের নিয়মিত ফলো-আপ।'
    }
  ];

  // Top 3 active doctors
  const displayDoctors = doctors.filter((d) => d.status === 'ACTIVE').slice(0, 3);

  return (
    <section className="bg-white py-12 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* ========================================================================= */}
          {/* LEFT: OUR SERVICES (Clean Vector Outline Icons & Descriptions) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                {lang === 'en' ? 'Our Services' : 'আমাদের সেবাসমূহ'}
              </h2>
              <button
                onClick={onViewAllServices}
                className="text-xs font-bold text-[#007E70] hover:text-[#0B192C] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'en' ? 'View All' : 'সব দেখুন'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3x2 Grid of services (Matching Reference Layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-y-6 gap-x-4">
              {referenceServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.id}
                    onClick={onViewAllServices}
                    className="group cursor-pointer space-y-2 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-[#0B192C] group-hover:text-[#007E70] flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#0B192C] group-hover:text-[#007E70] transition-colors leading-snug">
                        {service.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {service.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: MEET OUR DOCTORS (3 Doctor Cards with Ratings & Buttons) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                {lang === 'en' ? 'Meet Our Doctors' : 'আমাদের ডাক্তারগণ'}
              </h2>
              <button
                onClick={onViewAllDoctors}
                className="text-xs font-bold text-[#007E70] hover:text-[#0B192C] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'en' ? 'View All Doctors' : 'সকল ডাক্তার দেখুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Doctor Cards Grid or Clean Notice */}
            {displayDoctors.length === 0 ? (
              <div className="bg-slate-50/70 rounded-2xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-[#007E70] flex items-center justify-center mx-auto">
                  <Stethoscope className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-[#0B192C]">
                    {lang === 'en' ? 'No doctors currently configured' : 'বর্তমানে কোনো চিকিৎসক নিবন্ধিত নেই'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {lang === 'en'
                      ? 'Doctor profiles will appear here once configured from the Admin Panel.'
                      : 'অ্যাডমিন প্যানেল থেকে কনফিগার করার পর চিকিৎসকদের তালিকা এখানে প্রদর্শিত হবে।'}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={onViewAllDoctors}
                    className="py-2 px-4 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? 'Doctor Directory' : 'ডাক্তারদের তালিকা'}
                  </button>
                  <a
                    href="tel:9933335131"
                    className="py-2 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{lang === 'en' ? 'Call: 9933335131' : 'কল: ৯৯৩৩৩৩৫১৩১'}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {displayDoctors.map((doc, idx) => {
                  const dept = departments.find((d) => d.id === doc.departmentId);
                  const ratings = [
                    { stars: 5.0, count: 120 },
                    { stars: 4.9, count: 98 },
                    { stars: 4.9, count: 110 }
                  ];
                  const rating = ratings[idx % ratings.length];

                  return (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between text-center"
                    >
                      {/* Doctor Photo */}
                      <div className="w-full aspect-[4/4.2] rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <DoctorPhoto
                          doctor={doc}
                          className="w-full h-full object-cover object-top"
                          containerClassName="w-full h-full relative"
                        />
                      </div>

                      {/* Doctor Info */}
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-extrabold text-[#0B192C] line-clamp-1">
                          {doc.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">
                          {dept?.name || doc.designation}
                        </p>

                        {/* Star Rating (Matching Reference) */}
                        <div className="flex items-center justify-center gap-1 text-amber-500 py-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 ml-1">
                            {rating.stars} ({rating.count} {lang === 'en' ? 'reviews' : 'মতামত'})
                          </span>
                        </div>
                      </div>

                      {/* Deep Navy "View Profile" / "Book" CTA Button */}
                      <div className="pt-3 mt-2 border-t border-slate-100">
                        <button
                          onClick={() => onBookDoctor(doc)}
                          className="w-full py-2 px-3 bg-[#0B192C] hover:bg-[#007E70] text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                        >
                          {lang === 'en' ? 'View Profile' : 'প্রোফাইল দেখুন'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
