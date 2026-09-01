import React, { useState } from 'react';
import {
  ChevronDown,
  CheckSquare,
  ClipboardList,
  HelpCircle,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { FAQ, WebsiteSettings } from '../../types';

interface FAQAndPrepareSectionProps {
  faqs: FAQ[];
  lang: 'en' | 'bn';
  settings: WebsiteSettings;
}

export const FAQAndPrepareSection: React.FC<FAQAndPrepareSectionProps> = ({
  faqs,
  lang,
  settings
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      question: 'Do I need an appointment?',
      questionBn: 'আমার কি আগে থেকে অ্যাপয়েন্টমেন্ট নেওয়া প্রয়োজন?',
      answer:
        'While walk-ins are accommodated based on doctor roster availability, booking an appointment in advance guarantees your consultation slot and minimizes clinic waiting time.',
      answerBn:
        'ওয়াক-ইন রোগীদের ডাক্তারবাবুর চেম্বারের স্লট অনুযায়ী দেখা হয়, তবে অগ্রিম বুকিং করলে নির্দিষ্ট সময় পাওয়া যায় এবং অপেক্ষার সময় কমে।'
    },
    {
      question: 'Do you accept walk-ins?',
      questionBn: 'ওয়াক-ইন বা সরাসরি এসে দেখানো যাবে?',
      answer:
        'Yes, our reception desk assists walk-in patients during clinic operating hours (8:00 AM – 7:00 PM) for general consultations and pathology sample collection.',
      answerBn:
        'হ্যাঁ, ক্লিনিকের সময়সূচীর মধ্যে সরাসরি এসে রিসেপশনে নাম এন্ট্রি করে সাধারণ ডাক্তার দেখানো ও প্যাথলজি টেস্ট করানো যাবে।'
    },
    {
      question: 'What should I bring to my appointment?',
      questionBn: 'অ্যাপয়েন্টমেন্টে আসার সময় কী কী সাথে আনা উচিত?',
      answer:
        'Please bring a valid photo ID, previous medical prescriptions, current medications list, and any recent diagnostic laboratory reports.',
      answerBn:
        'অনুগ্রহ করে পরিচয়পত্র, পূর্ববর্তী প্রেসক্রিপশন, নিয়মিত ওষুধের তালিকা ও সাম্প্রতিক টেস্ট রিপোর্ট সঙ্গে আনুন।'
    },
    {
      question: 'Do you offer doorstep home sample collection?',
      questionBn: 'বাড়িতে এসে রক্ত বা স্যাম্পল সংগ্রহের সুবিধা আছে?',
      answer:
        'Yes, our trained phlebotomists provide safe and punctual doorstep sample collection in Contai and surrounding areas. Book online or call 9933520248.',
      answerBn:
        'হ্যাঁ, কাঁথি ও পার্শ্ববর্তী অঞ্চলে প্রশিক্ষিত টেকনিশিয়ান দ্বারা নিরাপদ হোম ব্লাড কালেকশন সুবিধা রয়েছে।'
    },
    {
      question: 'How do I get my diagnostic test results?',
      questionBn: 'ল্যাব পরীক্ষার রিপোর্ট কীভাবে পাওয়া যাবে?',
      answer:
        'You can collect printed, verified hard copies directly from the clinic desk or receive high-resolution digital PDF reports on WhatsApp/Email.',
      answerBn:
        'সরাসরি ক্লিনিকের রিসেপশন থেকে প্রিন্ট কপি নেওয়া যাবে অথবা হোয়াটসঅ্যাপ বা ইমেইলে পিডিএফ রিপোর্ট সংগ্রহ করতে পারবেন।'
    }
  ];

  const displayFaqs = faqs.length > 0 ? faqs.slice(0, 5) : defaultFaqs;

  const prepareChecklist = [
    {
      id: 1,
      text: lang === 'en' ? 'Bring a valid photo ID and insurance / prescription' : 'সঠিক পরিচয়পত্র এবং পূর্বের প্রেসক্রিপশন আনুন'
    },
    {
      id: 2,
      text: lang === 'en' ? 'List of current medications and dosages' : 'চলমান সকল ওষুধ ও মাত্রার তালিকা প্রস্তুত রাখুন'
    },
    {
      id: 3,
      text: lang === 'en' ? 'Any relevant medical records or prior test results' : 'পূর্বে করা ল্যাব ও রেডিওলজি টেস্ট রিপোর্ট সাথে রাখুন'
    },
    {
      id: 4,
      text: lang === 'en' ? 'Write down symptoms or questions for your doctor' : 'আপনার শারীরিক সমস্যা ও প্রশ্নাবলি পয়েন্ট করে রাখুন'
    }
  ];

  return (
    <section className="bg-white py-12 lg:py-16 border-b border-slate-200/80 font-sans-ui">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT: FREQUENTLY ASKED QUESTIONS (Accordion) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                {lang === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা ও উত্তর'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {lang === 'en' ? 'Quick answers to common clinic questions.' : 'ক্লিনিক সংক্রান্ত প্রয়োজনীয় তথ্য।'}
              </p>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {displayFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                const question = lang === 'en' ? faq.question : (faq.questionBn || faq.question);
                const answer = lang === 'en' ? faq.answer : (faq.answerBn || faq.answer);

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold text-[#0B192C]">
                        {question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#007E70]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/60 border-t border-slate-100">
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: PREPARE FOR YOUR VISIT (Checklist Card Matching Reference) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                {lang === 'en' ? 'Prepare for Your Visit' : 'ক্লিনিকে আসার প্রস্তুতি'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {lang === 'en'
                  ? 'Help us make your visit smooth and efficient.'
                  : 'আপনার ভিজিট যাতে স্বাচ্ছন্দ্যময় ও দ্রুত হয় তার জন্য কিছু প্রস্তুতি।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Checklist Items */}
              <div className="sm:col-span-7 space-y-3.5">
                {prepareChecklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-teal-100 border border-teal-300 text-[#007E70] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 leading-snug">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Aesthetic Checklist / Clipboard Graphic Visual (Matching Reference) */}
              <div className="sm:col-span-5">
                <div className="relative bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
                  <div className="w-8 h-2 bg-slate-800 rounded-full mx-auto mb-3" />
                  <div className="text-[11px] font-extrabold text-center uppercase tracking-widest text-[#0B192C] pb-2 border-b border-slate-100">
                    CHECKLIST
                  </div>
                  <div className="space-y-2 pt-2 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border border-slate-300 rounded-xs" />
                      <div className="h-2 bg-slate-200 rounded w-20" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border border-slate-300 rounded-xs" />
                      <div className="h-2 bg-slate-200 rounded w-16" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border border-slate-300 rounded-xs" />
                      <div className="h-2 bg-slate-200 rounded w-24" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 border border-slate-300 rounded-xs" />
                      <div className="h-2 bg-slate-200 rounded w-14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
