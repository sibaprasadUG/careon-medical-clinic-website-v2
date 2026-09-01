import {
  Doctor,
  DayOfWeek,
  DoctorWeeklyScheduleSlot,
  DoctorCustomSchedule,
  DoctorScheduleException,
  MonthlyOccurrence
} from '../types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const DAY_SHORT_MAP: Record<DayOfWeek, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

export const SHORT_DAY_TO_FULL: Record<string, DayOfWeek> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};

/**
 * Get DayOfWeek from ISO date string (YYYY-MM-DD)
 */
export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const parts = dateStr.split('-');
  if (parts.length < 3) return 'Monday';
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday ...
  const map: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return map[dayIndex];
}

/**
 * Format ISO date string into readable English/Bengali
 */
export function formatScheduleDate(dateStr: string, lang: 'en' | 'bn' = 'en'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  
  if (lang === 'bn') {
    return d.toLocaleDateString('bn-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Check if a date satisfies monthly occurrence (e.g. 1st Monday, 3rd Wednesday, Last Friday)
 */
export function checkMonthlyOccurrence(
  dateStr: string,
  occurrence: MonthlyOccurrence,
  targetDay: DayOfWeek
): boolean {
  const parts = dateStr.split('-');
  if (parts.length < 3) return false;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const d = new Date(year, month, day);

  const dayOfWeek = getDayOfWeekFromDate(dateStr);
  if (dayOfWeek !== targetDay) return false;

  // Calculate week index in month
  const firstDayOfMonth = new Date(year, month, 1);
  let count = 0;
  for (let testDay = 1; testDay <= 31; testDay++) {
    const testDate = new Date(year, month, testDay);
    if (testDate.getMonth() !== month) break;
    const testDayOfWeek = getDayOfWeekFromDate(
      `${year}-${String(month + 1).padStart(2, '0')}-${String(testDay).padStart(2, '0')}`
    );
    if (testDayOfWeek === targetDay) {
      count++;
      if (testDay === day) {
        if (occurrence === 'FIRST' && count === 1) return true;
        if (occurrence === 'SECOND' && count === 2) return true;
        if (occurrence === 'THIRD' && count === 3) return true;
        if (occurrence === 'FOURTH' && count === 4) return true;
      }
    }
  }

  if (occurrence === 'LAST') {
    // Check if there is another matching day later in the month
    const nextWeekDate = new Date(year, month, day + 7);
    return nextWeekDate.getMonth() !== month;
  }

  return false;
}

/**
 * Check if a date matches interval recurrence (e.g., Every 15 days from startDate)
 */
export function checkIntervalMatch(
  dateStr: string,
  startDateStr: string,
  intervalDays: number
): boolean {
  if (!startDateStr || !dateStr || intervalDays <= 0) return false;
  const d1 = new Date(startDateStr);
  const d2 = new Date(dateStr);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime < 0) return false;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays % intervalDays === 0;
}

export interface DoctorAvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  source: 'EXCEPTION' | 'CUSTOM_DATE' | 'WEEKLY' | 'UNAVAILABLE';
  startTime?: string;
  endTime?: string;
  timeDisplay?: string;
  roomNumber?: string;
  location?: string;
}

/**
 * Core Evaluation Engine for Doctor Availability on a specific date (YYYY-MM-DD)
 * Priority: Specific Date Exception > Custom Schedule (Specific/Recurring) > Weekly Recurring Schedule
 */
export function evaluateDoctorAvailability(
  doctor: Doctor,
  dateStr: string
): DoctorAvailabilityResult {
  if (!doctor || !dateStr) {
    return { isAvailable: false, source: 'UNAVAILABLE', reason: 'Invalid parameters' };
  }

  // 1. Check Exceptions (Priority 1)
  if (doctor.scheduleExceptions && doctor.scheduleExceptions.length > 0) {
    const exception = doctor.scheduleExceptions.find((ex) => ex.date === dateStr);
    if (exception) {
      if (
        exception.exceptionType === 'CANCELLED' ||
        exception.exceptionType === 'HOLIDAY' ||
        exception.exceptionType === 'NOT_AVAILABLE'
      ) {
        return {
          isAvailable: false,
          source: 'EXCEPTION',
          reason: exception.reason || 'Doctor consultation unavailable / chamber closed on this date.'
        };
      }
      if (exception.exceptionType === 'RESCHEDULED') {
        return {
          isAvailable: false,
          source: 'EXCEPTION',
          reason: `Rescheduled to ${exception.replacementDate ? formatScheduleDate(exception.replacementDate) : 'a later date'}. (${exception.reason || 'Special notice'})`
        };
      }
      if (exception.exceptionType === 'SPECIAL_HOURS') {
        const timeDisplay = `${exception.replacementStartTime || ''} – ${exception.replacementEndTime || ''}`;
        return {
          isAvailable: true,
          source: 'EXCEPTION',
          startTime: exception.replacementStartTime,
          endTime: exception.replacementEndTime,
          timeDisplay: timeDisplay.trim() !== '–' ? timeDisplay : doctor.consultationTime,
          location: exception.location || doctor.roomNumber || 'Chamber 101',
          roomNumber: doctor.roomNumber
        };
      }
    }

    // Check if today is a replacement date for a rescheduled exception
    const replacementException = doctor.scheduleExceptions.find(
      (ex) => ex.replacementDate === dateStr && ex.exceptionType === 'RESCHEDULED'
    );
    if (replacementException) {
      const timeDisplay = `${replacementException.replacementStartTime || ''} – ${replacementException.replacementEndTime || ''}`;
      return {
        isAvailable: true,
        source: 'EXCEPTION',
        startTime: replacementException.replacementStartTime,
        endTime: replacementException.replacementEndTime,
        timeDisplay: timeDisplay.trim() !== '–' ? timeDisplay : doctor.consultationTime,
        location: replacementException.location || doctor.roomNumber || 'Chamber 101',
        roomNumber: doctor.roomNumber
      };
    }
  }

  const dayOfWeek = getDayOfWeekFromDate(dateStr);

  // 2. Check Custom / Date-based Schedules (Priority 2)
  if (doctor.customSchedules && doctor.customSchedules.length > 0) {
    const activeCustom = doctor.customSchedules.filter((cs) => cs.status === 'ACTIVE');
    for (const schedule of activeCustom) {
      // Check effective dates if set
      if (schedule.effectiveFrom && dateStr < schedule.effectiveFrom) continue;
      if (schedule.effectiveUntil && dateStr > schedule.effectiveUntil) continue;

      let isMatch = false;
      const type = schedule.scheduleType || schedule.recurrenceType;

      if (type === 'SPECIFIC_DATE' || type === 'SPECIAL_CHAMBER') {
        if (schedule.specificDate === dateStr) {
          isMatch = true;
        } else if (schedule.specificDates && schedule.specificDates.includes(dateStr)) {
          isMatch = true;
        }
      } else if (type === 'SPECIFIC_DATES') {
        if (schedule.specificDates && schedule.specificDates.includes(dateStr)) {
          isMatch = true;
        } else if (schedule.specificDate === dateStr) {
          isMatch = true;
        }
      } else if (type === 'EVERY_15_DAYS' || type === 'INTERVAL_DAYS') {
        const start = schedule.startDate || schedule.effectiveFrom;
        const interval = schedule.intervalDays || 15;
        if (start && checkIntervalMatch(dateStr, start, interval)) {
          isMatch = true;
        }
      } else if (type === 'MONTHLY') {
        if (
          schedule.monthlyOccurrence &&
          schedule.monthlyDayOfWeek &&
          checkMonthlyOccurrence(dateStr, schedule.monthlyOccurrence, schedule.monthlyDayOfWeek)
        ) {
          isMatch = true;
        } else if (schedule.monthlyDaysOfMonth && schedule.monthlyDaysOfMonth.length > 0) {
          const dayNum = Number(dateStr.split('-')[2]);
          if (schedule.monthlyDaysOfMonth.includes(dayNum)) {
            isMatch = true;
          }
        }
      } else if (type === 'MONTHLY_SPECIFIC_DAYS') {
        const dayNum = Number(dateStr.split('-')[2]);
        if (schedule.monthlyDaysOfMonth && schedule.monthlyDaysOfMonth.includes(dayNum)) {
          isMatch = true;
        }
      } else if (type === 'WEEKLY') {
        const targetDay = schedule.dayOfWeek || schedule.monthlyDayOfWeek;
        if (targetDay && dayOfWeek === targetDay) {
          isMatch = true;
        }
      }

      if (isMatch) {
        const timeDisplay = `${schedule.startTime} – ${schedule.endTime}`;
        return {
          isAvailable: true,
          source: 'CUSTOM_DATE',
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          timeDisplay,
          roomNumber: schedule.chamber || schedule.roomNumber || doctor.roomNumber || 'Chamber 101',
          location: schedule.location || schedule.chamber || doctor.roomNumber || 'Chamber 101'
        };
      }
    }
  }

  // 3. Check Weekly Recurring Schedule (Priority 3)
  if (doctor.weeklySchedule && doctor.weeklySchedule.length > 0) {
    const slot = doctor.weeklySchedule.find((s) => s.day === dayOfWeek && s.isActive);
    if (slot) {
      const timeDisplay = `${slot.startTime} – ${slot.endTime}`;
      return {
        isAvailable: true,
        source: 'WEEKLY',
        startTime: slot.startTime,
        endTime: slot.endTime,
        timeDisplay,
        roomNumber: slot.roomNumber || doctor.roomNumber || 'Chamber 101',
        location: slot.location || slot.roomNumber || doctor.roomNumber || 'Chamber 101'
      };
    }
  } else if (doctor.consultationDays && doctor.consultationDays.length > 0) {
    // Backward compatibility with consultationDays (e.g. ['Mon', 'Wed', 'Fri'])
    const shortDay = DAY_SHORT_MAP[dayOfWeek];
    const isDayPresent =
      doctor.consultationDays.includes(shortDay) ||
      doctor.consultationDays.includes(dayOfWeek);

    if (isDayPresent) {
      return {
        isAvailable: true,
        source: 'WEEKLY',
        timeDisplay: doctor.consultationTime || '05:00 PM – 08:30 PM',
        roomNumber: doctor.roomNumber || 'Chamber 101',
        location: doctor.roomNumber || 'Chamber 101'
      };
    }
  }

  return {
    isAvailable: false,
    source: 'UNAVAILABLE',
    reason: `Doctor does not hold chamber on ${dayOfWeek}s.`
  };
}

/**
 * Get Clean Public Display Summary for Doctor Schedule
 */
export function getDoctorPublicScheduleSummary(
  doctor: Doctor,
  lang: 'en' | 'bn' = 'en'
): { badge?: string; scheduleText: string; timeText: string; isVisitingSpecialist?: boolean } {
  // If doctor only has custom/specific-date schedules and no active weekly recurring days
  const hasWeekly =
    (doctor.weeklySchedule && doctor.weeklySchedule.some((s) => s.isActive)) ||
    (doctor.consultationDays && doctor.consultationDays.length > 0);

  const hasCustomDates = doctor.customSchedules && doctor.customSchedules.length > 0;

  if (!hasWeekly && hasCustomDates) {
    // Find next upcoming date
    const todayStr = new Date().toISOString().split('T')[0];
    let nextDate: string | null = null;

    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const testStr = d.toISOString().split('T')[0];
      const evalRes = evaluateDoctorAvailability(doctor, testStr);
      if (evalRes.isAvailable) {
        nextDate = testStr;
        break;
      }
    }

    return {
      badge: lang === 'en' ? 'Visiting Specialist' : 'ভিজিটিং স্পেশালিস্ট',
      scheduleText: nextDate
        ? lang === 'en'
          ? `Next Consultation: ${formatScheduleDate(nextDate, 'en')}`
          : `পরবর্তী চেম্বার: ${formatScheduleDate(nextDate, 'bn')}`
        : lang === 'en'
        ? 'Periodic Visiting Specialist'
        : 'নিয়মিত ভিজিটিং স্পেশালিস্ট',
      timeText: doctor.consultationTime || 'Specialist Chamber',
      isVisitingSpecialist: true
    };
  }

  // Normal recurring doctor
  let daysStr = '';
  if (doctor.weeklySchedule && doctor.weeklySchedule.length > 0) {
    daysStr = doctor.weeklySchedule
      .filter((s) => s.isActive)
      .map((s) => DAY_SHORT_MAP[s.day])
      .join(', ');
  } else if (doctor.consultationDays && doctor.consultationDays.length > 0) {
    daysStr = doctor.consultationDays.join(', ');
  }

  return {
    scheduleText: daysStr || (lang === 'en' ? 'Mon, Wed, Fri' : 'সোম, বুধ, শুক্র'),
    timeText: doctor.consultationTime || '05:00 PM – 08:30 PM',
    isVisitingSpecialist: false
  };
}
