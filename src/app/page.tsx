// src/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import DemoBanner from '@/components/DemoBanner';
import { demoStats } from '@/lib/demoData';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(demoStats); // Start with demo data
  const [loading, setLoading] = useState(false);

  const isDemoMode = status === 'unauthenticated';

  useEffect(() => {
    // Only fetch real data if authenticated
    if (status === 'authenticated' && session?.user) {
      fetchRealStats();
    } else if (status === 'unauthenticated') {
      // Use demo data
      setStats(demoStats);
    }
  }, [status, session]);

  const fetchRealStats = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/enquiries');
      if (response.ok) {
        const enquiries = await response.json();
        
        setStats({
          totalEnquiries: enquiries.length,
          pendingSurveys: enquiries.filter((e: any) => 
            e.status === 'new' || e.status === 'survey_pending'
          ).length,
          activeProjects: enquiries.filter((e: any) => 
            e.status === 'active'
          ).length,
          pendingPayments: enquiries.filter((e: any) => 
            e.status === 'payment_pending'
          ).length,
          totalRevenue: enquiries.reduce((sum: number, e: any) => 
            sum + (e.estimatedCost || 0), 0
          ),
          completedInstallations: enquiries.filter((e: any) => 
            e.installationDate
          ).length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DemoBanner />
      
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard {isDemoMode && <span className="text-blue-600">(Demo)</span>}
          </h1>
          <p className="text-gray-600 mt-2">
            {isDemoMode 
              ? 'Explore the features with sample solar project data'
              : `Welcome back, ${session?.user?.name}!`
            }
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        )}

        {/* Setup Warning for Authenticated Users without Sheet */}
        {!isDemoMode && !loading && !session?.user?.sheetId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Setup Required</h2>
            <p className="text-gray-700 mb-4">
              Please connect a Google Sheet to start managing your solar projects.
            </p>
            {session?.user?.role === 'admin' ? (
              <Link 
                href="/setup"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
              >
                Go to Setup
              </Link>
            ) : (
              <p className="text-gray-600">
                Please contact your administrator to complete the setup.
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Enquiries"
            value={stats.totalEnquiries}
            color="blue"
            link="/enquiries"
            isDemoMode={isDemoMode}
          />
          <StatCard
            title="Pending Surveys"
            value={stats.pendingSurveys}
            color="yellow"
            link="/survey"
            isDemoMode={isDemoMode}
          />
          <StatCard
            title="Active Projects"
            value={stats.activeProjects}
            color="green"
            link="/installation"
            isDemoMode={isDemoMode}
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            color="red"
            link="/payments"
            isDemoMode={isDemoMode}
          />
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 mb-8 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Project Value</h3>
          <p className="text-4xl font-bold">
            ₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-sm mt-2 opacity-90">
            {stats.completedInstallations} installations completed
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction title="New Enquiry" link="/enquiries" isDemoMode={isDemoMode} />
            <QuickAction title="Schedule Survey" link="/survey" isDemoMode={isDemoMode} />
            <QuickAction title="Track Payment" link="/payments" isDemoMode={isDemoMode} />
            <QuickAction title="View Reports" link="/reports" isDemoMode={isDemoMode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, link, isDemoMode }: any) {
  const colors = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <Link href={link}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer relative">
        {isDemoMode && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
            Demo
          </div>
        )}
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <div className={`${colors[color as keyof typeof colors]} h-2 rounded-full mt-4`} />
      </div>
    </Link>
  );
}

function QuickAction({ title, link, isDemoMode }: any) {
  return (
    <Link href={link}>
      <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center cursor-pointer transition-colors">
        <p className="text-gray-900 font-medium">{title}</p>
        {isDemoMode && (
          <p className="text-xs text-gray-500 mt-1">View Demo</p>
        )}
      </div>
    </Link>
  );
}
