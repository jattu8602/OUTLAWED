import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// POST - Verify Razorpay payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = body

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !planId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get plan details
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Update payment status
    const payment = await prisma.payment.updateMany({
      where: {
        userId: session.user.id,
        planId: planId,
        status: 'PENDING',
      },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
      },
    })

    if (payment.count === 0) {
      return NextResponse.json(
        { error: 'No pending payment found' },
        { status: 400 }
      )
    }

    // Get user to determine subscription start date
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine the base date for the new subscription period
    const baseDate =
      user.paidUntil && user.paidUntil > new Date()
        ? new Date(user.paidUntil)
        : new Date()

    let newPaidUntil

    if (plan.durationType === 'until_date' && plan.untilDate) {
      newPaidUntil = new Date(plan.untilDate)
    } else {
      newPaidUntil = new Date(baseDate)
      const duration = plan.duration

      switch (plan.durationType) {
        case 'days':
          newPaidUntil.setDate(newPaidUntil.getDate() + duration)
          break
        case 'months':
          newPaidUntil.setMonth(newPaidUntil.getMonth() + duration)
          break
        case 'years':
          newPaidUntil.setFullYear(newPaidUntil.getFullYear() + duration)
          break
        default: // Default to days
          newPaidUntil.setDate(newPaidUntil.getDate() + duration)
          break
      }
      newPaidUntil.setHours(23, 59, 59, 999)
    }

    // Update user role and paid until date
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'PAID',
        paidUntil: newPaidUntil,
      },
    })

    return NextResponse.json({
      message: 'Payment verified successfully',
      paidUntil: newPaidUntil,
      refreshStats: true, // Signal to refresh sidebar stats
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
