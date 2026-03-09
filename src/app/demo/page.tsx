// src/app/demo/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Request a Demo — Solar Arrow',
  description: 'Request a free demo of Solar Arrow — solar CRM and CSPDCL project management software for Indian vendors. Get demo credentials and see the full 13-stage pipeline in action.',
  keywords: [
    'solar CRM demo India',
    'solar EPC software demo',
    'CSPDCL management software demo',
    'solar vendor software trial India',
  ],
  alternates: { canonical: 'https://sa.mktgdime.com/demo' },
};

const steps = [
  { step: '01', title: 'Contact Us', desc: 'Send us a WhatsApp message or email with your business name and team size.' },
  { step: '02', title: 'We Set Up Your Demo', desc: 'We configure a demo account with sample data reflecting your typical solar project workflow.' },
  { step: '03', title: 'Explore the Full Platform', desc: 'Log in and explore all 13 pipeline stages — leads, surveys, quotations, BOM, liaison, subsidy, and more.' },
  { step: '04', title: 'Go Live', desc: 'Ready to go? We onboard your real team and configure your Google Sheets backend — usually within 24 hours.' },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 sm:px-8 text-center text-white">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            Free Demo
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            See Solar Arrow in Action
          </h1>
          <p className="text-blue-100 text-base sm:text-lg mb-4 max-w-xl mx-auto">
            Solar Arrow is a private platform — demo access is provided personally so we can walk you through the full 13-stage solar pipeline tailored to your business.
          </p>
          <p className="text-blue-200 text-sm">No credit card. No commitment. Just reach out and we'll set it up for you.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How the Demo Works</h2>
        <div className="flex flex-col gap-6">
          {steps.map((s) => (
            <div key={s.step} className="flex items-start gap-5 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="bg-blue-600 text-white text-sm font-extrabold rounded-xl px-3 py-2 flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact options */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 px-4 sm:px-8 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Request Your Demo</h2>
        <p className="text-gray-500 text-sm mb-10">
          Choose whichever is easiest — WhatsApp for fastest response, email for formal enquiries.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a
            href="https://wa.me/917225991909?text=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Solar%20Arrow%20for%20my%20solar%20business."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
          <a
            href="mailto:hello@mktgdime.com?subject=Solar%20Arrow%20Demo%20Request&body=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Solar%20Arrow%20for%20my%20solar%20business.%0A%0ABusiness%20name%3A%0ATeam%20size%3A%0ACity%3A"
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            Email Us
          </a>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">What to include in your message</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your business name and location</li>
            <li>• Team size (how many people will use Solar Arrow)</li>
            <li>• Whether you work with CSPDCL or other DISCOMs</li>
            <li>• Any specific module you want to see first</li>
          </ul>
        </div>
      </section>

      {/* Bottom links */}
      <section className="py-8 px-4 text-center border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-3">Want to know more before requesting?</p>
        <div className="flex gap-4 justify-center">
          <Link href="/features" className="text-blue-600 hover:underline text-sm font-medium">See All Features</Link>
          <Link href="/pricing" className="text-blue-600 hover:underline text-sm font-medium">View Pricing</Link>
          <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">Back to Home</Link>
        </div>
      </section>

    </div>
  );
}
