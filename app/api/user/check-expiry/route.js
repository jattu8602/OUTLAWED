import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Check and update user plan expiry
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if plan has expired
    if (
      user.paidUntil &&
      user.paidUntil <= new Date() &&
      user.role === 'PAID'
    ) {
      // Update user role back to FREE
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: 'FREE',
          paidUntil: null,
        },
      })

      return NextResponse.json({
        message: 'Plan expired, user role updated to FREE',
        role: 'FREE',
      })
    }

    return NextResponse.json({
      message: 'Plan still active',
      role: user.role,
      paidUntil: user.paidUntil,
    })
  } catch (error) {
    console.error('Error checking plan expiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
