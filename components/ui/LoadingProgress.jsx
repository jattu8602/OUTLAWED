'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function LoadingProgress({
  progress = 0,
  message = 'Loading...',
  showPercentage = true,
  className = '',
}) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* Progress Text */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {message}
            </span>
            {showPercentage && (
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {Math.round(displayProgress)}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  message = 'Loading...',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-primary ${sizeClasses[size]}`}
      />
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  )
}

export function LoadingDots({ className = '', message = 'Loading...' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  )
}

export function LoadingPulse({ className = '', message = 'Loading...' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="relative">
        <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
        <div className="absolute inset-0 w-8 h-8 bg-primary rounded-full animate-ping opacity-20" />
      </div>
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  )
}

export function LoadingWave({ className = '', message = 'Loading...' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 h-6 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      )}
    </div>
  )
}

export function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
          }}
        />
      ))}
    </div>
  )
}

export function LoadingCard({ className = '' }) {
  return (
    <Card className={`animate-pulse ${className}`}>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </Card>
  )
}
