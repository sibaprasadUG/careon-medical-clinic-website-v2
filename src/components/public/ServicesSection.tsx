import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  FileText,
  Search,
  Sparkles,
  Home,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Service, Department, ServiceType } from '../../types';
import { ServiceDetailModal } from './ServiceDetailModal';

interface ServicesSectionProps {
  services: Service[];
  departments: Department[];
  lang: 'en' | 'bn';
  onBookService: (service: Service) => void;
  onViewAllServices?: () => void;
  showViewAllButton?: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  departments,
  lang,
  onBookService,
  onViewAllServices,
  showViewAllButton = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'CLINIC' | 'HOME'>('ALL');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const activeServices = services.filter((s) => s.status === 'ACTIVE');

  const categories = Array.from(new Set(activeServices.map((s) => s.category)));

  const filteredServices = activeServices.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    
    let matchesType = true;
    if (selectedTypeFilter === 'CLINIC') {
      matchesType = s.serviceType === 'CLINIC' || s.serviceType === 'BOTH' || s.availableAtClinic !== false;
    } else if (selectedTypeFilter === 'HOME') {
      matchesType = s.serviceType === 'HOME' || s.serviceType === 'BOTH' || s.availableForHome === true;
    }

    return matchesCategory && matchesType;
  });

  const getDepartment = (deptId: string) => {
    return departments.find((dept) => dept.id === deptId);
  };

  const renderServiceTypeBadge = (service: Service) => {
    if (service.serviceType === 'HOME') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg border border-purple-200">
          <Home className="w-3 h-3" />
          <span>{lang === 'en' ? 'Doorstep Home Service' : 'হোম কালেকশন'}</span>
        </span>
      );
    }
    if (service.serviceType === 'BOTH') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-[#007E70] text-[11px] font-bold rounded-lg border border-teal-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>{lang === 'en' ? 'Clinic & Home Visit' : 'ক্লিনিক ও হোম সার্ভিস'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200">
        <Building2 className="w-3 h-3" />
        <span>{lang === 'en' ? 'Clinic Service' : 'ক্লিনিক সার্ভিস'}</span>
      </span>
    );
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
              <Activity className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Care Beyond Consultation' : 'ক্লিনিক্যাল ও ডায়াগনস্টিক সেবা'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              {lang === 'en' ? 'Clinical & Doorstep Home Services' : 'নির্ভরযোগ্য প্যাথলজি ও স্বাস্থ্য পরীক্ষা'}
            </h2>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              {lang === 'en'
                ? 'From routine blood tests and diabetic monitoring at our clinic or in the comfort of your home, with fast turnaround reports and clear preparation guidance.'
                : 'ক্লিনিকে কিংবা আপনার ঘরের আরামেই রক্ত পরীক্ষা, সুগার মনিটরিং, প্রতিরোধমূলক স্বাস্থ্য প্যাকেজ ও ইসিজি — সঠিক রিপোর্ট ও স্পষ্ট নির্দেশনাসহ।'}
            </p>
          </div>

          {showViewAllButton && onViewAllServices && (
            <button
              onClick={onViewAllServices}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007E70] hover:text-[#009282] bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all self-start md:self-end cursor-pointer"
            >
              <span>{lang === 'en' ? 'Explore All Services' : 'সকল সেবা দেখুন'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls: Modality Toggles & Category Tabs */}
        <div className="space-y-3 mb-8">
          {/* Modality Toggles */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">
              {lang === 'en' ? 'Type:' : 'ধরণ:'}
            </span>
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Modalities' : 'সব ধরণ'}
            </button>
            <button
              onClick={() => setSelectedTypeFilter('CLINIC')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTypeFilter === 'CLINIC'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-teal-50 text-[#007E70] hover:bg-teal-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'In-Clinic' : 'ক্লিনিক'}</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('HOME')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTypeFilter === 'HOME'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '🏠 Doorstep Home Collection' : '🏠 হোম কালেকশন'}</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Categories' : 'সকল বিভাগ'} ({activeServices.length})
            </button>
            {categories.map((category) => {
              const count = activeServices.filter((s) => s.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-[#007E70] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-500">
              {lang === 'en' ? 'No services found matching the selected filters.' : 'নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো সেবা পাওয়া যায়নি।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const dept = getDepartment(service.departmentId);
              return (
                <div
                  key={service.id}
                  className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70]/80 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 text-left group"
                >
                  <div className="space-y-4">
                    {/* Category & Service Modality Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-white text-[#007E70] text-[11px] font-bold rounded-lg border border-teal-100">
                        {service.category}
                      </span>
                      {renderServiceTypeBadge(service)}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                        {lang === 'en' ? service.name : service.nameBn || service.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {lang === 'en' ? service.description : service.descriptionBn || service.description}
                      </p>
                    </div>

                    {/* Turnaround Time & Test Fasting Indicator */}
                    <div className="space-y-1.5 pt-2">
                      {(service.reportTurnaroundTime || service.turnaroundTime) && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#007E70]" />
                          <span>
                            {lang === 'en' ? 'Report Delivery:' : 'রিপোর্ট ডেলিভারি:'}{' '}
                            <strong className="text-slate-800 font-bold">{service.reportTurnaroundTime || service.turnaroundTime}</strong>
                          </span>
                        </div>
                      )}

                      {service.preparationInstructions && (
                        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">
                            {Array.isArray(service.preparationInstructions)
                              ? service.preparationInstructions[0]
                              : (lang === 'en' ? service.preparationInstructions : service.preparationInstructionsBn || service.preparationInstructions)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-200/80 flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors text-center cursor-pointer"
                    >
                      {lang === 'en' ? 'View Details' : 'বিস্তারিত দেখুন'}
                    </button>

                    <button
                      onClick={() => onBookService(service)}
                      className="flex-1 py-2.5 px-3 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{service.serviceType === 'HOME' ? (lang === 'en' ? 'Book Home Visit' : 'হোম সার্ভিস বুক করুন') : (lang === 'en' ? 'Book' : 'বুক করুন')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          department={getDepartment(selectedService.departmentId)}
          onClose={() => setSelectedService(null)}
          onBook={onBookService}
          lang={lang}
        />
      )}
    </section>
  );
};
