import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const lexiaTests = await prisma.lexiaTest.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        attempts: {
          where: {
            isLatest: true,
          },
          select: {
            id: true,
            score: true,
            percentage: true,
            completedAt: true,
          },
        },
      },
    })

    const testsWithAttemptData = lexiaTests.map((test) => {
      const latestAttempt = test.attempts[0]
      const totalMarks = test.questionIds.length // Assuming 1 mark per question
      return {
        id: test.id,
        title: test.title,
        type: test.type, // MOCK or SECTIONAL
        isPaid: false, // Lexia tests are not paid content
        isLexia: true,
        durationMinutes: test.durationInMinutes,
        numberOfQuestions: test.questionIds.length,
        isAttempted: !!latestAttempt,
        lastScore: latestAttempt?.percentage
          ? Number(latestAttempt.percentage.toFixed(2))
          : null,
        obtainedMarks: latestAttempt?.score, // Add obtained marks
        totalMarks: totalMarks, // Add total marks
        attemptedAt: latestAttempt?.completedAt,
        attemptCount: test.attempts.length,
        latestAttemptId: latestAttempt?.id,
        createdAt: test.createdAt,
      }
    })

    return NextResponse.json(testsWithAttemptData, { status: 200 })
  } catch (error) {
    console.error('Error fetching Lexia tests:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
