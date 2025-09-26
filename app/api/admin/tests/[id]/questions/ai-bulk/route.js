import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { sections } = await request.json()

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections data is required' },
        { status: 400 }
      )
    }

    // Verify test exists and belongs to admin
    const test = await prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Get the next question number
    const existingQuestionCount = test.questions.length
    let questionNumber = existingQuestionCount + 1

    const questionsToCreate = []

    // Process each section
    for (const section of sections) {
      if (
        !section.sectionType ||
        !section.questions ||
        !Array.isArray(section.questions)
      ) {
        continue
      }

      // Validate section type
      const validSectionTypes = [
        'ENGLISH',
        'GK_CA',
        'LEGAL_REASONING',
        'LOGICAL_REASONING',
        'QUANTITATIVE_TECHNIQUES',
      ]
      if (!validSectionTypes.includes(section.sectionType)) {
        continue
      }

      // Process questions in this section
      for (const questionData of section.questions) {
        if (
          !questionData.question ||
          !questionData.options ||
          !Array.isArray(questionData.options)
        ) {
          continue
        }

        // Determine question type and option type
        const questionType = 'OPTIONS' // Default to OPTIONS for now
        const optionType = questionData.options.length > 1 ? 'SINGLE' : 'SINGLE'

        // Process correct answers
        const correctAnswers = []
        if (questionData.correctOption) {
          // Extract the correct option text
          const correctIndex =
            questionData.correctOption.toUpperCase().charCodeAt(0) - 65 // A=0, B=1, etc.
          if (correctIndex >= 0 && correctIndex < questionData.options.length) {
            correctAnswers.push(questionData.options[correctIndex])
          }
        }

        // Create question object
        const question = {
          testId: id,
          questionNumber: questionNumber++,
          questionText: questionData.question.trim(),
          imageUrls: [],
          isComprehension: !!questionData.passage,
          comprehension: questionData.passage || null,
          isTable: false,
          tableData: null,
          questionType,
          optionType,
          options: questionData.options.map((opt) => opt.trim()),
          inputAnswer: null,
          correctAnswers,
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          section: section.sectionType,
          explanation: questionData.explanation || 'Explanation not provided',
        }

        questionsToCreate.push(question)
      }
    }

    if (questionsToCreate.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions to create' },
        { status: 400 }
      )
    }

    // Create all questions in a transaction
    const createdQuestions = await prisma.question.createMany({
      data: questionsToCreate,
    })

    // Update test's updatedAt timestamp
    await prisma.test.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      message: `Successfully created ${createdQuestions.count} questions`,
      questionsCreated: createdQuestions.count,
      totalQuestions: existingQuestionCount + createdQuestions.count,
    })
  } catch (error) {
    console.error('Error creating bulk questions:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
