'use server'

import { PrismaClient } from '@prisma/client'
import { getAuthSession } from '@/auth'

const prisma = new PrismaClient()
const PAGE_SIZE = 5

/**
 * Server Action to fetch a page of tests.
 * This can be expanded to handle different test types.
 * For now, it fetches all types of tests that the user has NOT attempted.
 */
export async function fetchMoreTests(page = 1, type = 'all') {
  const session = await getAuthSession()
  const userId = session?.user?.id
  const userRole = session?.user?.role || 'FREE'

  if (!userId) {
    // Return empty if no user, though this should be protected by the page
    return []
  }

  // Find all test IDs the user has already attempted
  const attemptedTestAttempts = await prisma.testAttempt.findMany({
    where: { userId },
    select: { testId: true },
  })
  const attemptedTestIds = attemptedTestAttempts.map((a) => a.testId)

  // Set up the where clause for the query
  const whereClause = {
    isActive: true,
    id: { notIn: attemptedTestIds },
  }

  if (type === 'free') {
    whereClause.type = 'FREE'
  } else if (type === 'paid') {
    whereClause.type = 'PAID'
  }

  // Fetch a page of tests that have NOT been attempted
  const unattemptedTests = await prisma.test.findMany({
    where: whereClause,
    include: {
      questions: {
        select: {
          section: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  // Enrich with lock status (isAttempted is false by definition here)
  const enrichedTests = unattemptedTests.map((test) => ({
    ...test,
    isAttempted: false,
    locked: test.type === 'PAID' && userRole === 'FREE',
  }))

  return enrichedTests
}

/**
 * Server Action to fetch the initial data for the main dashboard.
 */
import { getInitialDashboardData as getInitialData } from '@/lib/data/tests'
export async function fetchInitialDashboardData() {
  try {
    const data = await getInitialData()
    return data
  } catch (error) {
    console.error('Error fetching initial dashboard data:', error)
    return {
      tests: [],
      stats: { totalTests: 0, completedTests: 0, averageScore: 0, rank: 0 },
      hasMore: false,
    }
  }
}

/**
 * Server Action to fetch the initial data for the free tests page.
 */
import { getInitialFreeTests as getInitialFreeData } from '@/lib/data/tests'
export async function fetchInitialFreeTests() {
  try {
    const data = await getInitialFreeData()
    return data
  } catch (error) {
    console.error('Error fetching initial free tests:', error)
    return { tests: [], hasMore: false }
  }
}

/**
 * Server Action to fetch the initial data for the paid tests page.
 */
import { getInitialPaidTests as getInitialPaidData } from '@/lib/data/tests'
export async function fetchInitialPaidTests() {
  try {
    const data = await getInitialPaidData()
    return data
  } catch (error) {
    console.error('Error fetching initial paid tests:', error)
    return { tests: [], hasMore: false }
  }
}
