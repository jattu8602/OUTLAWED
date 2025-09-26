'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Users,
  Target,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeaderboardSkeleton } from '@/components/ui/skeleton-loaders'
import { LoadingProgress } from '@/components/ui/LoadingProgress'
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading'

// Enhanced cache with better performance
const leaderboardCache = {
  leaderboardData: null,
  lastFetchTime: null,
  cacheExpiry: 10 * 60 * 1000, // 10 minutes cache for better performance
  isFetching: false, // Prevent multiple simultaneous requests
}

export default function Leaderboard() {
  const { data: session } = useSession()

  // Progressive loading hook
  const fetchLeaderboardData = useCallback(async (signal) => {
    const response = await fetch('/api/leaderboard', {
      signal,
      headers: {
        'Cache-Control': 'max-age=600',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard data: ${response.status}`)
    }

    return await response.json()
  }, [])

  const {
    data: leaderboardResponse,
    loading,
    error,
    isRefreshing,
    progress,
    refetch,
  } = useProgressiveLoading(fetchLeaderboardData, {
    initialData: leaderboardCache.leaderboardData
      ? {
          leaderboard: leaderboardCache.leaderboardData,
        }
      : null,
    cacheKey: 'leaderboard',
    cacheExpiry: 10 * 60 * 1000, // 10 minutes
    enableBackgroundRefresh: true,
  })

  const leaderboardData = leaderboardResponse?.leaderboard || null
  const currentUser = leaderboardResponse?.currentUser || null
  const weekInfo = leaderboardResponse?.weekInfo || null
  const timeRemaining = leaderboardResponse?.timeRemaining || null
  const isWeekly = leaderboardResponse?.isWeekly || false

  // Update cache when data changes
  useEffect(() => {
    if (leaderboardResponse?.leaderboard) {
      leaderboardCache.leaderboardData = leaderboardResponse.leaderboard
      leaderboardCache.lastFetchTime = Date.now()
    }
  }, [leaderboardResponse])

  // Memoized utility functions for better performance
  const getRankIcon = useCallback((rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
      default:
        return <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
    }
  }, [])

  const getRankBadgeColor = useCallback((rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white'
      case 2:
        return 'bg-gray-400 text-white'
      case 3:
        return 'bg-amber-600 text-white'
      default:
        return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
    }
  }, [])

  const getUserInitials = useCallback((name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  // Memoized data processing for better performance
  const processedData = useMemo(() => {
    if (!leaderboardData) return { top3Users: [], otherUsers: [] }

    const top3Users = leaderboardData.slice(0, 3)
    const otherUsers = leaderboardData.slice(3, 10)

    return { top3Users, otherUsers }
  }, [leaderboardData])

  if (loading && !leaderboardData) {
    return <LeaderboardSkeleton />
  }

  // Show progress bar for refreshing
  if (isRefreshing && progress > 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <LoadingProgress
          progress={progress}
          message="Updating leaderboard..."
          className="max-w-md"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md w-full">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              Something went wrong
            </h3>
            <p className="text-sm sm:text-base text-red-500">Error: {error}</p>
            <Button onClick={refetch} className="mt-4" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { top3Users, otherUsers } = processedData

  return (
    <div className="min-h-screen w-full dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
              🏆 Weekly Leaderboard
            </h1>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={loading || isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading || isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </Button>
          </div>

          {/* Weekly Information */}
          {isWeekly && weekInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 max-w-2xl mx-auto border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    📅 Week of {weekInfo.range}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Resets every Monday at 12:00 AM
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    ⏰ {timeRemaining} left
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {weekInfo.daysRemaining} days remaining
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {isWeekly
              ? 'Weekly top performers in CLAT preparation'
              : 'Top performers in CLAT preparation'}
          </p>
        </div>

        {/* Top 3 Users - Podium Style */}
        {top3Users.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
            {/* Desktop Podium Layout (sm and above) */}
            <div className="">
              <div className="flex justify-center items-end space-x-4 md:space-x-8 lg:space-x-8">
                {/* 2nd Place - Left */}
                {top3Users[1] && (
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-90 sm:scale-95">
                    <div className="relative">
                      <Avatar className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 border-4 border-gray-400">
                        <AvatarImage src={top3Users[1].image} />
                        <AvatarFallback className="text-slate-900 dark:text-slate-100 sm:text-lg font-semibold ">
                          {getUserInitials(top3Users[1].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                        {getRankIcon(2)}
                      </div>
                    </div>
                    <div className="text-center space-y-2 max-w-32">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {top3Users[1].name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-gray-400 text-white text-xs"
                      >
                        2nd Place
                      </Badge>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {top3Users[1].totalScore}
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{top3Users[1].totalTests} tests</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place - Center */}
                {top3Users[0] && (
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-105 sm:scale-110">
                    <div className="relative">
                      <Avatar className="w-20 h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24 border-4 border-yellow-500">
                        <AvatarImage src={top3Users[0].image} />
                        <AvatarFallback className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                          {getUserInitials(top3Users[0].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                        {getRankIcon(1)}
                      </div>
                    </div>
                    <div className="text-center space-y-2 max-w-36">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {top3Users[0].name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-500 text-white text-xs"
                      >
                        1st Place
                      </Badge>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {top3Users[0].totalScore}
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{top3Users[0].totalTests} tests</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place - Right */}
                {top3Users[2] && (
                  <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-90 sm:scale-95">
                    <div className="relative">
                      <Avatar className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 border-4 border-amber-600">
                        <AvatarImage src={top3Users[2].image} />
                        <AvatarFallback className="text-slate-900 dark:text-slate-100 sm:text-lg font-semibold">
                          {getUserInitials(top3Users[2].name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                        {getRankIcon(3)}
                      </div>
                    </div>
                    <div className="text-center space-y-2 max-w-32">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {top3Users[2].name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-amber-600 text-white text-xs"
                      >
                        3rd Place
                      </Badge>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {top3Users[2].totalScore}
                      </p>
                      <div className="flex items-center justify-center space-x-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{top3Users[2].totalTests} tests</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users 4-10 - Single Column Strip Layout */}
        {otherUsers.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
            <Card className="border-2 border-primary bg-primary/5 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-slate-100" />
                  <span className="text-slate-900 dark:text-slate-100">
                    {isWeekly
                      ? 'Other Weekly Top Performers'
                      : 'Other Top Performers'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {otherUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 sm:p-6 rounded-lg border border-slate-900 dark:border-slate-700 dark:hover:bg-slate-800 transition-all duration-200 hover:shadow-md"
                    >
                      {/* Left side - User info */}
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-slate-200 dark:border-slate-700">
                            <AvatarImage src={user.image} />
                            <AvatarFallback className="text-sm text-slate-900 dark:text-slate-100 font-semibold">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            {getRankIcon(user.rank)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`${getRankBadgeColor(
                                user.rank
                              )} text-xs sm:text-sm font-semibold px-2 py-1`}
                            >
                              #{user.rank}
                            </Badge>
                            <h4 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 truncate">
                              {user.name}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-3 sm:space-x-4 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{user.totalTests} tests</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {user.role === 'PAID' ? 'Paid' : 'Free'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Score */}
                      <div className="flex-shrink-0 text-right ml-4">
                        <div className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-slate-100">
                          {user.totalScore}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                          points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current User's Rank */}
        {currentUser && (
          <div className="w-full max-w-4xl mx-auto ">
            <Card className="border-2 border-primary bg-primary/5 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 dark:text-slate-100" />
                  <span className="text-slate-900 dark:text-slate-100">
                    {isWeekly ? 'Your Weekly Ranking' : 'Your Ranking'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-slate-900 dark:border-slate-400">
                      <AvatarImage src={currentUser.image} />
                      <AvatarFallback className="text-slate-900 dark:text-slate-100 sm:text-lg font-semibold">
                        {getUserInitials(currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -right-1">
                      {getRankIcon(currentUser.rank)}
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 sm:mb-4">
                      <h3 className="font-semibold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                        {currentUser.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${getRankBadgeColor(
                          currentUser.rank
                        )} self-start`}
                      >
                        Rank #{currentUser.rank}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-3 border">
                        <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                          {currentUser.totalScore}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Total Score
                        </p>
                      </div>
                      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-3 border">
                        <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                          {currentUser.totalTests}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Tests Taken
                        </p>
                      </div>
                      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-3 border">
                        <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                          {currentUser.paidTests}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Paid Tests
                        </p>
                      </div>
                      <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-3 border">
                        <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100">
                          {currentUser.freeTests}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          Free Tests
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Data State */}
        {(!leaderboardData || leaderboardData.length === 0) && (
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No Leaderboard Data
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Start taking tests to appear on the leaderboard!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
