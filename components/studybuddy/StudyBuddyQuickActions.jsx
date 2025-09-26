'use client'

export default function StudyBuddyQuickActions({ quickActions }) {
  if (!quickActions?.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {quickActions.map((action) => (
        <button
          key={action.title}
          type="button"
          onClick={action.action}
          className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-3 text-left text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:shadow-md"
        >
          {action.icon}
          <span>{action.title}</span>
        </button>
      ))}
    </div>
  )
}

