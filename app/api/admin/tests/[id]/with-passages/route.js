import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        passages: {
          orderBy: { passageNumber: 'asc' },
          include: {
            questions: {
              orderBy: { questionNumber: 'asc' },
            },
          },
        },
        questions: {
          where: { passageId: null }, // Standalone questions not linked to passages
          orderBy: { questionNumber: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            passages: true,
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    console.log('API: Returning passages:', test.passages?.length || 0)
    console.log(
      'API: Passage details:',
      test.passages?.map((p) => ({
        id: p.id,
        passageNumber: p.passageNumber,
        section: p.section,
      }))
    )

    return NextResponse.json({
      test,
      passages: test.passages || [],
    })
  } catch (error) {
    console.error('Error fetching test with passages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
