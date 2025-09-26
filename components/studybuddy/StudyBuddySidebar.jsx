'use client'

import { Plus, X } from 'lucide-react'

const studyModes = [
  { value: 'general', label: 'General Study' },
  { value: 'exam-prep', label: 'Exam Preparation' },
  { value: 'concept-learning', label: 'Concept Learning' },
  { value: 'practice', label: 'Practice & Review' },
]

export default function StudyBuddySidebar({
  sidebarOpen,
  weakPoints,
  learningGoals,
  studyMode,
  quickActions,
  onRemoveWeakPoint,
  onRemoveGoal,
  onOpenWeakPointModal,
  onOpenGoalModal,
  onStudyModeChange,
  onClose,
}) {
  return (
    <aside
      className={`${
        sidebarOpen
          ? 'fixed inset-y-0 right-0 z-50 h-full w-full max-w-sm translate-x-0 bg-white/95 backdrop-blur'
          : 'pointer-events-none translate-x-full opacity-0'
      } border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out lg:static lg:h-auto lg:w-80 lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto lg:border-l`}
      aria-hidden={sidebarOpen ? undefined : true}
    >
      <div className="border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-gray-800">Personalization</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-8 p-4">
        {/* Weak Points */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Weak Points</h3>
            <button
              type="button"
              onClick={onOpenWeakPointModal}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {weakPoints.length === 0 ? (
              <p className="text-sm italic text-gray-500">No weak points added yet.</p>
            ) : (
              weakPoints.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-red-200/80 bg-red-50/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-red-800">{point}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveWeakPoint(point)}
                    className="text-red-500 transition-colors hover:text-red-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Learning Goals */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Learning Goals</h3>
            <button
              type="button"
              onClick={onOpenGoalModal}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {learningGoals.length === 0 ? (
              <p className="text-sm italic text-gray-500">No learning goals set yet.</p>
            ) : (
              learningGoals.map((goal, index) => (
                <div
                  key={`${goal}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-green-200/80 bg-green-50/50 px-3 py-2"
                >
                  <span className="text-sm font-medium text-green-800">{goal}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveGoal(goal)}
                    className="text-green-500 transition-colors hover:text-green-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Study Mode */}
        <section>
          <h3 className="mb-3 font-semibold text-gray-800">Study Mode</h3>
          <select
            value={studyMode}
            onChange={(event) => onStudyModeChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {studyModes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="mb-3 font-semibold text-gray-800">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={`${action.title}-${index}`}
                type="button"
                onClick={action.action}
                className="flex w-full items-center space-x-3 rounded-lg bg-gray-100/80 p-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-200/90"
              >
                {action.icon}
                <span>{action.title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  )
}

