import React, { useState } from 'react';
import {
  Stethoscope,
  Search,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { Doctor, Department } from '../../types';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorPhoto } from '../common/CareOnMedia';
import { getDoctorPublicScheduleSummary } from '../../lib/doctorScheduleUtils';

interface DoctorsPageProps {
  doctors: Doctor[];
  departments: Department[];
  lang: 'en' | 'bn';
  onBookDoctor: (doctor: Doctor) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  departments,
  lang,
  onBookDoctor
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const activeDoctors = doctors.filter((d) => d.status === 'ACTIVE');

  const filteredDoctors = activeDoctors.filter((doctor) => {
    const matchesDept =
      selectedDeptId === 'all' || doctor.departmentId === selectedDeptId;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesDept;

    const matchesSearch =
      doctor.name.toLowerCase().includes(query) ||
      (doctor.nameBn && doctor.nameBn.toLowerCase().includes(query)) ||
      doctor.designation.toLowerCase().includes(query) ||
      doctor.qualification.toLowerCase().includes(query) ||
      (doctor.areasOfExpertise &&
        doctor.areasOfExpertise.some((area) => area.toLowerCase().includes(query)));

    return matchesDept && matchesSearch;
  });

  const getDepartment = (deptId: string) => {
    return departments.find((d) => d.id === deptId);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Clinical Faculty' : 'আমাদের চিকিৎসকবৃন্দ'}</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {lang === 'en' ? 'Our Specialist Physicians' : 'বিশেষজ্ঞ চিকিৎসক ডিরেক্টরি'}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Find experienced consultants across all major medical departments and view their chamber consultation schedules.'
              : 'বিভাগীয় বিশেষজ্ঞ চিকিৎসকদের প্রোফাইল, অভিজ্ঞতা এবং নিয়মিত চেম্বার সময়সূচী দেখুন।'}
          </p>
        </div>

        {/* Search & Department Filters */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search by doctor name, specialty, or condition...'
                  : 'ডাক্তারের নাম, পদবী বা রোগের ধরণ দিয়ে খুঁজুন...'
              }
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-[#0F172A] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all"
            />
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedDeptId('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedDeptId === 'all'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Specialties' : 'সকল বিভাগ'} ({activeDoctors.length})
            </button>
            {departments
              .filter((d) => d.status === 'ACTIVE')
              .map((dept) => {
                const count = activeDoctors.filter((doc) => doc.departmentId === dept.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      selectedDeptId === dept.id
                        ? 'bg-[#007E70] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {lang === 'en' ? dept.name : dept.nameBn || dept.name} ({count})
                  </button>
                );
              })}
          </div>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'en' ? 'No doctors currently configured' : 'বর্তমানে কোনো চিকিৎসক নিবন্ধিত নেই'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Doctor profiles will appear here once configured from the Admin Panel.'
                : 'অ্যাডমিন প্যানেল থেকে কনফিগার করার পর চিকিৎসকদের তালিকা এখানে প্রদর্শিত হবে।'}
            </p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'en' ? 'No doctors found matching criteria' : 'অনুসন্ধানের সাথে কোনো চিকিৎসক মেলেনি'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Try adjusting your search query or department filter.'
                : 'অন্য কোনো বিভাগ বা নাম দিয়ে অনুসন্ধান করুন।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredDoctors.map((doctor) => {
              const dept = getDepartment(doctor.departmentId);
              const scheduleSummary = getDoctorPublicScheduleSummary(doctor, lang);
              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70]/80 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-2xs shrink-0 group-hover:scale-102 transition-transform bg-slate-100">
                        <DoctorPhoto
                          doctor={doctor}
                          className="w-full h-full object-cover object-top"
                          containerClassName="w-full h-full relative"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dept && (
                            <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-[#007E70] text-[10px] font-bold rounded-md border border-teal-100 truncate max-w-full">
                              {lang === 'en' ? dept.name : dept.nameBn || dept.name}
                            </span>
                          )}
                          {scheduleSummary.badge && (
                            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md border border-purple-100">
                              {scheduleSummary.badge}
                            </span>
                          )}
                          {(doctor.consultationFee !== undefined || doctor.fees?.newPatient !== undefined) && (
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-md border border-emerald-200">
                              ₹ {doctor.consultationFee ?? doctor.fees?.newPatient}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-[#0F172A] leading-snug group-hover:text-[#007E70] transition-colors truncate">
                          {lang === 'en' ? doctor.name : doctor.nameBn || doctor.name}
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold truncate">
                          {doctor.designation}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doctor.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#007E70]" />
                        <span>{scheduleSummary.scheduleText}</span>
                      </div>
                      <div className="text-[11px] font-medium text-teal-800 pl-5">
                        {doctor.consultationTime || scheduleSummary.timeText}
                      </div>
                    </div>

                    {/* Expertise */}
                    {doctor.areasOfExpertise && doctor.areasOfExpertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {doctor.areasOfExpertise.map((area, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                    >
                      {lang === 'en' ? 'View Profile' : 'বিস্তারিত'}
                    </button>

                    <button
                      onClick={() => onBookDoctor(doctor)}
                      className="flex-1 py-2.5 px-3 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Book' : 'বুক করুন'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <DoctorProfileModal
          doctor={selectedDoctor}
          department={getDepartment(selectedDoctor.departmentId)}
          onClose={() => setSelectedDoctor(null)}
          onBook={onBookDoctor}
          lang={lang}
        />
      )}
    </div>
  );
};
