'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Flame,
  Clock,
  Calendar,
  Trophy,
  Star,
  Zap,
  Target,
  CheckCircle,
  Award,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Timer,
  BookOpen,
  Brain,
  TrendingUp,
  Lock,
  Gift,
  X,
} from 'lucide-react'

const REWARD_TIERS = {
  streak: [
    {
      days: 1,
      name: 'First Step',
      icon: '🌱',
      color: 'from-green-400 to-green-600',
    },
    {
      days: 3,
      name: 'Getting Started',
      icon: '🔥',
      color: 'from-orange-400 to-orange-600',
    },
    {
      days: 7,
      name: 'Week Warrior',
      icon: '⚡',
      color: 'from-blue-400 to-blue-600',
    },
    {
      days: 14,
      name: 'Two Week Titan',
      icon: '💪',
      color: 'from-purple-400 to-purple-600',
    },
    {
      days: 30,
      name: 'Monthly Master',
      icon: '👑',
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      days: 60,
      name: 'Dedication Deity',
      icon: '🏆',
      color: 'from-red-400 to-red-600',
    },
    {
      days: 100,
      name: 'Century Scholar',
      icon: '💎',
      color: 'from-indigo-400 to-indigo-600',
    },
  ],
  pomodoro: [
    {
      cycles: 1,
      name: 'Focus Starter',
      icon: '🍅',
      color: 'from-pink-400 to-pink-600',
    },
    {
      cycles: 5,
      name: 'Focus Fighter',
      icon: '⚡',
      color: 'from-orange-400 to-orange-600',
    },
    {
      cycles: 10,
      name: 'Focus Master',
      icon: '🎯',
      color: 'from-blue-400 to-blue-600',
    },
    {
      cycles: 25,
      name: 'Focus Legend',
      icon: '👑',
      color: 'from-purple-400 to-purple-600',
    },
    {
      cycles: 50,
      name: 'Focus Deity',
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      cycles: 100,
      name: 'Focus God',
      icon: '💎',
      color: 'from-red-400 to-red-600',
    },
  ],
  scheduler: [
    {
      weeks: 1,
      name: 'Week One Wonder',
      icon: '🌟',
      color: 'from-green-400 to-green-600',
    },
    {
      weeks: 2,
      name: 'Consistent Crusader',
      icon: '⚡',
      color: 'from-blue-400 to-blue-600',
    },
    {
      weeks: 4,
      name: 'Monthly Marvel',
      icon: '💪',
      color: 'from-purple-400 to-purple-600',
    },
    {
      weeks: 8,
      name: 'Two Month Titan',
      icon: '👑',
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      weeks: 12,
      name: 'Quarter Champion',
      icon: '🏆',
      color: 'from-red-400 to-red-600',
    },
    {
      weeks: 24,
      name: 'Half Year Hero',
      icon: '💎',
      color: 'from-indigo-400 to-indigo-600',
    },
  ],
}

export default function ProfileRewards() {
  const [rewardsData, setRewardsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('streak')
  const [scrollPosition, setScrollPosition] = useState({
    streak: 0,
    pomodoro: 0,
    scheduler: 0,
  })
  const [claimedBadges, setClaimedBadges] = useState(new Set())
  const [showCongratsDialog, setShowCongratsDialog] = useState(false)
  const [congratsBadge, setCongratsBadge] = useState(null)

  useEffect(() => {
    fetchRewardsData()
  }, [])

  const fetchRewardsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/rewards')
      if (response.ok) {
        const data = await response.json()
        setRewardsData(data)
      }
    } catch (error) {
      console.error('Error fetching rewards data:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimBadge = (type, tier) => {
    const badgeKey = `${type}-${tier[Object.keys(tier)[0]]}`
    setClaimedBadges((prev) => new Set([...prev, badgeKey]))
    setCongratsBadge(tier)
    setShowCongratsDialog(true)
  }

  const getBadgeStatus = (type, tier, currentValue) => {
    const threshold = tier[Object.keys(tier)[0]]
    const badgeKey = `${type}-${threshold}`
    const isEarned = currentValue >= threshold
    const isClaimed = claimedBadges.has(badgeKey)

    if (!isEarned) return 'locked'
    if (isEarned && !isClaimed) return 'unlocked'
    return 'claimed'
  }

  const getCurrentTier = (type, currentValue) => {
    const tiers = REWARD_TIERS[type]
    let currentTier = tiers[0]
    let nextTier = tiers[1]

    for (let i = 0; i < tiers.length; i++) {
      if (currentValue >= tiers[i][Object.keys(tiers[i])[0]]) {
        currentTier = tiers[i]
        nextTier = tiers[i + 1] || null
      }
    }

    return { currentTier, nextTier }
  }

  const getProgressPercentage = (type, currentValue) => {
    const { currentTier, nextTier } = getCurrentTier(type, currentValue)

    if (!nextTier) return 100 // Max tier reached

    const currentThreshold = currentTier[Object.keys(currentTier)[0]]
    const nextThreshold = nextTier[Object.keys(nextTier)[0]]

    return Math.min(
      100,
      ((currentValue - currentThreshold) / (nextThreshold - currentThreshold)) *
        100
    )
  }

  const scrollRewards = (direction, section) => {
    const container = document.getElementById(`${section}-rewards`)
    if (container) {
      const scrollAmount = 300
      const newPosition =
        direction === 'left'
          ? Math.max(0, scrollPosition[section] - scrollAmount)
          : scrollPosition[section] + scrollAmount

      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition((prev) => ({ ...prev, [section]: newPosition }))
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rewardsData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Start studying to earn your first rewards!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { streak, pomodoro, scheduler } = rewardsData

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="font-bold">Your Rewards</div>
            <div className="text-sm font-normal text-muted-foreground">
              Unlock achievements and track your progress
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Section Tabs */}
        <div className="flex gap-1 p-1 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-inner">
          {[
            {
              id: 'streak',
              label: 'Streak',
              icon: Flame,
              color: 'from-orange-500 to-red-500',
            },
            {
              id: 'pomodoro',
              label: 'Focus',
              icon: Clock,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              id: 'scheduler',
              label: 'Schedule',
              icon: Calendar,
              color: 'from-purple-500 to-pink-500',
            },
          ].map(({ id, label, icon: Icon, color }) => (
            <Button
              key={id}
              variant={activeSection === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(id)}
              className={`flex-1 transition-all duration-300 ${
                activeSection === id
                  ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                  : 'hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Streak Rewards */}
        {activeSection === 'streak' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Study Streak</h3>
                <p className="text-sm text-muted-foreground">
                  {streak.current} day{streak.current !== 1 ? 's' : ''} streak
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                <Flame className="h-3 w-3 mr-1" />
                {streak.current} days
              </Badge>
            </div>

            <div className="relative">
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                id="streak-rewards"
              >
                {REWARD_TIERS.streak.map((tier, index) => {
                  const badgeStatus = getBadgeStatus(
                    'streak',
                    tier,
                    streak.current
                  )

                  return (
                    <div
                      key={tier.days}
                      className={`flex-shrink-0 w-36 p-4 rounded-2xl border-2 transition-all duration-300 relative group hover:scale-105 ${
                        badgeStatus === 'locked'
                          ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
                          : badgeStatus === 'unlocked'
                          ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 ring-4 ring-orange-200 shadow-lg animate-pulse'
                          : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-md'
                      }`}
                    >
                      {/* Badge Status Indicator */}
                      <div className="absolute -top-2 -right-2">
                        {badgeStatus === 'locked' && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'unlocked' && (
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'claimed' && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-3">
                        <div className="text-4xl relative transform transition-transform group-hover:scale-110">
                          {badgeStatus === 'locked' ? '🔒' : tier.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {tier.days} days
                          </div>
                        </div>

                        {badgeStatus === 'unlocked' && (
                          <Button
                            size="sm"
                            onClick={() => claimBadge('streak', tier)}
                            className="w-full h-8 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transform transition-all hover:scale-105"
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Claim Badge
                          </Button>
                        )}

                        {badgeStatus === 'claimed' && (
                          <div className="flex items-center justify-center space-x-1 bg-green-100 rounded-lg py-1 px-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">
                              Claimed!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>


            </div>

            {/* Progress to next tier */}
            {(() => {
              const { nextTier } = getCurrentTier('streak', streak.current)
              if (nextTier) {
                const progress = getProgressPercentage('streak', streak.current)
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Pomodoro Rewards */}
        {activeSection === 'pomodoro' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Focus Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  {pomodoro.completedCycles} completed cycles
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Timer className="h-3 w-3 mr-1" />
                {pomodoro.completedCycles} cycles
              </Badge>
            </div>

            <div className="relative">
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                id="pomodoro-rewards"
              >
                {REWARD_TIERS.pomodoro.map((tier, index) => {
                  const badgeStatus = getBadgeStatus(
                    'pomodoro',
                    tier,
                    pomodoro.completedCycles
                  )

                  return (
                    <div
                      key={tier.cycles}
                      className={`flex-shrink-0 w-36 p-4 rounded-2xl border-2 transition-all duration-300 relative group hover:scale-105 ${
                        badgeStatus === 'locked'
                          ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
                          : badgeStatus === 'unlocked'
                          ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 ring-4 ring-blue-200 shadow-lg animate-pulse'
                          : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-md'
                      }`}
                    >
                      {/* Badge Status Indicator */}
                      <div className="absolute -top-2 -right-2">
                        {badgeStatus === 'locked' && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'unlocked' && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'claimed' && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-3">
                        <div className="text-4xl relative transform transition-transform group-hover:scale-110">
                          {badgeStatus === 'locked' ? '🔒' : tier.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {tier.cycles} cycles
                          </div>
                        </div>

                        {badgeStatus === 'unlocked' && (
                          <Button
                            size="sm"
                            onClick={() => claimBadge('pomodoro', tier)}
                            className="w-full h-8 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg transform transition-all hover:scale-105"
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Claim Badge
                          </Button>
                        )}

                        {badgeStatus === 'claimed' && (
                          <div className="flex items-center justify-center space-x-1 bg-green-100 rounded-lg py-1 px-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">
                              Claimed!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>


            </div>

            {/* Progress to next tier */}
            {(() => {
              const { nextTier } = getCurrentTier(
                'pomodoro',
                pomodoro.completedCycles
              )
              if (nextTier) {
                const progress = getProgressPercentage(
                  'pomodoro',
                  pomodoro.completedCycles
                )
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Scheduler Rewards */}
        {activeSection === 'scheduler' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Schedule Completion</h3>
                <p className="text-sm text-muted-foreground">
                  {scheduler.completedWeeks} completed week
                  {scheduler.completedWeeks !== 1 ? 's' : ''}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {scheduler.completedWeeks} weeks
              </Badge>
            </div>

            <div className="relative">
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
                id="scheduler-rewards"
              >
                {REWARD_TIERS.scheduler.map((tier, index) => {
                  const badgeStatus = getBadgeStatus(
                    'scheduler',
                    tier,
                    scheduler.completedWeeks
                  )

                  return (
                    <div
                      key={tier.weeks}
                      className={`flex-shrink-0 w-36 p-4 rounded-2xl border-2 transition-all duration-300 relative group hover:scale-105 ${
                        badgeStatus === 'locked'
                          ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60'
                          : badgeStatus === 'unlocked'
                          ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 ring-4 ring-purple-200 shadow-lg animate-pulse'
                          : 'border-green-300 bg-gradient-to-br from-green-50 to-green-100 shadow-md'
                      }`}
                    >
                      {/* Badge Status Indicator */}
                      <div className="absolute -top-2 -right-2">
                        {badgeStatus === 'locked' && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'unlocked' && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {badgeStatus === 'claimed' && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-3">
                        <div className="text-4xl relative transform transition-transform group-hover:scale-110">
                          {badgeStatus === 'locked' ? '🔒' : tier.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {tier.name}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {tier.weeks} weeks
                          </div>
                        </div>

                        {badgeStatus === 'unlocked' && (
                          <Button
                            size="sm"
                            onClick={() => claimBadge('scheduler', tier)}
                            className="w-full h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transform transition-all hover:scale-105"
                          >
                            <Gift className="h-3 w-3 mr-1" />
                            Claim Badge
                          </Button>
                        )}

                        {badgeStatus === 'claimed' && (
                          <div className="flex items-center justify-center space-x-1 bg-green-100 rounded-lg py-1 px-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-700 font-medium">
                              Claimed!
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>


            </div>

            {/* Progress to next tier */}
            {(() => {
              const { nextTier } = getCurrentTier(
                'scheduler',
                scheduler.completedWeeks
              )
              if (nextTier) {
                const progress = getProgressPercentage(
                  'scheduler',
                  scheduler.completedWeeks
                )
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              }
            })()}
          </div>
        )}

        {/* Achievement Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border-t-2 border-slate-200 dark:border-slate-600">
          <h3 className="text-lg font-semibold text-center mb-6 text-gray-900 dark:text-white">
            Your Progress Summary
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {streak.current}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Day Streak
              </div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {pomodoro.completedCycles}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Focus Cycles
              </div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {scheduler.completedWeeks}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Completed Weeks
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Congratulations Dialog */}
      <Dialog open={showCongratsDialog} onOpenChange={setShowCongratsDialog}>
        <DialogContent className="max-w-lg overflow-hidden dark:text-white bg-white dark:bg-slate-800">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              🎉 Congratulations! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            <div className="relative">
              <div className="text-8xl mb-4 animate-pulse">
                {congratsBadge?.icon}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {congratsBadge?.name}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed dark:text-white">
                You've earned this amazing badge! Keep up the great work and
                continue your learning journey.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-6">
              <Button
                onClick={() => setShowCongratsDialog(false)}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg transform transition-all hover:scale-105"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Awesome!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
