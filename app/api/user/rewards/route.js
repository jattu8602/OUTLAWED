import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's test attempts to calculate streak
    const testAttempts = await prisma.testAttempt.findMany({
      where: { userId },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
    })

    // Calculate streak
    let currentStreak = 0
    if (testAttempts.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let checkDate = new Date(today)
      let foundActivity = false

      // Check if there was activity today
      const todayActivity = testAttempts.find((attempt) => {
        const attemptDate = new Date(attempt.completedAt)
        attemptDate.setHours(0, 0, 0, 0)
        return attemptDate.getTime() === checkDate.getTime()
      })

      if (todayActivity) {
        currentStreak = 1
        checkDate.setDate(checkDate.getDate() - 1)
        foundActivity = true
      } else {
        // Check if there was activity yesterday
        checkDate.setDate(checkDate.getDate() - 1)
        const yesterdayActivity = testAttempts.find((attempt) => {
          const attemptDate = new Date(attempt.completedAt)
          attemptDate.setHours(0, 0, 0, 0)
          return attemptDate.getTime() === checkDate.getTime()
        })

        if (yesterdayActivity) {
          currentStreak = 1
          checkDate.setDate(checkDate.getDate() - 1)
          foundActivity = true
        }
      }

      if (foundActivity) {
        // Continue counting backwards
        while (true) {
          const dayActivity = testAttempts.find((attempt) => {
            const attemptDate = new Date(attempt.completedAt)
            attemptDate.setHours(0, 0, 0, 0)
            return attemptDate.getTime() === checkDate.getTime()
          })

          if (dayActivity) {
            currentStreak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
      }
    }

    // Get pomodoro sessions
    const pomodoroSessions = await prisma.pomodoroSession.findMany({
      where: { userId },
      select: { sessionType: true, duration: true, completedAt: true },
    })

    const totalPomodoroCycles = pomodoroSessions.filter(
      (session) => session.sessionType === 'study'
    ).length
    const totalStudyTime = pomodoroSessions
      .filter((session) => session.sessionType === 'study')
      .reduce((total, session) => total + session.duration, 0)

    // Get schedule completion data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAttempts = testAttempts.filter(
      (attempt) => new Date(attempt.completedAt) >= thirtyDaysAgo
    )

    // Group by week and count completed weeks
    const weeklyGroups = {}
    recentAttempts.forEach((attempt) => {
      const date = new Date(attempt.completedAt)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0)

      const weekKey = weekStart.toISOString().split('T')[0]
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = 0
      }
      weeklyGroups[weekKey]++
    })

    // Count weeks with at least 3 test attempts (indicating active study week)
    const completedWeeks = Object.values(weeklyGroups).filter(
      (count) => count >= 3
    ).length

    const rewardsData = {
      streak: {
        current: currentStreak,
        longest: currentStreak, // For now, same as current
        lastActivity: testAttempts[0]?.completedAt || null,
      },
      pomodoro: {
        completedCycles: totalPomodoroCycles,
        totalStudyTime: totalStudyTime,
        averageSessionLength:
          totalPomodoroCycles > 0 ? totalStudyTime / totalPomodoroCycles : 0,
      },
      scheduler: {
        completedWeeks: completedWeeks,
        totalWeeksTracked: Math.ceil(30 / 7), // Last 30 days
        weeklyGoal: 3, // Minimum tests per week
        currentWeekProgress: weeklyGroups[Object.keys(weeklyGroups)[0]] || 0,
      },
    }

    return NextResponse.json(rewardsData)
  } catch (error) {
    console.error('Error fetching rewards data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // This endpoint can be used to manually update rewards or track specific activities
    // For now, we'll just return success
    return NextResponse.json({ success: true, message: 'Rewards updated' })
  } catch (error) {
    console.error('Error updating rewards:', error)
    return NextResponse.json(
      { error: 'Failed to update rewards' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
