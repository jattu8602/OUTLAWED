import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // 1. Total Users
    const totalUsers = await prisma.user.count()
    const usersOneWeekAgo = await prisma.user.count({
      where: { createdAt: { lt: oneWeekAgo } },
    })
    const userChange =
      usersOneWeekAgo > 0
        ? ((totalUsers - usersOneWeekAgo) / usersOneWeekAgo) * 100
        : totalUsers > 0
        ? 100
        : 0

    // 2. Active Tests
    const totalActiveTests = await prisma.test.count({
      where: { isActive: true },
    })
    const newTestsThisWeek = await prisma.test.count({
      where: { createdAt: { gte: oneWeekAgo } },
    })

    // 3. Total Revenue
    const totalRevenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    })
    const totalRevenue = totalRevenueResult._sum.amount || 0
    const revenueOneWeekAgoResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        createdAt: {
          lt: oneWeekAgo,
        },
      },
    })
    const revenueOneWeekAgo = revenueOneWeekAgoResult._sum.amount || 0

    const revenueChange =
      revenueOneWeekAgo > 0
        ? ((totalRevenue - revenueOneWeekAgo) / revenueOneWeekAgo) * 100
        : totalRevenue > 0
        ? 100
        : 0

    // 4. Active Sessions (Users with recent test attempts)
    const activeUsersThisWeekResult = await prisma.testAttempt.findMany({
      where: { startedAt: { gte: oneWeekAgo } },
      distinct: ['userId'],
    })
    const activeUsersThisWeek = activeUsersThisWeekResult.length

    const activeUsersLastWeekResult = await prisma.testAttempt.findMany({
      where: {
        startedAt: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo,
        },
      },
      distinct: ['userId'],
    })
    const activeUsersLastWeek = activeUsersLastWeekResult.length

    const activeUsersChange =
      activeUsersLastWeek > 0
        ? ((activeUsersThisWeek - activeUsersLastWeek) / activeUsersLastWeek) *
          100
        : activeUsersThisWeek > 0
        ? 100
        : 0

    // 5. Reviews Statistics
    const totalReviews = await prisma.review.count()
    const unreadReviews = await prisma.review.count({
      where: { isRead: false },
    })
    const reviewsWithReplies = await prisma.review.count({
      where: { adminReply: { not: null } },
    })

    // 6. Notifications Statistics
    const unreadNotifications = await prisma.notification.count({
      where: { isRead: false },
    })

    return NextResponse.json({
      stats: {
        user: {
          totalUsers,
        },
        tests: {
          free: await prisma.test.count({
            where: { type: 'FREE', isActive: true },
          }),
          paid: await prisma.test.count({
            where: { type: 'PAID', isActive: true },
          }),
        },
        reviews: {
          totalReviews,
          unreadReviews,
          reviewsWithReplies,
        },
        notifications: {
          unreadNotifications,
        },
      },
      totalUsers: {
        value: totalUsers,
        change: userChange.toFixed(2),
      },
      activeTests: {
        value: totalActiveTests,
        change: newTestsThisWeek,
      },
      totalRevenue: {
        value: totalRevenue,
        change: revenueChange.toFixed(2),
      },
      activeSessions: {
        value: activeUsersThisWeek,
        change: activeUsersChange.toFixed(2),
      },
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
