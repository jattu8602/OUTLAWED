import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, type, isPublished } = body

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      )
    }

    const testSeries = await prisma.testSeries.create({
      data: {
        title,
        description,
        type,
        isPublished,
      },
    })

    return NextResponse.json(testSeries, { status: 201 })
  } catch (error) {
    console.error('Error creating test series:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const testSeries = await prisma.testSeries.findMany({
      include: {
        tests: {
          include: {
            test: true,
          },
        },
        _count: {
          select: { tests: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(testSeries)
  } catch (error) {
    console.error('Error fetching test series:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
