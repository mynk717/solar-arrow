// src/app/pricing/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Solar Arrow',
  description: 'Solar Arrow pricing: ₹21,700 one-time setup with ₹4,800/yr AMC. No monthly fees, no per-user charges. Affordable solar CRM and project management for Indian solar vendors.',
  keywords: [
    'solar CRM pricing India',
    'solar EPC software cost',
    'solar vendor management system price',
    'affordable solar SaaS India',
    'CSPDCL software pricing',
  ],
  alternates: { canonical: 'https://sa.mktgdime.com/pricing' },
};

const included = [
  'Full pipeline access (13 stages: Lead → Subsidy)',
  'Unlimited enquiries and projects',
  'CSPDCL registration and liaison module',
  'Quotation builder with shareable links and QR codes',
  'PM Surya Ghar subsidy tracking',
  'Telegram bot notifications (SolarArrowBot)',
  'Role-based access for your entire team',
  'BOM, dispatch, installation, and WCR modules',
  'Google Sheets backend setup and configuration',
  'Progressive Web App (Android + iOS installable)',
  'Onboarding and team training',
  'WhatsApp and email support',
];

const faqs = [
  {
    q: 'Is there a monthly subscription fee?',
    a: 'No. Solar Arrow is a one-time purchase at ₹21,700. The only recurring cost is the optional ₹4,800/yr Annual Maintenance Contract (AMC) for updates and support.',
  },
  {
    q: 'How many users can use Solar Arrow?',
    a: 'There is no per-user pricing. Your entire team — sales, survey engineers, installation team, finance — can use Solar Arrow under one plan.',
  },
  {
    q: 'What does the AMC cover?',
    a: 'The Annual Maintenance Contract (₹4,800/yr) covers platform updates, new feature releases, bug fixes, and priority support via WhatsApp and email.',
  },
  {
    q: 'What is included in onboarding?',
    a: 'Onboarding includes Google Sheets backend configuration, initial data import, user account setup, role configuration, and a walkthrough session for your team.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes — you can request a demo with full access to explore the platform before purchasing. Contact us via WhatsApp or email to get demo credentials.',
  },
  {
    q: 'Do I need technical knowledge to use Solar Arrow?',
    a: 'No. Solar Arrow is designed for solar vendors, not developers. The interface is mobile-first and simple enough for field engineers and sales teams to use from day one.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 sm:px-8 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Simple, Honest Pricing
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-6">
            No monthly fees. No per-user charges. One-time ownership for your solar business.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

          {/* OTC */}
          <div className="border-2 border-blue-600 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              One-Time
            </div>
            <div className="text-4xl font-extrabold text-blue-600 mb-1">₹21,700</div>
            <div className="text-sm text-gray-500 mb-6">One-time implementation cost</div>
            <ul className="space-y-2.5 mb-8">
              {included.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/demo"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">
              Request Demo
            </Link>
          </div>

          {/* AMC */}
          <div className="border-2 border-orange-400 rounded-2xl p-8 relative flex flex-col">
            <div className="absolute -top-3 left-6 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              Annual (Optional)
            </div>
            <div className="text-4xl font-extrabold text-orange-500 mb-1">₹4,800<span className="text-xl font-semibold text-gray-400">/yr</span></div>
            <div className="text-sm text-gray-500 mb-6">Annual Maintenance Contract (AMC)</div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {[
                'All platform updates and new features',
                'Bug fixes and performance improvements',
                'Priority WhatsApp and email support',
                'Annual Google Sheets optimization',
                'Team re-onboarding if needed',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700 text-center">
              AMC is optional. The platform works without it — AMC just keeps you updated.
            </div>
          </div>
        </div>

        {/* Comparison callout */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mb-16">
          <p className="text-gray-600 text-sm sm:text-base">
            Compare: Generic CRMs like Salesforce or Zoho cost <span className="font-bold text-gray-900">₹1,500–₹5,000/user/month</span>.<br />
            Solar Arrow is <span className="font-bold text-blue-600">₹21,700 one-time</span> — purpose-built for Indian solar vendors with CSPDCL and PM Surya Ghar workflows included.
          </p>
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Pricing FAQs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-2">{f.q}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-14 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Get started with Solar Arrow today</h2>
        <p className="text-blue-100 text-sm mb-6">Request a demo and see the full platform before you pay anything.</p>
        <Link href="/demo"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all">
          Request Free Demo
        </Link>
      </section>

    </div>
  );
}
