import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET a single published test series by ID for users
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const testSeries = await prisma.testSeries.findFirst({
      where: {
        id,
        isPublished: true,
      },
      include: {
        tests: {
          orderBy: {
            addedAt: 'asc', // 'desc' for DAILY could be an option here or on client
          },
          include: {
            test: {
              include: {
                testAttempts: {
                  where: { userId: session.user.id },
                  orderBy: {
                    attemptNumber: 'desc',
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!testSeries) {
      return NextResponse.json(
        { error: 'Test series not found' },
        { status: 404 }
      )
    }

    // Attach user's attempt history to each test
    const seriesWithAttemptData = {
      ...testSeries,
      tests: testSeries.tests.map((ts) => ({
        ...ts.test,
        isAttempted: ts.test.testAttempts.length > 0,
        attemptCount: ts.test.testAttempts.length,
        lastScore:
          ts.test.testAttempts.length > 0
            ? ts.test.testAttempts[0].percentage
            : null,
        attemptHistory: ts.test.testAttempts,
      })),
    }

    // For playlist, calculate completion
    let completion = {}
    if (seriesWithAttemptData.type === 'PLAYLIST') {
      const completedCount = seriesWithAttemptData.tests.filter(
        (t) => t.isAttempted
      ).length
      const totalCount = seriesWithAttemptData.tests.length
      completion = {
        completed: completedCount,
        total: totalCount,
        percentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
      }
    }

    return NextResponse.json({ series: seriesWithAttemptData, completion })
  } catch (error) {
    console.error(`Error fetching test series ${params.id} for user:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
