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

    // ── 1. Read LIAISON sheet (source of truth for docs + inspection) ──
    const liaisonRows = await fetchAllLiaisons();

    if (liaisonRows.length === 0) {
      return NextResponse.json({ liaisons: [], cached: false, count: 0 });
    }

    // ── 2. Read ENQUIRIES sheet for rich display fields ──
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

    // Index helpers
    const col = (name: string) => headers.indexOf(name);

    // Build a map: enquiryId → ENQUIRIES row for O(1) join
    const enquiryMap: Record<string, any[]> = {};
    enquiryRows.forEach((row) => {
      const id = row[col('id')];
      if (id) enquiryMap[id] = row;
    });

    // ── 3. Join: LIAISON rows + ENQUIRIES display fields ──
    const liaisons = liaisonRows.map((liaison: any) => {
      const eq = enquiryMap[liaison.enquiryId] || [];

      return {
        // Core IDs
        enquiryId: liaison.enquiryId,

        // Display fields from ENQUIRIES (fallback to LIAISON if present)
        customerName: liaison.customerName || eq[col('customerName')] || '',
        phone:        eq[col('phone')] || '',
        email:        eq[col('email')] || '',
        address:      eq[col('address')] || '',
        area:         liaison.area || eq[col('area')] || '',
        capacity:     liaison.capacity || eq[col('capacity')] || '',
        status:       eq[col('status')] || '',
        systemCapacity: eq[col('systemCapacity')] || '',
        panelMake:    eq[col('panelMake')] || '',
        inverterMake: eq[col('inverterMake')] || '',

        // Installation info from ENQUIRIES
        installationCompletedDate: eq[col('installationCompletedDate')] || '',
        installationTeam:          eq[col('installationTeam')] || '',
        installationNotes:         eq[col('installationNotes')] || '',

        // Meter from LIAISON (most up to date) or ENQUIRIES fallback
        meterNumber: liaison.meterNumber || eq[col('meterNumber')] || '',

        // Registration
        registrationId:               eq[col('registrationId')] || '',
        consumerRegistrationNumber:   eq[col('consumerRegistrationNumber')] || '',
        applicationNumber:            eq[col('applicationNumber')] || '',

        // ── All from LIAISON sheet (source of truth) ──
        liaisonStage:              liaison.liaisonStage || 'pending',
        inspectionScheduledDate:   liaison.inspectionScheduledDate || '',
        inspectionDate:            liaison.inspectionDate || '',
        inspectionOfficer:         liaison.inspectionOfficer || '',
        inspectionApproved:        liaison.inspectionApproved || '',
        inspectionRejectedReason:  liaison.inspectionRejectedReason || '',
        inspectionReportPath:      liaison.inspectionReportPath || '',
        inspectionApprovalDate:    liaison.inspectionApprovalDate || '',
        inspectionApprovedBy:      liaison.inspectionApprovedBy || '',
        inspectionApprovalNotes:   liaison.inspectionApprovalNotes || '',

        // Doc checklist — all from LIAISON sheet
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

        // WCR stage fields
        wcrStatus:            liaison.wcrStatus || '',
        wcrSubmittedDate:     liaison.wcrSubmittedDate || '',
        wcrSubmittedBy:       liaison.wcrSubmittedBy || '',
        wcrApprovedDate:      liaison.wcrApprovedDate || '',
        wcrApprovedBy:        liaison.wcrApprovedBy || '',
        wcrNotes:             liaison.wcrNotes || '',
        wcrWorkQuality:       liaison.wcrWorkQuality || '',
        wcrSafetyCompliance:  liaison.wcrSafetyCompliance || '',
        wcrPhotos:            liaison.wcrPhotos || '',
        wcrCustomerSignature: liaison.wcrCustomerSignature || '',

        // Timestamps
        createdAt: liaison.createdAt || eq[col('createdAt')] || '',
        updatedAt: liaison.updatedAt || eq[col('updatedAt')] || '',
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
