// src/app/docs/page.tsx
import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Overview · Solar Arrow Docs',
  description: 'High-level overview of Solar Arrow.',
};

export default function DocsOverviewPage() {
  return (
    <DocsLayout currentPath="/docs">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Solar Arrow</h1>
      <p className="max-w-2xl text-[13px] text-slate-600 mt-2">
        Solar Arrow is a solar business management platform. It tracks every project from lead to subsidy.
      </p>
      {/* ... rest of the page content ... */}
    </DocsLayout>
  );
}
