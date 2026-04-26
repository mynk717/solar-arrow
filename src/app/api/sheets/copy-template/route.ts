import { NextResponse } from 'next/server';

const TEMPLATE_SHEET_ID = '19V_ipRh36LmBuTCKx_z_1M_O3ice0ZFBS0iTDpvMzS4';

export async function GET() {
  return NextResponse.json({
    templateUrl: `https://docs.google.com/spreadsheets/d/${TEMPLATE_SHEET_ID}/copy`,
    message: 'Open the link to make a copy of the template in your Google Drive.'
  });
}