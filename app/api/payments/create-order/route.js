import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import Razorpay from 'razorpay'

// Initialize Prisma with proper error handling
let prisma
try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error.message)
}

// Validate environment variables
const validateEnvVars = () => {
  const required = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

// Initialize Razorpay
let razorpay
try {
  validateEnvVars()
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
} catch (error) {
  console.error('Failed to initialize Razorpay:', error.message)
}

// POST - Create Razorpay order
export async function POST(request) {
  try {
    // Check if Prisma is properly initialized
    if (!prisma) {
      console.error('Prisma client not initialized')
      return NextResponse.json(
        { error: 'Database service not configured' },
        { status: 500 }
      )
    }

    // Check if Razorpay is properly initialized
    if (!razorpay) {
      console.error('Razorpay not initialized - missing environment variables')
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      console.error('Unauthorized payment attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount } = body

    console.log('Payment request received:', {
      planId,
      amount,
      userId: session.user.id,
    })

    if (!planId || !amount) {
      console.error('Missing required fields:', { planId, amount })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify plan exists and is active
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId, isActive: true },
    })

    if (!plan) {
      console.error('Invalid plan requested:', {
        planId,
        userId: session.user.id,
      })
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    console.log('Plan verified:', {
      planName: plan.name,
      planPrice: plan.price,
    })

    // Create Razorpay order safely
    let order
    try {
      const orderData = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `plan_${Date.now().toString().slice(-8)}`,
        notes: {
          planId,
          userId: session.user.id,
          planName: plan.name,
        },
      }

      console.log('Creating Razorpay order with data:', orderData)

      order = await razorpay.orders.create(orderData)

      console.log('Razorpay order created successfully:', { orderId: order.id })
    } catch (razorpayErr) {
      console.error('Razorpay order creation failed:', {
        error: razorpayErr.message,
        statusCode: razorpayErr.statusCode,
        errorDetails: razorpayErr.error,
      })
      return NextResponse.json(
        { error: `Failed to create Razorpay order: ${razorpayErr.message}` },
        { status: 400 }
      )
    }

    // Make sure the order has a valid ID
    if (!order?.id) {
      console.error('Invalid order response from Razorpay:', order)
      return NextResponse.json(
        { error: 'Invalid order response from Razorpay' },
        { status: 500 }
      )
    }

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        planId: planId,
        amount: parseFloat(amount),
        status: 'PENDING',
        razorpayPaymentId: null,
      },
    })

    console.log('Payment record created in database:', {
      paymentId: payment.id,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      paymentId: payment.id,
    })
  } catch (error) {
    console.error('Error creating order:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Handle Razorpay specific errors
    if (error.statusCode === 400) {
      return NextResponse.json(
        {
          error: `Razorpay error: ${
            error.error?.description || 'Invalid request'
          }`,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
