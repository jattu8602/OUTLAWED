import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const attemptId = searchParams.get('attemptId')

    if (!attemptId) {
      return NextResponse.json(
        { error: 'Test Attempt ID is required' },
        { status: 400 }
      )
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: {
        id: attemptId,
        userId: session.user.id, // Ensure user can only access their own attempts
      },
      include: {
        test: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(attempt)
  } catch (error) {
    console.error('Error fetching single test analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch test analytics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
