'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Trophy,
  Target,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function AttemptHistoryModal({
  isOpen,
  onClose,
  testId,
  testTitle,
  onSelectAttempt,
  apiPrefix = '/api/tests', // Default to regular tests, can be overridden for Lexia
}) {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && testId) {
      fetchAttemptHistory()
    }
  }, [isOpen, testId])

  const fetchAttemptHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(
        'Fetching attempt history from:',
        `${apiPrefix}/${testId}/attempts`
      )
      const response = await fetch(`${apiPrefix}/${testId}/attempts`)
      if (response.ok) {
        const data = await response.json()
        console.log('Attempt history data:', data)
        setAttempts(data)
      } else {
        const errorText = await response.text()
        console.error(
          'Failed to fetch attempt history:',
          response.status,
          errorText
        )
        setError('Failed to fetch attempt history')
      }
    } catch (error) {
      console.error('Error fetching attempt history:', error)
      setError('Error loading attempt history')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getScoreTrend = (currentScore, previousScore) => {
    if (!previousScore) return 'neutral'
    if (currentScore > previousScore) return 'up'
    if (currentScore < previousScore) return 'down'
    return 'neutral'
  }

  const getScoreTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
      default:
        return <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
    }
  }

  const getScoreTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const ProgressBar = ({ value, className = '' }) => (
    <div
      className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 p-3 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="truncate">Test History</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {testTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 h-8 w-8 p-0 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-96px)]">
          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    Loading attempts...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-3 sm:mb-4">
                    {error}
                  </p>
                  <button
                    onClick={fetchAttemptHistory}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs sm:text-sm transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : attempts.length === 0 ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                    No attempts found
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {/* Summary Stats */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/50 dark:border-blue-800/50 shadow-sm rounded-xl overflow-hidden">
                  <div className="p-3 sm:p-4">
                    {/* ✅ Changed grid-cols-2 lg:grid-cols-4 → grid-cols-2 md:grid-cols-4 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      {/* Total Attempts */}
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-white/5">
                        <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {attempts.length}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Total Attempts
                        </div>
                      </div>

                      {/* Best Score */}
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-white/5">
                        <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                          {attempts.length > 0
                            ? Math.max(
                                ...attempts.map(
                                  (a) => a.percentage ?? (a.score || 0)
                                )
                              ).toFixed(2)
                            : '0.00'}
                          %
                        </div>
                        <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                          Best Score
                        </div>
                      </div>

                      {/* Average */}
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-white/5">
                        <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {attempts.length > 0
                            ? (
                                attempts.reduce(
                                  (sum, a) =>
                                    sum + (a.percentage ?? (a.score || 0)),
                                  0
                                ) / attempts.length
                              ).toFixed(2)
                            : '0.00'}
                          %
                        </div>
                        <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">
                          Average
                        </div>
                      </div>

                      {/* Total Time */}
                      <div className="text-center p-2 sm:p-3 rounded-lg bg-white/50 dark:bg-white/5">
                        <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {formatDuration(
                            attempts.reduce(
                              (sum, a) => sum + (a.totalTimeSec || 0),
                              0
                            )
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-medium">
                          Total Time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attempts List */}
                <div className="space-y-2 sm:space-y-3">
                  {attempts.map((attempt, index) => {
                    const currentScore =
                      attempt.percentage ?? (attempt.score || 0)
                    const trend = getScoreTrend(
                      currentScore,
                      index < attempts.length - 1
                        ? attempts[index + 1].percentage ??
                            (attempts[index + 1].score || 0)
                        : null
                    )
                    const isLatest = attempt.isLatest

                    return (
                      <div
                        key={attempt.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.99] border-2 rounded-xl overflow-hidden ${
                          isLatest
                            ? 'border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-blue-100 dark:shadow-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                        }`}
                        onClick={() => onSelectAttempt(attempt)}
                      >
                        <div className="p-3 sm:p-4">
                          {/* Desktop Layout */}
                          <div className="hidden sm:flex items-center justify-between">
                            <div className="flex items-center gap-4 lg:gap-6">
                              {/* Attempt Number */}
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold ${
                                    isLatest
                                      ? 'bg-blue-600 text-white shadow-lg'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {attempt.attemptNumber}
                                </div>
                                {isLatest && (
                                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                                    Latest
                                  </span>
                                )}
                              </div>

                              {/* Score and Trend */}
                              <div className="flex items-center gap-3 lg:gap-4">
                                <div className="text-center">
                                  <div
                                    className={`text-xl lg:text-2xl font-bold ${getScoreBadgeColor(
                                      currentScore
                                    )}`}
                                  >
                                    {currentScore.toFixed(2)}%
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Score
                                  </div>
                                </div>
                                {index < attempts.length - 1 && (
                                  <div
                                    className={`flex items-center gap-1 ${getScoreTrendColor(
                                      trend
                                    )} bg-white dark:bg-slate-800 rounded-full px-2 py-1 shadow-sm border`}
                                  >
                                    {getScoreTrendIcon(trend)}
                                    <span className="text-xs font-medium">
                                      {trend === 'up'
                                        ? '+'
                                        : trend === 'down'
                                        ? '-'
                                        : '±'}
                                      {Math.abs(
                                        currentScore -
                                          (attempts[index + 1].percentage ??
                                            (attempts[index + 1].score || 0))
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 lg:gap-6 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">
                                    {attempt.correctAnswers || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="font-medium">
                                    {attempt.wrongAnswers || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Timer className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium">
                                    {formatDuration(attempt.totalTimeSec || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Date and Time */}
                            <div className="text-right">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 justify-end">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  {formatDate(
                                    attempt.completedAt || attempt.startedAt
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-500 justify-end mt-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {formatTime(
                                    attempt.completedAt || attempt.startedAt
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Mobile Layout */}
                          <div className="sm:hidden">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isLatest
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {attempt.attemptNumber}
                                </div>
                                {isLatest && (
                                  <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-1.5 py-0.5 rounded-full">
                                    Latest
                                  </span>
                                )}
                                {index < attempts.length - 1 && (
                                  <div
                                    className={`flex items-center gap-1 ${getScoreTrendColor(
                                      trend
                                    )} text-xs`}
                                  >
                                    {getScoreTrendIcon(trend)}
                                    <span>
                                      {trend === 'up'
                                        ? '+'
                                        : trend === 'down'
                                        ? '-'
                                        : '±'}
                                      {Math.abs(
                                        currentScore -
                                          (attempts[index + 1].percentage ??
                                            (attempts[index + 1].score || 0))
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div
                                  className={`text-xl font-bold ${getScoreBadgeColor(
                                    currentScore
                                  )}`}
                                >
                                  {currentScore.toFixed(2)}%
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatDate(
                                    attempt.completedAt || attempt.startedAt
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 text-center text-xs">
                              <div className="flex items-center justify-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span>{attempt.correctAnswers || 0}</span>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-red-600">
                                <XCircle className="w-3 h-3" />
                                <span>{attempt.wrongAnswers || 0}</span>
                              </div>
                              <div className="flex items-center justify-center gap-1 text-blue-600">
                                <Timer className="w-3 h-3" />
                                <span>
                                  {formatDuration(attempt.totalTimeSec || 0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                              <span className="font-medium">Progress</span>
                              <span>
                                {attempt.totalAttempted || 0} /{' '}
                                {attempt.totalQuestions || 0} questions
                              </span>
                            </div>
                            <ProgressBar
                              value={
                                attempt.totalQuestions
                                  ? ((attempt.totalAttempted || 0) /
                                      attempt.totalQuestions) *
                                    100
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm sm:text-base w-full sm:w-auto rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                  >
                    Close
                  </button>
                  {attempts.length > 1 && (
                    <button
                      onClick={() => onSelectAttempt(attempts[0])}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base w-full sm:w-auto rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Latest
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
