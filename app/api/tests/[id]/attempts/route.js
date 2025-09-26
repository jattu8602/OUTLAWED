import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { calculateScoreFromAttempt } from '@/lib/utils/scoringUtils'

const prisma = new PrismaClient()

// Get all attempts for a test by a user
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const totalQuestionsFromTest = test._count.questions

    const attempts = await prisma.testAttempt.findMany({
      where: {
        testId,
        userId,
      },
      orderBy: { attemptNumber: 'desc' },
      include: {
        answers: {
          select: {
            questionId: true,
            selectedOption: true,
            isCorrect: true,
            timeTakenSec: true,
            marksObtained: true,
          },
        },
      },
    })

    const attemptsWithCalculatedScore = attempts.map((attempt) => {
      const scoreCalculation = calculateScoreFromAttempt(
        attempt,
        totalQuestionsFromTest
      )
      return {
        ...attempt,
        score: scoreCalculation.percentage,
        percentage: scoreCalculation.percentage,
      }
    })

    return NextResponse.json(attemptsWithCalculatedScore)
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new attempt for a test
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const { userId, attemptNumber, previousAttemptId } = await request.json()

    // Get existing attempts to determine next attempt number
    const existingAttempts = await prisma.testAttempt.findMany({
      where: {
        testId,
        userId: session.user.id,
      },
      orderBy: { attemptNumber: 'desc' },
      take: 1,
    })

    const nextAttemptNumber =
      existingAttempts.length > 0 ? existingAttempts[0].attemptNumber + 1 : 1

    // Mark previous attempts as not latest
    if (existingAttempts.length > 0) {
      await prisma.testAttempt.updateMany({
        where: {
          testId,
          userId: session.user.id,
          isLatest: true,
        },
        data: { isLatest: false },
      })
    }

    // Create new attempt
    const newAttempt = await prisma.testAttempt.create({
      data: {
        userId: session.user.id,
        testId,
        attemptNumber: nextAttemptNumber,
        isLatest: true,
        previousAttemptId:
          existingAttempts.length > 0 ? existingAttempts[0].id : null,
        startedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      attempt: newAttempt,
    })
  } catch (error) {
    console.error('Error creating attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
