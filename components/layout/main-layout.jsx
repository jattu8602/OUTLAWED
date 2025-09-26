'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useLayout, useOptimizedSession } from '@/lib/contexts/LayoutContext'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import LayoutLoader from '@/components/ui/LayoutLoader'

export default function MainLayout({ children, isAdmin = false }) {
  const { session, status, isAdmin: cachedIsAdmin } = useOptimizedSession()
  const { sidebarOpen, setSidebarOpen, isInitialized } = useLayout()
  const router = useRouter()

  useEffect(() => {
    // Only run auth checks if we're initialized and not loading
    if (!isInitialized || status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (isAdmin && !cachedIsAdmin) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, isAdmin, cachedIsAdmin, isInitialized])

  // Show loading if not initialized or session is loading
  // if (!isInitialized || status === 'loading') {
  //   return <LayoutLoader />
  // }

  if (!session || (isAdmin && !cachedIsAdmin)) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Fixed and full height */}
      <Sidebar
        isAdmin={isAdmin}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Sticky */}
        <Header
          isAdmin={isAdmin}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content - Scrollable with responsive padding */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-300">
          {/* Mobile: No padding, Direct content */}
          <div className="lg:p-2 lg:max-w-7xl lg:mx-auto">
            <div className="">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
