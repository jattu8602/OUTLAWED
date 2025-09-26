'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, update } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/image-upload'
import { User, Mail, Calendar, Edit, Camera, Save, X } from 'lucide-react'
import { useProfileImage } from '@/lib/hooks/useProfileImage'
import { useProfileName } from '@/lib/hooks/useProfileName'
import ReviewForm from '@/components/ui/review-form'
import ReviewHistory from '@/components/ui/review-history'
import EnhancedAnalytics from '@/components/analytics/EnhancedAnalytics'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { profileImage, updateProfileImage, isUpdating } = useProfileImage()
  const { updateProfileName, isUpdating: isUpdatingName } = useProfileName()
  const fileInputRef = useRef(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [reviews, setReviews] = useState([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  // Fetch user reviews
  useEffect(() => {
    if (session) {
      fetchReviews()
    }
  }, [session])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/user/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    setIsSubmittingReview(true)
    try {
      const response = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Your review has been submitted successfully!')
        fetchReviews() // Refresh reviews
      } else {
        toast.error(result.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleProfileImageUpload = async (imageUrl) => {
    if (!imageUrl) return
    try {
      const result = await updateProfileImage(imageUrl)
      if (!result.success) {
        alert(result.error || 'Failed to update profile image')
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      alert('Failed to update profile image')
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPEG, PNG, or WebP images')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Please upload an image smaller than 5MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('files', file)
      formData.append('folder', 'profiles')
      formData.append('type', 'single')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Upload failed')

      if (result.success) {
        await handleProfileImageUpload(result.url)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEditName = () => {
    setNewName(session?.user?.name || '')
    setIsEditDialogOpen(true)
  }

  const handleSaveName = async () => {
    if (!newName.trim()) {
      alert('Please enter a valid name')
      return
    }

    try {
      const result = await updateProfileName(newName.trim())
      if (result.success) {
        setIsEditDialogOpen(false)
        setNewName('')
        alert('Name updated successfully!')
      } else {
        alert(result.error || 'Failed to update name')
      }
    } catch (error) {
      console.error('Error updating name:', error)
      alert('Failed to update name')
    }
  }

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return 'Unknown'

    const date = new Date(createdAt)
    const options = { year: 'numeric', month: 'long' }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-slate-900 dark:text-white transition-colors duration-300 p-2 md:p-6 space-y-6 ">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImage} alt={session?.user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {session?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full w-8 h-8 p-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={handleCameraClick}
                  disabled={isUpdating}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            <CardTitle>{session?.user?.name || 'User Name'}</CardTitle>
            <CardDescription className="dark:text-gray-400">
              {session?.user?.email || 'user@example.com'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  disabled={isUpdating || isUpdatingName}
                  onClick={handleEditName}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isUpdating || isUpdatingName
                    ? 'Updating...'
                    : 'Edit Profile Name'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl dark:shadow-gray-900/50 transform transition-all duration-200 ease-out">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-gray-900 dark:text-white text-xl">
                    Edit Profile Name
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200"
                    >
                      Full Name
                    </label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 min-w-[80px]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveName}
                      disabled={isUpdatingName || !newName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 min-w-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingName ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                icon={<User />}
                label="Full Name"
                value={session?.user?.name || 'User Name'}
                isEditable={true}
                onEdit={handleEditName}
              />
              <InfoField
                icon={<Mail />}
                label="Email"
                value={session?.user?.email || 'user@example.com'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Role"
                value={
                  session?.user?.role === 'ADMIN'
                    ? 'Administrator'
                    : session?.user?.role === 'PAID'
                    ? 'Premium Member'
                    : 'Student'
                }
              />
              <InfoField
                icon={<Calendar />}
                label="Member Since"
                value={formatMemberSince(session?.user?.createdAt)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">

        <EnhancedAnalytics />
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Review */}
        <div>
          <ReviewForm
            onSubmit={handleReviewSubmit}
            isSubmitting={isSubmittingReview}
          />
        </div>

        {/* Review History */}
        <div>
          <ReviewHistory reviews={reviews} />
        </div>
      </div>
    </div>
  )
}

function InfoField({ icon, label, value, isEditable = false, onEdit }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium dark:text-white">{label}</label>
      <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
        <div className="flex items-center space-x-2 dark:text-gray-400">
          {icon && (
            <span className="text-gray-500 dark:text-white ">{icon}</span>
          )}
          <span>{value}</span>
        </div>
        {isEditable && onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
