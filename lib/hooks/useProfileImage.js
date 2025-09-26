import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useProfileImage() {
  const { data: session, update } = useSession()
  const [profileImage, setProfileImage] = useState(session?.user?.image || '')
  const [isUpdating, setIsUpdating] = useState(false)

  // Update local state when session changes
  useEffect(() => {
    if (session?.user?.image) {
      setProfileImage(session.user.image)
    }
  }, [session?.user?.image])

  const updateProfileImage = async (imageUrl) => {
    if (!imageUrl) return

    setIsUpdating(true)
    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (response.ok) {
        setProfileImage(imageUrl)
        // Refresh the session to update everywhere
        await update()
        return { success: true }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to update profile image',
        }
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      return { success: false, error: 'Failed to update profile image' }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    profileImage,
    updateProfileImage,
    isUpdating,
  }
}
