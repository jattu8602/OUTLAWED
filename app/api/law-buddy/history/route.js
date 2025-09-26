import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chats = await prisma.lawBuddyChat.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        referenceTest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Limit to last 50 chats
    })

    return NextResponse.json({
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        referenceTest: chat.referenceTest,
        messageCount: chat.messages?.length || 0,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}
