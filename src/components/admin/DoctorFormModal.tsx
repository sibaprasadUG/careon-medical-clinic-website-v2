import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Doctor,
  DoctorScheduleItem,
  DoctorWeeklyScheduleSlot,
  DoctorCustomSchedule,
  DoctorScheduleException,
  DayOfWeek,
  MediaAsset,
  MonthlyOccurrence
} from '../../types';
import {
  CAREON_DEPARTMENTS,
  CAREON_SERVICES,
  DOCTOR_TYPES,
  GENDER_OPTIONS,
  APPOINTMENT_DURATIONS,
  BUFFER_TIMES,
  UNAVAILABLE_REASONS,
  TIME_PRESETS,
  ClinicDepartment,
  ClinicService
} from '../../data/doctorManagementConstants';
import { MediaPickerModal } from './MediaPickerModal';
import { CareOnDoctorFallback, DoctorPhoto } from '../common/CareOnMedia';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Check,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Award,
  ShieldCheck,
  Eye,
  Sliders,
  User,
  Folder,
  CalendarDays,
  CalendarRange,
  Ban,
  PhoneCall,
  Activity,
  Layers
} from 'lucide-react';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Partial<Doctor>) => void;
  initialData?: Partial<Doctor> | null;
}

type FormTab = 'basic' | 'services' | 'fees' | 'schedule' | 'settings';
type ScheduleSubTab = 'weekly' | 'alternate' | 'monthly' | 'custom' | 'unavailable';

interface WeeklySlotForm {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

interface AlternateScheduleForm {
  id: string;
  day: DayOfWeek;
  frequency: 'EVERY_2_WEEKS' | 'WEEKS_1_3' | 'WEEKS_2_4';
  startDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

interface MonthlyScheduleForm {
  id: string;
  occurrence: MonthlyOccurrence;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber: string;
}

interface CustomDateForm {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  roomNumber: string;
}

interface UnavailableExceptionForm {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes: string;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [activeScheduleTab, setActiveScheduleTab] = useState<ScheduleSubTab>('weekly');
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');

  // 1. Basic Information
  const [name, setName] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoAssetId, setPhotoAssetId] = useState<string>('');
  const [gender, setGender] = useState<string>('MALE');
  const [departmentId, setDepartmentId] = useState<string>('dept-cardio');
  const [departmentName, setDepartmentName] = useState<string>('Cardiology');
  const [designation, setDesignation] = useState<string>('Consultant');
  const [doctorType, setDoctorType] = useState<string>('Visiting Consultant');
  const [qualification, setQualification] = useState<string>('MBBS, MD');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [experienceYears, setExperienceYears] = useState<string>('10');
  const [shortBio, setShortBio] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [active, setActive] = useState<boolean>(true);

  // 2. Services
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState<boolean>(false);

  // 3. Consultation Fees (₹ INR)
  const [consultationFee, setConsultationFee] = useState<string>('500');
  const [followUpFee, setFollowUpFee] = useState<string>('300');
  const [emergencyFee, setEmergencyFee] = useState<string>('800');
  const [telemedicineFee, setTelemedicineFee] = useState<string>('400');
  const [otherServiceFee, setOtherServiceFee] = useState<string>('');

  // 4. Schedules
  const [chamberId, setChamberId] = useState<string>('CareOn Medical Clinic');
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySlotForm[]>([
    {
      id: 'slot-1',
      day: 'Saturday',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      roomNumber: 'CareOn Medical Clinic'
    }
  ]);
  const [alternateSchedules, setAlternateSchedules] = useState<AlternateScheduleForm[]>([]);
  const [monthlySchedules, setMonthlySchedules] = useState<MonthlyScheduleForm[]>([]);
  const [customDates, setCustomDates] = useState<CustomDateForm[]>([]);
  const [unavailableExceptions, setUnavailableExceptions] = useState<UnavailableExceptionForm[]>([]);

  // 5. Appointment Slot Settings
  const [appointmentDuration, setAppointmentDuration] = useState<number>(30);
  const [bufferTime, setBufferTime] = useState<number>(0);
  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState<string>('20');
  const [appointmentEnabled, setAppointmentEnabled] = useState<boolean>(true);

  // Modals & Dropdown state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Hidden file input for native photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Esc to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMediaPickerOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMediaPickerOpen, onClose]);

  // Load initialData when opening or switching doctor
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setNameBn(initialData.nameBn || '');
      setPhotoUrl(initialData.photoUrl || initialData.profilePhotoUrl || '');
      setPhotoAssetId(initialData.photoAssetId || initialData.profilePhotoAssetId || '');
      setGender(initialData.gender || 'MALE');

      // Resolve department
      const existingDeptId = initialData.departmentId || 'dept-cardio';
      setDepartmentId(existingDeptId);
      const matchedDept = CAREON_DEPARTMENTS.find(
        (d) => d.id === existingDeptId || d.name.toLowerCase() === (initialData.departmentName || '').toLowerCase()
      );
      setDepartmentName(matchedDept ? matchedDept.name : initialData.departmentName || 'Cardiology');

      setDesignation(initialData.designation || initialData.specialtyId || 'Consultant');
      setDoctorType(initialData.doctorType || 'Visiting Consultant');
      setQualification(initialData.qualification || 'MBBS, MD');
      setRegistrationNumber(initialData.registrationNumber || '');
      setExperienceYears(initialData.experienceYears ? String(initialData.experienceYears) : '10');
      setShortBio(initialData.shortBio || '');
      setDisplayOrder(typeof initialData.displayOrder === 'number' ? initialData.displayOrder : 1);
      setActive(initialData.active !== undefined ? initialData.active : initialData.status !== 'INACTIVE');

      // Services
      setSelectedServiceIds(initialData.serviceIds || []);

      // Fees
      const newFee = initialData.consultationFee ?? initialData.fees?.newPatient;
      setConsultationFee(newFee !== undefined ? String(newFee) : '');
      const followFee = initialData.followUpFee ?? initialData.fees?.followUp;
      setFollowUpFee(followFee !== undefined ? String(followFee) : '');
      const emerFee = initialData.emergencyFee ?? initialData.fees?.emergency;
      setEmergencyFee(emerFee !== undefined ? String(emerFee) : '');
      const teleFee = initialData.telemedicineFee ?? initialData.fees?.telemedicine;
      setTelemedicineFee(teleFee !== undefined ? String(teleFee) : '');
      const othFee = initialData.otherServiceFee ?? initialData.fees?.other;
      setOtherServiceFee(othFee !== undefined ? String(othFee) : '');

      // Schedules
      const chamber = initialData.chamberId || initialData.chamberCustom || initialData.roomNumber || 'CareOn Medical Clinic';
      setChamberId(chamber);

      if (Array.isArray(initialData.schedules) && initialData.schedules.length > 0) {
        setWeeklySchedules(
          initialData.schedules.map((s, idx) => ({
            id: s.id || `slot-${idx + 1}`,
            day: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            roomNumber: chamber
          }))
        );
      } else if (Array.isArray(initialData.weeklySchedule) && initialData.weeklySchedule.length > 0) {
        setWeeklySchedules(
          initialData.weeklySchedule
            .filter((w) => w.isActive)
            .map((w, idx) => ({
              id: `slot-${idx + 1}`,
              day: w.day,
              startTime: w.startTime || '10:30 AM',
              endTime: w.endTime || '11:30 AM',
              roomNumber: w.roomNumber || chamber
            }))
        );
      } else {
        setWeeklySchedules([
          {
            id: 'slot-1',
            day: 'Saturday',
            startTime: '10:30 AM',
            endTime: '11:30 AM',
            roomNumber: chamber
          }
        ]);
      }

      // Custom Schedules (Alternate, Monthly, Custom dates)
      if (Array.isArray(initialData.customSchedules)) {
        const alt: AlternateScheduleForm[] = [];
        const mon: MonthlyScheduleForm[] = [];
        const cust: CustomDateForm[] = [];

        initialData.customSchedules.forEach((cs, i) => {
          const type = (cs.recurrenceType || cs.scheduleType) as string;
          if (type === 'ALTERNATE_WEEK' || type === 'EVERY_15_DAYS' || type === 'INTERVAL_DAYS') {
            alt.push({
              id: cs.id || `alt-${i}`,
              day: cs.dayOfWeek || 'Saturday',
              frequency: 'EVERY_2_WEEKS',
              startDate: cs.startDate || cs.effectiveFrom || '',
              startTime: cs.startTime || '10:00 AM',
              endTime: cs.endTime || '01:00 PM',
              roomNumber: cs.chamber || chamber
            });
          } else if (type === 'MONTHLY') {
            mon.push({
              id: cs.id || `mon-${i}`,
              occurrence: cs.monthlyOccurrence || 'SECOND',
              day: cs.monthlyDayOfWeek || cs.dayOfWeek || 'Saturday',
              startTime: cs.startTime || '10:30 AM',
              endTime: cs.endTime || '11:30 AM',
              roomNumber: cs.chamber || chamber
            });
          } else if (type === 'SPECIFIC_DATE' || type === 'SPECIAL_CHAMBER') {
            cust.push({
              id: cs.id || `cust-${i}`,
              date: cs.specificDate || '',
              startTime: cs.startTime || '05:00 PM',
              endTime: cs.endTime || '08:00 PM',
              title: cs.title || 'Special Consultation',
              roomNumber: cs.chamber || chamber
            });
          }
        });

        setAlternateSchedules(alt);
        setMonthlySchedules(mon);
        setCustomDates(cust);
      }

      // Unavailable exceptions
      if (Array.isArray(initialData.scheduleExceptions)) {
        setUnavailableExceptions(
          initialData.scheduleExceptions.map((ex, i) => ({
            id: ex.id || `unavail-${i}`,
            startDate: ex.date || '',
            endDate: (ex as any).endDate || ex.date || '',
            reason: ex.reason || 'Doctor on Leave',
            notes: ex.note || ''
          }))
        );
      }

      // Slot Settings
      setAppointmentDuration(initialData.appointmentDuration || 30);
      setBufferTime(initialData.bufferTime ?? 0);
      setMaxAppointmentsPerSlot(
        initialData.maxAppointmentsPerSlot !== undefined ? String(initialData.maxAppointmentsPerSlot) : '20'
      );
      setAppointmentEnabled(initialData.appointmentEnabled !== false);
    } else {
      // Default new doctor state
      setName('');
      setNameBn('');
      setPhotoUrl('');
      setPhotoAssetId('');
      setGender('MALE');
      setDepartmentId('dept-cardio');
      setDepartmentName('Cardiology');
      setDesignation('Consultant Cardiologist');
      setDoctorType('Visiting Consultant');
      setQualification('MBBS, MD');
      setRegistrationNumber('');
      setExperienceYears('10');
      setShortBio('');
      setDisplayOrder(1);
      setActive(true);

      setSelectedServiceIds(['srv-cardio-consult', 'srv-spec-consult']);
      setConsultationFee('500');
      setFollowUpFee('300');
      setEmergencyFee('800');
      setTelemedicineFee('400');
      setOtherServiceFee('');

      setChamberId('CareOn Medical Clinic');
      setWeeklySchedules([
        {
          id: 'slot-1',
          day: 'Saturday',
          startTime: '10:30 AM',
          endTime: '11:30 AM',
          roomNumber: 'CareOn Medical Clinic'
        }
      ]);
      setAlternateSchedules([]);
      setMonthlySchedules([]);
      setCustomDates([]);
      setUnavailableExceptions([]);

      setAppointmentDuration(30);
      setBufferTime(0);
      setMaxAppointmentsPerSlot('20');
      setAppointmentEnabled(true);
    }
    setValidationError(null);
    setActiveTab('basic');
    setMobileView('form');
  }, [initialData, isOpen]);

  // Filtered departments for searchable dropdown
  const filteredDepartments = useMemo(() => {
    if (!deptSearchQuery.trim()) return CAREON_DEPARTMENTS;
    const q = deptSearchQuery.toLowerCase().trim();
    return CAREON_DEPARTMENTS.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        (dept.nameBn && dept.nameBn.includes(q)) ||
        dept.category.toLowerCase().includes(q) ||
        dept.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [deptSearchQuery]);

  // Selected department object
  const currentDept = useMemo(() => {
    return (
      CAREON_DEPARTMENTS.find((d) => d.id === departmentId || d.name.toLowerCase() === departmentName.toLowerCase()) ||
      CAREON_DEPARTMENTS[0]
    );
  }, [departmentId, departmentName]);

  // Filtered services for multi-select
  const filteredServices = useMemo(() => {
    if (!serviceSearchQuery.trim()) return CAREON_SERVICES;
    const q = serviceSearchQuery.toLowerCase().trim();
    return CAREON_SERVICES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [serviceSearchQuery]);

  // Selected service objects
  const selectedServices = useMemo(() => {
    return CAREON_SERVICES.filter((s) => selectedServiceIds.includes(s.id));
  }, [selectedServiceIds]);

  // Handle department selection
  const handleSelectDepartment = (dept: ClinicDepartment) => {
    setDepartmentId(dept.id);
    setDepartmentName(dept.name);
    setIsDeptDropdownOpen(false);
    setDeptSearchQuery('');

    // If services list is empty, pre-select relevant consultation
    if (selectedServiceIds.length === 0) {
      const match = CAREON_SERVICES.find((s) =>
        s.name.toLowerCase().includes(dept.name.toLowerCase().split(' ')[0])
      );
      if (match) {
        setSelectedServiceIds([match.id, 'srv-gen-consult']);
      }
    }
  };

  // Toggle service selection
  const handleToggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServiceIds((prev) => prev.filter((id) => id !== serviceId));
  };

  // Native file upload handler (FileReader -> Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoAssetId('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Weekly Schedule Slot management
  const handleAddWeeklySlot = () => {
    const newId = `slot-${Date.now()}`;
    setWeeklySchedules((prev) => [
      ...prev,
      {
        id: newId,
        day: 'Saturday',
        startTime: '05:00 PM',
        endTime: '08:00 PM',
        roomNumber: chamberId || 'CareOn Medical Clinic'
      }
    ]);
  };

  const handleUpdateWeeklySlot = (id: string, field: keyof WeeklySlotForm, value: any) => {
    setWeeklySchedules((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  const handleRemoveWeeklySlot = (id: string) => {
    setWeeklySchedules((prev) => prev.filter((slot) => slot.id !== id));
  };

  // Alternate Schedule management
  const handleAddAlternateSchedule = () => {
    const newId = `alt-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    setAlternateSchedules((prev) => [
      ...prev,
      {
        id: newId,
        day: 'Saturday',
        frequency: 'EVERY_2_WEEKS',
        startDate: todayStr,
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        roomNumber: chamberId || 'CareOn Medical Clinic'
      }
    ]);
  };

  const handleRemoveAlternateSchedule = (id: string) => {
    setAlternateSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Monthly Schedule management
  const handleAddMonthlySchedule = () => {
    const newId = `mon-${Date.now()}`;
    setMonthlySchedules((prev) => [
      ...prev,
      {
        id: newId,
        occurrence: 'SECOND',
        day: 'Saturday',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        roomNumber: chamberId || 'CareOn Medical Clinic'
      }
    ]);
  };

  const handleRemoveMonthlySchedule = (id: string) => {
    setMonthlySchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Custom Dates management
  const handleAddCustomDate = () => {
    const newId = `cust-${Date.now()}`;
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];
    setCustomDates((prev) => [
      ...prev,
      {
        id: newId,
        date: dateStr,
        startTime: '05:00 PM',
        endTime: '08:00 PM',
        title: 'Special Consultation',
        roomNumber: chamberId || 'CareOn Medical Clinic'
      }
    ]);
  };

  const handleRemoveCustomDate = (id: string) => {
    setCustomDates((prev) => prev.filter((c) => c.id !== id));
  };

  // Unavailable Exceptions management
  const handleAddUnavailable = () => {
    const newId = `unavail-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    setUnavailableExceptions((prev) => [
      ...prev,
      {
        id: newId,
        startDate: today,
        endDate: today,
        reason: 'Doctor on Annual Leave',
        notes: 'Chamber closed during this duration'
      }
    ]);
  };

  const handleRemoveUnavailable = (id: string) => {
    setUnavailableExceptions((prev) => prev.filter((u) => u.id !== id));
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Mandatory Fields
    if (!name.trim()) {
      setValidationError('Doctor Name is required.');
      setActiveTab('basic');
      return;
    }
    if (!departmentName.trim()) {
      setValidationError('Medical Department is required.');
      setActiveTab('basic');
      return;
    }
    if (!designation.trim()) {
      setValidationError('Specialty / Designation is required.');
      setActiveTab('basic');
      return;
    }
    if (!qualification.trim()) {
      setValidationError('Doctor Qualification is required.');
      setActiveTab('basic');
      return;
    }

    // 2. Numeric fee checks (no negative values)
    const feeNum = consultationFee !== '' ? Number(consultationFee) : 0;
    const followNum = followUpFee !== '' ? Number(followUpFee) : 0;
    const emerNum = emergencyFee !== '' ? Number(emergencyFee) : 0;
    const teleNum = telemedicineFee !== '' ? Number(telemedicineFee) : 0;

    if (feeNum < 0 || followNum < 0 || emerNum < 0 || teleNum < 0) {
      setValidationError('Consultation fees cannot be negative.');
      setActiveTab('fees');
      return;
    }

    // 3. Construct clean CustomSchedules
    const convertedCustomSchedules: DoctorCustomSchedule[] = [
      ...alternateSchedules.map((alt) => ({
        id: alt.id,
        recurrenceType: 'INTERVAL_DAYS' as const,
        scheduleType: 'INTERVAL_DAYS' as const,
        dayOfWeek: alt.day,
        startDate: alt.startDate,
        intervalDays: alt.frequency === 'EVERY_2_WEEKS' ? 14 : 7,
        startTime: alt.startTime,
        endTime: alt.endTime,
        chamber: alt.roomNumber || chamberId,
        status: 'ACTIVE' as const
      })),
      ...monthlySchedules.map((mon) => ({
        id: mon.id,
        recurrenceType: 'MONTHLY' as const,
        scheduleType: 'MONTHLY' as const,
        monthlyOccurrence: mon.occurrence,
        monthlyDayOfWeek: mon.day,
        dayOfWeek: mon.day,
        startTime: mon.startTime,
        endTime: mon.endTime,
        chamber: mon.roomNumber || chamberId,
        status: 'ACTIVE' as const
      })),
      ...customDates.map((cd) => ({
        id: cd.id,
        recurrenceType: 'SPECIFIC_DATE' as const,
        scheduleType: 'SPECIFIC_DATE' as const,
        specificDate: cd.date,
        title: cd.title,
        startTime: cd.startTime,
        endTime: cd.endTime,
        chamber: cd.roomNumber || chamberId,
        status: 'ACTIVE' as const
      }))
    ];

    // 4. Construct clean Exceptions
    const convertedExceptions: DoctorScheduleException[] = unavailableExceptions.map((ex) => ({
      id: ex.id,
      date: ex.startDate,
      exceptionType: 'NOT_AVAILABLE' as const,
      reason: `${ex.reason}${ex.startDate !== ex.endDate ? ` (${ex.startDate} to ${ex.endDate})` : ''}`,
      note: ex.notes
    }));

    // 5. Construct final Doctor Payload
    const payload: Partial<Doctor> = {
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      profilePhotoUrl: photoUrl.trim() || undefined,
      photoAssetId: photoAssetId || undefined,
      profilePhotoAssetId: photoAssetId || undefined,
      gender: gender as 'MALE' | 'FEMALE' | 'OTHER',
      departmentId: departmentId || currentDept.id,
      departmentName: departmentName || currentDept.name,
      designation: designation.trim(),
      doctorType: doctorType.trim(),
      qualification: qualification.trim(),
      registrationNumber: registrationNumber.trim() || undefined,
      experienceYears: experienceYears ? String(experienceYears) : undefined,
      shortBio: shortBio.trim() || undefined,
      serviceIds: selectedServiceIds,
      serviceNames: selectedServices.map((s) => s.name),
      consultationFee: consultationFee !== '' ? Number(consultationFee) : undefined,
      followUpFee: followUpFee !== '' ? Number(followUpFee) : undefined,
      emergencyFee: emergencyFee !== '' ? Number(emergencyFee) : undefined,
      telemedicineFee: telemedicineFee !== '' ? Number(telemedicineFee) : undefined,
      otherServiceFee: otherServiceFee !== '' ? Number(otherServiceFee) : undefined,
      fees: {
        newPatient: consultationFee !== '' ? Number(consultationFee) : undefined,
        followUp: followUpFee !== '' ? Number(followUpFee) : undefined,
        emergency: emergencyFee !== '' ? Number(emergencyFee) : undefined,
        telemedicine: telemedicineFee !== '' ? Number(telemedicineFee) : undefined,
        other: otherServiceFee !== '' ? Number(otherServiceFee) : undefined
      },
      chamberId: chamberId.trim() || 'CareOn Medical Clinic',
      chamberCustom: chamberId.trim() || 'CareOn Medical Clinic',
      schedules: weeklySchedules.map((w) => ({
        id: w.id,
        day: w.day,
        startTime: w.startTime,
        endTime: w.endTime
      })),
      weeklySchedule: weeklySchedules.map((w) => ({
        day: w.day,
        startTime: w.startTime,
        endTime: w.endTime,
        roomNumber: w.roomNumber || chamberId || 'CareOn Medical Clinic',
        isActive: true
      })),
      consultationDays: Array.from(new Set(weeklySchedules.map((w) => w.day))),
      consultationTime:
        weeklySchedules.length > 0
          ? `${weeklySchedules[0].startTime} – ${weeklySchedules[0].endTime}`
          : 'By Appointment',
      customSchedules: convertedCustomSchedules,
      scheduleExceptions: convertedExceptions,
      appointmentDuration: Number(appointmentDuration) || 30,
      bufferTime: Number(bufferTime) || 0,
      maxAppointmentsPerSlot: maxAppointmentsPerSlot ? Number(maxAppointmentsPerSlot) : undefined,
      appointmentEnabled,
      active,
      status: active ? 'ACTIVE' : 'INACTIVE',
      displayOrder: Number(displayOrder) || 1
    };

    setIsSaving(true);
    try {
      onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Temporary mock doctor object for live preview
  const previewDoctor: Doctor = {
    id: initialData?.id || 'preview-doc',
    name: name.trim() || 'DR. DEBDUTTA NAYAK',
    nameBn: nameBn.trim() || '',
    slug: (name || 'doctor-preview')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-'),
    photoUrl: photoUrl || '',
    profilePhotoUrl: photoUrl || '',
    departmentId: departmentId || 'dept-cardio',
    departmentName: departmentName || 'Cardiology',
    designation: designation.trim() || 'Consultant Cardiologist',
    doctorType: doctorType || 'Visiting Consultant',
    qualification: qualification.trim() || 'MBBS, MD',
    registrationNumber: registrationNumber.trim() || '1666',
    experienceYears: experienceYears || '10',
    shortBio: shortBio.trim() || 'Specialized in adult cardiovascular health, echocardiography, and preventive care.',
    consultationFee: consultationFee !== '' ? Number(consultationFee) : 500,
    followUpFee: followUpFee !== '' ? Number(followUpFee) : 300,
    telemedicineFee: telemedicineFee !== '' ? Number(telemedicineFee) : 400,
    emergencyFee: emergencyFee !== '' ? Number(emergencyFee) : 800,
    fees: {
      newPatient: consultationFee !== '' ? Number(consultationFee) : 500,
      followUp: followUpFee !== '' ? Number(followUpFee) : 300,
      telemedicine: telemedicineFee !== '' ? Number(telemedicineFee) : 400,
      emergency: emergencyFee !== '' ? Number(emergencyFee) : 800
    },
    schedules: weeklySchedules.map((w) => ({
      id: w.id,
      day: w.day,
      startTime: w.startTime,
      endTime: w.endTime
    })),
    chamberId: chamberId || 'CareOn Medical Clinic',
    chamberCustom: chamberId || 'CareOn Medical Clinic',
    serviceIds: selectedServiceIds,
    active,
    status: active ? 'ACTIVE' : 'INACTIVE',
    displayOrder: Number(displayOrder) || 1,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-7xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP MODAL BAR: Medical ERP Corporate Header */}
        <div className="px-5 sm:px-8 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 via-white to-teal-50/40 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#007E70]/10 border border-[#007E70]/20 flex items-center justify-center text-[#007E70] shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                  {initialData?.id ? `Edit Doctor — ${name || initialData.name}` : 'Add New Doctor Profile'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#007E70] border border-teal-200">
                  Doctor ERP Module
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {active ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  <span>{active ? 'Profile Active' : 'Profile Inactive'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                CareOn Medical Clinic • Production Supabase PostgreSQL Directory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile View Switcher (Visible only on small screens) */}
            <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMobileView('form')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  mobileView === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Form
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  mobileView === 'preview' ? 'bg-white text-[#007E70] shadow-xs' : 'text-slate-600'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VALIDATION ALERT BANNER */}
        {validationError && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* DESKTOP 2-COLUMN MAIN BODY */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* LEFT COLUMN: Multi-Section Form (lg:col-span-7 or 8) */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col border-r border-slate-200 overflow-y-auto ${
              mobileView === 'preview' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Form Section Navigation Tabs */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs px-4 sm:px-6 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'basic'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Basic Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>2. Services ({selectedServiceIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fees')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="font-mono text-xs font-bold">₹</span>
                <span>3. Consultation Fees</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>4. Schedule ({weeklySchedules.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>5. Slot Settings</span>
              </button>
            </div>

            {/* Form Content Area */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 flex-1">
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Doctor Demographics & Credentials</h3>
                      <p className="text-xs text-slate-500">Core doctor identity, medical qualifications, and photo</p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">* Required fields</span>
                  </div>

                  {/* Photo Upload & Preview Card */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-28 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md shrink-0 relative group">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt="Doctor Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CareOnDoctorFallback
                          doctor={previewDoctor}
                          className="w-full h-full"
                        />
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Doctor Profile Photo</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload high-resolution clinical portrait or select from media library.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#007E70]" />
                          <span>Upload File</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                          <span>Media Library</span>
                        </button>

                        {photoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoUrl('');
                              setPhotoAssetId('');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Photo URL direct entry */}
                      <div className="pt-1">
                        <input
                          type="text"
                          value={photoUrl}
                          onChange={(e) => setPhotoUrl(e.target.value)}
                          placeholder="Or paste image HTTPS URL directly..."
                          className="w-full text-xs px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#007E70]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name & Gender Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Doctor Name */}
                    <div className="sm:col-span-8 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>Doctor Name *</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. DR. DEBDUTTA NAYAK"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                      <p className="text-[11px] text-slate-400">
                        Preserves entered casing for official medical directory.
                      </p>
                    </div>

                    {/* Gender */}
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      >
                        {GENDER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bengali Name (optional) */}
                    <div className="sm:col-span-6 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Bengali Name (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={nameBn}
                        onChange={(e) => setNameBn(e.target.value)}
                        placeholder="e.g. ডাঃ দেবদত্ত নায়ক"
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>

                    {/* Doctor Type */}
                    <div className="sm:col-span-6 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Doctor Type</label>
                      <select
                        value={doctorType}
                        onChange={(e) => setDoctorType(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      >
                        {DOCTOR_TYPES.map((dt) => (
                          <option key={dt} value={dt}>
                            {dt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Department & Specialty Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Searchable Department Dropdown */}
                    <div className="sm:col-span-6 space-y-1.5 relative" ref={deptRef}>
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Medical Department *</span>
                        <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                          Searchable
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 flex items-center justify-between font-semibold hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-[#007E70]" />
                          <span className="truncate">{departmentName || currentDept.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDeptDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-72 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={deptSearchQuery}
                                onChange={(e) => setDeptSearchQuery(e.target.value)}
                                placeholder="Search departments (e.g. Cardiology, Ortho)..."
                                autoFocus
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#007E70]"
                              />
                            </div>
                          </div>

                          <div className="overflow-y-auto flex-1 p-1.5 divide-y divide-slate-50">
                            {filteredDepartments.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">
                                No matching departments found.
                              </div>
                            ) : (
                              filteredDepartments.map((dept) => {
                                const isSelected = departmentId === dept.id || departmentName === dept.name;
                                return (
                                  <button
                                    key={dept.id}
                                    type="button"
                                    onClick={() => handleSelectDepartment(dept)}
                                    className={`w-full px-3 py-2 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                                      isSelected
                                        ? 'bg-teal-50 text-[#007E70] font-bold'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <div>
                                      <span className="font-semibold">{dept.name}</span>
                                      {dept.nameBn && (
                                        <span className="text-[10px] text-slate-400 ml-1.5">
                                          ({dept.nameBn})
                                        </span>
                                      )}
                                      <span className="block text-[10px] text-slate-400 mt-0.5">
                                        {dept.category}
                                      </span>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#007E70] shrink-0" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Specialty / Designation */}
                    <div className="sm:col-span-6 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Specialty / Designation *
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Consultant Cardiologist, Interventional Specialist"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>
                  </div>

                  {/* Qualification, Reg No & Experience Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Qualification */}
                    <div className="sm:col-span-5 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Medical Qualification *
                      </label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. MBBS, MD, MS, DNB"
                        required
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>

                    {/* Registration Number */}
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#007E70]" />
                        <span>Medical Reg. No.</span>
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. 1666"
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>

                    {/* Experience Years */}
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">Experience (Yrs)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="10"
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>
                  </div>

                  {/* Professional Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Short Professional Bio / Clinical Background
                    </label>
                    <textarea
                      rows={3}
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value)}
                      placeholder="Enter a brief background regarding clinical focus, areas of expertise, and consulting experience..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                    />
                  </div>

                  {/* Display Order & Active Switch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Display Order / Sorting Priority
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                        className="w-32 px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-semibold"
                      />
                      <p className="text-[11px] text-slate-400">Lower numbers appear first.</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Profile Status
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {active ? 'Visible on public site' : 'Hidden from public directory'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActive(!active)}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          active ? 'bg-[#007E70]' : 'bg-slate-300'
                        }`}
                        aria-label="Toggle profile status"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                            active ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SERVICES MAPPING */}
              {activeTab === 'services' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Clinical Services Association</h3>
                      <p className="text-xs text-slate-500">
                        Associate this physician with clinical consultation categories and diagnostic services
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#007E70] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {selectedServiceIds.length} Selected
                    </span>
                  </div>

                  {/* Selected Services Tags Container */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Selected Service Badges
                      </span>
                      {selectedServiceIds.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedServiceIds([])}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {selectedServices.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No services selected yet. Pick from the catalog below.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                          <span
                            key={service.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-teal-800 text-xs font-bold rounded-xl border border-teal-200 shadow-2xs"
                          >
                            <span>{service.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(service.id)}
                              className="hover:text-rose-600 rounded p-0.5"
                              title="Remove service"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Searchable Service Selector */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        placeholder="Filter clinical services (e.g. Consultation, ECG, Ultrasound, Blood Tests)..."
                        className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 focus:border-[#007E70]"
                      />
                    </div>

                    <div className="max-h-80 overflow-y-auto rounded-2xl border border-slate-200 p-2 bg-white grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredServices.map((service) => {
                        const isSelected = selectedServiceIds.includes(service.id);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => handleToggleService(service.id)}
                            className={`px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border-teal-300 text-teal-900 font-bold shadow-2xs'
                                : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="block truncate">{service.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {service.category}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#007E70] text-white' : 'border border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONSULTATION FEES (₹ INR) */}
              {activeTab === 'fees' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Consultation Fee Schedule (₹ INR)</h3>
                      <p className="text-xs text-slate-500">
                        Configure professional charges for clinic chambers, follow-ups, and telemedicine
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">All fees in Indian Rupee (₹)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Patient Consultation Fee */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                      <label className="text-xs font-bold text-teal-900 flex items-center justify-between">
                        <span>New Patient Consultation Fee</span>
                        <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                          Primary Fee
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={consultationFee}
                          onChange={(e) => setConsultationFee(e.target.value)}
                          placeholder="500"
                          className="w-full pl-8 pr-3.5 py-2 text-sm bg-white rounded-xl border border-teal-300 text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                        />
                      </div>
                      <p className="text-[11px] text-teal-800">
                        Displayed on public doctor cards and appointment checkout.
                      </p>
                    </div>

                    {/* Follow-up Consultation Fee */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800">
                        Follow-up Consultation Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={followUpFee}
                          onChange={(e) => setFollowUpFee(e.target.value)}
                          placeholder="300"
                          className="w-full pl-8 pr-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Applicable for repeat checkups within clinic validity window.
                      </p>
                    </div>

                    {/* Emergency Consultation Fee */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800">
                        Emergency / Urgent Consultation Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={emergencyFee}
                          onChange={(e) => setEmergencyFee(e.target.value)}
                          placeholder="800"
                          className="w-full pl-8 pr-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Special out-of-turn or urgent evening chamber fee.
                      </p>
                    </div>

                    {/* Telemedicine Consultation Fee */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800">
                        Telemedicine / Online Video Fee
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={telemedicineFee}
                          onChange={(e) => setTelemedicineFee(e.target.value)}
                          placeholder="400"
                          className="w-full pl-8 pr-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        For patients consulting via CareOn Teleconsultation link.
                      </p>
                    </div>
                  </div>

                  {/* Other / Procedure Fee */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="text-xs font-bold text-slate-800">
                      Other / Minor Procedure Fee (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={otherServiceFee}
                        onChange={(e) => setOtherServiceFee(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full pl-8 pr-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: ADVANCED CONSULTATION SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Advanced Visiting Schedule</h3>
                      <p className="text-xs text-slate-500">
                        Supports fixed weekly chambers, alternate-week visits, monthly recurrence, and custom dates
                      </p>
                    </div>

                    {/* Schedule Sub-mode Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setActiveScheduleTab('weekly')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          activeScheduleTab === 'weekly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Weekly ({weeklySchedules.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScheduleTab('alternate')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          activeScheduleTab === 'alternate' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Alternate ({alternateSchedules.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScheduleTab('monthly')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          activeScheduleTab === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Monthly ({monthlySchedules.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScheduleTab('custom')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                          activeScheduleTab === 'custom' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Dates ({customDates.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScheduleTab('unavailable')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap text-rose-600 ${
                          activeScheduleTab === 'unavailable' ? 'bg-white shadow-2xs' : ''
                        }`}
                      >
                        Leave ({unavailableExceptions.length})
                      </button>
                    </div>
                  </div>

                  {/* Chamber Location Field */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#007E70] shrink-0" />
                      <span className="text-xs font-bold text-slate-800">Primary Chamber Location:</span>
                    </div>
                    <input
                      type="text"
                      value={chamberId}
                      onChange={(e) => setChamberId(e.target.value)}
                      placeholder="CareOn Medical Clinic, Chamber 101"
                      className="w-full sm:w-72 px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 font-medium"
                    />
                  </div>

                  {/* SUBTAB 1: FIXED WEEKLY SCHEDULE */}
                  {activeScheduleTab === 'weekly' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-[#007E70]" />
                          <span>Fixed Weekly Visiting Slots</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleAddWeeklySlot}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#007E70] rounded-xl text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Weekly Slot</span>
                        </button>
                      </div>

                      {weeklySchedules.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No weekly slots added. Click "Add Weekly Slot" above.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {weeklySchedules.map((slot, index) => (
                            <div
                              key={slot.id}
                              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                            >
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <select
                                  value={slot.day}
                                  onChange={(e) =>
                                    handleUpdateWeeklySlot(slot.id, 'day', e.target.value as DayOfWeek)
                                  }
                                  className="px-2.5 py-1.5 text-xs font-bold bg-slate-50 rounded-lg border border-slate-200 text-slate-800"
                                >
                                  {[
                                    'Saturday',
                                    'Sunday',
                                    'Monday',
                                    'Tuesday',
                                    'Wednesday',
                                    'Thursday',
                                    'Friday'
                                  ].map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <input
                                    type="text"
                                    value={slot.startTime}
                                    onChange={(e) =>
                                      handleUpdateWeeklySlot(slot.id, 'startTime', e.target.value)
                                    }
                                    placeholder="10:30 AM"
                                    className="w-24 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                  />
                                  <span className="text-slate-400 text-xs">to</span>
                                  <input
                                    type="text"
                                    value={slot.endTime}
                                    onChange={(e) =>
                                      handleUpdateWeeklySlot(slot.id, 'endTime', e.target.value)
                                    }
                                    placeholder="11:30 AM"
                                    className="w-24 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={slot.roomNumber}
                                  onChange={(e) =>
                                    handleUpdateWeeklySlot(slot.id, 'roomNumber', e.target.value)
                                  }
                                  placeholder="Chamber name / room"
                                  className="flex-1 min-w-[140px] px-2.5 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveWeeklySlot(slot.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer self-end sm:self-center"
                                title="Remove slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 2: ALTERNATE WEEK SCHEDULE */}
                  {activeScheduleTab === 'alternate' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <CalendarRange className="w-4 h-4 text-indigo-600" />
                            <span>Alternate-Week Consultation Rules</span>
                          </span>
                          <p className="text-[11px] text-slate-500">
                            For consultants who visit every 2 weeks or specific weeks of the month
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAlternateSchedule}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Alternate Rule</span>
                        </button>
                      </div>

                      {alternateSchedules.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No alternate week rules set. Click "Add Alternate Rule" to configure.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {alternateSchedules.map((alt) => (
                            <div
                              key={alt.id}
                              className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                            >
                              <div className="flex items-center gap-2">
                                <select
                                  value={alt.frequency}
                                  onChange={(e) =>
                                    setAlternateSchedules((prev) =>
                                      prev.map((a) =>
                                        a.id === alt.id ? { ...a, frequency: e.target.value as any } : a
                                      )
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-900 rounded-lg border border-indigo-200"
                                >
                                  <option value="EVERY_2_WEEKS">Every 2 Weeks</option>
                                  <option value="WEEKS_1_3">Week 1 & Week 3</option>
                                  <option value="WEEKS_2_4">Week 2 & Week 4</option>
                                </select>

                                <select
                                  value={alt.day}
                                  onChange={(e) =>
                                    setAlternateSchedules((prev) =>
                                      prev.map((a) =>
                                        a.id === alt.id ? { ...a, day: e.target.value as DayOfWeek } : a
                                      )
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
                                    (d) => (
                                      <option key={d} value={d}>
                                        {d}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <input
                                  type="date"
                                  value={alt.startDate}
                                  onChange={(e) =>
                                    setAlternateSchedules((prev) =>
                                      prev.map((a) => (a.id === alt.id ? { ...a, startDate: e.target.value } : a))
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200"
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={alt.startTime}
                                    onChange={(e) =>
                                      setAlternateSchedules((prev) =>
                                        prev.map((a) => (a.id === alt.id ? { ...a, startTime: e.target.value } : a))
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                  />
                                  <span className="text-slate-400 text-xs">–</span>
                                  <input
                                    type="text"
                                    value={alt.endTime}
                                    onChange={(e) =>
                                      setAlternateSchedules((prev) =>
                                        prev.map((a) => (a.id === alt.id ? { ...a, endTime: e.target.value } : a))
                                      )
                                    }
                                    className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveAlternateSchedule(alt.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 3: MONTHLY PATTERN */}
                  {activeScheduleTab === 'monthly' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span>Monthly Occurrence Rules</span>
                          </span>
                          <p className="text-[11px] text-slate-500">
                            e.g. "Every 2nd Saturday 10:30 AM – 11:30 AM" or "Last Friday of month"
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddMonthlySchedule}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Monthly Pattern</span>
                        </button>
                      </div>

                      {monthlySchedules.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No monthly patterns configured.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {monthlySchedules.map((mon) => (
                            <div
                              key={mon.id}
                              className="p-3.5 bg-white rounded-xl border border-purple-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                            >
                              <div className="flex items-center gap-2">
                                <select
                                  value={mon.occurrence}
                                  onChange={(e) =>
                                    setMonthlySchedules((prev) =>
                                      prev.map((m) =>
                                        m.id === mon.id ? { ...m, occurrence: e.target.value as any } : m
                                      )
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-900 rounded-lg border border-purple-200"
                                >
                                  <option value="FIRST">1st</option>
                                  <option value="SECOND">2nd</option>
                                  <option value="THIRD">3rd</option>
                                  <option value="FOURTH">4th</option>
                                  <option value="LAST">Last</option>
                                </select>

                                <select
                                  value={mon.day}
                                  onChange={(e) =>
                                    setMonthlySchedules((prev) =>
                                      prev.map((m) =>
                                        m.id === mon.id ? { ...m, day: e.target.value as DayOfWeek } : m
                                      )
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold bg-slate-50 rounded-lg border border-slate-200"
                                >
                                  {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(
                                    (d) => (
                                      <option key={d} value={d}>
                                        {d}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={mon.startTime}
                                  onChange={(e) =>
                                    setMonthlySchedules((prev) =>
                                      prev.map((m) => (m.id === mon.id ? { ...m, startTime: e.target.value } : m))
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                />
                                <span className="text-slate-400 text-xs">–</span>
                                <input
                                  type="text"
                                  value={mon.endTime}
                                  onChange={(e) =>
                                    setMonthlySchedules((prev) =>
                                      prev.map((m) => (m.id === mon.id ? { ...m, endTime: e.target.value } : m))
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveMonthlySchedule(mon.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 4: CUSTOM SPECIFIC DATES */}
                  {activeScheduleTab === 'custom' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Specific Visiting Dates / Special Chambers</span>
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Single exceptional dates for visiting specialists, health camps, or replacement chambers
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomDate}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Date</span>
                        </button>
                      </div>

                      {customDates.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          No specific custom dates scheduled.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {customDates.map((cd) => (
                            <div
                              key={cd.id}
                              className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                            >
                              <input
                                type="date"
                                value={cd.date}
                                onChange={(e) =>
                                  setCustomDates((prev) =>
                                    prev.map((c) => (c.id === cd.id ? { ...c, date: e.target.value } : c))
                                  )
                                }
                                className="px-2.5 py-1 text-xs bg-amber-50 rounded-lg border border-amber-200 font-bold text-amber-900"
                              />

                              <input
                                type="text"
                                value={cd.title}
                                onChange={(e) =>
                                  setCustomDates((prev) =>
                                    prev.map((c) => (c.id === cd.id ? { ...c, title: e.target.value } : c))
                                  )
                                }
                                placeholder="Purpose (e.g. Special Camp)"
                                className="flex-1 px-2.5 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-medium"
                              />

                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={cd.startTime}
                                  onChange={(e) =>
                                    setCustomDates((prev) =>
                                      prev.map((c) => (c.id === cd.id ? { ...c, startTime: e.target.value } : c))
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                />
                                <span className="text-slate-400 text-xs">–</span>
                                <input
                                  type="text"
                                  value={cd.endTime}
                                  onChange={(e) =>
                                    setCustomDates((prev) =>
                                      prev.map((c) => (c.id === cd.id ? { ...c, endTime: e.target.value } : c))
                                    )
                                  }
                                  className="w-20 px-2 py-1 text-xs bg-slate-50 rounded-lg border border-slate-200 font-semibold"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveCustomDate(cd.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBTAB 5: TEMPORARILY UNAVAILABLE / LEAVE */}
                  {activeScheduleTab === 'unavailable' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                            <Ban className="w-4 h-4" />
                            <span>Temporarily Unavailable / Doctor Leave</span>
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Overrides recurring chambers during leave without deleting recurring schedules
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddUnavailable}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Leave Period</span>
                        </button>
                      </div>

                      {unavailableExceptions.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                          Doctor is currently available as per regular schedule.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {unavailableExceptions.map((unavail) => (
                            <div
                              key={unavail.id}
                              className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-700">From:</span>
                                  <input
                                    type="date"
                                    value={unavail.startDate}
                                    onChange={(e) =>
                                      setUnavailableExceptions((prev) =>
                                        prev.map((u) =>
                                          u.id === unavail.id ? { ...u, startDate: e.target.value } : u
                                        )
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-white rounded-lg border border-slate-200 font-bold"
                                  />
                                  <span className="text-xs font-bold text-slate-700">To:</span>
                                  <input
                                    type="date"
                                    value={unavail.endDate}
                                    onChange={(e) =>
                                      setUnavailableExceptions((prev) =>
                                        prev.map((u) =>
                                          u.id === unavail.id ? { ...u, endDate: e.target.value } : u
                                        )
                                      )
                                    }
                                    className="px-2 py-1 text-xs bg-white rounded-lg border border-slate-200 font-bold"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveUnavailable(unavail.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <select
                                  value={unavail.reason}
                                  onChange={(e) =>
                                    setUnavailableExceptions((prev) =>
                                      prev.map((u) =>
                                        u.id === unavail.id ? { ...u, reason: e.target.value } : u
                                      )
                                    )
                                  }
                                  className="px-2.5 py-1 text-xs bg-white rounded-lg border border-slate-200 font-semibold"
                                >
                                  {UNAVAILABLE_REASONS.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="text"
                                  value={unavail.notes}
                                  onChange={(e) =>
                                    setUnavailableExceptions((prev) =>
                                      prev.map((u) =>
                                        u.id === unavail.id ? { ...u, notes: e.target.value } : u
                                      )
                                    )
                                  }
                                  placeholder="Patient notification note (optional)"
                                  className="px-2.5 py-1 text-xs bg-white rounded-lg border border-slate-200"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCHEDULE VISUALIZATION SUMMARY CARD */}
                  <div className="mt-4 p-4 rounded-2xl bg-linear-to-br from-slate-50 to-teal-50/40 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#007E70]" />
                        <span>Aggregated Schedule Summary</span>
                      </span>
                      <span className="text-[10px] text-[#007E70] font-mono">Live Synchronization</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {weeklySchedules.map((w) => (
                        <span
                          key={w.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        >
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span className="font-bold">{w.day}:</span> {w.startTime} – {w.endTime}
                        </span>
                      ))}

                      {alternateSchedules.map((a) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium"
                        >
                          <CalendarRange className="w-3 h-3 text-indigo-600" />
                          <span>Alt ({a.day}): {a.startTime} – {a.endTime}</span>
                        </span>
                      ))}

                      {monthlySchedules.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-medium"
                        >
                          <Calendar className="w-3 h-3 text-purple-600" />
                          <span>{m.occurrence} {m.day}: {m.startTime} – {m.endTime}</span>
                        </span>
                      ))}

                      {customDates.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{c.date}: {c.startTime} – {c.endTime} ({c.title})</span>
                        </span>
                      ))}

                      {unavailableExceptions.map((u) => (
                        <span
                          key={u.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-medium"
                        >
                          <Ban className="w-3 h-3 text-rose-600" />
                          <span>Leave: {u.startDate} to {u.endDate}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: APPOINTMENT SLOT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Appointment Slot Calibration</h3>
                      <p className="text-xs text-slate-500">
                        Define slot duration, buffer times between patients, and booking controls
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Slot Engine
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Duration */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#007E70]" />
                        <span>Appointment Duration</span>
                      </label>
                      <select
                        value={appointmentDuration}
                        onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                      >
                        {APPOINTMENT_DURATIONS.map((ad) => (
                          <option key={ad.value} value={ad.value}>
                            {ad.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400">
                        Default time allocated per patient consultation in slot generator.
                      </p>
                    </div>

                    {/* Buffer Time */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#007E70]" />
                        <span>Buffer Time Between Appointments</span>
                      </label>
                      <select
                        value={bufferTime}
                        onChange={(e) => setBufferTime(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                      >
                        {BUFFER_TIMES.map((bt) => (
                          <option key={bt.value} value={bt.value}>
                            {bt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400">
                        Prevents clinic overlap and accounts for sanitation/case notes.
                      </p>
                    </div>

                    {/* Max Patients */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-800">
                        Max Appointments Per Chamber Slot
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={maxAppointmentsPerSlot}
                        onChange={(e) => setMaxAppointmentsPerSlot(e.target.value)}
                        placeholder="20"
                        className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#007E70]"
                      />
                      <p className="text-[11px] text-slate-400">
                        Safety ceiling to prevent physician overbooking.
                      </p>
                    </div>

                    {/* Online Booking Enabled Toggle */}
                    <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          Online Appointment Booking
                        </label>
                        <button
                          type="button"
                          onClick={() => setAppointmentEnabled(!appointmentEnabled)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                            appointmentEnabled ? 'bg-[#007E70]' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                              appointmentEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        If disabled, patients can view doctor profile but must call clinic for booking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: LIVE PROFILE PREVIEW PANEL (lg:col-span-5 or 4) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 bg-slate-50/70 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between ${
              mobileView === 'form' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#007E70]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Live Profile Preview
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#007E70] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Public View
                </span>
              </div>

              {/* Public Website Card Simulation */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4 relative overflow-hidden">
                {/* Active badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                      active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {active ? 'Available' : 'Inactive'}
                  </span>
                </div>

                {/* Doctor Photo & Basic Head */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-24 sm:w-22 sm:h-26 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs shrink-0">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <CareOnDoctorFallback
                        doctor={previewDoctor}
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1 pt-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-[#007E70] text-[10px] font-bold border border-teal-100">
                      {departmentName || currentDept.name}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate leading-tight">
                      {name.trim() || 'DR. DEBDUTTA NAYAK'}
                    </h3>
                    {nameBn && (
                      <p className="text-xs text-slate-500 font-medium truncate">{nameBn}</p>
                    )}
                    <p className="text-xs font-semibold text-[#007E70] truncate">
                      {designation.trim() || 'Consultant'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium truncate">
                      {qualification.trim() || 'MBBS, MD'}
                    </p>
                  </div>
                </div>

                {/* Badges: Reg No & Experience */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {registrationNumber && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                      <ShieldCheck className="w-3 h-3 text-[#007E70]" />
                      <span>Reg: {registrationNumber}</span>
                    </span>
                  )}
                  {experienceYears && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>{experienceYears}+ Yrs Exp</span>
                    </span>
                  )}
                  {doctorType && (
                    <span className="inline-block px-2 py-0.5 bg-teal-50/80 rounded text-[10px] font-bold text-teal-800">
                      {doctorType}
                    </span>
                  )}
                </div>

                {/* Consultation Fees Card */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Consultation Fee
                    </span>
                    <span className="text-base font-extrabold text-[#007E70]">
                      {consultationFee ? `₹ ${consultationFee}` : 'Free / Contact'}
                    </span>
                  </div>
                  {followUpFee && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Follow-Up
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        ₹ {followUpFee}
                      </span>
                    </div>
                  )}
                </div>

                {/* Consultation Schedule Box */}
                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-teal-900 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[#007E70] shrink-0" />
                    <span className="truncate">
                      {weeklySchedules.length > 0
                        ? weeklySchedules.map((w) => `${w.day.slice(0, 3)} ${w.startTime}`).join(', ')
                        : 'Schedule by appointment'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-800 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">{chamberId || 'CareOn Medical Clinic'}</span>
                  </div>
                </div>

                {/* Services list snippet */}
                {selectedServices.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Services Covered
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedServices.slice(0, 4).map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                      {selectedServices.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                          +{selectedServices.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Booking Button Mock */}
                <button
                  type="button"
                  disabled
                  className="w-full py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl shadow-xs opacity-90 cursor-default flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#007E70]" />
                  <span>Real-Time Cloud Synchronization</span>
                </div>
                <p>
                  Saved doctor changes are committed to the secure Supabase database and immediately reflected on the public website.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR: Sticky Footer */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            {initialData?.id ? `Doctor ID: ${initialData.id}` : 'Drafting new doctor entry'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#007E70] hover:bg-[#006e62] disabled:bg-[#007E70]/50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Doctor...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData?.id ? 'Save Changes' : 'Save Doctor Profile'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Media Library Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(asset: MediaAsset) => {
            setPhotoUrl(asset.url);
            setPhotoAssetId(asset.id);
            setIsMediaPickerOpen(false);
          }}
          initialCategory="DOCTOR"
        />
      )}
    </div>
  );
};
