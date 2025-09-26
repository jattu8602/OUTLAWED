'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Maximize, Minimize } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Crown,
  Search,
  User,
  LogOut,
  Settings,
  MessageCircle,
  Shield,
  Sparkles,
  Menu,
} from 'lucide-react'

export default function Header({
  isAdmin = false,
  sidebarOpen,
  setSidebarOpen,
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchFocus, setSearchFocus] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch notification count
  useEffect(() => {
    if (session) {
      fetchNotificationCount()
    }
  }, [session])

  const fetchNotificationCount = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        if (session?.user?.role === 'ADMIN') {
          setNotificationCount(
            data.stats.notifications.unreadNotifications || 0
          )
        } else {
          // For regular users, count unread notifications
          const unreadCount =
            data.stats.notifications.unreadUserNotifications || 0
          setNotificationCount(unreadCount)

          // Update the favicon badge if available
          if (window.updateFaviconBadge) {
            window.updateFaviconBadge(unreadCount)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching notification count:', error)
    } finally {
      setLoading(false)
    }
  }
  // Check current fullscreen state
  const checkFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    )
  }

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    if (!checkFullscreen()) {
      const el = document.documentElement // change to your specific element
      if (el.requestFullscreen) el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
      else if (el.msRequestFullscreen) el.msRequestFullscreen()

      setIsFullscreen(true) // update UI instantly
    } else {
      if (document.exitFullscreen) document.exitFullscreen()
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      else if (document.msExitFullscreen) document.msExitFullscreen()

      setIsFullscreen(false) // update UI instantly
    }
  }

  // Sync when user presses ESC or exits fullscreen
  useEffect(() => {

    setIsFullscreen(checkFullscreen())
    const handleChange = () => setIsFullscreen(checkFullscreen())

    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    document.addEventListener('msfullscreenchange', handleChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
      document.removeEventListener('webkitfullscreenchange', handleChange)
      document.removeEventListener('msfullscreenchange', handleChange)
    }
  }, [])

  // Function to manually decrement notification count (for immediate UI updates)
  const decrementNotificationCount = () => {
    setNotificationCount((prev) => Math.max(0, prev - 1))
  }

  // Function to manually increment notification count (for new notifications)
  const incrementNotificationCount = () => {
    setNotificationCount((prev) => prev + 1)
  }

  // Refresh notification count function that can be called from parent components
  const refreshNotificationCount = () => {
    fetchNotificationCount()
  }

  // Expose refresh functions to parent component
  useEffect(() => {
    if (window) {
      window.refreshHeaderNotifications = refreshNotificationCount
      window.decrementHeaderNotificationCount = decrementNotificationCount
      window.incrementHeaderNotificationCount = incrementNotificationCount
    }
  }, [
    refreshNotificationCount,
    decrementNotificationCount,
    incrementNotificationCount,
  ])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-slate-900/90 transition-all duration-300 dark:text-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left side - Search and breadcrumb */}
        <div className="flex items-center space-x-6">
          {/* Sidebar Toggle - Mobile Only */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search - Desktop Only */}
          {/* <div className="relative hidden md:block">
            <div
              className={`relative transition-all duration-300 ${
                searchFocus ? 'scale-105' : ''
              }`}
            >
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 ${
                  searchFocus
                    ? 'text-primary'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search tests, topics, or students..."
                className="h-10 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 pl-10 text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all duration-200"
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </div>
          </div> */}
        </div>

        {/* Right side - Theme Toggle, Notifications and Profile */}
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 hover:bg-slate-200 transition-colors"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
          {/* Theme Toggle */}
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ThemeToggle />
          </div>

          {/* Admin Badge */}
          {session?.user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm text-sm lg:text-base">
              <div className="relative">
                <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-400" />
                <Sparkles className="h-2 w-2 lg:h-2.5 lg:w-2.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-amber-700 dark:text-amber-300 font-semibold">
                Admin
              </span>
            </div>
          )}

          {/* PRO Badge */}
          {session?.user?.role === 'PAID' && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm text-sm lg:text-base">
              <div className="relative">
                <Crown className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-400" />
                <Sparkles className="h-2 w-2 lg:h-2.5 lg:w-2.5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-amber-700 dark:text-amber-300 font-semibold">
                PRO
              </span>
            </div>
          )}

          {/* FREE Badge */}
          {session?.user?.role === 'FREE' && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-green-500/10 dark:from-green-400/20 dark:to-green-400/20 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl border border-green-200 dark:border-green-800 shadow-sm text-sm lg:text-base">
              <div className="relative">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 dark:text-green-400" />
                <Sparkles className="h-2 w-2 lg:h-2.5 lg:w-2.5 text-green-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-green-700 dark:text-green-300 font-semibold">
                FREE
              </span>
            </div>
          )}

          {/* Profile Dropdown - Desktop Only */}
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Avatar className="h-9 w-9 border-2 border-slate-200 dark:border-slate-700">
                    <AvatarImage
                      src={session?.user?.image || '/default-avatar.png'}
                      alt={session?.user?.name || 'User'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-700">
                        <AvatarImage
                          src={session?.user?.image || '/default-avatar.png'}
                          alt={session?.user?.name || 'User'}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">
                          {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">
                          {session?.user?.role === 'ADMIN'
                            ? 'Administrator'
                            : 'Student'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {session?.user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  className="p-3 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg mx-2 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push('/dashboard/profile')
                    setSidebarOpen(false)
                  }}
                >
                  <User className="mr-3 h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Profile Settings
                  </span>
                </DropdownMenuItem>
                {/* <DropdownMenuItem
                  className="p-3 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg mx-2 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push('/dashboard/payments')
                    setSidebarOpen(false)
                  }}
                >
                  <Settings className="mr-3 h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Payment History
                  </span>
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  className="p-3 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-lg mx-2 cursor-pointer transition-colors"
                  onClick={() => {
                    router.push('/dashboard/notifications')
                    setSidebarOpen(false)
                  }}
                >
                  <Bell className="mr-3 h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">
                    Notifications
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                <DropdownMenuItem
                  className="p-3 focus:bg-red-50 dark:focus:bg-red-900/20 rounded-lg mx-2 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
