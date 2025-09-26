import { NextResponse } from 'next/server'
import { getAuthSession } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to get the start of the week for a given date
const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function POST(req) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { dateToMark } = await req.json()

    if (!dateToMark) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const startOfWeek = getStartOfWeek(dateToMark)

    const schedule = await prisma.personalizedSchedule.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: startOfWeek,
        },
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found for this week' },
        { status: 404 }
      )
    }

    const scheduleData = schedule.scheduleData
    let dayFound = false

    const updatedScheduleData = scheduleData.map((day) => {
      if (day.date === dateToMark) {
        dayFound = true
        return { ...day, completed: true }
      }
      return day
    })

    if (!dayFound) {
      return NextResponse.json(
        { error: 'Date not found in schedule' },
        { status: 404 }
      )
    }

    const updatedSchedule = await prisma.personalizedSchedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        scheduleData: updatedScheduleData,
      },
    })

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error('Error marking schedule day as complete:', error)
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
