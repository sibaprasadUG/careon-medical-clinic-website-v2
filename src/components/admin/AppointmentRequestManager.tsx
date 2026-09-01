import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { AppointmentRequest, AppointmentStatus, Doctor, Service, Department } from '../../types';
import {
  normalizeIndianPhoneNumber,
  generateWhatsAppMessage,
  buildWhatsAppClickToChatUrl,
  formatAppointmentDate,
  WhatsAppMessageType
} from '../../lib/whatsappMessages';
import {
  CalendarCheck,
  Phone,
  MessageSquare,
  Mail,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  Home,
  Building2,
  MapPin,
  Send,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Languages,
  ShieldCheck
} from 'lucide-react';

export const AppointmentRequestManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Detail Modal State
  const [activeRequest, setActiveRequest] = useState<AppointmentRequest | null>(null);
  const [confirmedDate, setConfirmedDate] = useState<string>('');
  const [confirmedTime, setConfirmedTime] = useState<string>('');
  const [confirmedDoctorId, setConfirmedDoctorId] = useState<string>('');
  const [confirmedServiceId, setConfirmedServiceId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // WhatsApp Preview Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);
  const [whatsAppLang, setWhatsAppLang] = useState<'en' | 'bn'>('en');
  const [whatsAppMessageType, setWhatsAppMessageType] = useState<WhatsAppMessageType>('CONFIRMATION');
  const [whatsAppCustomText, setWhatsAppCustomText] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Cancellation Sub-modal
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancellationReason, setCancellationReason] = useState<string>('Patient requested cancellation');

  const loadData = () => {
    setAppointments(DataAccessLayer.getAllAppointmentRequests());
    setDoctors(DataAccessLayer.getAllDoctors());
    setServices(DataAccessLayer.getAllServices());
    setDepartments(DataAccessLayer.getAllDepartments());
  };

  const getDoctorDepartmentName = (doc?: Doctor) => {
    if (!doc) return 'Clinical Consultation';
    const dep = departments.find((d) => d.id === doc.departmentId);
    return dep?.name || doc.designation || 'Specialist Consultation';
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  // Filtered Appointments
  const filteredAppointments = appointments.filter((req) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      req.patientName.toLowerCase().includes(q) ||
      req.phone.includes(q) ||
      (req.doctorName && req.doctorName.toLowerCase().includes(q)) ||
      (req.serviceName && req.serviceName.toLowerCase().includes(q)) ||
      (req.address && req.address.toLowerCase().includes(q)) ||
      (req.area && req.area.toLowerCase().includes(q));

    const matchesStatus = selectedStatusFilter === 'all' || req.status === selectedStatusFilter;

    let matchesType = true;
    if (selectedTypeFilter === 'DOCTOR') {
      matchesType = req.requestType === 'DOCTOR';
    } else if (selectedTypeFilter === 'SERVICE_CLINIC') {
      matchesType = req.requestType === 'SERVICE' && req.serviceType !== 'HOME' && req.locationType !== 'HOME';
    } else if (selectedTypeFilter === 'SERVICE_HOME') {
      matchesType = req.requestType === 'SERVICE' && (req.serviceType === 'HOME' || req.locationType === 'HOME');
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  // Open Detail Modal
  const handleOpenDetail = (req: AppointmentRequest) => {
    setActiveRequest(req);
    // Initialize confirmed date & time from confirmed fields or fallback to empty
    setConfirmedDate(req.confirmedDate || (req.preferredDate.match(/^\d{4}-\d{2}-\d{2}$/) ? req.preferredDate : ''));
    setConfirmedTime(req.confirmedTime || '');
    setConfirmedDoctorId(req.confirmedDoctorId || req.doctorId || '');
    setConfirmedServiceId(req.confirmedServiceId || req.serviceId || '');
    setAdminNotes(req.adminNotes || '');
    setValidationError(null);
    setActionSuccessMessage(null);
    setCancelModalOpen(false);
  };

  // Synchronize WhatsApp preview message text when options change
  useEffect(() => {
    if (!activeRequest || !whatsAppModalOpen) return;

    const selectedDoc = doctors.find((d) => d.id === (confirmedDoctorId || activeRequest.confirmedDoctorId || activeRequest.doctorId));
    const selectedSrv = services.find((s) => s.id === (confirmedServiceId || activeRequest.confirmedServiceId || activeRequest.serviceId));

    const generated = generateWhatsAppMessage({
      appointment: {
        ...activeRequest,
        confirmedDate: confirmedDate || activeRequest.confirmedDate,
        confirmedTime: confirmedTime || activeRequest.confirmedTime
      },
      language: whatsAppLang,
      messageType: whatsAppMessageType,
      customDoctorName: selectedDoc?.name || activeRequest.confirmedDoctorName || activeRequest.doctorName,
      customDepartment: getDoctorDepartmentName(selectedDoc) || activeRequest.confirmedDepartment || activeRequest.department,
      customServiceName: selectedSrv?.name || activeRequest.confirmedServiceName || activeRequest.serviceName,
      customDate: formatAppointmentDate(confirmedDate || activeRequest.confirmedDate || activeRequest.preferredDate),
      customTime: confirmedTime || activeRequest.confirmedTime || activeRequest.preferredTime
    });

    setWhatsAppCustomText(generated);
  }, [whatsAppModalOpen, whatsAppLang, whatsAppMessageType, activeRequest, confirmedDate, confirmedTime, confirmedDoctorId, confirmedServiceId, doctors, services]);

  // Save General Changes (Notes & Doctor/Service selection)
  const handleSaveGeneralChanges = () => {
    if (!activeRequest || !currentUser) return;
    
    const selectedDoc = doctors.find((d) => d.id === confirmedDoctorId);
    const selectedSrv = services.find((s) => s.id === confirmedServiceId);

    if (activeRequest.status === 'CONFIRMED') {
      if (!confirmedDate || !confirmedTime) {
        setValidationError('Confirmed Date and Confirmed Time are required for confirmed appointments.');
        return;
      }

      const updated = DataAccessLayer.confirmAppointment(
        activeRequest.id,
        {
          confirmedDate,
          confirmedTime,
          confirmedDoctorId,
          confirmedDoctorName: selectedDoc?.name || activeRequest.confirmedDoctorName,
          confirmedDepartment: getDoctorDepartmentName(selectedDoc) || activeRequest.confirmedDepartment,
          confirmedServiceId,
          confirmedServiceName: selectedSrv?.name || activeRequest.confirmedServiceName,
          adminNotes
        },
        currentUser
      );
      if (updated) setActiveRequest(updated);
    } else {
      const updated = DataAccessLayer.updateAppointmentStatus(
        activeRequest.id,
        activeRequest.status,
        adminNotes,
        currentUser
      );
      if (updated) setActiveRequest(updated);
    }

    setActionSuccessMessage('Changes saved successfully.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // Action: Mark Contacted
  const handleMarkContacted = () => {
    if (!activeRequest || !currentUser) return;
    const updated = DataAccessLayer.markAppointmentContacted(activeRequest.id, adminNotes, currentUser);
    if (updated) {
      setActiveRequest(updated);
      setActionSuccessMessage('Marked as CONTACTED. Proceed to lock confirmed date & time.');
    }
  };

  // Action: Confirm Appointment
  const handleConfirmAppointment = () => {
    if (!activeRequest || !currentUser) return;

    if (!confirmedDate || !confirmedDate.trim()) {
      setValidationError('Please select the confirmed appointment date.');
      return;
    }
    if (!confirmedTime || !confirmedTime.trim()) {
      setValidationError('Please select the confirmed appointment time.');
      return;
    }

    setValidationError(null);

    const selectedDoc = doctors.find((d) => d.id === confirmedDoctorId);
    const selectedSrv = services.find((s) => s.id === confirmedServiceId);

    const updated = DataAccessLayer.confirmAppointment(
      activeRequest.id,
      {
        confirmedDate,
        confirmedTime,
        confirmedDoctorId,
        confirmedDoctorName: selectedDoc?.name || activeRequest.confirmedDoctorName || activeRequest.doctorName,
        confirmedDepartment: getDoctorDepartmentName(selectedDoc) || activeRequest.confirmedDepartment || activeRequest.department,
        confirmedServiceId,
        confirmedServiceName: selectedSrv?.name || activeRequest.confirmedServiceName || activeRequest.serviceName,
        adminNotes
      },
      currentUser
    );

    if (updated) {
      setActiveRequest(updated);
      setActionSuccessMessage('Appointment successfully CONFIRMED! Ready for WhatsApp notification.');
      // Open WhatsApp preview modal for the administrator
      setWhatsAppMessageType('CONFIRMATION');
      setWhatsAppModalOpen(true);
    }
  };

  // Action: Reschedule Appointment
  const handleReschedule = () => {
    if (!activeRequest || !currentUser) return;

    if (!confirmedDate || !confirmedDate.trim()) {
      setValidationError('Please select the new confirmed appointment date.');
      return;
    }
    if (!confirmedTime || !confirmedTime.trim()) {
      setValidationError('Please select the new confirmed appointment time.');
      return;
    }

    const selectedDoc = doctors.find((d) => d.id === confirmedDoctorId);
    const selectedSrv = services.find((s) => s.id === confirmedServiceId);

    const updated = DataAccessLayer.confirmAppointment(
      activeRequest.id,
      {
        confirmedDate,
        confirmedTime,
        confirmedDoctorId,
        confirmedDoctorName: selectedDoc?.name || activeRequest.confirmedDoctorName,
        confirmedDepartment: getDoctorDepartmentName(selectedDoc) || activeRequest.confirmedDepartment,
        confirmedServiceId,
        confirmedServiceName: selectedSrv?.name || activeRequest.confirmedServiceName,
        adminNotes: adminNotes ? `${adminNotes} [Rescheduled]` : '[Rescheduled]'
      },
      currentUser
    );

    if (updated) {
      setActiveRequest(updated);
      setActionSuccessMessage('Appointment rescheduled. Preparing updated WhatsApp message.');
      setWhatsAppMessageType('RESCHEDULE');
      setWhatsAppModalOpen(true);
    }
  };

  // Action: Cancel Appointment
  const handleConfirmCancellation = () => {
    if (!activeRequest || !currentUser) return;

    const updated = DataAccessLayer.cancelAppointment(
      activeRequest.id,
      cancellationReason,
      adminNotes,
      currentUser
    );

    if (updated) {
      setActiveRequest(updated);
      setCancelModalOpen(false);
      setActionSuccessMessage('Appointment has been marked as CANCELLED.');
      setWhatsAppMessageType('CANCELLATION');
      setWhatsAppModalOpen(true);
    }
  };

  // Trigger Open WhatsApp Preview
  const handleOpenWhatsAppPreview = (type: WhatsAppMessageType = 'CONFIRMATION') => {
    if (!activeRequest) return;
    setWhatsAppMessageType(type);
    setWhatsAppModalOpen(true);
  };

  // Final Action: Launch WhatsApp Click-to-Chat in New Tab
  const handleLaunchWhatsApp = () => {
    if (!activeRequest || !currentUser) return;
    const phoneInfo = normalizeIndianPhoneNumber(activeRequest.phone);
    if (!phoneInfo.isValid) {
      alert('Cannot launch WhatsApp: Patient mobile number is invalid.');
      return;
    }

    // Record audit event
    DataAccessLayer.recordWhatsAppInitiated(
      activeRequest.id,
      activeRequest.patientName,
      phoneInfo.display,
      whatsAppMessageType,
      currentUser
    );

    const clickToChatUrl = `https://wa.me/${phoneInfo.normalized}?text=${encodeURIComponent(whatsAppCustomText)}`;
    window.open(clickToChatUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy WhatsApp Text to Clipboard
  const handleCopyWhatsAppText = () => {
    navigator.clipboard.writeText(whatsAppCustomText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helpers
  const isReqHomeService = (req: AppointmentRequest) => {
    return req.requestType === 'SERVICE' && (req.serviceType === 'HOME' || req.locationType === 'HOME');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            NEW REQUEST
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            CONTACTED
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-3 h-3 text-indigo-600" />
            RESCHEDULED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            CANCELLED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-50 text-[#007E70] border border-teal-200">
            <Check className="w-3 h-3 text-[#007E70]" />
            COMPLETED
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200">
            <AlertCircle className="w-3 h-3 text-orange-600" />
            NO SHOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Standard clinical time slots for quick selection
  const standardTimeSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
    '06:00 PM',
    '06:30 PM',
    '07:00 PM'
  ];

  // Quick date presets
  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setConfirmedDate(`${yyyy}-${mm}-${dd}`);
  };

  const patientPhoneInfo = activeRequest ? normalizeIndianPhoneNumber(activeRequest.phone) : null;

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#007E70] flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5 text-[#007E70]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              Appointment Intake Desk
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-world confirmation workflow: Patient Inquiries → Staff Review → Contacted → Confirmed Slot → WhatsApp Notification.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {appointments.filter((a) => a.status === 'NEW').length} New Requests
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 shadow-2xs">
            {appointments.filter((a) => a.status === 'CONTACTED').length} Contacted
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs">
            {appointments.filter((a) => a.status === 'CONFIRMED').length} Confirmed
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, phone, doctor, address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-medium"
            >
              <option value="all">All Intake Statuses ({appointments.length})</option>
              <option value="NEW">NEW REQUESTS (Pending Review)</option>
              <option value="CONTACTED">CONTACTED (Follow-up In Progress)</option>
              <option value="CONFIRMED">CONFIRMED (Date & Time Locked)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-medium"
            >
              <option value="all">All Booking Categories</option>
              <option value="DOCTOR">Doctor Consultation</option>
              <option value="SERVICE_CLINIC">In-Clinic Diagnostics & Services</option>
              <option value="SERVICE_HOME">🏠 Doorstep Home Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No appointment requests found</h3>
            <p className="text-xs text-slate-400">All website inquiries matching the filter have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Patient & Contact</th>
                  <th className="py-3.5 px-4 font-bold">Modality & Service</th>
                  <th className="py-3.5 px-4 font-bold">Preferred Window</th>
                  <th className="py-3.5 px-4 font-bold">Confirmed Appointment</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Requested On</th>
                  <th className="py-3.5 px-4 text-right font-bold">Intake Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map((req) => {
                  const isHome = isReqHomeService(req);
                  const phoneInfo = normalizeIndianPhoneNumber(req.phone);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{req.patientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <a
                            href={`tel:${phoneInfo.normalized || req.phone}`}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#007E70] font-medium"
                            title="Call Patient"
                          >
                            <Phone className="w-3 h-3 text-teal-600" />
                            <span>{req.phone}</span>
                          </a>
                        </div>
                        {isHome && req.address && (
                          <div className="text-[11px] text-purple-700 font-medium flex items-center gap-1 mt-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 max-w-xs truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-purple-600" />
                            <span className="truncate">{req.address} {req.area ? `(${req.area})` : ''}</span>
                          </div>
                        )}
                        {req.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                            {req.email}
                          </div>
                        )}
                      </td>

                      {/* Modality & Service */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {req.requestType === 'DOCTOR' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-[#007E70] text-[10px] font-bold border border-teal-200">
                              <Building2 className="w-3 h-3" /> Doctor Visit
                            </span>
                          ) : isHome ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                              <Home className="w-3 h-3" /> Doorstep Home Service
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              <Building2 className="w-3 h-3" /> In-Clinic Service
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-slate-900 text-xs mt-1">
                          {req.doctorName || req.serviceName || 'General Practice'}
                        </div>
                        {req.department && (
                          <div className="text-[10px] text-slate-500">{req.department}</div>
                        )}
                      </td>

                      {/* Preferred Window (Patient Requested) */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{formatAppointmentDate(req.preferredDate)}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{req.preferredTime}</span>
                        </div>
                      </td>

                      {/* Confirmed Date & Time (Distinct Visual Card) */}
                      <td className="py-3.5 px-4">
                        {req.status === 'CONFIRMED' && req.confirmedDate && req.confirmedTime ? (
                          <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-0.5">
                            <div className="font-extrabold text-[11px] text-emerald-800 flex items-center gap-1">
                              <CalendarCheck className="w-3 h-3 text-emerald-600" />
                              <span>{formatAppointmentDate(req.confirmedDate)}</span>
                            </div>
                            <div className="text-[10px] font-bold text-emerald-700">
                              {req.confirmedTime}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Pending confirmation
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* Requested On */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Intake Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'CONFIRMED' && (
                            <button
                              onClick={() => {
                                handleOpenDetail(req);
                                handleOpenWhatsAppPreview('CONFIRMATION');
                              }}
                              title="Prepare WhatsApp Confirmation"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenDetail(req)}
                            className="px-3 py-1.5 bg-[#007E70] hover:bg-[#009282] text-white text-[11px] font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                          >
                            Review & Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ADMIN REVIEW & UPDATE MODAL (Clean 4-Section Architecture) */}
      {/* ========================================================================= */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#007E70] text-white flex items-center justify-center font-bold shadow-2xs">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      Intake Review #{activeRequest.id.slice(-4).toUpperCase()}
                    </h3>
                    {getStatusBadge(activeRequest.status)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient consultation verification & confirmation desk
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${patientPhoneInfo?.normalized || activeRequest.phone}`}
                  className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors shadow-2xs"
                  title="Call Patient"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call {activeRequest.phone}</span>
                </a>

                <button
                  onClick={() => setActiveRequest(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto grow">

              {/* Feedback / Validation Messages */}
              {actionSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* SECTION 1: PATIENT DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#007E70]" />
                    Section 1 — Patient Details
                  </h4>

                  {patientPhoneInfo?.isValid ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> WhatsApp Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      <AlertCircle className="w-3 h-3" /> Invalid Number
                    </span>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Patient Name</span>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">{activeRequest.patientName}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Mobile Number</span>
                    <div className="font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                      <span>{activeRequest.phone}</span>
                      <a
                        href={`tel:${patientPhoneInfo?.normalized || activeRequest.phone}`}
                        className="text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 text-[11px] font-bold underline"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>

                  {activeRequest.email && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Email Address</span>
                      <div className="font-medium text-slate-700 mt-0.5">{activeRequest.email}</div>
                    </div>
                  )}

                  {isReqHomeService(activeRequest) && (
                    <div className="sm:col-span-2 p-3 bg-purple-50/80 rounded-xl border border-purple-200">
                      <span className="text-purple-800 text-[10px] font-bold uppercase flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" /> Doorstep Collection Address
                      </span>
                      <div className="font-bold text-slate-900">{activeRequest.address || 'Address provided verbally'}</div>
                      {activeRequest.area && (
                        <div className="text-purple-700 text-[11px] mt-0.5">Landmark / Area: {activeRequest.area}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: REQUEST DETAILS (Original Patient Intent) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#007E70]" />
                  Section 2 — Original Request Details
                </h4>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Booking Type & Service</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {activeRequest.doctorName || activeRequest.serviceName || 'Clinical Consultation'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {activeRequest.requestType === 'DOCTOR' ? 'Doctor Chamber Consultation' : 'Clinical / Diagnostic Service'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Service Delivery Mode</span>
                    <div className="mt-0.5">
                      {isReqHomeService(activeRequest) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-[11px]">
                          <Home className="w-3.5 h-3.5" /> DOORSTEP HOME SERVICE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 font-bold text-[11px]">
                          <Building2 className="w-3.5 h-3.5" /> CLINIC SERVICE
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Patient's Preferred Date</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatAppointmentDate(activeRequest.preferredDate)}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Patient's Preferred Time Window</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {activeRequest.preferredTime}
                    </div>
                  </div>

                  {(activeRequest.patientNotes || activeRequest.reason) && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200/80">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Patient Notes / Symptoms</span>
                      <p className="text-slate-700 italic mt-0.5">
                        "{activeRequest.patientNotes || activeRequest.reason}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: ADMIN CONFIRMATION (Actual Confirmed Slot) */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#007E70]" />
                      Section 3 — Actual Confirmed Appointment (Admin)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enter the actual confirmed clinic slot coordinated with the patient and doctor.
                    </p>
                  </div>
                </div>

                {/* Confirmed Slot Selection Card */}
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Confirmed Date */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-900">
                        Confirmed Date <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={confirmedDate}
                        onChange={(e) => setConfirmedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#007E70] focus:ring-1 focus:ring-[#007E70] focus:outline-none"
                      />
                      {/* Quick Date Chips */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setQuickDate(0)}
                          className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold rounded-md"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(1)}
                          className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold rounded-md"
                        >
                          Tomorrow
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickDate(2)}
                          className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold rounded-md"
                        >
                          In 2 Days
                        </button>
                      </div>
                    </div>

                    {/* Confirmed Time */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-slate-900">
                        Confirmed Time <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={confirmedTime}
                        onChange={(e) => setConfirmedTime(e.target.value)}
                        placeholder="e.g. 05:30 PM"
                        className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#007E70] focus:ring-1 focus:ring-[#007E70] focus:outline-none"
                      />
                      {/* Slot Selector Dropdown */}
                      <div className="pt-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) setConfirmedTime(e.target.value);
                          }}
                          className="w-full px-2 py-1 bg-white border border-teal-200 text-[10px] text-teal-900 font-bold rounded-lg focus:outline-none"
                          value=""
                        >
                          <option value="">⚡ Select standard slot...</option>
                          {standardTimeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Confirmed Doctor */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Confirmed Doctor
                      </label>
                      <select
                        value={confirmedDoctorId}
                        onChange={(e) => setConfirmedDoctorId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                      >
                        <option value="">Select Doctor...</option>
                        {doctors.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} ({getDoctorDepartmentName(doc)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Confirmed Service */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Confirmed Service
                      </label>
                      <select
                        value={confirmedServiceId}
                        onChange={(e) => setConfirmedServiceId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                      >
                        <option value="">Select Service...</option>
                        {services.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} ({srv.serviceType === 'HOME' ? 'Home Service' : 'Clinic'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="space-y-1.5 pt-2 border-t border-teal-200/60">
                    <label className="block text-xs font-bold text-slate-800">
                      Internal Coordinator Notes (Stored in Audit History)
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Spoke to patient on phone, confirmed slot for Chamber 101."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#007E70] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Prominent Confirmed Appointment Card (Summary View) */}
                {activeRequest.status === 'CONFIRMED' && activeRequest.confirmedDate && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Locked Confirmed Slot
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {activeRequest.confirmedBy ? `Confirmed by ${activeRequest.confirmedBy}` : 'Confirmed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-emerald-700/80 text-[10px] uppercase font-bold">Date</span>
                        <div className="font-extrabold text-emerald-950">{formatAppointmentDate(activeRequest.confirmedDate)}</div>
                      </div>
                      <div>
                        <span className="text-emerald-700/80 text-[10px] uppercase font-bold">Time</span>
                        <div className="font-extrabold text-emerald-950">{activeRequest.confirmedTime}</div>
                      </div>
                      <div>
                        <span className="text-emerald-700/80 text-[10px] uppercase font-bold">Doctor / Service</span>
                        <div className="font-extrabold text-emerald-950 truncate">
                          {activeRequest.confirmedDoctorName || activeRequest.confirmedServiceName || activeRequest.doctorName || 'CareOn Specialist'}
                        </div>
                      </div>
                      <div>
                        <span className="text-emerald-700/80 text-[10px] uppercase font-bold">Mode</span>
                        <div className="font-extrabold text-emerald-950">
                          {isReqHomeService(activeRequest) ? '🏠 Doorstep Home' : '🏥 Clinic Chamber'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancellation Dialog Inline (if toggled) */}
              {cancelModalOpen && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Confirm Appointment Cancellation
                  </div>
                  <p className="text-xs text-rose-700">
                    Are you sure you want to cancel this appointment? You will be offered a WhatsApp cancellation notification option.
                  </p>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      Cancellation Reason
                    </label>
                    <input
                      type="text"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="e.g. Patient requested cancellation / Doctor unavailable"
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-bold rounded-lg"
                    >
                      Nevermind
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCancellation}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs"
                    >
                      Confirm Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* SECTION 4: ACTIONS (Bottom Fixed Toolbar) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Left Actions: Call & Cancel */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${patientPhoneInfo?.normalized || activeRequest.phone}`}
                  className="py-2.5 px-3.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-colors shadow-2xs cursor-pointer min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>Call Patient</span>
                </a>

                {activeRequest.status !== 'CANCELLED' && !cancelModalOpen && (
                  <button
                    type="button"
                    onClick={() => setCancelModalOpen(true)}
                    className="py-2.5 px-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors min-h-[44px] cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>

              {/* Right Actions: Workflow Transitions */}
              <div className="flex flex-wrap items-center gap-2">
                {activeRequest.status === 'NEW' && (
                  <button
                    type="button"
                    onClick={handleMarkContacted}
                    className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer min-h-[44px]"
                  >
                    Mark Contacted
                  </button>
                )}

                {activeRequest.status === 'CONFIRMED' && (
                  <>
                    <button
                      type="button"
                      onClick={handleReschedule}
                      className="py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer min-h-[44px] flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppPreview('CONFIRMATION')}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer min-h-[44px] flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Confirm via WhatsApp</span>
                    </button>
                  </>
                )}

                {activeRequest.status !== 'CONFIRMED' && (
                  <button
                    type="button"
                    onClick={handleConfirmAppointment}
                    className="py-2.5 px-5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Appointment</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveGeneralChanges}
                  className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors min-h-[44px] cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WHATSAPP CONFIRMATION PREVIEW MODAL (Full Admin Preview & Manual Control) */}
      {/* ========================================================================= */}
      {whatsAppModalOpen && activeRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
            
            {/* WhatsApp Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    WhatsApp Message Preview
                  </h3>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Review and edit message before opening WhatsApp Click-to-Chat
                  </p>
                </div>
              </div>

              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto grow">

              {/* Recipient Number Verification Banner */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Recipient Patient</span>
                  <div className="font-extrabold text-slate-900 text-sm">{activeRequest.patientName}</div>
                  <div className="text-xs font-bold text-teal-800 mt-0.5">
                    {patientPhoneInfo?.display || activeRequest.phone}
                  </div>
                </div>

                <div>
                  {patientPhoneInfo?.isValid ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-xl inline-flex items-center gap-1 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Valid WhatsApp Number
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[11px] font-extrabold rounded-xl inline-flex items-center gap-1 border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Invalid Mobile
                    </span>
                  )}
                </div>
              </div>

              {!patientPhoneInfo?.isValid && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Valid patient mobile number required for WhatsApp confirmation.</span>
                </div>
              )}

              {/* Message Controls (Language & Message Type) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700">Language:</span>
                  <div className="inline-flex rounded-xl p-0.5 bg-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setWhatsAppLang('en')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        whatsAppLang === 'en'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatsAppLang('bn')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        whatsAppLang === 'bn'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      বাংলা (Bengali)
                    </button>
                  </div>
                </div>

                {/* Message Type Selector */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Template:</span>
                  <select
                    value={whatsAppMessageType}
                    onChange={(e) => setWhatsAppMessageType(e.target.value as WhatsAppMessageType)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="CONFIRMATION">Standard Confirmation</option>
                    <option value="RESCHEDULE">Rescheduled Notification</option>
                    <option value="CANCELLATION">Cancellation Notification</option>
                  </select>
                </div>
              </div>

              {/* Editable WhatsApp Text Preview Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    Exact Message Text (Editable by Admin)
                  </label>

                  <button
                    type="button"
                    onClick={handleCopyWhatsAppText}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={12}
                    value={whatsAppCustomText}
                    onChange={(e) => setWhatsAppCustomText(e.target.value)}
                    className="w-full p-4 bg-slate-900 text-emerald-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* Workflow Notice */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Operator Manual Verification Step:
                </div>
                <p>
                  Clicking <strong>"Open WhatsApp"</strong> will launch WhatsApp Click-to-Chat with this message pre-filled. You can review the message inside WhatsApp and manually press send.
                </p>
              </div>

            </div>

            {/* WhatsApp Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setWhatsAppModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                Close Preview
              </button>

              <button
                type="button"
                disabled={!patientPhoneInfo?.isValid}
                onClick={handleLaunchWhatsApp}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
