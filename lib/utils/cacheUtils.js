/**
 * Cache utility functions for layout optimization
 */

const CACHE_KEY = 'layout-cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Get cached layout data from localStorage
 * @returns {Object|null} Cached data or null if expired/not found
 */
export function getCachedLayoutData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data = JSON.parse(cached)
    const now = Date.now()
    const cacheAge = now - data.lastSessionCheck

    // Return data if cache is still valid
    if (cacheAge < CACHE_DURATION) {
      return data
    }

    // Clear expired cache
    clearLayoutCache()
    return null
  } catch (error) {
    console.error('Error reading cached layout data:', error)
    clearLayoutCache()
    return null
  }
}

/**
 * Set cached layout data in localStorage
 * @param {Object} data - Data to cache
 */
export function setCachedLayoutData(data) {
  try {
    const cacheData = {
      ...data,
      lastSessionCheck: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error setting cached layout data:', error)
  }
}

/**
 * Clear cached layout data from localStorage
 */
export function clearLayoutCache() {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Error clearing cached layout data:', error)
  }
}

/**
 * Check if cached data exists and is valid
 * @returns {boolean} True if valid cache exists
 */
export function hasValidCache() {
  return getCachedLayoutData() !== null
}

/**
 * Get cache age in milliseconds
 * @returns {number} Cache age in ms, or Infinity if no cache
 */
export function getCacheAge() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return Infinity

    const data = JSON.parse(cached)
    return Date.now() - data.lastSessionCheck
  } catch (error) {
    return Infinity
  }
}

/**
 * Check if cache is about to expire (within 1 minute)
 * @returns {boolean} True if cache expires soon
 */
export function isCacheExpiringSoon() {
  const age = getCacheAge()
  return age > CACHE_DURATION - 60000 // 1 minute before expiry
}
