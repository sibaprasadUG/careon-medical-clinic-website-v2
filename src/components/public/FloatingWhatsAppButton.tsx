import React from 'react';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface FloatingWhatsAppButtonProps {
  phoneNumber?: string; // Optional override, defaults to 919933335131
  customMessage?: string;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  phoneNumber = '919933335131',
  customMessage = 'Hello CareOn Medical Clinic, I would like to inquire about appointments and doctor consultation.'
}) => {
  // Strip all non-digits to ensure strictly clean destination e.g. 919933335131
  const cleanPhone = (phoneNumber || '919933335131').replace(/\D/g, '');
  const destinationUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 pointer-events-auto print:hidden pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)]"
      id="careon-floating-whatsapp"
    >
      <a
        href={destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with CareOn Medical Clinic on WhatsApp"
        title="Chat with CareOn Medical Clinic on WhatsApp (+91 99333 35131)"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white rounded-full shadow-lg hover:shadow-2xl shadow-[#25D366]/30 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50 select-none"
      >
        {/* Subtle, professional pulse ring */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping motion-reduce:animate-none pointer-events-none"
          aria-hidden="true"
        />

        {/* Official WhatsApp Brand Vector Icon */}
        <span className="relative flex items-center justify-center w-7 h-7 shrink-0 text-white transition-transform duration-200 group-hover:scale-110">
          <WhatsAppIcon className="w-7 h-7 text-white" />
        </span>

        {/* Online Status Indicator */}
        <span
          className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-300 border-2 border-white shadow-xs"
          title="Online"
        />

        {/* Accessible hover tooltip on desktop */}
        <span className="sr-only">Chat with CareOn Medical Clinic on WhatsApp</span>
      </a>
    </div>
  );
};
