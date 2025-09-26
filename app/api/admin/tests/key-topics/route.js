import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all unique key topics from existing tests
    const tests = await prisma.test.findMany({
      select: {
        keyTopic: true,
      },
      where: {
        keyTopic: {
          not: null,
        },
      },
      distinct: ['keyTopic'],
    })

    const keyTopics = tests
      .map((test) => test.keyTopic)
      .filter((topic) => topic && topic.trim() !== '')

    return NextResponse.json({ keyTopics })
  } catch (error) {
    console.error('Error fetching key topics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
