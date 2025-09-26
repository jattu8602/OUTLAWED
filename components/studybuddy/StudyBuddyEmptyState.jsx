'use client'

import StudyBuddyQuickActions from './StudyBuddyQuickActions'
import { Bot } from 'lucide-react'

export default function StudyBuddyEmptyState({ quickActions }) {
  return (
    <div className="py-12 text-center flex flex-col items-center justify-center h-full">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <Bot className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-gray-800 tracking-tight">
        Welcome to Study Buddy!
      </h3>
      <p className="mx-auto mb-8 max-w-lg text-base text-gray-600">
        I adapt to your learning style. Share your weak points or learning goals, and I will craft summaries, quizzes, exercises, and concept maps tailored for you.
      </p>
      <div className="w-full max-w-md">
        <StudyBuddyQuickActions quickActions={quickActions} />
      </div>
    </div>
  )
}

