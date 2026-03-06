// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import {
  EnquiryRow, LiaisonRow, ReportFilters,
  monthlyBusinessReview, pipelineFunnel, teamPerformance,
  liaisonAging, areaAnalysis, inspectionHealth, documentCompliance,
} from '@/lib/reportUtils';

const RAW_CACHE_TTL = 300; // 5 minutes

async function getRawData(sheetId: string, orgId: string, forceRefresh: boolean) {
  const cacheKey = `org:${orgId}:reports:raw`;

  if (!forceRefresh) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return parsed as { enquiries: EnquiryRow[]; liaisons: LiaisonRow[] };
    }
  }

  const sheets = await getGoogleSheetsClient();

  // Read ENQUIRIES headers + data + LIAISON data in parallel
  const [eqHeaders, eqData, lnData] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'ENQUIRIES!A1:CZ1' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'ENQUIRIES!A2:CZ1000' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'LIAISON!A2:AP1000' }),
  ]);

  const headers = eqHeaders.data.values?.[0] || [];
  const col = (name: string) => headers.indexOf(name);

  const enquiries: EnquiryRow[] = (eqData.data.values || [])
    .map((row) => ({
      id:                        row[col('id')] || '',
      customerName:              row[col('customerName')] || '',
      phone:                     row[col('phone')] || '',
      email:                     row[col('email')] || '',
      address:                   row[col('address')] || '',
      area:                      row[col('area')] || '',
      capacity:                  row[col('capacity')] || '0',
      status:                    row[col('status')] || '',
      assignedTo:                row[col('assignedTo')] || '',
      panelMake:                 row[col('panelMake')] || '',
      inverterMake:              row[col('inverterMake')] || '',
      installationTeam:          row[col('installationTeam')] || '',
      installationSupervisor:    row[col('installationSupervisor')] || '',
      installationCompletedDate: row[col('installationCompletedDate')] || '',
      earthingDone:              row[col('earthingDone')] || '',
      meterNumber:               row[col('meterNumber')] || '',
      createdAt:                 row[col('createdAt')] || '',
      updatedAt:                 row[col('updatedAt')] || '',
    }))
    .filter(r => r.id);

  // LIAISON sheet is positional — matches LIAISON_COLUMNS order exactly
  const LIAISON_COLS = [
    'enquiryId', 'customerName', 'capacity', 'area', 'meterNumber', 'liaisonStage',
    'createdAt', 'updatedAt', 'inspectionScheduledDate', 'inspectionOfficer',
    'inspectionDate', 'inspectionApproved', 'inspectionRejectedReason', 'inspectionReportPath',
    'inspectionApprovalDate', 'inspectionApprovedBy', 'inspectionApprovalNotes',
    'docCoveringLetter', 'docEStamp300', 'docPpa', 'docEStamp50', 'docVendorAgreement',
    'docSolarAppAck', 'docFeasibility', 'docEToken', 'docDcr', 'docWcr', 'docPlantPhotos',
    'docKycDocuments', 'docWitness1Aadhaar', 'docWitness2Aadhaar',
    'wcrStatus', 'wcrSubmittedDate', 'wcrSubmittedBy', 'wcrApprovedDate', 'wcrApprovedBy',
    'wcrRejectedReason', 'wcrNotes', 'wcrWorkQuality', 'wcrSafetyCompliance',
    'wcrPhotos', 'wcrCustomerSignature',
  ];

  const liaisons: LiaisonRow[] = (lnData.data.values || [])
    .map((row) => {
      const obj: any = {};
      LIAISON_COLS.forEach((k, i) => { obj[k] = row[i] || ''; });
      return obj as LiaisonRow;
    })
    .filter(r => r.enquiryId);

  const result = { enquiries, liaisons };
  await redis.set(cacheKey, JSON.stringify(result), { ex: RAW_CACHE_TTL });
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Reports require admin or owner role' },
        { status: 403 }
      );
    }

    const sheetId = (session.user as any).sheetId;
    const orgId   = (session.user as any).organizationId || 'default-org';

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const type         = searchParams.get('type') || 'pipeline';
    const forceRefresh = searchParams.get('refresh') === 'true';

    const filters: ReportFilters = {
      from:      searchParams.get('from')      || undefined,
      to:        searchParams.get('to')        || undefined,
      dateField: (searchParams.get('dateField') || 'createdAt') as 'createdAt' | 'installationCompletedDate',
      area:      searchParams.get('area')      || undefined,
      status:    searchParams.get('status')    || undefined,
      team:      searchParams.get('team')      || undefined,
      stuckDays: searchParams.get('stuckDays')
        ? parseInt(searchParams.get('stuckDays')!)
        : undefined,
    };

    const { enquiries, liaisons } = await getRawData(sheetId, orgId, forceRefresh);

    let data: any;
    switch (type) {
      case 'monthly':    data = monthlyBusinessReview(enquiries, filters); break;
      case 'pipeline':   data = pipelineFunnel(enquiries, filters);        break;
      case 'team':       data = teamPerformance(enquiries, filters);       break;
      case 'aging':      data = liaisonAging(enquiries, liaisons, filters); break;
      case 'area':       data = areaAnalysis(enquiries, liaisons, filters); break;
      case 'inspection': data = inspectionHealth(enquiries, liaisons, filters); break;
      case 'compliance': data = documentCompliance(enquiries, liaisons, filters); break;
      default:
        return NextResponse.json(
          { error: `Unknown report type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ type, filters, ...data });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
