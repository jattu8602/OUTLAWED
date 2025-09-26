import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { invalidatePlansCache } from '../../payment-plans/route'

const prisma = new PrismaClient()

// GET - Fetch all payment plans
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plans = await prisma.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching payment plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new payment plan
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      price,
      duration,
      durationType,
      untilDate,
      description,
      discount,
      isActive,
    } = body

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Validate duration based on duration type
    if (durationType === 'until_date') {
      if (!untilDate) {
        return NextResponse.json(
          {
            error:
              'Until date is required when duration type is "until specific date"',
          },
          { status: 400 }
        )
      }
    } else if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: 'Duration is required and must be greater than 0' },
        { status: 400 }
      )
    }

    // Calculate duration in days based on type
    let durationInDays = 0
    // Temporarily simplify duration calculation to test basic functionality
    if (durationType === 'months') {
      durationInDays = parseInt(duration) * 30
    } else if (durationType === 'years') {
      durationInDays = parseInt(duration) * 365
    } else if (durationType === 'until_date' && untilDate) {
      const now = new Date()
      const targetDate = new Date(untilDate)
      durationInDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))
    } else {
      durationInDays = parseInt(duration) || 0
    }

    // Create plan data object
    const planData = {
      name,
      price: parseFloat(price),
      duration: durationInDays,
      durationType: durationType || 'days',
      isActive: isActive !== undefined ? isActive : true,
    }

    // Add optional fields only if they exist
    if (untilDate) planData.untilDate = new Date(untilDate)
    if (description) planData.description = description
    if (discount) planData.discount = parseFloat(discount)

    console.log('Creating plan with data:', planData)

    const plan = await prisma.paymentPlan.create({
      data: planData,
    })

    // Invalidate cache so new plan appears immediately on user side
    invalidatePlansCache()

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating payment plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
