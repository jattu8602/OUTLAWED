import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'
import { calculateUserAnalytics } from '@/lib/analytics'

const prisma = new PrismaClient()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Helper to get the start of the current week (Monday)
const getStartOfWeek = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function GET(req) {
  console.log('Using OpenAI API Key:', process.env.OPENAI_API_KEY) // Diagnostic log
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const forceRefresh = searchParams.get('force') === 'true'

    const userId = session.user.id
    const startOfWeek = getStartOfWeek()

    // 1. Check for a cached schedule for the current week unless forceRefresh is true
    if (!forceRefresh) {
      const cachedSchedule = await prisma.personalizedSchedule.findUnique({
        where: {
          userId_weekStartDate: {
            userId,
            weekStartDate: startOfWeek,
          },
        },
      })

      if (cachedSchedule) {
        console.log('Using cached schedule:', {
          id: cachedSchedule.id,
          scheduleDataLength: Array.isArray(cachedSchedule.scheduleData)
            ? cachedSchedule.scheduleData.length
            : 'not array',
          hasInsights: !!cachedSchedule.insights,
        })

        return NextResponse.json({
          hasAnalytics: true,
          ...cachedSchedule,
          // Ensure frontend gets the data in the expected format
          weeklySchedule: cachedSchedule.scheduleData,
        })
      }
    }

    // If forceRefresh is true OR no cached schedule is found, execution continues here.
    const analytics = await calculateUserAnalytics(userId)

    // If user has no test attempts, return available tests for analytics
    if (!analytics.hasAttempts) {
      const availableTests = await prisma.test.findMany({
        where: {
          isActive: true,
          type: 'FREE', // Start with free tests for new users
        },
        include: {
          questions: {
            select: {
              section: true,
            },
          },
        },
        take: 7, // Show 7 tests for the week
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json({
        hasAnalytics: false,
        message: 'Complete some tests to get personalized recommendations',
        availableTests: availableTests.map((test) => ({
          id: test.id,
          title: test.title,
          type: test.type,
          durationInMinutes: test.durationInMinutes,
          sections: [...new Set(test.questions.map((q) => q.section))],
        })),
      })
    }

    // Get all available tests for recommendation
    const allTests = await prisma.test.findMany({
      where: {
        isActive: true,
      },
      include: {
        questions: {
          select: {
            section: true,
          },
        },
        testAttempts: {
          where: {
            userId,
            isLatest: true,
          },
          select: {
            id: true,
            completed: true,
            percentage: true,
          },
        },
      },
    })

    // Filter out tests already attempted this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1) // Monday
    weekStart.setHours(0, 0, 0, 0)

    const attemptedThisWeek = analytics.rawAttempts.filter(
      (attempt) => new Date(attempt.completedAt) >= weekStart
    )
    const attemptedTestIds = new Set(attemptedThisWeek.map((a) => a.testId))

    // Prepare analytics data for AI
    const analyticsData = {
      sectionPerformance: analytics.sectionAnalytics,
      totalTests: analytics.overview.totalTests,
      averageScore: analytics.overview.averageScore,
      weakSections: analytics.insights.needsImprovement,
      strongSections: analytics.insights.bestPerformingSection,
    }

    // Generate algorithmic recommendations (no AI)
    const aiRecommendations = await generateAlgorithmicRecommendations(
      analyticsData,
      allTests,
      attemptedTestIds
    )

    // Use upsert to create a new schedule or update the existing one for the week
    console.log('Saving to database:', {
      userId,
      weekStartDate: startOfWeek,
      scheduleDataLength: aiRecommendations.weeklySchedule.length,
      insightsKeys: Object.keys(aiRecommendations.insights),
    })

    const newSchedule = await prisma.personalizedSchedule.upsert({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: startOfWeek,
        },
      },
      update: {
        scheduleData: aiRecommendations.weeklySchedule,
        insights: aiRecommendations.insights,
        recommendations: aiRecommendations.recommendations,
      },
      create: {
        userId,
        weekStartDate: startOfWeek,
        scheduleData: aiRecommendations.weeklySchedule,
        insights: aiRecommendations.insights,
        recommendations: aiRecommendations.recommendations,
      },
    })

    console.log('Database save result:', {
      id: newSchedule.id,
      scheduleDataLength: Array.isArray(newSchedule.scheduleData)
        ? newSchedule.scheduleData.length
        : 'not array',
      hasInsights: !!newSchedule.insights,
    })

    return NextResponse.json({
      hasAnalytics: true,
      ...newSchedule,
      // Ensure frontend gets the data in the expected format
      weeklySchedule: aiRecommendations.weeklySchedule,
    })
  } catch (error) {
    console.error('Error generating schedule:', error)
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function generateAlgorithmicRecommendations(
  analytics,
  allTests,
  attemptedTestIds
) {
  try {
    // Filter available tests (not attempted this week)
    let availableTests = allTests.filter(
      (test) => !attemptedTestIds.has(test.id)
    )

    // If we don't have enough tests for the week, include some attempted tests
    if (availableTests.length < 7) {
      console.log(`Only ${availableTests.length} tests available, including some attempted tests`)
      const attemptedTests = allTests.filter(
        (test) => attemptedTestIds.has(test.id)
      )
      availableTests = [...availableTests, ...attemptedTests.slice(0, 7 - availableTests.length)]
    }

    console.log('Available tests for schedule:', {
      totalTests: availableTests.length,
      testTitles: availableTests.map(t => t.title)
    })

    // Algorithmic test selection based on performance data
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const usedTestIds = new Set()
    const weeklySchedule = []

    // Get tests by section for targeted selection
    const testsBySection = {
      weak: availableTests.filter(test => {
        const testSections = [...new Set(test.questions.map(q => q.section))]
        return testSections.some(section => analytics.weakSections.includes(section))
      }),
      strong: availableTests.filter(test => {
        const testSections = [...new Set(test.questions.map(q => q.section))]
        return testSections.some(section => analytics.strongSections.includes(section))
      }),
      other: availableTests.filter(test => {
        const testSections = [...new Set(test.questions.map(q => q.section))]
        return !testSections.some(section => 
          analytics.weakSections.includes(section) || 
          analytics.strongSections.includes(section)
        )
      })
    }

    console.log('Tests by section:', {
      weak: testsBySection.weak.length,
      strong: testsBySection.strong.length,
      other: testsBySection.other.length
    })

    // Generate 7-day schedule algorithmically
    for (let i = 0; i < 7; i++) {
      let selectedTest = null
      let focus = ''
      let reason = ''

      // Day 1-3: Focus on weak sections
      if (i < 3 && testsBySection.weak.length > 0) {
        selectedTest = testsBySection.weak.find(test => !usedTestIds.has(test.id))
        if (selectedTest) {
          focus = `Improving ${analytics.weakSections.join(' and ')} skills`
          reason = `Targeted practice for your weakest areas to build confidence and improve performance`
        }
      }
      
      // Day 4-5: Mix of weak and strong sections
      if (i >= 3 && i < 5) {
        if (i === 3 && testsBySection.weak.length > 0) {
          selectedTest = testsBySection.weak.find(test => !usedTestIds.has(test.id))
          if (selectedTest) {
            focus = `Continued ${analytics.weakSections.join(' and ')} practice`
            reason = `Building on previous day's progress in your focus areas`
          }
        } else if (i === 4 && testsBySection.strong.length > 0) {
          selectedTest = testsBySection.strong.find(test => !usedTestIds.has(test.id))
          if (selectedTest) {
            focus = `Maintaining ${analytics.strongSections.join(' and ')} excellence`
            reason = `Keeping your strong areas sharp while working on improvements`
          }
        }
      }
      
      // Day 6-7: Strong sections and variety
      if (i >= 5) {
        if (i === 5 && testsBySection.strong.length > 0) {
          selectedTest = testsBySection.strong.find(test => !usedTestIds.has(test.id))
          if (selectedTest) {
            focus = `Advanced ${analytics.strongSections.join(' and ')} practice`
            reason = `Pushing your strong areas to the next level`
          }
        } else if (i === 6) {
          // Try other sections or any remaining test
          selectedTest = testsBySection.other.find(test => !usedTestIds.has(test.id)) ||
                        availableTests.find(test => !usedTestIds.has(test.id))
          if (selectedTest) {
            focus = 'Comprehensive practice'
            reason = 'Well-rounded preparation covering all sections'
          }
        }
      }

      // Fallback: Use any available test
      if (!selectedTest) {
        selectedTest = availableTests.find(test => !usedTestIds.has(test.id))
        if (selectedTest) {
          focus = 'General practice'
          reason = 'Maintaining consistent study routine'
        }
      }

      if (selectedTest) {
        usedTestIds.add(selectedTest.id)
        
        weeklySchedule.push({
          day: dayNames[i],
          date: getDateForDay(i),
          testId: selectedTest.id,
          testTitle: selectedTest.title,
          testType: selectedTest.type,
          durationInMinutes: selectedTest.durationInMinutes,
          sections: [...new Set(selectedTest.questions.map(q => q.section))],
          focus: focus,
          reason: reason,
          difficulty: 'Intermediate',
          isAttempted: selectedTest.testAttempts.length > 0,
          lastScore: selectedTest.testAttempts[0]?.percentage || null,
          completed: false,
        })
      } else {
        // No test available
        weeklySchedule.push({
          day: dayNames[i],
          date: getDateForDay(i),
          testId: null,
          testTitle: 'No test available',
          testType: 'FREE',
          durationInMinutes: 0,
          sections: [],
          focus: 'N/A',
          reason: 'Please add more tests to the database.',
          difficulty: 'N/A',
          isAttempted: false,
          lastScore: null,
          completed: false,
        })
      }
    }

    return {
      weeklySchedule,
      insights: {
        overallPerformance: `Your personalized study schedule has been created based on your performance data. Your strongest areas are ${analytics.strongSections.join(' and ')}, while ${analytics.weakSections.join(' and ')} need focused attention. This week's plan balances improvement in weak areas with maintenance of your strengths.`,
        strengths: analytics.strongSections,
        weaknesses: analytics.weakSections,
        recommendations: [
          `Focus on ${analytics.weakSections.join(' and ')} in the first half of the week`,
          `Maintain your ${analytics.strongSections.join(' and ')} skills in the second half`,
          'Take breaks between tests to maintain focus and prevent burnout'
        ],
      },
      recommendations: [
        `Focus on ${analytics.weakSections.join(' and ')} in the first half of the week`,
        `Maintain your ${analytics.strongSections.join(' and ')} skills in the second half`,
        'Take breaks between tests to maintain focus and prevent burnout'
      ],
    }

  } catch (error) {
    console.error('Error generating algorithmic recommendations:', error)

    // Fallback: Generate basic schedule
    const availableTests = allTests.filter(
      (test) => !attemptedTestIds.has(test.id)
    )

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const usedTestIds = new Set()
    const weeklySchedule = []

    for (let i = 0; i < 7; i++) {
      const selectedTest = availableTests.find(test => !usedTestIds.has(test.id))
      
      if (selectedTest) {
        usedTestIds.add(selectedTest.id)
      }

      weeklySchedule.push({
        day: dayNames[i],
        date: getDateForDay(i),
        testId: selectedTest?.id || null,
        testTitle: selectedTest?.title || 'No test available',
        testType: selectedTest?.type || 'FREE',
        durationInMinutes: selectedTest?.durationInMinutes || 0,
        sections: selectedTest ? [...new Set(selectedTest.questions.map(q => q.section))] : [],
        focus: 'General Practice',
        reason: 'Recommended for your current level',
        difficulty: 'Intermediate',
        isAttempted: selectedTest?.testAttempts?.length > 0 || false,
        lastScore: selectedTest?.testAttempts?.[0]?.percentage || null,
        completed: false,
      })
    }

    return {
      weeklySchedule,
      insights: {
        overallPerformance: 'A basic study schedule has been generated. Complete more tests to get personalized recommendations.',
        strengths: ['Complete more tests to identify strengths'],
        weaknesses: ['Complete more tests to identify focus areas'],
        recommendations: ['Take more tests to build a comprehensive profile'],
      },
      recommendations: ['Take more tests to build a comprehensive profile'],
    }
  }
}

function getDateForDay(dayIndex) {
  const today = new Date()
  const currentDay = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)) // Get Monday of current week

  const targetDate = new Date(monday)
  targetDate.setDate(monday.getDate() + dayIndex)

  return targetDate.toISOString().split('T')[0]
}
