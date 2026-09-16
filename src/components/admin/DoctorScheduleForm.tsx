import React, { useState, useEffect, useMemo } from 'react';
import {
  Doctor,
  DoctorCustomSchedule,
  DayOfWeek,
  ScheduleRecurrenceType,
  MonthlyOccurrence
} from '../../types';
import {
  generateScheduleSessionDates,
  formatSchedulePattern,
  formatScheduleDate,
  getDayOfWeekFromDate,
  getNextUpcomingSessionDate
} from '../../lib/doctorScheduleUtils';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  HelpCircle,
  Timer
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

export interface DoctorScheduleFormProps {
  doctor?: Doctor | Partial<Doctor>;
  doctorsList?: Doctor[];
  selectedDoctorId?: string;
  onDoctorChange?: (doctorId: string) => void;
  schedules: DoctorCustomSchedule[];
  onSaveSchedule: (schedule: DoctorCustomSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onToggleScheduleStatus: (scheduleId: string) => void;
}

const DAYS: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const OCCURRENCES: { value: MonthlyOccurrence; label: string }[] = [
  { value: 'FIRST', label: '1st' },
  { value: 'SECOND', label: '2nd' },
  { value: 'THIRD', label: '3rd' },
  { value: 'FOURTH', label: '4th' },
  { value: 'LAST', label: 'Last' }
];

export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export const DoctorScheduleForm: React.FC<DoctorScheduleFormProps> = ({
  doctor,
  doctorsList,
  selectedDoctorId,
  onDoctorChange,
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
  onToggleScheduleStatus
}) => {
  // Editing state (null = adding new)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<DoctorCustomSchedule | null>(null);

  // Form Fields
  const [scheduleType, setScheduleType] = useState<ScheduleRecurrenceType>('WEEKLY');
  const [sessionDate, setSessionDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startingSaturday, setStartingSaturday] = useState<string>(() => {
    const today = new Date();
    // find next Saturday
    const day = today.getDay();
    const diff = (6 - day + 7) % 7;
    today.setDate(today.getDate() + diff);
    return today.toISOString().split('T')[0];
  });
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Saturday');
  const [weekOfMonth, setWeekOfMonth] = useState<MonthlyOccurrence>('SECOND');
  const [startTime, setStartTime] = useState<string>('10:30 AM');
  const [endTime, setEndTime] = useState<string>('11:30 AM');
  const [consultationDuration, setConsultationDuration] = useState<number>(30);
  const [generationRangeMonths, setGenerationRangeMonths] = useState<3 | 6 | 12>(6);
  const [roomNumber, setRoomNumber] = useState<string>('CareOn Medical Clinic, Chamber 101');
  const [notes, setNotes] = useState<string>('');

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active doctor
  const currentDoctor = useMemo(() => {
    if (doctor?.id) return doctor;
    if (selectedDoctorId && doctorsList) {
      return doctorsList.find((d) => d.id === selectedDoctorId) || doctor;
    }
    return doctor;
  }, [doctor, selectedDoctorId, doctorsList]);

  // When starting date changes for Alternate Week, sync day of week
  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    if (newDate) {
      const calculatedDay = getDayOfWeekFromDate(newDate);
      setDayOfWeek(calculatedDay);
    }
  };

  // When Starting Saturday changes, validate if it's a Saturday
  const handleStartingSaturdayChange = (newDate: string) => {
    setStartingSaturday(newDate);
    if (newDate) {
      const calculatedDay = getDayOfWeekFromDate(newDate);
      if (calculatedDay !== 'Saturday') {
        setValidationError(
          `Note: Selected date (${formatScheduleDate(newDate)}) is a ${calculatedDay}. Alternate Saturday pattern generates every 14 days starting on Saturdays.`
        );
      } else {
        setValidationError(null);
      }
    }
  };

  // Reset form to default
  const resetForm = () => {
    setEditingScheduleId(null);
    setScheduleType('WEEKLY');
    const today = new Date().toISOString().split('T')[0];
    setSessionDate(today);
    setStartDate(today);
    setDayOfWeek('Saturday');
    setWeekOfMonth('SECOND');
    setStartTime('10:30 AM');
    setEndTime('11:30 AM');
    setConsultationDuration(30);
    setGenerationRangeMonths(6);
    setNotes('');
    setValidationError(null);
  };

  // Load schedule for editing
  const handleEditClick = (sch: DoctorCustomSchedule) => {
    setEditingScheduleId(sch.id);
    setScheduleType(sch.scheduleType || sch.recurrenceType || 'WEEKLY');
    if (sch.sessionDate) setSessionDate(sch.sessionDate);
    if (sch.specificDate) setSessionDate(sch.specificDate);
    if (sch.startDate) setStartDate(sch.startDate);
    if (sch.startingSaturday) setStartingSaturday(sch.startingSaturday);
    if (sch.dayOfWeek) setDayOfWeek(sch.dayOfWeek);
    if (sch.weekOfMonth) setWeekOfMonth(sch.weekOfMonth);
    if (sch.monthlyOccurrence) setWeekOfMonth(sch.monthlyOccurrence);
    if (sch.startTime) setStartTime(sch.startTime);
    if (sch.endTime) setEndTime(sch.endTime);
    if (sch.consultationDuration) setConsultationDuration(sch.consultationDuration);
    if (sch.generationRangeMonths) setGenerationRangeMonths(sch.generationRangeMonths);
    if (sch.roomNumber || sch.chamber) setRoomNumber(sch.roomNumber || sch.chamber || '');
    if (sch.notes || sch.note) setNotes(sch.notes || sch.note || '');
    setValidationError(null);

    // Scroll form into view
    const el = document.getElementById('add-session-form-top');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Real-time Schedule Preview Draft object
  const previewScheduleConfig: Partial<DoctorCustomSchedule> = useMemo(() => {
    return {
      scheduleType,
      recurrenceType: scheduleType,
      sessionDate,
      specificDate: sessionDate,
      startDate,
      startingSaturday,
      dayOfWeek,
      weekOfMonth,
      monthlyOccurrence: weekOfMonth,
      monthlyDayOfWeek: dayOfWeek,
      startTime,
      endTime,
      consultationDuration,
      generationRangeMonths,
      intervalDays: scheduleType === 'EVERY_15_DAYS' ? 15 : scheduleType === 'ALTERNATE_WEEK' || scheduleType === 'ALTERNATE_SATURDAY' ? 14 : undefined,
      roomNumber,
      chamber: roomNumber,
      status: 'ACTIVE'
    };
  }, [
    scheduleType,
    sessionDate,
    startDate,
    startingSaturday,
    dayOfWeek,
    weekOfMonth,
    startTime,
    endTime,
    consultationDuration,
    generationRangeMonths,
    roomNumber
  ]);

  // Upcoming preview dates computed in real-time
  const previewUpcomingDates = useMemo(() => {
    return generateScheduleSessionDates(previewScheduleConfig, generationRangeMonths, 18);
  }, [previewScheduleConfig, generationRangeMonths]);

  // Check end time vs start time
  const timeOrderValid = useMemo(() => {
    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (startM === null || endM === null) return true;
    return endM > startM;
  }, [startTime, endTime]);

  // Handle Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Doctor validation
    if (!currentDoctor?.id && !currentDoctor?.name) {
      setValidationError('Please select or specify a Doctor.');
      return;
    }

    // 2. Start Date validation
    if (scheduleType === 'ONE_TIME') {
      if (!sessionDate) {
        setValidationError('Session Date is required for One Time schedule.');
        return;
      }
    } else if (scheduleType === 'ALTERNATE_WEEK') {
      if (!startDate) {
        setValidationError('Starting Date is required for Alternate Week schedule.');
        return;
      }
    } else if (scheduleType === 'EVERY_15_DAYS') {
      if (!startDate) {
        setValidationError('Starting Date is required for Every 15 Days schedule.');
        return;
      }
    } else if (scheduleType === 'ALTERNATE_SATURDAY') {
      if (!startingSaturday && !startDate) {
        setValidationError('Starting Saturday is required for Alternate Saturday schedule.');
        return;
      }
    }

    // 3. Time validation
    if (!startTime.trim() || !endTime.trim()) {
      setValidationError('Start Time and End Time are required.');
      return;
    }

    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (startM !== null && endM !== null && endM <= startM) {
      setValidationError('End Time must be later than Start Time (e.g., 10:30 AM to 11:30 AM).');
      return;
    }

    // 4. Duration validation
    if (!consultationDuration || consultationDuration <= 0) {
      setValidationError('Consultation Duration must be a positive number of minutes (e.g. 30).');
      return;
    }

    // 5. Prevent duplicate generated sessions for the same: Doctor + Date + Start Time
    if (scheduleType === 'ONE_TIME') {
      const duplicate = schedules.find(
        (s) =>
          s.id !== editingScheduleId &&
          (s.sessionDate === sessionDate || s.specificDate === sessionDate) &&
          s.startTime.toLowerCase().replace(/\s+/g, '') === startTime.toLowerCase().replace(/\s+/g, '') &&
          s.status === 'ACTIVE'
      );
      if (duplicate) {
        setValidationError(
          `Duplicate session conflict: A session is already configured on ${formatScheduleDate(sessionDate)} at ${startTime}.`
        );
        return;
      }
    }

    // Construct schedule object
    const newSchedule: DoctorCustomSchedule = {
      id: editingScheduleId || `sch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      doctorId: currentDoctor?.id,
      doctorName: currentDoctor?.name,
      title: formatSchedulePattern(previewScheduleConfig),
      scheduleType,
      recurrenceType: scheduleType,
      sessionDate: scheduleType === 'ONE_TIME' ? sessionDate : undefined,
      specificDate: scheduleType === 'ONE_TIME' ? sessionDate : undefined,
      startDate:
        scheduleType === 'ALTERNATE_WEEK' || scheduleType === 'EVERY_15_DAYS'
          ? startDate
          : scheduleType === 'ALTERNATE_SATURDAY'
          ? startingSaturday || startDate
          : undefined,
      startingSaturday: scheduleType === 'ALTERNATE_SATURDAY' ? startingSaturday || startDate : undefined,
      dayOfWeek:
        scheduleType === 'WEEKLY' || scheduleType === 'ALTERNATE_WEEK' || scheduleType === 'ONCE_A_MONTH'
          ? dayOfWeek
          : scheduleType === 'ALTERNATE_SATURDAY'
          ? 'Saturday'
          : undefined,
      weekOfMonth: scheduleType === 'ONCE_A_MONTH' ? weekOfMonth : undefined,
      monthlyOccurrence: scheduleType === 'ONCE_A_MONTH' ? weekOfMonth : undefined,
      monthlyDayOfWeek: scheduleType === 'ONCE_A_MONTH' ? dayOfWeek : undefined,
      intervalDays:
        scheduleType === 'EVERY_15_DAYS'
          ? 15
          : scheduleType === 'ALTERNATE_WEEK' || scheduleType === 'ALTERNATE_SATURDAY'
          ? 14
          : undefined,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      consultationDuration: Number(consultationDuration),
      generationRangeMonths,
      roomNumber: roomNumber.trim() || 'CareOn Medical Clinic, Chamber 101',
      chamber: roomNumber.trim() || 'CareOn Medical Clinic, Chamber 101',
      status: 'ACTIVE',
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: editingScheduleId
        ? schedules.find((s) => s.id === editingScheduleId)?.createdAt || new Date().toISOString()
        : new Date().toISOString()
    };

    onSaveSchedule(newSchedule);
    setSuccessMessage(
      editingScheduleId
        ? 'Schedule successfully updated.'
        : `New recurring chamber schedule configured for Dr. ${currentDoctor?.name || 'Doctor'}.`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
    resetForm();
  };

  return (
    <div className="space-y-6" id="add-session-form-top">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-[#004d44] to-[#007E70] p-4 sm:p-5 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-teal-200 text-[11px] font-bold tracking-wide uppercase">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Doctor Chamber & Appointment Recurrence</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
            {editingScheduleId ? 'Edit Chamber Session Schedule' : 'Add New Session / Recurring Chamber'}
          </h2>
          <p className="text-xs text-teal-100/90 leading-relaxed max-w-xl">
            Configure visiting patterns: Weekly (7d), Alternate Week (14d), Alternate Saturday, Every 15 Days (calendar days), Once a Month, or One Time.
          </p>
        </div>

        {editingScheduleId && (
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#007E70]" />
            <span>Schedule Configuration</span>
          </span>
          {editingScheduleId ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
              Editing Schedule #{editingScheduleId.slice(-6)}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#007E70] text-[11px] font-bold border border-teal-200">
              New Recurrence Rule
            </span>
          )}
        </div>

        {/* Row 1: Doctor Selection (if multiple) and Schedule Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctor Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Doctor <span className="text-rose-500">*</span></span>
              {currentDoctor?.designation && (
                <span className="text-[11px] text-slate-500 font-normal">
                  {currentDoctor.designation}
                </span>
              )}
            </label>
            {doctorsList && doctorsList.length > 0 && onDoctorChange ? (
              <select
                value={currentDoctor?.id || selectedDoctorId || ''}
                onChange={(e) => onDoctorChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] min-h-[44px]"
              >
                <option value="">Select Doctor Specialist...</option>
                {doctorsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.name} ({d.departmentName || d.specialtyId || d.designation || 'Consultant'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 flex items-center justify-between min-h-[44px]">
                <span>Dr. {currentDoctor?.name || 'Selected Doctor'}</span>
                <span className="text-[11px] font-semibold text-[#007E70] bg-teal-50 px-2 py-0.5 rounded-md">
                  Active Physician
                </span>
              </div>
            )}
          </div>

          {/* SCHEDULE TYPE / RECURRENCE Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>SCHEDULE TYPE / RECURRENCE</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={scheduleType}
              onChange={(e) => {
                const newType = e.target.value as ScheduleRecurrenceType;
                setScheduleType(newType);
                setValidationError(null);
              }}
              className="w-full px-3.5 py-2.5 bg-teal-50/50 border border-teal-300 rounded-xl text-xs sm:text-sm font-extrabold text-[#004d44] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/30 min-h-[44px]"
            >
              <option value="ONE_TIME">1. One Time / Specific Date</option>
              <option value="WEEKLY">2. Weekly</option>
              <option value="ALTERNATE_WEEK">3. Alternate Week (Every 14 days)</option>
              <option value="EVERY_15_DAYS">4. Every 15 Days (Calendar Days)</option>
              <option value="ONCE_A_MONTH">5. Once a Month (e.g. 2nd Saturday)</option>
              <option value="ALTERNATE_SATURDAY">6. Alternate Saturday (Every 2 weeks)</option>
            </select>
          </div>
        </div>

        {/* Row 2: CONDITIONAL RECURRENCE FIELDS */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#007E70]" />
            <span>Conditional Parameters for {formatSchedulePattern(previewScheduleConfig)}</span>
          </div>

          {/* 1. ONE TIME / SPECIFIC DATE */}
          {scheduleType === 'ONE_TIME' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Session Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                required
              />
              <p className="text-[11px] text-slate-500">
                This creates only one specific chamber session on this date.
              </p>
            </div>
          )}

          {/* 2. WEEKLY */}
          {scheduleType === 'WEEKLY' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Day of Week <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayOfWeek(d)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer min-h-[40px] ${
                      dayOfWeek === d
                        ? 'bg-[#007E70] text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Generates regular weekly chamber sessions every 7 days on {dayOfWeek}s.
              </p>
            </div>
          )}

          {/* 3. ALTERNATE WEEK */}
          {scheduleType === 'ALTERNATE_WEEK' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Starting Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  First session date in the 14-day cycle.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Day of Week (Auto-calculated)
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Generates every 14 days (2 weeks) on {dayOfWeek}s.
                </p>
              </div>
            </div>
          )}

          {/* 4. EVERY 15 DAYS */}
          {scheduleType === 'EVERY_15_DAYS' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Starting Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                required
              />
              <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#007E70] shrink-0 mt-0.5" />
                <span>
                  <strong>Calendar Interval:</strong> Generates exactly every 15 calendar days from {formatScheduleDate(startDate)} (e.g., 20 Sep, 05 Oct, 20 Oct, 04 Nov, 19 Nov...). Note: This is distinct from Alternate Week (14 days).
                </span>
              </div>
            </div>
          )}

          {/* 5. ONCE A MONTH */}
          {scheduleType === 'ONCE_A_MONTH' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Week of Month <span className="text-rose-500">*</span>
                </label>
                <select
                  value={weekOfMonth}
                  onChange={(e) => setWeekOfMonth(e.target.value as MonthlyOccurrence)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                >
                  {OCCURRENCES.map((occ) => (
                    <option key={occ.value} value={occ.value}>
                      {occ.label} Week of Month
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Day of Week <span className="text-rose-500">*</span>
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 sm:col-span-2">
                Example: 2nd Saturday of every month, or 1st Monday of every month. The public appointment system will only offer this exact date each month.
              </p>
            </div>
          )}

          {/* 6. ALTERNATE SATURDAY */}
          {scheduleType === 'ALTERNATE_SATURDAY' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Starting Saturday <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startingSaturday}
                onChange={(e) => handleStartingSaturdayChange(e.target.value)}
                className="w-full sm:w-64 px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
                required
              />
              <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#007E70] shrink-0 mt-0.5" />
                <span>
                  <strong>Dedicated Saturday Pattern:</strong> Generates every other Saturday (14-day interval, Saturdays only). Starting Saturday: {formatScheduleDate(startingSaturday)}.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Timings, Duration, Generation Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Start Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#007E70]" />
              <span>Start Time <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="e.g. 10:30 AM"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
              required
            />
          </div>

          {/* End Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>End Time <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="e.g. 11:30 AM"
              className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-xl font-semibold focus:outline-none focus:ring-2 min-h-[42px] ${
                !timeOrderValid
                  ? 'border-rose-500 text-rose-800 focus:ring-rose-400'
                  : 'border-slate-300 text-slate-900 focus:ring-[#007E70]'
              }`}
              required
            />
            {!timeOrderValid && (
              <p className="text-[10px] text-rose-600 font-bold">
                End time must be after start time!
              </p>
            )}
          </div>

          {/* Consultation Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-[#007E70]" />
              <span>Duration (Minutes) <span className="text-rose-500">*</span></span>
            </label>
            <select
              value={consultationDuration}
              onChange={(e) => setConsultationDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
            >
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes (Standard)</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          {/* Generation Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#007E70]" />
              <span>Generation Range</span>
            </label>
            <select
              value={generationRangeMonths}
              onChange={(e) => setGenerationRangeMonths(Number(e.target.value) as 3 | 6 | 12)}
              disabled={scheduleType === 'ONE_TIME'}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px] disabled:opacity-50"
            >
              <option value="3">Next 3 Months</option>
              <option value="6">Next 6 Months (Default)</option>
              <option value="12">Next 12 Months</option>
            </select>
          </div>
        </div>

        {/* Row 4: Chamber Room and Optional Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#007E70]" />
              <span>Chamber Room / Location</span>
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="CareOn Medical Clinic, Chamber 101"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              Admin Notes / Visiting Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prior booking required, reports review included"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#007E70] min-h-[42px]"
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* SCHEDULE PREVIEW (Section 9) */}
        {/* ================================================== */}
        <div className="rounded-2xl border-2 border-teal-600/30 bg-teal-50/40 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-teal-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#007E70] text-white flex items-center justify-center font-bold text-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider">
                  SCHEDULE PREVIEW
                </h4>
                <p className="text-[11px] text-teal-800">
                  Real-time calculated visiting dates based on selected recurrence
                </p>
              </div>
            </div>

            <div className="text-[11px] text-teal-900 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-teal-200 self-start sm:self-auto">
              Generated for: Next {generationRangeMonths} Months
            </div>
          </div>

          {/* Doctor + Pattern + Time Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-teal-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Doctor
              </span>
              <span className="font-extrabold text-slate-900">
                Dr. {currentDoctor?.name || 'Example Specialist'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pattern
              </span>
              <span className="font-bold text-[#007E70]">
                {formatSchedulePattern(previewScheduleConfig)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Time & Duration
              </span>
              <span className="font-bold text-slate-900">
                {startTime} – {endTime} ({consultationDuration} mins)
              </span>
            </div>
          </div>

          {/* Upcoming Sessions list */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-teal-900 flex items-center justify-between">
              <span>Upcoming Sessions ({previewUpcomingDates.length} dates calculated):</span>
              <span className="text-[10px] font-normal text-teal-700">
                Interval: {scheduleType === 'EVERY_15_DAYS' ? '15 Calendar Days' : scheduleType === 'ALTERNATE_WEEK' || scheduleType === 'ALTERNATE_SATURDAY' ? '14 Days' : 'Weekly/Monthly'}
              </span>
            </span>

            {previewUpcomingDates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No dates generated for current criteria.</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                {previewUpcomingDates.map((dateStr, idx) => (
                  <div
                    key={dateStr}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-300/80 text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-[#007E70] text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{formatScheduleDate(dateStr)}</span>
                    <span className="text-[10px] text-teal-700 font-medium">
                      ({getDayOfWeekFromDate(dateStr).slice(0, 3)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {editingScheduleId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[40px]"
            >
              Cancel Edit
            </button>
          )}

          <button
            type="submit"
            disabled={!timeOrderValid}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            {editingScheduleId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editingScheduleId ? 'Save Schedule Changes' : 'Add Recurring Schedule'}</span>
          </button>
        </div>
      </form>

      {/* ================================================== */}
      {/* 16. CONFIGURED SCHEDULES LIST & EDIT (Section 16) */}
      {/* ================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#007E70]" />
              <span>Configured Chamber Schedules ({schedules.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Active recurring and one-time chamber rules for Dr. {currentDoctor?.name || 'Doctor'}
            </p>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Editing or deleting rules preserves historical patient bookings</span>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No custom recurring schedules configured yet.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Use the form above to configure weekly, alternate-week, every 15 days, alternate Saturday, or monthly chamber sessions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Pattern</th>
                  <th className="py-2.5 px-3">Next Session</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => {
                  const isActive = sch.status !== 'INACTIVE' && sch.status !== 'CANCELLED';
                  const patternText = formatSchedulePattern(sch);
                  const nextDate = getNextUpcomingSessionDate(sch);

                  return (
                    <tr
                      key={sch.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        editingScheduleId === sch.id ? 'bg-teal-50/50 font-medium' : ''
                      }`}
                    >
                      {/* Pattern */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900">{patternText}</div>
                        {sch.roomNumber && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{sch.roomNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Next Session */}
                      <td className="py-3 px-3">
                        {nextDate ? (
                          <div className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                            {formatScheduleDate(nextDate)}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No upcoming</span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {sch.startTime} – {sch.endTime}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3 text-slate-600">
                        {sch.consultationDuration || 30} mins
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onToggleScheduleStatus(sch.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: Edit, Deactivate, Delete */}
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(sch)}
                            className="p-1.5 rounded-lg text-[#007E70] hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Edit schedule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleScheduleStatus(sch.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={isActive ? 'Deactivate schedule' : 'Activate schedule'}
                          >
                            {isActive ? (
                              <ToggleRight className="w-4 h-4 text-[#007E70]" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setScheduleToDelete(sch)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete schedule rule"
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

      {/* Confirmation Dialog for Deleting Schedule */}
      <ConfirmationDialog
        isOpen={Boolean(scheduleToDelete)}
        title="Delete Chamber Schedule Rule?"
        message={
          scheduleToDelete
            ? `Are you sure you want to delete the schedule rule: "${formatSchedulePattern(
                scheduleToDelete
              )}"? Historical patient appointment records will NOT be deleted.`
            : ''
        }
        confirmLabel="Yes, Delete Rule"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={() => {
          if (scheduleToDelete) {
            onDeleteSchedule(scheduleToDelete.id);
            setScheduleToDelete(null);
          }
        }}
        onCancel={() => setScheduleToDelete(null)}
      />
    </div>
  );
};
