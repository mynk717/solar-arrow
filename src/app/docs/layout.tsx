// src/app/docs/layout.tsx
import DocsLayout from '@/components/DocsLayout';
import { headers } from 'next/headers';

export default function DocsSectionLayout({ children }: { children: React.ReactNode }) {
  // Get current path for active link state
  const headersList = headers();
  // Depending on your Next.js setup, x-pathname might not be there by default,
  // but if we are in Next.js 15+ we can get it via 'next/navigation' if we wrap,
  // or simply rely on the page components passing props. 
  // Let's use a standard prop approach if headers are not reliable:
  
  return (
    <DocsLayout currentPath="">
      {children}
    </DocsLayout>
  );
}
