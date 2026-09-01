import React from 'react';
import {
  X,
  Layers,
  Users,
  Activity,
  Calendar,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Department, Doctor, Service } from '../../types';
import { DoctorPhoto } from '../common/CareOnMedia';

interface DepartmentDetailModalProps {
  department: Department | null;
  doctors: Doctor[];
  services: Service[];
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService: (service: Service) => void;
  lang: 'en' | 'bn';
}

export const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  department,
  doctors,
  services,
  onClose,
  onSelectDoctor,
  onSelectService,
  lang
}) => {
  if (!department) return null;

  const deptDoctors = doctors.filter(
    (d) => d.departmentId === department.id && d.status === 'ACTIVE'
  );
  const deptServices = services.filter(
    (s) => s.departmentId === department.id && s.status === 'ACTIVE'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#007E70] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {lang === 'en' ? 'Clinical Department' : 'ক্লিনিক্যাল বিভাগ'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Department Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-[#0F172A]">
              {lang === 'en' ? department.name : department.nameBn || department.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {lang === 'en' ? department.shortDescription : department.shortDescriptionBn || department.shortDescription}
            </p>
          </div>

          {/* Department Associated Doctors */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#007E70]" />
                <span>{lang === 'en' ? 'Department Physicians' : 'বিভাগীয় বিশেষজ্ঞ চিকিৎসক'}</span>
              </h4>
              <span className="text-xs text-slate-400">({deptDoctors.length})</span>
            </div>

            {deptDoctors.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
                {lang === 'en' ? 'No active doctors currently assigned to this department.' : 'বর্তমানে এই বিভাগে কোনো সক্রিয় চিকিৎসক নেই।'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deptDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      onSelectDoctor(doc);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-teal-50/60 rounded-2xl border border-slate-200 hover:border-[#007E70] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-13 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                        <DoctorPhoto
                          doctor={doc}
                          className="w-full h-full object-cover object-top"
                          containerClassName="w-full h-full relative"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#007E70] truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {doc.designation}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#007E70] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Associated Services */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#007E70]" />
                <span>{lang === 'en' ? 'Department Diagnostics & Clinical Services' : 'বিভাগীয় পরীক্ষা ও স্বাস্থ্য প্যাকেজ'}</span>
              </h4>
              <span className="text-xs text-slate-400">({deptServices.length})</span>
            </div>

            {deptServices.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500">
                {lang === 'en' ? 'No specific diagnostic services listed for this department.' : 'এই বিভাগের জন্য নির্দিষ্ট কোনো টেস্ট তালিকাভুক্ত নেই।'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deptServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      onClose();
                      onSelectService(srv);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-teal-50/60 rounded-2xl border border-slate-200 hover:border-[#007E70] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-[#007E70] truncate">
                        {srv.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {(srv.reportTurnaroundTime || srv.turnaroundTime) ? `Report: ${srv.reportTurnaroundTime || srv.turnaroundTime}` : srv.category}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#007E70] shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
