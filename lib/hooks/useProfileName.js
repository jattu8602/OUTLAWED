import { useState } from 'react'
import { useSession, update } from 'next-auth/react'

export function useProfileName() {
  const { data: session, update: updateSession } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateProfileName = async (newName) => {
    if (!newName || newName.trim().length === 0) {
      return { success: false, error: 'Name is required' }
    }

    if (newName.trim().length < 2) {
      return {
        success: false,
        error: 'Name must be at least 2 characters long',
      }
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      if (response.ok) {
        const result = await response.json()
        // Refresh the session to update everywhere
        await updateSession()
        return { success: true, user: result.user }
      } else {
        const error = await response.json()
        return {
          success: false,
          error: error.error || 'Failed to update profile name',
        }
      }
    } catch (error) {
      console.error('Error updating profile name:', error)
      return { success: false, error: 'Failed to update profile name' }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateProfileName,
    isUpdating,
  }
}
