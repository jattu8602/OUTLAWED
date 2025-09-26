'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
} from 'recharts'
import {
  Target,
  Clock,
  BookOpen,
  Calendar,
  Zap,
  BarChart3,
  Activity,
  Brain,
  Timer,
  Trophy,
  Flame,
  PieChartIcon,
  LineChartIcon,
  Percent,
  Hash,
  ArrowUp,
  ArrowDown,
  Minus,
  RotateCcw,
} from 'lucide-react'

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#8dd1e1',
  '#d084d0',
]

const SECTION_COLORS = {
  ENGLISH: '#3b82f6',
  GK_CA: '#10b981',
  LEGAL_REASONING: '#8b5cf6',
  LOGICAL_REASONING: '#f59e0b',
  QUANTITATIVE_TECHNIQUES: '#ef4444',
}

export default function EnhancedAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedView, setSelectedView] = useState('overview')
  const [lastFetchTime, setLastFetchTime] = useState(null)

  // Cache key for localStorage
  const CACHE_KEY = 'analytics_data'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const now = Date.now()
        if (now - timestamp < CACHE_DURATION) {
          return data
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error)
    }
    return null
  }, [])

  const setCachedData = useCallback((data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error setting cache:', error)
    }
  }, [])

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }, [])

  const fetchAnalytics = useCallback(
    async (forceRefresh = false) => {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getCachedData()
        if (cachedData) {
          setAnalytics(cachedData)
          setLoading(false)
          setError(null)
          return
        }
      }

      try {
        setRefreshing(true)
        setError(null)
        const response = await fetch('/api/user/analytics', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.analytics)
          setCachedData(data.analytics)
          setLastFetchTime(Date.now())
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Failed to load analytics data. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [getCachedData, setCachedData]
  )

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="relative overflow-hidden animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
              <div className="absolute top-0 right-0 w-16 h-16 bg-muted/20 rounded-bl-3xl"></div>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Content Skeleton */}
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-56 mb-2"></div>
              <div className="h-4 bg-muted rounded w-72"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please check your connection and try again.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Retry
            </button>
            <button
              onClick={() => {
                clearCache()
                fetchAnalytics(true)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Cache & Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No analytics data available yet.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Complete some tests to see your performance insights!
          </p>
        </CardContent>
      </Card>
    )
  }

  const { overview, dailyAnalytics, sectionAnalytics, insights } = analytics
  const displayData =
    selectedPeriod === '7d'
      ? analytics.recentActivity.last7Days
      : analytics.recentActivity.last30Days

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.round((seconds % 60) * 100) / 100 // Round to 2 decimal places
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs.toFixed(1)}s`
    return `${secs.toFixed(1)}s`
  }

  const getSectionColor = (section) => {
    return SECTION_COLORS[section] || '#6b7280'
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

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  // Prepare chart data
  const performanceData = displayData.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: day.averageScore,
    questions: day.questionsAnswered,
    time: Math.round(day.timeSpent / 60), // Convert to minutes
    tests: day.testsAttempted,
  }))

  const sectionData = Object.entries(sectionAnalytics).map(
    ([section, data]) => ({
      section: section.replace('_', ' '),
      accuracy: data.accuracy,
      total: data.total,
      correct: data.correct,
      wrong: data.wrong,
      avgTime: data.averageTime,
      color: getSectionColor(section),
    })
  )

  const pieData = sectionData.map((item) => ({
    name: item.section,
    value: item.total,
    color: item.color,
  }))

  const timeDistributionData = sectionData.map((item) => ({
    section: item.section,
    time: Math.round(item.avgTime * 100) / 100, // Round to 2 decimal places
    color: item.color,
  }))

  const accuracyComparisonData = sectionData.map((item) => ({
    section: item.section,
    accuracy: item.accuracy,
    questions: item.total,
    color: item.color,
  }))

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Performance Analytics
            </h1>
            {refreshing && (
              <div className="animate-spin">
                <RotateCcw className="h-5 w-5 text-blue-500" />
              </div>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive insights into your learning journey
          </p>
          {lastFetchTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Buttons */}
          {/* <div className="flex gap-2 items-center">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
            <button
              onClick={() => {
                clearCache()
                fetchAnalytics(true)
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear cache and refresh"
            >
              <RotateCcw className="h-4 w-4" />
              Force Refresh
            </button>
          </div> */}

          {/* Dropdowns side by side on mobile */}
          <div className="flex gap-2 w-full items-center">
            <Select
              value={selectedView}
              onValueChange={setSelectedView}
              className="flex-1 bg-white dark:bg-gray-300"
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-300">
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="trends">Trends</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              className="flex-1 bg-white dark:bg-gray-300"
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-300">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            title: 'Total Tests',
            value: overview.totalTests,
            description: `${overview.currentStreak} day streak`,
            icon: BookOpen,
            iconColor: 'text-muted-foreground',
            cornerGradient: 'from-blue-500/10 to-transparent',
            extraIcon: Flame,
            extraIconColor: 'text-orange-500',
          },
          {
            title: 'Average Score',
            value: `${overview.averageScore.toFixed(1)}%`,
            description: `${
              overview.improvementTrend > 0 ? '+' : ''
            }${overview.improvementTrend.toFixed(1)}% this week`,
            icon: Target,
            iconColor: 'text-muted-foreground',
            cornerGradient: 'from-green-500/10 to-transparent',
          },
          {
            title: 'Questions Answered',
            value: overview.totalQuestions,
            description: (
              <>
                <span className="text-green-600">
                  {overview.totalCorrect} ✓
                </span>{' '}
                • <span className="text-red-600">{overview.totalWrong} ✗</span>{' '}
                •{' '}
                <span className="text-gray-500">
                  {overview.totalQuestions -
                    overview.totalCorrect -
                    overview.totalWrong}{' '}
                  —
                </span>
              </>
            ),
            icon: Hash,
            iconColor: 'text-muted-foreground',
            cornerGradient: 'from-purple-500/10 to-transparent',
          },
          {
            title: 'Study Time',
            value: formatTime(overview.totalTimeSpent),
            description: `${formatTime(
              insights.averageTimePerQuestion
            )} per question`,
            icon: Clock,
            iconColor: 'text-muted-foreground',
            cornerGradient: 'from-orange-500/10 to-transparent',
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon
          const ExtraIconComponent = stat.extraIcon
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent
                  className={`h-3 sm:h-4 w-3 sm:w-4 ${stat.iconColor}`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {stat.value}
                </div>
                {ExtraIconComponent ? (
                  <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground">
                    <ExtraIconComponent
                      className={`h-2.5 sm:h-3 w-2.5 sm:w-3 ${stat.extraIconColor} mr-1`}
                    />
                    {stat.description}
                  </div>
                ) : (
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                )}
                <div
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.cornerGradient} rounded-bl-3xl`}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Charts Section */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Performance Trend Chart */}
          <div className="w-full px-2 sm:px-0">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <LineChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  Performance Trend
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your score progression over time
                </CardDescription>
              </CardHeader>
              <CardContent className="w-full">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart
                    data={performanceData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="score"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      stroke="#8884d8"
                      name="Score %"
                      strokeWidth={2}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="questions"
                      fill="#82ca9d"
                      name="Questions"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Section Distribution */}
          <Card className="col-span-1 ">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Question Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Questions attempted by section
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"

                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'detailed' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Section-wise Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Section-wise Performance Analysis
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Detailed breakdown of your performance across all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {Object.entries(sectionAnalytics).map(([section, data]) => (
                  <div key={section} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getSectionColor(section) }}
                        />
                        <span className="text-base sm:text-lg font-medium">
                          {getSectionIcon(section)} {section.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs sm:text-sm font-semibold w-fit"
                        style={{
                          backgroundColor: `${getSectionColor(section)}20`,
                          color: getSectionColor(section),
                        }}
                      >
                        {data.accuracy.toFixed(1)}% Accuracy
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                      <div className="bg-muted/50 p-2 sm:p-3 rounded-lg">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Total Questions
                        </div>
                        <div className="text-lg sm:text-xl font-bold">
                          {data.total}
                        </div>
                      </div>
                      <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-xs sm:text-sm text-green-700">
                          Correct
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-green-600">
                          {data.correct}
                        </div>
                      </div>
                      <div className="bg-red-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-xs sm:text-sm text-red-700">
                          Wrong
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-red-600">
                          {data.wrong}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                        <div className="text-xs sm:text-sm text-blue-700">
                          Avg Time
                        </div>
                        <div className="text-lg sm:text-xl font-bold text-blue-600">
                          {formatTime(data.averageTime)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Accuracy Progress</span>
                        <span>{data.accuracy.toFixed(1)}%</span>
                      </div>
                      <Progress value={data.accuracy} className="h-2 sm:h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
                  Time Distribution
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Average time spent per section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={timeDistributionData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="section"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [
                        `${Math.round(value * 100) / 100}s`,
                        'Avg Time',
                      ]}
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Bar dataKey="time" fill="#8884d8">
                      {timeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5" />
                  Accuracy Comparison
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Accuracy vs Questions attempted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={accuracyComparisonData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="questions"
                      name="Questions"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="accuracy"
                      name="Accuracy"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        fontSize: '12px',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Scatter dataKey="accuracy" fill="#8884d8">
                      {accuracyComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {selectedView === 'trends' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Daily Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Daily Activity Pattern
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your study consistency over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {displayData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                    No activity in this period
                  </p>
                ) : (
                  <div className="grid gap-2 sm:gap-3">
                    {displayData.map((day, index) => (
                      <div
                        key={day.date}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors gap-3 sm:gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex flex-col items-center">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base">
                              {new Date(day.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {day.testsAttempted} test
                              {day.testsAttempted !== 1 ? 's' : ''} •{' '}
                              {day.questionsAnswered} questions •{' '}
                              {formatTime(day.timeSpent)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {day.averageScore.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {day.correctAnswers}✓ {day.wrongAnswers}✗
                            </div>
                          </div>
                          <div className="w-16 sm:w-16">
                            <Progress
                              value={day.averageScore}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Personalized recommendations based on your performance patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Trophy className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-green-600 mb-3" />
                  <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">
                    Strongest Area
                  </h3>
                  <p className="text-xs sm:text-sm text-green-600 mb-2">
                    {insights.bestPerformingSection.replace('_', ' ')}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 text-xs"
                  >
                    {sectionAnalytics[
                      insights.bestPerformingSection
                    ]?.accuracy.toFixed(1)}
                    % accuracy
                  </Badge>
                </div>

                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <Activity className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-blue-600 mb-3" />
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                    Most Active
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-600 mb-2">
                    {insights.mostActiveSection.replace('_', ' ')}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 text-xs"
                  >
                    {sectionAnalytics[insights.mostActiveSection]?.total}{' '}
                    questions
                  </Badge>
                </div>

                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <Target className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-orange-600 mb-3" />
                  <h3 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">
                    Focus Area
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-600 mb-2">
                    {insights.needsImprovement.replace('_', ' ')}
                  </p>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 text-xs"
                  >
                    {sectionAnalytics[
                      insights.needsImprovement
                    ]?.accuracy.toFixed(1)}
                    % accuracy
                  </Badge>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h4 className="font-semibold text-blue-800 text-sm sm:text-base">
                    Consistency Score
                  </h4>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <Progress
                    value={insights.consistencyScore}
                    className="flex-1 h-2 sm:h-3"
                  />
                  <span className="font-bold text-blue-600 text-base sm:text-lg">
                    {insights.consistencyScore.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-700">
                  {insights.consistencyScore > 80
                    ? "🎉 Excellent consistency! You're building strong study habits. Keep up the momentum!"
                    : insights.consistencyScore > 60
                    ? '👍 Good consistency! Try to maintain regular study sessions for even better results.'
                    : '💪 Focus on building a consistent study routine. Small daily efforts lead to big improvements!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
