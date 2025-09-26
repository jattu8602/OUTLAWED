import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Timer } from 'lucide-react'

export default function TestStatisticsSidebar({
  testAttempt,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  return (
    <div
      className={`hidden lg:block transition-all duration-300 ease-in-out bg-white/70 dark:bg-slate-800/70
  backdrop-blur-sm border-r border-slate-200 dark:border-slate-700
  flex-shrink-0 relative ${sidebarCollapsed ? 'w-16' : 'w-80'}`}
    >
      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-0 top-4 dark:text-slate-300"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* Sidebar Content */}
      <div className={`p-4 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Test Statistics
        </h3>

        {/* Overall Score */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 mb-4">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    className="text-emerald-500"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 32 * (1 - testAttempt.score / 100)
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {testAttempt.score}%
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Overall Score
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {testAttempt.correctAnswers}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              Correct
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {testAttempt.wrongAnswers}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">Wrong</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
              {testAttempt.unattempted}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Unattempted
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {testAttempt.totalQuestions}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Total
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Correct</span>
              <span>
                {testAttempt.correctAnswers}/{testAttempt.totalQuestions}
              </span>
            </div>
            <Progress
              value={
                (testAttempt.correctAnswers / testAttempt.totalQuestions) * 100
              }
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Wrong</span>
              <span>
                {testAttempt.wrongAnswers}/{testAttempt.totalQuestions}
              </span>
            </div>
            <Progress
              value={
                (testAttempt.wrongAnswers / testAttempt.totalQuestions) * 100
              }
              className="h-2 bg-red-200 dark:bg-red-900/30"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Unattempted</span>
              <span>
                {testAttempt.unattempted}/{testAttempt.totalQuestions}
              </span>
            </div>
            <Progress
              value={
                (testAttempt.unattempted / testAttempt.totalQuestions) * 100
              }
              className="h-2 bg-slate-200 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Time Stats */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              Time Analysis
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <div>
              Total Time: {Math.floor((testAttempt.totalTimeSec || 0) / 60)}m{' '}
              {(testAttempt.totalTimeSec || 0) % 60}s
            </div>
            <div>
              Avg per Question:{' '}
              {testAttempt.totalQuestions
                ? Math.floor(
                    (testAttempt.totalTimeSec || 0) /
                      testAttempt.totalQuestions /
                      60
                  )
                : 0}
              m{' '}
              {testAttempt.totalQuestions
                ? Math.floor(
                    ((testAttempt.totalTimeSec || 0) /
                      testAttempt.totalQuestions) %
                      60
                  )
                : 0}
              s
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
