// src/app/page.tsx (Dashboard)
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEnquiries: 0,
    pendingSurveys: 0,
    activeProjects: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch enquiries
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
          ).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Check if sheet is configured
  if (!session.user.sheetId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Setup Required</h2>
          <p className="text-gray-700 mb-6">
            Please connect a Google Sheet to start using the system.
          </p>
          {session.user.role === 'admin' ? (
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
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {session.user.name}! ({session.user.role})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Enquiries"
          value={stats.totalEnquiries}
          color="blue"
          link="/enquiries"
        />
        <StatCard
          title="Pending Surveys"
          value={stats.pendingSurveys}
          color="yellow"
          link="/survey"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          color="green"
          link="/installation"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          color="red"
          link="/payments"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction title="New Enquiry" link="/enquiries" />
          <QuickAction title="Schedule Survey" link="/survey" />
          <QuickAction title="Track Payment" link="/payments" />
          <QuickAction title="View Reports" link="/reports" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, link }: any) {
  const colors = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <Link href={link}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`${colors[color as keyof typeof colors]} text-white p-3 rounded-lg`}>
            <div className="w-8 h-8" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ title, link }: any) {
  return (
    <Link href={link}>
      <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center cursor-pointer transition-colors">
        <p className="text-gray-900 font-medium">{title}</p>
      </div>
    </Link>
  );
}
