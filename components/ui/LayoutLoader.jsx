'use client'

import { memo } from 'react'

const LayoutLoader = memo(function LayoutLoader({
  message = 'Please wait while we prepare your workspace',
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-4">
      <div className="text-center space-y-6">
        {/* Spinner Container */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer muted spinner */}
          <div className="animate-spin rounded-full h-full w-full border-4 border-slate-200 dark:border-slate-700"></div>
          {/* Inner colored spinner */}
          <div className="absolute top-0 left-0 animate-spin rounded-full h-full w-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
        </div>

        {/* Text Section */}
        <div className="space-y-1">
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Loading...
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
})

export default LayoutLoader
