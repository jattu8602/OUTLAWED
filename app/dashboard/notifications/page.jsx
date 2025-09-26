'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Eye,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  ArrowRight,
  Play,
  Trophy,
  RefreshCcw,
  Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Cache data outside component to persist across navigations
const notificationsCache = {
  notifications: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
}

export default function UserNotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState(
    notificationsCache.notifications || []
  )
  const [loading, setLoading] = useState(!notificationsCache.notifications)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!notificationsCache.lastFetchTime) return false
    return (
      Date.now() - notificationsCache.lastFetchTime <
      notificationsCache.cacheExpiry
    )
  }

  useEffect(() => {
    if (session) {
      if (!notificationsCache.notifications || !isCacheValid()) {
        fetchNotifications(1, true)
      } else {
        setLoading(false)
      }
    }
  }, [session])

  const fetchNotifications = async (page = 1, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(
        `/api/user/notifications?page=${page}&limit=10`
      )
      if (response.ok) {
        const data = await response.json()
        const newNotifications = data.notifications || []
        const hasMoreNotifications = data.hasMore || false

        if (isInitial) {
          // Initial load - replace all notifications
          setNotifications(newNotifications)
          notificationsCache.notifications = newNotifications
        } else {
          // Load more - append to existing notifications
          setNotifications((prev) => [...prev, ...newNotifications])
          notificationsCache.notifications = [
            ...notifications,
            ...newNotifications,
          ]
        }

        setHasMore(hasMoreNotifications)
        setCurrentPage(page)
        notificationsCache.lastFetchTime = Date.now()

        // Check if there are new notifications (only for initial load)
        if (
          isInitial &&
          newNotifications.length > 0 &&
          window.incrementHeaderNotificationCount
        ) {
          const newUnreadCount = newNotifications.filter(
            (n) => !n.isRead
          ).length
          for (let i = 0; i < newUnreadCount; i++) {
            window.incrementHeaderNotificationCount()
          }
        }

        // Refresh header notifications to ensure count is accurate
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreNotifications = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(currentPage + 1, false)
    }
  }

  const toggleLike = async (notificationId, isCurrentlyLiked) => {
    try {
      const action = isCurrentlyLiked ? 'unlike' : 'like'
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, action }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  isLiked: data.isLiked,
                  likeCount: data.likeCount,
                }
              : notification
          )
        )

        // Update cache
        notificationsCache.notifications = notifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isLiked: data.isLiked,
                likeCount: data.likeCount,
              }
            : notification
        )

        toast.success(data.message)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update like status')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        )

        // Update cache
        notificationsCache.notifications = notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )

        // Immediately decrement header notification count for better UX
        if (window.decrementHeaderNotificationCount) {
          window.decrementHeaderNotificationCount()
        }

        // Also refresh the actual count from server to ensure accuracy
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }

        // Also update sidebar stats if available
        if (window.refreshSidebarStats) {
          window.refreshSidebarStats()
        }

        toast.success('Notification marked as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        )

        // Update cache
        notificationsCache.notifications = notifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
          })
        )

        // Reset header notification count to 0
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }

        // Also update sidebar stats if available
        if (window.refreshSidebarStats) {
          window.refreshSidebarStats()
        }

        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleNotificationClick = async (notification) => {
    // First mark as read if unread, regardless of type
    if (!notification.isRead) {
      // Immediately decrement the count for better UX
      if (window.decrementHeaderNotificationCount) {
        window.decrementHeaderNotificationCount()
      }

      await markAsRead(notification.id)
    }

    // Handle different notification types
    switch (notification.type) {
      case 'TEST_ACTIVATION':
        // Check if it's a free or paid test notification
        if (notification.message.toLowerCase().includes('free')) {
          router.push('/dashboard/free-test')
        } else if (notification.message.toLowerCase().includes('paid')) {
          router.push('/dashboard/paid-test')
        } else {
          // Default to free test if can't determine
          router.push('/dashboard/free-test')
        }
        break

      case 'ADMIN_BROADCAST':
        // If there's a button link, navigate to it
        if (notification.buttonLink) {
          router.push(notification.buttonLink)
        }
        break

      case 'PAYMENT_SUCCESS':
        router.push('/dashboard/payment-history')
        break

      case 'PLAN_EXPIRY':
        router.push('/dashboard/payment-history')
        break

      default:
        // Do nothing for other types
        break
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'ADMIN_BROADCAST':
        return <Megaphone className="w-5 h-5 text-purple-500" />
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PLAN_EXPIRY':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return 'Test Activation'
      case 'ADMIN_BROADCAST':
        return 'Admin Message'
      case 'PAYMENT_SUCCESS':
        return 'Payment Success'
      case 'PLAN_EXPIRY':
        return 'Plan Expiry'
      default:
        return 'Notification'
    }
  }

  const getActionButton = (notification) => {
    switch (notification.type) {
      case 'TEST_ACTIVATION':
        const isFreeTest = notification.message.toLowerCase().includes('free')
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            size="sm"
            className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            {isFreeTest ? (
              <>
                <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Take Free Test</span>
                <span className="sm:hidden">Free Test</span>
              </>
            ) : (
              <>
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Take Paid Test</span>
                <span className="sm:hidden">Paid Test</span>
              </>
            )}
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )

      case 'ADMIN_BROADCAST':
        if (notification.buttonText && notification.buttonLink) {
          return (
            <Button
              onClick={() => handleNotificationClick(notification)}
              size="sm"
              className="flex items-center gap-1 sm:gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <span className="truncate max-w-20 sm:max-w-none">
                {notification.buttonText}
              </span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )
        }
        return null

      case 'PAYMENT_SUCCESS':
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            size="sm"
            className="flex items-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">View Payment</span>
            <span className="sm:hidden">Payment</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )

      case 'PLAN_EXPIRY':
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            size="sm"
            className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            <span className="hidden sm:inline">Renew Plan</span>
            <span className="sm:hidden">Renew</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">Loading notifications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
          Notifications
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          Stay updated with the latest news and test activations
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {notifications.filter((n) => !n.isRead).length} unread notification
            {notifications.filter((n) => !n.isRead).length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => fetchNotifications(1, true)}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-900/20 px-2 sm:px-3 py-1 sm:py-2"
            >
              <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Refresh
            </Button>
            {notifications.some((n) => !n.isRead) && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20 px-2 sm:px-3 py-1 sm:py-2"
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <div className="text-4xl sm:text-6xl mb-4">🔔</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              You're all caught up! Check back later for new updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead
                  ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-l-4 border-l-gray-200 dark:border-l-gray-700'
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs text-slate-900 dark:text-white"
                            >
                              {getNotificationTypeLabel(notification.type)}
                            </Badge>
                            {notification.isBroadcast && (
                              <Badge
                                variant="outline"
                                className="text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                              >
                                Broadcast
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3">
                          {notification.message}
                        </p>
                      </div>

                      {/* Thumbnail */}
                      {notification.thumbnailUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={notification.thumbnailUrl}
                            alt="Notification thumbnail"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          {notification.isBroadcast ? 'All Users' : 'You'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {getActionButton(notification)}

                        {/* Like Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleLike(notification.id, notification.isLiked)
                          }
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${
                            notification.isLiked
                              ? 'text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20'
                              : 'text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-900/20'
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${
                              notification.isLiked ? 'fill-current' : ''
                            }`}
                          />
                          <span className="hidden sm:inline">
                            {notification.isLiked ? 'Liked' : 'Like'}
                          </span>
                          <span className="sm:hidden">
                            {notification.isLiked ? '❤️' : '🤍'}
                          </span>
                          {notification.likeCount > 0 && (
                            <span className="ml-1 text-xs">
                              ({notification.likeCount})
                            </span>
                          )}
                        </Button>

                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs sm:text-sm text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20 px-2 sm:px-3 py-1 sm:py-2"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMoreNotifications}
                disabled={loadingMore}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20 px-4 sm:px-6 py-2 sm:py-3"
              >
                {loadingMore ? (
                  <>
                    <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Notifications
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
