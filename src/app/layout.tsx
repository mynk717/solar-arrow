// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Providers } from './providers';
import { DemoProvider } from '@/contexts/DemoContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solar Arrow - Solar Panel Management System',
  description: 'Manage solar panel enquiries, surveys, and installations',
  verification: {
    google: 'vrsBC-Lhh5mYq6Y962bknJ_IPObALDYs4dMKErfkeBg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
