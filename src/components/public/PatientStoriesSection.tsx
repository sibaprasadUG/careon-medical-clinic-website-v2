import React from 'react';
import {
  HeartHandshake,
  Star,
  Quote,
  CheckCircle2,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { PatientStory } from '../../types';

interface PatientStoriesSectionProps {
  stories: PatientStory[];
  lang: 'en' | 'bn';
}

export const PatientStoriesSection: React.FC<PatientStoriesSectionProps> = ({
  stories,
  lang
}) => {
  const publishedStories = stories
    .filter((s) => s.published)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (publishedStories.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60" id="patient-stories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Community Trust' : 'রোগীদের অভিজ্ঞতা'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en' ? 'Patient Experiences at CareOn' : 'আমাদের রোগীদের অনুভূতি ও অভিজ্ঞতা'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Real words from families who rely on our doctors and clinical staff for compassionate, ongoing medical guidance.'
              : 'যেসব পরিবার তাদের সুস্থতায় কেয়ারঅনের সেবা ও চিকিৎসকদের উপর আস্থা রেখেছেন, তাদের অভিজ্ঞতা।'}
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedStories.map((story) => (
            <div
              key={story.id}
              className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200 hover:border-[#007E70]/80 hover:bg-white hover:shadow-lg transition-all flex flex-col justify-between space-y-6 text-left"
            >
              <div className="space-y-4">
                {/* Rating & Treatment Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: story.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {story.treatmentCategory && (
                    <span className="px-2.5 py-0.5 bg-teal-50 text-[#007E70] text-[11px] font-bold rounded-md border border-teal-100">
                      {story.treatmentCategory}
                    </span>
                  )}
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative">
                  "{lang === 'en' ? story.story : story.storyBn || story.story}"
                </p>
              </div>

              {/* Patient Attribution */}
              {(() => {
                const displayName = (lang === 'bn' ? (story.patientDisplayNameBn || story.patientNameBn) : undefined) ||
                  story.patientDisplayName || story.patientName || 'CareOn Patient';
                return (
                  <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#007E70]/10 text-[#007E70] font-extrabold flex items-center justify-center text-sm shrink-0">
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A]">
                        {displayName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        {story.tag && <span className="text-teal-700 font-semibold">{story.tag}</span>}
                        {story.location && (
                          <>
                            {story.tag && <span>•</span>}
                            <span>{story.location}</span>
                          </>
                        )}
                        {story.doctorName && (
                          <>
                            <span>•</span>
                            <span className="text-teal-800 font-semibold">{story.doctorName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
