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

    const lexiaTest = await prisma.lexiaTest.findUnique({
      where: {
        id: lexiaTestId,
        userId: session.user.id, // Ensure user can only access their own tests
      },
    })

    if (!lexiaTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Fetch questions and passages based on stored IDs
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

    // Sort questions based on the order in lexiaTest.questionIds and assign sequential numbers
    const sortedQuestions = lexiaTest.questionIds
      .map((id, index) => {
        const question = questions.find((q) => q.id === id)
        if (question) {
          return {
            ...question,
            questionNumber: index + 1, // Sequential numbering starting from 1
          }
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json(
      { test: lexiaTest, questions: sortedQuestions, passages },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching Lexia test:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
