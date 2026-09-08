import { useState, useEffect, useCallback } from 'react';
import { DataAccessLayer } from './dal';
import {
  Doctor,
  Service,
  Department,
  PatientStory,
  GalleryItem,
  FAQ,
  WebsiteSettings,
  SEOSettings,
  AppointmentRequest
} from '../types';

export function usePublicData() {
  const [doctors, setDoctors] = useState<Doctor[]>(() => DataAccessLayer.getPublicDoctors());
  const [services, setServices] = useState<Service[]>(() => DataAccessLayer.getPublicServices());
  const [departments, setDepartments] = useState<Department[]>(() => DataAccessLayer.getPublicDepartments());
  const [patientStories, setPatientStories] = useState<PatientStory[]>(() => DataAccessLayer.getPublicPatientStories());
  const [gallery, setGallery] = useState<GalleryItem[]>(() => DataAccessLayer.getPublicGallery());
  const [faqs, setFaqs] = useState<FAQ[]>(() => DataAccessLayer.getPublicFAQs());
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());
  const [seo, setSeo] = useState<SEOSettings>(() => DataAccessLayer.getSEOSettings());
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const refreshPublicData = useCallback(() => {
    setDoctors(DataAccessLayer.getPublicDoctors());
    setServices(DataAccessLayer.getPublicServices());
    setDepartments(DataAccessLayer.getPublicDepartments());
    setPatientStories(DataAccessLayer.getPublicPatientStories());
    setGallery(DataAccessLayer.getPublicGallery());
    setFaqs(DataAccessLayer.getPublicFAQs());
    setSettings(DataAccessLayer.getWebsiteSettings());
    setSeo(DataAccessLayer.getSEOSettings());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        // 1. Fetch authoritative doctor records from the production API
        const serverDoctors = await DataAccessLayer.fetchDoctorsFromApi();
        if (isMounted) {
          const active = serverDoctors.filter((d) => d.status === 'ACTIVE' && d.active !== false);
          setDoctors(active);
          setApiError(null);
        }

        // 2. Sync full dataset (departments, services, settings)
        await DataAccessLayer.syncWithServer();
        if (isMounted) {
          refreshPublicData();
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Initial public data fetch note:', err);
          setApiError(err.message || 'Error connecting to production data source');
          // Still fallback to locally cached data
          refreshPublicData();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    const handleDataUpdate = () => {
      refreshPublicData();
    };

    window.addEventListener('careon_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('careon_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, [refreshPublicData]);

  const submitAppointment = useCallback(
    (
      payload: Omit<
        AppointmentRequest,
        'id' | 'status' | 'createdAt' | 'updatedAt' | 'adminNotes'
      >
    ) => {
      return DataAccessLayer.submitPublicAppointmentRequest(payload);
    },
    []
  );

  return {
    doctors,
    services,
    departments,
    patientStories,
    gallery,
    faqs,
    settings,
    seo,
    loading,
    apiError,
    refreshPublicData,
    submitAppointment
  };
}
