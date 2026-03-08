// src/app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Providers } from './providers';
import { DemoProvider } from '@/contexts/DemoContext';
import Footer from '@/components/Footer';
import PWAInstaller from '@/components/PWAInstaller';
import PWARegistration from '@/components/PWARegistration';
import BottomNav from '@/components/BottomNav';
import AppShell from '@/components/AppShell';



const inter = Inter({ subsets: ['latin'] });

// Viewport config
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
};

// Full PWA and Social Media metadata
export const metadata: Metadata = {
  metadataBase: new URL('https://sa.mktgdime.com'),
  
  title: {
    default: 'Solar Arrow - CSPDCL Solar Panel Management',
    template: '%s | Solar Arrow'
  },
  
  description: 'Complete solar panel installation management system for CSPDCL. Track enquiries, surveys, registrations, payments, installations, and subsidies in one platform.',
  
  keywords: [
    'solar panel management',
    'CSPDCL',
    'Chhattisgarh solar',
    'solar installation tracking',
    'solar ERP',
    'renewable energy management',
    'solar panel CRM'
  ],
  
  authors: [{ name: 'MKTGDIME', url: 'https://mktgdime.com' }],
  
  creator: 'MKTGDIME',
  
  manifest: '/manifest.json',
  
  verification: {
    google: 'vrsBC-Lhh5mYq6Y962bknJIPObALDYs4dMKErfkeBg',
  },
  
  // PWA App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Solar Arrow',
    startupImage: [
      {
        url: '/ios/180.png',
        media: '(device-width: 375px) and (device-height: 812px)',
      },
    ],
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/android/android-launchericon-48-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/android/android-launchericon-72-72.png', sizes: '72x72', type: 'image/png' },
      { url: '/android/android-launchericon-96-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android/android-launchericon-144-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/ios/180.png', sizes: '180x180', type: 'image/png' },
      { url: '/ios/167.png', sizes: '167x167', type: 'image/png' },
      { url: '/ios/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/ios/120.png', sizes: '120x120', type: 'image/png' },
    ],
  },
  
  // Open Graph for Facebook, LinkedIn, etc.
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sa.mktgdime.com',
    siteName: 'Solar Arrow',
    title: 'Solar Arrow - CSPDCL Solar Panel Management System',
    description: 'Complete solar panel installation management for CSPDCL. Track your solar projects from enquiry to grid synchronization with ease.',
    images: [
      {
        url: '/og-image.png', // Create this 1200x630px image
        width: 1200,
        height: 630,
        alt: 'Solar Arrow Dashboard - Solar Panel Management System',
        type: 'image/png',
      },
      {
        url: '/android/android-launchericon-512-512.png',
        width: 512,
        height: 512,
        alt: 'Solar Arrow Logo',
      },
    ],
  },
  
  // Twitter Card for Twitter/X sharing
  twitter: {
    card: 'summary_large_image',
    site: '@https://x.com/MarketingDime', // Replace with your Twitter handle if you have one
    creator: '@mktgdime',
    title: 'Solar Arrow - CSPDCL Solar Panel Management',
    description: 'Complete solar installation management system for CSPDCL. Track enquiries, installations, and subsidies in one place.',
    images: ['/og-image.png'], // Same as OG image
  },
  
  // Additional metadata for better SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Alternate for different languages (if needed)
  alternates: {
    canonical: 'https://sa.mktgdime.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Solar Arrow",
      "alternateName": "Solar Arrow – CSPDCL Solar Panel Management System",
      "url": "https://sa.mktgdime.com/",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Android (PWA), iOS (PWA)",
      "inLanguage": "en-IN",
      "description": "Solar Arrow is a multi-tenant SaaS platform for Indian solar vendors and EPC companies. It manages CSPDCL rooftop solar projects end-to-end: enquiry capture, survey scheduling, quotation building, installation tracking, CSPDCL compliance, and Telegram notifications.",
      "featureList": [
        "Solar CRM with lead and enquiry pipeline",
        "CSPDCL rooftop solar project management",
        "Survey scheduling and field data capture",
        "Quotation builder with QR code and public URL",
        "Installation workflow tracking and milestones",
        "CSPDCL liaison and compliance module",
        "Telegram bot notifications per user and group",
        "Role-based dynamic dashboard",
        "Multi-tenant architecture",
        "Progressive Web App (Android + iOS)"
      ],
      "offers": [
        {
          "@type": "Offer",
          "name": "One-Time Implementation (OTC)",
          "price": "21700.00",
          "priceCurrency": "INR",
          "description": "Full platform access, onboarding, Google Sheets setup. One-time ownership, no monthly fee.",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Annual Maintenance Contract (AMC)",
          "price": "4800.00",
          "priceCurrency": "INR",
          "description": "Annual updates, support, and maintenance."
        }
      ],
      "provider": {
        "@type": "Organization",
        "name": "Marketing Dime",
        "url": "https://mktgdime.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Raipur",
          "addressRegion": "Chhattisgarh",
          "addressCountry": "IN"
        }
      }
    })
  }}
/>
        {/* Additional PWA meta tags */}
        <link rel="apple-touch-icon" href="/ios/180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
      <PWARegistration />
  <Providers>
    <DemoProvider>
    <AppShell>{children}</AppShell> 

    </DemoProvider>
  </Providers>
</body>

    </html>
  );
}
