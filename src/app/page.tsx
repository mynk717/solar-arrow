// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  FileText,
  ClipboardCheck,
  DollarSign,
  Wrench,
  Zap,
  TrendingUp,
  ArrowRight,
  Loader2,
  FileCheck,
  Package,
  Truck,
  Scale,
  CheckSquare,
  IndianRupee,
  Kanban,
  PhoneCall, // NEW: For Leads icon
} from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

// Demo stats
const demoStats = {
  leads: 12, // NEW: Leads count
  enquiries: 8,
  surveys: 5,
  quotations: 4,
  registrations: 3,
  payments: 3,
  bom: 3,
  dispatch: 2,
  installations: 2,
  liaison: 2,
  wcr: 1,
  subsidy: 1,
  active: 1,
  totalRevenue: 1200000,
  pendingRevenue: 800000,
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDemoMode } = useDemoMode();
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (status === 'unauthenticated') {
        setStats(demoStats);
        setLoading(false);
        return;
      }

      if (status === 'authenticated') {
        try {
          console.log('🔍 [Dashboard] Fetching data from API...');

          // Fetch both leads and enquiries
          const [leadsResponse, enquiriesResponse] = await Promise.all([
            fetch('/api/leads'),
            fetch('/api/enquiries')
          ]);

          console.log('📡 [Dashboard] Leads response:', leadsResponse.status);
          console.log('📡 [Dashboard] Enquiries response:', enquiriesResponse.status);

          let leads = [];
          let enquiries = [];

          // Get leads (don't fail if leads API doesn't work yet)
          if (leadsResponse.ok) {
            leads = await leadsResponse.json();
            console.log('📊 [Dashboard] Total leads:', leads.length);
          } else {
            console.warn('⚠️ [Dashboard] Leads API not available yet');
          }

          // Get enquiries
          if (enquiriesResponse.ok) {
            enquiries = await enquiriesResponse.json();
            console.log('📊 [Dashboard] Total enquiries:', enquiries.length);

            if (enquiries.length === 0 && leads.length === 0) {
              console.warn('⚠️ [Dashboard] No data - using demo stats');
              setStats(demoStats);
              setLoading(false);
              return;
            }

            // Calculate real stats
            const realStats = {
              leads: leads.length, // NEW: Count from LEADS tab
              enquiries: enquiries.filter((e: any) => 
                e.status === 'new' || e.status === 'prospect' || e.status?.includes('pending')
              ).length,
              surveys: enquiries.filter((e: any) => e.status?.includes('survey')).length,
              quotations: enquiries.filter((e: any) => e.status?.includes('quotation')).length,
              registrations: enquiries.filter((e: any) => e.status?.includes('registration')).length,
              payments: enquiries.filter((e: any) => e.status?.includes('payment')).length,
              bom: enquiries.filter((e: any) => e.status?.includes('bom')).length,
              dispatch: enquiries.filter((e: any) => e.status?.includes('dispatch')).length,
              installations: enquiries.filter((e: any) => e.status?.includes('installation')).length,
              liaison: enquiries.filter((e: any) => 
                e.status?.includes('liaison') || e.status?.includes('inspection')
              ).length,
              wcr: enquiries.filter((e: any) => e.status?.includes('wcr')).length,
              subsidy: enquiries.filter((e: any) => e.status?.includes('subsidy')).length,
              active: enquiries.filter((e: any) => e.status === 'active').length,
              totalRevenue: enquiries.reduce((sum: number, e: any) => 
                sum + (parseFloat(e.estimatedCost) || 0), 0
              ),
              pendingRevenue: enquiries.filter((e: any) => e.status !== 'active').reduce((sum: number, e: any) => 
                sum + (parseFloat(e.estimatedCost) || 0), 0
              ),
            };

            console.log('📈 [Dashboard] Calculated stats:', realStats);
            setStats(realStats);
          } else {
            const errorText = await enquiriesResponse.text();
            console.error('❌ [Dashboard] API error:', enquiriesResponse.status, errorText);
            console.log('🔄 [Dashboard] Falling back to demo data');
            setStats(demoStats);
          }
        } catch (error) {
          console.error('💥 [Dashboard] Exception:', error);
          setStats(demoStats);
        } finally {
          setLoading(false);
        }
      }
    };    
    fetchStats();
  }, [status]);

  if (status === 'loading' || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome{session?.user?.name ? ` back, ${session.user.name}` : ' to Solar Arrow'}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {isDemoMode 
              ? 'Explore the complete solar installation workflow with demo data' 
              : "Here's what's happening with your solar installations today"
            }
          </p>
        </div>

        {/* Key Metrics - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* NEW: Leads Metric Card */}
          <MetricCard
            title="New Leads"
            value={stats.leads}
            icon={PhoneCall}
            color="blue"
            href="/leads"
          />
          <MetricCard
            title="Active Enquiries"
            value={stats.enquiries}
            icon={FileText}
            color="indigo"
            href="/enquiries"
          />
          <MetricCard
            title="Active Systems"
            value={stats.active}
            icon={Zap}
            color="green"
            href="/liaison"
          />
          <MetricCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Workflow Pipeline */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Installation Pipeline</h2>

          {/* First Row - Main Pipeline (with Leads) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4">
            {/* NEW: Leads stage */}
            <PipelineStage name="Leads" count={stats.leads} icon={PhoneCall} color="blue" href="/leads" />
            <PipelineStage name="Enquiries" count={stats.enquiries} icon={FileText} color="indigo" href="/enquiries" />
            <PipelineStage name="Survey" count={stats.surveys} icon={ClipboardCheck} color="purple" href="/survey" />
            <PipelineStage name="Quotation" count={stats.quotations} icon={FileCheck} color="pink" href="/quotation" />
            <PipelineStage name="Registration" count={stats.registrations} icon={Scale} color="yellow" href="/registration" />
            <PipelineStage name="Payment" count={stats.payments} icon={DollarSign} color="orange" href="/payments" />
            <PipelineStage name="Installation" count={stats.installations} icon={Wrench} color="teal" href="/installation" />
          </div>

          {/* Second Row - Post-Installation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-3 sm:mt-4">
            <PipelineStage name="BOM" count={stats.bom} icon={Package} color="cyan" href="/bom" />
            <PipelineStage name="Dispatch" count={stats.dispatch} icon={Truck} color="violet" href="/dispatch" />
            <PipelineStage name="Liaison" count={stats.liaison} icon={Scale} color="fuchsia" href="/liaison" />
            <PipelineStage name="WCR" count={stats.wcr} icon={CheckSquare} color="rose" href="/wcr" />
            <PipelineStage name="Subsidy" count={stats.subsidy} icon={IndianRupee} color="pink" href="/subsidy" />
            <PipelineStage name="Active" count={stats.active} icon={Zap} color="green" href="/liaison" />
          </div>
        </div>

        {/* Process Flowchart - Collapsible on Mobile */}
        <details className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md mb-6 sm:mb-8 group" open>
          <summary className="p-4 sm:p-6 cursor-pointer list-none">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Complete Solar Installation Workflow</h2>
              <ArrowRight className="transform group-open:rotate-90 transition-transform text-blue-600" size={20} />
            </div>
          </summary>
        </details>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* NEW: Add Lead quick action */}
          <QuickActionCard
            title="Add New Lead"
            description="Capture new prospect"
            icon={PhoneCall}
            href="/leads"
            color="blue"
          />
          <QuickActionCard
            title="Create Enquiry"
            description="Convert lead to enquiry"
            icon={FileText}
            href="/enquiries"
            color="indigo"
          />
          <QuickActionCard
            title="View Kanban"
            description="Track all stages visually"
            icon={Kanban}
            href="/kanban"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 sm:w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full sm:w-2/3"></div>
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="h-12 w-12 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Pipeline Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
type MetricColor = 'blue' | 'indigo' | 'green' | 'emerald';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: MetricColor;
  href?: string;
}

function MetricCard({ title, value, icon: Icon, color, href }: MetricCardProps) {
  const colorClasses: Record<MetricColor, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
  };

  return (
    <Link href={href || '#'}>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg active:scale-98 transition-all cursor-pointer touch-manipulation">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`bg-gradient-to-br ${colorClasses[color]} text-white p-2 sm:p-3 rounded-lg`}>
            <Icon size={20} className="sm:w-6 sm:h-6" />
          </div>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
      </div>
    </Link>
  );
}

// Pipeline Stage Component
type PipelineColor = 'gray' | 'blue' | 'purple' | 'indigo' | 'pink' | 'yellow' | 'orange' | 'teal' | 'cyan' | 'violet' | 'fuchsia' | 'rose' | 'green';

interface PipelineStageProps {
  name: string;
  count: number;
  icon: any;
  color: PipelineColor;
  href: string;
}

function PipelineStage({ name, count, icon: Icon, color, href }: PipelineStageProps) {
  const colorClasses: Record<PipelineColor, string> = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    teal: 'bg-teal-100 text-teal-700 border-teal-300',
    cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    violet: 'bg-violet-100 text-violet-700 border-violet-300',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
    rose: 'bg-rose-100 text-rose-700 border-rose-300',
    green: 'bg-green-100 text-green-700 border-green-300',
  };

  return (
    <Link href={href}>
      <div className={`${colorClasses[color]} border-2 rounded-lg p-3 sm:p-4 hover:shadow-md active:scale-98 transition-all cursor-pointer touch-manipulation`}>
        <div className="flex items-center justify-between mb-2">
          <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-xl sm:text-2xl font-bold">{count}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium truncate">{name}</p>
      </div>
    </Link>
  );
}

// Flow Step Component
interface FlowStepProps {
  number: string;
  title: string;
  description: string;
  highlight?: boolean;
}

function FlowStep({ number, title, description, highlight }: FlowStepProps) {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg ${
      highlight ? 'bg-green-100 border-2 border-green-500' : 'bg-white'
    }`}>
      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
        highlight ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
      }`}>
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 truncate">{description}</p>
      </div>
    </div>
  );
}

// Flow Arrow Component
function FlowArrow() {
  return (
    <div className="flex justify-center">
      <ArrowRight size={20} className="text-blue-600 sm:w-6 sm:h-6" />
    </div>
  );
}

// Quick Action Card Component
type QuickActionColor = 'blue' | 'indigo' | 'green';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: QuickActionColor;
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionCardProps) {
  const colorClasses: Record<QuickActionColor, string> = {
    blue: 'from-blue-500 to-blue-600',
    indigo: 'from-indigo-500 to-indigo-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 hover:shadow-lg active:scale-98 transition-all cursor-pointer touch-manipulation">
        <div className={`bg-gradient-to-br ${colorClasses[color]} text-white p-2.5 sm:p-3 rounded-lg inline-block mb-3 sm:mb-4`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}