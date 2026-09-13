import { useState, useEffect, useCallback } from 'react';
import { DataAccessLayer } from './dal';
import { apiClient } from './apiClient';
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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>(() => DataAccessLayer.getPublicServices());
  const [departments, setDepartments] = useState<Department[]>(() => DataAccessLayer.getPublicDepartments());
  const [patientStories, setPatientStories] = useState<PatientStory[]>(() => DataAccessLayer.getPublicPatientStories());
  const [gallery, setGallery] = useState<GalleryItem[]>(() => DataAccessLayer.getPublicGallery());
  const [faqs, setFaqs] = useState<FAQ[]>(() => DataAccessLayer.getPublicFAQs());
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());
  const [seo, setSeo] = useState<SEOSettings>(() => DataAccessLayer.getSEOSettings());
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchAuthoritativeDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      const serverDoctors = await apiClient.getDoctors();
      if (Array.isArray(serverDoctors)) {
        const active = serverDoctors.filter(
          (d) => d && d.name && d.status === 'ACTIVE' && d.active !== false
        );
        setDoctors(active);
        setDoctorsError(null);
        return active;
      }
    } catch (err: any) {
      console.warn('[usePublicData] Doctor fetch note:', err);
      setDoctors((prev) => {
        if (prev.length === 0) {
          setDoctorsError(err.message || 'Unable to load doctor directory');
        }
        return prev;
      });
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const refreshPublicData = useCallback(() => {
    // Note: Public doctors are maintained authoritatively from GET /api/doctors
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
        // 1. Fetch authoritative doctor records directly from the production API
        await fetchAuthoritativeDoctors();

        // 2. Sync auxiliary dataset (departments, services, settings)
        await DataAccessLayer.syncWithServer();
        if (isMounted) {
          refreshPublicData();
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Initial public data fetch note:', err);
          setApiError(err.message || 'Error connecting to production data source');
          refreshPublicData();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    const handleDataUpdate = (e?: Event) => {
      const customEvent = e as CustomEvent<{ entity?: string }>;
      const entity = customEvent?.detail?.entity;
      if (entity === 'Doctor') {
        fetchAuthoritativeDoctors();
      } else {
        refreshPublicData();
      }
    };

    window.addEventListener('careon_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('careon_data_updated', handleDataUpdate);
      window.removeEventListener('storage', handleDataUpdate);
    };
  }, [fetchAuthoritativeDoctors, refreshPublicData]);

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
    doctorsLoading,
    doctorsError,
    fetchAuthoritativeDoctors,
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
