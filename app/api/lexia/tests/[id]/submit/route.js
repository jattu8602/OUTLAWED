import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// This scoring logic is adapted from lib/utils/scoringUtils.js
async function calculateLexiaScore(
  attemptId,
  answers,
  timeSpent,
  questionTimes
) {
  const attempt = await prisma.lexiaTestAttempt.findUnique({
    where: { id: attemptId },
    include: { lexiaTest: true },
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  const questions = await prisma.question.findMany({
    where: {
      id: { in: attempt.lexiaTest.questionIds },
    },
  })

  let score = 0
  let correctAnswers = 0
  let wrongAnswers = 0
  let totalAttempted = 0

  for (const question of questions) {
    const userAnswer = answers[question.id]
    if (
      userAnswer &&
      (Array.isArray(userAnswer)
        ? userAnswer.length > 0
        : userAnswer.trim() !== '')
    ) {
      totalAttempted++

      // Normalize user answer to array format
      const normalizedUserAnswer = Array.isArray(userAnswer)
        ? userAnswer
        : [userAnswer]
      const correctAnswersSet = new Set(question.correctAnswers)
      const userAnswerSet = new Set(normalizedUserAnswer)

      console.log(`Question ${question.id}:`, {
        correctAnswers: question.correctAnswers,
        userAnswer: userAnswer,
        normalizedUserAnswer: normalizedUserAnswer,
        correctAnswersSet: Array.from(correctAnswersSet),
        userAnswerSet: Array.from(userAnswerSet),
      })

      const isCorrect =
        correctAnswersSet.size === userAnswerSet.size &&
        [...correctAnswersSet].every((val) => userAnswerSet.has(val))

      console.log(`Question ${question.id} isCorrect:`, isCorrect)

      if (isCorrect) {
        score += question.positiveMarks
        correctAnswers++
      } else {
        score -= question.negativeMarks
        wrongAnswers++
      }
    }
  }

  const totalQuestions = questions.length
  const maxMarks = questions.reduce((sum, q) => sum + q.positiveMarks, 0)
  const percentage = maxMarks > 0 ? (score / maxMarks) * 100 : 0
  const unattempted = totalQuestions - totalAttempted

  const updatedAttempt = await prisma.lexiaTestAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      percentage: Number(Math.max(0, percentage).toFixed(2)),
      correctAnswers,
      wrongAnswers,
      unattempted,
      totalAttempted,
      completed: true,
      completedAt: new Date(),
      totalTimeSec: timeSpent,
      answers,
      questionTimes,
    },
  })

  return updatedAttempt
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: lexiaTestId } = await params
    const body = await request.json()
    const { answers, timeSpent, questionTimes, attemptId } = body

    console.log('Submit request for test:', lexiaTestId)
    console.log('Attempt ID:', attemptId)
    console.log('Answers count:', Object.keys(answers || {}).length)

    if (!attemptId) {
      console.error('Attempt ID is missing in submit request')
      return NextResponse.json(
        { error: 'Attempt ID is missing.' },
        { status: 400 }
      )
    }

    // Ensure the user owns this attempt
    const attempt = await prisma.lexiaTestAttempt.findFirst({
      where: {
        id: attemptId,
        userId: session.user.id,
        lexiaTestId: lexiaTestId,
      },
    })

    if (!attempt) {
      return NextResponse.json(
        {
          error:
            'Attempt not found or you do not have permission to submit it.',
        },
        { status: 404 }
      )
    }

    if (attempt.completed) {
      return NextResponse.json(
        { error: 'This attempt has already been submitted.' },
        { status: 400 }
      )
    }

    const results = await calculateLexiaScore(
      attemptId,
      answers,
      timeSpent,
      questionTimes
    )

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    console.error('Error submitting Lexia test:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
