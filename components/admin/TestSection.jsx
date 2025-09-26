'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import TestCard from '@/components/test-card'

export default function TestSection({
  title,
  description,
  tests,
  icon: Icon,
  iconColor,
  onAction,
  emptyMessage,
  emptyIcon,
}) {
  const getQuestionCount = (test) => {
    return test.questions?.length || 0
  }

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${iconColor} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
        {tests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-4xl mb-2">
              {emptyIcon}
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {tests.map((test) => (
              <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                <TestCard
                  {...test}
                  isPaid={test.type === 'PAID'}
                  numberOfQuestions={getQuestionCount(test)}
                  durationMinutes={test.durationInMinutes}
                  highlights={test.highlightPoints || []}
                  questions={test.questions || []}
                  isAttempted={test.isActive}
                  onAction={onAction}
                  admin={true}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
