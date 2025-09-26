'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  X,
  Home,
  FileText,
  Crown,
  CreditCard,
  Bell,
  User,
  LogOut,
  Settings,
  Users,
  Plus,
  Trophy,
  ChevronRight,
  Sparkles,
  BarChart3,
  BookOpen,
  MessageSquare,
} from 'lucide-react'
import Image from 'next/image'

export default function Sidebar({
  isAdmin = false,
  sidebarOpen,
  setSidebarOpen,
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard statistics
  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh stats function that can be called from parent components
  const refreshStats = () => {
    fetchStats()
  }

  // Expose refresh function to parent component
  useEffect(() => {
    if (window) {
      window.refreshSidebarStats = refreshStats
    }
  }, [refreshStats])

  const navigation = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin', icon: Home },
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users,
          badge: stats?.user?.totalUsers || '0',
        },
        { name: 'Create Test', href: '/admin/create-test', icon: Plus },
        {
          name: 'Test Series',
          href: '/admin/test-series',
          icon: FileText,
          badge: stats?.tests?.series || '0',
        },
        { name: 'Payments', href: '/admin/payment-history', icon: CreditCard },
        {
          name: 'Reviews',
          href: '/admin/reviews',
          icon: MessageSquare,
          badge: stats?.reviews?.totalReviews || '0',
        },
        {
          name: 'Notifications',
          href: '/admin/notifications',
          icon: Bell,
          badge: stats?.notifications?.unreadNotifications || '0',
        },
        {
          name: 'Back to Dashboard',
          href: '/dashboard',
          icon: Home,
          badge: null,
        },
      ]
    : [
        { name: 'Home', href: '/dashboard', icon: Home, badge: null },
        {
          name: 'Free Tests',
          href: '/dashboard/free-test',
          icon: FileText,
          badge: stats?.tests?.free || '0',
        },
        {
          name: 'Paid Tests',
          href: '/dashboard/paid-test',
          icon: Crown,
          badge: stats?.tests?.paid || '0',
        },
          {
            name: 'Test Series',
            href: '/dashboard/test-series',
            icon: FileText,
            badge: stats?.tests?.series || '0',
        },
        {
          name: 'Lexia AI',
          href: '/dashboard/lexia',
          icon: Sparkles,
          badge: 'New',
      },
        {
          name: 'Law Buddy',
          href: '/dashboard/law-buddy',
          icon: MessageSquare,
          badge: null,
        },
        {
          name: 'Saras',
          href: '/dashboard/studybuddy',
          icon: MessageSquare,
          badge: null,

        },
        {
          name: 'Leaderboard',
          href: '/dashboard/leaderboard',
          icon: Trophy,
          badge: null,
        },
        {
          name: 'Scheduler',
          href: '/dashboard/schedule',
          icon: Calendar,
          badge: null,
        },
        // {
        //   name: 'Subscription',
        //   href: '/dashboard/payments',
        //   icon: CreditCard,
        //   badge: null,
        // },
        // {
        //   name: 'Notifications',
        //   href: '/dashboard/notifications',
        //   icon: Bell,
        //   badge: null,
        // },
        // {
        //   name: 'Profile',
        //   href: '/dashboard/profile',
        //   icon: User,
        //   badge: null,
        // },
      ]

  const isActive = (href) => pathname === href

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-border dark:border-zinc-700 shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:inset-y-0 lg:left-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b bg-muted/30 dark:bg-darkBg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg dark:bg-slate-400">
                  <span className="text-primary-foreground font-bold text-lg dark:text-white">
                    <Image
                      src="/outlawed.png"
                      alt="OUTLAWED"
                      width={32}
                      height={32}
                    />
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background dark:border-darkBg shadow-sm">
                  <Sparkles className="w-2 h-2 text-white m-0.5" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground dark:text-white">
                  {isAdmin ? 'Admin Panel' : 'OUTLAWED'}
                </h1>
                <p className="text-xs text-muted-foreground dark:text-white/70 font-medium">
                  {isAdmin ? 'Management Hub' : 'Study Platform'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl dark:hover:bg-white/10 hover:bg-gray-100"
                onClick={refreshStats}
                disabled={loading}
              >
                <BarChart3
                  className={`h-4 w-4 text-foreground dark:text-white ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl dark:hover:bg-white/10 hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4 text-foreground dark:text-white" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    active
                      ? 'bg-gray-100 text-foreground dark:bg-white/10 dark:text-white font-semibold border-gray-300 dark:border-white'
                      : 'text-muted-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white border-transparent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors duration-200 ${
                        active
                          ? 'bg-gray-200 text-foreground dark:bg-white/10 dark:text-white'
                          : 'bg-muted dark:bg-white/10 text-muted-foreground dark:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors duration-200
      ${
        typeof item.badge === 'string' && item.badge.toLowerCase() === 'new'
          ? 'bg-green-500 text-white'
          : active
          ? 'bg-zinc-700 text-white dark:bg-zinc-300 dark:text-black'
          : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
      }`}
                      >
                        {loading && item.badge !== '0'
                          ? '...'
                          : String(item.badge).toUpperCase()}
                      </span>
                    )}

                    <ChevronRight
                      className={`h-4 w-4 transition-all duration-200 ${
                        active
                          ? 'text-primary'
                          : 'text-muted-foreground opacity-0 group-hover:opacity-100 dark:text-white'
                      }`}
                    />
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t bg-muted/30 dark:bg-darkBg space-y-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-4 bg-muted dark:bg-zinc-800 rounded-xl">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-background dark:border-darkBg shadow-sm">
                  <AvatarImage
                    src={session?.user?.image || '/default-avatar.png'}
                    alt={session?.user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background dark:border-darkBg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground dark:text-white">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate dark:text-white/70">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isAdmin && session?.user?.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-800/80 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => {
                    router.push('/admin')
                    setSidebarOpen(false)
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl bg-white dark:bg-transparent text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings & More
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-64 rounded-xl bg-white dark:bg-darkBg text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 shadow-2xl"
                  align="end"
                >
                  <DropdownMenuLabel className="font-semibold text-gray-700 dark:text-white">
                    Account Settings
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="rounded-lg m-1 px-2 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      router.push('/dashboard/profile')
                      setSidebarOpen(false)
                    }}
                  >
                    <User className="h-4 w-4 mr-2 text-muted-foreground dark:text-white" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="rounded-lg m-1 px-2 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      router.push('/dashboard/notifications')
                      setSidebarOpen(false)
                    }}
                  >
                    <Bell className="h-4 w-4 mr-2 text-muted-foreground dark:text-white" />
                    <span>Notifications</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg m-1 px-2 py-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
