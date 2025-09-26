import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Admin reply to a review
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { adminReply } = await request.json()

    if (!adminReply || adminReply.trim().length === 0) {
      return NextResponse.json(
        { error: 'Admin reply is required' },
        { status: 400 }
      )
    }

    // Update the review with admin reply
    const updatedReview = await prisma.review.update({
      where: {
        id: id,
      },
      data: {
        adminReply: adminReply.trim(),
        repliedAt: new Date(),
        isRead: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Mark review as read
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const updatedReview = await prisma.review.update({
      where: {
        id: id,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ review: updatedReview })
  } catch (error) {
    console.error('Error marking review as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
