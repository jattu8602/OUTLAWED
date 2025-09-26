import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's test attempts with test details
    const testAttempts = await prisma.testAttempt.findMany({
      where: {
        userId: session.user.id,
        isLatest: true,
        completed: true,
      },
      include: {
        test: {
          select: {
            id: true,
            title: true,
            type: true,
            durationInMinutes: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20, // Limit to last 20 tests
    })

    const tests = testAttempts.map((attempt) => ({
      id: attempt.test.id,
      title: attempt.test.title,
      type: attempt.test.type,
      durationInMinutes: attempt.test.durationInMinutes,
      score: attempt.score,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      unattempted: attempt.unattempted,
      completedAt: attempt.completedAt,
      attemptNumber: attempt.attemptNumber,
    }))

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching user tests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user tests' },
      { status: 500 }
    )
  }
}
