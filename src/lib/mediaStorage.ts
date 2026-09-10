import { MediaAsset, MediaCategory, MediaAssetStatus, AdminUser } from '../types';
import { DataAccessLayer } from './dal';
import { apiClient } from './apiClient';

// Maximum file size limits
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FAVICON_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB

// Supported MIME types per category
export const DOCTOR_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const BRAND_ALLOWED_MIMES = ['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg'];
export const FAVICON_ALLOWED_MIMES = ['image/svg+xml', 'image/png', 'image/x-icon', 'image/vnd.microsoft.icon'];
export const GENERAL_ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

// IndexedDB configuration for persistent binary storage (handles multi-megabyte image blobs without localStorage quota issues)
const DB_NAME = 'careon_media_storage_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

class BlobStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  async set(key: string, dataUrl: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(dataUrl, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to memory
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore
    }
  }
}

const blobStore = new BlobStore();

// Read file as Base64 Data URL
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
  // Node.js / test runtime fallback
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mime = file.type || 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

// Extract image dimensions (width, height)
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ width: 800, height: 1000 });
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 1000
      });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 1000 });
    };
    img.src = dataUrl;
  });
}

// Format bytes to human-readable string (e.g., 245 KB, 1.2 MB)
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface MediaUploadOptions {
  category: MediaCategory;
  altText?: string;
  originalName?: string;
  customFileName?: string;
}

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Provider-Agnostic Media Storage Service
 * Abstracted interface supporting local persistent storage with direct upgrade path to Netlify Blobs / Supabase / Cloudinary
 */
export const MediaStorageService = {
  /**
   * Validate a file before upload
   */
  validate(
    file: File,
    options?: {
      allowedMimes?: string[];
      maxSizeBytes?: number;
      forCategory?: MediaCategory;
    }
  ): MediaValidationResult {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    const category = options?.forCategory || 'OTHER';
    let allowedMimes = options?.allowedMimes;
    let maxSize = options?.maxSizeBytes || MAX_IMAGE_SIZE_BYTES;

    if (!allowedMimes) {
      if (category === 'DOCTOR') {
        allowedMimes = DOCTOR_ALLOWED_MIMES;
      } else if (category === 'BRAND') {
        allowedMimes = BRAND_ALLOWED_MIMES;
      } else if (category === 'FAVICON') {
        allowedMimes = FAVICON_ALLOWED_MIMES;
        maxSize = MAX_FAVICON_SIZE_BYTES;
      } else {
        allowedMimes = GENERAL_ALLOWED_MIMES;
      }
    }

    // Explicit SVG check for Doctor photos
    if (category === 'DOCTOR' && (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg'))) {
      return {
        valid: false,
        error: 'SVG format is not permitted for doctor photographs. Please upload a JPG, PNG or WebP image under 5 MB.'
      };
    }

    // Check MIME type
    if (!allowedMimes.includes(file.type)) {
      const allowedFormatted = allowedMimes
        .map((m) => m.replace('image/', '').replace('+xml', '').toUpperCase())
        .join(', ');
      return {
        valid: false,
        error: `Unsupported file type (${file.type || 'unknown'}). Please upload ${allowedFormatted}.`
      };
    }

    // Check size limit
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${formatBytes(maxSize)}.`
      };
    }

    return { valid: true };
  },

  /**
   * Upload an asset into the centralized media storage
   */
  async upload(
    file: File | Blob,
    metadata: MediaUploadOptions,
    adminUser?: AdminUser | null
  ): Promise<MediaAsset> {
    const rawFileName = (file as File).name || metadata.originalName || `asset-${Date.now()}`;
    const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const mimeType = file.type || 'image/jpeg';
    const fileSize = file.size;

    // Convert to Data URL
    const dataUrl = await fileToDataUrl(file);

    // Extract dimensions
    let width: number | undefined;
    let height: number | undefined;
    if (mimeType.startsWith('image/')) {
      const dims = await getImageDimensions(dataUrl);
      width = dims.width;
      height = dims.height;
    }

    const assetId = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const storageKey = `careon/assets/${metadata.category.toLowerCase()}/${assetId}_${cleanFileName}`;

    // Generate clean Alt Text default if not specified
    let defaultAlt = metadata.altText;
    if (!defaultAlt) {
      if (metadata.category === 'DOCTOR') {
        defaultAlt = 'Doctor Profile Photo - CareOn Medical Clinic';
      } else if (metadata.category === 'BRAND') {
        defaultAlt = 'CareOn Medical Clinic - Caring Beyond Treatment';
      } else if (metadata.category === 'FAVICON') {
        defaultAlt = 'CareOn Medical Clinic Brandmark Favicon';
      } else {
        defaultAlt = cleanFileName.replace(/[_-]/g, ' ').replace(/\.[^.]+$/, '');
      }
    }

    // Attempt direct upload to server (Supabase Storage + Database)
    try {
      const serverAsset = await apiClient.uploadAsset({
        fileName: cleanFileName,
        fileData: dataUrl,
        mimeType,
        category: metadata.category,
        altText: defaultAlt,
        width,
        height
      });
      if (serverAsset && serverAsset.url) {
        await blobStore.set(storageKey, dataUrl);
        DataAccessLayer.saveMediaAsset(serverAsset, adminUser);
        return serverAsset;
      }
    } catch (serverErr: any) {
      console.warn('[MediaStorageService] Server upload failed, falling back to local store:', serverErr.message);
    }

    // Store binary payload in persistent IndexedDB store
    await blobStore.set(storageKey, dataUrl);

    const newAsset: MediaAsset = {
      id: assetId,
      fileName: cleanFileName,
      originalName: rawFileName,
      mimeType,
      category: metadata.category,
      url: dataUrl,
      storageKey,
      width,
      height,
      fileSize,
      altText: defaultAlt,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: adminUser?.email || 'admin@careonclinic.com',
      updatedBy: adminUser?.email || 'admin@careonclinic.com',
      version: 1
    };

    // Save to DAL registry and log audit
    DataAccessLayer.saveMediaAsset(newAsset, adminUser);

    return newAsset;
  },

  /**
   * Replace an existing asset with a new file while maintaining relationships and versioning
   */
  async replace(
    assetId: string,
    newFile: File | Blob,
    adminUser?: AdminUser | null
  ): Promise<MediaAsset> {
    const existing = DataAccessLayer.getMediaAssetById(assetId);
    if (!existing) {
      throw new Error(`Asset ${assetId} not found for replacement.`);
    }

    const rawFileName = (newFile as File).name || existing.originalName;
    const cleanFileName = rawFileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const mimeType = newFile.type || existing.mimeType;
    const fileSize = newFile.size;

    const dataUrl = await fileToDataUrl(newFile);

    let width: number | undefined = existing.width;
    let height: number | undefined = existing.height;
    if (mimeType.startsWith('image/')) {
      const dims = await getImageDimensions(dataUrl);
      width = dims.width;
      height = dims.height;
    }

    const newStorageKey = `careon/assets/${existing.category.toLowerCase()}/${existing.id}_v${(existing.version || 1) + 1}_${cleanFileName}`;

    await blobStore.set(newStorageKey, dataUrl);

    const updatedAsset: MediaAsset = {
      ...existing,
      fileName: cleanFileName,
      originalName: rawFileName,
      mimeType,
      url: dataUrl,
      storageKey: newStorageKey,
      width,
      height,
      fileSize,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.email || 'admin@careonclinic.com',
      version: (existing.version || 1) + 1
    };

    DataAccessLayer.saveMediaAsset(updatedAsset, adminUser, true);

    return updatedAsset;
  },

  /**
   * Delete an asset with safety checks and atomic Supabase storage removal
   */
  async delete(
    target: string | MediaAsset,
    adminUser?: AdminUser | null,
    force = false
  ): Promise<{ success: boolean; error?: string }> {
    let asset: MediaAsset | undefined;
    let assetId = '';

    if (typeof target === 'object' && target !== null) {
      asset = target;
      assetId = target.id;
    } else {
      assetId = String(target);
      asset =
        DataAccessLayer.getMediaAssetById(assetId) ||
        DataAccessLayer.getAllMediaAssets().find(
          (a) => a.id === assetId || a.fileName === assetId || a.storageKey === assetId
        );
    }

    // Safety check for active references if not forced
    if (assetId) {
      const usage = DataAccessLayer.getAssetUsage(assetId);
      if (usage.length > 0 && !force) {
        const usageDescriptions = usage.map((u) => `${u.type}: ${u.name}`).join(', ');
        return {
          success: false,
          error: `Cannot delete asset. It is actively referenced by: ${usageDescriptions}. Please replace or remove references first, or archive the asset.`
        };
      }
    }

    // Call server API for atomic deletion from Supabase Storage and PostgreSQL database
    try {
      await apiClient.deleteAsset({
        id: assetId,
        fileName: asset?.fileName,
        storageKey: asset?.storageKey,
        url: asset?.url,
        category: asset?.category,
        force
      });
    } catch (apiErr: any) {
      console.error('[MediaStorageService] Server-side deletion failed:', apiErr.message);
      return {
        success: false,
        error: apiErr.message || 'Server-side asset deletion failed. Physical storage and database were preserved.'
      };
    }

    // Delete binary payload from IndexedDB if present
    if (asset?.storageKey) {
      try {
        await blobStore.delete(asset.storageKey);
      } catch {
        // Ignored
      }
    }

    return DataAccessLayer.deleteMediaAsset(assetId || asset?.fileName || '', adminUser, force);
  },

  /**
   * Resolve public URL for an asset ID or URL string
   */
  getPublicUrl(assetIdOrUrl?: string): string {
    if (!assetIdOrUrl) return '';
    if (assetIdOrUrl.startsWith('http://') || assetIdOrUrl.startsWith('https://') || assetIdOrUrl.startsWith('data:')) {
      return assetIdOrUrl;
    }
    const asset = DataAccessLayer.getMediaAssetById(assetIdOrUrl);
    return asset?.url || '';
  },

  /**
   * Get metadata for an asset
   */
  getMetadata(assetId: string): MediaAsset | undefined {
    return DataAccessLayer.getMediaAssetById(assetId);
  },

  /**
   * Get entities currently referencing this asset
   */
  getAssetUsage(assetId: string): { type: string; name: string; id: string }[] {
    return DataAccessLayer.getAssetUsage(assetId);
  },

  /**
   * Get all registered assets
   */
  getAllAssets(): MediaAsset[] {
    return DataAccessLayer.getAllMediaAssets();
  },

  /**
   * Filter assets by category
   */
  getAssetsByCategory(category: MediaCategory): MediaAsset[] {
    return DataAccessLayer.getAllMediaAssets().filter((a) => a.category === category);
  },

  /**
   * Archive an asset
   */
  archive(assetId: string, adminUser?: AdminUser | null): MediaAsset | undefined {
    return DataAccessLayer.archiveMediaAsset(assetId, adminUser);
  },

  /**
   * Unarchive an asset
   */
  unarchive(assetId: string, adminUser?: AdminUser | null): MediaAsset | undefined {
    return DataAccessLayer.unarchiveMediaAsset(assetId, adminUser);
  }
};
