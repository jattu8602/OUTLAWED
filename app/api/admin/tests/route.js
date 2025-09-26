import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized access attempt:', {
        hasSession: !!session,
        userRole: session?.user?.role,
        isAdmin: session?.user?.isAdmin,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, keyTopic, type, durationInMinutes } = await request.json()

    if (!title || !type || !durationInMinutes) {
      return NextResponse.json(
        {
          error: 'Title, type, and duration are required',
        },
        { status: 400 }
      )
    }

    const test = await prisma.test.create({
      data: {
        title,
        keyTopic,
        type,
        durationInMinutes,
        isActive: false, // New tests are created as drafts
      },
    })

    console.log('Test created successfully:', {
      id: test.id,
      title: test.title,
    })

    return NextResponse.json({
      message: 'Test created successfully',
      testId: test.id,
    })
  } catch (error) {
    console.error('Error creating test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const where = {}
    if (type) where.type = type
    if (isActive !== null) where.isActive = isActive === 'true'

    const tests = await prisma.test.findMany({
      where,
      include: {
        questions: {
          select: {
            id: true,
            section: true,
          },
        },
        _count: {
          select: {
            questions: true,
            testAttempts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Error fetching tests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
