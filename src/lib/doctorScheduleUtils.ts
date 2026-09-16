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
    const activeCustom = doctor.customSchedules.filter(
      (cs) => cs.status !== 'INACTIVE' && cs.status !== 'CANCELLED'
    );
    for (const schedule of activeCustom) {
      // Check effective date boundaries if set
      const startBound = schedule.startDate || schedule.effectiveFrom;
      const endBound = schedule.endDate || schedule.effectiveUntil;
      if (startBound && dateStr < startBound) continue;
      if (endBound && dateStr > endBound) continue;

      let isMatch = false;
      const type = schedule.scheduleType || schedule.recurrenceType;

      if (type === 'ONE_TIME' || type === 'SPECIFIC_DATE' || type === 'SPECIAL_CHAMBER') {
        if (schedule.sessionDate === dateStr || schedule.specificDate === dateStr) {
          isMatch = true;
        } else if (schedule.specificDates && schedule.specificDates.includes(dateStr)) {
          isMatch = true;
        }
      } else if (type === 'SPECIFIC_DATES') {
        if (schedule.specificDates && schedule.specificDates.includes(dateStr)) {
          isMatch = true;
        } else if (schedule.specificDate === dateStr || schedule.sessionDate === dateStr) {
          isMatch = true;
        }
      } else if (type === 'WEEKLY') {
        const targetDay = schedule.dayOfWeek || schedule.monthlyDayOfWeek;
        if (targetDay && dayOfWeek === targetDay) {
          isMatch = true;
        }
      } else if (type === 'ALTERNATE_WEEK') {
        // Generates every 14 days from starting date
        const start = schedule.startDate || schedule.effectiveFrom;
        if (start && checkIntervalMatch(dateStr, start, 14)) {
          const targetDay = schedule.dayOfWeek || getDayOfWeekFromDate(start);
          if (dayOfWeek === targetDay) {
            isMatch = true;
          }
        }
      } else if (type === 'EVERY_15_DAYS' || type === 'INTERVAL_DAYS') {
        // Generates every 15 calendar days from starting date
        const start = schedule.startDate || schedule.effectiveFrom;
        const interval = schedule.intervalDays || 15;
        if (start && checkIntervalMatch(dateStr, start, interval)) {
          isMatch = true;
        }
      } else if (type === 'ONCE_A_MONTH' || type === 'MONTHLY') {
        // Specific ordinal weekday in the month, e.g. 2nd Saturday or 1st Monday
        const occurrence = schedule.weekOfMonth || schedule.monthlyOccurrence;
        const targetDay = schedule.dayOfWeek || schedule.monthlyDayOfWeek;
        if (
          occurrence &&
          targetDay &&
          checkMonthlyOccurrence(dateStr, occurrence, targetDay)
        ) {
          isMatch = true;
        } else if (schedule.monthlyDaysOfMonth && schedule.monthlyDaysOfMonth.length > 0) {
          const dayNum = Number(dateStr.split('-')[2]);
          if (schedule.monthlyDaysOfMonth.includes(dayNum)) {
            isMatch = true;
          }
        }
      } else if (type === 'ALTERNATE_SATURDAY') {
        // Dedicated simple option: every other Saturday (14-day interval, Saturdays only)
        const start = schedule.startingSaturday || schedule.startDate || schedule.effectiveFrom;
        if (start && checkIntervalMatch(dateStr, start, 14) && dayOfWeek === 'Saturday') {
          isMatch = true;
        }
      } else if (type === 'MONTHLY_SPECIFIC_DAYS') {
        const dayNum = Number(dateStr.split('-')[2]);
        if (schedule.monthlyDaysOfMonth && schedule.monthlyDaysOfMonth.includes(dayNum)) {
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

    // Section 15 Safety Rule: If a doctor has active custom recurrence schedules (e.g. Once a Month),
    // do NOT fall back to generic weekly consultationDays (which would falsely show them available every week).
    const hasActiveExplicitWeekly =
      doctor.weeklySchedule && doctor.weeklySchedule.some((s) => s.isActive);
    if (!hasActiveExplicitWeekly) {
      return {
        isAvailable: false,
        source: 'UNAVAILABLE',
        reason: `Doctor does not hold chamber on ${dayOfWeek}s. Please check doctor's periodic chamber dates.`
      };
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
 * Generate upcoming chamber session dates for a schedule configuration
 * Generation Range: 3 Months, 6 Months (default), or 12 Months
 */
export function generateScheduleSessionDates(
  config: Partial<DoctorCustomSchedule>,
  rangeMonths: 3 | 6 | 12 = 6,
  maxCount: number = 24
): string[] {
  const type = config.scheduleType || config.recurrenceType || 'WEEKLY';
  const dates: string[] = [];

  const addDays = (baseDateStr: string, days: number): string => {
    const parts = baseDateStr.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getTodayStr = (): string => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const refStartStr =
    config.startDate ||
    config.startingSaturday ||
    config.sessionDate ||
    config.specificDate ||
    getTodayStr();

  const startParts = refStartStr.split('-').map(Number);
  const startDt = new Date(startParts[0], startParts[1] - 1, startParts[2]);

  const endDt = new Date(startDt);
  endDt.setMonth(endDt.getMonth() + (rangeMonths || 6));
  const endDateStr = `${endDt.getFullYear()}-${String(endDt.getMonth() + 1).padStart(2, '0')}-${String(endDt.getDate()).padStart(2, '0')}`;

  // 1. One Time / Specific Date
  if (type === 'ONE_TIME' || type === 'SPECIFIC_DATE') {
    const d = config.sessionDate || config.specificDate;
    if (d) dates.push(d);
    return dates;
  }

  // 2. Weekly
  if (type === 'WEEKLY') {
    const targetDay = config.dayOfWeek || 'Saturday';
    let cur = refStartStr;
    while (cur <= endDateStr && dates.length < maxCount) {
      if (getDayOfWeekFromDate(cur) === targetDay) {
        dates.push(cur);
      }
      cur = addDays(cur, 1);
    }
    return dates;
  }

  // 3. Alternate Week (Every 14 days)
  if (type === 'ALTERNATE_WEEK') {
    const start = config.startDate || refStartStr;
    let cur = start;
    while (cur <= endDateStr && dates.length < maxCount) {
      dates.push(cur);
      cur = addDays(cur, 14); // Exactly 14 days
    }
    return dates;
  }

  // 4. Every 15 Days (Every 15 calendar days)
  if (type === 'EVERY_15_DAYS') {
    const start = config.startDate || refStartStr;
    let cur = start;
    while (cur <= endDateStr && dates.length < maxCount) {
      dates.push(cur);
      cur = addDays(cur, 15); // Exactly 15 calendar days
    }
    return dates;
  }

  // 5. Alternate Saturday (Dedicated simple option: every 14 days on Saturdays)
  if (type === 'ALTERNATE_SATURDAY') {
    const start = config.startingSaturday || config.startDate || refStartStr;
    let cur = start;
    while (cur <= endDateStr && dates.length < maxCount) {
      dates.push(cur);
      cur = addDays(cur, 14); // 14 days
    }
    return dates;
  }

  // 6. Once a Month (e.g. 2nd Saturday or 1st Monday of every month)
  if (type === 'ONCE_A_MONTH' || type === 'MONTHLY') {
    const occurrence = config.weekOfMonth || config.monthlyOccurrence || 'SECOND';
    const targetDay = config.dayOfWeek || config.monthlyDayOfWeek || 'Saturday';

    let iterYear = startDt.getFullYear();
    let iterMonth = startDt.getMonth(); // 0-indexed
    const targetDayIndex = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ].indexOf(targetDay);

    while (dates.length < maxCount) {
      const checkDt = new Date(iterYear, iterMonth, 1);
      if (checkDt > endDt) break;

      let matchDay: number | null = null;
      let count = 0;
      let lastMatch = 1;

      for (let day = 1; day <= 31; day++) {
        const testD = new Date(iterYear, iterMonth, day);
        if (testD.getMonth() !== iterMonth) break;
        if (testD.getDay() === targetDayIndex) {
          count++;
          lastMatch = day;
          if (occurrence === 'FIRST' && count === 1) {
            matchDay = day;
            break;
          }
          if (occurrence === 'SECOND' && count === 2) {
            matchDay = day;
            break;
          }
          if (occurrence === 'THIRD' && count === 3) {
            matchDay = day;
            break;
          }
          if (occurrence === 'FOURTH' && count === 4) {
            matchDay = day;
            break;
          }
        }
      }

      if (occurrence === 'LAST') {
        matchDay = lastMatch;
      }

      if (matchDay !== null) {
        const dateStr = `${iterYear}-${String(iterMonth + 1).padStart(2, '0')}-${String(matchDay).padStart(2, '0')}`;
        if (dateStr >= refStartStr && dateStr <= endDateStr) {
          dates.push(dateStr);
        }
      }

      iterMonth++;
      if (iterMonth > 11) {
        iterMonth = 0;
        iterYear++;
      }
    }
    return dates;
  }

  return dates;
}

/**
 * Format Human-Readable Schedule Pattern
 */
export function formatSchedulePattern(config: Partial<DoctorCustomSchedule>): string {
  const type = config.scheduleType || config.recurrenceType || 'WEEKLY';

  if (type === 'ONE_TIME' || type === 'SPECIFIC_DATE') {
    const d = config.sessionDate || config.specificDate;
    return d ? `One Time (${formatScheduleDate(d)})` : 'One Time / Specific Date';
  }

  if (type === 'WEEKLY') {
    return `Every ${config.dayOfWeek || 'Saturday'}`;
  }

  if (type === 'ALTERNATE_WEEK') {
    const day = config.dayOfWeek || 'Scheduled Day';
    return `Alternate Week (Every 14 Days) — ${day}`;
  }

  if (type === 'EVERY_15_DAYS') {
    return 'Every 15 Days (Calendar Days)';
  }

  if (type === 'ONCE_A_MONTH' || type === 'MONTHLY') {
    const occMap: Record<string, string> = {
      FIRST: '1st',
      SECOND: '2nd',
      THIRD: '3rd',
      FOURTH: '4th',
      LAST: 'Last'
    };
    const occ = occMap[config.weekOfMonth || config.monthlyOccurrence || 'SECOND'] || '2nd';
    const day = config.dayOfWeek || config.monthlyDayOfWeek || 'Saturday';
    return `Every ${occ} ${day} of every month`;
  }

  if (type === 'ALTERNATE_SATURDAY') {
    return 'Alternate Saturday (Every 2 weeks)';
  }

  return 'Scheduled Chamber';
}

/**
 * Get Next Upcoming Session for a Doctor's custom schedule
 */
export function getNextUpcomingSessionDate(
  config: Partial<DoctorCustomSchedule>,
  fromToday: boolean = true
): string | null {
  const dates = generateScheduleSessionDates(config, 6, 12);
  if (dates.length === 0) return null;
  if (!fromToday) return dates[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const future = dates.filter((d) => d >= todayStr);
  return future.length > 0 ? future[0] : dates[0];
}

/**
 * Get Compact Schedule Summary for Doctor Profile (Requirement 17)
 * Example outputs:
 *  - Chamber: Every 2nd Saturday • 10:30 AM – 11:30 AM
 *  - Chamber: Every Saturday • 10:30 AM – 11:30 AM
 *  - Chamber: Every 15 Days • 10:30 AM – 11:30 AM
 */
export function getDoctorCompactScheduleSummary(doctor: Doctor): {
  chamberSummary: string;
  consultationFeeText: string;
} {
  const fee = doctor.consultationFee ?? doctor.fees?.newPatient;
  const feeText = fee !== undefined ? `₹${fee}` : 'By Appointment';

  // 1. Check if doctor has active custom schedules
  if (doctor.customSchedules && doctor.customSchedules.length > 0) {
    const activeCustom = doctor.customSchedules.filter(
      (cs) => cs.status !== 'INACTIVE' && cs.status !== 'CANCELLED'
    );
    if (activeCustom.length > 0) {
      const primary = activeCustom[0];
      const patternText = formatSchedulePattern(primary);
      const timeStr =
        primary.startTime && primary.endTime
          ? `${primary.startTime} – ${primary.endTime}`
          : doctor.consultationTime || '10:30 AM – 11:30 AM';
      return {
        chamberSummary: `${patternText} • ${timeStr}`,
        consultationFeeText: feeText
      };
    }
  }

  // 2. Check weekly schedule
  if (doctor.weeklySchedule && doctor.weeklySchedule.length > 0) {
    const activeSlots = doctor.weeklySchedule.filter((s) => s.isActive);
    if (activeSlots.length > 0) {
      const days = activeSlots.map((s) => DAY_SHORT_MAP[s.day]).join(', ');
      const timeStr = `${activeSlots[0].startTime} – ${activeSlots[0].endTime}`;
      return {
        chamberSummary: `Every ${days} • ${timeStr}`,
        consultationFeeText: feeText
      };
    }
  }

  // 3. Fallback to consultationDays
  if (doctor.consultationDays && doctor.consultationDays.length > 0) {
    return {
      chamberSummary: `${doctor.consultationDays.join(', ')} • ${doctor.consultationTime || '10:30 AM – 11:30 AM'}`,
      consultationFeeText: feeText
    };
  }

  return {
    chamberSummary: 'Chamber: By Appointment',
    consultationFeeText: feeText
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
