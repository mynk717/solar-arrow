// src/app/api/liaison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient, fetchAllLiaisons } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

const CACHE_KEY = 'liaisons:all';
const CACHE_TTL = 300;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = (session.user as any).organizationId || 'default-org';
    const sheetId = (session.user as any).sheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    const cacheKey = `org:${orgId}:${CACHE_KEY}`;
    if (!forceRefresh) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const liaisons = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json({ liaisons, cached: true, count: liaisons.length });
      }
    }

    // ── 1. Read ENQUIRIES sheet (source of records — always has data) ──
const sheets = await getGoogleSheetsClient();

const headerResponse = await sheets.spreadsheets.values.get({
  spreadsheetId: sheetId,
  range: 'ENQUIRIES!A1:CZ1',
});
const headers = headerResponse.data.values?.[0] || [];

const enquiryResponse = await sheets.spreadsheets.values.get({
  spreadsheetId: sheetId,
  range: 'ENQUIRIES!A2:CZ1000',
});
const enquiryRows = enquiryResponse.data.values || [];

if (enquiryRows.length === 0) {
  return NextResponse.json({ liaisons: [], cached: false, count: 0 });
}

const col = (name: string) => headers.indexOf(name);

// Filter: only enquiries with installationCompletedDate
const installedRows = enquiryRows.filter((row) => {
  const d = row[col('installationCompletedDate')] || '';
  return d.trim() !== '' && !isNaN(new Date(d).getTime());
});

// ── 2. Read LIAISON sheet (optional — docs + inspection data) ──
const liaisonRows = await fetchAllLiaisons();

// Build LIAISON map: enquiryId → liaison object
const liaisonMap: Record<string, any> = {};
liaisonRows.forEach((l: any) => {
  if (l.enquiryId) liaisonMap[l.enquiryId] = l;
});

// ── 3. Join: ENQUIRIES (base) + LIAISON (docs/inspection overlay) ──
const liaisons = installedRows.map((row) => {
  const enquiryId = row[col('id')] || '';
  const liaison = liaisonMap[enquiryId] || {}; // empty if no LIAISON row yet

  return {
    enquiryId,
    customerName: row[col('customerName')] || '',
    phone:        row[col('phone')] || '',
    email:        row[col('email')] || '',
    address:      row[col('address')] || '',
    area:         row[col('area')] || '',
    capacity:     row[col('capacity')] || '',
    status:       row[col('status')] || '',
    systemCapacity: row[col('systemCapacity')] || '',
    panelMake:    row[col('panelMake')] || '',
    inverterMake: row[col('inverterMake')] || '',

    // Installation info from ENQUIRIES
    installationCompletedDate: row[col('installationCompletedDate')] || '',
    installationTeam:          row[col('installationTeam')] || '',
    installationNotes:         row[col('installationNotes')] || '',

    // Meter — LIAISON is more up to date if present
    meterNumber: liaison.meterNumber || row[col('meterNumber')] || '',

    // Registration
    registrationId:             row[col('registrationId')] || '',
    consumerRegistrationNumber: row[col('consumerRegistrationNumber')] || '',
    applicationNumber:          row[col('applicationNumber')] || '',

    // ── LIAISON overlay — empty strings if no LIAISON row yet ──
    liaisonStage:            liaison.liaisonStage || 'pending',
    inspectionScheduledDate: liaison.inspectionScheduledDate || '',
    inspectionDate:          liaison.inspectionDate || '',
    inspectionOfficer:       liaison.inspectionOfficer || '',
    inspectionApproved:      liaison.inspectionApproved || '',
    inspectionRejectedReason: liaison.inspectionRejectedReason || '',
    inspectionReportPath:    liaison.inspectionReportPath || '',
    inspectionApprovalDate:  liaison.inspectionApprovalDate || '',
    inspectionApprovedBy:    liaison.inspectionApprovedBy || '',
    inspectionApprovalNotes: liaison.inspectionApprovalNotes || '',

    // Doc checklist
    docCoveringLetter:  liaison.docCoveringLetter || '',
    docEStamp300:       liaison.docEStamp300 || '',
    docPpa:             liaison.docPpa || '',
    docEStamp50:        liaison.docEStamp50 || '',
    docVendorAgreement: liaison.docVendorAgreement || '',
    docSolarAppAck:     liaison.docSolarAppAck || '',
    docFeasibility:     liaison.docFeasibility || '',
    docEToken:          liaison.docEToken || '',
    docDcr:             liaison.docDcr || '',
    docWcr:             liaison.docWcr || '',
    docPlantPhotos:     liaison.docPlantPhotos || '',
    docKycDocuments:    liaison.docKycDocuments || '',
    docWitness1Aadhaar: liaison.docWitness1Aadhaar || '',
    docWitness2Aadhaar: liaison.docWitness2Aadhaar || '',

    // WCR
    wcrStatus:           liaison.wcrStatus || '',
    wcrSubmittedDate:    liaison.wcrSubmittedDate || '',
    wcrSubmittedBy:      liaison.wcrSubmittedBy || '',
    wcrApprovedDate:     liaison.wcrApprovedDate || '',
    wcrApprovedBy:       liaison.wcrApprovedBy || '',
    wcrNotes:            liaison.wcrNotes || '',
    wcrWorkQuality:      liaison.wcrWorkQuality || '',
    wcrSafetyCompliance: liaison.wcrSafetyCompliance || '',
    wcrPhotos:           liaison.wcrPhotos || '',
    wcrCustomerSignature: liaison.wcrCustomerSignature || '',

    createdAt: row[col('createdAt')] || '',
    updatedAt: liaison.updatedAt || row[col('updatedAt')] || '',
  };
});


    await redis.set(cacheKey, JSON.stringify(liaisons), { ex: CACHE_TTL });

    return NextResponse.json({ liaisons, cached: false, count: liaisons.length });
  } catch (error: any) {
    console.error('Error fetching liaisons:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch liaisons' },
      { status: 500 }
    );
  }
}
