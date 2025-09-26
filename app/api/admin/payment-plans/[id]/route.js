import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { invalidatePlansCache } from '../../payment-plans/route'

const prisma = new PrismaClient()

// PUT - Update payment plan
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    console.log('Updating plan with data:', planData)

    const plan = await prisma.paymentPlan.update({
      where: { id },
      data: planData,
    })

    // Invalidate cache so updated plan appears immediately on user side
    invalidatePlansCache()

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating payment plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payment plan
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if plan has any payments
    const existingPayments = await prisma.payment.findMany({
      where: { planId: id },
      select: { id: true, status: true, createdAt: true },
    })

    // Soft delete the plan by marking it as inactive
    // User subscriptions will remain active as they're stored in user.paidUntil
    await prisma.paymentPlan.update({
      where: { id },
      data: {
        isActive: false,
        // Add a deletedAt timestamp for audit purposes
        updatedAt: new Date(),
      },
    })

    // Invalidate cache so deactivated plan is removed immediately from user side
    invalidatePlansCache()

    return NextResponse.json({
      message: 'Payment plan deactivated successfully',
      warning:
        existingPayments.length > 0
          ? `Plan had ${existingPayments.length} existing payment(s). User subscriptions remain active until their expiration date.`
          : null,
      paymentCount: existingPayments.length,
    })
  } catch (error) {
    console.error('Error deleting payment plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
