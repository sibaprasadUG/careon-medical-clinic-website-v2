import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { useAuth } from '../../lib/authContext';
import { SEOSettings } from '../../types';
import {
  Globe,
  CheckCircle2,
  Save,
  Search,
  Share2
} from 'lucide-react';

export const SEOSettingsManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [seo, setSeo] = useState<SEOSettings>(() => DataAccessLayer.getSEOSettings());
  const [keywordsStr, setKeywordsStr] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const data = DataAccessLayer.getSEOSettings();
    setSeo(data);
    setKeywordsStr((data.defaultKeywords || []).join(', '));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const kwList = keywordsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    DataAccessLayer.updateSEOSettings({ ...seo, defaultKeywords: kwList }, currentUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            SEO & Search Engine Discoverability
          </h2>
          <p className="text-xs text-slate-500">
            Configure Google search snippet previews, OpenGraph social sharing meta tags, and structured clinical schema.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>SEO Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Google SERP Preview Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Search className="w-4 h-4 text-[#007E70]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Google Search Result Simulation</h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[11px] text-emerald-800 font-mono truncate">
              https://careonclinic.com
            </div>
            <div className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer">
              {seo.metaTitle || 'CareOn Medical Clinic — Trusted Healthcare for You & Your Family'}
            </div>
            <p className="text-xs text-[#545454] leading-relaxed line-clamp-2">
              {seo.metaDescription ||
                'Modern patient-centred clinic in South Kolkata providing general medicine, cardiology, diagnostics and family healthcare.'}
            </p>
          </div>
        </div>

        {/* Primary Meta Tags */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-[#007E70]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Search Engine Meta Tags</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">
                Site Title
              </label>
              <input
                type="text"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">
                Meta Description (Recommended: 140–160 chars)
              </label>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
              <div className="text-[10px] text-slate-400 text-right">
                {seo.metaDescription.length} characters
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">
                Default Keywords (Comma-separated)
              </label>
              <input
                type="text"
                value={keywordsStr}
                onChange={(e) => setKeywordsStr(e.target.value)}
                placeholder="CareOn Clinic, doctor in kolkata, cardiology checkup, blood test..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Sharing / OpenGraph */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Share2 className="w-4 h-4 text-[#007E70]" />
            <h3 className="text-sm font-bold text-[#0F172A]">OpenGraph / WhatsApp Social Share Card</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#0F172A]">
                  OG Image URL (1200x630 recommended)
                </label>
                {seo.ogImage && (
                  <button
                    type="button"
                    onClick={() => setSeo({ ...seo, ogImage: '' })}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>
              <input
                type="url"
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
              />
            </div>

            {seo.ogImage && (
              <div className="w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={seo.ogImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setSeo(DataAccessLayer.getSEOSettings());
            }}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-900/10 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
