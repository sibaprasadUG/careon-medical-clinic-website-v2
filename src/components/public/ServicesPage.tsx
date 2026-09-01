import React, { useState } from 'react';
import {
  Activity,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Layers,
  Home,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Service, Department, ServiceType } from '../../types';
import { ServiceDetailModal } from './ServiceDetailModal';

interface ServicesPageProps {
  services: Service[];
  departments: Department[];
  lang: 'en' | 'bn';
  onBookService: (service: Service) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  departments,
  lang,
  onBookService
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'CLINIC' | 'HOME'>('ALL');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const activeServices = services.filter((s) => s.status === 'ACTIVE');
  const categories = Array.from(new Set(activeServices.map((s) => s.category)));

  const filteredServices = activeServices.filter((service) => {
    const matchesCat =
      selectedCategory === 'all' || service.category === selectedCategory;

    let matchesType = true;
    if (selectedTypeFilter === 'CLINIC') {
      matchesType = service.serviceType === 'CLINIC' || service.serviceType === 'BOTH' || service.availableAtClinic !== false;
    } else if (selectedTypeFilter === 'HOME') {
      matchesType = service.serviceType === 'HOME' || service.serviceType === 'BOTH' || service.availableForHome === true;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCat && matchesType;

    const matchesSearch =
      service.name.toLowerCase().includes(query) ||
      (service.nameBn && service.nameBn.toLowerCase().includes(query)) ||
      service.description.toLowerCase().includes(query) ||
      (service.descriptionBn && service.descriptionBn.toLowerCase().includes(query));

    return matchesCat && matchesType && matchesSearch;
  });

  const getDepartment = (deptId: string) => {
    return departments.find((d) => d.id === deptId);
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
          <span>{lang === 'en' ? 'Clinic & Home Visit' : 'ক্লিনিক ও হোম'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200">
        <Building2 className="w-3 h-3" />
        <span>{lang === 'en' ? 'Clinic Service' : 'ক্লিনিক'}</span>
      </span>
    );
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <Activity className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Diagnostics & Health Packages' : 'ক্লিনিক্যাল পরীক্ষা ও স্বাস্থ্য সেবা'}</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {lang === 'en' ? 'Clinical & Home Services Directory' : 'ডায়াগনস্টিক ও প্যাথলজি সেবা'}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Explore our comprehensive laboratory test menu, doorstep blood collection, and clinical screening services.'
              : 'প্রয়োজনীয় প্যাথলজি টেস্ট, বাড়ি থেকে রক্ত সংগ্রহ, এবং স্বাস্থ্য প্যাকেজ সম্পর্কে জানুন ও বুক করুন।'}
          </p>
        </div>

        {/* Search, Modality Filter & Category Filter */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search by test name, category, or parameter...'
                  : 'টেস্টের নাম, বিষয় বা বিভাগ দিয়ে খুঁজুন...'
              }
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-[#0F172A] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all"
            />
          </div>

          {/* Modality Toggles */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">
              {lang === 'en' ? 'Type:' : 'ধরণ:'}
            </span>
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Modalities' : 'সব ধরণ'}
            </button>
            <button
              onClick={() => setSelectedTypeFilter('CLINIC')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTypeFilter === 'CLINIC'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-teal-50 text-[#007E70] hover:bg-teal-100 border border-teal-100'
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
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '🏠 Doorstep Home Collection' : '🏠 হোম কালেকশন'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Services' : 'সকল সেবা'} ({activeServices.length})
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
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
            <Activity className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">
              {lang === 'en' ? 'No clinical services matched your search' : 'অনুসন্ধানের সাথে কোনো টেস্ট বা সেবা মেলেনি'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en'
                ? 'Try adjusting your search terms or contact the clinic reception.'
                : 'অন্য কোনো টেস্টের নাম দিয়ে অনুসন্ধান করুন অথবা ক্লিনিকে যোগাযোগ করুন।'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredServices.map((service) => {
              const dept = getDepartment(service.departmentId);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#007E70]/80 hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-teal-50 text-[#007E70] text-[11px] font-bold rounded-lg border border-teal-100">
                        {service.category}
                      </span>
                      {renderServiceTypeBadge(service)}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors leading-snug">
                        {lang === 'en' ? service.name : service.nameBn || service.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                        {lang === 'en' ? service.description : service.descriptionBn || service.description}
                      </p>
                    </div>

                    {/* Turnaround & Preparation */}
                    <div className="space-y-1.5 pt-2">
                      {(service.reportTurnaroundTime || service.turnaroundTime) && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#007E70]" />
                          <span>
                            {lang === 'en' ? 'Report Time:' : 'রিপোর্ট ডেলিভারি:'}{' '}
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

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                    >
                      {lang === 'en' ? 'View Details' : 'বিস্তারিত'}
                    </button>

                    <button
                      onClick={() => onBookService(service)}
                      className="flex-1 py-2.5 px-3 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{service.serviceType === 'HOME' ? (lang === 'en' ? 'Book Home Visit' : 'হোম সার্ভিস বুক') : (lang === 'en' ? 'Book' : 'বুক করুন')}</span>
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
    </div>
  );
};

