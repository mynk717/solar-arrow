// src/app/docs/faq/page.tsx
import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'FAQ · Solar Arrow Docs',
  description:
    'Frequently asked questions about Solar Arrow — implementation, support, and technical requirements.',
};

const FAQS = [
  { q: "Is my data secure?", a: "Yes. We use Google OAuth for secure login and provide real-time backups to your own Google Sheets." },
  { q: "Does the app work offline?", a: "Core assets are cached for fast loading on field sites, but a data connection is needed to save changes." },
  { q: "Can I add custom fields?", a: "Yes. We can map custom data points to your Google Sheets columns as part of our Enterprise onboarding." },
  { q: "How many branches can I manage?", a: "Standard plans support single branches, while Enterprise plans allow unlimited operational units." },
  { q: "What DISCOMs are supported?", a: "The Liaison and Subsidy modules are designed for Indian utilities like CSPDCL, but can be adapted for others." }
];

export default function Page() {
  return (
    <DocsLayout currentPath="/docs/faq">
      <section className="mb-6 flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
        <h1 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="max-w-2xl text-[13px] text-slate-600">
          Quick answers to the most common questions about using Solar Arrow for your business.
        </p>
      </section>

      <section className="grid gap-6">
        {FAQS.map((faq, index) => (
          <article key={index} className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2 text-slate-900">{faq.q}</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">{faq.a}</p>
          </article>
        ))}
      </section>
    </DocsLayout>
  );
}
