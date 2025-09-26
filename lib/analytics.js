import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function calculateUserAnalytics(userId) {
  // Get all test attempts for the user
  const testAttempts = await prisma.testAttempt.findMany({
    where: {
      userId,
      completed: true,
    },
    include: {
      test: {
        include: {
          questions: {
            select: {
              section: true,
              positiveMarks: true,
              negativeMarks: true,
            },
          },
        },
      },
      answers: {
        include: {
          question: {
            select: {
              section: true,
              positiveMarks: true,
              negativeMarks: true,
            },
          },
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  // Calculate daily analytics
  const dailyAnalytics = {}
  const sectionAnalytics = {
    ENGLISH: { total: 0, correct: 0, wrong: 0, timeSpent: 0, attempts: 0 },
    GK_CA: { total: 0, correct: 0, wrong: 0, timeSpent: 0, attempts: 0 },
    LEGAL_REASONING: {
      total: 0,
      correct: 0,
      wrong: 0,
      timeSpent: 0,
      attempts: 0,
    },
    LOGICAL_REASONING: {
      total: 0,
      correct: 0,
      wrong: 0,
      timeSpent: 0,
      attempts: 0,
    },
    QUANTITATIVE_TECHNIQUES: {
      total: 0,
      correct: 0,
      wrong: 0,
      timeSpent: 0,
      attempts: 0,
    },
  }

  let totalTests = 0
  let totalQuestions = 0
  let totalCorrect = 0
  let totalWrong = 0
  let totalTimeSpent = 0
  let averageScore = 0
  let bestScore = 0
  let worstScore = 100

  testAttempts.forEach((attempt) => {
    const date = attempt.completedAt.toISOString().split('T')[0]

    if (!dailyAnalytics[date]) {
      dailyAnalytics[date] = {
        date,
        testsAttempted: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        timeSpent: 0,
        averageScore: 0,
        sections: {},
      }
    }

    dailyAnalytics[date].testsAttempted++
    dailyAnalytics[date].questionsAnswered += attempt.answers.length
    dailyAnalytics[date].correctAnswers += attempt.correctAnswers || 0
    dailyAnalytics[date].wrongAnswers += attempt.wrongAnswers || 0
    dailyAnalytics[date].timeSpent += attempt.totalTimeSec || 0
    dailyAnalytics[date].averageScore =
      (dailyAnalytics[date].averageScore *
        (dailyAnalytics[date].testsAttempted - 1) +
        (attempt.percentage || 0)) /
      dailyAnalytics[date].testsAttempted

    // Section-wise analysis
    attempt.answers.forEach((answer) => {
      const section = answer.question.section
      if (sectionAnalytics[section]) {
        sectionAnalytics[section].total++
        sectionAnalytics[section].timeSpent += answer.timeTakenSec || 0

        if (answer.isCorrect === true) {
          sectionAnalytics[section].correct++
        } else if (answer.isCorrect === false) {
          sectionAnalytics[section].wrong++
        }
      }
    })

    // Update section attempts
    attempt.test.questions.forEach((question) => {
      if (sectionAnalytics[question.section]) {
        sectionAnalytics[question.section].attempts++
      }
    })

    // Overall stats
    totalTests++
    totalQuestions += attempt.answers.length
    totalCorrect += attempt.correctAnswers || 0
    totalWrong += attempt.wrongAnswers || 0
    totalTimeSpent += attempt.totalTimeSec || 0

    const score = attempt.percentage || 0
    averageScore += score
    bestScore = Math.max(bestScore, score)
    worstScore = Math.min(worstScore, score)
  })

  // Calculate section-wise accuracy and average time
  Object.keys(sectionAnalytics).forEach((section) => {
    const data = sectionAnalytics[section]
    data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0
    data.averageTime = data.total > 0 ? data.timeSpent / data.total : 0
    data.attempts = totalTests > 0 ? Math.ceil(data.attempts / totalTests) : 0 // Average questions per test
  })

  // Convert daily analytics to array and sort by date
  const dailyArray = Object.values(dailyAnalytics).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  // Calculate streaks
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Check if user has activity today or yesterday for current streak
  if (dailyAnalytics[today] || dailyAnalytics[yesterday]) {
    currentStreak = 1
    tempStreak = 1
  }

  // Calculate streaks by going through dates
  const sortedDates = Object.keys(dailyAnalytics).sort(
    (a, b) => new Date(b) - new Date(a)
  )
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])
    const dayDiff = (previousDate - currentDate) / (1000 * 60 * 60 * 24)

    if (dayDiff === 1) {
      tempStreak++
      if (i === 1) currentStreak = tempStreak
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Get recent activity (last 7 days)
  const last7Days = dailyArray.slice(0, 7)
  const last30Days = dailyArray.slice(0, 30)

  // Calculate improvement trends
  const improvementTrend =
    last7Days.length >= 2
      ? last7Days[0].averageScore - last7Days[last7Days.length - 1].averageScore
      : 0

  return {
    overview: {
      totalTests,
      totalQuestions,
      totalCorrect,
      totalWrong,
      totalTimeSpent,
      averageScore: totalTests > 0 ? averageScore / totalTests : 0,
      bestScore,
      worstScore,
      currentStreak,
      longestStreak,
      improvementTrend,
    },
    dailyAnalytics: dailyArray,
    sectionAnalytics,
    recentActivity: {
      last7Days,
      last30Days,
    },
    insights: {
      mostActiveSection:
        Object.entries(sectionAnalytics).sort(
          ([, a], [, b]) => b.total - a.total
        )[0]?.[0] || 'None',
      bestPerformingSection:
        Object.entries(sectionAnalytics).sort(
          ([, a], [, b]) => b.accuracy - a.accuracy
        )[0]?.[0] || 'None',
      needsImprovement:
        Object.entries(sectionAnalytics).sort(
          ([, a], [, b]) => a.accuracy - b.accuracy
        )[0]?.[0] || 'None',
      averageTimePerQuestion:
        totalQuestions > 0 ? totalTimeSpent / totalQuestions : 0,
      consistencyScore:
        dailyArray.length > 0
          ? (dailyArray.filter((day) => day.testsAttempted > 0).length /
              Math.max(dailyArray.length, 1)) *
            100
          : 0,
    },
    hasAttempts: testAttempts.length > 0,
    rawAttempts: testAttempts,
  }
}
