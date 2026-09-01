import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Facebook,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

interface ContactPageProps {
  lang: 'en' | 'bn';
  onOpenBooking: () => void;
  settings: WebsiteSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  lang,
  onOpenBooking,
  settings
}) => {
  const [name, setName] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSent, setIsSent] = useState<boolean>(false);

  const cleanWhatsAppNumber = (settings.whatsapp || settings.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = settings.socialLinks?.whatsapp?.active && settings.socialLinks.whatsapp.url?.trim()
    ? settings.socialLinks.whatsapp.url.trim()
    : `https://wa.me/91${cleanWhatsAppNumber || '9933335131'}`;

  const social = settings.socialLinks;
  const activeSocials = [];

  if (social?.facebook?.active && social.facebook.url?.trim()) {
    activeSocials.push({
      id: 'facebook',
      name: 'Facebook',
      url: social.facebook.url.trim(),
      icon: Facebook,
      ariaLabel: 'Visit CareOn Medical Clinic on Facebook'
    });
  }
  if (social?.instagram?.active && social.instagram.url?.trim()) {
    activeSocials.push({
      id: 'instagram',
      name: 'Instagram',
      url: social.instagram.url.trim(),
      icon: Instagram,
      ariaLabel: 'Follow CareOn Medical Clinic on Instagram'
    });
  }
  if (social?.googleBusiness?.active && social.googleBusiness.url?.trim()) {
    activeSocials.push({
      id: 'googleBusiness',
      name: 'Google Business Profile',
      url: social.googleBusiness.url.trim(),
      icon: Globe,
      ariaLabel: 'Find CareOn Medical Clinic on Google Maps'
    });
  }
  if (social?.youtube?.active && social.youtube.url?.trim()) {
    activeSocials.push({
      id: 'youtube',
      name: 'YouTube',
      url: social.youtube.url.trim(),
      icon: Youtube,
      ariaLabel: 'Watch CareOn Medical Clinic on YouTube'
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    setIsSent(true);
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-[#007E70] text-xs font-bold uppercase tracking-wider border border-teal-100">
            <MapPin className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Clinic Reach & Location' : 'ক্লিনিকের ঠিকানা ও যোগাযোগ'}</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {lang === 'en' ? 'Connect with CareOn' : 'আমাদের সাথে যোগাযোগ করুন'}
          </h1>

          <p className="text-base sm:text-lg text-[#475569] leading-relaxed">
            {lang === 'en'
              ? 'Visit our outpatient clinic, call our helpline, or send a message for appointment and diagnostic guidance.'
              : 'ক্লিনিকে সরাসরি আসুন অথবা অ্যাপয়েন্টমেন্ট ও টেস্ট সংক্রান্ত যে কোনো তথ্যের জন্য ফোন বা বার্তা পাঠান।'}
          </p>
        </div>

        {/* Contact Info & Inquiry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Verified Contact Cards */}
          <div className="lg:col-span-6 space-y-4 text-left">
            {/* Address & Hours */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
              <h2 className="text-lg font-extrabold text-[#0F172A]">
                {settings.clinicName || 'CareOn Medical Clinic'}
              </h2>

              <div className="space-y-4 text-xs text-slate-700">
                {settings.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007E70] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? 'Clinic Address' : 'ক্লিনিকের ঠিকানা'}
                      </div>
                      <div className="text-slate-600 mt-0.5 leading-relaxed">
                        {settings.address}
                      </div>
                    </div>
                  </div>
                )}

                {settings.openingHours && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#007E70] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {lang === 'en' ? 'Consultation Hours' : 'রোগী দেখার সময়সূচী'}
                      </div>
                      <div className="text-slate-600 mt-0.5 leading-relaxed">
                        {settings.openingHours}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Connect Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-[#007E70] font-bold text-xs">
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Clinic Helpline' : 'ক্লিনিক হেল্পলাইন'}</span>
                </div>
                <a
                  href="tel:9933335131"
                  className="block text-base font-extrabold text-[#0F172A] hover:text-[#007E70] transition-colors"
                >
                  9933335131
                </a>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Helpline for inquiries & schedule' : 'হেল্পলাইন ও সাধারণ অনুসন্ধান'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-[#007E70] font-bold text-xs">
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Direct Call' : 'সরাসরি কল'}</span>
                </div>
                <a
                  href="tel:9933520248"
                  className="block text-base font-extrabold text-[#0F172A] hover:text-[#007E70] transition-colors"
                >
                  9933520248
                </a>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Direct clinic desk connection' : 'ক্লিনিক ডেস্ক সরাসরি সংযোগ'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-[#0D9488] font-bold text-xs">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-base font-extrabold text-[#0F172A] hover:text-[#007E70] transition-colors"
                  aria-label="Chat with CareOn Medical Clinic on WhatsApp"
                >
                  9933335131
                </a>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Quick message for reports & bookings' : 'টেস্ট রিপোর্ট ও বুকিং সহায়তা'}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                  <Mail className="w-4 h-4 text-[#007E70]" />
                  <span>{lang === 'en' ? 'Email Desk' : 'ইমেইল ডেস্ক'}</span>
                </div>
                <a
                  href="mailto:info@careonmedical.in"
                  className="block text-sm font-extrabold text-[#0F172A] hover:text-[#007E70] transition-colors truncate"
                >
                  info@careonmedical.in
                </a>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' ? 'Official mail communications' : 'অফিসিয়াল ইমেইল যোগাযোগ'}
                </p>
              </div>
            </div>

            {/* Active Social Media Channels Card (if any active) */}
            {activeSocials.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-[#0F172A]">
                  {lang === 'en' ? 'Connect on Official Social Media' : 'সোশ্যাল মিডিয়ায় যুক্ত থাকুন'}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {activeSocials.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-[#007E70] text-slate-700 hover:text-white flex items-center justify-center transition-all duration-200 border border-slate-200 hover:border-[#007E70] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                        aria-label={item.ariaLabel}
                        title={item.name}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Quick Patient General Inquiry Form */}
          <div className="lg:col-span-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#0F172A]">
                  {lang === 'en' ? 'Send a General Inquiry' : 'সাধারণ বার্তা পাঠান'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'For non-urgent inquiries regarding doctors or clinical tests.'
                    : 'চিকিৎসক বা টেস্ট সম্পর্কিত সাধারণ তথ্যের জন্য বার্তা দিন।'}
                </p>
              </div>

              {isSent ? (
                <div className="p-6 bg-teal-50 border border-teal-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-[#007E70] mx-auto" />
                  <h4 className="text-base font-bold text-[#0F172A]">
                    {lang === 'en' ? 'Inquiry Sent' : 'বার্তা গৃহীত হয়েছে'}
                  </h4>
                  <p className="text-xs text-teal-800">
                    {lang === 'en'
                      ? 'Thank you for reaching out. Our reception desk will review and get back to you.'
                      : 'ধন্যবাদ। আমাদের রিসেপশন টিম আপনার বার্তা পর্যালোচনা করে দ্রুত যোগাযোগ করবে।'}
                  </p>
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setName('');
                      setContact('');
                      setMessage('');
                    }}
                    className="px-4 py-2 bg-white text-[#007E70] font-bold text-xs rounded-xl border border-teal-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {lang === 'en' ? 'Send Another Message' : 'আরেকটি বার্তা পাঠান'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      {lang === 'en' ? 'Your Name' : 'আপনার নাম'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Soumitra Das"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      {lang === 'en' ? 'Phone Number or Email' : 'মোবাইল নম্বর বা ইমেইল'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. +91 98300 XXXXX / name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      {lang === 'en' ? 'Your Message or Question' : 'আপনার বার্তা বা প্রশ্ন'} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={lang === 'en' ? 'How can our clinic desk assist you today?' : 'আমরা আপনাকে কীভাবে সহায়তা করতে পারি?'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007E70]/20 focus:border-[#007E70]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#007E70] hover:bg-[#009282] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Send Message' : 'বার্তা পাঠান'}</span>
                  </button>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-[#007E70] text-xs font-bold rounded-xl border border-teal-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Looking to Book a Doctor? Click Here' : 'ডাক্তার অ্যাপয়েন্টমেন্টের জন্য এখানে ক্লিক করুন'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
