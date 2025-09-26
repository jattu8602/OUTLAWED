import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const { id: lexiaTestId } = await params

    const lexiaTest = await prisma.lexiaTest.findUnique({
      where: { id: lexiaTestId },
      include: { attempts: { where: { userId } } },
    })

    if (!lexiaTest || lexiaTest.userId !== userId) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Mark previous attempts as not the latest
    if (lexiaTest.attempts.length > 0) {
      await prisma.lexiaTestAttempt.updateMany({
        where: {
          lexiaTestId: lexiaTestId,
          userId: userId,
        },
        data: {
          isLatest: false,
        },
      })
    }

    const newAttempt = await prisma.lexiaTestAttempt.create({
      data: {
        userId,
        lexiaTestId,
        answers: {},
        questionTimes: {},
        attemptNumber: lexiaTest.attempts.length + 1,
        isLatest: true,
        totalQuestions: lexiaTest.questionIds.length,
      },
    })

    return NextResponse.json({ attempt: newAttempt }, { status: 201 })
  } catch (error) {
    console.error('Error creating Lexia test attempt:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const { id: lexiaTestId } = await params

    const attempts = await prisma.lexiaTestAttempt.findMany({
      where: {
        lexiaTestId: lexiaTestId,
        userId: userId,
        completed: true,
      },
      orderBy: {
        attemptNumber: 'desc',
      },
    })

    // Transform the data to match what AttemptHistoryModal expects
    const transformedAttempts = attempts.map((attempt, index) => ({
      id: attempt.id,
      _id: attempt.id, // For MongoDB compatibility
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      totalQuestions: attempt.totalQuestions,
      totalAttempted: attempt.totalAttempted,
      totalTimeSec: attempt.totalTimeSec,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      isLatest: attempt.isLatest,
    }))

    console.log(
      `Found ${attempts.length} completed attempts for test ${lexiaTestId} and user ${userId}`
    )
    return NextResponse.json(transformedAttempts, { status: 200 })
  } catch (error) {
    console.error('Error fetching Lexia test attempts:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
