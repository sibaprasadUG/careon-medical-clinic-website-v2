import React, { useState } from 'react';
import {
  Image as ImageIcon,
  X,
  Maximize2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GalleryItem } from '../../types';

interface GallerySectionProps {
  gallery: GalleryItem[];
  lang: 'en' | 'bn';
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  lang
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<GalleryItem | null>(null);

  const publishedItems = gallery
    .filter((g) => g.published)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const categories = Array.from(new Set(publishedItems.map((g) => g.category)));

  const filteredItems =
    selectedCategory === 'all'
      ? publishedItems
      : publishedItems.filter((g) => g.category === selectedCategory);

  if (publishedItems.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/60" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Clinic Atmosphere' : 'ক্লিনিকের পরিবেশ'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en' ? 'Clinical Environment & Facilities' : 'ক্লিনিক ও ল্যাবরেটরি সুবিধাসমূহ'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'A glimpse into our clean, quiet patient consultation chambers, sterile diagnostic collection area, and supportive clinical environment.'
              : 'পরিচ্ছন্ন ও শান্ত পরিবেশ, আধুনিক পরামর্শ চেম্বার এবং নির্ভুল পরীক্ষার আধুনিক যন্ত্রপাতি।'}
          </p>
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#007E70] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Areas' : 'সকল ছবি'} ({publishedItems.length})
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#007E70] hover:shadow-lg transition-all group cursor-pointer text-left flex flex-col justify-between"
            >
              <div className="relative overflow-hidden aspect-4/3 bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.altText || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#0F172A]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-2.5 rounded-xl bg-[#007E70]/90 text-white backdrop-blur-xs">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-[#0F172A]/70 backdrop-blur-xs text-white text-[10px] font-bold">
                  {item.category}
                </div>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-xs font-extrabold text-[#0F172A] group-hover:text-[#007E70] transition-colors truncate">
                  {lang === 'en' ? item.title : item.titleBn || item.title}
                </h3>
                {item.caption && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {lang === 'en' ? item.caption : item.captionBn || item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={activeModalItem.imageUrl}
                alt={activeModalItem.altText || activeModalItem.title}
                className="max-h-[60vh] w-full object-contain"
              />
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-50 text-[#007E70] text-xs font-bold rounded-md">
                  {activeModalItem.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                {lang === 'en' ? activeModalItem.title : activeModalItem.titleBn || activeModalItem.title}
              </h3>
              {activeModalItem.caption && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lang === 'en' ? activeModalItem.caption : activeModalItem.captionBn || activeModalItem.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
