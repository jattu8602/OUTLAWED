'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const suggestedWeakPoints = [
  'Algebraic Equations',
  'Probability & Statistics',
  'Essay Writing',
  'Reading Comprehension',
  'Logical Reasoning',
  'Current Affairs',
]

export default function WeakPointsModal({
  open,
  onClose,
  onAddWeakPoint,
}) {
  const [customWeakPoint, setCustomWeakPoint] = useState('')
  const [selectedSuggestions, setSelectedSuggestions] = useState([])

  if (!open) return null

  const toggleSuggestion = (suggestion) => {
    setSelectedSuggestions((prev) =>
      prev.includes(suggestion)
        ? prev.filter((item) => item !== suggestion)
        : [...prev, suggestion]
    )
  }

  const handleAddSelected = () => {
    selectedSuggestions.forEach(onAddWeakPoint)
    setSelectedSuggestions([])
    onClose()
  }

  const handleCustomSubmit = () => {
    if (!customWeakPoint.trim()) return
    onAddWeakPoint(customWeakPoint.trim())
    setCustomWeakPoint('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Add Weak Points</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Select from suggested topics or add your own to personalize your study plan.
        </p>

        <div className="mb-6">
          <h4 className="mb-2 text-sm font-medium text-gray-700">Suggested Topics</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedWeakPoints.map((suggestion) => {
              const selected = selectedSuggestions.includes(suggestion)
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => toggleSuggestion(suggestion)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    selected
                      ? 'bg-red-600 text-white shadow-lg hover:bg-red-700'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {suggestion}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            onClick={handleAddSelected}
            disabled={selectedSuggestions.length === 0}
            className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Selected
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Or Add a Custom Topic
          </label>
          <input
            type="text"
            value={customWeakPoint}
            onChange={(event) => setCustomWeakPoint(event.target.value)}
            placeholder="e.g. Advanced calculus or time management"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-700"
            >
              Add Custom Topic
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

