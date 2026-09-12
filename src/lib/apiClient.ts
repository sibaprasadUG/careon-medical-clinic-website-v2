import { Doctor, Department, Service, WebsiteSettings, MediaAsset, AppointmentRequest, SectionMediaSettings } from '../types';

/**
 * Universal API Client for CareOn Medical Clinic
 * Handles communication with the unified production API across:
 * - Local Vite Dev / AI Studio Preview
 * - Netlify Production Deployment
 * - Configurable Remote Production Endpoint (VITE_API_BASE_URL)
 */

export function getApiBaseUrl(): string {
  // 1. Environment variable VITE_API_BASE_URL
  const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // 2. Runtime override in window or localStorage
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('careon_custom_api_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/$/, '');
    }
  }

  // 3. Default relative API path (works in both Preview and Netlify)
  return '/api';
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token =
    sessionStorage.getItem('careon_admin_jwt_token') ||
    localStorage.getItem('careon_admin_jwt_token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export class ApiError extends Error {
  statusCode: number;
  data?: any;
  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export interface ApiDoctorResponse {
  success: boolean;
  doctors: Doctor[];
  total: number;
  lastUpdated?: string;
  error?: string;
}

export interface ApiSingleDoctorResponse {
  success: boolean;
  doctor?: Doctor;
  doctors?: Doctor[];
  error?: string;
}

async function sendApiRequest<T = any>(
  path: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
  } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (options.requiresAuth !== false) {
    const auth = getAuthHeader();
    Object.assign(headers, auth);
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    credentials: 'include',
    cache: 'no-store'
  };

  if (options.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (netErr: any) {
    throw new ApiError(
      `Unable to reach Production API at ${url}. Please check your network connection or API status. (${netErr.message})`,
      0
    );
  }

  let data: any = null;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const errMsg = data?.error || data?.message || `API request failed with status ${response.status}`;
    throw new ApiError(errMsg, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  getBaseUrl(): string {
    return getApiBaseUrl();
  },

  setCustomApiUrl(url: string | null) {
    if (typeof window === 'undefined') return;
    if (url && url.trim()) {
      localStorage.setItem('careon_custom_api_url', url.trim());
    } else {
      localStorage.removeItem('careon_custom_api_url');
    }
    // Broadcast update
    window.dispatchEvent(new CustomEvent('careon_data_updated', { detail: 'ApiConfig' }));
  },

  async request<T = any>(
    path: string,
    options?: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
    }
  ): Promise<T> {
    return sendApiRequest<T>(path, options);
  },

  // --- Health Check ---
  async checkHealth(): Promise<{ status: string; version?: string; database?: any; time?: string }> {
    return sendApiRequest('/health', { requiresAuth: false });
  },

  // --- Doctor Endpoints ---

  /**
   * Fetch all doctors from the production store.
   */
  async getDoctors(filters?: { department?: string; status?: string }): Promise<Doctor[]> {
    const query = new URLSearchParams();
    if (filters?.department && filters.department !== 'all') {
      query.set('department', filters.department);
    }
    if (filters?.status) {
      query.set('status', filters.status);
    }

    const qStr = query.toString();
    const endpoint = `/doctors${qStr ? `?${qStr}` : ''}`;
    const res = await sendApiRequest<ApiDoctorResponse>(endpoint, { requiresAuth: false });

    if (!res.success || !Array.isArray(res.doctors)) {
      throw new ApiError(res.error || 'Invalid doctor payload received from API', 500);
    }

    return res.doctors;
  },

  /**
   * Fetch a single doctor by ID or Slug.
   */
  async getDoctor(idOrSlug: string): Promise<Doctor> {
    const res = await sendApiRequest<ApiSingleDoctorResponse>(`/doctors/${encodeURIComponent(idOrSlug)}`, {
      requiresAuth: false
    });
    if (!res.success || !res.doctor) {
      throw new ApiError(res.error || `Doctor ${idOrSlug} not found`, 404);
    }
    return res.doctor;
  },

  /**
   * Create a new doctor in the production database (Admin only).
   */
  async createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
    const res = await sendApiRequest<ApiSingleDoctorResponse>('/doctors', {
      method: 'POST',
      body: doctorData,
      requiresAuth: true
    });
    if (!res.success || !res.doctor) {
      throw new ApiError(res.error || 'Failed to create doctor in production store', 400);
    }
    return res.doctor;
  },

  /**
   * Update an existing doctor in the production database (Admin only).
   */
  async updateDoctor(id: string, doctorData: Partial<Doctor>): Promise<Doctor> {
    const res = await sendApiRequest<ApiSingleDoctorResponse>(`/doctors/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: doctorData,
      requiresAuth: true
    });
    if (!res.success || !res.doctor) {
      throw new ApiError(res.error || 'Failed to update doctor in production store', 400);
    }
    return res.doctor;
  },

  /**
   * Permanently delete a doctor from the production database (Admin only).
   */
  async deleteDoctor(id: string): Promise<boolean> {
    const res = await sendApiRequest<{ success: boolean; message?: string; error?: string }>(
      `/doctors/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        requiresAuth: true
      }
    );
    if (!res.success) {
      throw new ApiError(res.error || 'Failed to delete doctor from production store', 400);
    }
    return true;
  },

  /**
   * Reorder doctors in the production database (Admin only).
   */
  async reorderDoctors(orders: { id: string; displayOrder: number }[]): Promise<Doctor[]> {
    const res = await sendApiRequest<{ success: boolean; doctors: Doctor[]; error?: string }>(
      '/doctors/reorder',
      {
        method: 'POST',
        body: { orders },
        requiresAuth: true
      }
    );
    if (!res.success || !Array.isArray(res.doctors)) {
      throw new ApiError(res.error || 'Failed to reorder doctors', 400);
    }
    return res.doctors;
  },

  /**
   * Fetch all clinical services from the production database.
   */
  async getServices(): Promise<Service[]> {
    const res = await sendApiRequest<{ success: boolean; services: Service[]; error?: string }>('/services', {
      requiresAuth: false
    });
    if (!res.success || !Array.isArray(res.services)) {
      throw new ApiError(res.error || 'Failed to fetch services', 500);
    }
    return res.services;
  },

  /**
   * Fetch all clinical departments from the production database.
   */
  async getDepartments(): Promise<Department[]> {
    const res = await sendApiRequest<{ success: boolean; departments: Department[]; error?: string }>('/departments', {
      requiresAuth: false
    });
    if (!res.success || !Array.isArray(res.departments)) {
      throw new ApiError(res.error || 'Failed to fetch departments', 500);
    }
    return res.departments;
  },

  // --- Full Data Sync & Retrieval ---

  async getAllData(): Promise<{
    doctors: Doctor[];
    departments: Department[];
    services: Service[];
    settings: WebsiteSettings;
    assets: MediaAsset[];
    lastUpdated: string;
  }> {
    const res = await sendApiRequest('/data', { requiresAuth: false });
    if (!res.success) {
      throw new ApiError(res.error || 'Failed to retrieve clinic master dataset', 500);
    }
    return res;
  },

  async syncFullData(payload: {
    doctors?: Doctor[];
    departments?: Department[];
    services?: Service[];
    settings?: WebsiteSettings;
    assets?: MediaAsset[];
  }): Promise<boolean> {
    const res = await sendApiRequest('/data/sync', {
      method: 'POST',
      body: payload,
      requiresAuth: true
    });
    return Boolean(res.success);
  },

  // --- Media Asset Endpoints ---

  /**
   * Fetch all media assets from the production database.
   */
  async getAssets(): Promise<MediaAsset[]> {
    const res = await sendApiRequest<{ success: boolean; assets: MediaAsset[]; error?: string }>('/assets', {
      requiresAuth: false
    });
    if (!res.success || !Array.isArray(res.assets)) {
      throw new ApiError(res.error || 'Failed to retrieve media assets', 500);
    }
    return res.assets;
  },

  /**
   * Permanently delete a media asset from both production database and Supabase Storage (Admin only).
   */
  async deleteAsset(
    idOrAsset:
      | string
      | {
          id?: string;
          fileName?: string;
          storageKey?: string;
          url?: string;
          category?: string;
          force?: boolean;
        },
    options?: {
      force?: boolean;
      storageKey?: string;
      fileName?: string;
      url?: string;
      category?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    deletedAsset?: MediaAsset;
    storageDeleted?: boolean;
    error?: string;
  }> {
    const isObj = typeof idOrAsset === 'object' && idOrAsset !== null;
    const targetId: string = isObj ? String(idOrAsset.id || idOrAsset.fileName || '') : String(idOrAsset || '');
    const mergedOptions = {
      force: isObj ? idOrAsset.force ?? options?.force : options?.force,
      fileName: isObj ? idOrAsset.fileName : options?.fileName,
      storageKey: isObj ? idOrAsset.storageKey : options?.storageKey,
      url: isObj ? idOrAsset.url : options?.url,
      category: isObj ? idOrAsset.category : options?.category
    };

    const params = new URLSearchParams();
    if (mergedOptions.force) params.set('force', 'true');
    if (mergedOptions.fileName) params.set('fileName', mergedOptions.fileName);
    if (mergedOptions.storageKey) params.set('storageKey', mergedOptions.storageKey);
    if (mergedOptions.url) params.set('url', mergedOptions.url);
    if (mergedOptions.category) params.set('category', mergedOptions.category);
    const qStr = params.toString() ? `?${params.toString()}` : '';

    const res = await sendApiRequest<{
      success: boolean;
      message?: string;
      deletedAsset?: MediaAsset;
      storageDeleted?: boolean;
      error?: string;
    }>(`/assets/${encodeURIComponent(targetId)}${qStr}`, {
      method: 'DELETE',
      body: mergedOptions,
      requiresAuth: true
    });

    if (!res.success) {
      throw new ApiError(res.error || 'Failed to delete media asset', 400);
    }

    return res;
  },

  /**
   * Upload an asset directly to Supabase Storage and register in database (Admin only)
   */
  async uploadAsset(payload: {
    fileName: string;
    fileData: string; // base64 string or Data URL
    mimeType: string;
    category?: string;
    altText?: string;
    width?: number;
    height?: number;
  }): Promise<MediaAsset> {
    const res = await sendApiRequest<{
      success: boolean;
      asset?: MediaAsset;
      error?: string;
    }>('/assets/upload', {
      method: 'POST',
      body: payload,
      requiresAuth: true
    });
    if (!res.success || !res.asset) {
      throw new ApiError(res.error || 'Failed to upload media asset to server', 400);
    }
    return res.asset;
  },

  /**
   * Get all appointment requests from production Supabase database (Admin only)
   */
  async getAppointments(): Promise<AppointmentRequest[]> {
    const res = await sendApiRequest<{
      success: boolean;
      appointments: AppointmentRequest[];
      error?: string;
    }>('/appointments', {
      method: 'GET',
      requiresAuth: true
    });
    if (!res.success || !Array.isArray(res.appointments)) {
      throw new ApiError(res.error || 'Failed to fetch appointments', 500);
    }
    return res.appointments;
  },

  /**
   * Submit an appointment request to production Supabase database (Public or Admin)
   */
  async createAppointment(data: Partial<AppointmentRequest>): Promise<AppointmentRequest> {
    const res = await sendApiRequest<{
      success: boolean;
      appointment: AppointmentRequest;
      error?: string;
    }>('/appointments', {
      method: 'POST',
      body: data,
      requiresAuth: false
    });
    if (!res.success || !res.appointment) {
      throw new ApiError(res.error || 'Failed to submit appointment request', 400);
    }
    return res.appointment;
  },

  /**
   * Update an appointment request in production Supabase database (Admin only)
   */
  async updateAppointment(
    id: string,
    updates: Partial<AppointmentRequest>
  ): Promise<AppointmentRequest> {
    const res = await sendApiRequest<{
      success: boolean;
      appointment: AppointmentRequest;
      error?: string;
    }>(`/appointments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: updates,
      requiresAuth: true
    });
    if (!res.success || !res.appointment) {
      throw new ApiError(res.error || 'Failed to update appointment', 400);
    }
    return res.appointment;
  },

  /**
   * Delete an appointment request from production Supabase database (Admin only)
   */
  async deleteAppointment(id: string): Promise<boolean> {
    const res = await sendApiRequest<{
      success: boolean;
      message?: string;
      error?: string;
    }>(`/appointments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      requiresAuth: true
    });
    if (!res.success) {
      throw new ApiError(res.error || 'Failed to delete appointment', 400);
    }
    return true;
  },

  // --- Website & Section Media Settings Endpoints ---

  /**
   * Fetch current website settings from production Supabase database
   */
  async getSettings(): Promise<WebsiteSettings> {
    const res = await sendApiRequest<{
      success: boolean;
      settings: WebsiteSettings;
      source?: string;
      error?: string;
    }>('/settings', {
      method: 'GET',
      requiresAuth: false
    });
    if (!res.success || !res.settings) {
      throw new ApiError(res.error || 'Failed to fetch website settings', 500);
    }
    return res.settings;
  },

  /**
   * Update full or partial website settings in production Supabase database
   */
  async updateSettings(settingsData: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const res = await sendApiRequest<{
      success: boolean;
      settings: WebsiteSettings;
      source?: string;
      message?: string;
      error?: string;
    }>('/settings', {
      method: 'PUT',
      body: settingsData,
      requiresAuth: true
    });
    if (!res.success || !res.settings) {
      throw new ApiError(res.error || 'Failed to update website settings', 400);
    }
    return res.settings;
  },

  /**
   * Update section media visual settings in production Supabase database
   */
  async updateSectionMedia(sectionMedia: SectionMediaSettings): Promise<WebsiteSettings> {
    const res = await sendApiRequest<{
      success: boolean;
      sectionMedia: SectionMediaSettings;
      settings: WebsiteSettings;
      source?: string;
      message?: string;
      error?: string;
    }>('/settings/section-media', {
      method: 'PUT',
      body: sectionMedia,
      requiresAuth: true
    });
    if (!res.success || !res.settings) {
      throw new ApiError(res.error || 'Failed to update section media settings', 400);
    }
    return res.settings;
  }
};
