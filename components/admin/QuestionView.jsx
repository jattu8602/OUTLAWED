'use client'

import { useState } from 'react'
import {
  X,
  FileText,
  ImageIcon,
  Table,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function QuestionView({
  question,
  onEdit,
  onDelete,
  getSectionName,
  existingPassages = [],
  getPassageForQuestion,
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!question) return null

  const Icon = getSectionName(question.section).icon || FileText

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-300">
      <div
        className="p-3 cursor-pointer flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50"
        onClick={() => onEdit(question)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Q{question.questionNumber}
            </span>
            {/* <span className="px-1 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
              {getSectionName(question.section)}
            </span> */}

            {question.optionType === 'MULTI' && (
              <span className="px-1 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-medium">
                Multiple
              </span>
            )}
          </div>
          {/* Show passage info */}
          <div className="mb-2">
            {question.passageId ? (
              <div>
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <FileText className="h-3 w-3 mr-1" />
                  Passage{' '}
                  {(() => {
                    if (!getPassageForQuestion) return 'Unknown'
                    const passage = getPassageForQuestion(question)
                    return passage ? passage.passageNumber : 'Unknown'
                  })()}
                </div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {(() => {
                    if (!getPassageForQuestion) return 'Unknown passage'
                    const passage = getPassageForQuestion(question)
                    return passage ? (
                      <div
                        className="prose prose-xs dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            passage.content.substring(0, 100) +
                            (passage.content.length > 100 ? '...' : ''),
                        }}
                      />
                    ) : (
                      'Unknown passage'
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <FileText className="h-3 w-3 mr-1" />
                No Passage
              </div>
            )}
          </div>

          <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: question.questionText,
              }}
            />
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          {question.correctAnswers?.length > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                Details:
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <strong>Type:</strong> {question.questionType}
                </li>
                {question.questionType === 'OPTIONS' && (
                  <li>
                    <strong>Options:</strong> {question.options.join(', ')}
                  </li>
                )}
                <li>
                  <strong>Correct Answers:</strong>{' '}
                  {question.correctAnswers.join(', ')}
                </li>
                <li>
                  <strong>Marks:</strong> +{question.positiveMarks} /{' '}
                  {question.negativeMarks}
                </li>
                {question.passageId && getPassageForQuestion && (
                  <li>
                    <strong>Passage:</strong>{' '}
                    {(() => {
                      if (!getPassageForQuestion) return 'Unknown Passage'
                      const passage = getPassageForQuestion(question)
                      return passage
                        ? `Passage ${passage.passageNumber}`
                        : 'Unknown Passage'
                    })()}
                  </li>
                )}
              </ul>
            </div>
            {question.explanation && (
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  Explanation:
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {question.explanation}
                </p>
              </div>
            )}
            <div className="flex items-center space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(question)
                }}
                className="flex items-center space-x-2"
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(question.id)
                }}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
