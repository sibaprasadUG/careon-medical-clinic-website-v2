import { AppointmentRequest, AdminUser } from '../types';
import { DataAccessLayer } from './dal';

export interface NormalizedPhoneResult {
  isValid: boolean;
  raw: string;
  normalized: string; // e.g. 919831123456
  display: string;    // e.g. +91 98311 23456
  error?: string;
}

/**
 * Normalizes Indian mobile numbers for WhatsApp Click-to-Chat URL
 */
export function normalizeIndianPhoneNumber(phoneStr?: string): NormalizedPhoneResult {
  if (!phoneStr || typeof phoneStr !== 'string') {
    return {
      isValid: false,
      raw: '',
      normalized: '',
      display: '',
      error: 'Patient phone number is missing.'
    };
  }

  const raw = phoneStr.trim();
  const digitsOnly = raw.replace(/\D/g, '');

  // Case 1: 10 digits (Standard Indian mobile)
  if (digitsOnly.length === 10) {
    return {
      isValid: true,
      raw,
      normalized: `91${digitsOnly}`,
      display: `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`
    };
  }

  // Case 2: 11 digits starting with 0 (e.g. 09831123456)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const tenDigits = digitsOnly.slice(1);
    return {
      isValid: true,
      raw,
      normalized: `91${tenDigits}`,
      display: `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`
    };
  }

  // Case 3: 12 digits starting with 91 (e.g. 919831123456)
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const tenDigits = digitsOnly.slice(2);
    return {
      isValid: true,
      raw,
      normalized: digitsOnly,
      display: `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`
    };
  }

  // Case 4: Other non-standard length
  return {
    isValid: false,
    raw,
    normalized: digitsOnly,
    display: raw,
    error: 'Must be a valid 10-digit Indian mobile number.'
  };
}

/**
 * Formats date into readable format if YYYY-MM-DD or standard ISO string
 */
export function formatAppointmentDate(dateStr?: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  }
  return dateStr;
}

export type WhatsAppMessageType =
  | 'CONFIRMATION'
  | 'RESCHEDULE'
  | 'CANCELLATION';

export interface GenerateMessageOptions {
  appointment: AppointmentRequest;
  language?: 'en' | 'bn';
  messageType?: WhatsAppMessageType;
  customDoctorName?: string;
  customDepartment?: string;
  customServiceName?: string;
  customDate?: string;
  customTime?: string;
}

/**
 * CareOn Medical Clinic WhatsApp Service
 * 
 * Provides centralized message formatting, phone number verification,
 * and click-to-chat URL building.
 * Abstracted to allow drop-in WhatsApp Cloud API or Twilio integration in the future
 * without exposing API keys or making deceptive delivery claims.
 */
export class WhatsAppService {
  public static readonly CLINIC_WHATSAPP = '9933335131';
  public static readonly CLINIC_CALL = '9933520248';
  public static readonly CLINIC_HELPLINE_FORMATTED = '9933335131 / 9933520248';
  public static readonly CLINIC_EMAIL = 'info@careonmedical.in';
  public static readonly CLINIC_ADDRESS_LINE = 'Kumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401';
  public static readonly CLINIC_FULL_ADDRESS = 'CareOn Medical Clinic\nKumarpur (Amarttya Palli), Contai, Purba Medinipur, 721401';
  public static readonly CLINIC_GOOGLE_MAPS_LINK = 'https://maps.google.com/?q=21.770644,87.7416694';
  public static readonly TAGLINE = 'Caring Beyond Treatment';

  /**
   * Generates formatted message text for WhatsApp communication
   */
  public static generateMessage(options: GenerateMessageOptions): string {
    const {
      appointment,
      language = 'en',
      messageType = 'CONFIRMATION',
      customDoctorName,
      customServiceName,
      customDate,
      customTime
    } = options;

    const patientName = appointment.patientName?.trim() || 'Patient';
    const isDoctor = appointment.bookingType === 'DOCTOR_CONSULTATION' || appointment.requestType === 'DOCTOR';
    const isHome = appointment.bookingType === 'HOME_SERVICE' || appointment.serviceMode === 'HOME' || appointment.locationType === 'HOME' || appointment.serviceType === 'HOME';

    const rawDoc = customDoctorName || appointment.confirmedDoctorName || appointment.doctorName || 'Specialist Doctor';
    const cleanDoc = rawDoc.replace(/^(Dr\.?|DR\.?)\s+/gi, '').replace(/^(Dr\.?|DR\.?)\s+/gi, '').trim();
    const serviceName = customServiceName || appointment.confirmedServiceName || appointment.serviceName || 'Medical Service';
    const subjectName = isDoctor ? (cleanDoc ? `Dr. ${cleanDoc}` : 'Dr. Specialist') : serviceName;

    const confirmedDate = customDate || formatAppointmentDate(appointment.confirmedDate) || formatAppointmentDate(appointment.preferredDate) || formatAppointmentDate(appointment.requestedDate) || 'As Scheduled';
    const confirmedTime = customTime || appointment.confirmedTime || appointment.preferredTime || appointment.requestedTimeWindow || 'As Scheduled';

    // Location text construction
    const clinicLocationBlock = `CareOn Medical Clinic\n${this.CLINIC_ADDRESS_LINE}\nGoogle Maps: ${this.CLINIC_GOOGLE_MAPS_LINK}`;
    const homeLocationBlock = `Doorstep Visit at ${appointment.address || 'Patient Address'}${appointment.area ? ` (${appointment.area})` : ''}`;
    const locationText = isHome ? homeLocationBlock : clinicLocationBlock;

    // --- CANCELLATION TEMPLATE ---
    if (messageType === 'CANCELLATION') {
      if (language === 'bn') {
        return `CareOn Medical Clinic
Appointment Cancellation Notice

Dear ${patientName},

We regret to inform you that your appointment with CareOn Medical Clinic has been cancelled.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

For assistance or to request another appointment, please contact:
Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
      }

      return `CareOn Medical Clinic
Appointment Cancellation Notice

Dear ${patientName},

We regret to inform you that your appointment with CareOn Medical Clinic has been cancelled.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

For assistance or to request another appointment, please contact:
Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
    }

    // --- RESCHEDULE TEMPLATE ---
    if (messageType === 'RESCHEDULE') {
      if (language === 'bn') {
        return `CareOn Medical Clinic
Appointment Rescheduled

Dear ${patientName},

Your appointment at CareOn Medical Clinic has been rescheduled.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

Location:
${locationText}

${isHome ? 'Please be available at your specified address 10 minutes before your scheduled time.' : 'Please arrive 10 minutes before your scheduled time.'}

Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
      }

      return `CareOn Medical Clinic
Appointment Rescheduled

Dear ${patientName},

Your appointment at CareOn Medical Clinic has been rescheduled.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

Location:
${locationText}

${isHome ? 'Please be available at your specified address 10 minutes before your scheduled time.' : 'Please arrive 10 minutes before your scheduled time.'}

Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
    }

    // --- CONFIRMATION TEMPLATE (Exact format requested) ---
    if (language === 'bn') {
      return `CareOn Medical Clinic
Appointment Confirmed

Dear ${patientName},

Your appointment has been confirmed.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

Location:
${locationText}

${isHome ? 'Please be available at your specified address 10 minutes before your scheduled time.' : 'Please arrive 10 minutes before your scheduled time.'}

Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
    }

    return `CareOn Medical Clinic
Appointment Confirmed

Dear ${patientName},

Your appointment has been confirmed.

Doctor / Service:
${subjectName}

Date:
${confirmedDate}

Time:
${confirmedTime}

Location:
${locationText}

${isHome ? 'Please be available at your specified address 10 minutes before your scheduled time.' : 'Please arrive 10 minutes before your scheduled time.'}

Clinic Helpline / WhatsApp:
${this.CLINIC_HELPLINE_FORMATTED}

${this.TAGLINE}`;
  }

  /**
   * Generates a safe Click-to-Chat URL for WhatsApp
   */
  public static buildClickToChatUrl(phone: string, message: string): {
    url: string;
    phoneInfo: NormalizedPhoneResult;
  } {
    const phoneInfo = normalizeIndianPhoneNumber(phone);
    if (!phoneInfo.isValid) {
      return {
        url: '',
        phoneInfo
      };
    }
    const encodedText = encodeURIComponent(message);
    return {
      url: `https://wa.me/${phoneInfo.normalized}?text=${encodedText}`,
      phoneInfo
    };
  }

  /**
   * Records WhatsApp confirmation initiation into the audit log
   */
  public static recordInitiation(
    appointmentId: string,
    patientName: string,
    patientPhone: string,
    messageType: string,
    adminUser: AdminUser
  ): void {
    DataAccessLayer.recordWhatsAppInitiated(
      appointmentId,
      patientName,
      patientPhone,
      messageType,
      adminUser
    );
  }
}
