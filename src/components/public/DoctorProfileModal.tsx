import React from 'react';
import {
  X,
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Doctor, Department } from '../../types';
import { DoctorPhoto } from '../common/CareOnMedia';
import { getDoctorPublicScheduleSummary } from '../../lib/doctorScheduleUtils';

interface DoctorProfileModalProps {
  doctor: Doctor | null;
  department?: Department;
  onClose: () => void;
  onBook: (doctor: Doctor) => void;
  lang: 'en' | 'bn';
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  doctor,
  department,
  onClose,
  onBook,
  lang
}) => {
  if (!doctor) return null;
  const scheduleSummary = getDoctorPublicScheduleSummary(doctor, lang);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#007E70] text-xs font-bold rounded-full">
              {department
                ? lang === 'en'
                  ? department.name
                  : department.nameBn || department.name
                : lang === 'en'
                ? 'Specialist Physician'
                : 'বিশেষজ্ঞ চিকিৎসক'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Doctor Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Top Profile Summary */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100">
              <DoctorPhoto
                doctor={doctor}
                className="w-full h-full object-cover object-top"
                containerClassName="w-full h-full relative"
              />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                {lang === 'en' ? doctor.name : doctor.nameBn || doctor.name}
              </h3>
              <p className="text-xs font-bold text-[#007E70]">
                {doctor.designation}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {doctor.qualification}
              </p>
              {doctor.registrationNumber && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 text-[#007E70]" />
                  <span>Reg No: {doctor.registrationNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Consultation Schedule Card */}
          <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#007E70] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Clinic Consultation Timings' : 'কনসালটেশন সময়সূচী'}</span>
              </div>
              {scheduleSummary.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                  {scheduleSummary.badge}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-teal-200">
                {scheduleSummary.scheduleText}
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-[#007E70]">
                {doctor.consultationTime || scheduleSummary.timeText}
              </span>
              {doctor.roomNumber && (
                <span className="bg-white px-2.5 py-1 rounded-lg border border-teal-200 text-slate-600">
                  Chamber: {doctor.roomNumber}
                </span>
              )}
            </div>
          </div>

          {/* Short Bio */}
          {doctor.shortBio && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#007E70]" />
                <span>{lang === 'en' ? 'Professional Background' : 'চিকিৎসকের অভিজ্ঞতা'}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {doctor.shortBio}
              </p>
            </div>
          )}

          {/* Areas of Clinical Expertise */}
          {doctor.areasOfExpertise && doctor.areasOfExpertise.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#007E70]" />
                <span>{lang === 'en' ? 'Clinical Focus & Expertise' : 'চিকিৎসার ক্ষেত্রসমূহ'}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {doctor.areasOfExpertise.map((area, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#007E70]" />
                    <span>{area}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {lang === 'en'
              ? 'Appointments are coordinated through our front desk intake.'
              : 'অ্যাপয়েন্টমেন্টের সময়সূচী কেয়ারঅন ডেস্ক থেকে নিশ্চিত করা হবে।'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors w-1/2 sm:w-auto cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
            </button>
            <button
              onClick={() => {
                onClose();
                onBook(doctor);
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] rounded-xl shadow-sm shadow-teal-900/20 transition-all flex items-center justify-center gap-2 w-1/2 sm:w-auto cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Book Consultation' : 'অ্যাপয়েন্টমেন্ট বুক করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
