'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for progressive loading with better UX
 * @param {Function} fetchFunction - The function to fetch data
 * @param {Object} options - Configuration options
 * @returns {Object} Loading state and data
 */
export function useProgressiveLoading(fetchFunction, options = {}) {
  const {
    initialData = null,
    cacheKey = null,
    cacheExpiry = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
    enableBackgroundRefresh = true,
  } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [progress, setProgress] = useState(0)

  const retryCountRef = useRef(0)
  const abortControllerRef = useRef(null)
  const cacheRef = useRef(null)

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!cacheKey || !cacheRef.current) return false
    return Date.now() - cacheRef.current.timestamp < cacheExpiry
  }, [cacheKey, cacheExpiry])

  // Load from cache
  const loadFromCache = useCallback(() => {
    if (cacheKey && cacheRef.current && isCacheValid()) {
      setData(cacheRef.current.data)
      setLoading(false)
      return true
    }
    return false
  }, [cacheKey, isCacheValid])

  // Save to cache
  const saveToCache = useCallback(
    (newData) => {
      if (cacheKey) {
        cacheRef.current = {
          data: newData,
          timestamp: Date.now(),
        }
      }
    },
    [cacheKey]
  )

  // Progressive fetch with retry logic
  const fetchData = useCallback(
    async (isRefresh = false) => {
      // Prevent multiple simultaneous requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        if (isRefresh) {
          setIsRefreshing(true)
        } else {
          setLoading(true)
        }
        setError(null)
        setProgress(0)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        const result = await fetchFunction(abortControllerRef.current.signal)

        clearInterval(progressInterval)
        setProgress(100)

        if (result) {
          setData(result)
          saveToCache(result)
          retryCountRef.current = 0
        }

        return result
      } catch (err) {
        if (err.name === 'AbortError') {
          return // Request was aborted, don't update state
        }

        console.error('Fetch error:', err)

        // Retry logic
        if (retryCountRef.current < retryAttempts) {
          retryCountRef.current++
          setTimeout(() => {
            fetchData(isRefresh)
          }, retryDelay * retryCountRef.current)
          return
        }

        setError(err.message)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
        setProgress(0)
        abortControllerRef.current = null
      }
    },
    [fetchFunction, retryAttempts, retryDelay, saveToCache]
  )

  // Background refresh
  const backgroundRefresh = useCallback(async () => {
    if (enableBackgroundRefresh && data && !loading && !isRefreshing) {
      try {
        const result = await fetchFunction()
        if (result) {
          setData(result)
          saveToCache(result)
        }
      } catch (err) {
        console.warn('Background refresh failed:', err)
      }
    }
  }, [
    fetchFunction,
    data,
    loading,
    isRefreshing,
    enableBackgroundRefresh,
    saveToCache,
  ])

  // Initial load
  useEffect(() => {
    if (!loadFromCache()) {
      fetchData()
    }
  }, [loadFromCache, fetchData])

  // Background refresh interval
  useEffect(() => {
    if (enableBackgroundRefresh && data) {
      const interval = setInterval(backgroundRefresh, cacheExpiry / 2)
      return () => clearInterval(interval)
    }
  }, [backgroundRefresh, enableBackgroundRefresh, data, cacheExpiry])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    isRefreshing,
    progress,
    refetch: () => fetchData(true),
    clearCache: () => {
      cacheRef.current = null
      setData(initialData)
    },
  }
}

/**
 * Hook for optimistic updates
 * @param {Function} updateFunction - Function to perform the update
 * @param {Function} rollbackFunction - Function to rollback on error
 * @returns {Object} Update state and functions
 */
export function useOptimisticUpdate(updateFunction, rollbackFunction) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)

  const update = useCallback(
    async (optimisticData, ...args) => {
      setIsUpdating(true)
      setError(null)

      try {
        const result = await updateFunction(...args)
        return result
      } catch (err) {
        if (rollbackFunction) {
          rollbackFunction(optimisticData)
        }
        setError(err.message)
        throw err
      } finally {
        setIsUpdating(false)
      }
    },
    [updateFunction, rollbackFunction]
  )

  return {
    update,
    isUpdating,
    error,
  }
}

/**
 * Hook for paginated data loading
 * @param {Function} fetchFunction - Function to fetch paginated data
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination state and functions
 */
export function usePaginatedLoading(fetchFunction, options = {}) {
  const { pageSize = 10, initialPage = 1, cacheKey = null } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const loadPage = useCallback(
    async (page, append = false) => {
      try {
        setLoading(true)
        setError(null)

        const result = await fetchFunction(page, pageSize)

        if (result) {
          const { items, total, hasMore: more } = result

          if (append) {
            setData((prev) => [...prev, ...items])
          } else {
            setData(items)
          }

          setHasMore(more)
          setTotalCount(total)
          setCurrentPage(page)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [fetchFunction, pageSize]
  )

  const loadNextPage = useCallback(() => {
    if (hasMore && !loading) {
      loadPage(currentPage + 1, true)
    }
  }, [hasMore, loading, currentPage, loadPage])

  const refresh = useCallback(() => {
    loadPage(1, false)
  }, [loadPage])

  useEffect(() => {
    loadPage(initialPage, false)
  }, [loadPage, initialPage])

  return {
    data,
    loading,
    error,
    currentPage,
    hasMore,
    totalCount,
    loadNextPage,
    refresh,
    loadPage,
  }
}
