'use client'

import {
  BookOpen,
  Target,
  Scale,
  Brain,
  Calculator,
  ChevronRight,
} from 'lucide-react'

const sectionDetails = {
  ENGLISH: { name: 'English', icon: BookOpen },
  GK_CA: { name: 'General Knowledge & Current Affairs', icon: Target },
  LEGAL_REASONING: { name: 'Legal Reasoning', icon: Scale },
  LOGICAL_REASONING: { name: 'Logical Reasoning', icon: Brain },
  QUANTITATIVE_TECHNIQUES: {
    name: 'Quantitative Techniques',
    icon: Calculator,
  },
}

export default function SectionTabs({
  sectionsOrder,
  existingQuestions,
  currentSection,
  setCurrentSection,
}) {
  const questionsBySection = sectionsOrder.reduce((acc, section) => {
    acc[section] = existingQuestions.filter((q) => q.section === section)
    return acc
  }, {})

  const getQuestionNumbers = (section) => {
    const sectionQuestions = questionsBySection[section]
    if (!sectionQuestions || sectionQuestions.length === 0)
      return 'No questions yet'

    const questionNumbers = sectionQuestions
      .map((q) => q.questionNumber)
      .sort((a, b) => a - b)
    if (questionNumbers.length === 1) return `Q${questionNumbers[0]}`
    return `Q${questionNumbers[0]} - Q${
      questionNumbers[questionNumbers.length - 1]
    }`
  }

  return (
    <div className="mb-8 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-lg border-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Test Sections
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sectionsOrder.map((section) => {
          const isActive = currentSection === section
          const questions = questionsBySection[section] || []
          const isCompleted = questions.length > 0
          const Icon = sectionDetails[section].icon

          return (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`p-4 rounded-lg shadow-md transition-all duration-300 flex flex-col justify-between text-left ${
                isActive
                  ? 'bg-blue-600 text-white ring-4 ring-blue-300 dark:ring-blue-800 scale-105'
                  : isCompleted
                  ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                  : 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-dashed border-slate-300 dark:border-slate-700'
              }`}
            >
              <div>
                <div
                  className={`p-2 rounded-full inline-block ${
                    isActive
                      ? 'bg-white/20'
                      : isCompleted
                      ? 'bg-blue-100 dark:bg-blue-900/40'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive
                        ? 'text-white'
                        : isCompleted
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  />
                </div>
                <h3
                  className={`mt-3 text-md font-semibold ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-900 dark:text-slate-50'
                  }`}
                >
                  {sectionDetails[section].name}
                </h3>
              </div>
              <div className="mt-4">
                <p
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-blue-100'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {getQuestionNumbers(section)}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
