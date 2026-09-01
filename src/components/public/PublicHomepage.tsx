import React from 'react';
import { HeroSection } from './HeroSection';
import { QuickActionCards } from './QuickActionCards';
import { ServicesAndDoctorsSplitSection } from './ServicesAndDoctorsSplitSection';
import { BookingStepsBanner } from './BookingStepsBanner';
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

      {/* 2. 4 Quick Action Highlight Cards (New Patient, Family Care, Quick Appointment, Preventive Check-up) */}
      <QuickActionCards
        lang={lang}
        navigateTo={navigateTo}
        onOpenBooking={() => onOpenBooking()}
      />

      {/* 3. Split Section: "Our Services" (Left) & "Meet Our Doctors" (Right) */}
      <ServicesAndDoctorsSplitSection
        doctors={doctors}
        services={services}
        departments={departments}
        lang={lang}
        onBookDoctor={(doc) => onOpenBooking({ type: 'DOCTOR', id: doc.id })}
        onSelectService={(srv) => onOpenBooking({ type: 'SERVICE', id: srv.id })}
        onViewAllDoctors={() => navigateTo('/doctors')}
        onViewAllServices={() => navigateTo('/services')}
      />

      {/* 4. Book Your Appointment in 4 Simple Steps (Deep Navy Banner) */}
      <BookingStepsBanner
        lang={lang}
        onOpenBooking={() => onOpenBooking()}
      />

      {/* 5. "How Can We Help You Today?" (Interactive Symptom & Guidance Search Box) */}
      <SymptomCheckerSection
        doctors={doctors}
        services={services}
        departments={departments}
        lang={lang}
        onOpenBooking={(prefill) => onOpenBooking(prefill)}
        navigateTo={navigateTo}
      />

      {/* 6. Video / Home Care Consultation (Left) + We Accept Insurance (Right) */}
      <HomeCareAndInsuranceSection
        lang={lang}
        onOpenBooking={(prefill) => onOpenBooking(prefill)}
        settings={settings}
      />

      {/* 7. 3-Column Info Grid: Our Location + Opening Hours + What Our Patients Say */}
      <LocationHoursReviewsSection
        lang={lang}
        settings={settings}
      />

      {/* 8. Frequently Asked Questions (Left) & Prepare For Your Visit (Right) */}
      <FAQAndPrepareSection
        faqs={faqs}
        lang={lang}
        settings={settings}
      />

    </div>
  );
};
