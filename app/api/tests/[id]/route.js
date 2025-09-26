import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch test with questions and passages
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        passages: {
          orderBy: { passageNumber: 'asc' },
        },
        questions: {
          orderBy: { questionNumber: 'asc' },
          include: {
            passage: true,
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Check if user has access to this test
    if (test.type === 'PAID') {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, paidUntil: true },
      })

      if (
        user.role === 'FREE' ||
        (user.role === 'PAID' && user.paidUntil < new Date())
      ) {
        return NextResponse.json(
          { error: 'Access denied. Premium subscription required.' },
          { status: 403 }
        )
      }
    }

    // Check if test is active
    if (!test.isActive) {
      return NextResponse.json({ error: 'Test is not active' }, { status: 400 })
    }

    // Check if user has already attempted this test
    const existingAttempt = await prisma.testAttempt.findFirst({
      where: {
        testId: id,
        userId: session.user.id,
        completed: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // If this is a re-attempt, check if it's allowed
    if (existingAttempt) {
      // For now, allow re-attempts. You can add logic here to restrict re-attempts
      // For example: only allow re-attempts after a certain time period
    }

    // Transform questions to include section information
    const transformedQuestions = test.questions.map((question) => ({
      id: question.id,
      questionNumber: question.questionNumber,
      questionText: question.questionText,
      questionTextFormat: question.questionTextFormat,
      imageUrls: question.imageUrls,
      passageId: question.passageId,
      isTable: question.isTable,
      tableData: question.tableData,
      questionType: question.questionType,
      optionType: question.optionType,
      options: question.options,
      inputAnswer: question.inputAnswer,
      correctAnswers: question.correctAnswers,
      positiveMarks: question.positiveMarks,
      negativeMarks: question.negativeMarks,
      section: question.section,
      explanation: question.explanation,
      explanationFormat: question.explanationFormat,
    }))

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        type: test.type,
        durationInMinutes: test.durationInMinutes,
        positiveMarks: test.positiveMarks,
        negativeMarks: test.negativeMarks,
        isActive: test.isActive,
        createdAt: test.createdAt,
      },
      passages: test.passages,
      questions: transformedQuestions,
      totalQuestions: transformedQuestions.length,
    })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
