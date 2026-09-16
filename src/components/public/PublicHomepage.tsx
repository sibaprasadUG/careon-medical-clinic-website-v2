import React from 'react';
import { HeroSection } from './HeroSection';
import { SymptomCheckerSection } from './SymptomCheckerSection';
import { HomeCareAndInsuranceSection } from './HomeCareAndInsuranceSection';
import { LocationHoursReviewsSection } from './LocationHoursReviewsSection';
import { FAQAndPrepareSection } from './FAQAndPrepareSection';
import {
  Doctor,
  Service,
  Department,
  PatientStory,
  GalleryItem,
  FAQ,
  WebsiteSettings
} from '../../types';

interface PublicHomepageProps {
  doctors: Doctor[];
  services: Service[];
  departments: Department[];
  stories: PatientStory[];
  gallery: GalleryItem[];
  faqs: FAQ[];
  settings: WebsiteSettings;
  lang: 'en' | 'bn';
  navigateTo: (path: string) => void;
  onOpenBooking: (prefill?: { type: 'DOCTOR' | 'SERVICE' | 'DOCTOR_CONSULTATION' | 'CLINIC_SERVICE' | 'HOME_SERVICE'; id?: string }) => void;
}

export const PublicHomepage: React.FC<PublicHomepageProps> = ({
  doctors,
  services,
  departments,
  stories,
  gallery,
  faqs,
  settings,
  lang,
  navigateTo,
  onOpenBooking
}) => {
  return (
    <div className="space-y-0 selection:bg-teal-500/20 selection:text-teal-900">
      
      {/* 1. Hero with Integrated Quick Booking Intake Widget & Value Badges */}
      <HeroSection
        doctors={doctors}
        services={services}
        navigateTo={navigateTo}
        lang={lang}
        onOpenBooking={(prefill) => onOpenBooking(prefill)}
        settings={settings}
      />

      {/* 2. "How Can We Help You Today?" (Interactive Symptom & Guidance Search Box) */}
      <SymptomCheckerSection
        doctors={doctors}
        services={services}
        departments={departments}
        lang={lang}
        onOpenBooking={(prefill) => onOpenBooking(prefill)}
        navigateTo={navigateTo}
      />

      {/* 3. Video / Home Care Consultation (Left) + We Accept Insurance (Right) */}
      <HomeCareAndInsuranceSection
        lang={lang}
        onOpenBooking={(prefill) => onOpenBooking(prefill)}
        settings={settings}
      />

      {/* 4. 3-Column Info Grid: Our Location + Opening Hours + What Our Patients Say */}
      <LocationHoursReviewsSection
        lang={lang}
        settings={settings}
      />

      {/* 5. Frequently Asked Questions (Left) & Prepare For Your Visit (Right) */}
      <FAQAndPrepareSection
        faqs={faqs}
        lang={lang}
        settings={settings}
      />

    </div>
  );
};
