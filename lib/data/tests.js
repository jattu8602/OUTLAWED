import { PrismaClient } from '@prisma/client'
import { getAuthSession } from '@/auth'

// Initialize Prisma Client
const prisma = new PrismaClient()
const PAGE_SIZE = 20
/**
 * Fetches the initial data for the main dashboard.
 * It gets all attempted tests and the first page of unattempted tests.
 */
export async function getInitialDashboardData() {
  const session = await getAuthSession()
  const userId = session?.user?.id
  const userRole = session?.user?.role || 'FREE'

  if (!userId) {
    return {
      tests: [],
      stats: { totalTests: 0, completedTests: 0, averageScore: 0, rank: 0 },
      hasMore: false,
    }
  }

  // 1. Fetch all of the user's latest attempts
  const latestAttempts = await prisma.testAttempt.findMany({
    where: {
      userId,
      isLatest: true,
    },
    include: {
      test: {
        include: {
          questions: { select: { section: true } },
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  const attemptedTests = latestAttempts.map(({ test, ...attempt }) => ({
    ...test,
    isAttempted: true,
    testAttemptId: attempt.id,
    lastScore: attempt.score,
    attemptedAt: attempt.completedAt,
    locked: test.type === 'PAID' && userRole === 'FREE',
  }))

  const attemptedTestIds = attemptedTests.map((t) => t.id)

  // 2. Fetch the first page of unattempted tests
  const unattemptedTests = await prisma.test.findMany({
    where: {
      isActive: true,
      id: { notIn: attemptedTestIds },
    },
    include: {
      questions: { select: { section: true } },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: PAGE_SIZE,
  })

  const enrichedUnattemptedTests = unattemptedTests.map((test) => ({
    ...test,
    isAttempted: false,
    locked: test.type === 'PAID' && userRole === 'FREE',
  }))

  // 3. Combine and prepare initial data
  const initialTests = [...attemptedTests, ...enrichedUnattemptedTests]
  const hasMore = unattemptedTests.length === PAGE_SIZE

  // 4. Calculate stats based on ALL tests, not just the first page
  const totalTestCount = await prisma.test.count({ where: { isActive: true } })
  const totalScore = attemptedTests.reduce(
    (sum, t) => sum + (t.lastScore || 0),
    0
  )
  const averageScore =
    attemptedTests.length > 0
      ? Math.round(totalScore / attemptedTests.length)
      : 0

  const stats = {
    totalTests: totalTestCount,
    completedTests: attemptedTests.length,
    averageScore: averageScore,
    rank: 0, // Rank calculation is complex
  }

  return { tests: initialTests, stats, hasMore }
}

/**
 * Fetches the initial data for the free tests page.
 */
export async function getInitialFreeTests() {
  const session = await getAuthSession()
  const userId = session?.user?.id

  const baseQuery = { isActive: true, type: 'FREE' }

  // Fetch all attempted free tests
  const attemptedTests = userId
    ? await prisma.test.findMany({
        where: {
          ...baseQuery,
          testAttempts: { some: { userId, isLatest: true } },
        },
        include: {
          questions: { select: { section: true } },
          testAttempts: {
            where: { userId, isLatest: true },
            select: { id: true, score: true, completedAt: true },
          },
        },
      })
    : []

  const enrichedAttemptedTests = attemptedTests.map((test) => ({
    ...test,
    isAttempted: true,
    testAttemptId: test.testAttempts[0]?.id,
    lastScore: test.testAttempts[0]?.score,
    attemptedAt: test.testAttempts[0]?.completedAt,
    locked: false,
  }))

  const attemptedTestIds = enrichedAttemptedTests.map((t) => t.id)

  // Fetch the first page of unattempted free tests
  const unattemptedTests = await prisma.test.findMany({
    where: {
      ...baseQuery,
      id: { notIn: attemptedTestIds },
    },
    include: {
      questions: { select: { section: true } },
    },
    take: PAGE_SIZE,
    orderBy: { createdAt: 'desc' },
  })

  const enrichedUnattemptedTests = unattemptedTests.map((test) => ({
    ...test,
    isAttempted: false,
    locked: false,
  }))

  const initialTests = [...enrichedAttemptedTests, ...enrichedUnattemptedTests]
  const hasMore = unattemptedTests.length === PAGE_SIZE

  return { tests: initialTests, hasMore }
}

/**
 * Fetches the initial data for the paid tests page.
 */
export async function getInitialPaidTests() {
  const session = await getAuthSession()
  const userId = session?.user?.id
  const userRole = session?.user?.role || 'FREE'

  const baseQuery = { isActive: true, type: 'PAID' }

  // Fetch all attempted paid tests
  const attemptedTests = userId
    ? await prisma.test.findMany({
        where: {
          ...baseQuery,
          testAttempts: { some: { userId, isLatest: true } },
        },
        include: {
          questions: { select: { section: true } },
          testAttempts: {
            where: { userId, isLatest: true },
            select: { id: true, score: true, completedAt: true },
          },
        },
      })
    : []

  const enrichedAttemptedTests = attemptedTests.map((test) => ({
    ...test,
    isAttempted: true,
    testAttemptId: test.testAttempts[0]?.id,
    lastScore: test.testAttempts[0]?.score,
    attemptedAt: test.testAttempts[0]?.completedAt,
    locked: userRole === 'FREE',
  }))

  const attemptedTestIds = enrichedAttemptedTests.map((t) => t.id)

  // Fetch the first page of unattempted paid tests
  const unattemptedTests = await prisma.test.findMany({
    where: {
      ...baseQuery,
      id: { notIn: attemptedTestIds },
    },
    include: {
      questions: { select: { section: true } },
    },
    take: PAGE_SIZE,
    orderBy: { createdAt: 'desc' },
  })

  const enrichedUnattemptedTests = unattemptedTests.map((test) => ({
    ...test,
    isAttempted: false,
    locked: userRole === 'FREE',
  }))

  const initialTests = [...enrichedAttemptedTests, ...enrichedUnattemptedTests]
  const hasMore = unattemptedTests.length === PAGE_SIZE

  return { tests: initialTests, hasMore }
}
