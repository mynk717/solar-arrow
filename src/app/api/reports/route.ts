// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';
import {
  EnquiryRow, LiaisonRow, ReportFilters, RegistrationRow, PaymentRow,
  monthlyBusinessReview, pipelineFunnel, teamPerformance,
  liaisonAging, areaAnalysis, inspectionHealth, documentCompliance,
  registrationStatusReport, paymentTrackerReport, incompletePaymentsReport, salesSummaryReport,
} from '@/lib/reportUtils';

const RAW_CACHE_TTL = 300; // 5 minutes

async function getRawData(sheetId: string, orgId: string, forceRefresh: boolean) {
  const cacheKey = `org:${orgId}:reports:raw`;

  if (!forceRefresh) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return parsed as { enquiries: EnquiryRow[]; liaisons: LiaisonRow[]; registrations: RegistrationRow[]; payments: PaymentRow[] };
    }
  }

  const sheets = await getGoogleSheetsClient();

  // Read ENQUIRIES headers + data + LIAISON data in parallel
  const [eqHeaders, eqData, lnData, regData, payData] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'ENQUIRIES!A1:CZ1' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'ENQUIRIES!A2:CZ1000' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'LIAISON!A2:AP1000' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'REGISTRATION!A2:R5000' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'PAYMENTS!A2:O5000' }),
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

    const registrations: RegistrationRow[] = (regData.data.values || [])
    .map((row) => ({
      id:                       row[0] || '',
      enquiryId:                row[1] || '',
      registrationId:           row[2] || '',
      applicationNumber:        row[3] || '',
      consumerNumber:           row[4] || '',
      discomCircle:             row[5] || '',
      discomDivision:           row[6] || '',
      discomSubDivision:        row[7] || '',
      registrationStatus:       row[8] || '',
      submittedDate:            row[9] || '',
      approvedDate:             row[10] || '',
      rejectedDate:             row[11] || '',
      feasibilityApprovalNumber: row[12] || '',
      notes:                    row[13] || '',
      rejectionReason:          row[14] || '',
      submittedBy:              row[15] || '',
      createdAt:                row[16] || '',
      updatedAt:                row[17] || '',
    }))
    .filter(r => r.id);

  const payments: PaymentRow[] = (payData.data.values || [])
    .map((row) => ({
      id:                row[0] || '',
      enquiryId:         row[1] || '',
      customerName:      row[2] || '',
      installmentNumber: parseInt(row[3] || '1'),
      amount:            parseFloat(row[4] || '0'),
      expectedAmount:    parseFloat(row[5] || '0'),
      status:            row[6] || 'pending',
      date:              row[7] || '',
      method:            row[8] || '',
      reference:         row[9] || '',
      verifiedBy:        row[10] || '',
      verifiedAt:        row[11] || '',
      notes:             row[12] || '',
      createdAt:         row[13] || '',
      createdBy:         row[14] || '',
    }))
    .filter(r => r.id);

  const result = { enquiries, liaisons, registrations, payments };
  await redis.set(cacheKey, JSON.stringify(result), { ex: RAW_CACHE_TTL });
  return result as { enquiries: EnquiryRow[]; liaisons: LiaisonRow[]; registrations: RegistrationRow[]; payments: PaymentRow[] };
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

    const { enquiries, liaisons, registrations, payments } = await getRawData(sheetId, orgId, forceRefresh);

    let data: any;
    switch (type) {
      case 'monthly':    data = monthlyBusinessReview(enquiries, filters); break;
      case 'pipeline':   data = pipelineFunnel(enquiries, filters);        break;
      case 'team':       data = teamPerformance(enquiries, filters);       break;
      case 'aging':      data = liaisonAging(enquiries, liaisons, filters); break;
      case 'area':       data = areaAnalysis(enquiries, liaisons, filters); break;
      case 'inspection': data = inspectionHealth(enquiries, liaisons, filters); break;
      case 'compliance': data = documentCompliance(enquiries, liaisons, filters); break;
      case 'registration':        data = registrationStatusReport(registrations, filters); break;
      case 'payments':            data = paymentTrackerReport(payments, filters); break;
      case 'incomplete-payments': data = incompletePaymentsReport(payments, enquiries, filters); break;
      case 'sales':               data = salesSummaryReport(enquiries, filters); break;
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
