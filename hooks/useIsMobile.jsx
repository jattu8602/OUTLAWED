// lib/hooks/useIsMobile.tsx
'use client'

import { useState, useEffect } from 'react'

/**
 * A custom hook to detect if the user is on a mobile device based on window width.
 * @param {number} [breakpoint=768] - The width in pixels to consider the threshold for mobile.
 * @returns {boolean} - True if the window width is less than the breakpoint, false otherwise.
 */
export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // This function checks the window width and updates the state.
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Run the function on the initial client-side render.
    handleResize()

    // Add an event listener to check again if the window is resized.
    window.addEventListener('resize', handleResize)

    // Cleanup function: remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpoint]) // Re-run the effect if the breakpoint changes.

  return isMobile
}
