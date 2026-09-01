import React from 'react';
import {
  X,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Layers,
  ArrowRight,
  Home,
  Building2
} from 'lucide-react';
import { Service, Department } from '../../types';

interface ServiceDetailModalProps {
  service: Service | null;
  department?: Department;
  onClose: () => void;
  onBook: (service: Service) => void;
  lang: 'en' | 'bn';
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  department,
  onClose,
  onBook,
  lang
}) => {
  if (!service) return null;

  const isHomeAvailable = service.serviceType === 'HOME' || service.serviceType === 'BOTH' || service.availableForHome;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#007E70] text-xs font-bold rounded-full">
              {service.category}
            </span>

            {service.serviceType === 'HOME' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-full">
                <Home className="w-3.5 h-3.5" /> Doorstep Home Service
              </span>
            ) : service.serviceType === 'BOTH' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 border border-teal-200 text-[#007E70] text-xs font-bold rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> In-Clinic & Home Collection
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full">
                <Building2 className="w-3.5 h-3.5" /> In-Clinic Service
              </span>
            )}

            {department && (
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                {lang === 'en' ? department.name : department.nameBn || department.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Service Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              {lang === 'en' ? service.name : service.nameBn || service.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {lang === 'en' ? service.description : service.descriptionBn || service.description}
            </p>
          </div>

          {/* Home Service Highlights if applicable */}
          {isHomeAvailable && (
            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-start gap-3">
              <Home className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
              <div className="space-y-1 text-xs text-purple-900">
                <div className="font-bold text-purple-950">
                  {lang === 'en' ? 'Available for Doorstep Home Collection' : 'বাড়িতে নমুনা সংগ্রহের সুবিধা উপলব্ধ'}
                </div>
                <p className="text-purple-800 leading-relaxed">
                  {lang === 'en'
                    ? 'Our certified phlebotomists follow strict cold-chain and sterile protocols. Service available across Contai, Kumarpur, and nearby areas.'
                    : 'আমাদের অভিজ্ঞ ল্যাব টেকনিশিয়ান জীবাণুমুক্ত পদ্ধতিতে বাড়ি থেকে নমুনা সংগ্রহ করবেন। কাঁথি ও পার্শ্ববর্তী অঞ্চলে সেবা উপলব্ধ।'}
                </p>
              </div>
            </div>
          )}

          {/* Key Diagnostic Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(service.reportTurnaroundTime || service.turnaroundTime) && (
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#007E70] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Report Turnaround Time' : 'রিপোর্ট ডেলিভারির সময়'}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-800">
                  {service.reportTurnaroundTime || service.turnaroundTime}
                </div>
              </div>
            )}

            {service.sampleType && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Sample / Test Modality' : 'নমুনার ধরন / পরীক্ষা'}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-800">
                  {service.sampleType}
                </div>
              </div>
            )}
          </div>

          {/* Test Preparation Instructions */}
          {service.preparationInstructions && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="text-xs font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'en' ? 'Patient Preparation & Guidelines' : 'রোগীর প্রস্তুতি সংক্রান্ত নির্দেশাবলী'}</span>
              </div>
              <div className="text-xs sm:text-sm text-amber-900 leading-relaxed pl-6">
                {Array.isArray(service.preparationInstructions) ? (
                  <ul className="list-disc space-y-1">
                    {service.preparationInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{lang === 'en' ? service.preparationInstructions : service.preparationInstructionsBn || service.preparationInstructions}</p>
                )}
              </div>
            </div>
          )}

          {/* Included Clinical Parameters / Sub-tests */}
          {service.includedParameters && service.includedParameters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#007E70]" />
                <span>{lang === 'en' ? 'Key Parameters / Inclusions' : 'অন্তর্ভুক্ত পরীক্ষা ও উপাদান'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.includedParameters.map((param, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007E70] shrink-0" />
                    <span>{param}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {lang === 'en'
              ? 'Our coordinator will contact you to verify requirements.'
              : 'টেস্টের জন্য আমাদের সমন্বয়কারী আপনার সাথে যোগাযোগ করবেন।'}
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
                onBook(service);
              }}
              className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 w-1/2 sm:w-auto cursor-pointer"
            >
              <span>{service.serviceType === 'HOME' ? (lang === 'en' ? 'Book Home Service' : 'হোম সার্ভিস বুক করুন') : (lang === 'en' ? 'Book This Service' : 'এই সেবা বুক করুন')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
