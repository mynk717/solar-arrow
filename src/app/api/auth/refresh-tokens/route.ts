import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'
import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Force fetch fresh tokens from session
    if (session.accessToken && session.refreshToken) {
      // Update Redis with fresh tokens
      await redis.set(`org:${session.user.organizationId}:oauth:${session.user.email}`, {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        updatedAt: new Date().toISOString()
      })

      return NextResponse.json({ success: true, message: 'Tokens refreshed' })
    }

    return NextResponse.json({ error: 'No tokens in session' }, { status: 400 })
  } catch (error) {
    console.error('Token refresh failed:', error)
    return NextResponse.json({ error: 'Failed to refresh tokens' }, { status: 500 })
  }
}
