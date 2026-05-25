import type { Metadata } from 'next';
import DocsLayout from '@/components/DocsLayout';

export const metadata: Metadata = {
  title: 'Users & Permissions · Solar Arrow Docs',
  description:
    'Manage your solar team, assign roles, and configure custom page permissions for each user.',
};



export default function Page() {
  return (
    <DocsLayout currentPath="/docs/settings/users-permissions">
<section className="mb-6 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Solar Arrow · Docs</div>
            <h1 className="text-2xl font-semibold tracking-tight">Users &amp; permissions</h1>
            <p className="max-w-2xl text-[13px] text-slate-600">
              Manage your team's access to Solar Arrow. You can add users, assign them to branches, and fine-tune exactly which pages they can see or edit.
            </p>
            <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Audience: Owners</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">Time to read: 5–7 minutes</span>
            </div>
          </section>
<section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Role-Based Access</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">defaults</span>
              </header>
              <p className="text-[13px] text-slate-600">Each <code className="font-mono text-xs">UserRole</code> comes with sensible defaults.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">Sales:</strong> Leads/Enquiries focus.</li>
                <li><strong className="text-slate-900">Surveyor:</strong> Site visit focus.</li>
                <li><strong className="text-slate-900">Accounts:</strong> Money/Subsidy focus.</li>
              </ul>
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold">Custom Overrides</h2>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">advanced</span>
              </header>
              <p className="text-[13px] text-slate-600">Admins can override defaults using the <code className="font-mono text-xs">customPermissions</code> field.</p>
              <ul className="mt-3 space-y-1.5 text-[12px] text-slate-700">
                <li><strong className="text-slate-900">canView:</strong> Array of paths the user can open.</li>
                <li><strong className="text-slate-900">canEdit:</strong> Array of paths where the user can save changes.</li>
                <li><strong className="text-slate-900">canExport:</strong> Toggle for CSV downloads.</li>
              </ul>
            </article>
          </section>
<section className="mt-4 article rounded-xl border border-slate-100 bg-white p-4 shadow-[0_10px_25_rgba(15,23,42,0.08)]">
            <h2 className="text-sm font-semibold mb-2">Adding a User</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-3 text-[12px]">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">1. Email</p>
                <p className="text-slate-600">Must match their Google account email.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">2. Role</p>
                <p className="text-slate-600">Sets the initial dashboard and menu.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900">3. Branch</p>
                <p className="text-slate-600">Restricts them to local branch data.</p>
              </div>
            </div>
          </section>
    </DocsLayout>
  );
}
