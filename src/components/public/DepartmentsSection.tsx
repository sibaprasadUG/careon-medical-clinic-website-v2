import React, { useState } from 'react';
import {
  Layers,
  Users,
  Activity,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Department, Doctor, Service } from '../../types';
import { DepartmentDetailModal } from './DepartmentDetailModal';

interface DepartmentsSectionProps {
  departments: Department[];
  doctors: Doctor[];
  services: Service[];
  lang: 'en' | 'bn';
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService: (service: Service) => void;
  onViewAllDepartments?: () => void;
  showViewAllButton?: boolean;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  doctors,
  services,
  lang,
  onSelectDoctor,
  onSelectService,
  onViewAllDepartments,
  showViewAllButton = true
}) => {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const activeDepartments = departments.filter((d) => d.status === 'ACTIVE');

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/60" id="departments">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
              <Layers className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Integrated Clinical Care' : 'চিকিৎসা বিভাগসমূহ'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {lang === 'en' ? 'Explore Clinical Departments' : 'বিশেষায়িত চিকিৎসা ও পরামর্শ বিভাগ'}
            </h2>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'Coordinated healthcare across major clinical specialties, connecting you with dedicated physicians and relevant diagnostic facilities.'
                : 'প্রতিটি স্বাস্থ্য সমস্যার সুনির্দিষ্ট সমাধান নিশ্চিত করতে বিশেষজ্ঞ চিকিৎসক ও সংশ্লিষ্ট পরীক্ষার বিভাগীয় বিন্যাস।'}
            </p>
          </div>

          {showViewAllButton && onViewAllDepartments && (
            <button
              onClick={onViewAllDepartments}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007E70] hover:text-[#009282] bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all self-start md:self-end cursor-pointer"
            >
              <span>{lang === 'en' ? 'Explore Specialities' : 'সকল বিভাগ ও সেবা'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDepartments.map((dept) => {
            const deptDocs = doctors.filter((d) => d.departmentId === dept.id && d.status === 'ACTIVE');
            const deptSrvs = services.filter((s) => s.departmentId === dept.id && s.status === 'ACTIVE');

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70] hover:shadow-lg transition-all flex flex-col justify-between space-y-4 text-left cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007E70] group-hover:bg-[#007E70] group-hover:text-white flex items-center justify-center transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#007E70] transition-colors flex items-center gap-1">
                      <span>{lang === 'en' ? 'Explore' : 'বিস্তারিত'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                    {lang === 'en' ? dept.name : dept.nameBn || dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lang === 'en' ? dept.shortDescription : dept.shortDescriptionBn || dept.shortDescription}
                  </p>
                </div>

                {/* Footnote: Doctors & Services available */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#007E70]" />
                    <span>{deptDocs.length} {lang === 'en' ? 'Doctors' : 'চিকিৎসক'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>{deptSrvs.length} {lang === 'en' ? 'Services' : 'সেবা'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Detail Modal */}
      {selectedDept && (
        <DepartmentDetailModal
          department={selectedDept}
          doctors={doctors}
          services={services}
          onClose={() => setSelectedDept(null)}
          onSelectDoctor={onSelectDoctor}
          onSelectService={onSelectService}
          lang={lang}
        />
      )}
    </section>
  );
};
