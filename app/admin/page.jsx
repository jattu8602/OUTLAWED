'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  Crown,
  Bell,
  CreditCard,
  User,
  TrendingUp,
  Activity,
} from 'lucide-react'
import Loader from '@/components/ui/Loader'

const StatCardSkeleton = () => (
  <div className="space-y-2">
    <div className="h-7 bg-gray-200 rounded-md dark:bg-gray-700 w-3/4 animate-pulse"></div>
    <div className="h-4 bg-gray-200 rounded-md dark:bg-gray-700 w-1/2 animate-pulse"></div>
  </div>
)

export default function Admin() {
  const { data: session } = useSession()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [])

  const adminSections = [
    {
      title: 'Users Management',
      description: 'View and manage all users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
    },
    {
      title: 'Create Test',
      description: 'Create new tests with questions and settings',
      href: '/admin/create-test',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
    {
      title: 'Notifications',
      description: 'Send notifications to users',
      href: '/admin/notifications',
      icon: Bell,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
    {
      title: 'Payment History',
      description: 'View payment transactions and history',
      href: '/admin/payment-history',
      icon: CreditCard,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
  ]

  const statsDisplayData = [
    {
      title: 'Total Users',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      getData: (stats) => ({
        value: stats.totalUsers.value.toLocaleString(),
        change: `${parseFloat(stats.totalUsers.change).toFixed(1)}%`,
        isPositive: parseFloat(stats.totalUsers.change) >= 0,
      }),
    },
    {
      title: 'Active Tests',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
      getData: (stats) => ({
        value: stats.activeTests.value.toLocaleString(),
        change: stats.activeTests.change,
        isPositive: stats.activeTests.change >= 0,
      }),
    },
    {
      title: 'Total Revenue',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      getData: (stats) => ({
        value: `₹${stats.totalRevenue.value.toLocaleString()}`,
        change: `${parseFloat(stats.totalRevenue.change).toFixed(1)}%`,
        isPositive: parseFloat(stats.totalRevenue.change) >= 0,
      }),
    },
    {
      title: 'Active Sessions',
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
      getData: (stats) => ({
        value: stats.activeSessions.value.toLocaleString(),
        change: `${parseFloat(stats.activeSessions.change).toFixed(1)}%`,
        isPositive: parseFloat(stats.activeSessions.change) >= 0,
      }),
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#10172A] text-gray-800 dark:text-gray-200 p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-2">
          Welcome back, {session?.user?.name || 'Admin'}. Manage your CLAT
          preparation platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplayData.map((stat, index) => {
          const Icon = stat.icon
          const data = stats ? stat.getData(stats) : null
          return (
            <Card
              key={index}
              className="border dark:border-white dark:bg-[#10172A]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {data ? (
                  <>
                    <div className="text-2xl font-bold">{data.value}</div>
                    <p className="text-xs mt-1">
                      <span
                        className={
                          data.isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {data.isPositive ? '+' : ''}
                        {data.change}
                      </span>{' '}
                      from last week
                    </p>
                  </>
                ) : (
                  <StatCardSkeleton />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Admin Sections */}
      <Card className="border dark:border-white dark:bg-[#10172A]">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage different aspects of your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSections.map((section) => {
              const Icon = section.icon
              return (
                <Link key={section.href} href={section.href} className="block">
                  <div className="p-4 border dark:border-white rounded-lg hover:shadow-md dark:hover:shadow-black transition-all duration-200 hover:border-primary/50 dark:bg-[#10172A]">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
