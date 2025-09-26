import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// POST - Handle Razorpay webhooks
export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Webhook received:', event.event)

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload)
        break

      case 'payment.failed':
        await handlePaymentFailed(event.payload)
        break

      case 'order.paid':
        await handleOrderPaid(event.payload)
        break

      case 'refund.processed':
        await handleRefundProcessed(event.payload)
        break

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle successful payment capture
async function handlePaymentCaptured(payload) {
  try {
    const { payment, order } = payload

    // Find the payment record
    const dbPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: payment.id },
      include: { plan: true, user: true },
    })

    if (!dbPayment) {
      console.error('Payment not found in database:', payment.id)
      return
    }

    // Update payment status if not already updated
    if (dbPayment.status !== 'SUCCESS') {
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: 'SUCCESS' },
      })

      // Update user role and paid until date
      const paidUntil = new Date()
      paidUntil.setDate(paidUntil.getDate() + dbPayment.plan.duration)

      await prisma.user.update({
        where: { id: dbPayment.userId },
        data: {
          role: 'PAID',
          paidUntil: paidUntil,
        },
      })

      console.log('Payment verified and user updated:', payment.id)
    }
  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

// Handle failed payment
async function handlePaymentFailed(payload) {
  try {
    const { payment, order } = payload

    // Find and update payment status
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: payment.id },
      data: { status: 'FAILED' },
    })

    console.log('Payment marked as failed:', payment.id)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

// Handle order completion
async function handleOrderPaid(payload) {
  try {
    const { order } = payload

    // Find payments for this order
    const payments = await prisma.payment.findMany({
      where: { razorpayPaymentId: { not: null } },
      include: { plan: true, user: true },
    })

    // Process each payment
    for (const payment of payments) {
      if (payment.status === 'PENDING') {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        })

        // Update user role and paid until date
        const paidUntil = new Date()
        paidUntil.setDate(paidUntil.getDate() + payment.plan.duration)

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            role: 'PAID',
            paidUntil: paidUntil,
          },
        })

        console.log('Order payment processed:', payment.id)
      }
    }
  } catch (error) {
    console.error('Error handling order paid:', error)
  }
}

// Handle refund processing
async function handleRefundProcessed(payload) {
  try {
    const { refund, payment } = payload

    // Find the payment record
    const dbPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId: payment.id },
    })

    if (dbPayment) {
      // Update payment status to reflect refund
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { status: 'REFUNDED' },
      })

      // Revert user role to FREE if this was their only active payment
      const activePayments = await prisma.payment.findMany({
        where: {
          userId: dbPayment.userId,
          status: 'SUCCESS',
        },
      })

      if (activePayments.length === 0) {
        await prisma.user.update({
          where: { id: dbPayment.userId },
          data: {
            role: 'FREE',
            paidUntil: null,
          },
        })

        console.log('User reverted to FREE due to refund:', dbPayment.userId)
      }

      console.log('Refund processed:', refund.id)
    }
  } catch (error) {
    console.error('Error handling refund processed:', error)
  }
}
