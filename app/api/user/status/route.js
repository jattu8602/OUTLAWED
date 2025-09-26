import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get current user status
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with current status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        payments: {
          where: { status: 'SUCCESS' },
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is currently paid
    let isCurrentlyPaid = false
    let currentPlan = null
    let daysRemaining = 0

    if (user.paidUntil && user.paidUntil > new Date()) {
      isCurrentlyPaid = true

      // Find the most recent successful payment
      const latestPayment = user.payments[0]
      if (latestPayment) {
        currentPlan = latestPayment.plan

        // Calculate days remaining with proper timezone handling
        const now = new Date()
        const paidUntil = new Date(user.paidUntil)

        // Calculate the difference in milliseconds
        const timeDiff = paidUntil.getTime() - now.getTime()

        // Convert to days, ensuring we get the correct number
        daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)))
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        paidUntil: user.paidUntil,
        isCurrentlyPaid,
        currentPlan,
        daysRemaining,
      },
    })
  } catch (error) {
    console.error('Error getting user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
