import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Doctor,
  DoctorScheduleItem,
  DayOfWeek,
  MediaAsset
} from '../../types';
import {
  MASTER_DEPARTMENTS,
  MASTER_DESIGNATIONS,
  MASTER_CHAMBERS,
  MASTER_DAYS,
  MASTER_TIME_PRESETS,
  MASTER_SERVICES,
  getSpecialtiesForDepartment,
  getSuggestedServicesForDepartment,
  MasterSpecialty,
  MasterDepartment
} from '../../data/medicalMasters';
import { MediaPickerModal } from './MediaPickerModal';
import { CareOnDoctorFallback } from '../common/CareOnMedia';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doctorData: Partial<Doctor>) => void;
  initialData?: Partial<Doctor> | null;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  // Form State
  const [name, setName] = useState<string>('');
  const [nameBn, setNameBn] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoAssetId, setPhotoAssetId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('dept-gen-med');
  const [specialtyId, setSpecialtyId] = useState<string>('');
  const [customSpecialty, setCustomSpecialty] = useState<string>('');
  const [designation, setDesignation] = useState<string>('Consultant');
  const [customDesignation, setCustomDesignation] = useState<string>('');
  const [qualification, setQualification] = useState<string>('MBBS, MD');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');

  // Schedules state
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([
    { day: 'Saturday', startTime: '10:30 AM', endTime: '11:30 AM' }
  ]);

  // Chamber state
  const [chamberId, setChamberId] = useState<string>('CareOn Medical Clinic');
  const [chamberCustom, setChamberCustom] = useState<string>('');

  // Services state
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Status
  const [active, setActive] = useState<boolean>(true);

  // Modals and UI dropdown open states
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState<string>('');
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState<boolean>(false);
  const [specialtySearchQuery, setSpecialtySearchQuery] = useState<string>('');
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState<boolean>(false);
  const [servicesSearchQuery, setServicesSearchQuery] = useState<string>('');

  // Validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // References for click-outside closing of custom dropdowns
  const deptRef = useRef<HTMLDivElement>(null);
  const specialtyRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Dynamic departments fetched from database /api/departments
  const [dbDepartments, setDbDepartments] = useState<MasterDepartment[]>([]);

  useEffect(() => {
    fetch('/api/departments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
          setDbDepartments(
            data.departments.map((d: any) => ({
              id: d.id,
              name: d.name,
              nameBn: d.nameBn || '',
              category: d.category || 'Clinical',
              keywords: [d.name, d.slug || '']
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const departmentList = useMemo(() => {
    return dbDepartments.length > 0 ? dbDepartments : MASTER_DEPARTMENTS;
  }, [dbDepartments]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node)) {
        setIsSpecialtyDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setNameBn(initialData.nameBn || '');
      setPhotoUrl(initialData.photoUrl || initialData.profilePhotoUrl || '');
      setPhotoAssetId(initialData.photoAssetId || initialData.profilePhotoAssetId || '');
      setDepartmentId(initialData.departmentId || 'dept-gen-med');
      setSpecialtyId(initialData.specialtyId || '');
      setDesignation(initialData.designation || 'Consultant');
      setQualification(initialData.qualification || 'MBBS, MD');
      setRegistrationNumber(initialData.registrationNumber || '');

      // Parse schedules
      if (Array.isArray(initialData.schedules) && initialData.schedules.length > 0) {
        setSchedules(initialData.schedules);
      } else if (Array.isArray(initialData.weeklySchedule) && initialData.weeklySchedule.length > 0) {
        const mapped = initialData.weeklySchedule
          .filter((w) => w.isActive)
          .map((w) => ({
            day: w.day,
            startTime: w.startTime || '10:30 AM',
            endTime: w.endTime || '11:30 AM'
          }));
        setSchedules(mapped.length > 0 ? mapped : [{ day: 'Saturday', startTime: '10:30 AM', endTime: '11:30 AM' }]);
      } else {
        setSchedules([{ day: 'Saturday', startTime: '10:30 AM', endTime: '11:30 AM' }]);
      }

      setChamberId(initialData.chamberId || initialData.roomNumber || 'CareOn Medical Clinic');
      setChamberCustom(initialData.chamberCustom || '');
      setSelectedServiceIds(initialData.serviceIds || []);
      setActive(initialData.active !== undefined ? initialData.active : initialData.status !== 'INACTIVE');
    } else {
      // Reset form to defaults
      setName('');
      setNameBn('');
      setPhotoUrl('');
      setPhotoAssetId('');
      setDepartmentId('dept-gen-med');
      setSpecialtyId('');
      setCustomSpecialty('');
      setDesignation('Consultant');
      setCustomDesignation('');
      setQualification('MBBS, MD');
      setRegistrationNumber('');
      setSchedules([{ day: 'Saturday', startTime: '10:30 AM', endTime: '11:30 AM' }]);
      setChamberId('CareOn Medical Clinic');
      setChamberCustom('');
      setSelectedServiceIds([]);
      setActive(true);
    }
    setValidationError(null);
  }, [initialData, isOpen]);

  // Handle department change -> clear incompatible specialty & suggest services
  const handleDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setSpecialtyId('');
    setIsDeptDropdownOpen(false);

    // If services are currently empty, prefill with department suggestions
    const suggestions = getSuggestedServicesForDepartment(newDeptId);
    if (selectedServiceIds.length === 0 && suggestions.length > 0) {
      setSelectedServiceIds(suggestions.slice(0, 3).map((s) => s.id));
    }
  };

  // Filtered master departments for smart searchable dropdown
  const filteredDepartments = useMemo(() => {
    if (!deptSearchQuery.trim()) return departmentList;
    const q = deptSearchQuery.toLowerCase().trim();
    return departmentList.filter(
      (dept) =>
        dept.name.toLowerCase().includes(q) ||
        (dept.nameBn && dept.nameBn.includes(q)) ||
        (dept.keywords && dept.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }, [departmentList, deptSearchQuery]);

  // Available specialties for the selected department
  const availableSpecialties = useMemo(() => {
    return getSpecialtiesForDepartment(departmentId);
  }, [departmentId]);

  const filteredSpecialties = useMemo(() => {
    if (!specialtySearchQuery.trim()) return availableSpecialties;
    const q = specialtySearchQuery.toLowerCase().trim();
    return availableSpecialties.filter((s) => s.name.toLowerCase().includes(q));
  }, [availableSpecialties, specialtySearchQuery]);

  // Filtered services for smart multi-select dropdown
  const filteredServices = useMemo(() => {
    if (!servicesSearchQuery.trim()) return MASTER_SERVICES;
    const q = servicesSearchQuery.toLowerCase().trim();
    return MASTER_SERVICES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [servicesSearchQuery]);

  // Suggested services for the current department
  const suggestedServices = useMemo(() => {
    return getSuggestedServicesForDepartment(departmentId);
  }, [departmentId]);

  // Selected department object
  const currentDeptObj = useMemo(() => {
    return departmentList.find((d) => d.id === departmentId) || departmentList[0];
  }, [departmentList, departmentId]);

  // Selected specialty object
  const currentSpecialtyObj = useMemo(() => {
    return availableSpecialties.find((s) => s.id === specialtyId);
  }, [availableSpecialties, specialtyId]);

  // Schedule operations
  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      { day: 'Wednesday', startTime: '05:00 PM', endTime: '07:00 PM' }
    ]);
  };

  const handleUpdateSchedule = (
    index: number,
    field: keyof DoctorScheduleItem,
    value: string
  ) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSchedules(updated);
  };

  const handleDeleteSchedule = (index: number) => {
    if (schedules.length <= 1) {
      setValidationError('At least one consultation schedule slot is required.');
      return;
    }
    setValidationError(null);
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  // Toggle service selection
  const handleToggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  // Handle Photo selection from Media Library
  const handleSelectMedia = (asset: MediaAsset) => {
    setPhotoUrl(asset.url);
    setPhotoAssetId(asset.id);
    setIsMediaPickerOpen(false);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Doctor Name is required.');
      return;
    }

    if (!departmentId) {
      setValidationError('Please select a Department.');
      return;
    }

    if (schedules.length === 0) {
      setValidationError('Please add at least one consultation schedule.');
      return;
    }

    const finalDesignation =
      designation === 'Other' && customDesignation.trim()
        ? customDesignation.trim()
        : designation;

    const payload: Partial<Doctor> = {
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      departmentId,
      specialtyId: specialtyId || undefined,
      designation: finalDesignation,
      qualification: qualification.trim() || 'MBBS',
      registrationNumber: registrationNumber.trim() || undefined,
      photoUrl,
      profilePhotoUrl: photoUrl,
      photoAssetId,
      profilePhotoAssetId: photoAssetId,
      schedules,
      chamberId,
      chamberCustom: chamberId === 'Other' ? chamberCustom.trim() : undefined,
      serviceIds: selectedServiceIds,
      active,
      published: active,
      status: active ? 'ACTIVE' : 'INACTIVE'
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/80 via-white to-teal-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#007E70] text-white flex items-center justify-center shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  {initialData?.id ? 'Edit Doctor Profile' : 'Add Doctor Profile'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {initialData?.id
                    ? 'Update clinical details, consultation schedule, and chamber'
                    : 'Add a verified physician to CareOn Medical Clinic'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content - Single Column, Mobile-First Scrollable */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8"
          >
            {/* Validation Banner */}
            {validationError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            {/* SECTION A: DOCTOR PROFILE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Doctor Profile
                </span>
              </div>

              {/* 1. Doctor Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Doctor Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all font-semibold min-h-[44px]"
                />
              </div>

              {/* Bengali Name (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Name in Bengali (বাংলা নাম)</span>
                  <span className="text-[11px] font-normal text-slate-400">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ডাঃ জেন স্মিথ"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all min-h-[44px]"
                />
              </div>

              {/* 2. Profile Photo with Media Library Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative shadow-2xs">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={name || 'Doctor Preview'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CareOnDoctorFallback
                        doctor={{ name: name || 'Doctor' }}
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs min-h-[44px]"
                    >
                      <ImageIcon className="w-4 h-4 text-[#007E70]" />
                      <span>{photoUrl ? 'Change from Media Library' : 'Select from Media Library'}</span>
                    </button>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUrl('');
                          setPhotoAssetId('');
                        }}
                        className="block text-[11px] font-semibold text-rose-600 hover:text-rose-800 cursor-pointer pt-0.5"
                      >
                        Remove Photo
                      </button>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Standard professional portrait. Select from centralized CareOn Media Library.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Department (Searchable Dropdown) */}
              <div className="space-y-1.5 relative" ref={deptRef}>
                <label className="block text-xs font-bold text-slate-800">
                  Department <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer text-left"
                >
                  <span className="truncate">{currentDeptObj?.name || 'Select Department'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isDeptDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search 77 medical departments (e.g. Cardio, Ortho, Neuro)..."
                          value={deptSearchQuery}
                          onChange={(e) => setDeptSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007E70]"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {filteredDepartments.map((dept) => {
                        const isSelected = dept.id === departmentId;
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => handleDepartmentChange(dept.id)}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                              isSelected ? 'bg-teal-50/70 font-bold text-[#007E70]' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-semibold">{dept.name}</div>
                              <div className="text-[10px] text-slate-400">{dept.category} • {dept.nameBn}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#007E70] shrink-0" />}
                          </button>
                        );
                      })}
                      {filteredDepartments.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No departments matching "{deptSearchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Specialty / Clinical Area (Searchable Dropdown mapped to Department) */}
              <div className="space-y-1.5 relative" ref={specialtyRef}>
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Specialty / Clinical Area</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Options depend on {currentDeptObj?.name}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer text-left"
                >
                  <span className="truncate">
                    {currentSpecialtyObj?.name || 'Select Specialty (Optional)'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isSpecialtyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search clinical specialties..."
                          value={specialtySearchQuery}
                          onChange={(e) => setSpecialtySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007E70]"
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialtyId('');
                          setIsSpecialtyDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-xs hover:bg-slate-50 text-slate-500 italic ${
                          !specialtyId ? 'bg-slate-50 font-bold' : ''
                        }`}
                      >
                        (None / Department is sufficiently specific)
                      </button>
                      {filteredSpecialties.map((spec) => {
                        const isSelected = spec.id === specialtyId;
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => {
                              setSpecialtyId(spec.id);
                              setIsSpecialtyDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                              isSelected ? 'bg-teal-50/70 font-bold text-[#007E70]' : 'text-slate-700'
                            }`}
                          >
                            <span>{spec.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#007E70] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Designation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
                >
                  {MASTER_DESIGNATIONS.map((des) => (
                    <option key={des} value={des}>
                      {des}
                    </option>
                  ))}
                </select>
                {designation === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify custom designation..."
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[44px]"
                  />
                )}
              </div>

              {/* 6. Qualification (Single compact text input) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Qualification (ডিগ্রি / যোগ্যতা)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    e.g. MBBS, MD or MBBS, MS, DNB
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, MD (Medicine)"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
                />
              </div>

              {/* 7. Registration Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Registration No. (রেজিস্ট্রেশন নম্বর)</span>
                  <span className="text-[11px] font-normal text-slate-400">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. WBMC 54321 / MCI 12345"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
                />
              </div>
            </div>

            {/* SECTION B: CONSULTATION SCHEDULE BUILDER */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                    Consultation Schedule <span className="text-rose-500">*</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 text-[#007E70] hover:bg-teal-100 text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Schedule Slot</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Select consultation day and consultation hours. Multiple weekly schedules can be configured.
              </p>

              {/* Schedule slot rows */}
              <div className="space-y-3">
                {schedules.map((slot, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
                  >
                    {/* Day selector */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 sm:hidden">
                        Day
                      </label>
                      <select
                        value={slot.day}
                        onChange={(e) =>
                          handleUpdateSchedule(index, 'day', e.target.value as DayOfWeek)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[42px]"
                      >
                        {MASTER_DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Time */}
                    <div className="flex-1 min-w-[110px]">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 sm:hidden">
                        Start Time
                      </label>
                      <select
                        value={slot.startTime}
                        onChange={(e) =>
                          handleUpdateSchedule(index, 'startTime', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[42px]"
                      >
                        {MASTER_TIME_PRESETS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="hidden sm:block text-slate-400 font-bold text-xs">—</div>

                    {/* End Time */}
                    <div className="flex-1 min-w-[110px]">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 sm:hidden">
                        End Time
                      </label>
                      <select
                        value={slot.endTime}
                        onChange={(e) =>
                          handleUpdateSchedule(index, 'endTime', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 min-h-[42px]"
                      >
                        {MASTER_TIME_PRESETS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete button */}
                    <div className="flex justify-end pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(index)}
                        disabled={schedules.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer disabled:opacity-30 min-h-[42px] min-w-[42px] flex items-center justify-center"
                        title="Delete this schedule slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION C: CHAMBER / LOCATION */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Chamber
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Chamber / Location
                </label>
                <select
                  value={chamberId}
                  onChange={(e) => setChamberId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
                >
                  {MASTER_CHAMBERS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>

                {chamberId === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom chamber name or room number..."
                    value={chamberCustom}
                    onChange={(e) => setChamberCustom(e.target.value)}
                    className="w-full mt-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 min-h-[44px]"
                  />
                )}
              </div>
            </div>

            {/* SECTION D: SERVICES OFFERED (MULTI-SELECT) */}
            <div className="space-y-4 pt-2" ref={servicesRef}>
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  Services Offered
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedServiceIds.length} selected
                </span>
              </div>

              {/* Department Suggestions pill bar */}
              {suggestedServices.length > 0 && (
                <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#007E70]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggested for {currentDeptObj.name}:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedServices.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);
                      return (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => handleToggleService(srv.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#007E70] text-white'
                              : 'bg-white text-slate-700 border border-teal-200 hover:bg-teal-100/50'
                          }`}
                        >
                          <span>{srv.name}</span>
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Select Trigger Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold flex items-center justify-between transition-colors min-h-[44px] cursor-pointer text-left"
                >
                  <span className="truncate">
                    {selectedServiceIds.length > 0
                      ? `${selectedServiceIds.length} medical services selected`
                      : 'Search & Select Services Offered...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isServicesDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search medical services..."
                          value={servicesSearchQuery}
                          onChange={(e) => setServicesSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007E70]"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                      {filteredServices.map((srv) => {
                        const isSelected = selectedServiceIds.includes(srv.id);
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => handleToggleService(srv.id)}
                            className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-teal-50 transition-colors cursor-pointer ${
                              isSelected ? 'bg-teal-50/70 font-bold text-[#007E70]' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-semibold">{srv.name}</div>
                              <div className="text-[10px] text-slate-400">{srv.category}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#007E70] shrink-0" />}
                          </button>
                        );
                      })}
                      {filteredServices.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No services found matching "{servicesSearchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Services Tags */}
              {selectedServiceIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedServiceIds.map((id) => {
                    const srv = MASTER_SERVICES.find((s) => s.id === id);
                    if (!srv) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs rounded-xl font-medium"
                      >
                        <span>{srv.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleService(id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION E: STATUS */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="space-y-0.5">
                  <label
                    htmlFor="active-toggle"
                    className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer block"
                  >
                    Active / Published
                  </label>
                  <p className="text-[11px] text-slate-500">
                    When active, this doctor is visible on the public website and available for appointment booking.
                  </p>
                </div>
                <input
                  id="active-toggle"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 text-[#007E70] rounded-md border-slate-300 focus:ring-[#007E70] cursor-pointer min-h-[24px] min-w-[24px]"
                />
              </div>
            </div>

            {/* Sticky Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#007E70] hover:bg-[#009282] active:bg-[#006e62] text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition-all cursor-pointer min-h-[44px]"
              >
                Save Doctor
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Centralized Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        initialCategory="DOCTOR"
        title="Select Doctor Photo"
      />
    </>
  );
};
