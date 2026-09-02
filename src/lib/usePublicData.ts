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
  const [loading, setLoading] = useState<boolean>(false);

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
    // Initial sync with backend persistent store
    DataAccessLayer.syncWithServer();

    const handleDataUpdate = () => {
      refreshPublicData();
    };

    window.addEventListener('careon_data_updated', handleDataUpdate);
    window.addEventListener('storage', handleDataUpdate);

    return () => {
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
    refreshPublicData,
    submitAppointment
  };
}
