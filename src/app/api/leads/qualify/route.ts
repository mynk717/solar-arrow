import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { updateLead } from '@/lib/googleSheets';
import { invalidateLeadsCache } from '@/lib/redis';
import { notifyLeadActivity } from '@/lib/notificationHelpers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Admin, Owner, Sales, and Assigned User can qualify
    const userRole = (session.user as any).role || 'user';
    const userEmail = session.user.email;

    const { 
      leadId, 
      qualificationNotes, 
      estimatedBudget,
      purchaseTimelineDays,
      electricityBill,
      roofType,
      decisionMaker,
      purchaseIntent,
    } = await request.json();    

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }

    // Check if user has permission to qualify this lead
    const orgId = (session.user as any).organizationId || 'default-org';
    
    console.log(`🎯 Qualifying lead ${leadId} by ${userEmail}`);

    // Update lead to qualified status
    await updateLead(
      leadId,
      {
        status: 'qualified',
        qualified: true,
        qualifiedDate: new Date(),
        qualifiedBy: userEmail,
        estimatedBudget: estimatedBudget ? parseFloat(estimatedBudget) : undefined,
purchaseTimelineDays: purchaseTimelineDays ? parseInt(purchaseTimelineDays) : undefined,
electricityBill: electricityBill || undefined,
roofType: roofType || undefined,
decisionMaker: decisionMaker || undefined,
purchaseIntent: purchaseIntent || undefined,
notes: qualificationNotes || '',
        lastActivityBy: userEmail,
        lastActivityDate: new Date(),
      },
      userEmail
    );

    console.log(`✅ Lead ${leadId} qualified successfully`);

    // ✅ Invalidate cache
    await invalidateLeadsCache(orgId);
    console.log('✅ Cache invalidated after qualification');

    try {
      await notifyLeadActivity(
        orgId,
        leadId,
        leadId,
        'status',
        {
          status: 'qualified',
          qualifiedBy: userEmail,
          estimatedBudget: estimatedBudget || 'N/A',
        },
        userEmail,
        qualificationNotes || 'Lead marked as qualified'
      );
    } catch (notifErr) {
      console.error('Notification failed (non-blocking):', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Lead qualified successfully',
    });
  } catch (error: any) {
    console.error('❌ Qualification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
