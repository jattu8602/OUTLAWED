import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get pomodoro sessions for the user
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    })

    const totalCycles = sessions.length
    const todaySessions = sessions.filter((session) => {
      const today = new Date()
      const sessionDate = new Date(session.completedAt)
      return sessionDate.toDateString() === today.toDateString()
    }).length

    const thisWeekSessions = sessions.filter((session) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(session.completedAt) >= weekAgo
    }).length

    return NextResponse.json({
      totalCycles,
      todaySessions,
      thisWeekSessions,
      sessions: sessions.slice(0, 10), // Last 10 sessions
    })
  } catch (error) {
    console.error('Error fetching pomodoro data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pomodoro data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { sessionType, duration } = await request.json()

    // Create a new pomodoro session record
    const session = await prisma.pomodoroSession.create({
      data: {
        userId,
        sessionType, // 'study' or 'break'
        duration, // in minutes
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      session,
      message: 'Pomodoro session recorded successfully',
    })
  } catch (error) {
    console.error('Error recording pomodoro session:', error)
    return NextResponse.json(
      { error: 'Failed to record pomodoro session' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
