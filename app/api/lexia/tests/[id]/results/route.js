import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: lexiaTestId } = await params
    const attemptId = new URL(request.url).searchParams.get('attemptId')

    console.log('Results request for test:', lexiaTestId, 'attempt:', attemptId)

    if (!attemptId) {
      console.error('Attempt ID is missing in results request')
      return NextResponse.json(
        { error: 'Attempt ID is required' },
        { status: 400 }
      )
    }

    const testAttempt = await prisma.lexiaTestAttempt.findUnique({
      where: {
        id: attemptId,
        userId: session.user.id,
        lexiaTestId: lexiaTestId,
      },
      include: {
        lexiaTest: true,
      },
    })

    console.log('Database query result:', {
      found: !!testAttempt,
      attemptId,
      userId: session.user.id,
      lexiaTestId,
    })

    console.log('Found test attempt:', testAttempt ? 'Yes' : 'No')
    if (testAttempt) {
      console.log('Raw attempt details from DB:', {
        id: testAttempt.id,
        completed: testAttempt.completed,
        score: testAttempt.score,
        percentage: testAttempt.percentage,
        lexiaTestId: testAttempt.lexiaTestId,
        correctAnswers: testAttempt.correctAnswers,
        wrongAnswers: testAttempt.wrongAnswers,
        totalQuestions: testAttempt.totalQuestions,
        totalAttempted: testAttempt.totalAttempted,
        totalTimeSec: testAttempt.totalTimeSec,
        unattempted: testAttempt.unattempted,
      })

      // Check if any critical fields are missing
      const missingFields = []
      if (testAttempt.score === null || testAttempt.score === undefined)
        missingFields.push('score')
      if (
        testAttempt.percentage === null ||
        testAttempt.percentage === undefined
      )
        missingFields.push('percentage')
      if (
        testAttempt.correctAnswers === null ||
        testAttempt.correctAnswers === undefined
      )
        missingFields.push('correctAnswers')
      if (
        testAttempt.wrongAnswers === null ||
        testAttempt.wrongAnswers === undefined
      )
        missingFields.push('wrongAnswers')
      if (
        testAttempt.totalQuestions === null ||
        testAttempt.totalQuestions === undefined
      )
        missingFields.push('totalQuestions')
      if (
        testAttempt.totalTimeSec === null ||
        testAttempt.totalTimeSec === undefined
      )
        missingFields.push('totalTimeSec')

      if (missingFields.length > 0) {
        console.warn('Missing fields in test attempt:', missingFields)
      }

      // Check if the attempt is completed
      if (!testAttempt.completed) {
        console.warn('Test attempt is not marked as completed!')
      }
    }

    if (!testAttempt) {
      console.error('Test attempt not found for:', {
        attemptId,
        userId: session.user.id,
        lexiaTestId,
      })
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    const { lexiaTest } = testAttempt

    const questions = await prisma.question.findMany({
      where: {
        id: { in: lexiaTest.questionIds },
      },
    })

    const passages = await prisma.passage.findMany({
      where: {
        id: { in: lexiaTest.passageIds },
      },
    })

    const answers = testAttempt.answers || {}

    const questionsWithUserAnswers = questions.map((q) => {
      const userAnswer = answers[q.id] || []

      // Normalize user answer to array format for comparison
      const normalizedUserAnswer = Array.isArray(userAnswer)
        ? userAnswer
        : userAnswer
        ? [userAnswer]
        : []
      const correctAnswersSet = new Set(q.correctAnswers)
      const userAnswerSet = new Set(normalizedUserAnswer)

      console.log(`Results - Question ${q.id}:`, {
        correctAnswers: q.correctAnswers,
        userAnswer: userAnswer,
        normalizedUserAnswer: normalizedUserAnswer,
        correctAnswersSet: Array.from(correctAnswersSet),
        userAnswerSet: Array.from(userAnswerSet),
      })

      const isCorrect =
        correctAnswersSet.size === userAnswerSet.size &&
        [...correctAnswersSet].every((val) => userAnswerSet.has(val))

      console.log(`Results - Question ${q.id} isCorrect:`, isCorrect)

      // Calculate marks obtained for this question
      let marksObtained = 0
      if (normalizedUserAnswer.length > 0) {
        if (isCorrect) {
          marksObtained = q.positiveMarks
        } else {
          marksObtained = q.negativeMarks
        }
      }

      // Get time taken for this question from questionTimes
      const timeTakenSec = testAttempt.questionTimes?.[q.id] || 0

      return {
        ...q,
        userAnswer,
        isCorrect: normalizedUserAnswer.length > 0 ? isCorrect : null,
        marksObtained,
        timeTakenSec,
      }
    })

    const sortedQuestions = lexiaTest.questionIds
      .map((id, index) => {
        const question = questionsWithUserAnswers.find((q) => q.id === id)
        if (question) {
          return {
            ...question,
            questionNumber: index + 1, // Sequential numbering starting from 1
          }
        }
        return null
      })
      .filter(Boolean)

    // Transform testAttempt to ensure all fields have proper values
    const transformedTestAttempt = {
      ...testAttempt,
      score: testAttempt.score || 0,
      percentage: testAttempt.percentage || 0,
      correctAnswers: testAttempt.correctAnswers || 0,
      wrongAnswers: testAttempt.wrongAnswers || 0,
      unattempted: testAttempt.unattempted || 0,
      totalQuestions: testAttempt.totalQuestions || 0,
      totalAttempted: testAttempt.totalAttempted || 0,
      totalTimeSec: testAttempt.totalTimeSec || 0,
    }

    console.log('Transformed attempt details:', {
      score: transformedTestAttempt.score,
      percentage: transformedTestAttempt.percentage,
      correctAnswers: transformedTestAttempt.correctAnswers,
      wrongAnswers: transformedTestAttempt.wrongAnswers,
      totalQuestions: transformedTestAttempt.totalQuestions,
      totalTimeSec: transformedTestAttempt.totalTimeSec,
    })

    return NextResponse.json({
      test: lexiaTest,
      testAttempt: transformedTestAttempt,
      questions: sortedQuestions,
      passages,
    })
  } catch (error) {
    console.error('Failed to get test results:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
