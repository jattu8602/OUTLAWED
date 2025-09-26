import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const questionData = await request.json()

    // Validate required fields
    if (!questionData.questionText?.trim()) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      )
    }

    if (!questionData.section) {
      return NextResponse.json(
        { error: 'Section is required' },
        { status: 400 }
      )
    }

    // Get the next question number for this test
    const lastQuestion = await prisma.question.findFirst({
      where: { testId },
      orderBy: { questionNumber: 'desc' },
      select: { questionNumber: true },
    })

    const nextQuestionNumber = (lastQuestion?.questionNumber || 0) + 1

    // Validate and clean up data based on question type
    if (questionData.questionType === 'OPTIONS') {
      const validOptions = questionData.options.filter((opt) => opt?.trim())
      if (validOptions.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 valid options are required' },
          { status: 400 }
        )
      }

      if (!questionData.correctAnswers?.length) {
        return NextResponse.json(
          { error: 'At least one correct answer is required' },
          { status: 400 }
        )
      }

      // Validate that correct answers exist in options
      const invalidAnswers = questionData.correctAnswers.filter(
        (answer) => !validOptions.includes(answer)
      )
      if (invalidAnswers.length > 0) {
        return NextResponse.json(
          { error: 'Some correct answers are not in the options list' },
          { status: 400 }
        )
      }

      questionData.options = validOptions
    } else if (questionData.questionType === 'INPUT') {
      if (!questionData.inputAnswer?.trim()) {
        return NextResponse.json(
          { error: 'Correct answer is required for input type questions' },
          { status: 400 }
        )
      }
      questionData.correctAnswers = [questionData.inputAnswer.trim()]
      questionData.options = [] // Clear options for input type
    }

    // Clean up table data if present
    if (questionData.isTable && questionData.tableData) {
      const cleanedData = questionData.tableData.data
        .map((row) => row.map((cell) => cell?.trim() || ''))
        .filter((row) => row.some((cell) => cell !== ''))

      if (cleanedData.length === 0) {
        return NextResponse.json(
          { error: 'Table data is required when table is enabled' },
          { status: 400 }
        )
      }

      questionData.tableData = {
        rows: cleanedData.length,
        columns: cleanedData[0].length,
        data: cleanedData,
      }
    } else {
      questionData.tableData = null
    }

    // Handle passage creation or referencing
    let passageId = null
    if (questionData.passageContent?.trim()) {
      // Create new passage
      const lastPassage = await prisma.passage.findFirst({
        where: { testId },
        orderBy: { passageNumber: 'desc' },
        select: { passageNumber: true },
      })

      const nextPassageNumber = (lastPassage?.passageNumber || 0) + 1

      const newPassage = await prisma.passage.create({
        data: {
          testId,
          passageNumber: nextPassageNumber,
          content: questionData.passageContent.trim(),
          contentFormat: questionData.passageFormat || null,
          section: questionData.section,
          hasImage: questionData.passageHasImage || false,
          imageUrls: questionData.passageImageUrls || [],
        },
      })

      passageId = newPassage.id
    } else if (questionData.passageId) {
      // Reference existing passage
      passageId = questionData.passageId
    }

    // Create the question with cleaned data
    const question = await prisma.question.create({
      data: {
        testId,
        questionNumber: nextQuestionNumber,
        questionText: questionData.questionText.trim(),
        questionTextFormat: questionData.questionTextFormat || null,
        imageUrls: questionData.imageUrls?.filter((url) => url?.trim()) || [],
        passageId: passageId, // Link to passage if exists
        isTable: questionData.isTable || false,
        tableData: questionData.tableData,
        questionType: questionData.questionType,
        optionType:
          questionData.questionType === 'OPTIONS'
            ? questionData.optionType
            : null,
        options: questionData.options || [],
        inputAnswer:
          questionData.questionType === 'INPUT'
            ? questionData.inputAnswer?.trim()
            : null,
        correctAnswers: questionData.correctAnswers || [],
        positiveMarks: Number(questionData.positiveMarks) || 1.0,
        negativeMarks: Number(questionData.negativeMarks) || -0.25,
        section: questionData.section,
        explanation: questionData.explanation?.trim() || null,
        explanationFormat: questionData.explanationFormat || null,
      },
    })

    return NextResponse.json({
      success: true,
      question,
      message: 'Question added successfully',
    })
  } catch (error) {
    console.error('Error adding question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params

    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: { questionNumber: 'asc' },
      include: {
        test: {
          select: {
            title: true,
            type: true,
          },
        },
        passage: true, // Include passage information
      },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id: testId } = await params
  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json(
      { message: 'Question ID is required' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const {
      questionText,
      questionTextFormat,
      imageUrls,
      passageId,
      passageContent,
      passageFormat,
      isTable,
      tableData,
      questionType,
      optionType,
      options,
      correctAnswers,
      positiveMarks,
      negativeMarks,
      section,
      explanation,
      explanationFormat,
    } = body

    // Handle passage creation or referencing for updates
    let finalPassageId = null
    if (passageContent?.trim()) {
      // Create new passage
      const lastPassage = await prisma.passage.findFirst({
        where: { testId },
        orderBy: { passageNumber: 'desc' },
        select: { passageNumber: true },
      })

      const nextPassageNumber = (lastPassage?.passageNumber || 0) + 1

      const newPassage = await prisma.passage.create({
        data: {
          testId,
          passageNumber: nextPassageNumber,
          content: passageContent.trim(),
          contentFormat: passageFormat || null,
          section: section,
          hasImage: questionData.passageHasImage || false,
          imageUrls: questionData.passageImageUrls || [],
        },
      })

      finalPassageId = newPassage.id
    } else if (passageId) {
      // Reference existing passage
      finalPassageId = passageId
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText,
        questionTextFormat,
        imageUrls,
        passageId: finalPassageId,
        isTable,
        tableData,
        questionType,
        optionType,
        options,
        correctAnswers,
        positiveMarks,
        negativeMarks,
        section,
        explanation,
        explanationFormat,
      },
    })

    return NextResponse.json({
      message: 'Question updated successfully',
      question: updatedQuestion,
    })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id: testId } = await params
  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json(
      { message: 'Question ID is required' },
      { status: 400 }
    )
  }

  try {
    // Start a transaction to delete the question and re-number subsequent questions
    await prisma.$transaction(async (prisma) => {
      const questionToDelete = await prisma.question.findUnique({
        where: { id: questionId },
      })

      if (!questionToDelete) {
        throw new Error('Question not found')
      }

      await prisma.question.delete({
        where: { id: questionId },
      })

      // Update question numbers of subsequent questions in the same test
      await prisma.question.updateMany({
        where: {
          testId: testId,
          questionNumber: {
            gt: questionToDelete.questionNumber,
          },
        },
        data: {
          questionNumber: {
            decrement: 1,
          },
        },
      })
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    if (error.message === 'Question not found') {
      return NextResponse.json(
        { message: 'Question not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
