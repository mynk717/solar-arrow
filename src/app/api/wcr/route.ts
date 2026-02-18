import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import { redis } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = (session.user as any).sheetId;
    const orgId = (session.user as any).organizationId || 'default-org';
    const userRole = (session.user as any).role;

    if (!sheetId) {
      return NextResponse.json({ error: 'Sheet not configured' }, { status: 400 });
    }

    // Check cache
    const cacheKey = `org:${orgId}:wcrs`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ wcrs: JSON.parse(cached as string), cached: true });
    }

    const sheets = await getGoogleSheetsClient();

    // Fetch enquiries with installation completed
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'ENQUIRIES!A2:BZ1000',
    });

    const rows = response.data.values || [];

    const wcrs = rows
      .filter((row: any) => {
        const installationDate = row[14]; // Column O - installationDate
        const installationStatus = row[15]; // Column P - installationStatus
        
        // Only include enquiries with completed installations
        return installationDate && (installationStatus === 'completed' || installationStatus === 'installation-completed');
      })
      .map((row: any) => {
        // WCR columns mapping (adjust based on your sheet structure)
        // Assuming WCR fields start from column AE (31)
        const wcrStatus = row[30] || 'pending'; // Column AE
        const wcrSubmittedDate = row[31] || ''; // Column AF
        const wcrSubmittedBy = row[32] || ''; // Column AG
        const wcrApprovedDate = row[33] || ''; // Column AH
        const wcrApprovedBy = row[34] || ''; // Column AI
        const wcrRejectedReason = row[35] || ''; // Column AJ
        const wcrNotes = row[36] || ''; // Column AK
        const workQuality = row[37] || ''; // Column AL
        const safetyCompliance = row[38] || ''; // Column AM
        const wcrPhotos = row[39] || ''; // Column AN (comma-separated URLs)
        const customerSignature = row[40] || ''; // Column AO

        return {
          enquiryId: row[0],
          customerName: row[1],
          phone: row[2],
          capacity: row[4] || 'N/A',
          address: row[3] || '',
          
          installationDate: row[14],
          installedBy: row[16] || '',
          
          wcrStatus,
          wcrSubmittedDate,
          wcrSubmittedBy,
          wcrApprovedDate,
          wcrApprovedBy,
          wcrRejectedReason,
          wcrNotes,
          workQuality,
          safetyCompliance,
          wcrPhotos: wcrPhotos ? wcrPhotos.split(',').map((url: string) => url.trim()) : [],
          customerSignature,
        };
      });

    // Filter based on role
    let filteredWcrs = wcrs;
    if (userRole === 'installation') {
      // Installation team sees only their own
      filteredWcrs = wcrs.filter((w: any) => w.installedBy === session.user?.email);
    }

    // Cache for 2 minutes
    await redis.setex(cacheKey, 120, JSON.stringify(filteredWcrs));

    return NextResponse.json({ wcrs: filteredWcrs, cached: false });
  } catch (error: any) {
    console.error('Error fetching WCRs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch WCRs' },
      { status: 500 }
    );
  }
}
