export default function QuestionNavigationSidebar({
  groupedQuestions,
  questions,
  getQuestionStatus,
  getQuestionStatusColor,
  handleQuestionNavigation,
  currentQuestionIndex,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          Question Navigation
        </h3>

        {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
          <div key={section} className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {section.replace('_', ' ')} ({sectionQuestions.length})
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {sectionQuestions.map(({ index }) => {
                const question = questions[index]
                const status = getQuestionStatus(question)
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`relative w-8 h-8 rounded text-xs font-medium transition-colors ${getQuestionStatusColor(
                      status
                    )} ${
                      index === currentQuestionIndex
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    {index + 1}
                    {question.userAnswer && question.userAnswer.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-white"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 right-0 w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Question Navigation
          </h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
          <div key={section} className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {section.replace('_', ' ')} ({sectionQuestions.length})
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {sectionQuestions.map(({ index }) => {
                const question = questions[index]
                const status = getQuestionStatus(question)
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`relative w-8 h-8 rounded text-xs font-medium transition-colors ${getQuestionStatusColor(
                      status
                    )} ${
                      index === currentQuestionIndex
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    {index + 1}
                    {question.userAnswer && question.userAnswer.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-white"></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
