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

    // Generate AI recommendations
    const aiRecommendations = await generateAIRecommendations(
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

async function generateAIRecommendations(
  analytics,
  allTests,
  attemptedTestIds
) {
  try {
    // Filter available tests (not attempted this week)
    const availableTests = allTests.filter(
      (test) => !attemptedTestIds.has(test.id)
    )

    // Create a concise list of available tests for the AI context
    const testMenu = availableTests.map((test) => {
      const lastAttempt = test.testAttempts[0] // It's the latest one
      return {
        id: test.id,
        title: test.title,
        sections: [...new Set(test.questions.map((q) => q.section))],
        lastScore:
          lastAttempt && typeof lastAttempt.percentage === 'number'
            ? `${lastAttempt.percentage.toFixed(1)}%`
            : 'Not Attempted',
      }
    })

    // Prepare context for AI
    const context = `You are an expert CLAT tutor. A student needs a personalized 7-day study schedule.

Student's Performance Summary:
- Average Score: ${analytics.averageScore.toFixed(1)}%
- Strongest Section: ${analytics.strongSections}
- Weakest Section: ${analytics.weakSections}

Here is a menu of available tests for the week. Some may have been attempted before, and their last score is listed.
Test Menu:
${JSON.stringify(testMenu, null, 2)}

Your task is to create a 7-day study plan (Monday to Sunday).
- DO NOT repeat any test from the menu within the week.
- Choose tests that specifically target the student's WEAKEST section.
- Include 1-2 tests for their STRONGEST section to maintain it.
- Fill the rest of the week with varied tests.
- The "focus" and "reason" for each day must be specific and directly related to the test chosen and the student's performance data.

Return a single JSON object in the specified format.
`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: context,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorBody}`)
    }

    const data = await response.json()
    const aiResponseText = data.candidates[0].content.parts[0].text
    console.log('Gemini RAW Response:', aiResponseText) // For debugging
    const aiResponse = JSON.parse(aiResponseText)

    // Map AI recommendations to actual tests
    const usedTestIds = new Set() // Track used tests to prevent repetition

    // Handle different AI response formats
    let scheduleArray = []
    if (Array.isArray(aiResponse)) {
      // AI returned array directly
      scheduleArray = aiResponse
    } else if (aiResponse.studyPlan) {
      scheduleArray = aiResponse.studyPlan
    } else if (aiResponse.study_schedule) {
      scheduleArray = aiResponse.study_schedule
    } else if (aiResponse.weeklySchedule) {
      scheduleArray = aiResponse.weeklySchedule
    }

    console.log('Processing schedule array:', {
      isArray: Array.isArray(aiResponse),
      scheduleArrayLength: scheduleArray.length,
      firstItem: scheduleArray[0],
    })

    const weeklySchedule = scheduleArray.map((day, index) => {
      // Find a suitable test for this day
      // First, try to find a test that matches the one AI recommended by title
      const suitableTests = availableTests.filter((test) => {
        const testSections = [...new Set(test.questions.map((q) => q.section))]
        return testSections.some(
          (section) =>
            analytics.weakSections.includes(section) ||
            analytics.strongSections.includes(section)
        )
      })

      // Handle different AI response formats for test data
      let testId = null
      let testTitle = null

      if (day.test && day.test.id) {
        // New format: test data is nested under 'test' property
        testId = day.test.id
        testTitle = day.test.title
      } else {
        // Old format: test data is directly on day object
        testId = day.test_id || day.testId || null
        testTitle = day.test_title || day.testTitle || null
      }

      let selectedTest = availableTests.find((t) => t.id === testId)

      // Check if the AI-recommended test is already used
      if (selectedTest && usedTestIds.has(selectedTest.id)) {
        selectedTest = null // Reset if already used
      }

      // Fallback: If no test is found by ID (AI might hallucinate), find one with a matching title or use a suitable one.
      if (!selectedTest) {
        // First try to find by title (if not already used)
        const titleMatch = availableTests.find(
          (t) => t.title === testTitle && !usedTestIds.has(t.id)
        )

        if (titleMatch) {
          selectedTest = titleMatch
        } else {
          // Find first suitable test that hasn't been used
          selectedTest =
            suitableTests.find((test) => !usedTestIds.has(test.id)) ||
            availableTests.find((test) => !usedTestIds.has(test.id))
        }
      }

      // Mark this test as used
      if (selectedTest) {
        usedTestIds.add(selectedTest.id)
      }

      if (!selectedTest) {
        // If still no test, it's a fallback for an empty test bank
        return {
          day: day.day,
          date: getDateForDay(index),
          testId: null,
          testTitle: 'No test available for this recommendation',
          testType: 'FREE',
          durationInMinutes: 0,
          sections: [],
          focus: 'N/A',
          reason: 'Please add more tests to the database.',
          difficulty: 'N/A',
          isAttempted: false,
          lastScore: null,
          completed: false,
        }
      }

      return {
        day: day.day,
        date: getDateForDay(index),
        testId: selectedTest.id,
        testTitle: selectedTest.title,
        testType: selectedTest.type,
        durationInMinutes: selectedTest.durationInMinutes,
        sections: [...new Set(selectedTest.questions.map((q) => q.section))],
        focus: day.focus || 'General Practice',
        reason: day.reason || 'Recommended for your current level',
        difficulty: day.difficulty || 'Intermediate',
        isAttempted: selectedTest.testAttempts.length > 0,
        lastScore: selectedTest.testAttempts[0]?.percentage || null,
        completed: false, // Add completion status
      }
    })

    return {
      weeklySchedule,
      insights: aiResponse.insights || {
        overallPerformance:
          'Your personalized study schedule has been generated based on your performance data.',
        strengths: ['Your strong areas have been identified'],
        weaknesses: ['Focus areas for improvement have been highlighted'],
        recommendations: [
          'Follow the daily schedule to improve your performance',
        ],
      },
      recommendations: aiResponse.insights?.recommendations || [],
    }
  } catch (error) {
    console.error('Error generating AI recommendations:', error)

    // Fallback: Generate basic schedule without AI
    const availableTests = allTests.filter(
      (test) => !attemptedTestIds.has(test.id)
    )

    // Ensure no repetition in fallback schedule
    const usedTestIds = new Set()
    const weeklySchedule = Array.from({ length: 7 }, (_, index) => {
      // Find next available test that hasn't been used
      let test = availableTests.find((t) => !usedTestIds.has(t.id))

      if (test) {
        usedTestIds.add(test.id)
      }

      const days = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]

      return {
        day: days[index],
        date: getDateForDay(index),
        testId: test?.id || null,
        testTitle: test?.title || 'No test available',
        testType: test?.type || 'FREE',
        durationInMinutes: test?.durationInMinutes || 60,
        sections: test
          ? [...new Set(test.questions.map((q) => q.section))]
          : [],
        focus: 'General Practice',
        reason: 'Recommended for your current level',
        difficulty: 'Intermediate',
        isAttempted: test?.testAttempts?.length > 0 || false,
        lastScore: test?.testAttempts?.[0]?.percentage || null,
        completed: false, // Add completion status to fallback
      }
    })

    return {
      weeklySchedule,
      insights: {
        overallPerformance:
          "A brief, encouraging summary of the user's performance (3-4 sentences). Mention their strongest subject as a positive point and celebrate their progress. Then, gently point out their weakest subject as an area for growth. Conclude with a motivational sentence about the upcoming week's plan.",
        strengths: [
          "List 2-3 of the user's strongest subjects or topics, framed as accomplishments.",
        ],
        weaknesses: [
          "List 2-3 of the user's weakest subjects or topics, framed as opportunities for growth.",
        ],
        recommendations: [
          "Provide 3 unique, actionable, and specific recommendations for the week. For example, instead of 'Practice more', suggest 'Focus on identifying trap answers in Logical Reasoning questions this week.'",
        ],
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
