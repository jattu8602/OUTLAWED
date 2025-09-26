import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET a single test series by ID
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const testSeries = await prisma.testSeries.findUnique({
      where: { id },
      include: {
        tests: {
          include: {
            test: true,
          },
          orderBy: {
            addedAt: 'asc',
          },
        },
      },
    })

    if (!testSeries) {
      return NextResponse.json(
        { error: 'Test series not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(testSeries)
  } catch (error) {
    console.error(`Error fetching test series ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// UPDATE a test series
export async function PUT(req, { params }) {
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

    const updatedTestSeries = await prisma.testSeries.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        isPublished,
      },
    })

    return NextResponse.json(updatedTestSeries)
  } catch (error) {
    console.error(`Error updating test series ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE a test series
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Need to delete related TestsOnTestSeries first
    await prisma.testsOnTestSeries.deleteMany({
      where: { testSeriesId: params.id },
    })

    await prisma.testSeries.delete({
      where: { id: params.id },
    })

    return NextResponse.json(
      { message: 'Test series deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error(`Error deleting test series ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Add a test to a series
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { testId } = body

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      )
    }

    const series = await prisma.testsOnTestSeries.create({
      data: {
        testSeriesId: params.id,
        testId: testId,
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error(`Error adding test to series ${params.id}:`, error)
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Test already exists in this series' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
