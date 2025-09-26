/**
 * Weekly Leaderboard Utilities
 *
 * Week runs from Monday 12:00 AM to Sunday 11:59 PM
 */

/**
 * Get the start of the current week (Monday 12:00 AM)
 * @returns {Date} Start of current week
 */
export function getWeekStart() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday = 0

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - daysToMonday)
  weekStart.setHours(0, 0, 0, 0) // Set to 12:00 AM

  return weekStart
}

/**
 * Get the end of the current week (Sunday 11:59 PM)
 * @returns {Date} End of current week
 */
export function getWeekEnd() {
  const weekStart = getWeekStart()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // Add 6 days to get Sunday
  weekEnd.setHours(23, 59, 59, 999) // Set to 11:59 PM

  return weekEnd
}

/**
 * Check if a date is within the current week
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in current week
 */
export function isInCurrentWeek(date) {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  return date >= weekStart && date <= weekEnd
}

/**
 * Get week information for display
 * @returns {Object} Week info with start, end, and formatted strings
 */
export function getWeekInfo() {
  const weekStart = getWeekStart()
  const weekEnd = getWeekEnd()

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return {
    start: weekStart,
    end: weekEnd,
    startFormatted: formatDate(weekStart),
    endFormatted: formatDate(weekEnd),
    weekRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
    daysRemaining: Math.ceil((weekEnd - new Date()) / (1000 * 60 * 60 * 24)),
  }
}

/**
 * Get the week number of the year
 * @returns {number} Week number (1-52)
 */
export function getWeekNumber() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now - start) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + start.getDay() + 1) / 7)
}

/**
 * Get time remaining in current week
 * @returns {Object} Time remaining info
 */
export function getTimeRemaining() {
  const now = new Date()
  const weekEnd = getWeekEnd()
  const timeLeft = weekEnd - now

  if (timeLeft <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMs: 0,
      isExpired: true,
    }
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  )
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  return {
    days,
    hours,
    minutes,
    totalMs: timeLeft,
    isExpired: false,
  }
}

/**
 * Format time remaining for display
 * @returns {string} Formatted time remaining string
 */
export function getTimeRemainingFormatted() {
  const timeRemaining = getTimeRemaining()

  if (timeRemaining.isExpired) {
    return 'Week ended'
  }

  if (timeRemaining.days > 0) {
    return `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`
  } else if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m`
  } else {
    return `${timeRemaining.minutes}m`
  }
}
