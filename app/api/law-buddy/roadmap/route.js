import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch user's roadmaps
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roadmaps = await prisma.learningRoadmap.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        roadmapProcesses: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ roadmaps })
  } catch (error) {
    console.error('Error fetching roadmaps:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
      { status: 500 }
    )
  }
}

// POST - Create a new roadmap
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, topic, processes, chatId } = await request.json()

    if (!title || !topic || !processes || !Array.isArray(processes)) {
      return NextResponse.json(
        { error: 'Title, topic, and processes are required' },
        { status: 400 }
      )
    }

    // Create the roadmap
    const roadmap = await prisma.learningRoadmap.create({
      data: {
        userId: session.user.id,
        title,
        topic,
        processes: processes, // Store as JSON
        chatId,
      },
    })

    // Create individual process records
    const processRecords = await Promise.all(
      processes.map((process, index) =>
        prisma.roadmapProcess.create({
          data: {
            roadmapId: roadmap.id,
            title: process.title,
            description: process.description,
            order: index + 1,
          },
        })
      )
    )

    return NextResponse.json({
      roadmap: {
        ...roadmap,
        roadmapProcesses: processRecords,
      },
    })
  } catch (error) {
    console.error('Error creating roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to create roadmap' },
      { status: 500 }
    )
  }
}

// PUT - Update roadmap (mark process as completed)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roadmapId, processId, isCompleted } = await request.json()

    if (!roadmapId || !processId) {
      return NextResponse.json(
        { error: 'Roadmap ID and process ID are required' },
        { status: 400 }
      )
    }

    // Update the process
    const updatedProcess = await prisma.roadmapProcess.update({
      where: {
        id: processId,
        roadmapId: roadmapId,
      },
      data: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    })

    // Check if all processes are completed
    const allProcesses = await prisma.roadmapProcess.findMany({
      where: {
        roadmapId: roadmapId,
      },
    })

    const allCompleted = allProcesses.every((process) => process.isCompleted)

    // If all processes are completed, deactivate the roadmap
    if (allCompleted) {
      await prisma.learningRoadmap.update({
        where: {
          id: roadmapId,
        },
        data: {
          isActive: false,
        },
      })
    }

    return NextResponse.json({
      process: updatedProcess,
      allCompleted,
    })
  } catch (error) {
    console.error('Error updating roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to update roadmap' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a roadmap
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roadmapId = searchParams.get('roadmapId')

    if (!roadmapId) {
      return NextResponse.json(
        { error: 'Roadmap ID is required' },
        { status: 400 }
      )
    }

    // Deactivate the roadmap instead of deleting
    await prisma.learningRoadmap.update({
      where: {
        id: roadmapId,
        userId: session.user.id,
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to delete roadmap' },
      { status: 500 }
    )
  }
}
