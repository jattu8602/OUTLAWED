import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET all published test series for users
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const testSeries = await prisma.testSeries.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { tests: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Here you could also include user-specific progress if needed
    // For now, just returning the series

    return NextResponse.json(testSeries)
  } catch (error) {
    console.error('Error fetching test series for user:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
