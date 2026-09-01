import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Stethoscope,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Phone,
  ArrowLeft,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { usePublicData } from '../lib/usePublicData';
import { AppointmentRequest } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
}

export const BookingModalConcept: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const { doctors, services, submitAppointment } = usePublicData();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingType, setBookingType] = useState<'DOCTOR' | 'SERVICE'>('DOCTOR');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('Evening (05:00 PM – 08:30 PM)');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');

  const [submittedRecord, setSubmittedRecord] = useState<AppointmentRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [doctors, services, selectedDoctorId, selectedServiceId]);

  if (!isOpen) return null;

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleReset = () => {
    setStep(1);
    setSubmittedRecord(null);
    setErrorMessage(null);
    onClose();
  };

  const handleConfirmSubmission = () => {
    if (!patientName.trim()) {
      setErrorMessage(lang === 'en' ? 'Please enter patient name.' : 'অনুগ্রহ করে রোগীর নাম লিখুন।');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 8) {
      setErrorMessage(lang === 'en' ? 'Please provide a valid contact number.' : 'একটি বৈধ ফোন নম্বর প্রদান করুন।');
      return;
    }

    try {
      const record = submitAppointment({
        patientName: patientName.trim(),
        phone: patientPhone.trim(),
        email: patientEmail.trim() || undefined,
        requestType: bookingType,
        doctorId: bookingType === 'DOCTOR' ? currentDoctor?.id : undefined,
        doctorName: bookingType === 'DOCTOR' ? currentDoctor?.name : undefined,
        serviceId: bookingType === 'SERVICE' ? currentService?.id : undefined,
        serviceName: bookingType === 'SERVICE' ? currentService?.name : undefined,
        preferredDate: selectedDate,
        preferredTime: selectedSlot,
        patientNotes: patientNotes.trim() || undefined
      });

      setSubmittedRecord(record);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking submission failed. Please call the clinic directly.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#007E70] bg-teal-50 px-2 py-0.5 rounded">
              {lang === 'en' ? 'Online Appointment Intake' : 'অনলাইন অ্যাপয়েন্টমেন্ট বুকিং'}
            </span>
            <span className="text-[11px] text-slate-400">
              {step === 1 ? 'Step 1 of 3: Target' : step === 2 ? 'Step 2 of 3: Details' : 'Step 3 of 3: Confirmation'}
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0F172A]">
            {lang === 'en' ? 'Book CareOn Appointment' : 'কেয়ারঅন অ্যাপয়েন্টমেন্ট বুক করুন'}
          </h3>
          <p className="text-xs text-[#475569]">
            {lang === 'en'
              ? 'Simple 3-step scheduling with instant confirmation for you & your family.'
              : 'আপনার ও আপনার পরিবারের জন্য সহজ ৩-ধাপের সময়সূচী।'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Target Selection */}
        {step === 1 && !submittedRecord && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBookingType('DOCTOR')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  bookingType === 'DOCTOR'
                    ? 'border-[#007E70] bg-teal-50/50 ring-2 ring-[#007E70]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#007E70] flex items-center justify-center mb-2.5">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">
                  {lang === 'en' ? 'Book a Physician' : 'চিকিৎসক বুক করুন'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {doctors.length} Verified Specialists
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBookingType('SERVICE')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  bookingType === 'SERVICE'
                    ? 'border-[#007E70] bg-teal-50/50 ring-2 ring-[#007E70]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#007E70] flex items-center justify-center mb-2.5">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">
                  {lang === 'en' ? 'Book Clinical Service' : 'স্বাস্থ্যসেবা বুক করুন'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {services.length} Preventive & Diagnostic Packages
                </p>
              </button>
            </div>

            {/* Dynamic Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#0F172A] block">
                {bookingType === 'DOCTOR' ? 'Select Active Physician:' : 'Select Clinical Package:'}
              </label>

              {bookingType === 'DOCTOR' ? (
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.qualification} ({doc.consultationTime})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-[#007E70]"
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.category} • Turnaround: {srv.reportTurnaroundTime})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Schedule Slot Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Time Slot Window</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                >
                  <option>Morning (08:30 AM – 12:00 PM)</option>
                  <option>Afternoon (12:00 PM – 04:30 PM)</option>
                  <option>Evening (05:00 PM – 08:30 PM)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>{lang === 'en' ? 'Continue to Patient Info' : 'রোগীর বিবরণে এগিয়ে যান'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Patient Info */}
        {step === 2 && !submittedRecord && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Siba Prasad Mukherjee"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">
                Mobile Number (for WhatsApp/SMS Confirmation) <span className="text-rose-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-xs font-mono text-slate-500 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98300 12345"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-r-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">
                Brief Symptoms or Visit Purpose
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Routine blood pressure review & seasonal checkup..."
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!patientName.trim()) {
                    setErrorMessage('Please enter patient full name.');
                    return;
                  }
                  if (!patientPhone.trim()) {
                    setErrorMessage('Please enter patient contact number.');
                    return;
                  }
                  setErrorMessage(null);
                  setStep(3);
                }}
                className="flex-1 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Review & Confirm</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Direct Submit */}
        {step === 3 && !submittedRecord && (
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Booking Type:</span>
                <span className="font-bold text-[#0F172A] uppercase">{bookingType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">{bookingType === 'DOCTOR' ? 'Practitioner:' : 'Service:'}</span>
                <span className="font-bold text-[#007E70]">
                  {bookingType === 'DOCTOR' ? currentDoctor?.name : currentService?.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-semibold text-slate-800">{selectedDate} ({selectedSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-800">
                  {patientName} (+91 {patientPhone})
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              *By confirming, your appointment request is placed directly in the CareOn reception intake queue. Reception coordinates with you on WhatsApp/Phone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmission}
                className="flex-1 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm Appointment Request
              </button>
            </div>
          </div>
        )}

        {/* Confirmed State */}
        {submittedRecord && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#007E70] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#0F172A]">
                {lang === 'en' ? 'Appointment Request Confirmed!' : 'অ্যাপয়েন্টমেন্ট অনুরোধ সফলভাবে গৃহীত হয়েছে!'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Reference ID: <strong className="font-mono text-slate-900">{submittedRecord.id.toUpperCase()}</strong>. CareOn reception has received your booking request for {submittedRecord.preferredDate}.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-[#007E70] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Done / Return to Platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
