import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get dashboard statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts for different types of tests and test series
    const [freeTests, paidTests, totalTests, testSeries] = await Promise.all([
      prisma.test.count({
        where: { type: 'FREE', isActive: true },
      }),
      prisma.test.count({
        where: { type: 'PAID', isActive: true },
      }),
      prisma.test.count({
        where: { isActive: true },
      }),
      prisma.testSeries.count({
        where: { isPublished: true },
      }),
    ])

    // Get user-specific counts
    let userStats = {}

    if (session.user.role === 'ADMIN') {
      // Admin gets all user counts
      const [totalUsers, blockedUsers, totalPayments] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isBlocked: true } }),
        prisma.payment.count({ where: { status: 'SUCCESS' } }),
      ])

      userStats = {
        totalUsers,
        blockedUsers,
        totalPayments,
      }
    } else {
      // Regular users get their own stats
      const [userTestAttempts, userPayments, userNotifications] =
        await Promise.all([
          prisma.testAttempt.count({
            where: { userId: session.user.id },
          }),
          prisma.payment.count({
            where: { userId: session.user.id, status: 'SUCCESS' },
          }),
          prisma.notification.count({
            where: {
              OR: [
                { userId: session.user.id },
                { isBroadcast: true },
                { type: 'TEST_ACTIVATION', userId: session.user.id },
                { type: 'PAYMENT_SUCCESS', userId: session.user.id },
                { type: 'PLAN_EXPIRY', userId: session.user.id },
              ],
            },
          }),
        ])

      userStats = {
        userTestAttempts,
        userPayments,
        userNotifications,
      }
    }

    // Get review counts
    let reviewStats = {}

    if (session.user.role === 'ADMIN') {
      // Admin gets all review counts
      const [totalReviews, unreadReviews, reviewsWithReplies] =
        await Promise.all([
          prisma.review.count(),
          prisma.review.count({ where: { isRead: false } }),
          prisma.review.count({ where: { adminReply: { not: null } } }),
        ])

      reviewStats = {
        totalReviews,
        unreadReviews,
        reviewsWithReplies,
      }
    } else {
      // Regular users get their own review count
      const userReviews = await prisma.review.count({
        where: { userId: session.user.id },
      })

      reviewStats = {
        totalReviews: userReviews,
      }
    }

    // Get notification counts
    let notificationStats = {}

    if (session.user.role === 'ADMIN') {
      // Admin gets all notification counts
      const [totalNotifications, unreadNotifications, broadcastNotifications] =
        await Promise.all([
          prisma.notification.count(),
          prisma.notification.count({ where: { isRead: false } }),
          prisma.notification.count({ where: { isBroadcast: true } }),
        ])

      notificationStats = {
        totalNotifications,
        unreadNotifications,
        broadcastNotifications,
      }
    } else {
      // Users get their notification counts
      // For users, we count:
      // 1. Their personal unread notifications
      // 2. Broadcast notifications they haven't read yet
      const [totalUserNotifications, unreadUserNotifications] =
        await Promise.all([
          prisma.notification.count({
            where: {
              OR: [
                { userId: session.user.id },
                { isBroadcast: true },
                { type: 'TEST_ACTIVATION', userId: session.user.id },
                { type: 'PAYMENT_SUCCESS', userId: session.user.id },
                { type: 'PLAN_EXPIRY', userId: session.user.id },
              ],
            },
          }),
          prisma.notification.count({
            where: {
              OR: [
                // Unread user-specific notifications
                { userId: session.user.id, isRead: false },
                // Broadcast notifications not marked as read by this user
                {
                  isBroadcast: true,
                  id: {
                    notIn: await prisma.broadcastNotificationRead
                      .findMany({
                        where: { userId: session.user.id },
                        select: { notificationId: true },
                      })
                      .then((reads) => reads.map((r) => r.notificationId)),
                  },
                },
              ],
            },
          }),
        ])

      notificationStats = {
        totalUserNotifications,
        unreadUserNotifications,
      }
    }

    return NextResponse.json({
      stats: {
        tests: {
          free: freeTests,
          paid: paidTests,
          total: totalTests,
          series: testSeries,
        },
        user: userStats,
        reviews: reviewStats,
        notifications: notificationStats,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
