import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE a test from a series
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id: testSeriesId, testId } = await params

    await prisma.testsOnTestSeries.delete({
      where: {
        testId_testSeriesId: {
          testId: testId,
          testSeriesId: testSeriesId,
        },
      },
    })

    return NextResponse.json(
      { message: 'Test removed from series' },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      `Error removing test ${params.testId} from series ${params.id}:`,
      error
    )
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
