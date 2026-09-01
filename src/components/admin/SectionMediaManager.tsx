import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  Eye,
  Sliders,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { SectionMediaSettings, WebsiteSettings } from '../../types';
import { DataAccessLayer } from '../../lib/dal';
import { MediaStorageService, formatBytes } from '../../lib/mediaStorage';
import { useAuth } from '../../lib/authContext';

export const SectionMediaManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<WebsiteSettings>(() => DataAccessLayer.getWebsiteSettings());
  const [activeSection, setActiveSection] = useState<'hero' | 'homeCare' | 'about' | 'emergency'>('hero');
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [sectionMedia, setSectionMedia] = useState<SectionMediaSettings>(() => ({
    heroImage: settings.sectionMedia?.heroImage || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
    homeCareImage: settings.sectionMedia?.homeCareImage || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900',
    aboutImage: settings.sectionMedia?.aboutImage || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
    emergencyImage: settings.sectionMedia?.emergencyImage || 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=1000'
  }));

  const [isUploading, setIsUploading] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const handleUpdate = () => {
      const fresh = DataAccessLayer.getWebsiteSettings();
      setSettings(fresh);
      if (fresh.sectionMedia) {
        setSectionMedia((prev) => ({
          ...prev,
          ...fresh.sectionMedia
        }));
      }
    };
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const handleSaveSettings = (updatedMedia: SectionMediaSettings) => {
    const current = DataAccessLayer.getWebsiteSettings();
    const newSettings: WebsiteSettings = {
      ...current,
      sectionMedia: updatedMedia
    };
    DataAccessLayer.saveWebsiteSettings(newSettings);
    setSectionMedia(updatedMedia);
    showNotification('Section images updated and propagated to live website.');
  };

  const handleImageUrlChange = (key: keyof SectionMediaSettings, val: string) => {
    const updated = {
      ...sectionMedia,
      [key]: val
    };
    setSectionMedia(updated);
    handleSaveSettings(updated);
  };

  const handleResetToDefault = (key: keyof SectionMediaSettings) => {
    const defaults: Partial<Record<keyof SectionMediaSettings, string>> = {
      heroImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200',
      homeCareImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=900',
      aboutImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
      emergencyImage: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=1000'
    };

    const updated = {
      ...sectionMedia,
      [key]: defaults[key] || ''
    };
    setSectionMedia(updated);
    handleSaveSettings(updated);
    showNotification(`Reset ${key} to default image.`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: keyof SectionMediaSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const asset = await MediaStorageService.upload(
        file,
        {
          category: 'GALLERY',
          altText: `Section image for ${key}`,
          originalName: file.name
        },
        currentUser
      );

      const updated = {
        ...sectionMedia,
        [key]: asset.url
      };
      setSectionMedia(updated);
      handleSaveSettings(updated);
      showNotification(`New image uploaded for ${key} successfully.`);
    } catch (err: any) {
      showNotification(`Upload error: ${err.message || 'Failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const sectionsList: {
    key: keyof SectionMediaSettings;
    id: 'hero' | 'homeCare' | 'about' | 'emergency';
    title: string;
    description: string;
    recommendedDim: string;
    aspectRatio: string;
  }[] = [
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

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
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
            Update, change, delete, or upload custom images for the Hero Section, Video/Home Care card, and About section with live real-time previews.
          </p>
        </div>
      </div>

      {/* Section Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sectionsList.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
              activeSection === sec.id
                ? 'bg-teal-50/70 border-[#007E70] shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#0B192C]">{sec.title}</span>
              {activeSection === sec.id && <span className="w-2 h-2 rounded-full bg-[#007E70]" />}
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">{sec.description}</p>
          </button>
        ))}
      </div>

      {/* Active Section Editor Card */}
      {(() => {
        const currentSec = sectionsList.find((s) => s.id === activeSection) || sectionsList[0];
        const rawVal = sectionMedia[currentSec.key];
        const currentUrl = typeof rawVal === 'string' ? rawVal : '';

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">{currentSec.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{currentSec.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResetToDefault(currentSec.key)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Visual Preview & Upload Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Preview Column (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Current Live Visual Preview</span>
                  <span className="text-slate-400 font-medium">Recommended: {currentSec.recommendedDim}</span>
                </div>

                <div className={`relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 ${currentSec.aspectRatio}`}>
                  {currentUrl ? (
                    <img
                      src={currentUrl}
                      alt={currentSec.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <p className="text-xs font-bold">No Image Selected</p>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center justify-between">
                    <span className="truncate max-w-xs">{currentUrl}</span>
                    <span className="shrink-0 text-teal-300 font-bold ml-2">Active</span>
                  </div>
                </div>
              </div>

              {/* Edit / Upload Column (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* Upload New Image Box */}
                <div className="border-2 border-dashed border-slate-300 hover:border-[#007E70] rounded-3xl p-6 text-center bg-slate-50/60 transition-all">
                  <input
                    type="file"
                    id="section-upload"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, currentSec.key)}
                    className="hidden"
                  />
                  <label htmlFor="section-upload" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#007E70] flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-extrabold text-slate-800">
                      {isUploading ? 'Uploading & Processing...' : 'Click to Upload Custom Photo'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PNG, JPG, WEBP up to 5MB. Automatically saved into clinic storage.
                    </p>
                  </label>
                </div>

                {/* Direct Image URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Or Enter Image URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => handleImageUrlChange(currentSec.key, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#007E70]"
                    />
                  </div>
                </div>

                {/* Delete / Clear Action */}
                <div className="pt-2">
                  <button
                    onClick={() => handleImageUrlChange(currentSec.key, '')}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear / Delete Current Photo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
