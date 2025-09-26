import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { SectionType } from '@prisma/client'

const prisma = new PrismaClient()

const MOCK_TEST_CONFIG = {
  [SectionType.ENGLISH]: {
    questions: { min: 24, max: 30 },
    passages: { min: 4, max: 6 },
  },
  [SectionType.GK_CA]: {
    questions: { min: 28, max: 35 },
    passages: { min: 5, max: 7 },
  },
  [SectionType.LEGAL_REASONING]: {
    questions: { min: 32, max: 40 },
    passages: { min: 6, max: 8 },
  },
  [SectionType.LOGICAL_REASONING]: {
    questions: { min: 24, max: 30 },
    passages: { min: 4, max: 6 },
  },
  [SectionType.QUANTITATIVE_TECHNIQUES]: {
    questions: { min: 12, max: 18 },
    passages: { min: 2, max: 4 },
  },
}

const SECTIONAL_TEST_CONFIG = {
  [SectionType.ENGLISH]: { questions: 24, passages: 4 },
  [SectionType.GK_CA]: { questions: 28, passages: 5 },
  [SectionType.LEGAL_REASONING]: { questions: 32, passages: 6 },
  [SectionType.LOGICAL_REASONING]: { questions: 24, passages: 4 },
  [SectionType.QUANTITATIVE_TECHNIQUES]: { questions: 12, passages: 2 },
}

// Helper to get a random number within a range
const getRandomCount = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

async function getQuestionsForSection(section, minQuestions, maxPassages) {
  console.log(
    `Generating questions for ${section}: min ${minQuestions} questions, max ${maxPassages} passages`
  )

  // Get all passages for this section with their question counts
  const passages = await prisma.passage.findMany({
    where: { section },
    include: {
      questions: {
        select: { id: true },
      },
    },
  })

  if (passages.length === 0) {
    console.log(`No passages found for section ${section}`)
    return { passageIds: [], questionIds: [] }
  }

  // Shuffle passages randomly for true randomization
  const shuffledPassages = passages.sort(() => Math.random() - 0.5)

  const selectedPassageIds = []
  const selectedQuestionIds = []
  let totalQuestions = 0

  // Select passages randomly until we meet minimum requirements
  for (const passage of shuffledPassages) {
    if (totalQuestions >= minQuestions) {
      break // We've met the minimum requirement
    }

    if (selectedPassageIds.length >= maxPassages) {
      break // We've reached the maximum passage limit
    }

    // Add this passage and all its questions
    selectedPassageIds.push(passage.id)
    const passageQuestionIds = passage.questions.map((q) => q.id)
    selectedQuestionIds.push(...passageQuestionIds)
    totalQuestions += passageQuestionIds.length

    console.log(
      `Added passage ${passage.id} with ${passageQuestionIds.length} questions. Total: ${totalQuestions}`
    )
  }

  // If we still haven't met minimum requirements, add more passages
  if (totalQuestions < minQuestions) {
    console.log(
      `Still need ${
        minQuestions - totalQuestions
      } more questions. Adding more passages...`
    )

    for (const passage of shuffledPassages) {
      if (selectedPassageIds.includes(passage.id)) {
        continue // Already selected this passage
      }

      if (totalQuestions >= minQuestions) {
        break // We've met the minimum requirement
      }

      // Add this passage and all its questions
      selectedPassageIds.push(passage.id)
      const passageQuestionIds = passage.questions.map((q) => q.id)
      selectedQuestionIds.push(...passageQuestionIds)
      totalQuestions += passageQuestionIds.length

      console.log(
        `Added additional passage ${passage.id} with ${passageQuestionIds.length} questions. Total: ${totalQuestions}`
      )
    }
  }

  console.log(
    `Final result for ${section}: ${selectedPassageIds.length} passages, ${totalQuestions} questions`
  )

  return {
    passageIds: selectedPassageIds,
    questionIds: selectedQuestionIds,
    totalQuestions,
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id
    const userRole = session.user.role

    // Check test generation limits for free users
    if (userRole === 'FREE') {
      const existingTestsCount = await prisma.lexiaTest.count({
        where: { userId },
      })

      const FREE_USER_LIMIT = 5
      if (existingTestsCount >= FREE_USER_LIMIT) {
        return NextResponse.json(
          {
            error: 'Test generation limit reached',
            message: `Free users can generate up to ${FREE_USER_LIMIT} tests. Please upgrade to Pro for unlimited test generation.`,
            limitReached: true,
            currentCount: existingTestsCount,
            limit: FREE_USER_LIMIT,
          },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const { type, section } = body

    if (!type || (type === 'SECTIONAL' && !section)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    let title
    let durationInMinutes = 0
    let allQuestionIds = []
    let allPassageIds = []

    if (type === 'MOCK') {
      title = `Lexia Mock Test - ${new Date().toLocaleDateString()}`
      durationInMinutes = 120

      console.log('Generating MOCK test with passage-based approach...')

      for (const sectionKey of Object.values(SectionType)) {
        if (MOCK_TEST_CONFIG[sectionKey]) {
          const config = MOCK_TEST_CONFIG[sectionKey]
          const minQuestions = config.questions.min
          const maxPassages = config.passages.max

          console.log(
            `Processing section ${sectionKey}: min ${minQuestions} questions, max ${maxPassages} passages`
          )

          const { passageIds, questionIds, totalQuestions } =
            await getQuestionsForSection(sectionKey, minQuestions, maxPassages)

          allPassageIds.push(...passageIds)
          allQuestionIds.push(...questionIds)

          console.log(
            `Section ${sectionKey} completed: ${passageIds.length} passages, ${totalQuestions} questions`
          )
        }
      }
    } else if (type === 'SECTIONAL') {
      if (!Object.values(SectionType).includes(section)) {
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
      }
      title = `Lexia Sectional: ${section} - ${new Date().toLocaleDateString()}`
      const config = SECTIONAL_TEST_CONFIG[section]
      durationInMinutes = Math.ceil(config.questions * 1.5) // Approximate time

      console.log(
        `Generating SECTIONAL test for ${section} with passage-based approach...`
      )

      const { passageIds, questionIds, totalQuestions } =
        await getQuestionsForSection(section, config.questions, config.passages)

      allPassageIds = passageIds
      allQuestionIds = questionIds

      console.log(
        `Sectional test completed: ${passageIds.length} passages, ${totalQuestions} questions`
      )
    } else {
      return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    // Validate minimum requirements
    if (allQuestionIds.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate test. Not enough questions in DB.' },
        { status: 500 }
      )
    }

    // Check if we met minimum requirements for mock tests
    if (type === 'MOCK') {
      const totalQuestions = allQuestionIds.length
      const minTotalQuestions = 120 // Minimum for mock test

      if (totalQuestions < minTotalQuestions) {
        console.warn(
          `Warning: Generated only ${totalQuestions} questions, minimum is ${minTotalQuestions}`
        )
        // We'll still proceed but log the warning
      }

      console.log(`Mock test generated: ${totalQuestions} total questions`)
    }

    // Check if we met minimum requirements for sectional tests
    if (type === 'SECTIONAL') {
      const totalQuestions = allQuestionIds.length
      const expectedMin = SECTIONAL_TEST_CONFIG[section].questions

      if (totalQuestions < expectedMin) {
        console.warn(
          `Warning: Generated only ${totalQuestions} questions for ${section}, minimum is ${expectedMin}`
        )
        // We'll still proceed but log the warning
      }

      console.log(
        `Sectional test generated: ${totalQuestions} questions for ${section}`
      )
    }

    const lexiaTest = await prisma.lexiaTest.create({
      data: {
        userId,
        title,
        type,
        section: type === 'SECTIONAL' ? section : null,
        durationInMinutes,
        passageIds: allPassageIds,
        questionIds: allQuestionIds,
      },
    })

    return NextResponse.json(lexiaTest, { status: 201 })
  } catch (error) {
    console.error('Error generating Lexia test:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
