import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Google Sheets Integration · Solar Arrow Docs',
  description:
    'Learn how Solar Arrow synchronizes with Google Sheets for real-time data backup and external reporting.',
};

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/integrations/google-sheets">

    </DocsLayout>
  );
}