import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  History,
  EyeOff,
  Eye,
  Menu,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function EvaluationHeader({
  router,
  test,
  testAttempt,
  showExplanations,
  setShowExplanations,
  setShowAttemptHistory,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <header className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 pt-2 sm:pt-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Title and Actions */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-1 sm:gap-2 dark:border-slate-700 dark:text-slate-300 text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex gap-1 sm:gap-2 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                {test.title}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs"
                >
                  {test.type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden gap-1 dark:text-slate-300"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttemptHistory(true)}
              className="gap-1 sm:gap-2 dark:text-slate-300 text-xs sm:text-sm"
            >
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">All Attempts</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanations(!showExplanations)}
              className="gap-1 sm:gap-2 dark:text-slate-300 text-xs sm:text-sm"
            >
              {showExplanations ? (
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">
                {showExplanations ? 'Hide' : 'Show'} Explanations
              </span>
            </Button>
            {/* Theme Toggle */}
            <div className="rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors dark:text-white">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <Separator />
      </div>
    </header>
  )
}
