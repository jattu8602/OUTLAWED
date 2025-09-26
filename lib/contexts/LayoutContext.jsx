'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  getCachedLayoutData,
  setCachedLayoutData,
  clearLayoutCache,
} from '@/lib/utils/cacheUtils'

// Initial state
const initialState = {
  sidebarOpen: false,
  isInitialized: false,
  cachedSession: null,
  lastSessionCheck: null,
  isAdmin: false,
}

// Action types
const LAYOUT_ACTIONS = {
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  SET_INITIALIZED: 'SET_INITIALIZED',
  CACHE_SESSION: 'CACHE_SESSION',
  SET_ADMIN: 'SET_ADMIN',
  CLEAR_CACHE: 'CLEAR_CACHE',
}

// Reducer
function layoutReducer(state, action) {
  switch (action.type) {
    case LAYOUT_ACTIONS.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      }
    case LAYOUT_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: action.payload,
      }
    case LAYOUT_ACTIONS.CACHE_SESSION:
      return {
        ...state,
        cachedSession: action.payload.session,
        lastSessionCheck: action.payload.timestamp,
        isAdmin: action.payload.isAdmin,
      }
    case LAYOUT_ACTIONS.SET_ADMIN:
      return {
        ...state,
        isAdmin: action.payload,
      }
    case LAYOUT_ACTIONS.CLEAR_CACHE:
      return {
        ...initialState,
        isInitialized: true,
      }
    default:
      return state
  }
}

// Context
const LayoutContext = createContext()

// Provider component
export function LayoutProvider({ children }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState)
  const { data: session, status } = useSession()

  // Load cached data from localStorage on mount
  useEffect(() => {
    const cachedData = getCachedLayoutData()
    if (cachedData) {
      dispatch({
        type: LAYOUT_ACTIONS.CACHE_SESSION,
        payload: {
          session: cachedData.cachedSession,
          timestamp: cachedData.lastSessionCheck,
          isAdmin: cachedData.isAdmin,
        },
      })
    }
    dispatch({ type: LAYOUT_ACTIONS.SET_INITIALIZED, payload: true })
  }, [])

  // Cache session data when it changes
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const isAdmin = session.user?.role === 'ADMIN'

      dispatch({
        type: LAYOUT_ACTIONS.CACHE_SESSION,
        payload: {
          session,
          timestamp: Date.now(),
          isAdmin,
        },
      })

      // Store in localStorage using utility function
      setCachedLayoutData({
        cachedSession: session,
        isAdmin,
      })
    } else if (status === 'unauthenticated') {
      // Clear cache when user logs out
      dispatch({ type: LAYOUT_ACTIONS.CLEAR_CACHE })
      clearLayoutCache()
    }
  }, [session, status])

  // Actions
  const setSidebarOpen = (open) => {
    dispatch({ type: LAYOUT_ACTIONS.SET_SIDEBAR_OPEN, payload: open })
  }

  const clearCache = () => {
    dispatch({ type: LAYOUT_ACTIONS.CLEAR_CACHE })
    clearLayoutCache()
  }

  const value = {
    ...state,
    setSidebarOpen,
    clearCache,
    // Current session data (for real-time updates)
    currentSession: session,
    currentStatus: status,
  }

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  )
}

// Custom hook to use the layout context
export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

// Custom hook for optimized session management
export function useOptimizedSession() {
  const {
    cachedSession,
    lastSessionCheck,
    currentSession,
    currentStatus,
    isAdmin,
  } = useLayout()

  // Use cached session if available and recent (within 5 minutes)
  const now = Date.now()
  const cacheAge = lastSessionCheck ? now - lastSessionCheck : Infinity
  const useCache =
    cacheAge < 300000 && cachedSession && currentStatus !== 'loading'

  return {
    session: useCache ? cachedSession : currentSession,
    status: currentStatus,
    isAdmin,
    isCached: useCache,
    cacheAge,
  }
}
