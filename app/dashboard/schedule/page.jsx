'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StudyCard from '@/components/ui/StudyCard'
import {
  Calendar,
  Clock,
  Target,
  Brain,
  Zap,
  Trophy,
  AlertCircle,
  BookOpen,
  TrendingUp,
  CheckCircle,
  RotateCcw,
  Sparkles,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function SchedulePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [scheduleData, setScheduleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [todaysTestAnalytics, setTodaysTestAnalytics] = useState(null)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)

  const searchParams = useSearchParams()

  const fetchSchedule = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setGenerating(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const url = forceRefresh
        ? '/api/user/schedule?force=true'
        : '/api/user/schedule'
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setScheduleData(data)
      } else {
        throw new Error('Failed to fetch schedule')
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      setError('Failed to load schedule. Please try again.')
      toast.error('Failed to load schedule')
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
    const completedTestAttemptId = searchParams.get('completedTestAttemptId')
    if (completedTestAttemptId) {
      fetchSingleTestAnalytics(completedTestAttemptId)
    }
  }, [searchParams])

  const handleTestAction = (test, action) => {
    if (action === 'attempt' || action === 'reattempt') {
      router.push(`/dashboard/test/${test.testId}`)
    }
  }

  const handleGenerateSchedule = () => {
    setTodaysTestAnalytics(null)
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.delete('completedTestAttemptId')
    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/dashboard/schedule${query}`)
    fetchSchedule(true)
  }

  const fetchSingleTestAnalytics = async (attemptId) => {
    setIsAnalyticsLoading(true)
    try {
      const response = await fetch(
        `/api/user/schedule/test-analytics?attemptId=${attemptId}`
      )
      if (response.ok) {
        const data = await response.json()
        setTodaysTestAnalytics(data)
      } else {
        throw new Error('Failed to fetch test analytics')
      }
    } catch (error) {
      console.error('Error fetching test analytics:', error)
      toast.error('Could not load analytics for the completed test.')
    } finally {
      setIsAnalyticsLoading(false)
    }
  }

  const handleMarkAsComplete = async (date) => {
    // Optimistic update
    const originalScheduleData = { ...scheduleData }
    const updatedScheduleList = (
      originalScheduleData.scheduleData ||
      originalScheduleData.weeklySchedule ||
      originalScheduleData.studyPlan
    ).map((day) => (day.date === date ? { ...day, completed: true } : day))

    // Differentiate based on what the original object had
    if (originalScheduleData.scheduleData) {
      setScheduleData({
        ...originalScheduleData,
        scheduleData: updatedScheduleList,
      })
    } else if (originalScheduleData.weeklySchedule) {
      setScheduleData({
        ...originalScheduleData,
        weeklySchedule: updatedScheduleList,
      })
    } else if (originalScheduleData.studyPlan) {
      setScheduleData({
        ...originalScheduleData,
        studyPlan: updatedScheduleList,
      })
    }

    try {
      const response = await fetch('/api/user/schedule/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateToMark: date }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark as complete')
      }
      toast.success('Task marked as complete!')
      // refetch to be sure
      fetchSchedule()
    } catch (error) {
      // Revert on error
      setScheduleData(originalScheduleData)
      toast.error('Could not update task. Please try again.')
      console.error('Failed to mark as complete:', error)
    }
  }

  const getCurrentDay = () => {
    const today = new Date()
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return days[today.getDay()]
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSectionIcon = (section) => {
    const icons = {
      ENGLISH: '📚',
      GK_CA: '🌍',
      LEGAL_REASONING: '⚖️',
      LOGICAL_REASONING: '🧠',
      QUANTITATIVE_TECHNIQUES: '🔢',
    }
    return icons[section] || '📖'
  }

  const getSectionColor = (section) => {
    const colors = {
      ENGLISH: 'bg-blue-100 text-blue-800 border-blue-200',
      GK_CA: 'bg-green-100 text-green-800 border-green-200',
      LEGAL_REASONING: 'bg-purple-100 text-purple-800 border-purple-200',
      LOGICAL_REASONING: 'bg-orange-100 text-orange-800 border-orange-200',
      QUANTITATIVE_TECHNIQUES: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[section] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="relative top-10 left-10 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full  opacity-10 " />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="h-12 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="rounded-2xl shadow-lg bg-gray-100 animate-pulse h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="text-center space-y-6">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-red-600 font-medium">{error}</p>
            <Button 
              onClick={() => fetchSchedule(true)} 
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!scheduleData) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="text-center space-y-6">
            <Brain className="h-16 w-16 mx-auto text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">No schedule data available</h1>
            <p className="text-gray-600">Please try generating a new schedule</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Your 7-Day Study Plan
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              {getCurrentDate()}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerateSchedule}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200 font-medium"
            >
              {generating ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? 'Generating...' : 'Generate New Schedule'}
            </Button>
          </div>
        </motion.div>

        {/* Loading and Error States */}
        <AnimatePresence>
          {loading && (
            <motion.div exit={{ opacity: 0 }}>
              {/* Skeleton Loader */}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Error State */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!loading && !error && scheduleData && (
          <>
            {/* No Analytics State */}
            {!scheduleData.hasAnalytics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="w-5 h-5" />
                      Build Your Learning Profile
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                      Complete some tests to get personalized recommendations
                      and AI-powered insights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Start with these recommended tests to build your
                        analytics profile:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scheduleData.availableTests
                          ?.slice(0, 6)
                          .map((test) => (
                            <Card key={test.id} className="border-amber-200">
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <h3 className="font-medium text-slate-900 dark:text-white">
                                    {test.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    <Clock className="w-4 h-4" />
                                    {test.durationInMinutes} min
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {test.sections.map((section) => (
                                      <Badge
                                        key={section}
                                        variant="secondary"
                                        className={`text-xs ${getSectionColor(
                                          section
                                        )}`}
                                      >
                                        {getSectionIcon(section)}{' '}
                                        {section.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() =>
                                      router.push(`/dashboard/test/${test.id}`)
                                    }
                                  >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Start Test
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Weekly Schedule */}
            {scheduleData.hasAnalytics && (
              <>
                {/* AI Insights */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Brain className="w-5 h-5" />
                        AI-Powered Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                            <Trophy className="w-4 h-4 inline mr-2" />
                            Strengths
                          </h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            {scheduleData.insights.strengths?.map(
                              (strength, index) => (
                                <li key={index}>• {strength}</li>
                              )
                            ) || ['Complete more tests to identify strengths']}
                          </ul>
                        </div>

                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                            <Target className="w-4 h-4 inline mr-2" />
                            Focus Areas
                          </h4>
                          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                            {scheduleData.insights.weaknesses?.map(
                              (weakness, index) => (
                                <li key={index}>• {weakness}</li>
                              )
                            ) || [
                              'Complete more tests to identify focus areas',
                            ]}
                          </ul>
                        </div>

                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            <Zap className="w-4 h-4 inline mr-2" />
                            Recommendations
                          </h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            {scheduleData.recommendations
                              ?.slice(0, 3)
                              .map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              )) || [
                              'Complete more tests for personalized recommendations',
                            ]}
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          <TrendingUp className="w-4 h-4 inline mr-2" />
                          Performance Summary
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {scheduleData.insights.overallPerformance ||
                            'Complete more tests to get performance insights'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div> */}

                {/* Weekly Schedule Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {(
                      scheduleData.weeklySchedule ||
                      scheduleData.scheduleData ||
                      scheduleData.studyPlan
                    )?.map((day, index) => {
                      const isToday = day.day === getCurrentDay()
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const dayDate = new Date(day.date)
                      // Adjust for timezone offset by creating date from parts
                      const adjustedDayDate = new Date(
                        dayDate.getUTCFullYear(),
                        dayDate.getUTCMonth(),
                        dayDate.getUTCDate()
                      )
                      const isPastOrToday = adjustedDayDate <= today

                      // Define badge gradient combinations for each card
                      const badgeGradients = [
                        'from-blue-500 to-purple-600',
                        'from-pink-500 to-red-600',
                        'from-green-500 to-teal-600',
                        'from-orange-500 to-pink-600',
                        'from-purple-500 to-indigo-600',
                        'from-cyan-500 to-blue-600',
                        'from-rose-500 to-pink-600'
                      ]

                      const badgeGradient = badgeGradients[index % badgeGradients.length]

                      return (
                        <StudyCard
                          key={index}
                          day={day.day}
                          date={new Date(day.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          testName={day.testTitle || 'No test available'}
                          duration={day.durationInMinutes || 0}
                          badgeLabel={day.sections?.[0]?.replace('_', ' ') || 'Study'}
                          badgeGradient={badgeGradient}
                          focusText={day.focus || 'Focus on your studies'}
                          isToday={isToday}
                          isCompleted={day.completed}
                          isAttempted={day.isAttempted}
                          onTestAction={(action) => handleTestAction(day, action)}
                          sections={day.sections || []}
                          reason={day.reason || ''}
                        />
                      )
                    })}
                  </div>
                </motion.div>
              </>
            )}

            {/* Today's Test Analytics Section */}
            <AnimatePresence>
              {isAnalyticsLoading && (
                <motion.div exit={{ opacity: 0 }}>
                  {/* Analytics Skeleton */}
                </motion.div>
              )}
              {todaysTestAnalytics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                        <BarChart3 className="w-5 h-5" />
                        Results for: {todaysTestAnalytics.test.title}
                      </CardTitle>
                      <CardDescription className="text-green-700 dark:text-green-300">
                        Here's how you performed on the test you just completed.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Score
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {todaysTestAnalytics.score.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Percentage
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {todaysTestAnalytics.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Correct
                        </h4>
                        <p className="text-2xl font-bold text-green-600">
                          {todaysTestAnalytics.correctAnswers}
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg text-center">
                        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Wrong
                        </h4>
                        <p className="text-2xl font-bold text-red-500">
                          {todaysTestAnalytics.wrongAnswers}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
