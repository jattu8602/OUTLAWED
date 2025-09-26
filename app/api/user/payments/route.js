import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cache for user payments
const userPaymentsCache = new Map()

// GET - Fetch user's payment history
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = Date.now()
    const cacheKey = `payments_${userId}`
    const cacheExpiry = 5 * 60 * 1000 // 5 minutes

    // Check cache
    const cached = userPaymentsCache.get(cacheKey)
    if (cached && now - cached.timestamp < cacheExpiry) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes browser cache
          ETag: `"${cached.timestamp}"`,
        },
      })
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            durationType: true,
            untilDate: true,
            description: true,
            discount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Update cache
    userPaymentsCache.set(cacheKey, {
      data: payments,
      timestamp: now,
    })

    // Clean up old cache entries
    if (userPaymentsCache.size > 100) {
      const entries = Array.from(userPaymentsCache.entries())
      entries
        .filter(([_, value]) => now - value.timestamp > cacheExpiry)
        .forEach(([key]) => userPaymentsCache.delete(key))
    }

    return NextResponse.json(payments, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes browser cache
        ETag: `"${now}"`,
      },
    })
  } catch (error) {
    console.error('Error fetching user payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
