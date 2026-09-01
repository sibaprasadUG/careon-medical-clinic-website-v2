import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
  ChevronRight,
  Search
} from 'lucide-react';
import { Doctor, Department } from '../../types';
import { DoctorProfileModal } from './DoctorProfileModal';
import { DoctorPhoto } from '../common/CareOnMedia';

interface DoctorsSectionProps {
  doctors: Doctor[];
  departments: Department[];
  lang: 'en' | 'bn';
  onBookDoctor: (doctor: Doctor) => void;
  onViewAllDoctors?: () => void;
  showViewAllButton?: boolean;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({
  doctors,
  departments,
  lang,
  onBookDoctor,
  onViewAllDoctors,
  showViewAllButton = true
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Active doctors only (filtered by DAL)
  const activeDoctors = doctors.filter((d) => d.status === 'ACTIVE');

  const filteredDoctors =
    selectedDeptId === 'all'
      ? activeDoctors
      : activeDoctors.filter((d) => d.departmentId === selectedDeptId);

  const getDepartment = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId);
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/60" id="doctors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Experienced Medical Faculty' : 'আমাদের চিকিৎসক দল'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {lang === 'en' ? 'Meet Our Specialist Doctors' : 'অভিজ্ঞ ও নিবেদিতপ্রাণ চিকিৎসকগণ'}
            </h2>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'Consult qualified physicians across general medicine, pediatrics, cardiology, gynecology, and family wellness.'
                : 'মেডিসিন, শিশু রোগ, হৃদরোগ এবং পারিবারিক স্বাস্থ্যের বিশেষজ্ঞ চিকিৎসকদের সাথে সহজে যোগাযোগ করুন।'}
            </p>
          </div>

          {showViewAllButton && onViewAllDoctors && (
            <button
              onClick={onViewAllDoctors}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007E70] hover:text-[#009282] bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all self-start md:self-end cursor-pointer"
            >
              <span>{lang === 'en' ? 'View All Doctors' : 'সকল চিকিৎসক দেখুন'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
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

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'en' ? 'No active doctors found in this category' : 'এই বিভাগে বর্তমানে কোনো চিকিৎসক তালিকাভুক্ত নেই'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Please select another specialty or contact clinic reception for schedule details.'
                : 'অন্য বিভাগ নির্বাচন করুন অথবা সময়সূচীর জন্য ক্লিনিকে যোগাযোগ করুন।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => {
              const dept = getDepartment(doctor.departmentId);
              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70]/80 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 text-left group"
                >
                  <div className="space-y-4">
                    {/* Doctor Top Row: Photo + Badges */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-2xs shrink-0 group-hover:scale-102 transition-transform bg-slate-100">
                        <DoctorPhoto
                          doctor={doctor}
                          className="w-full h-full object-cover object-top"
                          containerClassName="w-full h-full relative"
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        {dept && (
                          <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-[#007E70] text-[10px] font-bold rounded-md border border-teal-100 truncate max-w-full">
                            {lang === 'en' ? dept.name : dept.nameBn || dept.name}
                          </span>
                        )}
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

                    {/* Consultation Schedule Box */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-[#007E70]" />
                        <span>{doctor.consultationDays.join(', ')}</span>
                      </div>
                      <div className="text-[11px] font-medium text-teal-800 pl-5">
                        {doctor.consultationTime}
                      </div>
                    </div>

                    {/* Expertise Tag Snippet */}
                    {doctor.areasOfExpertise && doctor.areasOfExpertise.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {doctor.areasOfExpertise.slice(0, 2).map((area, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md"
                          >
                            {area}
                          </span>
                        ))}
                        {doctor.areasOfExpertise.length > 2 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{doctor.areasOfExpertise.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions: View Profile & Book */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                    >
                      {lang === 'en' ? 'View Profile' : 'বিস্তারিত প্রোফাইল'}
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
    </section>
  );
};
