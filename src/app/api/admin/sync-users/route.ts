import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { redis } from '@/lib/redis';
import { getGoogleSheetsClient } from '@/lib/googleSheets';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.sheetId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin/owner can sync users
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const sheetId = session.user.sheetId;
    const orgId = session.user.organizationId || 'hope-energy';

    // Fetch users from Google Sheets
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'USERS!A2:G1000',
    });

    const rows = response.data.values || [];
    console.log(`📊 Found ${rows.length} users in Google Sheets`);

    let syncedCount = 0;
    let skippedCount = 0;

    // Column mapping: A=userId, B=email, C=name, D=role, E=department, F=phone, G=isActive
    for (const row of rows) {
      if (row.length < 7) {
        skippedCount++;
        continue;
      }

      const email = row[1]?.trim();
      const name = row[2]?.trim();
      const role = row[3]?.toLowerCase().trim();
      const department = row[4]?.trim();
      const phone = row[5]?.trim();
      const isActive = row[6]?.toUpperCase().trim() === 'TRUE';

      if (!email || !name || !role) {
        skippedCount++;
        continue;
      }

      // Check if user already exists in Redis
      const existingUser = await redis.get(`user:${email}:info`);

      if (!existingUser) {
        // Create default password (user should change on first login)
        const defaultPassword = 'SolarArrow@123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        // Save user to Redis
        await redis.set(`user:${email}:info`, {
          email,
          name,
          role,
          department,
          phone,
          passwordHash,
          organizationId: orgId,
          isActive,
          createdAt: new Date().toISOString(),
          createdBy: 'sync-script',
        });

        // Add to organization users set
        await redis.sadd(`org:${orgId}:users`, email);

        syncedCount++;
        console.log(`✅ Synced user: ${email} (${role})`);
      } else {
        // Update existing user (don't overwrite password)
        const existing = existingUser as any;
        await redis.set(`user:${email}:info`, {
          ...existing,
          name,
          role,
          department,
          phone,
          isActive,
          updatedAt: new Date().toISOString(),
        });
        
        syncedCount++;
        console.log(`♻️ Updated user: ${email} (${role})`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} users from Google Sheets to Redis`,
      synced: syncedCount,
      skipped: skippedCount,
      total: rows.length,
    });

  } catch (error: any) {
    console.error('❌ Sync users error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to sync users' 
    }, { status: 500 });
  }
}
