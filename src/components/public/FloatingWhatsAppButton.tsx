import React from 'react';
import { MessageCircle } from 'lucide-react';

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
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 pointer-events-auto print:hidden pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)]"
      id="careon-floating-whatsapp"
    >
      <a
        href={destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with CareOn Medical Clinic on WhatsApp"
        title="Chat with CareOn Medical Clinic on WhatsApp (+91 99333 35131)"
        className="group relative flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white rounded-full shadow-lg hover:shadow-xl shadow-emerald-950/20 px-3.5 py-3.5 sm:px-5 sm:py-3 transition-all duration-300 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50 select-none min-h-[48px] min-w-[48px]"
      >
        {/* Continuous subtle medical glow/ripple animation */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping motion-reduce:animate-none opacity-75 pointer-events-none"
          aria-hidden="true"
        />
        <span
          className="absolute -inset-0.5 rounded-full bg-[#25D366]/20 animate-pulse motion-reduce:animate-none pointer-events-none"
          aria-hidden="true"
        />

        {/* WhatsApp Icon */}
        <span className="relative flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 sm:w-5 sm:h-5 text-white fill-white/20 stroke-[2.2]" />
        </span>

        {/* Desktop Text label */}
        <span className="relative hidden sm:inline-block font-bold text-sm text-white tracking-tight whitespace-nowrap">
          Chat on WhatsApp
        </span>

        {/* Online Status Dot */}
        <span
          className="relative w-2 h-2 rounded-full bg-white ring-2 ring-[#25D366] shrink-0"
          title="Online"
        />
      </a>
    </div>
  );
};
