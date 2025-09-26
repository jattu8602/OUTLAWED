import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'
import { calculateUserAnalytics } from '@/lib/analytics'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const analytics = await calculateUserAnalytics(userId)

    // Set cache headers for client-side caching
    const response = NextResponse.json({ analytics })
    response.headers.set('Cache-Control', 'private, max-age=300') // 5 minutes
    response.headers.set('ETag', `"${Date.now()}"`)
    return response
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
