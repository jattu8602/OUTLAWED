'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/ui/image-upload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  Edit,
  Eye,
  Trash2,
  Bell,
  Megaphone,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Send,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminNotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ADMIN_BROADCAST',
    thumbnailUrl: '',
    buttonText: '',
    buttonLink: '',
  })

  // Fetch existing notifications
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleThumbnailUpload = (imageUrl) => {
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: imageUrl,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingNotification
        ? `/api/admin/notifications/${editingNotification.id}`
        : '/api/admin/notifications'

      const method = editingNotification ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          buttonText: formData.buttonText || null,
          buttonLink: formData.buttonLink || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (editingNotification) {
          // Update the notification in the list
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === editingNotification.id
                ? { ...notification, ...formData }
                : notification
            )
          )
          setEditingNotification(null)
          setShowCreateForm(false)
          toast.success('Notification updated successfully!')
        } else {
          // Create new notification
          setNotifications((prev) => [result.notification, ...prev])
          setShowCreateForm(false)
          resetForm()
          toast.success('Notification created and broadcasted successfully!')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error saving notification')
      }
    } catch (error) {
      console.error('Error saving notification:', error)
      toast.error('Error saving notification')
    } finally {
      setLoading(false)
    }
  }

  const editNotification = (notification) => {
    setEditingNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      thumbnailUrl: notification.thumbnailUrl || '',
      buttonText: notification.buttonText || '',
      buttonLink: notification.buttonLink || '',
    })
    setShowCreateForm(true)
  }

  const deleteNotification = async (notificationId) => {
    if (
      !confirm(
        'Are you sure you want to delete this notification? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        )
        toast.success('Notification deleted successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error deleting notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error deleting notification')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'ADMIN_BROADCAST',
      thumbnailUrl: '',
      buttonText: '',
      buttonLink: '',
    })
    setEditingNotification(null)
    setShowCreateForm(false)
  }

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'ADMIN_BROADCAST':
        return <Megaphone className="w-4 h-4 text-purple-500" />
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PLAN_EXPIRY':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return 'Test Activation'
      case 'ADMIN_BROADCAST':
        return 'Admin Broadcast'
      case 'PAYMENT_SUCCESS':
        return 'Payment Success'
      case 'PLAN_EXPIRY':
        return 'Plan Expiry'
      default:
        return 'Notification'
    }
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent space-y-6 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={resetForm}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Notifications</span>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {editingNotification
                ? 'Edit Notification'
                : 'Create Broadcast Notification'}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
              {editingNotification
                ? 'Update notification information'
                : 'Create a new notification that will be broadcasted to all users'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Notification Details
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Fill in the notification information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Notification Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Title
                  <span className="text-red-500 pl-1">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter notification title"
                  required
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>

              {/* Notification Message */}
              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Message
                  <span className="text-red-500 pl-1">*</span>
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400 resize-none"
                />
              </div>

              {/* Notification Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Notification Type
                  <span className="text-red-500 pl-1">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400">
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
                    <SelectItem
                      value="ADMIN_BROADCAST"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-purple-500" />
                        <span>Admin Broadcast</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="TEST_ACTIVATION"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>Test Activation</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Thumbnail Image (Optional)
                </Label>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                  <ImageUpload
                    onUpload={handleThumbnailUpload}
                    multiple={false}
                    folder="notification-thumbnails"
                    placeholder="Upload notification thumbnail"
                  />
                  {formData.thumbnailUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current thumbnail:
                      </p>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Notification thumbnail"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Button Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="buttonText"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Button Text (Optional)
                  </Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) =>
                      handleInputChange('buttonText', e.target.value)
                    }
                    placeholder="e.g., View Test, Learn More"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="buttonLink"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Button Link (Optional)
                  </Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) =>
                      handleInputChange('buttonLink', e.target.value)
                    }
                    placeholder="e.g., /dashboard/free-test"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.message}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
            >
              {loading ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : editingNotification ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Notification</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Broadcast Notification</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Welcome Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Notification Management
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Create and manage notifications for all users
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 flex-shrink-0 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Notification</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Notifications
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 ml-2">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Broadcast Notifications
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {notifications.filter((n) => n.isBroadcast).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 ml-2">
                  <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Test Activations
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      notifications.filter((n) => n.type === 'TEST_ACTIVATION')
                        .length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 ml-2">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Recent (7 days)
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      notifications.filter((n) => {
                        const sevenDaysAgo = new Date()
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
                        return new Date(n.createdAt) > sevenDaysAgo
                      }).length
                    }
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0 ml-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-900 dark:to-pink-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    All Notifications
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Manage and monitor all system notifications
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-4xl mb-2">🔔</div>
                <p className="text-sm text-muted-foreground">
                  No notifications created yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        {notification.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={notification.thumbnailUrl}
                              alt="Notification thumbnail"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {getNotificationTypeIcon(notification.type)}
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {notification.title}
                              </h3>
                              {notification.isBroadcast && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                  Broadcast
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editNotification(notification)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {getNotificationTypeLabel(notification.type)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Button */}
                            {notification.buttonText &&
                              notification.buttonLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-700 dark:hover:bg-purple-900/20"
                                >
                                  {notification.buttonText}
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
