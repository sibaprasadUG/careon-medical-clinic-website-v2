import React, { useState, useEffect } from 'react';
import { Stethoscope, User, HeartPulse } from 'lucide-react';
import { Doctor, WebsiteSettings, BrandSettings } from '../../types';
import { MediaStorageService } from '../../lib/mediaStorage';
import { DataAccessLayer } from '../../lib/dal';

interface CareOnLogoProps {
  settings?: WebsiteSettings | null;
  variant?: 'light' | 'dark' | 'white';
  isDark?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const CareOnLogo: React.FC<CareOnLogoProps> = ({
  settings,
  variant = 'light',
  isDark,
  size = 'md',
  showTagline = true,
  subtitle,
  className = '',
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const activeVariant = isDark ? 'dark' : variant;

  const activeSettings = settings || (typeof window !== 'undefined' ? DataAccessLayer.getWebsiteSettings() : null);

  const customLogoUrl =
    activeSettings?.brand?.logoUrl ||
    activeSettings?.logoUrl ||
    (activeSettings?.logoAssetId ? MediaStorageService.getPublicUrl(activeSettings.logoAssetId) : '');

  const logoAlt =
    activeSettings?.brand?.logoAlt ||
    activeSettings?.logoAlt ||
    'CareOn Medical Clinic — Caring Beyond Treatment';

  const clinicName = activeSettings?.clinicName || 'CareOn Medical Clinic';
  const tagline = subtitle || activeSettings?.tagline || 'Caring Beyond Treatment';

  useEffect(() => {
    setImageError(false);
  }, [customLogoUrl]);

  // Size configurations
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl'
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  const textColors = {
    light: {
      title: 'text-[#0F172A]',
      tagline: 'text-[#007E70]'
    },
    dark: {
      title: 'text-white',
      tagline: 'text-teal-300'
    },
    white: {
      title: 'text-white',
      tagline: 'text-teal-200'
    }
  };

  // If a custom logo image is provided and hasn't errored
  if (customLogoUrl && !imageError) {
    const maxHeights = {
      sm: 'max-h-8',
      md: 'max-h-10 sm:max-h-12',
      lg: 'max-h-14 sm:max-h-16',
      xl: 'max-h-20'
    };

    return (
      <div
        className={`inline-flex items-center cursor-pointer select-none transition-opacity hover:opacity-95 ${className}`}
        onClick={onClick}
      >
        <img
          src={customLogoUrl}
          alt={logoAlt}
          className={`${maxHeights[size]} w-auto object-contain`}
          onError={() => setImageError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Official CareOn Vector Brandmark (Default / Fallback)
  return (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none transition-opacity hover:opacity-95 ${className}`}
      onClick={onClick}
      aria-label={`${clinicName} - ${tagline}`}
    >
      {/* Brandmark Emblem */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-[#007E70] to-[#005A50] text-white flex items-center justify-center shadow-md shadow-teal-900/10 shrink-0 relative overflow-hidden border border-teal-500/20`}
      >
        {/* Subtle decorative cross in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          <div className="w-full h-1.5 bg-white" />
          <div className="h-full w-1.5 bg-white absolute" />
        </div>
        <Stethoscope className="w-1/2 h-1/2 text-white relative z-10" strokeWidth={2.5} />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className={`font-extrabold tracking-tight ${titleSizes[size]} ${textColors[activeVariant].title}`}>
            Care<span className="text-[#007E70]">On</span>
          </span>
          <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-teal-50 text-[#007E70] border border-teal-100 uppercase tracking-widest hidden sm:inline-block">
            Clinic
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-semibold tracking-normal truncate ${taglineSizes[size]} ${textColors[activeVariant].tagline}`}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
};

interface DoctorPhotoProps {
  doctor: Doctor;
  className?: string;
  containerClassName?: string;
  alt?: string;
  loading?: 'lazy' | 'eager';
  showStatusBadge?: boolean;
}

export const DoctorPhoto: React.FC<DoctorPhotoProps> = ({
  doctor,
  className = 'w-full h-full object-cover object-top',
  containerClassName = 'w-full aspect-[4/5] relative overflow-hidden rounded-2xl bg-slate-100 border border-slate-200',
  alt,
  loading = 'lazy',
  showStatusBadge = false
}) => {
  const [hasError, setHasError] = useState(false);

  const photoUrl =
    doctor.profilePhotoUrl ||
    doctor.photoUrl ||
    (doctor.profilePhotoAssetId ? MediaStorageService.getPublicUrl(doctor.profilePhotoAssetId) : '');

  const photoAlt =
    alt ||
    doctor.profilePhotoAlt ||
    `Dr. ${doctor.name} - ${doctor.designation} at CareOn Medical Clinic`;

  return (
    <div className={containerClassName}>
      {photoUrl && !hasError ? (
        <img
          src={photoUrl}
          alt={photoAlt}
          className={className}
          loading={loading}
          onError={() => setHasError(true)}
        />
      ) : (
        <CareOnDoctorFallback doctor={doctor} />
      )}

      {showStatusBadge && doctor.status === 'ACTIVE' && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
          Available
        </div>
      )}
    </div>
  );
};

interface CareOnDoctorFallbackProps {
  doctor?: Partial<Doctor>;
  className?: string;
}

export const CareOnDoctorFallback: React.FC<CareOnDoctorFallbackProps> = ({
  doctor,
  className = 'w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-teal-50/70 to-slate-100 text-slate-400'
}) => {
  const initials = doctor?.name
    ? doctor.name
        .replace(/^Dr\.\s*/i, '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

  return (
    <div className={className} aria-label={doctor?.name || 'Physician Profile'}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-teal-100/80 border-2 border-teal-200 flex items-center justify-center text-[#007E70] relative shadow-inner mb-2">
        <User className="w-8 h-8 sm:w-10 sm:h-10 opacity-70" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#007E70] text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm border border-white">
          {initials}
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs font-bold text-slate-700 line-clamp-1">
          {doctor?.name || 'CareOn Physician'}
        </span>
        <span className="text-[10px] font-medium text-[#007E70] block">
          {doctor?.designation || 'Consultant Specialist'}
        </span>
      </div>
    </div>
  );
};

/**
 * Hook to dynamically update browser favicon in <head> based on CareOn Brand Settings
 */
export function useDynamicFavicon(faviconUrl?: string) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (faviconUrl) {
      link.href = faviconUrl;
    } else {
      // Default CareOn SVG Data Favicon
      const defaultSvgFavicon = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="%23007E70"/><path d="M16 8v16M8 16h16" stroke="white" stroke-width="3.5" stroke-linecap="round"/><circle cx="16" cy="16" r="1.5" fill="%23005A50"/></svg>`;
      link.href = defaultSvgFavicon;
    }
  }, [faviconUrl]);
}
