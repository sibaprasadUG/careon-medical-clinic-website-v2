import React, { useState, useEffect, useRef } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { WebsiteSettings, SocialLinksConfig, SocialPlatformConfig, MediaAsset, BrandSettings } from '../../types';
import { WhatsAppIcon } from '../common/WhatsAppIcon';
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Megaphone,
  CheckCircle2,
  Save,
  Share2,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Upload,
  Trash2,
  Check,
  X,
  Layers,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import { CareOnLogo } from '../common/CareOnMedia';
import { MediaPickerModal } from './MediaPickerModal';
import { MediaStorageService, formatBytes, MAX_IMAGE_SIZE_BYTES, MAX_FAVICON_SIZE_BYTES } from '../../lib/mediaStorage';

interface PlatformMeta {
  key: keyof SocialLinksConfig;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  domainHint: string;
  placeholder: string;
  defaultUrl: string;
}

const SOCIAL_PLATFORMS: PlatformMeta[] = [
  {
    key: 'facebook',
    name: 'Facebook Page',
    description: 'Official CareOn Facebook community page for clinic updates & health awareness',
    icon: Facebook,
    domainHint: 'facebook.com or fb.me',
    placeholder: 'https://www.facebook.com/profile.php?id=61574354535870',
    defaultUrl: 'https://www.facebook.com/profile.php?id=61574354535870'
  },
  {
    key: 'instagram',
    name: 'Instagram Profile',
    description: 'Clinic visual stories, medical team highlights & healthy living tips',
    icon: Instagram,
    domainHint: 'instagram.com',
    placeholder: 'https://www.instagram.com/sibucontai/',
    defaultUrl: 'https://www.instagram.com/sibucontai/'
  },
  {
    key: 'youtube',
    name: 'YouTube Channel',
    description: 'Health education videos, doctor interviews & patient guidance',
    icon: Youtube,
    domainHint: 'youtube.com or youtu.be',
    placeholder: 'https://youtube.com/@careonmedicalclinic',
    defaultUrl: ''
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp Support',
    description: 'Direct Click-to-Chat with verified CareOn helpline (+91 9933335131)',
    icon: WhatsAppIcon,
    domainHint: 'wa.me or whatsapp.com',
    placeholder: 'https://wa.me/919933335131',
    defaultUrl: 'https://wa.me/919933335131'
  },
  {
    key: 'googleBusiness',
    name: 'Google Business Profile',
    description: 'Google Maps location, reviews & verified clinic business listing',
    icon: Globe,
    domainHint: 'share.google, google.com, or g.page',
    placeholder: 'https://share.google/1rR9CTJqmxgGnvW7I',
    defaultUrl: 'https://share.google/1rR9CTJqmxgGnvW7I'
  }
];

type SettingsTab = 'brand' | 'general' | 'social' | 'location' | 'announcement' | 'all';

export const WebsiteSettingsManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [brandError, setBrandError] = useState<string | null>(null);

  // Modals & File inputs
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState<boolean>(false);
  const [isFaviconPickerOpen, setIsFaviconPickerOpen] = useState<boolean>(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  // Staged Preview States for Brand Identity
  const [stagedLogo, setStagedLogo] = useState<{
    url: string;
    assetId?: string;
    altText?: string;
  } | null>(null);

  const [stagedFavicon, setStagedFavicon] = useState<{
    url: string;
    assetId?: string;
  } | null>(null);

  const [isUploadingBrand, setIsUploadingBrand] = useState<boolean>(false);

  // Sync settings when modified externally
  useEffect(() => {
    const handleUpdate = () => {
      setSettings(DataAccessLayer.getWebsiteSettings());
    };
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const showSuccessBanner = (message: string) => {
    setSavedSuccess(message);
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  // --- BRAND LOGO ACTIONS ---
  const handleDirectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = MediaStorageService.validate(file, { forCategory: 'BRAND' });
    if (!validation.valid) {
      setBrandError(validation.error || 'Invalid logo file.');
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
      return;
    }

    setIsUploadingBrand(true);
    try {
      const asset = await MediaStorageService.upload(
        file,
        {
          category: 'BRAND',
          altText: settings.brand?.logoAlt || 'CareOn Medical Clinic - Caring Beyond Treatment',
          originalName: file.name
        },
        currentUser
      );

      // Stage the new logo for preview before saving
      setStagedLogo({
        url: asset.url,
        assetId: asset.id,
        altText: asset.altText || 'CareOn Medical Clinic - Caring Beyond Treatment'
      });
    } catch (err: any) {
      setBrandError(err.message || 'Failed to upload logo asset.');
    } finally {
      setIsUploadingBrand(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleLogoSelectedFromLibrary = (asset: MediaAsset) => {
    setBrandError(null);
    setStagedLogo({
      url: asset.url,
      assetId: asset.id,
      altText: asset.altText || settings.brand?.logoAlt || 'CareOn Medical Clinic - Caring Beyond Treatment'
    });
    setIsLogoPickerOpen(false);
  };

  const handleSaveStagedLogo = () => {
    if (!stagedLogo) return;
    setBrandError(null);

    const currentBrand = DataAccessLayer.getBrandSettings();
    const updatedBrand: BrandSettings = {
      ...currentBrand,
      logoUrl: stagedLogo.url,
      logoAssetId: stagedLogo.assetId || '',
      logoAlt: stagedLogo.altText || currentBrand.logoAlt || 'CareOn Medical Clinic - Caring Beyond Treatment'
    };

    DataAccessLayer.saveBrandSettings(updatedBrand, currentUser);
    setSettings(DataAccessLayer.getWebsiteSettings());
    setStagedLogo(null);
    showSuccessBanner('Logo updated successfully.');
  };

  const handleCancelStagedLogo = () => {
    setStagedLogo(null);
    setBrandError(null);
  };

  const handleRemoveLogo = () => {
    setBrandError(null);
    // Stage empty logo removal
    setStagedLogo({
      url: '',
      assetId: '',
      altText: 'CareOn Medical Clinic - Caring Beyond Treatment'
    });
  };

  // --- BRAND FAVICON ACTIONS ---
  const handleDirectFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrandError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = MediaStorageService.validate(file, { forCategory: 'FAVICON' });
    if (!validation.valid) {
      setBrandError(validation.error || 'Invalid favicon file.');
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
      return;
    }

    setIsUploadingBrand(true);
    try {
      const asset = await MediaStorageService.upload(
        file,
        {
          category: 'FAVICON',
          altText: 'CareOn Medical Clinic Brandmark Favicon',
          originalName: file.name
        },
        currentUser
      );

      // Stage new favicon
      setStagedFavicon({
        url: asset.url,
        assetId: asset.id
      });
    } catch (err: any) {
      setBrandError(err.message || 'Failed to upload favicon asset.');
    } finally {
      setIsUploadingBrand(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleFaviconSelectedFromLibrary = (asset: MediaAsset) => {
    setBrandError(null);
    setStagedFavicon({
      url: asset.url,
      assetId: asset.id
    });
    setIsFaviconPickerOpen(false);
  };

  const handleSaveStagedFavicon = () => {
    if (!stagedFavicon) return;
    setBrandError(null);

    const currentBrand = DataAccessLayer.getBrandSettings();
    const updatedBrand: BrandSettings = {
      ...currentBrand,
      faviconUrl: stagedFavicon.url,
      faviconAssetId: stagedFavicon.assetId || ''
    };

    DataAccessLayer.saveBrandSettings(updatedBrand, currentUser);
    setSettings(DataAccessLayer.getWebsiteSettings());
    setStagedFavicon(null);
    showSuccessBanner('Favicon updated successfully.');
  };

  const handleCancelStagedFavicon = () => {
    setStagedFavicon(null);
    setBrandError(null);
  };

  const handleRemoveFavicon = () => {
    setBrandError(null);
    // Stage empty favicon removal
    setStagedFavicon({
      url: '',
      assetId: ''
    });
  };

  // --- SOCIAL LINKS VALIDATION ---
  const validateUrl = (platformKey: string, url: string): string | null => {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return 'Must be a valid web address (e.g. https://...)';
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'URL must start with https://';
    }

    const host = parsed.hostname.toLowerCase();
    if (platformKey === 'facebook' && !host.includes('facebook.com') && !host.includes('fb.me') && !host.includes('fb.com')) {
      return 'URL must be a valid Facebook link (facebook.com or fb.me)';
    }
    if (platformKey === 'instagram' && !host.includes('instagram.com')) {
      return 'URL must be a valid Instagram link (instagram.com)';
    }
    if (platformKey === 'youtube' && !host.includes('youtube.com') && !host.includes('youtu.be')) {
      return 'URL must be a valid YouTube link (youtube.com or youtu.be)';
    }
    if (platformKey === 'whatsapp' && !host.includes('wa.me') && !host.includes('whatsapp.com')) {
      return 'URL should be a valid WhatsApp link (e.g. https://wa.me/919933335131)';
    }
    if (
      platformKey === 'googleBusiness' &&
      !host.includes('google.com') &&
      !host.includes('share.google') &&
      !host.includes('g.page') &&
      !host.includes('g.co') &&
      !host.includes('goo.gl') &&
      !host.endsWith('.google')
    ) {
      return 'URL must be a valid Google Business / Maps link (e.g. share.google, google.com, or g.page)';
    }

    return null;
  };

  const handleSocialChange = (
    platformKey: keyof SocialLinksConfig,
    field: 'url' | 'active',
    value: string | boolean
  ) => {
    const currentSocial = settings.socialLinks || {};
    const platformConfig: SocialPlatformConfig = currentSocial[platformKey] || {
      url: '',
      active: false
    };

    const updatedConfig = {
      ...platformConfig,
      [field]: value
    };

    if (field === 'active' && value === true && !updatedConfig.url && platformKey === 'whatsapp') {
      updatedConfig.url = 'https://wa.me/919933335131';
    }

    if (field === 'url') {
      const error = validateUrl(platformKey, value as string);
      setValidationErrors((prev) => {
        const next = { ...prev };
        if (error) {
          next[platformKey] = error;
        } else {
          delete next[platformKey];
        }
        return next;
      });
    }

    setSettings({
      ...settings,
      socialLinks: {
        ...currentSocial,
        [platformKey]: updatedConfig
      }
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate social URLs
    const currentSocial = settings.socialLinks || {};
    const errors: Record<string, string> = {};

    SOCIAL_PLATFORMS.forEach((platform) => {
      const config = currentSocial[platform.key];
      if (config && config.url && config.url.trim()) {
        const err = validateUrl(platform.key, config.url);
        if (err) errors[platform.key] = err;
      }
      if (config && config.active && (!config.url || !config.url.trim())) {
        errors[platform.key] = 'Please provide a valid URL or disable this platform';
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    DataAccessLayer.updateWebsiteSettings(settings, currentUser);
    setValidationErrors({});
    showSuccessBanner('Website settings saved successfully.');
  };

  const currentLogoUrl = settings.brand?.logoUrl || settings.logoUrl || '';
  const currentFaviconUrl = settings.brand?.faviconUrl || settings.faviconUrl || '';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Centralized Clinic Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Website Settings & Brand Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
            Manage the centralized CareOn Brand Logo, Browser Favicon, official contact numbers, social channels, and public announcements.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
        )}
      </div>

      {/* Global Error Banner if any */}
      {brandError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-800">Brand Asset Error</h4>
              <p className="text-xs text-rose-700 mt-0.5">{brandError}</p>
            </div>
          </div>
          <button
            onClick={() => setBrandError(null)}
            className="text-rose-500 hover:text-rose-800 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'brand'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Brand Identity & Logo</span>
          {stagedLogo || stagedFavicon ? (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Clinic Identity & Helplines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'social'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Social Media Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'location'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Location & Hours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcement')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcement'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Public Announcement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ml-auto ${
            activeTab === 'all'
              ? 'bg-white text-[#007E70] shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          View All
        </button>
      </div>

      {/* Hidden File Inputs for Direct Brand Uploads */}
      <input
        ref={logoFileInputRef}
        type="file"
        accept=".svg,.png,.webp,image/svg+xml,image/png,image/webp"
        onChange={handleDirectLogoUpload}
        className="hidden"
      />
      <input
        ref={faviconFileInputRef}
        type="file"
        accept=".svg,.png,.ico,image/svg+xml,image/png,image/x-icon,image/vnd.microsoft.icon"
        onChange={handleDirectFaviconUpload}
        className="hidden"
      />

      {/* Form Content */}
      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: BRAND IDENTITY & LOGO MANAGEMENT                  */}
        {/* ========================================================= */}
        {(activeTab === 'brand' || activeTab === 'all') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-8 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#007E70]" />
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                    Brand Identity & Centralized Logo
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  CareOn Medical Clinic utilizes one single source of truth for branding. Updating the logo here immediately reflects across the Public Header, Mobile Header, Footer, Admin Login, and Admin Control Center.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-[11px] text-[#007E70] bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                  Single Source of Truth
                </span>
              </div>
            </div>

            {/* Grid for Logo & Favicon */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* --- SECTION 1: CAREON LOGO --- */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/90 border border-slate-200 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#007E70]" />
                        <span>Official CareOn Clinic Logo</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepted formats: SVG (recommended), PNG, WebP (Transparent background). Max 5 MB.
                      </p>
                    </div>

                    {currentLogoUrl ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                        Custom Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full">
                        Vector Brandmark
                      </span>
                    )}
                  </div>

                  {/* Logo Live Display or Staged Comparison Preview */}
                  {stagedLogo ? (
                    <div className="space-y-3 p-4 bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Logo Preview (Pending Confirmation)</span>
                        </span>
                        <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-md text-amber-800">
                          Unsaved
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        {/* Current Logo */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center min-h-[90px]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Current Active Logo
                          </span>
                          <CareOnLogo settings={settings} size="sm" />
                        </div>

                        {/* Staged New Logo Preview */}
                        <div className="p-3 bg-teal-50/50 rounded-xl border-2 border-[#007E70] text-center flex flex-col items-center justify-center min-h-[90px] shadow-2xs">
                          <span className="text-[10px] font-bold text-[#007E70] uppercase tracking-wider mb-2 block">
                            New Logo Preview
                          </span>
                          {stagedLogo.url ? (
                            <img
                              src={stagedLogo.url}
                              alt={stagedLogo.altText || 'CareOn Logo Preview'}
                              className="max-h-10 w-auto object-contain"
                            />
                          ) : (
                            <CareOnLogo settings={{ ...settings, logoUrl: '', brand: undefined }} size="sm" />
                          )}
                        </div>
                      </div>

                      {/* Staging Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80">
                        <button
                          type="button"
                          onClick={handleCancelStagedLogo}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStagedLogo}
                          className="px-4 py-1.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Logo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Default Visual Canvas Display */
                    <div className="space-y-2">
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-center min-h-[110px] shadow-2xs">
                        <CareOnLogo settings={settings} size="lg" />
                      </div>
                      <p className="text-[10px] text-center text-slate-400">
                        Live Preview rendering exact pixel geometry without modification
                      </p>
                    </div>
                  )}

                  {/* Alt Text Configuration */}
                  <div className="space-y-1 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Logo Alt Text (Accessibility & SEO)
                    </label>
                    <input
                      type="text"
                      value={settings.brand?.logoAlt || settings.logoAlt || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((prev) => ({
                          ...prev,
                          logoAlt: val,
                          brand: {
                            ...(prev.brand || {}),
                            logoUrl: prev.brand?.logoUrl || prev.logoUrl || '',
                            logoAssetId: prev.brand?.logoAssetId || prev.logoAssetId || '',
                            logoAlt: val,
                            faviconUrl: prev.brand?.faviconUrl || prev.faviconUrl || '',
                            faviconAssetId: prev.brand?.faviconAssetId || prev.faviconAssetId || ''
                          }
                        }));
                      }}
                      placeholder="CareOn Medical Clinic - Caring Beyond Treatment"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#007E70]"
                    />
                  </div>
                </div>

                {/* Logo Action Toolbar */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isUploadingBrand}
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBrand ? 'Uploading...' : 'Upload Logo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLogoPickerOpen(true)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#007E70]" />
                    <span>Choose from Media Library</span>
                  </button>

                  {currentLogoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      title="Revert to approved CareOn vector brandmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* --- SECTION 2: CAREON FAVICON --- */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/90 border border-slate-200 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#007E70]" />
                        <span>Browser Tab Favicon</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accepted: SVG or PNG (32×32 / 64×64 recommended). Max 1 MB.
                      </p>
                    </div>

                    {currentFaviconUrl ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                        Custom Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-full">
                        Default Emblem
                      </span>
                    )}
                  </div>

                  {/* Staged Favicon Preview or Simulated Browser Tab */}
                  {stagedFavicon ? (
                    <div className="space-y-3 p-4 bg-amber-50/80 border-2 border-dashed border-amber-300 rounded-2xl">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Favicon Preview (Pending Confirmation)</span>
                        </span>
                        <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-md text-amber-800">
                          Unsaved
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Browser Simulator */}
                        <div className="p-3 rounded-xl bg-slate-200/90 border border-slate-300 flex items-center gap-2">
                          <div className="bg-white rounded-t-lg px-3 py-2 border-t border-x border-slate-200 flex items-center gap-2.5 shadow-xs max-w-sm truncate">
                            <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 border border-slate-200">
                              {stagedFavicon.url ? (
                                <img
                                  src={stagedFavicon.url}
                                  alt="Staged Favicon"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded bg-[#007E70] text-white flex items-center justify-center text-[8px] font-bold">
                                  +
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              CareOn Medical Clinic — Staged Favicon
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Staging Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/80">
                        <button
                          type="button"
                          onClick={handleCancelStagedFavicon}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStagedFavicon}
                          className="px-4 py-1.5 bg-[#007E70] hover:bg-[#00665B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Favicon</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Default Browser Tab Simulation */
                    <div className="space-y-2">
                      <div className="p-4 rounded-2xl bg-slate-200/70 border border-slate-300 flex items-center gap-2 min-h-[110px]">
                        <div className="bg-white rounded-t-xl px-3.5 py-2.5 border-t border-x border-slate-300/80 flex items-center gap-2.5 shadow-xs max-w-sm">
                          <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100">
                            {currentFaviconUrl ? (
                              <img
                                src={currentFaviconUrl}
                                alt="Favicon"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded bg-[#007E70] text-white flex items-center justify-center text-[9px] font-bold">
                                +
                              </div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {settings.clinicName || 'CareOn Medical Clinic'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-center text-slate-400">
                        Browser Tab Simulation: Updates the &lt;head&gt; favicon icon dynamically
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-teal-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#007E70] shrink-0 mt-0.5" />
                    <span>
                      If no custom favicon is uploaded, CareOn automatically injects the fallback vector cross &amp; stethoscope brandmark.
                    </span>
                  </div>
                </div>

                {/* Favicon Action Toolbar */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={isUploadingBrand}
                    onClick={() => faviconFileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#007E70] hover:bg-[#00665B] disabled:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBrand ? 'Uploading...' : 'Upload Favicon'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFaviconPickerOpen(true)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#007E70]" />
                    <span>Choose from Media Library</span>
                  </button>

                  {currentFaviconUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveFavicon}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      title="Revert to CareOn default vector favicon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Favicon</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GENERAL CLINIC IDENTITY & CONTACTS                */}
        {/* ========================================================= */}
        {(activeTab === 'general' || activeTab === 'all') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Core Names & Taglines */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-4 h-4 text-[#007E70]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Clinic Identity & Taglines</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Clinic Brand Name (English)
                  </label>
                  <input
                    type="text"
                    value={settings.clinicName}
                    onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Clinic Brand Name (Bengali)
                  </label>
                  <input
                    type="text"
                    value={settings.clinicNameBn}
                    onChange={(e) => setSettings({ ...settings, clinicNameBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Tagline (Bengali)
                  </label>
                  <input
                    type="text"
                    value={settings.taglineBn}
                    onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                  />
                </div>
              </div>
            </div>

            {/* Direct Contact Numbers & Helplines */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#007E70]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Public Helplines & Direct Contact</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Primary Appointment Phone
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    WhatsApp Support Number
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber || settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Emergency Hotline
                  </label>
                  <input
                    type="text"
                    value={settings.emergencyPhone}
                    onChange={(e) => setSettings({ ...settings, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#0F172A]">
                    Official Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SOCIAL MEDIA CHANNELS                             */}
        {/* ========================================================= */}
        {(activeTab === 'social' || activeTab === 'all') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#007E70]" />
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Social Media & Community Channels</h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Configure official social media links displayed on the website footer and contact channels.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const config = settings.socialLinks?.[platform.key] || { url: '', active: false };
                const error = validationErrors[platform.key];

                return (
                  <div
                    key={platform.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      config.active
                        ? 'bg-slate-50/80 border-[#007E70]/30 shadow-2xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            config.active
                              ? 'bg-[#007E70] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#0F172A]">{platform.name}</h4>
                            {config.active ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                                Disabled
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{platform.description}</p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 self-start sm:self-center cursor-pointer">
                        <span className="text-xs font-semibold text-slate-600">
                          {config.active ? 'Visible on Website' : 'Hidden'}
                        </span>
                        <input
                          type="checkbox"
                          checked={config.active}
                          onChange={(e) =>
                            handleSocialChange(platform.key, 'active', e.target.checked)
                          }
                          className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70] cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Profile URL ({platform.domainHint})
                        </label>
                        {config.url && !error && (
                          <a
                            href={config.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#007E70] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Test Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <input
                        type="url"
                        value={config.url}
                        onChange={(e) =>
                          handleSocialChange(platform.key, 'url', e.target.value)
                        }
                        placeholder={platform.placeholder}
                        className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                          error
                            ? 'bg-rose-50 border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'bg-white border-slate-200 text-slate-900 focus:bg-white focus:border-[#007E70]'
                        }`}
                      />
                      {error && (
                        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{error}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: LOCATION & OPERATING HOURS                        */}
        {/* ========================================================= */}
        {(activeTab === 'location' || activeTab === 'all') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-[#007E70]" />
              <h3 className="text-sm font-bold text-[#0F172A]">Physical Address & Operating Hours</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Google Maps Embed URL
                </label>
                <input
                  type="url"
                  value={settings.googleMapsUrl}
                  onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Operating Hours Summary
                </label>
                <input
                  type="text"
                  value={settings.openingHours}
                  onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                  placeholder="Monday – Saturday: 09:00 AM – 07:00 PM | Sunday: Closed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PUBLIC ANNOUNCEMENT BANNER                        */}
        {/* ========================================================= */}
        {(activeTab === 'announcement' || activeTab === 'all') && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#007E70]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Public Announcement Banner</h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.announcementEnabled || settings.announcementActive}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementEnabled: e.target.checked,
                      announcementActive: e.target.checked
                    })
                  }
                  className="w-4 h-4 text-[#007E70] rounded border-slate-300 focus:ring-[#007E70]"
                />
                <span>Display Banner on Website</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Banner Notice (English)
                </label>
                <input
                  type="text"
                  value={settings.announcementText || settings.announcement || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementText: e.target.value,
                      announcement: e.target.value
                    })
                  }
                  placeholder="e.g. Free Seasonal Cardiac Health Screening Camp this Saturday, 9 AM – 2 PM."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0F172A]">
                  Banner Notice (Bengali)
                </label>
                <input
                  type="text"
                  value={settings.announcementTextBn || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementTextBn: e.target.value
                    })
                  }
                  placeholder="বাংলা নোটিশ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none font-bengali"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Changes saved to the centralized data store propagate in real time across the live website.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setSettings(DataAccessLayer.getWebsiteSettings());
                setStagedLogo(null);
                setStagedFavicon(null);
              }}
              className="px-5 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-2xl transition-all shadow-sm shadow-teal-900/10 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* BRAND LOGO MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isLogoPickerOpen}
        onClose={() => setIsLogoPickerOpen(false)}
        onSelect={handleLogoSelectedFromLibrary}
        initialCategory="BRAND"
        title="Select Official Clinic Logo"
        selectedAssetId={settings.brand?.logoAssetId || settings.logoAssetId}
      />

      {/* BROWSER FAVICON MEDIA PICKER MODAL */}
      <MediaPickerModal
        isOpen={isFaviconPickerOpen}
        onClose={() => setIsFaviconPickerOpen(false)}
        onSelect={handleFaviconSelectedFromLibrary}
        initialCategory="FAVICON"
        title="Select Browser Tab Favicon"
        selectedAssetId={settings.brand?.faviconAssetId || settings.faviconAssetId}
      />
    </div>
  );
};
