import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { testId, analysis } = await request.json()

    if (!testId || !analysis) {
      return NextResponse.json(
        { error: 'testId and analysis are required' },
        { status: 400 }
      )
    }

    // Verify test exists
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const createdPassages = []
    const createdQuestions = []

    // Process each section
    for (const section of analysis.sections) {
      // Process each passage in the section
      for (const passageData of section.passages) {
        // Create passage
        const passage = await prisma.passage.create({
          data: {
            testId,
            passageNumber: passageData.passageNumber,
            content: passageData.content,
            contentFormat: passageData.contentFormat || null, // Store rich text formatting if available
            section: section.name,
            hasImage: passageData.hasImage || false,
            imageUrls: passageData.imageUrls || [],
            isTable: passageData.isTable || false,
            tableData: passageData.tableData || null,
          },
        })

        createdPassages.push(passage)

        // Create questions for this passage
        for (const questionData of passageData.questions) {
          // Get next question number for this test
          const lastQuestion = await prisma.question.findFirst({
            where: { testId },
            orderBy: { questionNumber: 'desc' },
            select: { questionNumber: true },
          })

          const nextQuestionNumber = (lastQuestion?.questionNumber || 0) + 1

          // Determine question type and option type
          const questionType =
            questionData.options && questionData.options.length > 0
              ? 'OPTIONS'
              : 'INPUT'
          const optionType = questionType === 'OPTIONS' ? 'SINGLE' : null

          // Process correct answer
          let correctAnswers = []
          if (questionData.correctAnswer) {
            if (questionType === 'OPTIONS') {
              // Find the correct option text
              const correctOption = questionData.options.find(
                (option) =>
                  option
                    .toLowerCase()
                    .includes(questionData.correctAnswer.toLowerCase()) ||
                  questionData.correctAnswer
                    .toLowerCase()
                    .includes(option.toLowerCase())
              )
              correctAnswers = correctOption
                ? [correctOption]
                : [questionData.correctAnswer]
            } else {
              correctAnswers = [questionData.correctAnswer]
            }
          }

          // Create question
          const question = await prisma.question.create({
            data: {
              testId,
              passageId: passage.id,
              questionNumber: nextQuestionNumber,
              questionText: questionData.questionText,
              questionTextFormat: null,
              imageUrls: [],
              isTable: questionData.isTable || false,
              tableData: questionData.tableData || null,
              questionType,
              optionType,
              options: questionData.options || [],
              inputAnswer:
                questionType === 'INPUT' ? questionData.correctAnswer : null,
              correctAnswers,
              positiveMarks: 1.0,
              negativeMarks: -0.25,
              section: section.name,
              explanation: questionData.explanation || null,
              explanationFormat: null,
            },
          })

          createdQuestions.push(question)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test content imported successfully',
      summary: {
        passagesCreated: createdPassages.length,
        questionsCreated: createdQuestions.length,
        sectionsProcessed: analysis.sections.length,
      },
      data: {
        passages: createdPassages,
        questions: createdQuestions,
      },
    })
  } catch (error) {
    console.error('Error importing analyzed content:', error)
    return NextResponse.json(
      { error: 'Failed to import content', details: error.message },
      { status: 500 }
    )
  }
}
