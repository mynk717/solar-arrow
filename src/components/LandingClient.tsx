// src/components/LandingClient.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import {
  PhoneCall, FileText, ClipboardCheck, FileCheck,
  Scale, IndianRupee, Wrench, Package, Truck,
  CheckSquare, Zap, ArrowRight, TrendingUp, Shield, Smartphone,
} from 'lucide-react';

// ── animation helpers ──────────────────────────────────────────
const fadeUp: Variants = {
    hidden: { opacity: 0, y: 32 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  };
  
  const stagger: Variants = {
    hidden: {},
    show:   { transition: { staggerChildren: 0.07 } },
  };
  
  const cardVariant: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
  };

// ── data ───────────────────────────────────────────────────────
const pipeline = [
  { name: 'Leads',        icon: PhoneCall,     color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'Capture prospects' },
  { name: 'Enquiry',      icon: FileText,       color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Qualify interest' },
  { name: 'Survey',       icon: ClipboardCheck, color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'Site assessment' },
  { name: 'Quotation',    icon: FileCheck,      color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Send proposal' },
  { name: 'Registration', icon: Scale,          color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'Govt. paperwork' },
  { name: 'Payment',      icon: IndianRupee,    color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Collect payments' },
  { name: 'BOM',          icon: Package,        color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'Plan materials' },
  { name: 'Dispatch',     icon: Truck,          color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Ship equipment' },
  { name: 'Installation', icon: Wrench,         color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'On-site work' },
  { name: 'Liaison',      icon: Scale,          color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Net metering' },
  { name: 'WCR',          icon: CheckSquare,    color: 'bg-blue-50  text-blue-700  border-blue-200',    desc: 'Completion report' },
  { name: 'Subsidy',      icon: IndianRupee,    color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Claim subsidy' },
  { name: 'Active ✓',    icon: Zap,            color: 'bg-blue-600 text-white      border-blue-600',   desc: 'Live system' },
];

const features = [
  { icon: TrendingUp,  title: 'Complete Pipeline Visibility',  desc: 'Track every customer from first call to subsidy claim — no Excel, no WhatsApp chaos.' },
  { icon: FileCheck,   title: 'Instant Quotation Links',       desc: 'Generate and share solar quotes in seconds. Customers get a clean web link.' },
  { icon: IndianRupee, title: 'Subsidy & Liaison Built-in',    desc: 'PM Surya Ghar subsidy tracking and net metering liaison — in the same tool.' },
  { icon: Package,     title: 'BOM & Dispatch Tracking',       desc: 'Plan materials and track dispatches without juggling separate spreadsheets.' },
  { icon: Shield,      title: 'WCR Digital Documentation',     desc: 'Generate Work Completion Reports digitally — mandatory for subsidy applications.' },
  { icon: Smartphone,  title: 'Mobile-First, Works Offline',   desc: 'PWA — your field team can use it on any phone. No app store needed.' },
];

const problems = [
  'Losing leads because follow-ups live only on WhatsApp',
  'Manual Excel sheets that nobody updates in time',
  'No visibility into which projects are pending subsidy',
  'Sending quotations as PDFs instead of clean shareable links',
  "Field team doesn't know which site to visit next",
];

const faqs = [
  { q: 'What is Solar Arrow?', a: 'Solar Arrow is a solar business management platform for Indian vendors — managing the full pipeline from leads to PM Surya Ghar subsidy claims.' },
  { q: 'Is it free to start?', a: 'Yes — no credit card required. You can explore the full demo without signing up.' },
  { q: 'Does it support PM Surya Ghar subsidy?', a: 'Yes. Built-in subsidy tracking and government liaison module for rooftop solar vendors.' },
  { q: 'Does it work on mobile?', a: 'Yes — Solar Arrow is a mobile-first PWA. Your field team can use it on any smartphone.' },
];

// ── component ──────────────────────────────────────────────────
export default function LandingClient() {
  const { status } = useSession();
  const router = useRouter();
  const [sessionTimedOut, setSessionTimedOut] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
      return;
    }
    if (status === 'loading') {
      const t = setTimeout(() => setSessionTimedOut(true), 3000);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  const seoBlock = (
    <section aria-label="Solar Arrow Overview" className="sr-only">
      <h1>Solar Arrow — Solar CRM &amp; CSPDCL Project Management Software</h1>
      <p>
        Solar Arrow is a multi-tenant SaaS platform for Indian solar vendors and EPC companies.
        Manage CSPDCL rooftop solar projects — leads, surveys, quotations, installations,
        and compliance — in one dashboard. One-time cost ₹21,700. AMC ₹4,800/yr.
        Built for solar businesses in Raipur, Chhattisgarh and across India.
      </p>
      <ul>
        <li>Solar CRM India — track leads and follow-ups</li>
        <li>CSPDCL compliance and liaison document management</li>
        <li>Solar quotation builder with QR code sharing</li>
        <li>Survey scheduling and field data capture</li>
        <li>Installation tracking from dispatch to commissioning</li>
        <li>PM Surya Ghar subsidy tracking built-in</li>
        <li>Telegram bot notifications for your team</li>
        <li>Role-based access: Admin, Sales, Engineer, Finance</li>
        <li>Progressive Web App — works on Android and iOS</li>
      </ul>
    </section>
  );
  // Authenticated — show redirect screen
  if (status === 'authenticated') {
    return (
<>
{seoBlock}
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center animate-pulse">
            <Zap className="text-white" size={24} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Redirecting to dashboard...</p>
        </div>
      </div>
      </>
    );
  }

  // Still loading AND not timed out — show brief spinner
  if (status === 'loading' && !sessionTimedOut) {
    return (
      <>
        {seoBlock}
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center animate-pulse">
            <Zap className="text-white" size={24} />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
      </>
    );
  }

  // unauthenticated OR timed out → render landing page normally
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
            {seoBlock}
{/* SEO-visible static section — always rendered, no session dependency */}
<section aria-label="Solar Arrow Overview" className="sr-only">
      <h1>Solar Arrow — Solar CRM & CSPDCL Project Management Software</h1>
      <p>
        Solar Arrow is a multi-tenant SaaS platform for Indian solar vendors and EPC companies.
        Manage CSPDCL rooftop solar projects — leads, surveys, quotations, installations,
        and compliance — in one dashboard. One-time cost ₹21,700. AMC ₹4,800/yr.
        Built for solar businesses in Raipur, Chhattisgarh and across India.
      </p>
      <ul>
        <li>Solar CRM India — track leads and follow-ups</li>
        <li>CSPDCL compliance and liaison document management</li>
        <li>Solar quotation builder with QR code sharing</li>
        <li>Survey scheduling and field data capture</li>
        <li>Installation tracking from dispatch to commissioning</li>
        <li>Telegram bot notifications for your team</li>
        <li>Role-based access: Admin, Sales, Engineer, Finance</li>
        <li>Progressive Web App — works on Android and iOS</li>
      </ul>
    </section>
      {/* ── NAVBAR ── */}
<nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
  <div className="flex items-center gap-2">
    <div className="bg-blue-600 rounded-lg p-1.5 w-9 h-9 flex items-center justify-center flex-shrink-0">
      <Image src="/SA_logo.png" alt="Solar Arrow" width={24} height={24} className="object-contain" />
    </div>
    <span className="text-lg font-extrabold text-gray-900">
      Solar <span className="text-orange-500">Arrow</span>
    </span>
  </div>
  <div className="flex items-center gap-1 sm:gap-3">
    {/* Mobile-only hamburger */}
    <button className="sm:hidden p-1">
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    
    {/* Desktop nav + mobile CTA */}
    <div className="hidden sm:flex items-center gap-2">
      <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5">
        Features
      </Link>
      <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5">
        Pricing
      </Link>
      <a href="https://wa.me/917225991909?text=Hi%2C%20I%27m%20interested%20in%20Solar%20Arrow" 
        target="_blank" rel="noopener noreferrer"
        className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors px-3 py-1.5">
        Contact
      </a>
      <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5">
        Login
      </Link>
    </div>
    
    {/* CTA button — always visible */}
    <Link href="/login" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
      Get Started
    </Link>
  </div>
</nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-14 sm:pt-36 sm:pb-20 px-4 sm:px-8 max-w-5xl mx-auto text-center">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide"
          >
            <Zap size={11} /> Built for Indian Solar Vendors
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-5 px-2"
          >
            Manage Solar Business{' '}
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              From Lead to Subsidy
            </span>
          </motion.h1>

          <motion.p variants={fadeUp}
            className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-7 leading-relaxed px-2"
          >
            Solar Arrow gives solar vendors a single platform to track the complete installation pipeline — enquiries, surveys, quotations, payments, BOM, dispatch, liaison, WCR, and subsidy claims.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link href="/login"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-7 py-3.5 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
            >
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard"
              className="border-2 border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all"
            >
              View Live Demo
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-gray-400 mt-4">
            No credit card required · Mobile-first PWA · Free onboarding
          </motion.p>
        </motion.div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Sound familiar?</h2>
            <p className="text-center text-gray-500 text-sm sm:text-base mb-8">Most solar vendors lose deals to poor follow-up and zero pipeline visibility.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {problems.map((p, i) => (
              <motion.div key={i} variants={cardVariant}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4"
              >
                <span className="text-orange-400 font-bold mt-0.5 flex-shrink-0 text-lg">✗</span>
                <span className="text-sm text-gray-700">{p}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">One Pipeline. Every Stage.</h2>
          <p className="text-center text-gray-500 text-sm sm:text-base mb-8 max-w-xl mx-auto">13 stages of the solar installation workflow — visible in a single dashboard.</p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3"
        >
          {pipeline.map((s) => (
            <motion.div key={s.name} variants={cardVariant}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
              className={`${s.color} border-2 rounded-xl p-3 sm:p-4 flex flex-col items-center text-center gap-1.5 cursor-default`}
            >
              <s.icon size={20} />
              <span className="font-bold text-xs sm:text-sm">{s.name}</span>
              <span className="text-xs opacity-70 leading-tight">{s.desc}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-blue-600 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">Everything a Solar Vendor Needs</h2>
            <p className="text-center text-blue-100 text-sm sm:text-base mb-8">Replace Excel, WhatsApp threads, and paper registers with one tool.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={cardVariant}
                whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                className="bg-white rounded-xl p-5"
              >
                <div className="bg-orange-50 text-orange-500 p-2.5 rounded-lg inline-block mb-3">
                  <f.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm sm:text-base">{f.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
        >
          Built for the Indian Solar Market
        </motion.h2>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { stat: '13 Stages',     label: 'Complete pipeline from lead to active system',   c: 'border-orange-200 bg-orange-50', t: 'text-orange-500' },
            { stat: 'PM Surya Ghar', label: 'Subsidy tracking built-in for rooftop solar',    c: 'border-blue-200  bg-blue-50',    t: 'text-blue-600' },
            { stat: '₹21,700',       label: 'One-time setup · ₹4,800/yr maintenance',         c: 'border-orange-200 bg-orange-50', t: 'text-orange-500' },
          ].map((item) => (
            <motion.div key={item.stat} variants={cardVariant}
              className={`border-2 ${item.c} rounded-2xl p-6`}
            >
              <div className={`text-2xl sm:text-3xl font-extrabold mb-2 ${item.t}`}>{item.stat}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FAQ (AEO) ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 sm:py-20 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Everything you need to know before getting started.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="flex flex-col gap-3"
          >
            {faqs.map((f, i) => (
              <motion.div key={i} variants={cardVariant}
                className="bg-white border border-gray-200 rounded-xl p-5"
              >
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1.5">{f.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-14 sm:py-20 px-4 sm:px-8 text-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Ready to run a tighter solar operation?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-blue-100 mb-2 text-sm sm:text-base max-w-xl mx-auto">
  One-time setup at ₹21,700 · Annual maintenance ₹4,800/yr
</motion.p>
<motion.p variants={fadeUp} className="text-blue-200 mb-8 text-xs max-w-xl mx-auto">
  Includes onboarding, Google Sheets setup, and full pipeline access for your team.
</motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://wa.me/917225991909?text=Hi%2C%20I%27m%20interested%20in%20Solar%20Arrow"
  target="_blank" rel="noopener noreferrer"
  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-7 py-3.5 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
>
  Contact Us <ArrowRight size={18} />
</a>
            <Link href="/dashboard"
              className="border-2 border-white/60 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-xl text-base transition-all"
            >
              Explore Demo
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-8 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-blue-600 rounded-lg p-1.5 w-8 h-8 flex items-center justify-center">
            <Image src="/SA_logo.png" alt="Solar Arrow" width={20} height={20} className="object-contain" />
          </div>
          <span className="text-white font-bold text-base">
            Solar <span className="text-orange-500">Arrow</span>
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-5">Solar operations management for Indian vendors</p>
        <div className="flex justify-center gap-6 text-xs mb-8">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/login" className="hover:text-white transition-colors">Login</Link>
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-gray-500 text-xs">Powered by</span>
          <a href="https://mktgdime.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="bg-black text-white p-2 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <div className="bg-amber-400 text-black text-sm font-bold py-2 px-3 leading-none">Marketing Dime</div>
          </a>
        </div>
        <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Marketing Dime. All rights reserved.</p>
      </footer>

    </div>
  );
}
