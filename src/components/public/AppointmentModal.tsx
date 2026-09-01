import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Stethoscope,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Home,
  Building2,
  MapPin,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Doctor, Service, Department, AppointmentRequest, BookingType, ServiceMode } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import { normalizeIndianPhoneNumber } from '../../lib/whatsappService';
import { evaluateDoctorAvailability, getDoctorPublicScheduleSummary } from '../../lib/doctorScheduleUtils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  services: Service[];
  departments: Department[];
  prefill?: {
    type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE';
    id?: string;
  };
  lang: 'en' | 'bn';
}

type PublicBookingCategory = 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE';

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  doctors,
  services,
  departments: _departments,
  prefill,
  lang
}) => {
  // Booking Category: Exactly 3 options as per specification
  const [bookingCategory, setBookingCategory] = useState<PublicBookingCategory>('DOCTOR_CONSULTATION');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceDeliveryMode, setServiceDeliveryMode] = useState<ServiceMode>('CLINIC');
  
  // Date & Time
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('Morning (09:00 AM - 01:00 PM)');
  
  // Patient Details
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [area, setArea] = useState<string>('Contai / Kumarpur');
  const [landmark, setLandmark] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Active items only
  const activeDoctors = doctors.filter((d) => d.status === 'ACTIVE');
  const activeServices = services.filter((s) => s.status === 'ACTIVE');

  // Filter services by category
  const clinicServicesList = activeServices.filter((s) => s.serviceType === 'CLINIC' || s.serviceType === 'BOTH');
  const homeServicesList = activeServices.filter((s) => s.serviceType === 'HOME' || s.serviceType === 'BOTH');

  // Get min date (today in local format YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper to check if selected date is Sunday
  const isSundayDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.getDay() === 0;
    }
    return false;
  };

  // Get next available non-Sunday date for default
  const getNextAvailableDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1); // Skip Sunday
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Initialize and handle prefill
  useEffect(() => {
    if (prefill) {
      if (prefill.type === 'DOCTOR' || prefill.type === 'DOCTOR_CONSULTATION') {
        setBookingCategory('DOCTOR_CONSULTATION');
        if (prefill.id && activeDoctors.some((d) => d.id === prefill.id)) {
          setSelectedDoctorId(prefill.id);
        }
      } else if (prefill.type === 'HOME_SERVICE') {
        setBookingCategory('HOME_SERVICE');
        setServiceDeliveryMode('HOME');
        if (prefill.id && homeServicesList.some((s) => s.id === prefill.id)) {
          setSelectedServiceId(prefill.id);
        }
      } else {
        // CLINIC_SERVICE or generic SERVICE
        const targetSrv = activeServices.find((s) => s.id === prefill.id);
        if (targetSrv?.serviceType === 'HOME') {
          setBookingCategory('HOME_SERVICE');
          setServiceDeliveryMode('HOME');
        } else {
          setBookingCategory('CLINIC_SERVICE');
          setServiceDeliveryMode('CLINIC');
        }
        if (prefill.id) {
          setSelectedServiceId(prefill.id);
        }
      }
    } else {
      if (activeDoctors.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(activeDoctors[0].id);
      }
      if (clinicServicesList.length > 0 && !selectedServiceId) {
        setSelectedServiceId(clinicServicesList[0].id);
      }
    }

    if (!preferredDate) {
      setPreferredDate(getNextAvailableDate());
    }
  }, [prefill, activeDoctors.length, activeServices.length]);

  // Handle switching booking category
  const handleCategorySwitch = (category: PublicBookingCategory) => {
    setBookingCategory(category);
    setFormError(null);

    if (category === 'DOCTOR_CONSULTATION') {
      if (activeDoctors.length > 0 && (!selectedDoctorId || !activeDoctors.some((d) => d.id === selectedDoctorId))) {
        setSelectedDoctorId(activeDoctors[0].id);
      }
    } else if (category === 'CLINIC_SERVICE') {
      setServiceDeliveryMode('CLINIC');
      if (clinicServicesList.length > 0 && (!selectedServiceId || !clinicServicesList.some((s) => s.id === selectedServiceId))) {
        setSelectedServiceId(clinicServicesList[0].id);
      }
    } else if (category === 'HOME_SERVICE') {
      setServiceDeliveryMode('HOME');
      if (homeServicesList.length > 0 && (!selectedServiceId || !homeServicesList.some((s) => s.id === selectedServiceId))) {
        setSelectedServiceId(homeServicesList[0].id);
      }
    }
  };

  // When service changes in dropdown
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const srv = activeServices.find((s) => s.id === serviceId);
    if (srv) {
      if (bookingCategory === 'HOME_SERVICE') {
        setServiceDeliveryMode('HOME');
      } else if (bookingCategory === 'CLINIC_SERVICE') {
        setServiceDeliveryMode('CLINIC');
      } else if (srv.serviceType === 'HOME') {
        setServiceDeliveryMode('HOME');
      } else {
        setServiceDeliveryMode('CLINIC');
      }
    }
  };

  if (!isOpen) return null;

  const isHomeService = bookingCategory === 'HOME_SERVICE' || serviceDeliveryMode === 'HOME';
  const selectedDoc = activeDoctors.find((d) => d.id === selectedDoctorId);
  const selectedSrv = activeServices.find((s) => s.id === selectedServiceId);
  const isSelectedDateSunday = isSundayDate(preferredDate);

  // Evaluate doctor availability for the chosen date
  const doctorScheduleSummary = selectedDoc ? getDoctorPublicScheduleSummary(selectedDoc, lang) : null;
  const doctorAvailability =
    bookingCategory === 'DOCTOR_CONSULTATION' && selectedDoc && preferredDate
      ? evaluateDoctorAvailability(selectedDoc, preferredDate)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent accidental duplicate submissions
    setFormError(null);

    // Validation: Patient Name
    if (!patientName.trim()) {
      setFormError(lang === 'en' ? 'Please enter the patient full name.' : 'অনুগ্রহ করে রোগীর পুরো নাম লিখুন।');
      return;
    }

    // Validation: Mobile Number (Must be valid 10-digit Indian Mobile)
    const phoneResult = normalizeIndianPhoneNumber(phone);
    if (!phoneResult.isValid) {
      setFormError(
        lang === 'en'
          ? 'Please enter a valid 10-digit mobile number for appointment coordination.'
          : 'অনুগ্রহ করে যোগাযোগের জন্য সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন।'
      );
      return;
    }

    // Validation: Date in Past
    const todayStr = getTodayDateString();
    if (!preferredDate || preferredDate < todayStr) {
      setFormError(
        lang === 'en'
          ? 'Please select a current or future appointment date.'
          : 'অনুগ্রহ করে আজকের বা ভবিষ্যতের একটি তারিখ বেছে নিন।'
      );
      return;
    }

    // Validation: Sunday Closure (Mon - Sat 09:00 AM - 07:00 PM, Sunday: Closed)
    if (isSundayDate(preferredDate)) {
      setFormError(
        lang === 'en'
          ? 'CareOn Medical Clinic is closed on Sundays (Mon – Sat: 09:00 AM – 07:00 PM). Please select Monday through Saturday.'
          : 'রবিবার ক্লিনিক বন্ধ থাকে। কেয়ারঅন সোমবার থেকে শনিবার (সকাল ০৯:০০ – সন্ধ্যা ০৭:০০) পর্যন্ত খোলা থাকে। অনুগ্রহ করে সোমবার থেকে শনিবারের মধ্যে তারিখ বেছে নিন।'
      );
      return;
    }

    // Validation: Category Selections
    if (bookingCategory === 'DOCTOR_CONSULTATION' && !selectedDoctorId) {
      setFormError(lang === 'en' ? 'Please select a doctor specialist.' : 'অনুগ্রহ করে বিশেষজ্ঞ চিকিৎসক নির্বাচন করুন।');
      return;
    }

    if ((bookingCategory === 'CLINIC_SERVICE' || bookingCategory === 'HOME_SERVICE') && !selectedServiceId) {
      setFormError(lang === 'en' ? 'Please select a clinical or diagnostic service.' : 'অনুগ্রহ করে সেবা বা টেস্ট নির্বাচন করুন।');
      return;
    }

    // Validation: Home Service Address & Area
    if (isHomeService && !address.trim()) {
      setFormError(
        lang === 'en'
          ? 'Please provide your doorstep address for home sample collection / visit.'
          : 'অনুগ্রহ করে হোম সার্ভিসের জন্য সম্পূর্ণ ঠিকানা লিখুন।'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedId = `APT-${Date.now().toString().slice(-6)}`;
      const resolvedBookingType: BookingType = bookingCategory;
      const resolvedRequestType: 'DOCTOR' | 'SERVICE' = bookingCategory === 'DOCTOR_CONSULTATION' ? 'DOCTOR' : 'SERVICE';
      const resolvedServiceMode: ServiceMode = isHomeService ? 'HOME' : 'CLINIC';

      const newRequest: AppointmentRequest = {
        id: generatedId,
        requestType: resolvedRequestType,
        bookingType: resolvedBookingType,
        doctorId: bookingCategory === 'DOCTOR_CONSULTATION' ? selectedDoctorId : undefined,
        doctorName: bookingCategory === 'DOCTOR_CONSULTATION' ? selectedDoc?.name : undefined,
        department: bookingCategory === 'DOCTOR_CONSULTATION' ? selectedDoc?.designation : undefined,
        serviceId: bookingCategory !== 'DOCTOR_CONSULTATION' ? selectedServiceId : undefined,
        serviceName: bookingCategory !== 'DOCTOR_CONSULTATION' ? selectedSrv?.name : undefined,
        serviceType: bookingCategory !== 'DOCTOR_CONSULTATION' ? (isHomeService ? 'HOME' : 'CLINIC') : undefined,
        serviceMode: resolvedServiceMode,
        locationType: resolvedServiceMode,
        requestedDate: preferredDate,
        requestedTimeWindow: preferredTime,
        preferredDate,
        preferredTime,
        patientName: patientName.trim(),
        phone: phone.trim(),
        mobile: phone.trim(),
        patientPhone: phone.trim(),
        email: email.trim() || undefined,
        patientEmail: email.trim() || undefined,
        address: isHomeService ? address.trim() : undefined,
        area: isHomeService ? area.trim() : undefined,
        landmark: isHomeService && landmark.trim() ? landmark.trim() : undefined,
        reason: reason.trim() || (isHomeService ? 'Home service visit request' : 'Clinic consultation request'),
        patientNote: reason.trim() || undefined,
        patientNotes: reason.trim() || undefined,
        notes: reason.trim() || undefined,
        status: 'NEW',
        adminNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      DataAccessLayer.createAppointmentRequest(newRequest);
      setSubmittedRequestId(newRequest.id);
      setIsSubmittedSuccess(true);
    } catch (err) {
      setFormError(
        lang === 'en'
          ? 'Failed to submit appointment request. Please call CareOn Helpline directly at 9933335131.'
          : 'অনুরোধ জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে কেয়ারঅন হেল্পলাইনে (9933335131) সরাসরি যোগাযোগ করুন।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmittedSuccess(false);
    setPatientName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setLandmark('');
    setReason('');
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#007E70] text-white flex items-center justify-center shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {lang === 'en' ? 'Book Appointment / Service' : 'অ্যাপয়েন্টমেন্ট বা টেস্ট বুকিং'}
              </h3>
              <p className="text-xs text-teal-800 font-semibold">
                CareOn Medical Clinic — Contai, Purba Medinipur
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close Appointment Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-8 max-h-[calc(88vh-90px)] overflow-y-auto">
          {isSubmittedSuccess ? (
            /* ========================================================================= */
            /* SUCCESS CONFIRMATION INTAKE SCREEN (Complies with Rule: Not Pre-Confirmed) */
            /* ========================================================================= */
            <div className="text-center py-4 space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-[#007E70] border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-xl font-extrabold text-[#0F172A]">
                  {lang === 'en'
                    ? 'Your appointment request has been received'
                    : 'আপনার অ্যাপয়েন্টমেন্ট রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে'}
                </h4>
                
                {/* STRICT REQUIRED PHRASING FROM PROMPT */}
                <div className="p-4 rounded-2xl bg-teal-50/90 border border-teal-200 text-xs sm:text-sm text-[#007E70] font-bold leading-relaxed space-y-1">
                  <p>
                    {lang === 'en'
                      ? 'CareOn Medical Clinic will contact you to confirm the appointment date and time.'
                      : 'CareOn Medical Clinic আপনার সাথে যোগাযোগ করে অ্যাপয়েন্টমেন্টের তারিখ ও সময় নিশ্চিত করবে।'}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {lang === 'en'
                      ? 'Clinic Helpline: 9933335131 • Mon – Sat 09:00 AM – 07:00 PM'
                      : 'হেল্পলাইন: ৯৯৩৩৩৩৫১৩১ • সোম – শনি সকাল ৯টা – সন্ধ্যা ৭টা'}
                  </p>
                </div>
              </div>

              {/* Booking Request Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>{lang === 'en' ? 'Tracking Reference ID:' : 'রেফারেন্স আইডি:'}</span>
                  <span className="font-mono font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {submittedRequestId}
                  </span>
                </div>
                
                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'en' ? 'Patient Name:' : 'রোগীর নাম:'}</span>
                  <span className="font-bold text-slate-900">{patientName}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'en' ? 'Mobile Number:' : 'মোবাইল নম্বর:'}</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'en' ? 'Booking Category:' : 'বুকিং ক্যাটাগরি:'}</span>
                  <span className="font-bold text-[#007E70]">
                    {bookingCategory === 'DOCTOR_CONSULTATION'
                      ? (lang === 'en' ? 'Doctor Consultation' : 'ডাক্তার কনসালটেশন')
                      : bookingCategory === 'HOME_SERVICE'
                      ? (lang === 'en' ? '🏠 Doorstep Home Service' : '🏠 ডোরস্টেপ হোম সার্ভিস')
                      : (lang === 'en' ? '🏥 In-Clinic Service' : '🏥 ইন-ক্লিনিক সার্ভিস')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'en' ? 'Selected Doctor / Service:' : 'ডাক্তার বা সেবা:'}</span>
                  <span className="font-bold text-slate-900">
                    {bookingCategory === 'DOCTOR_CONSULTATION'
                      ? `Dr. ${selectedDoc?.name || 'Specialist'}`
                      : (selectedSrv?.name || 'Diagnostic Service')}
                  </span>
                </div>

                {isHomeService && address && (
                  <div className="flex justify-between text-slate-500">
                    <span>{lang === 'en' ? 'Home Visit Address:' : 'হোম সার্ভিসের ঠিকানা:'}</span>
                    <span className="font-medium text-slate-900 text-right max-w-xs">
                      {address} {area ? `(${area})` : ''} {landmark ? `[Landmark: ${landmark}]` : ''}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'en' ? 'Requested Time Window:' : 'পছন্দের সময়:'}</span>
                  <span className="font-medium text-slate-900">
                    {preferredDate} • {preferredTime}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3.5 px-4 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {lang === 'en' ? 'Done / Back to Website' : 'সম্পন্ন করুন'}
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 3-STEP BOOKING INTAKE FORM (Single-View Clean Execution) */
            /* ========================================================================= */
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-bold">{formError}</span>
                </div>
              )}

              {/* STEP 1: EXACT 3 BOOKING TYPES */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  {lang === 'en' ? '1. Select Booking Type' : '১. সেবার ধরন নির্বাচন করুন'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Doctor Consultation */}
                  <button
                    type="button"
                    onClick={() => handleCategorySwitch('DOCTOR_CONSULTATION')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      bookingCategory === 'DOCTOR_CONSULTATION'
                        ? 'bg-teal-50 border-[#007E70] text-[#007E70] shadow-2xs ring-1 ring-[#007E70]'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-5 h-5 text-[#007E70]" />
                    <span>{lang === 'en' ? 'Doctor Consultation' : 'ডাক্তার কনসালটেশন'}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {lang === 'en' ? 'Chamber visit' : 'ক্লিনিক চেম্বার'}
                    </span>
                  </button>

                  {/* Option 2: Clinic Service */}
                  <button
                    type="button"
                    onClick={() => handleCategorySwitch('CLINIC_SERVICE')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      bookingCategory === 'CLINIC_SERVICE'
                        ? 'bg-teal-50 border-[#007E70] text-[#007E70] shadow-2xs ring-1 ring-[#007E70]'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#007E70]" />
                    <span>{lang === 'en' ? 'Clinic Service' : 'ক্লিনিক সার্ভিস'}</span>
                    <span className="text-[10px] font-normal text-slate-500">
                      {lang === 'en' ? 'Tests & Diagnostics' : 'টেস্ট ও ডায়াগনস্টিক'}
                    </span>
                  </button>

                  {/* Option 3: Home Service */}
                  <button
                    type="button"
                    onClick={() => handleCategorySwitch('HOME_SERVICE')}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                      bookingCategory === 'HOME_SERVICE'
                        ? 'bg-purple-50 border-purple-600 text-purple-800 shadow-2xs ring-1 ring-purple-600'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-5 h-5 text-purple-600" />
                    <span>{lang === 'en' ? 'Home Service' : 'হোম সার্ভিস'}</span>
                    <span className="text-[10px] font-normal text-purple-700">
                      {lang === 'en' ? 'Doorstep collection' : 'বাড়িতে সেবা'}
                    </span>
                  </button>
                </div>
              </div>

              {/* STEP 2: SELECT DOCTOR OR SERVICE (+ MODALITY IF SERVICE) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  {bookingCategory === 'DOCTOR_CONSULTATION'
                    ? (lang === 'en' ? '2. Choose Doctor Specialist' : '২. চিকিৎসক নির্বাচন করুন')
                    : (lang === 'en' ? '2. Choose Service & Modality' : '২. সেবা ও মাধ্যম নির্বাচন করুন')}
                </label>

                {bookingCategory === 'DOCTOR_CONSULTATION' ? (
                  <div className="space-y-2">
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    >
                      {activeDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — {doc.designation} ({doc.consultationDays.join(', ')})
                        </option>
                      ))}
                    </select>

                    {selectedDoc && doctorScheduleSummary && (
                      <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-extrabold text-teal-950">
                            Dr. {selectedDoc.name} ({selectedDoc.qualification})
                          </span>
                          {doctorScheduleSummary.badge && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                              {doctorScheduleSummary.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-teal-900 flex flex-wrap gap-x-3 gap-y-1">
                          <span><strong>{lang === 'en' ? 'Routine Schedule:' : 'নিয়মিত সময়:'}</strong> {doctorScheduleSummary.scheduleText}</span>
                          <span><strong>{lang === 'en' ? 'Hours:' : 'সময়:'}</strong> {selectedDoc.consultationTime || doctorScheduleSummary.timeText}</span>
                          {selectedDoc.roomNumber && <span><strong>{lang === 'en' ? 'Chamber:' : 'চেম্বার:'}</strong> {selectedDoc.roomNumber}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                ) : bookingCategory === 'HOME_SERVICE' ? (
                  <div className="space-y-3">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-600"
                    >
                      {homeServicesList.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — [Home Service Available]
                        </option>
                      ))}
                    </select>

                    {/* Doorstep Home Service Info Banner */}
                    <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-2.5 text-xs text-purple-900">
                      <Home className="w-4 h-4 text-purple-700 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="font-bold">Doorstep Home Collection & Service</div>
                        <p className="text-[11px] text-purple-700">
                          {lang === 'en'
                            ? 'Our qualified clinical staff / phlebotomist visits your home in Contai and surrounding areas with sterile kits.'
                            : 'আমাদের মেডিকেল প্রতিনিধি কন্টাই ও পার্শ্ববর্তী এলাকার আপনার বাড়িতে এসে স্বাস্থ্যসম্মতভাবে পরিষেবা প্রদান করবেন।'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* In-Clinic Service */
                  <div className="space-y-3">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    >
                      {clinicServicesList.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} {srv.serviceType === 'BOTH' ? '— (Clinic & Home Option)' : '— (Clinic Facility)'}
                        </option>
                      ))}
                    </select>

                    {/* Modality toggle if chosen service supports BOTH */}
                    {selectedSrv?.serviceType === 'BOTH' && (
                      <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-800 block">
                          {lang === 'en' ? 'This service is available in both modes. Choose your preference:' : 'এই সেবা উভয় মাধ্যমে উপলব্ধ। আপনার পছন্দ নির্বাচন করুন:'}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setServiceDeliveryMode('CLINIC')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              serviceDeliveryMode === 'CLINIC'
                                ? 'bg-white border-[#007E70] text-[#007E70] shadow-2xs ring-1 ring-[#007E70]'
                                : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Clinic Visit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setServiceDeliveryMode('HOME')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              serviceDeliveryMode === 'HOME'
                                ? 'bg-white border-purple-600 text-purple-700 shadow-2xs ring-1 ring-purple-600'
                                : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <Home className="w-3.5 h-3.5" />
                            <span>Home Service</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 3: SCHEDULE (Date Validation + Time Window Safety) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  {lang === 'en' ? '3. Preferred Appointment Window' : '৩. পছন্দের সময়সূচী'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Preferred Date' : 'পছন্দের তারিখ'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={getTodayDateString()}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 ${
                        isSelectedDateSunday
                          ? 'border-rose-300 ring-2 ring-rose-200'
                          : 'border-slate-200 focus:ring-[#007E70]/20 focus:border-[#007E70]'
                      }`}
                    />
                  </div>

                  {/* Preferred Time Window */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Preferred Time Window' : 'পছন্দের সময়কাল'} <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    >
                      <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM – 01:00 PM)</option>
                      <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (01:00 PM – 04:00 PM)</option>
                      <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM – 07:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Doctor Availability Feedback for Selected Date */}
                {doctorAvailability && !isSelectedDateSunday && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      doctorAvailability.isAvailable
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/90 border-amber-200 text-amber-900'
                    }`}
                  >
                    {doctorAvailability.isAvailable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="font-bold">
                        {doctorAvailability.isAvailable
                          ? (lang === 'en' ? 'Doctor Scheduled on this Date' : 'এই তারিখে ডাক্তার উপলব্ধ আছেন')
                          : (lang === 'en' ? 'Schedule Notice for Requested Date' : 'নির্বাচিত তারিখের শিডিউল তথ্য')}
                      </div>
                      {doctorAvailability.reason && (
                        <p className="text-[11px] leading-relaxed opacity-90">
                          {doctorAvailability.reason}
                        </p>
                      )}
                      {doctorAvailability.timeDisplay && (
                        <p className="text-[10px] font-semibold text-emerald-800">
                          {lang === 'en' ? 'Expected Chamber Hours:' : 'প্রত্যাশিত চেম্বার সময়:'}{' '}
                          {doctorAvailability.timeDisplay}
                          {doctorAvailability.roomNumber ? ` (${doctorAvailability.roomNumber})` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Sunday Closed Warning */}
                {isSelectedDateSunday && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Sunday is closed. CareOn Medical Clinic operates Mon – Sat (09:00 AM – 07:00 PM). Please select Monday to Saturday.'
                        : 'রবিবার ক্লিনিক বন্ধ থাকে। কেয়ারঅন সোমবার থেকে শনিবার (সকাল ৯টা – সন্ধ্যা ৭টা) খোলা থাকে।'}
                    </span>
                  </div>
                )}

                {/* Preferred time subject to confirmation label */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    <strong>Preferred time — subject to confirmation</strong> by CareOn clinic intake desk.
                  </span>
                </div>
              </div>

              {/* STEP 4: PATIENT DETAILS (+ CONDITIONAL HOME SERVICE ADDRESS) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                  {lang === 'en' ? '4. Patient Contact & Details' : '৪. রোগীর তথ্য ও ঠিকানা'}
                </label>

                {/* Patient Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Patient Full Name' : 'রোগীর পুরো নাম'} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Adhikari"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {lang === 'en' ? '10-Digit Mobile Number' : 'মোবাইল নম্বর'} <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 98311 XXXXX"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                      />
                    </div>
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {lang === 'en' ? 'Email Address (Optional)' : 'ইমেইল (ঐচ্ছিক)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                      />
                    </div>
                  </div>
                </div>

                {/* CONDITIONAL HOME SERVICE ADDRESS FIELDS (Strictly required for Home Service) */}
                {isHomeService && (
                  <div className="space-y-3 p-4 bg-purple-50/60 rounded-2xl border border-purple-200 animate-in fade-in">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-purple-950">
                        {lang === 'en' ? 'Doorstep Collection / Visit Address' : 'নমুনা সংগ্রহের সম্পূর্ণ ঠিকানা'} <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-purple-600 absolute left-3.5 top-3" />
                        <textarea
                          rows={2}
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="House/Apartment number, Road, Village/Ward in Contai or nearby..."
                          className="w-full pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Area / Locality */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-purple-900">
                          {lang === 'en' ? 'Area / Locality' : 'এলাকা'} <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          placeholder="e.g. Kumarpur / Central Contai / Marishda"
                          className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium"
                        />
                      </div>

                      {/* Landmark (Optional) */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-purple-900">
                          {lang === 'en' ? 'Nearby Landmark (Optional)' : 'নিকটবর্তী ল্যান্ডমার্ক'}
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g. Near Amartya Palli Water Tank"
                          className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Patient Notes / Remarks (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {lang === 'en' ? 'Patient Notes / Symptoms (Optional)' : 'লক্ষণ বা বিশেষ বিবরণ (ঐচ্ছিক)'}
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={lang === 'en' ? 'Brief description of symptoms, prior prescription, or test requirements...' : 'সমস্যা বা টেস্টের সংক্ষিপ্ত বিবরণ...'}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                  />
                </div>
              </div>

              {/* Submit CTA & Safety Note */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isSelectedDateSunday}
                  className="w-full py-3.5 px-4 bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-teal-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'en' ? 'Submitting Request...' : 'জমা হচ্ছে...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Submit Appointment Request' : 'অ্যাপয়েন্টমেন্ট রিকোয়েস্ট পাঠান'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {lang === 'en'
                      ? 'No instant automated charges • Our coordinator will call to confirm the slot'
                      : 'কেয়ারঅন সমন্বয়কারী ফোন বা বার্তার মাধ্যমে সময় নিশ্চিত করবেন'}
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
