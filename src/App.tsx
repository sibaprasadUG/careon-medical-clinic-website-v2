import React, { useState, useEffect } from 'react';
import { AuthProvider } from './lib/authContext';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicHomepage } from './components/public/PublicHomepage';
import { DoctorsPage } from './components/public/DoctorsPage';
import { ServicesPage } from './components/public/ServicesPage';
import { DepartmentsPage } from './components/public/DepartmentsPage';
import { AboutPage } from './components/public/AboutPage';
import { FAQsPage } from './components/public/FAQsPage';
import { ContactPage } from './components/public/ContactPage';
import { AppointmentModal } from './components/public/AppointmentModal';
import { FloatingWhatsAppButton } from './components/public/FloatingWhatsAppButton';
import { AdminLayout } from './components/admin/AdminLayout';
import { usePublicData } from './lib/usePublicData';
import { useDynamicFavicon } from './components/common/CareOnMedia';
import { Megaphone, X } from 'lucide-react';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/')) return hash;
      if (hash === 'admin') return '/admin';
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingPrefill, setBookingPrefill] = useState<
    { type: 'DOCTOR' | 'SERVICE'; id?: string } | undefined
  >(undefined);
  const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState<boolean>(false);

  const {
    doctors,
    services,
    departments,
    patientStories,
    gallery,
    faqs,
    settings
  } = usePublicData();

  // Dynamic Browser Favicon management from centralized CareOn Media Settings
  useDynamicFavicon(settings.faviconUrl || settings.brand?.faviconUrl);

  // URL sync & history navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('/')) {
        setCurrentPath(hash);
      } else if (hash === 'admin') {
        setCurrentPath('/admin');
      } else if (window.location.pathname) {
        setCurrentPath(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', path);
      } catch {
        window.location.hash = path;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (prefill?: { type: 'DOCTOR' | 'SERVICE'; id?: string }) => {
    setBookingPrefill(prefill);
    setIsBookingOpen(true);
  };

  // If path is /admin, render the secure Admin Control Center
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return (
      <AuthProvider>
        <AdminLayout onBackToPublic={() => navigateTo('/')} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-[#007E70]/20 selection:text-[#005A50]">
        {/* Dynamic Clinic Announcement Banner if active */}
        {settings.announcementActive && settings.announcement && !isAnnouncementDismissed && (
          <div className="bg-[#007E70] text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 border-b border-teal-800 animate-in fade-in">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
              <Megaphone className="w-4 h-4 shrink-0 text-teal-200" />
              <span>{settings.announcement}</span>
            </div>
            <button
              onClick={() => setIsAnnouncementDismissed(true)}
              className="text-teal-200 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Public Header */}
        <PublicHeader
          currentPath={currentPath}
          navigateTo={navigateTo}
          lang={lang}
          setLang={setLang}
          onOpenBooking={handleOpenBooking}
          settings={settings}
        />

        {/* Public Route Content */}
        <main className="flex-1 w-full">
          {currentPath === '/' && (
            <PublicHomepage
              doctors={doctors}
              services={services}
              departments={departments}
              stories={patientStories}
              gallery={gallery}
              faqs={faqs}
              settings={settings}
              lang={lang}
              navigateTo={navigateTo}
              onOpenBooking={handleOpenBooking}
            />
          )}

          {currentPath === '/doctors' && (
            <DoctorsPage
              doctors={doctors}
              departments={departments}
              lang={lang}
              onBookDoctor={(doc) => handleOpenBooking({ type: 'DOCTOR', id: doc.id })}
            />
          )}

          {currentPath === '/services' && (
            <ServicesPage
              services={services}
              departments={departments}
              lang={lang}
              onBookService={(srv) => handleOpenBooking({ type: 'SERVICE', id: srv.id })}
            />
          )}

          {currentPath === '/departments' && (
            <DepartmentsPage
              departments={departments}
              doctors={doctors}
              services={services}
              lang={lang}
              onSelectDoctor={(doc) => handleOpenBooking({ type: 'DOCTOR', id: doc.id })}
              onSelectService={(srv) => handleOpenBooking({ type: 'SERVICE', id: srv.id })}
            />
          )}

          {currentPath === '/about' && (
            <AboutPage
              lang={lang}
              onOpenBooking={() => handleOpenBooking()}
              settings={settings}
            />
          )}

          {currentPath === '/faqs' && (
            <FAQsPage
              faqs={faqs}
              lang={lang}
              settings={settings}
            />
          )}

          {currentPath === '/contact' && (
            <ContactPage
              lang={lang}
              onOpenBooking={() => handleOpenBooking()}
              settings={settings}
            />
          )}

          {/* Fallback for unknown routes */}
          {currentPath !== '/' &&
            currentPath !== '/doctors' &&
            currentPath !== '/services' &&
            currentPath !== '/departments' &&
            currentPath !== '/about' &&
            currentPath !== '/faqs' &&
            currentPath !== '/contact' && (
              <PublicHomepage
                doctors={doctors}
                services={services}
                departments={departments}
                stories={patientStories}
                gallery={gallery}
                faqs={faqs}
                settings={settings}
                lang={lang}
                navigateTo={navigateTo}
                onOpenBooking={handleOpenBooking}
              />
            )}
        </main>

        {/* Public Footer */}
        <PublicFooter
          navigateTo={navigateTo}
          lang={lang}
          onOpenBooking={handleOpenBooking}
          settings={settings}
        />

        {/* Global 3-Step Appointment Intake Modal */}
        <AppointmentModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingPrefill(undefined);
          }}
          doctors={doctors}
          services={services}
          departments={departments}
          prefill={bookingPrefill}
          lang={lang}
        />

        {/* Global Floating WhatsApp Contact Action */}
        <FloatingWhatsAppButton
          phoneNumber={settings.socialLinks?.whatsapp?.url ? undefined : '919933335131'}
        />
      </div>
    </AuthProvider>
  );
}
