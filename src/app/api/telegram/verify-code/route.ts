// src/app/api/telegram/verify-code/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/lib/redis';

// Generate verification code
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;
    
    // Generate a unique 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in Redis with 10-minute expiry
    await redis.set(`telegram:verify:${code}`, userEmail, { ex: 600 });
    
    return NextResponse.json({ code, expiresIn: 600 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
