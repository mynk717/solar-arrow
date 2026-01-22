// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { Providers } from './providers';
import { DemoProvider } from '@/contexts/DemoContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solar Arrow - Solar Panel Management System',
  description: 'Manage solar panel enquiries, surveys, and installations',
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
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </DemoProvider>
        </Providers>
      </body>
    </html>
  );
}
