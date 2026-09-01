import React from 'react';
import { FAQSection } from './FAQSection';
import { FAQ, WebsiteSettings } from '../../types';

interface FAQsPageProps {
  faqs: FAQ[];
  lang: 'en' | 'bn';
  settings?: WebsiteSettings;
}

export const FAQsPage: React.FC<FAQsPageProps> = ({ faqs, lang, settings }) => {
  return (
    <div className="py-8">
      <FAQSection faqs={faqs} lang={lang} settings={settings} />
    </div>
  );
};
