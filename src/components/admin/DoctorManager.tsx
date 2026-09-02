import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import {
  Doctor,
  Department,
  ContentStatus,
  MediaAsset,
  DoctorWeeklyScheduleSlot,
  DoctorCustomSchedule,
  DoctorScheduleException,
  DayOfWeek,
  ScheduleRecurrenceType
} from '../../types';
import {
  DAYS_OF_WEEK,
  DAY_SHORT_MAP,
  SHORT_DAY_TO_FULL,
  formatScheduleDate,
  getDoctorPublicScheduleSummary
} from '../../lib/doctorScheduleUtils';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Edit2,
  Eye,
  ShieldAlert,
  Calendar,
  X,
  Stethoscope,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Clock,
  MapPin,
  AlertTriangle,
  CalendarDays,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { DoctorPhoto, CareOnDoctorFallback } from '../common/CareOnMedia';
import { MediaPickerModal } from './MediaPickerModal';
import { autoTranslateToBengali } from '../../lib/bengaliTranslator';

export const DoctorManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedFeaturedFilter, setSelectedFeaturedFilter] = useState<string>('all');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor> | null>(null);
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ doctor: Doctor; targetStatus: ContentStatus } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // Form Schedule Active Subtab
  const [scheduleSubTab, setScheduleSubTab] = useState<'WEEKLY' | 'CUSTOM' | 'EXCEPTIONS'>('WEEKLY');

  // Form State
  const [formState, setFormState] = useState<{
    name: string;
    nameBn: string;
    photoUrl: string;
    profilePhotoAssetId: string;
    profilePhotoUrl: string;
    profilePhotoAlt: string;
    departmentId: string;
    designation: string;
    qualification: string;
    registrationNumber: string;
    shortBio: string;
    expertiseStr: string;
    consultationDays: string[];
    consultationTime: string;
    roomNumber: string;
    weeklySchedule: DoctorWeeklyScheduleSlot[];
    customSchedules: DoctorCustomSchedule[];
    scheduleExceptions: DoctorScheduleException[];
    appointmentEnabled: boolean;
    featured: boolean;
    displayOrder: number;
    status: ContentStatus;
  }>({
    name: '',
    nameBn: '',
    photoUrl: '',
    profilePhotoAssetId: '',
    profilePhotoUrl: '',
    profilePhotoAlt: '',
    departmentId: '',
    designation: 'Senior Consultant Physician',
    qualification: 'MBBS, MD',
    registrationNumber: '',
    shortBio: '',
    expertiseStr: '',
    consultationDays: ['Mon', 'Wed', 'Fri'],
    consultationTime: '05:00 PM – 08:30 PM',
    roomNumber: 'Chamber 101',
    weeklySchedule: DAYS_OF_WEEK.map((day) => ({
      day,
      startTime: '05:00 PM',
      endTime: '08:30 PM',
      roomNumber: 'Chamber 101',
      location: 'Chamber 101',
      isActive: ['Monday', 'Wednesday', 'Friday'].includes(day)
    })),
    customSchedules: [],
    scheduleExceptions: [],
    appointmentEnabled: true,
    featured: false,
    displayOrder: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    setDoctors(DataAccessLayer.getAllDoctors());
    setDepartments(DataAccessLayer.getAllDepartments());
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

  // Filter Logic
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'all' || doc.departmentId === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'all' || doc.status === selectedStatusFilter;
    const matchesFeatured =
      selectedFeaturedFilter === 'all'
        ? true
        : selectedFeaturedFilter === 'featured'
        ? doc.featured
        : !doc.featured;

    return matchesSearch && matchesDept && matchesStatus && matchesFeatured;
  });

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormError(null);
    setScheduleSubTab('WEEKLY');
    const maxOrder = doctors.reduce((max, d) => Math.max(max, d.displayOrder || 0), 0);
    setFormState({
      name: '',
      nameBn: '',
      photoUrl: '',
      profilePhotoAssetId: '',
      profilePhotoUrl: '',
      profilePhotoAlt: '',
      departmentId: departments[0]?.id || 'dept-gen-med',
      designation: 'Senior Consultant Physician',
      qualification: 'MBBS, MD',
      registrationNumber: '',
      shortBio: '',
      expertiseStr: '',
      consultationDays: ['Mon', 'Wed', 'Fri'],
      consultationTime: '05:00 PM – 08:30 PM',
      roomNumber: 'Chamber 101',
      weeklySchedule: DAYS_OF_WEEK.map((day) => ({
        day,
        startTime: '05:00 PM',
        endTime: '08:30 PM',
        roomNumber: 'Chamber 101',
        location: 'Chamber 101',
        isActive: ['Monday', 'Wednesday', 'Friday'].includes(day)
      })),
      customSchedules: [],
      scheduleExceptions: [],
      appointmentEnabled: true,
      featured: false,
      displayOrder: maxOrder + 1,
      status: 'ACTIVE'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormError(null);
    setScheduleSubTab('WEEKLY');

    // Initialize weekly schedule from doc.weeklySchedule or fallback to consultationDays
    const initialWeekly: DoctorWeeklyScheduleSlot[] = DAYS_OF_WEEK.map((day) => {
      if (doc.weeklySchedule && doc.weeklySchedule.length > 0) {
        const existing = doc.weeklySchedule.find((s) => s.day === day);
        if (existing) return existing;
      }
      const shortDay = DAY_SHORT_MAP[day];
      const isDayActive =
        (doc.consultationDays || []).includes(shortDay) ||
        (doc.consultationDays || []).includes(day);
      return {
        day,
        startTime: '05:00 PM',
        endTime: '08:30 PM',
        roomNumber: doc.roomNumber || 'Chamber 101',
        location: doc.roomNumber || 'Chamber 101',
        isActive: isDayActive
      };
    });

    setFormState({
      name: doc.name,
      nameBn: doc.nameBn || '',
      photoUrl: doc.photoUrl || doc.profilePhotoUrl || '',
      profilePhotoAssetId: doc.profilePhotoAssetId || '',
      profilePhotoUrl: doc.profilePhotoUrl || doc.photoUrl || '',
      profilePhotoAlt: doc.profilePhotoAlt || '',
      departmentId: doc.departmentId,
      designation: doc.designation,
      qualification: doc.qualification,
      registrationNumber: doc.registrationNumber || '',
      shortBio: doc.shortBio,
      expertiseStr: (doc.areasOfExpertise || []).join(', '),
      consultationDays: doc.consultationDays || ['Mon', 'Wed', 'Fri'],
      consultationTime: doc.consultationTime,
      roomNumber: doc.roomNumber || 'Chamber 101',
      weeklySchedule: initialWeekly,
      customSchedules: doc.customSchedules || [],
      scheduleExceptions: doc.scheduleExceptions || [],
      appointmentEnabled: doc.appointmentEnabled,
      featured: doc.featured,
      displayOrder: doc.displayOrder,
      status: doc.status
    });
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFormError(null);

    if (!formState.name.trim()) {
      setFormError('Doctor full name is required.');
      return;
    }
    if (!formState.departmentId) {
      setFormError('Please link the doctor to a clinical department.');
      return;
    }
    if (!formState.qualification.trim()) {
      setFormError('Official medical qualification is required.');
      return;
    }

    const expertiseList = formState.expertiseStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const activePhotoUrl = formState.profilePhotoUrl || formState.photoUrl;

    // Derive active consultation days from weekly schedule
    const derivedActiveDays = formState.weeklySchedule
      .filter((s) => s.isActive)
      .map((s) => DAY_SHORT_MAP[s.day]);

    try {
      DataAccessLayer.saveDoctor(
        {
          ...(editingDoctor ? { id: editingDoctor.id } : {}),
          name: formState.name.trim(),
          nameBn: formState.nameBn.trim(),
          photoUrl: activePhotoUrl.trim(),
          profilePhotoUrl: activePhotoUrl.trim(),
          profilePhotoAssetId: formState.profilePhotoAssetId || undefined,
          profilePhotoAlt:
            formState.profilePhotoAlt.trim() ||
            `Dr. ${formState.name.trim()} - ${formState.designation.trim()}`,
          departmentId: formState.departmentId,
          designation: formState.designation.trim(),
          qualification: formState.qualification.trim(),
          registrationNumber: formState.registrationNumber.trim(),
          shortBio: formState.shortBio.trim(),
          areasOfExpertise: expertiseList,
          consultationDays: derivedActiveDays.length > 0 ? derivedActiveDays : formState.consultationDays,
          consultationTime: formState.consultationTime.trim(),
          roomNumber: formState.roomNumber.trim(),
          weeklySchedule: formState.weeklySchedule,
          customSchedules: formState.customSchedules,
          scheduleExceptions: formState.scheduleExceptions,
          appointmentEnabled: formState.appointmentEnabled,
          featured: formState.featured,
          displayOrder: Number(formState.displayOrder) || 1,
          status: formState.status
        },
        currentUser
      );
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save doctor record.');
    }
  };

  const handleMediaAssetSelected = (asset: MediaAsset) => {
    setFormState((prev) => ({
      ...prev,
      profilePhotoAssetId: asset.id,
      profilePhotoUrl: asset.url,
      photoUrl: asset.url,
      profilePhotoAlt: asset.altText || `Dr. ${prev.name || 'CareOn Physician'}`
    }));
  };

  const handleToggleStatusRequest = (doc: Doctor, target: ContentStatus) => {
    setStatusConfirm({ doctor: doc, targetStatus: target });
  };

  const handleExecuteStatusChange = () => {
    if (!statusConfirm || !currentUser) return;
    DataAccessLayer.toggleDoctorStatus(statusConfirm.doctor.id, statusConfirm.targetStatus, currentUser);
    setStatusConfirm(null);
  };

  const handleExecuteDelete = () => {
    if (!doctorToDelete || !currentUser) return;
    DataAccessLayer.deleteDoctor(doctorToDelete.id, currentUser);
    setDoctorToDelete(null);
  };

  const handleToggleFeatured = (doc: Doctor) => {
    if (!currentUser) return;
    try {
      DataAccessLayer.toggleDoctorFeatured(doc.id, currentUser);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (!currentUser) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= doctors.length) return;

    const reordered = [...doctors];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;

    DataAccessLayer.reorderDoctors(
      reordered.map((d) => d.id),
      currentUser
    );
  };

  // Schedule slot toggles & helpers
  const handleToggleWeeklySlot = (day: DayOfWeek) => {
    setFormState((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((slot) =>
        slot.day === day ? { ...slot, isActive: !slot.isActive } : slot
      )
    }));
  };

  const handleUpdateWeeklySlot = (day: DayOfWeek, field: keyof DoctorWeeklyScheduleSlot, value: any) => {
    setFormState((prev) => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((slot) =>
        slot.day === day ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Add Custom / Date-based Schedule Slot
  const handleAddCustomSchedule = () => {
    const newCustom: DoctorCustomSchedule = {
      id: `cs-${Date.now()}`,
      title: 'Visiting Specialist Chamber',
      recurrenceType: 'SPECIFIC_DATES',
      specificDates: [new Date().toISOString().split('T')[0]],
      startTime: '04:00 PM',
      endTime: '07:30 PM',
      roomNumber: formState.roomNumber || 'Chamber 101',
      location: 'Chamber 101',
      status: 'ACTIVE',
      note: 'Visiting consultation schedule'
    };
    setFormState((prev) => ({
      ...prev,
      customSchedules: [...prev.customSchedules, newCustom]
    }));
  };

  const handleRemoveCustomSchedule = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      customSchedules: prev.customSchedules.filter((cs) => cs.id !== id)
    }));
  };

  // Add Exception / Override Slot
  const handleAddException = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEx: DoctorScheduleException = {
      id: `ex-${Date.now()}`,
      date: today,
      exceptionType: 'CANCELLED',
      reason: 'Doctor on leave / chamber closed',
      replacementDate: '',
      replacementStartTime: '',
      replacementEndTime: ''
    };
    setFormState((prev) => ({
      ...prev,
      scheduleExceptions: [...prev.scheduleExceptions, newEx]
    }));
  };

  const handleRemoveException = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      scheduleExceptions: prev.scheduleExceptions.filter((ex) => ex.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Doctor Management & Scheduling
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain doctors, weekly clinic chamber slots, visiting specialist dates, and schedule overrides.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, degree, reg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#007E70] focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE (Published)</option>
              <option value="INACTIVE">INACTIVE (Hidden)</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <select
              value={selectedFeaturedFilter}
              onChange={(e) => setSelectedFeaturedFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            >
              <option value="all">All Listings</option>
              <option value="featured">Featured on Homepage</option>
              <option value="standard">Standard Listings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {doctors.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-teal-50 text-[#007E70] rounded-2xl flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Doctor Directory is Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No doctor profiles have been added yet. Add your clinical specialists, consultation hours, and department affiliations to display them on the website.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Doctor
              </button>
            </div>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No doctors match current criteria</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query or department filters.</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Add New Doctor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Practitioner Details</th>
                  <th className="py-3.5 px-4">Department & Reg</th>
                  <th className="py-3.5 px-4">Schedule & Mode</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDoctors.map((doc, idx) => {
                  const scheduleSummary = getDoctorPublicScheduleSummary(doc);
                  const hasExceptions = doc.scheduleExceptions && doc.scheduleExceptions.length > 0;
                  const hasCustom = doc.customSchedules && doc.customSchedules.length > 0;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order Controls */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-700 w-4 text-center">{doc.displayOrder}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveOrder(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:text-[#007E70] disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(idx, 'down')}
                              disabled={idx === doctors.length - 1}
                              className="p-0.5 hover:text-[#007E70] disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Practitioner Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-13 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                            <DoctorPhoto
                              doctor={doc}
                              className="w-full h-full object-cover object-top"
                              containerClassName="w-full h-full relative"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{doc.name}</span>
                              {doc.nameBn && (
                                <span className="text-[11px] font-normal text-slate-400 font-bengali">
                                  ({doc.nameBn})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#007E70] font-semibold">
                              {doc.qualification}
                            </div>
                            <div className="text-[10px] text-slate-400">{doc.designation}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Reg */}
                      <td className="py-3.5 px-4">
                        <div className="inline-block px-2 py-0.5 bg-teal-50 text-[#007E70] rounded-md font-bold text-[10px]">
                          {departmentMap.get(doc.departmentId) || 'General Department'}
                        </div>
                        {doc.registrationNumber && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Reg: {doc.registrationNumber}
                          </div>
                        )}
                      </td>

                      {/* Schedule Summary */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {scheduleSummary.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200">
                              {scheduleSummary.badge}
                            </span>
                          )}
                          <span className="font-bold text-slate-800 text-[11px]">
                            {scheduleSummary.scheduleText}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {doc.consultationTime || scheduleSummary.timeText}
                          {doc.roomNumber ? ` • ${doc.roomNumber}` : ''}
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          {hasCustom && (
                            <span className="text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                              Custom Roster
                            </span>
                          )}
                          {hasExceptions && (
                            <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {doc.scheduleExceptions?.length} Overrides
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(doc)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            doc.featured
                              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                          }`}
                          title={doc.featured ? 'Featured on Homepage' : 'Standard Listing'}
                        >
                          <Star className={`w-4 h-4 ${doc.featured ? 'fill-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Status Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            doc.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : doc.status === 'INACTIVE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : doc.status === 'DRAFT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : doc.status === 'INACTIVE'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {doc.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewDoctor(doc)}
                            className="p-1.5 text-slate-400 hover:text-[#007E70] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Preview Public Card"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Doctor & Schedule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {doc.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleToggleStatusRequest(doc, 'INACTIVE')}
                              className="px-2 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                              title="Deactivate from Public Website"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatusRequest(doc, 'ACTIVE')}
                              className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              title="Publish to Public Website"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => setDoctorToDelete(doc)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Doctor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD / EDIT DOCTOR & SCHEDULING MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#007E70] text-white flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">
                    {editingDoctor ? 'Edit Doctor Profile & Consultation Schedule' : 'Add New Clinical Practitioner'}
                  </h3>
                  <p className="text-xs text-slate-400">Manage credentials, weekly schedule slots, visiting dates & overrides</p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Section 1: Basic Clinical Credentials */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#007E70]" />
                  <span>Practitioner Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doctor Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Doctor Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormState((prev) => ({
                          ...prev,
                          name: val,
                          nameBn: autoTranslateToBengali(val)
                        }));
                      }}
                      placeholder="e.g. Dr. Arindam Banerjee"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>

                  {/* Bengali Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#007E70] flex items-center justify-between">
                      <span>Bengali Name (বাংলা নাম)</span>
                      <span className="text-[10px] text-teal-600 font-semibold">✨ Auto-transliterated</span>
                    </label>
                    <input
                      type="text"
                      value={formState.nameBn}
                      onChange={(e) => setFormState({ ...formState, nameBn: e.target.value })}
                      placeholder="e.g. ডাঃ অরিন্দম ব্যানার্জী"
                      className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formState.departmentId}
                      onChange={(e) => setFormState({ ...formState, departmentId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Clinical Designation
                    </label>
                    <input
                      type="text"
                      value={formState.designation}
                      onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                      placeholder="e.g. Senior Consultant Physician"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>

                  {/* Qualification */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Medical Qualifications <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.qualification}
                      onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MD (General Medicine)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>

                  {/* Registration Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Medical Council Reg. Number
                    </label>
                    <input
                      type="text"
                      value={formState.registrationNumber}
                      onChange={(e) => setFormState({ ...formState, registrationNumber: e.target.value })}
                      placeholder="e.g. WBMC-48291"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#007E70]" />
                      <span>Doctor Portrait Photo</span>
                    </label>
                    {formState.profilePhotoAssetId && (
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                        Asset ID: {formState.profilePhotoAssetId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-2xs relative">
                      {formState.profilePhotoUrl || formState.photoUrl ? (
                        <img
                          src={formState.profilePhotoUrl || formState.photoUrl}
                          alt="Doctor Preview"
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <CareOnDoctorFallback
                          doctor={{ name: formState.name, designation: formState.designation }}
                          className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-300"
                        />
                      )}
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMediaPickerOpen(true)}
                          className="px-3 py-1.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Select from Media Library</span>
                        </button>

                        {(formState.profilePhotoUrl || formState.photoUrl) && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                profilePhotoAssetId: '',
                                profilePhotoUrl: '',
                                photoUrl: '',
                                profilePhotoAlt: ''
                              }))
                            }
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Clear Photo
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={formState.profilePhotoAlt}
                        onChange={(e) =>
                          setFormState({ ...formState, profilePhotoAlt: e.target.value })
                        }
                        placeholder="Alt text (e.g. Dr. Arindam Banerjee - Physician)"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#007E70]"
                      />
                    </div>
                  </div>
                </div>

                {/* Short Bio & Expertise */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Clinical Background / Short Bio
                    </label>
                    <textarea
                      rows={2}
                      value={formState.shortBio}
                      onChange={(e) => setFormState({ ...formState, shortBio: e.target.value })}
                      placeholder="Specialization background..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Areas of Expertise (Comma-separated)
                    </label>
                    <textarea
                      rows={2}
                      value={formState.expertiseStr}
                      onChange={(e) => setFormState({ ...formState, expertiseStr: e.target.value })}
                      placeholder="e.g. Diabetes, Hypertension, Preventive Care"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: SCHEDULING ENGINE (Weekly, Custom/Visiting Dates, Exceptions) */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#007E70]" />
                    <span>Doctor Consultation Scheduling Engine</span>
                  </h4>
                </div>

                {/* Schedule Sub-tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setScheduleSubTab('WEEKLY')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scheduleSubTab === 'WEEKLY'
                        ? 'bg-white text-[#007E70] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Weekly Recurring</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleSubTab('CUSTOM')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scheduleSubTab === 'CUSTOM'
                        ? 'bg-white text-[#007E70] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Specific & Visiting Dates ({formState.customSchedules.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleSubTab('EXCEPTIONS')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      scheduleSubTab === 'EXCEPTIONS'
                        ? 'bg-white text-[#007E70] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Overrides / Closed ({formState.scheduleExceptions.length})</span>
                  </button>
                </div>

                {/* SUBTAB 1: WEEKLY RECURRING SCHEDULE */}
                {scheduleSubTab === 'WEEKLY' && (
                  <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Weekly Chamber Day Configuration
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Check active days and set chamber timings
                      </span>
                    </div>

                    <div className="space-y-2">
                      {formState.weeklySchedule.map((slot) => (
                        <div
                          key={slot.day}
                          className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            slot.isActive
                              ? 'bg-white border-teal-200 shadow-2xs'
                              : 'bg-slate-100/60 border-slate-200 opacity-60'
                          }`}
                        >
                          <label className="flex items-center gap-2.5 cursor-pointer min-w-[120px]">
                            <input
                              type="checkbox"
                              checked={slot.isActive}
                              onChange={() => handleToggleWeeklySlot(slot.day)}
                              className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                            />
                            <span className="text-xs font-bold text-slate-900">{slot.day}</span>
                          </label>

                          {slot.isActive ? (
                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={slot.startTime}
                                onChange={(e) => handleUpdateWeeklySlot(slot.day, 'startTime', e.target.value)}
                                placeholder="05:00 PM"
                                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                              <span className="text-slate-400 text-xs">–</span>
                              <input
                                type="text"
                                value={slot.endTime}
                                onChange={(e) => handleUpdateWeeklySlot(slot.day, 'endTime', e.target.value)}
                                placeholder="08:30 PM"
                                className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                              <input
                                type="text"
                                value={slot.roomNumber || ''}
                                onChange={(e) => handleUpdateWeeklySlot(slot.day, 'roomNumber', e.target.value)}
                                placeholder="Chamber 101"
                                className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                              />
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No chamber scheduled</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#0F172A]">
                          Overall Summary Timing Display
                        </label>
                        <input
                          type="text"
                          value={formState.consultationTime}
                          onChange={(e) => setFormState({ ...formState, consultationTime: e.target.value })}
                          placeholder="e.g. 05:00 PM – 08:30 PM"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007E70]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#0F172A]">
                          Default Room / Chamber
                        </label>
                        <input
                          type="text"
                          value={formState.roomNumber}
                          onChange={(e) => setFormState({ ...formState, roomNumber: e.target.value })}
                          placeholder="e.g. Chamber 101"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007E70]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: SPECIFIC DATES & VISITING RECURRENCE */}
                {scheduleSubTab === 'CUSTOM' && (
                  <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          Specific Dates & Visiting Specialist Schedules
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Configure irregular dates, 15-day intervals, or monthly specialist consultations
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomSchedule}
                        className="px-3 py-1.5 bg-[#007E70] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs hover:bg-[#009282]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Visiting Schedule</span>
                      </button>
                    </div>

                    {formState.customSchedules.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                        <Calendar className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500">No specific visiting schedules added yet.</p>
                        <p className="text-[11px] text-slate-400">
                          Click "+ Add Visiting Schedule" if this doctor visits on specific monthly/fortnightly dates.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formState.customSchedules.map((cs, idx) => (
                          <div
                            key={cs.id}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-[#007E70]" />
                                <span>Visiting Rule #{idx + 1}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomSchedule(cs.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                title="Remove Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Recurrence Type
                                </label>
                                <select
                                  value={cs.scheduleType || cs.recurrenceType}
                                  onChange={(e) => {
                                    const val = e.target.value as ScheduleRecurrenceType;
                                    setFormState((prev) => ({
                                      ...prev,
                                      customSchedules: prev.customSchedules.map((item) =>
                                        item.id === cs.id
                                          ? { ...item, recurrenceType: val, scheduleType: val }
                                          : item
                                      )
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                >
                                  <option value="SPECIFIC_DATES">Specific Calendar Dates</option>
                                  <option value="SPECIAL_CHAMBER">One-time Special Chamber</option>
                                  <option value="EVERY_15_DAYS">Recurring Interval (Every 15 Days / N Days)</option>
                                  <option value="MONTHLY">Monthly by Weekday (e.g. 1st / 3rd Sat)</option>
                                  <option value="MONTHLY_SPECIFIC_DAYS">Monthly by Dates (e.g. 5th & 20th)</option>
                                </select>
                              </div>

                              {(cs.recurrenceType === 'SPECIFIC_DATES' || cs.recurrenceType === 'SPECIAL_CHAMBER') && (
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                    Dates (Comma-separated YYYY-MM-DD)
                                  </label>
                                  <input
                                    type="text"
                                    value={(cs.specificDates || (cs.specificDate ? [cs.specificDate] : [])).join(', ')}
                                    onChange={(e) => {
                                      const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                      setFormState((prev) => ({
                                        ...prev,
                                        customSchedules: prev.customSchedules.map((item) =>
                                          item.id === cs.id
                                            ? { ...item, specificDates: arr, specificDate: arr[0] || '' }
                                            : item
                                        )
                                      }));
                                    }}
                                    placeholder="2026-09-05, 2026-09-19"
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                                  />
                                </div>
                              )}

                              {(cs.recurrenceType === 'EVERY_15_DAYS' || (cs.recurrenceType as string) === 'INTERVAL_DAYS') && (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                      Anchor Start Date (YYYY-MM-DD)
                                    </label>
                                    <input
                                      type="date"
                                      value={cs.startDate || ''}
                                      onChange={(e) => {
                                        setFormState((prev) => ({
                                          ...prev,
                                          customSchedules: prev.customSchedules.map((item) =>
                                            item.id === cs.id ? { ...item, startDate: e.target.value } : item
                                          )
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                      Interval in Days
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={60}
                                      value={cs.intervalDays || 15}
                                      onChange={(e) => {
                                        const num = parseInt(e.target.value, 10) || 15;
                                        setFormState((prev) => ({
                                          ...prev,
                                          customSchedules: prev.customSchedules.map((item) =>
                                            item.id === cs.id ? { ...item, intervalDays: num } : item
                                          )
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    />
                                  </div>
                                </>
                              )}

                              {cs.recurrenceType === 'MONTHLY_SPECIFIC_DAYS' && (
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                    Days of Month (e.g. 5, 20)
                                  </label>
                                  <input
                                    type="text"
                                    value={(cs.monthlyDaysOfMonth || []).join(', ')}
                                    onChange={(e) => {
                                      const nums = e.target.value
                                        .split(',')
                                        .map((s) => parseInt(s.trim(), 10))
                                        .filter((n) => !isNaN(n) && n >= 1 && n <= 31);
                                      setFormState((prev) => ({
                                        ...prev,
                                        customSchedules: prev.customSchedules.map((item) =>
                                          item.id === cs.id ? { ...item, monthlyDaysOfMonth: nums } : item
                                        )
                                      }));
                                    }}
                                    placeholder="5, 20"
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                  />
                                </div>
                              )}

                              {cs.recurrenceType === 'MONTHLY' && (
                                <>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                      Occurrence
                                    </label>
                                    <select
                                      value={cs.monthlyOccurrence || 'FIRST'}
                                      onChange={(e) => {
                                        setFormState((prev) => ({
                                          ...prev,
                                          customSchedules: prev.customSchedules.map((item) =>
                                            item.id === cs.id
                                              ? { ...item, monthlyOccurrence: e.target.value as any }
                                              : item
                                          )
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    >
                                      <option value="FIRST">1st (First)</option>
                                      <option value="SECOND">2nd (Second)</option>
                                      <option value="THIRD">3rd (Third)</option>
                                      <option value="FOURTH">4th (Fourth)</option>
                                      <option value="LAST">Last</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                      Day of Week
                                    </label>
                                    <select
                                      value={cs.monthlyDayOfWeek || 'Saturday'}
                                      onChange={(e) => {
                                        setFormState((prev) => ({
                                          ...prev,
                                          customSchedules: prev.customSchedules.map((item) =>
                                            item.id === cs.id
                                              ? { ...item, monthlyDayOfWeek: e.target.value as DayOfWeek }
                                              : item
                                          )
                                        }));
                                      }}
                                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                    >
                                      {DAYS_OF_WEEK.map((d) => (
                                        <option key={d} value={d}>
                                          {d}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Start Time
                                </label>
                                <input
                                  type="text"
                                  value={cs.startTime}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      customSchedules: prev.customSchedules.map((item) =>
                                        item.id === cs.id ? { ...item, startTime: e.target.value } : item
                                      )
                                    }));
                                  }}
                                  placeholder="04:00 PM"
                                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  End Time
                                </label>
                                <input
                                  type="text"
                                  value={cs.endTime}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      customSchedules: prev.customSchedules.map((item) =>
                                        item.id === cs.id ? { ...item, endTime: e.target.value } : item
                                      )
                                    }));
                                  }}
                                  placeholder="07:30 PM"
                                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Chamber / Room
                                </label>
                                <input
                                  type="text"
                                  value={cs.roomNumber || ''}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      customSchedules: prev.customSchedules.map((item) =>
                                        item.id === cs.id ? { ...item, roomNumber: e.target.value } : item
                                      )
                                    }));
                                  }}
                                  placeholder="Chamber 101"
                                  className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 3: SCHEDULE EXCEPTIONS & OVERRIDES */}
                {scheduleSubTab === 'EXCEPTIONS' && (
                  <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          Schedule Overrides & Chamber Closures
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Mark specific dates as cancelled, on leave, or rescheduled with a substitute date
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddException}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exception</span>
                      </button>
                    </div>

                    {formState.scheduleExceptions.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs text-slate-600 font-bold">No active closures or overrides.</p>
                        <p className="text-[11px] text-slate-400">
                          Doctor is operating on standard scheduled days without interruptions.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formState.scheduleExceptions.map((ex, idx) => (
                          <div
                            key={ex.id}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Override #{idx + 1}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveException(ex.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                title="Remove Override"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Exception Date
                                </label>
                                <input
                                  type="date"
                                  value={ex.date}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                        item.id === ex.id ? { ...item, date: e.target.value } : item
                                      )
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Type
                                </label>
                                <select
                                  value={ex.exceptionType}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                        item.id === ex.id
                                          ? { ...item, exceptionType: e.target.value as any }
                                          : item
                                      )
                                    }));
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                >
                                  <option value="CANCELLED">Doctor Unavailable / Closed</option>
                                  <option value="NOT_AVAILABLE">Doctor On Leave / Not Available</option>
                                  <option value="HOLIDAY">Clinic Holiday</option>
                                  <option value="RESCHEDULED">Rescheduled to New Date</option>
                                  <option value="SPECIAL_HOURS">Special Consultation Hours</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                  Reason / Public Notice
                                </label>
                                <input
                                  type="text"
                                  value={ex.reason || ''}
                                  onChange={(e) => {
                                    setFormState((prev) => ({
                                      ...prev,
                                      scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                        item.id === ex.id ? { ...item, reason: e.target.value } : item
                                      )
                                    }));
                                  }}
                                  placeholder="e.g. Doctor attending medical symposium"
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                            </div>

                            {ex.exceptionType === 'RESCHEDULED' && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <div>
                                  <label className="block text-[10px] font-bold text-amber-900 mb-1">
                                    Replacement Date
                                  </label>
                                  <input
                                    type="date"
                                    value={ex.replacementDate || ''}
                                    onChange={(e) => {
                                      setFormState((prev) => ({
                                        ...prev,
                                        scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                          item.id === ex.id ? { ...item, replacementDate: e.target.value } : item
                                        )
                                      }));
                                    }}
                                    className="w-full px-2 py-1 bg-white border border-amber-200 rounded-md text-xs text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-amber-900 mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="text"
                                    value={ex.replacementStartTime || ''}
                                    onChange={(e) => {
                                      setFormState((prev) => ({
                                        ...prev,
                                        scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                          item.id === ex.id ? { ...item, replacementStartTime: e.target.value } : item
                                        )
                                      }));
                                    }}
                                    placeholder="05:00 PM"
                                    className="w-full px-2 py-1 bg-white border border-amber-200 rounded-md text-xs text-slate-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-amber-900 mb-1">
                                    End Time
                                  </label>
                                  <input
                                    type="text"
                                    value={ex.replacementEndTime || ''}
                                    onChange={(e) => {
                                      setFormState((prev) => ({
                                        ...prev,
                                        scheduleExceptions: prev.scheduleExceptions.map((item) =>
                                          item.id === ex.id ? { ...item, replacementEndTime: e.target.value } : item
                                        )
                                      }));
                                    }}
                                    placeholder="08:30 PM"
                                    className="w-full px-2 py-1 bg-white border border-amber-200 rounded-md text-xs text-slate-800"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Publication Status, Display Order, Featured & Booking Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Publication Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({ ...formState, status: e.target.value as ContentStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Published publicly)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                    <option value="DRAFT">DRAFT (Work in progress)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formState.displayOrder}
                    onChange={(e) => setFormState({ ...formState, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.featured}
                    onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                    className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                  />
                  <span>Feature on Homepage Showcase</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formState.appointmentEnabled}
                    onChange={(e) => setFormState({ ...formState, appointmentEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                  />
                  <span>Enable Online Booking Requests</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {editingDoctor ? 'Save Changes' : 'Create Doctor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DOCTOR CARD MODAL */}
      {previewDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Public Card Preview
              </span>
              <button
                onClick={() => setPreviewDoctor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Public Card Mockup */}
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                  <DoctorPhoto
                    doctor={previewDoctor}
                    className="w-full h-full object-cover object-top"
                    containerClassName="w-full h-full relative"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">{previewDoctor.name}</h4>
                  <p className="text-xs text-[#007E70] font-semibold">{previewDoctor.qualification}</p>
                  <p className="text-[11px] text-slate-500">{previewDoctor.designation}</p>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Consultation Timing</div>
                <div className="font-bold text-slate-800">{previewDoctor.consultationTime}</div>
                <div className="text-slate-500">{previewDoctor.consultationDays.join(', ')}</div>
              </div>

              {previewDoctor.registrationNumber && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Reg: {previewDoctor.registrationNumber}
                </div>
              )}

              <button className="w-full py-2 bg-[#007E70] text-white text-xs font-bold rounded-xl text-center">
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaAssetSelected}
        initialCategory="DOCTOR"
        title="Select Doctor Profile Photo"
        selectedAssetId={formState.profilePhotoAssetId}
      />

      {/* STATUS TOGGLE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={Boolean(statusConfirm)}
        title={
          statusConfirm?.targetStatus === 'ACTIVE'
            ? 'Publish Doctor to Public Website?'
            : 'Deactivate Doctor from Public Website?'
        }
        message={
          statusConfirm?.targetStatus === 'ACTIVE'
            ? `Doctor "${statusConfirm.doctor.name}" will be published immediately on the public website and become available for online booking.`
            : `Doctor "${statusConfirm?.doctor.name}" will be hidden from public listings and online booking. The record and schedule will be safely retained in the database.`
        }
        confirmLabel={statusConfirm?.targetStatus === 'ACTIVE' ? 'Activate & Publish' : 'Deactivate'}
        isDestructive={statusConfirm?.targetStatus !== 'ACTIVE'}
        onConfirm={handleExecuteStatusChange}
        onCancel={() => setStatusConfirm(null)}
      />

      {/* PERMANENT DELETE CONFIRMATION */}
      <ConfirmationDialog
        isOpen={Boolean(doctorToDelete)}
        title={`Permanently Delete Dr. ${doctorToDelete?.name}?`}
        message={`Are you sure you want to permanently delete Dr. ${doctorToDelete?.name}? This will remove the doctor from all public listings and admin records immediately.`}
        confirmLabel="Delete Doctor"
        isDestructive={true}
        onConfirm={handleExecuteDelete}
        onCancel={() => setDoctorToDelete(null)}
      />
    </div>
  );
};
