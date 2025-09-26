'use client'

import { useState } from 'react'
import { X, CalendarCheck, Sparkles, TrendingUp } from 'lucide-react'

const goalTemplates = [
  {
    title: 'Master Topic',
    description: 'Understand core concepts and memorize key principles',
    suggestion: 'Master criminal law fundamentals in two weeks',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    title: 'Practice Daily',
    description: 'Build consistent learning habits with daily exercises',
    suggestion: 'Solve 15 reasoning questions every day this week',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    title: 'Exam Strategy',
    description: 'Prepare specifically for upcoming assessments',
    suggestion: 'Create a revision plan for upcoming mock tests',
    icon: <CalendarCheck className="h-4 w-4" />,
  },
]

export default function LearningGoalsModal({
  open,
  onClose,
  onAddGoal,
}) {
  const [customGoal, setCustomGoal] = useState('')

  if (!open) return null

  const handleTemplateSelect = (suggestion) => {
    onAddGoal(suggestion)
    onClose()
  }

  const handleAddCustom = () => {
    if (!customGoal.trim()) return
    onAddGoal(customGoal.trim())
    setCustomGoal('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Set Learning Goals</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Choose a goal template or create your own to help Study Buddy tailor a learning plan for you.
        </p>

        <div className="mb-6 space-y-3">
          {goalTemplates.map((template) => (
            <button
              key={template.title}
              type="button"
              onClick={() => handleTemplateSelect(template.suggestion)}
              className="flex w-full items-start space-x-3 rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-100"
            >
              <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
                {template.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-800">
                  {template.title}
                </div>
                <p className="text-sm text-blue-700">{template.description}</p>
                <p className="mt-2 text-xs font-medium text-blue-800">
                  Example: {template.suggestion}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Or Create a Custom Goal
          </label>
          <textarea
            value={customGoal}
            onChange={(event) => setCustomGoal(event.target.value)}
            placeholder="Describe what you want to achieve..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleAddCustom}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-green-700"
            >
              Add Custom Goal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

