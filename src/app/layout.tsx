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
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </div>
      {/* ✅ ADD PWA INSTALLER */}
      <PWAInstaller />
    </DemoProvider>
  </Providers>
</body>

    </html>
  );
}
