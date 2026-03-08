// src/app/page.tsx — SERVER COMPONENT (metadata + JSON-LD)
import type { Metadata } from 'next';
import LandingClient from '@/components/LandingClient';

export const metadata: Metadata = {
  title: 'Solar Arrow — Solar Business Management for Indian Vendors',
  description: 'Manage your entire solar installation pipeline — from leads to subsidy claims. Built for Indian solar vendors. Track enquiries, surveys, quotations, BOM, dispatch, liaison, WCR and PM Surya Ghar subsidies.',
  keywords: [
    'solar business management India',
    'solar CRM India',
    'CSPDCL solar management',
    'PM Surya Ghar subsidy tracker',
    'solar installation pipeline',
    'solar vendor software',
    'solar ERP India',
    'rooftop solar management',
    'solar panel CRM Chhattisgarh',
  ],
  openGraph: {
    title: 'Solar Arrow — Solar Business Management for Indian Vendors',
    description: 'End-to-end solar installation pipeline management. From leads to subsidies — all in one tool.',
    url: 'https://sa.mktgdime.com',
    siteName: 'Solar Arrow',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Solar Arrow Dashboard' }],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Arrow — Solar Business Management',
    description: 'Track every solar project from lead to subsidy claim.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://sa.mktgdime.com' },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Solar Arrow',
  alternateName: 'Solar Arrow – CSPDCL Solar Panel Management System',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  url: 'https://sa.mktgdime.com',
  inLanguage: 'en-IN',              
  softwareVersion: '2.0.0', 
  description: 'End-to-end solar installation management SaaS for Indian vendors. Manage leads, enquiries, surveys, quotations, payments, BOM, dispatch, installations, liaison, WCR, and PM Surya Ghar subsidy claims.',
  offers: [
    {
      '@type': 'Offer',
      name: 'One-Time Implementation',
      price: '21700',
      priceCurrency: 'INR',
      description: 'One-time setup cost. Includes onboarding, Google Sheets configuration, and full pipeline access.',
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Annual Maintenance Contract (AMC)',
      price: '4800',
      priceCurrency: 'INR',
      description: 'Annual maintenance, updates, and support.',
    },
  ],
  creator: {
    '@type': 'Organization',
    name: 'Marketing Dime',
    url: 'https://mktgdime.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Raipur',
      addressRegion: 'Chhattisgarh',
      addressCountry: 'IN',
    },
  },
  featureList: [
    'Lead and enquiry management',
    'Solar survey tracking',
    'Quotation generation with shareable links',
    'Payment tracking',
    'Bill of Materials (BOM) management',
    'Dispatch tracking',
    'Installation management',
    'Govt. liaison and net metering',
    'Work Completion Report (WCR)',
    'PM Surya Ghar subsidy tracking',
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Solar vendors, solar installation companies, CSPDCL empaneled vendors',
    geographicArea: {
      '@type': 'Country',
      name: 'India',
    },
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Solar Arrow?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solar Arrow is a solar business management SaaS platform built for Indian solar vendors. It manages the complete installation pipeline from lead capture to PM Surya Ghar subsidy claims.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Solar Arrow support PM Surya Ghar subsidy tracking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Solar Arrow has a built-in subsidy tracking module specifically for PM Surya Ghar rooftop solar subsidies, along with government liaison and net metering management.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Solar Arrow free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Solar Arrow is free to start with no credit card required. You can explore the full demo without signing up.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Solar Arrow work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Solar Arrow is a Progressive Web App (PWA) designed mobile-first. Field teams can use it on any smartphone without installing from an app store.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <LandingClient />
    </>
  );
}
