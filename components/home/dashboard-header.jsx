export function DashboardHeader() {
  const subjects = ['ENGLISH', 'GK', 'LEGAL', 'LOGICAL', 'QT', 'OVERALL']

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-gray-900">
        Your Personal Dashboard Overview
      </h1>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {subjects.map((subject, index) => (
          <button
            key={subject}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              index === 0
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  )
}
