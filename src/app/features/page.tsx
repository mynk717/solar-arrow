// src/app/features/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features — Solar Arrow',
  description: 'Explore Solar Arrow features: solar CRM, CSPDCL project management, quotation builder, survey tracking, BOM, dispatch, liaison, WCR, and PM Surya Ghar subsidy tracking. Built for Indian solar vendors.',
  keywords: [
    'solar CRM features India',
    'solar EPC software features',
    'CSPDCL project management tool',
    'solar quotation builder',
    'PM Surya Ghar subsidy tracker',
    'solar survey management',
    'solar installation tracking software',
  ],
  alternates: { canonical: 'https://sa.mktgdime.com/features' },
};

const modules = [
  {
    stage: '01',
    title: 'Lead Management',
    keyword: 'Solar CRM India',
    desc: 'Capture inbound leads from any source — walk-in, referral, digital, or CSPDCL scheme. Assign follow-up dates, track status, and get Telegram reminders so no lead slips through.',
    points: ['Source tracking (walk-in, referral, digital)', 'Follow-up date with Telegram notification', 'One-click qualify to formal enquiry'],
  },
  {
    stage: '02',
    title: 'Enquiry Management',
    keyword: 'Solar Enquiry Tracker',
    desc: 'Convert qualified leads into structured enquiries. Track customer details, system capacity, site location, and assigned sales executive in one place.',
    points: ['Customer profile and contact history', 'System capacity and site details', 'Status pipeline: New → Survey → Quotation → Active'],
  },
  {
    stage: '03',
    title: 'Survey Scheduling',
    keyword: 'Solar Site Survey Management',
    desc: 'Schedule on-site surveys, assign field engineers, and capture complete site data including roof type, shadow analysis, load details, and meter number.',
    points: ['Surveyor assignment and scheduling', 'Field data capture: roof, load, shadow, meter', 'Document upload (ID proof, electricity bill, site photos)'],
  },
  {
    stage: '04',
    title: 'Quotation Builder',
    keyword: 'Solar Quotation Software India',
    desc: 'Generate professional solar quotations in seconds. Share via a unique web link or QR code. Track whether the customer has viewed or approved the quote.',
    points: ['Auto-calculate capacity × per-kW rate', 'Shareable public URL + QR code per quotation', 'Status: Draft → Sent → Viewed → Approved → Rejected'],
  },
  {
    stage: '05',
    title: 'CSPDCL Registration',
    keyword: 'CSPDCL Compliance Tool',
    desc: 'Manage the complete CSPDCL rooftop solar application process. Track document submission, approval status, and net metering application in one module.',
    points: ['CSPDCL application and document tracking', 'Status: Submitted → Approved → Net Metering → Active', 'Liaison document linkage per enquiry'],
  },
  {
    stage: '06',
    title: 'Payment Tracking',
    keyword: 'Solar Payment Milestone Tracker',
    desc: 'Track payments across standard solar billing milestones — advance, on installation, and on commissioning. Know exactly which projects have pending payments.',
    points: ['Milestone billing: 70% advance, 20% installation, 10% commissioning', 'Payment status per enquiry', 'Overdue payment visibility on dashboard'],
  },
  {
    stage: '07',
    title: 'BOM & Dispatch',
    keyword: 'Solar Bill of Materials Management',
    desc: 'Plan your Bill of Materials per project and track material dispatch to site. Eliminate the spreadsheet juggling between procurement and field teams.',
    points: ['Auto BOM based on system capacity', 'Material dispatch tracking per project', 'Shortage alerts before installation date'],
  },
  {
    stage: '08',
    title: 'Installation Tracking',
    keyword: 'Solar Installation Management Software',
    desc: 'Track every installation milestone from material arrival to commissioning. Field engineers update status from mobile — no WhatsApp status updates needed.',
    points: ['Milestone: Dispatch → Installation → Wiring → Commissioning', 'Mobile-first status updates from field', 'Engineer assignment per project'],
  },
  {
    stage: '09',
    title: 'Liaison & Net Metering',
    keyword: 'Solar Net Metering Liaison India',
    desc: 'Manage the government liaison process for net metering application and approval. Track each step of the DISCOM approval workflow per project.',
    points: ['Net metering application tracking', 'DISCOM approval status management', 'Document checklist per liaison stage'],
  },
  {
    stage: '10',
    title: 'WCR Generation',
    keyword: 'Solar Work Completion Report',
    desc: 'Generate digital Work Completion Reports — mandatory for PM Surya Ghar subsidy applications. Eliminate manual WCR paperwork completely.',
    points: ['Digital WCR generation per project', 'Mandatory for subsidy claim submission', 'Stored and accessible per enquiry'],
  },
  {
    stage: '11',
    title: 'PM Surya Ghar Subsidy',
    keyword: 'PM Surya Ghar Subsidy Tracker',
    desc: 'Track PM Surya Ghar rooftop solar subsidy claims per project. Know which projects have subsidy pending, applied, or received — without maintaining a separate register.',
    points: ['Subsidy application status per project', 'PM Surya Ghar scheme compliance tracking', 'Claim amount and disbursement tracking'],
  },
  {
    stage: '12',
    title: 'Telegram Notifications',
    keyword: 'Solar Team Notification Bot',
    desc: 'SolarArrowBot sends real-time Telegram alerts to your team. Follow-up reminders go to the assigned salesperson. New enquiry alerts go to the whole group.',
    points: ['Per-user follow-up reminders', 'Group notifications for new enquiries', 'Instant alerts on payment and installation updates'],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-16 px-4 sm:px-8 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
            13-Stage Pipeline
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Every Feature a Solar Vendor Needs
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Solar Arrow covers the complete rooftop solar installation workflow — from first lead to PM Surya Ghar subsidy claim — in one platform built for Indian solar businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/demo" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-xl transition-all">
              Request Demo
            </Link>
            <Link href="/pricing" className="border-2 border-white/60 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-xl transition-all">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
          Complete Solar Business Management
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-12 max-w-2xl mx-auto">
          Every module maps to a real stage in the Indian rooftop solar installation process — CSPDCL, PM Surya Ghar, and beyond.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {modules.map((m) => (
            <div key={m.stage} className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 flex-shrink-0">
                  {m.stage}
                </div>
                <div>
                  <div className="text-xs text-orange-500 font-semibold mb-1">{m.keyword}</div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{m.desc}</p>
                  <ul className="space-y-1">
                    {m.points.map((p, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to digitize your solar business?</h2>
        <p className="text-gray-500 text-sm mb-6">One-time ₹21,700 setup · ₹4,800/yr maintenance · No monthly fee</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/demo" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded-xl transition-all">
            Request a Demo
          </Link>
          <Link href="/pricing" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-7 py-3 rounded-xl transition-all">
            See Pricing
          </Link>
        </div>
      </section>

    </div>
  );
}
