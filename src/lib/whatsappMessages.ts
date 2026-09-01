import {
  NormalizedPhoneResult,
  normalizeIndianPhoneNumber,
  formatAppointmentDate,
  WhatsAppMessageType,
  GenerateMessageOptions,
  WhatsAppService
} from './whatsappService';

export {
  type NormalizedPhoneResult,
  normalizeIndianPhoneNumber,
  formatAppointmentDate,
  type WhatsAppMessageType,
  type GenerateMessageOptions,
  WhatsAppService
};

/**
 * Delegator to WhatsAppService.generateMessage
 */
export function generateWhatsAppMessage(options: GenerateMessageOptions): string {
  return WhatsAppService.generateMessage(options);
}

/**
 * Delegator to WhatsAppService.buildClickToChatUrl
 */
export function buildWhatsAppClickToChatUrl(phone: string, message: string): {
  url: string;
  phoneInfo: NormalizedPhoneResult;
} {
  return WhatsAppService.buildClickToChatUrl(phone, message);
}
