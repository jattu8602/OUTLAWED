import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { calculateScoreFromAttempt } from '@/lib/utils/scoringUtils'
import {
  getWeekStart,
  getWeekEnd,
  getWeekInfo,
  getTimeRemainingFormatted,
} from '@/lib/utils/weekUtils'

export const dynamic = 'force-dynamic' // Force dynamic rendering, disable caching

const prisma = new PrismaClient()

// Cache for leaderboard data
let leaderboardCache = {
  data: null,
  timestamp: null,
  expiry: 5 * 60 * 1000, // 5 minutes
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current week boundaries
    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()

    console.log(
      `Weekly leaderboard: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`
    )

    // Get all users with their test attempts and scores from current week only
    const usersWithScores = await prisma.user.findMany({
      where: {
        isBlocked: false, // Exclude blocked users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        testAttempts: {
          where: {
            completed: true,
            isLatest: true, // Only get latest attempts for better performance
            completedAt: {
              gte: weekStart, // Only tests completed this week
              lte: weekEnd,
            },
          },
          select: {
            score: true,
            percentage: true,
            totalQuestions: true,
            correctAnswers: true,
            wrongAnswers: true,
            unattempted: true,
            completedAt: true,
            test: {
              select: {
                type: true,
                title: true,
              },
            },
          },
        },
      },
    })

    // Calculate total scores and test counts for each user
    const leaderboardData = usersWithScores
      .map((user) => {
        const totalScore = user.testAttempts.reduce((sum, attempt) => {
          // Recalculate score to ensure consistency
          const scoreCalculation = calculateScoreFromAttempt(attempt)
          return sum + (scoreCalculation.percentage || 0)
        }, 0)
        const totalTests = user.testAttempts.length
        const paidTests = user.testAttempts.filter(
          (attempt) => attempt.test.type === 'PAID'
        ).length
        const freeTests = totalTests - paidTests

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          image: user.image,
          role: user.role,
          totalScore: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
          totalTests,
          paidTests,
          freeTests,
        }
      })
      .filter((user) => user.totalTests > 0) // Only include users who have attempted tests
      .sort((a, b) => b.totalScore - a.totalScore) // Sort by total score descending

    // Add rank to each user
    const rankedLeaderboard = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    // Get top 10 users
    const top10Users = rankedLeaderboard.slice(0, 10)

    // Get current user's rank - ensure we compare IDs as strings
    console.log(
      'Looking for user ID:',
      session.user.id,
      'Type:',
      typeof session.user.id
    )
    const currentUserRank = rankedLeaderboard.find(
      (user) => String(user.id) === String(session.user.id)
    )
    console.log('Found current user in leaderboard:', !!currentUserRank)

    // If current user is not in leaderboard (no tests this week), get their basic info
    let currentUserData = currentUserRank
    if (!currentUserData) {
      const userFromDb = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      if (userFromDb) {
        currentUserData = {
          id: userFromDb.id,
          name: userFromDb.name || 'Anonymous',
          email: userFromDb.email,
          image: userFromDb.image,
          role: userFromDb.role,
          totalScore: 0,
          totalTests: 0,
          paidTests: 0,
          freeTests: 0,
          rank: rankedLeaderboard.length + 1, // Rank after all users with tests
        }
      }
    }

    // Get weekly information
    const weekInfo = getWeekInfo()
    const timeRemaining = getTimeRemainingFormatted()

    return NextResponse.json(
      {
        leaderboard: top10Users,
        currentUser: currentUserData,
        totalUsers: rankedLeaderboard.length,
        weekInfo: {
          start: weekInfo.startFormatted,
          end: weekInfo.endFormatted,
          range: weekInfo.weekRange,
          daysRemaining: weekInfo.daysRemaining,
        },
        timeRemaining,
        isWeekly: true,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=0, no-cache, no-store', // No caching
        },
      }
    )
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
