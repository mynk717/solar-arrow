// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Providers } from './providers';
import { DemoProvider } from '@/contexts/DemoContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

// ✅ Separate viewport export (Next.js 14+ best practice)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#2563eb',
};

// ✅ Full PWA metadata
export const metadata: Metadata = {
  title: 'Solar Arrow - Solar Panel Management System',
  description: 'Manage solar panel enquiries, surveys, and installations for CSPDCL',
  manifest: '/manifest.json',
  verification: {
    google: 'vrsBC-Lhh5mYq6Y962bknJ_IPObALDYs4dMKErfkeBg'
  },
  
  // PWA App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Solar Arrow',
    startupImage: [
      {
        url: '/ios/1024.png',
        media: '(device-width: 1024px) and (device-height: 1366px)',
      },
    ],
  },
  
  // Icons for different platforms
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
      { url: '/ios/114.png', sizes: '114x114', type: 'image/png' },
      { url: '/ios/76.png', sizes: '76x76', type: 'image/png' },
    ],
  },
  
  // Open Graph (for social sharing)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sa.mktgdime.com',
    title: 'Solar Arrow - CSPDCL Dashboard',
    description: 'Solar Panel Management System for Chhattisgarh',
    siteName: 'Solar Arrow',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Solar Arrow - CSPDCL Dashboard',
    description: 'Solar Panel Management System',
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
        <Providers>
          <DemoProvider>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </DemoProvider>
        </Providers>
      </body>
    </html>
  );
}
