import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'recent' or 'all'

    // Base query for premium tests that are active
    const baseWhere = {
      type: 'PAID',
      isActive: true,
    }

    // For recent tests (this month), add date filter
    if (type === 'recent') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      baseWhere.createdAt = {
        gte: startOfMonth,
      }
    }

    // Fetch tests with question count and user's attempt data
    const tests = await prisma.test.findMany({
      where: baseWhere,
      include: {
        questions: {
          select: {
            id: true,
            section: true,
          },
        },
        _count: {
          select: {
            questions: true,
            testAttempts: {
              where: {
                completed: true,
              },
            },
          },
        },
        testAttempts: {
          where: {
            userId: session.user.id,
            completed: true,
          },
          select: {
            id: true,
            score: true,
            completedAt: true,
            totalTimeSec: true,
            totalAttempted: true,
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 1, // Get the most recent attempt
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to match the frontend format
    const transformedTests = tests.map((test) => ({
      id: test.id,
      title: test.title,
      description: test.description,
      durationMinutes: test.durationInMinutes,
      numberOfQuestions: test._count.questions,
      isPaid: true,
      thumbnailUrl: test.thumbnailUrl,
      highlights: test.highlightPoints,
      positiveMarks: test.positiveMarks,
      negativeMarks: test.negativeMarks,
      attempts: test._count.testAttempts, // Total attempts by all users
      isAttempted: test.testAttempts.length > 0,
      testAttemptId:
        test.testAttempts.length > 0 ? test.testAttempts[0].id : null,
      lastScore:
        test.testAttempts.length > 0
          ? Math.round(
              (test.testAttempts[0].percentage ??
                test.testAttempts[0].score ??
                0) * 100
            ) / 100
          : null,
      attemptedAt:
        test.testAttempts.length > 0 ? test.testAttempts[0].completedAt : null,
      // Add some mock data for missing fields if needed
      isNew: test.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // New if created in last 7 days
      difficulty:
        test._count.questions > 200
          ? 'Hard'
          : test._count.questions > 100
          ? 'Medium'
          : 'Easy',
      rating: 4.5, // You can calculate this from user feedback later
      questions: test.questions, // Include questions for section breakdown
    }))

    return NextResponse.json({
      tests: transformedTests,
      count: transformedTests.length,
    })
  } catch (error) {
    console.error('Error fetching premium tests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
