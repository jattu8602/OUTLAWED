'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Leaderboard Skeleton Components
export const LeaderboardSkeleton = () => {
  return (
    <div className="min-h-screen w-full dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="h-8 sm:h-10 lg:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mx-auto animate-pulse"></div>
          <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded w-80 mx-auto animate-pulse"></div>
        </div>

        {/* Top 3 Podium Skeleton */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center items-end space-x-4 md:space-x-8 lg:space-x-8">
            {/* 2nd Place Skeleton */}
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-90 sm:scale-95">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center space-y-2 max-w-32">
                <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto animate-pulse"></div>
                <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            </div>

            {/* 1st Place Skeleton */}
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-105 sm:scale-110">
              <div className="relative">
                <div className="w-20 h-20 sm:w-22 sm:h-22 lg:w-24 lg:h-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center space-y-2 max-w-36">
                <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded w-28 animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto animate-pulse"></div>
                <div className="h-8 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto animate-pulse"></div>
              </div>
            </div>

            {/* 3rd Place Skeleton */}
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 transform scale-90 sm:scale-95">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center space-y-2 max-w-32">
                <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto animate-pulse"></div>
                <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Users Skeleton */}
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-2 border-primary bg-primary/5 dark:border-slate-700">
            <CardHeader className="pb-4">
              <div className="h-6 sm:h-7 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 sm:p-6 rounded-lg border border-slate-900 dark:border-slate-700"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-8 animate-pulse"></div>
                          <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                        </div>
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right ml-4">
                      <div className="h-6 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                      <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mt-1 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current User Skeleton */}
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-2 border-primary bg-primary/5 dark:border-slate-700">
            <CardHeader className="pb-4">
              <div className="h-6 sm:h-7 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-3 sm:mb-4">
                    <div className="h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="text-center bg-white dark:bg-slate-800 rounded-lg p-3 border"
                      >
                        <div className="h-5 sm:h-6 bg-slate-200 dark:bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto mt-1 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Payment History Skeleton Components
export const PaymentHistorySkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-96 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Payment System Status Skeleton */}
        <Card className="mb-6 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-48 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans Skeleton (for free users) */}
        <div className="mb-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <div className="h-2 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <CardHeader className="pb-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24 mx-auto animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto mt-1 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History Skeleton */}
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-1 animate-pulse"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10 mb-1 animate-pulse"></div>
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Payment History Skeleton for Free Users (shows plans to purchase)
export const PaymentHistoryFreeUserSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-96 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Payment System Status Skeleton */}
        <Card className="mb-6 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-48 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <div className="h-2 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto mt-1 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-48 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History Skeleton */}
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-6 animate-pulse"></div>
          <Card className="border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded animate-pulse"></div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-80 mx-auto animate-pulse"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Payment History Skeleton for Paid Users (shows current plan status)
export const PaymentHistoryPaidUserSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-96 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Current Plan Status Skeleton */}
        <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-700/20"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <div className="w-6 h-6 bg-white/20 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-white/20 rounded-lg w-48 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-16 animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  <div className="h-4 bg-white/20 rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-white/20 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment History Skeleton */}
        <div>
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-64 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-1 animate-pulse"></div>
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-1 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12 mb-1 animate-pulse"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10 mb-1 animate-pulse"></div>
                      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Generic Card Skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardHeader>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        </td>
      ))}
    </tr>
  )
}

// List Item Skeleton
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
    </div>
  )
}
