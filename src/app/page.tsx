// 'use client';

// import { useEnquiries } from '@/lib/useEnquiries';
// import { FileText, ClipboardCheck, IndianRupee, CheckCircle, Activity, Loader2, RefreshCw } from 'lucide-react';
// import StatusBadge from '@/components/StatusBadge';
// import Link from 'next/link';

// export default function Dashboard() {
//   const { enquiries, loading, error, refetch } = useEnquiries();

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center">
//           <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-900 font-medium">Loading enquiries from Google Sheets...</p>
//           <p className="text-gray-700 text-sm mt-2">Please wait a moment</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
//           <div className="text-red-600 text-5xl mb-4">⚠️</div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
//           <p className="text-gray-800 mb-4">{error}</p>
//           <button 
//             onClick={refetch}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
//           >
//             <RefreshCw size={18} />
//             Retry Connection
//           </button>
//           <p className="text-gray-700 text-sm mt-4">
//             Check your Google Sheets connection in .env.local
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const stats = {
//     total: enquiries.length,
//     surveyPending: enquiries.filter(e => e.status === 'survey_pending').length,
//     paymentPending: enquiries.filter(e => 
//       e.status === 'payment_pending' || e.status === 'registration_pending'
//     ).length,
//     active: enquiries.filter(e => e.status === 'active').length,
//     inProgress: enquiries.filter(e => 
//       ['payment_received', 'dispatched', 'installation_pending', 'installation_completed'].includes(e.status)
//     ).length,
//   };

//   const recentEnquiries = enquiries.slice(0, 5);

//   return (
//     <div>
//       <div className="mb-8">
//         <div className="flex justify-between items-start">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
//             <p className="text-gray-900 mt-2">Welcome to your Solar Panel Management System</p>
//             <div className="flex items-center gap-2 mt-3">
//               <span className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
//                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
//                 Connected to Google Sheets
//               </span>
//               <button
//                 onClick={refetch}
//                 className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 inline-flex items-center gap-1.5"
//                 title="Refresh data"
//               >
//                 <RefreshCw size={14} />
//                 Refresh
//               </button>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-gray-700">Last Updated</p>
//             <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
//           </div>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
//         <StatCard
//           title="Total Enquiries"
//           value={stats.total}
//           icon={<FileText />}
//           color="bg-blue-500"
//         />
//         <StatCard
//           title="Survey Pending"
//           value={stats.surveyPending}
//           icon={<ClipboardCheck />}
//           color="bg-yellow-500"
//         />
//         <StatCard
//           title="Payment Pending"
//           value={stats.paymentPending}
//           icon={<IndianRupee />}
//           color="bg-orange-500"
//         />
//         <StatCard
//           title="In Progress"
//           value={stats.inProgress}
//           icon={<Activity />}
//           color="bg-purple-500"
//         />
//         <StatCard
//           title="Active Systems"
//           value={stats.active}
//           icon={<CheckCircle />}
//           color="bg-green-500"
//         />
//       </div>

//       {/* Recent Enquiries */}
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-bold text-gray-900">Recent Enquiries</h2>
//           <Link 
//             href="/enquiries"
//             className="text-blue-600 hover:text-blue-700 font-medium text-sm"
//           >
//             View All →
//           </Link>
//         </div>

//         {enquiries.length === 0 ? (
//           <div className="text-center py-12">
//             <div className="text-gray-400 text-6xl mb-4">📋</div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enquiries Yet</h3>
//             <p className="text-gray-700 mb-4">Start by adding your first enquiry</p>
//             <Link
//               href="/enquiries"
//               className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
//             >
//               Add New Enquiry
//             </Link>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Area</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Capacity</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentEnquiries.map((enquiry) => (
//                   <tr key={enquiry.id} className="border-b border-gray-100 hover:bg-gray-50">
//                     <td className="py-3 px-4 font-medium text-gray-900">{enquiry.id}</td>
//                     <td className="py-3 px-4">
//                       <div>
//                         <div className="font-medium text-gray-900">{enquiry.customerName}</div>
//                         <div className="text-sm text-gray-900">{enquiry.phone}</div>
//                       </div>
//                     </td>
//                     <td className="py-3 px-4 text-gray-900">{enquiry.area}</td>
//                     <td className="py-3 px-4 text-gray-900">{enquiry.capacity} kW</td>
//                     <td className="py-3 px-4">
//                       <StatusBadge status={enquiry.status} />
//                     </td>
//                     <td className="py-3 px-4 text-gray-900 text-sm">
//                       {enquiry.createdAt.toLocaleDateString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatCard({ title, value, icon, color }: any) {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-gray-900 text-sm font-medium">{title}</p>
//           <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
//         </div>
//         <div className={`${color} text-white p-3 rounded-lg`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';

import { useEnquiries } from '@/lib/useEnquiries';
import { FileText, ClipboardCheck, IndianRupee, CheckCircle, Activity, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default function Dashboard() {
  const { enquiries, loading, error, refetch } = useEnquiries();

  const stats = {
    total: enquiries.length,
    surveyPending: enquiries.filter(e => e.status === 'survey_pending').length,
    paymentPending: enquiries.filter(e => 
      e.status === 'payment_pending' || e.status === 'registration_pending'
    ).length,
    active: enquiries.filter(e => e.status === 'active').length,
    inProgress: enquiries.filter(e => 
      ['payment_received', 'dispatched', 'installation_pending', 'installation_completed'].includes(e.status)
    ).length,
  };

  const recentEnquiries = enquiries.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-900 mt-2">Welcome to your Solar Panel Management System</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Demo Mode - Using Dummy Data
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Enquiries"
          value={stats.total}
          icon={<FileText />}
          color="bg-blue-500"
        />
        <StatCard
          title="Survey Pending"
          value={stats.surveyPending}
          icon={<ClipboardCheck />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Payment Pending"
          value={stats.paymentPending}
          icon={<IndianRupee />}
          color="bg-orange-500"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Activity />}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Systems"
          value={stats.active}
          icon={<CheckCircle />}
          color="bg-green-500"
        />
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Enquiries</h2>
          <Link 
            href="/enquiries"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Area</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Capacity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{enquiry.id}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{enquiry.customerName}</div>
                      <div className="text-sm text-gray-900">{enquiry.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{enquiry.area}</td>
                  <td className="py-3 px-4 text-gray-900">{enquiry.capacity} kW</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={enquiry.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-900 text-sm">
                    {enquiry.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-900 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}