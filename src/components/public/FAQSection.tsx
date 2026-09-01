import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Search,
  MessageCircle,
  Phone,
  Sparkles
} from 'lucide-react';
import { FAQ, WebsiteSettings } from '../../types';

interface FAQSectionProps {
  faqs: FAQ[];
  lang: 'en' | 'bn';
  settings?: WebsiteSettings;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  lang,
  settings
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-01');

  const publishedFaqs = faqs
    .filter((f) => f.published)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const categories = Array.from(new Set(publishedFaqs.map((f) => f.category)));

  const filteredFaqs = publishedFaqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'all' || faq.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesSearch =
      faq.question.toLowerCase().includes(query) ||
      (faq.questionBn && faq.questionBn.toLowerCase().includes(query)) ||
      faq.answer.toLowerCase().includes(query) ||
      (faq.answerBn && faq.answerBn.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const cleanWhatsAppNumber = (settings?.whatsapp || settings?.phone || '').replace(/[^0-9]/g, '');

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60" id="faqs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Help & Information' : 'সাধারণ জিজ্ঞাসা'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            {lang === 'en'
              ? 'Frequently Asked Questions'
              : 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী'}
          </h2>

          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Everything you need to know about doctor appointments, clinic operating hours, and test preparations.'
              : 'অ্যাপয়েন্টমেন্ট গ্রহণ, ক্লিনিকের সময়সূচী এবং টেস্ট সংক্রান্ত প্রয়োজনীয় তথ্যাদি।'}
          </p>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search questions or topics...' : 'প্রশ্ন বা বিষয় খুঁজুন...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70] transition-all"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#007E70] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {lang === 'en' ? 'All Questions' : 'সকল প্রশ্ন'}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-[#007E70] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* FAQs Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              {lang === 'en' ? 'No questions matched your search query.' : 'আপনার অনুসন্ধানের সাথে কোনো প্রশ্ন মেলেনি।'}
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all text-left overflow-hidden ${
                    isExpanded
                      ? 'bg-teal-50/40 border-[#007E70]/50 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {lang === 'en' ? faq.question : faq.questionBn || faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#007E70] bg-teal-50 border-teal-200' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-teal-100/60 animate-in fade-in duration-150">
                      {lang === 'en' ? faq.answer : faq.answerBn || faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Help Prompt */}
        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0F172A]">
              {lang === 'en' ? 'Have additional medical or schedule inquiries?' : 'অন্য কোনো প্রশ্ন বা জিজ্ঞাসা আছে?'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Our clinic helpdesk is ready to assist you directly via phone or WhatsApp.'
                : 'আমাদের হেল্প ডেস্ক টিম আপনার সাথে সরাসরি কথা বলতে প্রস্তুত।'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {cleanWhatsAppNumber && (
              <a
                href={`https://wa.me/${cleanWhatsAppNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-[#007E70] text-xs font-bold rounded-xl border border-teal-200 flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {settings?.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>{lang === 'en' ? 'Call Clinic' : 'কল করুন'}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
