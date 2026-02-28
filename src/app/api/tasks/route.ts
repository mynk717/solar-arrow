// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fetchEnquiries, fetchLeads } from '@/lib/googleSheets';

export const revalidate = 0;

type Capability =
  | 'LEADS' | 'ENQUIRIES' | 'SURVEY' | 'QUOTATION' | 'PAYMENTS'
  | 'REGISTRATION' | 'BOM' | 'INSTALLATION' | 'LIAISON' | 'WCR' | 'SUBSIDY';

const pathToCapability: Record<string, Capability> = {
  '/leads': 'LEADS', '/enquiries': 'ENQUIRIES', '/survey': 'SURVEY',
  '/quotation': 'QUOTATION',
  '/payment': 'PAYMENTS', '/payments': 'PAYMENTS', // both
  '/registration': 'REGISTRATION', '/bom': 'BOM',
  '/installation': 'INSTALLATION', '/liaison': 'LIAISON',
  '/wcr': 'WCR', '/subsidy': 'SUBSIDY',
};

const statusToCapability: Record<string, Capability> = {
  new: 'ENQUIRIES',
  'survey-pending': 'SURVEY', 'survey-scheduled': 'SURVEY',
  'survey-completed': 'SURVEY', 'survey-rejected': 'SURVEY',
  'quotation-sent': 'QUOTATION', 'quotation-approved': 'QUOTATION', 'quotation-rejected': 'QUOTATION',
  'payment-pending': 'PAYMENTS', 'payment-partial': 'PAYMENTS',
  'payment-complete': 'PAYMENTS', 'payment-received': 'PAYMENTS',
  'registration-pending': 'REGISTRATION', 'registration-submitted': 'REGISTRATION',
  'registration-approved': 'REGISTRATION', 'registration-rejected': 'REGISTRATION',
  'bom-pending': 'BOM', 'bom-created': 'BOM',
  'dispatch-pending': 'BOM', 'dispatched': 'BOM', 'delivered': 'BOM',
  'installation-pending': 'INSTALLATION', 'installation-scheduled': 'INSTALLATION',
  'installation-in-progress': 'INSTALLATION', 'installation-completed': 'INSTALLATION',
  'installation-rework-required': 'INSTALLATION',
  'inspection-pending': 'LIAISON', 'inspection-scheduled': 'LIAISON',
  'inspection-completed': 'LIAISON', 'inspection-approved': 'LIAISON',
  'inspection-rejected': 'LIAISON', 'meter-installation-pending': 'LIAISON',
  'meter-installed': 'LIAISON', 'grid-sync-pending': 'LIAISON', 'grid-synced': 'LIAISON',
  'wcr-pending': 'WCR', 'wcr-submitted': 'WCR',
  'wcr-approved': 'WCR', 'wcr-rejected': 'WCR',
  'subsidy-pending': 'SUBSIDY', 'subsidy-applied': 'SUBSIDY',
  'subsidy-approved': 'SUBSIDY', 'subsidy-disbursed': 'SUBSIDY',
};

function getUserCapabilities(session: any): Set<Capability> | 'ALL' {
  const isAdminOrOwner =
    session?.user?.accountType === 'admin' ||
    session?.user?.accountType === 'owner' ||
    session?.user?.role === 'admin' ||
    session?.user?.role === 'owner';
  if (isAdminOrOwner) return 'ALL';

  const canView: string[] = session?.user?.permissions?.canView ?? [];
  const caps = new Set<Capability>();
  for (const p of canView) {
    const cap = pathToCapability[p];
    if (cap) caps.add(cap);
  }
  return caps;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const caps = getUserCapabilities(session);

    // mode = assigned_only | permitted_only | assigned_or_permitted (default)
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') ?? 'assigned_or_permitted';

    const [enquiries, leads] = await Promise.all([
      fetchEnquiries(),
      fetchLeads(),
    ]);

    const today = new Date().toISOString().split('T')[0];

    // ── Enquiry-based tasks ──────────────────────────────────────────────────
    const enquiryTasks = enquiries
      .filter((e: any) => {
        if (!e?.status) return false;
        if (e.status === 'active' || e.status === 'cancelled') return false;

        const cap = statusToCapability[e.status] ?? 'ENQUIRIES';
        const hasPermission = caps === 'ALL' || caps.has(cap);
        const isAssigned =
          (e.allottedUser || '').toLowerCase() === email.toLowerCase() ||
          (e.surveyedBy || '').toLowerCase() === email.toLowerCase();

        if (mode === 'assigned_only') return isAssigned;
        if (mode === 'permitted_only') return hasPermission;
        return isAssigned || hasPermission; // assigned_or_permitted
      })
      .map((e: any) => ({
        taskId: `task-enq-${e.id}`,
        type: 'enquiry' as const,
        entityId: e.id,
        entityType: 'enquiry',
        customerName: e.customerName,
        phone: e.phone,
        area: e.area,
        capacity: e.capacity,
        status: e.status,
        stage: statusToCapability[e.status] ?? 'ENQUIRIES',
        priority: e.priority || 'medium',
        isBlocked: e.isBlocked === true || e.isBlocked === 'TRUE',
        blockedReason: e.blockedReason || '',
        allottedUser: e.allottedUser || '',
        surveyedBy: e.surveyedBy || '',
        nextActionDate: e.nextActionDate || '',
        isOverdue: !!(e.nextActionDate && e.nextActionDate < today),
        isAssignedToMe:
          (e.allottedUser || '').toLowerCase() === email.toLowerCase() ||
          (e.surveyedBy || '').toLowerCase() === email.toLowerCase(),
        href: `/enquiries/${e.id}`,
      }))
      .sort((a: any, b: any) => {
        // Priority: blocked > overdue > urgent > high > others
        if (a.isBlocked !== b.isBlocked) return a.isBlocked ? -1 : 1;
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        const pOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        const pa = pOrder[a.priority] ?? 2;
        const pb = pOrder[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        if (!a.nextActionDate) return 1;
        if (!b.nextActionDate) return -1;
        return a.nextActionDate.localeCompare(b.nextActionDate);
      })
      .slice(0, 25);

    // ── Lead-based tasks ─────────────────────────────────────────────────────
    const leadTasks = (caps === 'ALL' || caps.has('LEADS'))
      ? (leads as any[])
          .filter((l: any) => {
            const statuses = ['new', 'assigned', 'in-progress', 'callback-scheduled', 'qualified'];
            if (!statuses.includes(l.status)) return false;
            if (caps === 'ALL') return true;
            // For non-admin: only show leads assigned to this user
            return (l.assignedTo || '').toLowerCase() === email.toLowerCase();
          })
          .map((l: any) => ({
            taskId: `task-lead-${l.id}`,
            type: 'lead' as const,
            entityId: l.id,
            entityType: 'lead',
            customerName: l.customerName,
            phone: l.phone,
            area: l.area,
            capacity: l.capacity,
            status: l.status,
            stage: 'LEADS' as Capability,
            priority: l.priority || 'medium',
            isBlocked: false,
            blockedReason: '',
            allottedUser: l.assignedTo || '',
            nextActionDate: l.nextFollowUpDate
              ? (typeof l.nextFollowUpDate === 'string'
                  ? l.nextFollowUpDate.split('T')[0]
                  : (l.nextFollowUpDate as Date).toISOString().split('T')[0])
              : '',
            isOverdue: !!(
              l.nextFollowUpDate &&
              (typeof l.nextFollowUpDate === 'string'
                ? l.nextFollowUpDate.split('T')[0]
                : (l.nextFollowUpDate as Date).toISOString().split('T')[0]) < today
            ),
            isAssignedToMe:
              (l.assignedTo || '').toLowerCase() === email.toLowerCase(),
            href: `/leads?id=${l.id}`,
          }))
          .slice(0, 10)
      : [];

    // ── Summary counts per stage ─────────────────────────────────────────────
    const stageCounts: Record<string, number> = {};
    for (const t of enquiryTasks) {
      stageCounts[t.stage] = (stageCounts[t.stage] || 0) + 1;
    }
    if (leadTasks.length) stageCounts['LEADS'] = leadTasks.length;

    return NextResponse.json({
      enquiryTasks,
      leadTasks,
      allTasks: [...enquiryTasks, ...leadTasks],
      meta: {
        totalTasks: enquiryTasks.length + leadTasks.length,
        blockedCount: enquiryTasks.filter((t: any) => t.isBlocked).length,
        overdueCount: [...enquiryTasks, ...leadTasks].filter((t: any) => t.isOverdue).length,
        stageCounts,
        userCapabilities: caps === 'ALL' ? 'ALL' : Array.from(caps),
      },
    });
  } catch (error: any) {
    console.error('[/api/tasks] Error:', error);
    return NextResponse.json(
      { enquiryTasks: [], leadTasks: [], allTasks: [], meta: { totalTasks: 0 } },
      { status: 500 }
    );
  }
}
