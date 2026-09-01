import React, { useState } from 'react';
import {
  Layers,
  Users,
  Activity,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Department, Doctor, Service } from '../../types';
import { DepartmentDetailModal } from './DepartmentDetailModal';

interface DepartmentsPageProps {
  departments: Department[];
  doctors: Doctor[];
  services: Service[];
  lang: 'en' | 'bn';
  onSelectDoctor: (doctor: Doctor) => void;
  onSelectService: (service: Service) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  departments,
  doctors,
  services,
  lang,
  onSelectDoctor,
  onSelectService
}) => {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const activeDepartments = departments.filter((d) => d.status === 'ACTIVE');

  return (
    <div className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Clinical Specialties' : 'চিকিৎসা বিভাগসমূহ'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en' ? 'Departments & Specializations' : 'ক্লিনিক্যাল বিভাগসমূহ'}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Browse our medical departments to find dedicated consultant physicians and associated diagnostic services.'
              : 'প্রতিটি চিকিৎসা বিভাগের অধীনে থাকা অভিজ্ঞ চিকিৎসক এবং সংশ্লিষ্ট টেস্টের বিবরণ দেখুন।'}
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {activeDepartments.map((dept) => {
            const deptDocs = doctors.filter((d) => d.departmentId === dept.id && d.status === 'ACTIVE');
            const deptSrvs = services.filter((s) => s.departmentId === dept.id && s.status === 'ACTIVE');

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(dept)}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70] hover:shadow-lg transition-all flex flex-col justify-between space-y-5 cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#007E70] group-hover:bg-[#007E70] group-hover:text-white flex items-center justify-center transition-colors">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-[#007E70] transition-colors flex items-center gap-1">
                      <span>{lang === 'en' ? 'View Details' : 'বিস্তারিত'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                    {lang === 'en' ? dept.name : dept.nameBn || dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {lang === 'en' ? dept.shortDescription : dept.shortDescriptionBn || dept.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#007E70]" />
                    <span>{deptDocs.length} {lang === 'en' ? 'Doctors' : 'চিকিৎসক'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#0D9488]" />
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
    </div>
  );
};
