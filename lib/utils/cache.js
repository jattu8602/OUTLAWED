const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Sets an item in localStorage with an expiration timestamp.
 * @param {string} key - The key for the storage item.
 * @param {any} value - The value to store.
 */
export const setCachedData = (key, value) => {
  if (typeof window === 'undefined') return
  const item = {
    value,
    timestamp: new Date().getTime(),
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error(`Error setting cached data for key "${key}":`, error)
  }
}

/**
 * Gets an item from localStorage if it hasn't expired.
 * @param {string} key - The key for the storage item.
 * @returns {any|null} - The cached value or null if it's expired or doesn't exist.
 */
export const getCachedData = (key) => {
  if (typeof window === 'undefined') return null
  try {
    const itemString = window.localStorage.getItem(key)
    if (!itemString) return null

    const item = JSON.parse(itemString)
    const now = new Date().getTime()

    if (now - item.timestamp > CACHE_DURATION) {
      window.localStorage.removeItem(key)
      return null
    }

    return item.value
  } catch (error) {
    console.error(`Error getting cached data for key "${key}":`, error)
    return null
  }
}
