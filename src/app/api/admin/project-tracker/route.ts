// src/app/api/admin/project-tracker/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Get sheetId from Redis directly (same pattern as other routes)
    const orgId = (session.user as any).organizationId;
    const org = await redis.get(`org:${orgId}:info`) as any;
    if (!org?.sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }
    const sheetId = org.sheetId;

    // ✅ getGoogleSheetsClient is the exported alias for getSheets
    const sheets = await getGoogleSheetsClient();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:DR',
    });

    const rows = res.data.values || [];
    console.log(`Project Tracker: ${rows.length} rows fetched`);

    const projects = rows
      .map(rowToProject)
      .filter(Boolean)
      .map((e: any) => ({
        id:                         e.id,
        customerName:               e.customerName,
        phone:                      e.phone,
        area:                       e.area,
        capacity:                   e.capacity,
        status:                     e.status,
        priority:                   e.priority,
        isBlocked:                  e.isBlocked,
        blockedReason:              e.blockedReason,
        assignedTo:                 e.allottedUser,
        applicationNumber:          e.applicationNumber,
        consumerRegistrationNumber: e.consumerRegistrationNumber,
        currentStage:               getCurrentStage(e),
        daysInStage:                calculateDaysInStage(e),
        isOverdue:                  calculateDaysInStage(e) > 14,
        lastFollowupDate:           e.lastFollowupDate,
        nextActionDate:             e.nextActionDate,
        surveyDate:                 e.surveyDate,
        surveyApproved:             e.surveyApproved,
        paymentDate:                e.paymentDate,
        paymentStatus:              e.paymentStatus,
        quotationDate:              e.quotationDate,
        quotationAmount:            e.quotationAmount,
        installationCompletedDate:  e.installationCompletedDate,
        inspectionDate:             e.inspectionDate,
        inspectionApproved:         e.inspectionApproved,
        subsidyDisbursedDate:       e.subsidyDisbursedDate,
        subsidyAmount:              e.subsidyAmount,
        subsidyStatus:              e.subsidyStatus,
        loanRequired:               e.loanRequired,
        loanStatus:                 e.loanStatus,
      }));

    console.log(`Project Tracker: ${projects.length} projects mapped`);
    return NextResponse.json({ projects });

  } catch (error: any) {
    console.error('Project Tracker error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// ─── Row → Project mapper ────────────────────────────────────────────────────
function rowToProject(row: any[]): any | null {
  if (!row || row.length < 7 || !row[0]) return null;
  return {
    id:                         row[0]  || '',
    customerName:               row[1]  || '',
    phone:                      row[2]  || '',
    area:                       row[5]  || '',
    capacity:                   parseFloat(row[6]) || 0,
    status:                     row[7]  || 'new',
    allottedUser:               row[96] || '',   // col DQ
    priority:                   row[97] || 'medium',
    isBlocked:                  row[98] === 'TRUE',
    blockedReason:              row[99] || '',
    lastFollowupDate:           row[102] || '',
    nextActionDate:             row[103] || '',
    // Survey (cols 18–25)
    surveyDate:                 row[18] || '',
    surveyApproved:             row[21] === 'TRUE',
    // Registration (cols 34–42)
    applicationNumber:          row[35] || '',
    consumerRegistrationNumber: row[34] || '',
    // Payment (cols 56–65)
    paymentDate:                row[58] || '',
    paymentStatus:              row[61] || '',
    // Quotation (cols 66–72)
    quotationDate:              row[67] || '',
    quotationAmount:            row[68] ? parseFloat(row[68]) : undefined,
    // Installation (cols 83–96)
    installationCompletedDate:  row[85] || '',
    // Inspection (cols 97–103)
    inspectionDate:             row[98] || '',
    inspectionApproved:         row[102] === 'TRUE',
    // Subsidy (cols 104–113)
    subsidyAmount:              row[104] ? parseFloat(row[104]) : undefined,
    subsidyStatus:              row[105] || '',
    subsidyDisbursedDate:       row[108] || '',
    // Loan (cols 28–41)
    loanRequired:               row[28] === 'TRUE',
    loanStatus:                 row[40] || '',
  };
}

// ─── Stage Logic ──────────────────────────────────────────────────────────────
function getCurrentStage(e: any): string {
  if (e.subsidyDisbursedDate)      return 'Subsidy';
  if (e.inspectionDate)            return 'Inspection';
  if (e.installationCompletedDate) return 'Installation';
  if (e.quotationDate)             return 'Quotation';
  if (e.paymentDate)               return 'Payment';
  if (e.applicationNumber || e.consumerRegistrationNumber) return 'Registration';
  if (e.surveyDate)                return 'Survey';
  return 'Survey';
}

function calculateDaysInStage(e: any): number {
  const now = new Date();
  const pick = (d: string) => (d ? new Date(d) : null);
  const stageStart =
    pick(e.inspectionDate) ??
    pick(e.installationCompletedDate) ??
    pick(e.quotationDate) ??
    pick(e.paymentDate) ??
    pick(e.surveyDate) ??
    pick(e.lastFollowupDate) ??
    now;
  return Math.ceil(Math.abs(now.getTime() - stageStart.getTime()) / 86400000);
}
