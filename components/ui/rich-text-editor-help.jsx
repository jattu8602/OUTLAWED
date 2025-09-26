'use client'

import { useState } from 'react'
import { Button } from './button'
import {
  HelpCircle,
  Bold,
  List,
  Type,
  CheckCircle,
  Info,
  Lightbulb,
  X,
} from 'lucide-react'

const RichTextEditorHelp = ({ triggerClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false)

  const features = [
    {
      icon: <Bold className="h-4 w-4" />,
      title: 'Bold Text',
      description: 'Make text bold for emphasis',
      usage: 'Click the bold button or use Ctrl+B',
      example: '**Important concept**',
    },
    {
      icon: <List className="h-4 w-4" />,
      title: 'Bullet Lists',
      description: 'Create organized bullet point lists',
      usage: 'Click the list button to toggle bullet points',
      example: '• First point\n• Second point\n• Third point',
    },
    {
      icon: <Type className="h-4 w-4" />,
      title: 'Line Breaks',
      description: 'Add line breaks for better formatting',
      usage: 'Click the line break button or press Shift+Enter',
      example: 'First line\nSecond line',
    },
  ]

  const tips = [
    'Use bold text to highlight key concepts and important terms',
    'Create bullet lists to organize multiple points or steps',
    'Add line breaks to separate different sections of your explanation',
    'Keep explanations clear and concise for better student understanding',
    'Use formatting to make complex explanations easier to read',
  ]

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 ${triggerClassName}`}
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        How to use
      </Button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 right-0 w-[32rem] max-h-[80vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Rich Text Editor Guide
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Overview */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    About the Rich Text Editor
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This editor allows you to format your text with basic
                    styling options. Use it to create clear, well-structured
                    explanations that are easy for students to read and
                    understand.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Available Features
              </h3>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {feature.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">How to use:</span>{' '}
                          {feature.usage}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Example:</span>{' '}
                          {feature.example}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Best Practices
              </h3>
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Example Explanation
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p>
                  <strong>Correct Answer:</strong> Option B
                </p>
                <p>
                  <strong>Explanation:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    The question tests your understanding of constitutional law
                  </li>
                  <li>Article 14 guarantees equality before law</li>
                  <li>This principle applies to all citizens equally</li>
                </ul>
                <p>
                  <strong>Key Points:</strong>
                </p>
                <p>
                  • Fundamental rights are enforceable in courts
                  <br />
                  • Article 14 is a cornerstone of Indian democracy
                  <br />• This right cannot be suspended except during emergency
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setIsOpen(false)}>Got it!</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditorHelp
