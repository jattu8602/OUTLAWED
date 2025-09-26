import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get user notifications with pagination
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: {
        OR: [
          // User-specific notifications
          { userId: session.user.id },
          // Broadcast notifications
          { isBroadcast: true },
          // Test activation notifications for this user
          { type: 'TEST_ACTIVATION', userId: session.user.id },
          // Payment notifications for this user
          { type: 'PAYMENT_SUCCESS', userId: session.user.id },
          // Plan expiry notifications for this user
          { type: 'PLAN_EXPIRY', userId: session.user.id },
        ],
      },
    })

    // Get paginated notifications for this user, including:
    // 1. User-specific notifications
    // 2. Broadcast notifications
    // 3. Test activation notifications
    // 4. Payment notifications
    // 5. Plan expiry notifications
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          // User-specific notifications
          { userId: session.user.id },
          // Broadcast notifications
          { isBroadcast: true },
          // Test activation notifications for this user
          { type: 'TEST_ACTIVATION', userId: session.user.id },
          // Payment notifications for this user
          { type: 'PAYMENT_SUCCESS', userId: session.user.id },
          // Plan expiry notifications for this user
          { type: 'PLAN_EXPIRY', userId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // Get which broadcast notifications this user has read
    const readBroadcastNotifications =
      await prisma.broadcastNotificationRead.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          notificationId: true,
        },
      })

    const readBroadcastIds = readBroadcastNotifications.map(
      (r) => r.notificationId
    )

    // Get which notifications this user has liked
    const notificationIds = notifications.map((n) => n.id)
    const likedNotifications = await prisma.notificationLike.findMany({
      where: {
        userId: session.user.id,
        notificationId: {
          in: notificationIds,
        },
      },
      select: {
        notificationId: true,
      },
    })
    const likedNotificationIds = new Set(
      likedNotifications.map((l) => l.notificationId)
    )

    // Add read status to notifications
    const notificationsWithReadStatus = notifications.map((notification) => ({
      ...notification,
      isRead: notification.isBroadcast
        ? readBroadcastIds.includes(notification.id)
        : notification.isRead,
      isLiked: likedNotificationIds.has(notification.id),
    }))

    // Calculate if there are more notifications
    const hasMore = skip + limit < totalCount

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      hasMore,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      // First, get all unread notifications for this user
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          OR: [
            // User-specific notifications that are unread
            { userId: session.user.id, isRead: false },
            // Broadcast notifications that this user hasn't read
            {
              isBroadcast: true,
              NOT: {
                readByUsers: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          ],
        },
      })

      // Mark user-specific notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      // Mark broadcast notifications as read for this user
      for (const notification of unreadNotifications) {
        if (notification.isBroadcast) {
          await prisma.broadcastNotificationRead.upsert({
            where: {
              userId_notificationId: {
                userId: session.user.id,
                notificationId: notification.id,
              },
            },
            update: {
              readAt: new Date(),
            },
            create: {
              userId: session.user.id,
              notificationId: notification.id,
            },
          })
        }
      }

      return NextResponse.json({
        message: 'All notifications marked as read',
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Check if this is a broadcast notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.isBroadcast) {
      // For broadcast notifications, mark as read for this specific user
      await prisma.broadcastNotificationRead.upsert({
        where: {
          userId_notificationId: {
            userId: session.user.id,
            notificationId: notificationId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          userId: session.user.id,
          notificationId: notificationId,
        },
      })
    } else {
      // For user-specific notifications, mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
    }

    return NextResponse.json({
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Like/Unlike notification
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, action } = body // action: 'like' or 'unlike'

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'Notification ID and action are required' },
        { status: 400 }
      )
    }

    if (!['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "like" or "unlike"' },
        { status: 400 }
      )
    }

    // Check if notification exists
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (action === 'like') {
      // Check if user has already liked this notification
      const existingLike = await prisma.notificationLike.findUnique({
        where: {
          userId_notificationId: {
            userId: session.user.id,
            notificationId: notificationId,
          },
        },
      })

      if (existingLike) {
        return NextResponse.json({
          message: 'Notification already liked',
          isLiked: true,
          likeCount: notification.likeCount,
        })
      }

      // Create like and increment count
      await prisma.$transaction([
        prisma.notificationLike.create({
          data: {
            userId: session.user.id,
            notificationId: notificationId,
          },
        }),
        prisma.notification.update({
          where: { id: notificationId },
          data: { likeCount: { increment: 1 } },
        }),
      ])

      return NextResponse.json({
        message: 'Notification liked',
        isLiked: true,
        likeCount: notification.likeCount + 1,
      })
    } else {
      // Unlike
      const existingLike = await prisma.notificationLike.findUnique({
        where: {
          userId_notificationId: {
            userId: session.user.id,
            notificationId: notificationId,
          },
        },
      })

      if (!existingLike) {
        return NextResponse.json({
          message: 'Notification not liked',
          isLiked: false,
          likeCount: notification.likeCount,
        })
      }

      // Remove like and decrement count
      await prisma.$transaction([
        prisma.notificationLike.delete({
          where: {
            userId_notificationId: {
              userId: session.user.id,
              notificationId: notificationId,
            },
          },
        }),
        prisma.notification.update({
          where: { id: notificationId },
          data: { likeCount: { decrement: 1 } },
        }),
      ])

      return NextResponse.json({
        message: 'Notification unliked',
        isLiked: false,
        likeCount: Math.max(0, notification.likeCount - 1),
      })
    }
  } catch (error) {
    console.error('Error liking/unliking notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
