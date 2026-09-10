import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Info,
  Layers,
  Eye,
  Check,
  X,
  Link,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { SectionMediaSettings, WebsiteSettings, MediaAsset } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import { MediaStorageService } from '../../lib/mediaStorage';
import { useAuth } from '../../lib/authContext';
import { ConfirmationDialog } from './ConfirmationDialog';
import { MediaPickerModal } from './MediaPickerModal';

const DEFAULT_SECTION_MEDIA: SectionMediaSettings = {
  heroImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
  homeCareImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900',
  aboutImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
  emergencyImage: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=1000'
};

interface SectionItemDef {
  key: keyof SectionMediaSettings;
  id: 'hero' | 'homeCare' | 'about' | 'emergency';
  title: string;
  description: string;
  recommendedDim: string;
  aspectRatio: string;
}

const SECTIONS_LIST: SectionItemDef[] = [
  {
    key: 'heroImage',
    id: 'hero',
    title: 'Hero Section Family Care Visual',
    description: 'The primary headline visual on the homepage featuring doctor & family care in Contai.',
    recommendedDim: '1200 x 675 px (16:9)',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    key: 'homeCareImage',
    id: 'homeCare',
    title: 'Home Care & Video Consultation Card',
    description: 'Visual displayed inside the Home Care & Online Doctor Visit card on the homepage.',
    recommendedDim: '900 x 506 px (16:9)',
    aspectRatio: 'aspect-[16/9]'
  },
  {
    key: 'aboutImage',
    id: 'about',
    title: 'About CareOn Clinic Story Image',
    description: 'The featured photography of clinic doctors, lab, and consultation facilities.',
    recommendedDim: '1000 x 667 px (3:2)',
    aspectRatio: 'aspect-[3/2]'
  },
  {
    key: 'emergencyImage',
    id: 'emergency',
    title: 'Emergency / Walk-in Callout Image',
    description: 'Used for emergency desk, diagnostic center highlights, and ambulance guidance.',
    recommendedDim: '1000 x 600 px (5:3)',
    aspectRatio: 'aspect-[5/3]'
  }
];

export const SectionMediaManager: React.FC = () => {
  const { currentUser } = useAuth();

  // Settings state
  const [persistedSettings, setPersistedSettings] = useState<WebsiteSettings>(() =>
    DataAccessLayer.getWebsiteSettings()
  );

  // Active section tab
  const [activeSection, setActiveSection] = useState<'hero' | 'homeCare' | 'about' | 'emergency'>('hero');

  // Staged section media form state (Pending Save)
  const [stagedMedia, setStagedMedia] = useState<SectionMediaSettings>(() => {
    const saved = persistedSettings.sectionMedia;
    return {
      heroImage: saved?.heroImage || DEFAULT_SECTION_MEDIA.heroImage,
      homeCareImage: saved?.homeCareImage || DEFAULT_SECTION_MEDIA.homeCareImage,
      aboutImage: saved?.aboutImage || DEFAULT_SECTION_MEDIA.aboutImage,
      emergencyImage: saved?.emergencyImage || DEFAULT_SECTION_MEDIA.emergencyImage
    };
  });

  // UI state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Dialogs
  const [deleteCandidate, setDeleteCandidate] = useState<{
    sectionKey: keyof SectionMediaSettings;
    title: string;
    imageUrl: string;
  } | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);

  // Helper to trigger toast notifications
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Sync with production data
  useEffect(() => {
    // 1. Initial background fetch from Supabase API
    DataAccessLayer.fetchWebsiteSettingsFromApi()
      .then((fresh) => {
        setPersistedSettings(fresh);
        if (fresh.sectionMedia) {
          setStagedMedia((curr) => {
            // Only update keys that were not edited if user has unsaved changes, or all if clean
            return {
              heroImage: fresh.sectionMedia?.heroImage || curr.heroImage,
              homeCareImage: fresh.sectionMedia?.homeCareImage || curr.homeCareImage,
              aboutImage: fresh.sectionMedia?.aboutImage || curr.aboutImage,
              emergencyImage: fresh.sectionMedia?.emergencyImage || curr.emergencyImage
            };
          });
        }
      })
      .catch((err) => {
        console.warn('Could not sync initial section media from Supabase:', err);
      });

    // 2. Event listener for local data changes
    const handleUpdate = () => {
      const fresh = DataAccessLayer.getWebsiteSettings();
      setPersistedSettings(fresh);
    };

    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  // Compute dirty state (has unsaved modifications)
  const currentSavedMedia = persistedSettings.sectionMedia || DEFAULT_SECTION_MEDIA;
  const isKeyDirty = (key: keyof SectionMediaSettings) => {
    return (stagedMedia[key] || '') !== (currentSavedMedia[key] || '');
  };

  const isCurrentSectionDirty = (() => {
    const currentSec = SECTIONS_LIST.find((s) => s.id === activeSection) || SECTIONS_LIST[0];
    return isKeyDirty(currentSec.key);
  })();

  const totalDirtyCount = SECTIONS_LIST.filter((s) => isKeyDirty(s.key)).length;
  const hasUnsavedChanges = totalDirtyCount > 0;

  // Warn user if leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes in Section Media. Are you sure you want to discard them?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Current active section metadata
  const currentSec = SECTIONS_LIST.find((s) => s.id === activeSection) || SECTIONS_LIST[0];
  const stagedUrl = stagedMedia[currentSec.key] || '';
  const savedUrl = currentSavedMedia[currentSec.key] || '';

  // 1. STAGE: Handle direct URL input
  const handleUrlChange = (newUrl: string) => {
    setStagedMedia((prev) => ({
      ...prev,
      [currentSec.key]: newUrl
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
  };

  // 2. STAGE: Handle File Upload (Uploads to Supabase Storage, stages canonical URL)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image exceeds 5MB limit. Please upload a smaller image.', 'error');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const asset = await MediaStorageService.upload(
        file,
        {
          category: 'GALLERY',
          altText: `CareOn Clinic ${currentSec.title}`,
          originalName: file.name
        },
        currentUser
      );

      // Stage canonical media URL into the form (Pending user clicking "Save Changes")
      setStagedMedia((prev) => ({
        ...prev,
        [currentSec.key]: asset.url
      }));
      setSaveStatus('idle');
      showToast(`Photo uploaded to media pipeline. Click "Save Changes" to apply.`, 'info');
    } catch (err: any) {
      console.error('Section media upload error:', err);
      setErrorMessage(err.message || 'Failed to upload photo.');
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be selected again if needed
      e.target.value = '';
    }
  };

  // 3. STAGE: Select from Media Library
  const handleSelectFromLibrary = (asset: MediaAsset) => {
    setStagedMedia((prev) => ({
      ...prev,
      [currentSec.key]: asset.url
    }));
    setIsMediaPickerOpen(false);
    setSaveStatus('idle');
    setErrorMessage(null);
    showToast(`Asset selected from media library. Click "Save Changes" to apply.`, 'info');
  };

  // 4. ACTION: Clear Photo from form (Does NOT delete physical asset)
  const handleClearPhoto = () => {
    if (!stagedUrl) return;
    setStagedMedia((prev) => ({
      ...prev,
      [currentSec.key]: ''
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
    showToast('Photo selection cleared. Click "Save Changes" to save blank state.', 'info');
  };

  // 5. ACTION: Reset Section to Clinic Default
  const handleResetToDefault = () => {
    const defaultVal = DEFAULT_SECTION_MEDIA[currentSec.key] || '';
    setStagedMedia((prev) => ({
      ...prev,
      [currentSec.key]: defaultVal
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
    showToast(`Default visual preview staged. Click "Save Changes" to commit.`, 'info');
  };

  // 6. ACTION: Cancel / Discard Unsaved Changes
  const handleCancelChanges = () => {
    setStagedMedia((prev) => ({
      ...prev,
      [currentSec.key]: savedUrl
    }));
    setSaveStatus('idle');
    setErrorMessage(null);
    showToast(`Discarded unsaved changes for ${currentSec.title}.`, 'info');
  };

  // 7. ACTION: Discard all unsaved changes across all sections
  const handleCancelAll = () => {
    setStagedMedia({
      heroImage: currentSavedMedia.heroImage || DEFAULT_SECTION_MEDIA.heroImage,
      homeCareImage: currentSavedMedia.homeCareImage || DEFAULT_SECTION_MEDIA.homeCareImage,
      aboutImage: currentSavedMedia.aboutImage || DEFAULT_SECTION_MEDIA.aboutImage,
      emergencyImage: currentSavedMedia.emergencyImage || DEFAULT_SECTION_MEDIA.emergencyImage
    });
    setSaveStatus('idle');
    setErrorMessage(null);
    showToast('All unsaved section media changes have been discarded.', 'info');
  };

  // 8. PRIMARY ACTION: Save Changes to API & Supabase PostgreSQL
  const handleSaveChanges = async () => {
    // Validate image URL if provided
    if (stagedUrl.trim() && !stagedUrl.startsWith('http://') && !stagedUrl.startsWith('https://') && !stagedUrl.startsWith('data:')) {
      setErrorMessage('Please enter a valid HTTP or HTTPS image URL.');
      return;
    }

    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      // Persist to Supabase and local store via DAL
      const updatedSettings = await DataAccessLayer.saveSectionMediaAsync(stagedMedia, currentUser);

      // Update persisted state
      setPersistedSettings(updatedSettings);
      setSaveStatus('saved');
      showToast('Section media saved successfully to Supabase database!', 'success');

      // Auto-revert status to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus((curr) => (curr === 'saved' ? 'idle' : curr));
      }, 3000);
    } catch (err: any) {
      console.error('Failed to persist section media:', err);
      setSaveStatus('error');
      setErrorMessage(err.message || 'Failed to save section media to database. Please retry.');
      showToast(`Save failed: ${err.message || 'Database error'}`, 'error');
    }
  };

  // 9. DESTRUCTIVE ACTION: Confirm Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!deleteCandidate) return;

    const { sectionKey, imageUrl } = deleteCandidate;
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      // Find if this URL corresponds to a tracked media asset in Media Library
      const allAssets = DataAccessLayer.getAllMediaAssets();
      const matchedAsset = allAssets.find((a) => a.url === imageUrl);

      if (matchedAsset) {
        // Permanently delete physical file from Supabase Storage and database
        await MediaStorageService.delete(matchedAsset, currentUser, true);
      }

      // Update staged media to remove this image
      const nextMedia: SectionMediaSettings = {
        ...stagedMedia,
        [sectionKey]: ''
      };
      setStagedMedia(nextMedia);

      // Save directly to Supabase
      const updated = await DataAccessLayer.saveSectionMediaAsync(nextMedia, currentUser);
      setPersistedSettings(updated);

      setSaveStatus('saved');
      setDeleteCandidate(null);
      showToast('Image permanently deleted from storage and section updated.', 'success');

      setTimeout(() => {
        setSaveStatus((curr) => (curr === 'saved' ? 'idle' : curr));
      }, 3000);
    } catch (err: any) {
      console.error('Permanent delete failed:', err);
      setSaveStatus('error');
      setErrorMessage(err.message || 'Failed to permanently delete image.');
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-teal-50 border-teal-200 text-teal-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-teal-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Global Unsaved Changes Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100 mb-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Section Visuals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Hero & Section Images Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            Update, upload, preview, and permanently persist clinical photography for the Hero Section, Home Care card, and About section into Supabase PostgreSQL.
          </p>
        </div>

        {/* Global Dirty State Indicator */}
        {hasUnsavedChanges && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{totalDirtyCount} Section{totalDirtyCount > 1 ? 's' : ''} with Unsaved Changes</span>
          </div>
        )}
      </div>

      {/* Section Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS_LIST.map((sec) => {
          const isDirty = isKeyDirty(sec.key);
          const hasImage = Boolean(stagedMedia[sec.key]);

          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id);
                setErrorMessage(null);
              }}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative ${
                activeSection === sec.id
                  ? 'bg-teal-50/70 border-[#007E70] shadow-sm ring-1 ring-[#007E70]'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#0B192C]">{sec.title}</span>
                {isDirty ? (
                  <span className="px-2 py-0.5 bg-amber-500 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Unsaved
                  </span>
                ) : activeSection === sec.id ? (
                  <span className="w-2 h-2 rounded-full bg-[#007E70]" />
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{sec.description}</p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>{sec.recommendedDim}</span>
                <span className={hasImage ? 'text-teal-600' : 'text-slate-400'}>
                  {hasImage ? 'Image Set' : 'Blank'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Editor Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-[#0F172A]">{currentSec.title}</h3>
              {isCurrentSectionDirty && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold">
                  ● Pending Save
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{currentSec.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Visual Preview & Upload Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Visual Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span>Current Visual Preview</span>
                {isCurrentSectionDirty && (
                  <span className="text-amber-600 font-bold">(Unsaved Preview)</span>
                )}
              </span>
              <span className="text-slate-400 font-medium">Recommended: {currentSec.recommendedDim}</span>
            </div>

            <div
              className={`relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 ${currentSec.aspectRatio}`}
            >
              {stagedUrl ? (
                <img
                  src={stagedUrl}
                  alt={currentSec.title}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback visual if URL is broken
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <ImageIcon className="w-12 h-12 mb-2 text-slate-500" />
                  <p className="text-sm font-bold text-slate-300">No Image Selected</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Upload a custom photo, pick from Media Library, or enter an HTTPS image URL below.
                  </p>
                </div>
              )}

              {/* Overlay Bar */}
              <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold flex items-center justify-between">
                <span className="truncate max-w-[280px] sm:max-w-md text-slate-300 font-mono text-[10px]">
                  {stagedUrl || 'No image source assigned'}
                </span>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isCurrentSectionDirty
                      ? 'bg-amber-500 text-white'
                      : stagedUrl
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isCurrentSectionDirty ? 'Unsaved' : stagedUrl ? 'Active in DB' : 'Blank'}
                </span>
              </div>
            </div>

            {/* Note on persistence */}
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Changes remain preview-only until you click <strong>Save Changes</strong> below.
              </span>
            </p>
          </div>

          {/* Right Column: Upload & Input Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Upload Custom Photo Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-[#007E70] rounded-3xl p-6 text-center bg-slate-50/60 hover:bg-teal-50/20 transition-all">
              <input
                type="file"
                id={`section-upload-${currentSec.id}`}
                accept="image/*"
                disabled={isUploading}
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor={`section-upload-${currentSec.id}`}
                className={`cursor-pointer block space-y-2 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] flex items-center justify-center mx-auto shadow-2xs">
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-[#007E70] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs font-extrabold text-slate-800">
                  {isUploading ? 'Uploading to Supabase Storage...' : 'Click to Upload Custom Photo'}
                </div>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WEBP up to 5MB. Automatically uploaded to Supabase Storage.
                </p>
              </label>
            </div>

            {/* 2. Media Library Picker Button */}
            <button
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-teal-600" />
              <span>Select from Clinic Media Library</span>
            </button>

            {/* 3. Direct Image HTTPS URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-slate-400" />
                  <span>Image HTTPS URL</span>
                </span>
                {stagedUrl && (
                  <button
                    type="button"
                    onClick={() => handleUrlChange('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Clear URL
                  </button>
                )}
              </label>
              <input
                type="url"
                value={stagedUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://images.unsplash.com/... or Supabase storage URL"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70] focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GLOBAL ADMIN ACTION FOOTER: [ Cancel ] [ Clear Photo ] [ Delete ] [ Save Changes ] */}
        {/* ========================================================================= */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left info or dirty count */}
          <div className="text-xs text-slate-500 font-medium">
            {isCurrentSectionDirty ? (
              <span className="text-amber-700 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>You have unsaved changes in this section.</span>
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Section configuration is synchronized with Supabase.</span>
              </span>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* 1. CANCEL BUTTON */}
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={!isCurrentSectionDirty || saveStatus === 'saving'}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {/* 2. CLEAR PHOTO (Form-only clear, does NOT delete production storage file) */}
            <button
              type="button"
              onClick={handleClearPhoto}
              disabled={!stagedUrl || saveStatus === 'saving'}
              title="Clear photo from this section without deleting from Media Library"
              className="px-3.5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
              <span>Clear Photo</span>
            </button>

            {/* 3. DELETE (Destructive action with confirmation dialog) */}
            {savedUrl && (
              <button
                type="button"
                onClick={() =>
                  setDeleteCandidate({
                    sectionKey: currentSec.key,
                    title: currentSec.title,
                    imageUrl: savedUrl
                  })
                }
                disabled={saveStatus === 'saving'}
                title="Permanently delete this photo from database & storage"
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete</span>
              </button>
            )}

            {/* 4. PRIMARY ACTION: SAVE CHANGES */}
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saveStatus === 'saving' || (!isCurrentSectionDirty && !hasUnsavedChanges)}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                saveStatus === 'saved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : saveStatus === 'saving'
                  ? 'bg-[#007E70]/70 text-white cursor-wait'
                  : isCurrentSectionDirty || hasUnsavedChanges
                  ? 'bg-[#007E70] hover:bg-[#006e62] text-white hover:shadow-lg shadow-teal-900/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved ✓</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteCandidate && (
        <ConfirmationDialog
          isOpen={Boolean(deleteCandidate)}
          title={`Permanently Delete Image for "${deleteCandidate.title}"?`}
          message="This action will permanently remove this visual from the database and reclaim Supabase Storage space. Are you sure you want to proceed?"
          confirmLabel="Delete Permanently"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmPermanentDelete}
          onCancel={() => setDeleteCandidate(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MEDIA LIBRARY PICKER MODAL */}
      {/* ========================================================================= */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleSelectFromLibrary}
          initialCategory="GALLERY"
          title={`Select Image for ${currentSec.title}`}
        />
      )}
    </div>
  );
};
