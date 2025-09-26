'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  BarChart3,
  RotateCcw,
  Edit,
  Eye,
  Settings,
  Play,
  Trash2,
  Bot,
  Brain,
} from 'lucide-react'

export default function AdminTestCard({
  title,
  keyTopic,
  isPaid,
  durationMinutes,
  numberOfQuestions,
  isActive = false,
  onAction,
  admin = false,
  questions = [],
  id, // Add test ID prop
}) {
  const getTestType = () => {
    return isPaid ? 'PAID' : 'FREE'
  }

  const getTestStatus = () => {
    return isActive ? 'Active' : 'Draft'
  }

  const getQuestionCount = () => {
    return numberOfQuestions || questions?.length || 0
  }

  const renderActionButton = () => {
    if (isActive) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 text-xs dark:text-blue-500 dark:hover:text-blue-600"
          onClick={() => onAction?.('view')}
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
      )
    } else {
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs"
            onClick={() => onAction?.('continue')}
          >
            <Play className="mr-1 h-3 w-3" />
            Continue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-600 hover:text-cyan-700 text-xs"
            onClick={() => onAction?.('analyze')}
          >
            <Brain className="mr-1 h-3 w-3" />
            Analyze
          </Button>
        </div>
      )
    }
  }

  const renderDesktopActionButton = () => {
    if (isActive) {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
          onClick={() => onAction?.('view')}
        >
          <Eye className="mr-1 h-3 w-3" />
          View
        </Button>
      )
    } else {
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-600"
            onClick={() => onAction?.('continue')}
          >
            <Play className="mr-1 h-3 w-3" />
            Continue
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-600 hover:text-cyan-700"
            onClick={() => onAction?.('analyze')}
          >
            <Brain className="mr-1 h-3 w-3" />
            Analyze
          </Button>
        </div>
      )
    }
  }

  return (
    <div className="p-4 dark:bg-gray-900">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 text-sm dark:text-white">{title}</h3>
          <Badge
            variant={getTestType() === 'PAID' ? 'default' : 'secondary'}
            className={
              getTestType() === 'PAID'
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-100'
                : 'bg-green-100 text-green-700 hover:bg-green-100'
            }
          >
            {getTestType()}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <Badge
            variant={getTestStatus() === 'Active' ? 'default' : 'secondary'}
            className={
              getTestStatus() === 'Active'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
            }
          >
            {getTestStatus()}
          </Badge>

          <div className="flex items-center gap-2 text-gray-600 dark:text-white">
            <span className="text-xs">{getQuestionCount()} Questions</span>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-700 text-xs dark:text-white dark:hover:text-gray-300"
            onClick={() => onAction?.('settings')}
          >
            <Settings className="mr-1 h-3 w-3 dark:text-white" />
            Settings
          </Button>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={() => onAction?.('toggle')}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className="text-xs text-gray-600 dark:text-white">
              {isActive ? 'Active' : 'Draft'}
            </span>
          </div>

          {renderActionButton()}

          {/* Delete button for draft tests */}
          {!isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
              onClick={() => onAction?.('delete')}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] items-center text-sm">
        {/* Name */}
        <div className="font-medium text-gray-900 dark:text-white">{title}</div>

        {/* Type */}
        <div>
          <Badge
            variant={getTestType() === 'PAID' ? 'default' : 'secondary'}
            className={
              getTestType() === 'PAID'
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-900'
                : 'bg-green-100 text-green-700 hover:bg-green-100'
            }
          >
            {getTestType()}
          </Badge>
        </div>

        {/* Status */}
        <div>
          <Badge
            variant={getTestStatus() === 'Active' ? 'default' : 'secondary'}
            className={
              getTestStatus() === 'Active'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-900'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-900'
            }
          >
            {getTestStatus()}
          </Badge>
        </div>

        {/* Questions */}
        <div className="text-gray-600 dark:text-white">
          <span className="text-sm">{getQuestionCount()} Questions</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
            onClick={() => onAction?.('settings')}
          >
            <Settings className="mr-1 h-3 w-3" />
            Settings
          </Button>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={() => onAction?.('toggle')}
              className="data-[state=checked]:bg-orange-500"
            />
            <span className="text-xs text-gray-600 dark:text-white">
              {isActive ? 'Active' : 'Draft'}
            </span>
          </div>

          {renderDesktopActionButton()}

          {/* Delete button for draft tests */}
          {!isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onAction?.('delete')}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
