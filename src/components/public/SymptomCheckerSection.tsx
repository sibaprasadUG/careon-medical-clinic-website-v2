import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Doctor, Service, Department } from '../../types';

interface SymptomCheckerSectionProps {
  doctors: Doctor[];
  services: Service[];
  departments: Department[];
  lang: 'en' | 'bn';
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
  navigateTo: (path: string) => void;
}

export const SymptomCheckerSection: React.FC<SymptomCheckerSectionProps> = ({
  doctors,
  services,
  departments,
  lang,
  onOpenBooking,
  navigateTo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeResult, setActiveResult] = useState<any | null>(null);

  const popularSearches = [
    { label: 'Fever', labelBn: 'জ্বর', dept: 'General Medicine & Family Health', service: 'Comprehensive Health & Preventive Checkup' },
    { label: 'Cough', labelBn: 'কাশি', dept: 'General Medicine & Family Health', service: 'Chest & Respiratory Assessment' },
    { label: 'Headache', labelBn: 'মাথাব্যথা', dept: 'General Medicine & Family Health', service: 'Blood Pressure & Metabolic Screen' },
    { label: 'Sore Throat', labelBn: 'গলাব্যথা', dept: 'General Medicine & Family Health', service: 'Routine Blood Panel' },
    { label: 'Allergies', labelBn: 'এলার্জি', dept: 'General Medicine & Family Health', service: 'Allergy & Complete Blood Count' },
    { label: 'Blood Test', labelBn: 'রক্ত পরীক্ষা', dept: 'Pathology Diagnostics', service: 'Complete Blood Count (CBC)' },
    { label: 'ECG', labelBn: 'ইসিজি', dept: 'Cardiology & Heart Care', service: '12-Lead Diagnostic ECG' },
    { label: 'Pediatrician', labelBn: 'শিশু বিশেষজ্ঞ', dept: 'Pediatrics & Child Wellness', service: 'Child Wellness & Immunization' }
  ];

  const handleSearch = (term: string) => {
    const q = term.trim().toLowerCase();
    if (!q) {
      setActiveResult(null);
      return;
    }

    const matchedDoctor = doctors.find(
      (d) =>
        d.status === 'ACTIVE' &&
        (d.name.toLowerCase().includes(q) ||
          d.designation.toLowerCase().includes(q) ||
          d.areasOfExpertise.some((e) => e.toLowerCase().includes(q)))
    );

    const matchedService = services.find(
      (s) =>
        s.status === 'ACTIVE' &&
        (s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q))
    );

    const matchedDept = departments.find(
      (dp) =>
        dp.name.toLowerCase().includes(q) ||
        dp.shortDescription.toLowerCase().includes(q)
    );

    setActiveResult({
      query: term,
      doctor: matchedDoctor || doctors.find((d) => d.status === 'ACTIVE'),
      service: matchedService || services[0],
      department: matchedDept || departments[0]
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <section className="bg-[#F8FAFC] py-12 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Search Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-900/5 border border-slate-200/90 text-center space-y-5">
          
          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
              {lang === 'en' ? 'How Can We Help You Today?' : 'আজ আমরা আপনাকে কীভাবে সাহায্য করতে পারি?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {lang === 'en'
                ? 'Check symptoms, explore medical services, and get clinical guidance.'
                : 'উপসর্গ বর্ণনা করুন, সঠিক বিভাগ খুঁজুন এবং উপযুক্ত সেবা গ্রহণ করুন।'}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto pt-1">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Describe your symptom (e.g., sore throat, fever, blood test)...'
                    : 'আপনার সমস্যা বা টেস্ট লিখুন (যেমনঃ জ্বর, কাশি, রক্ত পরীক্ষা)...'
                }
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#0B192C] hover:bg-[#007E70] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              {lang === 'en' ? 'Check Symptoms' : 'উপসর্গ দেখুন'}
            </button>
          </form>

          {/* Popular Searches Pills (Matching Reference) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px] mr-1">
              {lang === 'en' ? 'Popular Searches:' : 'জনপ্রিয় অনুসন্ধান:'}
            </span>
            {popularSearches.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setSearchQuery(lang === 'en' ? item.label : item.labelBn);
                  handleSearch(item.label);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-[#007E70] hover:border-teal-200 text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'en' ? item.label : item.labelBn}
              </button>
            ))}
          </div>

          {/* Active Guidance Result Preview */}
          {activeResult && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-left bg-slate-50/70 rounded-2xl p-5 border border-slate-200 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 text-teal-800 text-xs font-bold mb-3">
                <Sparkles className="w-4 h-4 text-[#007E70]" />
                <span>
                  {lang === 'en'
                    ? `Clinical Guidance for "${activeResult.query}":`
                    : `"${activeResult.query}" এর জন্য ক্লিনিক্যাল পরামর্শ:`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor Guidance */}
                {activeResult.doctor && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B192C]">
                      <Stethoscope className="w-4 h-4 text-[#007E70]" />
                      <span>{lang === 'en' ? 'Recommended Doctor' : 'প্রস্তাবিত চিকিৎসক'}</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{activeResult.doctor.name}</div>
                      <div className="text-slate-500 text-[11px]">{activeResult.doctor.designation}</div>
                    </div>
                    <button
                      onClick={() => onOpenBooking({ type: 'DOCTOR', id: activeResult.doctor.id })}
                      className="w-full py-1.5 px-3 bg-[#007E70] hover:bg-[#009282] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Book Doctor Chamber' : 'ডাক্তার অ্যাপয়েন্টমেন্ট নিন'}
                    </button>
                  </div>
                )}

                {/* Lab Test Guidance */}
                {activeResult.service && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0B192C]">
                      <FlaskConical className="w-4 h-4 text-[#007E70]" />
                      <span>{lang === 'en' ? 'Relevant Diagnostic' : 'প্রাসঙ্গিক পরীক্ষা'}</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{activeResult.service.name}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">{activeResult.service.shortDescription}</div>
                    </div>
                    <button
                      onClick={() => onOpenBooking({ type: 'SERVICE', id: activeResult.service.id })}
                      className="w-full py-1.5 px-3 bg-[#0B192C] hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Book Lab Test / Package' : 'ল্যাব টেস্ট বুক করুন'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
