// src/app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import { fetchEnquiries, fetchLeads } from '@/lib/googleSheets';

export const revalidate = 0;

// ── Canonical capability map (covers /payment AND /payments) ──────────────────
type Capability =
  | 'LEADS' | 'ENQUIRIES' | 'SURVEY' | 'QUOTATION' | 'PAYMENTS'
  | 'REGISTRATION' | 'BOM' | 'INSTALLATION' | 'LIAISON' | 'WCR' | 'SUBSIDY';

const pathToCapability: Record<string, Capability> = {
  '/leads': 'LEADS',
  '/enquiries': 'ENQUIRIES',
  '/survey': 'SURVEY',
  '/quotation': 'QUOTATION',
  '/payment': 'PAYMENTS',   // both variants
  '/payments': 'PAYMENTS',  // both variants
  '/registration': 'REGISTRATION',
  '/bom': 'BOM',
  '/installation': 'INSTALLATION',
  '/liaison': 'LIAISON',
  '/wcr': 'WCR',
  '/subsidy': 'SUBSIDY',
};

// Maps enquiry status → capability (for filtering which activities a user sees)
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
  'wcr-pending': 'WCR', 'wcr-submitted': 'WCR', 'wcr-approved': 'WCR', 'wcr-rejected': 'WCR',
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

// ── Parse the TWO different row formats in ACTIVITY_LOG ────────────────────────
function parseActivityRow(row: string[]): any | null {
  if (!row || row.length < 4) return null;

  // ── Format A: Structured enquiry log (logId starts with LOG-)
  // Columns: logId, enquiryId, userId, action, fieldName, oldValue, newValue, timestamp, ipAddress, userAgent
  if (typeof row[0] === 'string' && row[0].startsWith('LOG-')) {
    return {
      logId: row[0],
      entityType: 'enquiry',
      enquiryId: row[1] || '',
      entityId: row[1] || '',
      userId: row[2] || '',
      action: row[3] || '',
      fieldName: row[4] || '',
      oldValue: row[5] || '',
      newValue: row[6] || '',
      timestamp: row[7] || '',
      ipAddress: row[8] || '',
    };
  }

  // ── Format B: Lead/entity activity log (written by logActivity() in googleSheets.ts)
  // Columns: timestamp, entityType, entityId, action, performedBy, details, metadata, [empty], [empty], [empty]
  if (typeof row[0] === 'string' && row[0].includes('T') && row[0].includes('Z')) {
    let metadata: any = {};
    try { metadata = row[6] ? JSON.parse(row[6]) : {}; } catch { /* skip */ }
    return {
      logId: `${row[0]}-${row[2]}`, // synthetic ID
      entityType: row[1] || 'lead',
      enquiryId: row[1] === 'enquiry' ? row[2] : '',
      entityId: row[2] || '',
      userId: row[4] || '',
      action: row[3] || '',
      fieldName: row[5] || '',  // 'details' used as fieldName context
      oldValue: '',
      newValue: metadata?.outcome || '',
      timestamp: row[0] || '',
      ipAddress: '',
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.sheetId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = session.user.sheetId;
    const email = session.user.email;
    const orgId = (session.user as any).organizationId || 'default-org';
    const caps = getUserCapabilities(session);

    // ── Cache key is per-user (not per-org) because we filter by permission ──
    const cacheKey = `org:${orgId}:activities:${email}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(
        typeof cached === 'string' ? JSON.parse(cached) : cached
      );
    }

    // ── Fetch raw activity rows (10 cols: A:J) ──────────────────────────────
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ACTIVITY_LOG!A2:J2000',  // ← fixed: was A2:H1000, sheet has 10 cols
    });

    const rows = response.data.values || [];
    const allActivities = rows
      .map(parseActivityRow)
      .filter((a): a is NonNullable<typeof a> => a !== null && !!a.timestamp);

    // ── Permission filtering ─────────────────────────────────────────────────
    let filtered = allActivities;

    if (caps !== 'ALL') {
      // Build a set of enquiry IDs the user can see based on:
      // a) assigned to them (allottedUser / surveyedBy)
      // b) enquiry is in a stage they have capability for
      const [enquiries, leads] = await Promise.all([
        fetchEnquiries(),
        caps.has('LEADS') ? fetchLeads() : Promise.resolve([]),
      ]);

      const permittedEnqIds = new Set<string>(
        enquiries
          .filter((e: any) => {
            const cap = statusToCapability[e.status] ?? 'ENQUIRIES';
            const hasCapability = caps.has(cap);
            const isAssigned =
              (e.allottedUser || '').toLowerCase() === email.toLowerCase() ||
              (e.surveyedBy || '').toLowerCase() === email.toLowerCase();
            return hasCapability || isAssigned;
          })
          .map((e: any) => e.id)
      );

      const permittedLeadIds = new Set<string>(
        caps.has('LEADS')
          ? (leads as any[]).map((l: any) => l.id)
          : []
      );

      filtered = allActivities.filter((a) => {
        if (a.entityType === 'enquiry') return permittedEnqIds.has(a.entityId);
        if (a.entityType === 'lead') return permittedLeadIds.has(a.entityId);
        return false;
      });
    }

    // ── Sort newest first, cap at 100 ────────────────────────────────────────
    const result = filtered
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 100);

    // Cache 2 min per user
    await redis.setex(cacheKey, 120, JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[/api/activities] Error:', error);
    return NextResponse.json([]);
  }
}
