'use client'

import { Bot, Settings } from 'lucide-react'

export default function StudyBuddyHeader({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-inner">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Study Buddy</h1>
          <p className="text-sm text-gray-600">Your AI Learning Assistant</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-pressed={sidebarOpen}
        className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Settings className="mr-2 h-4 w-4" />
        {sidebarOpen ? 'Hide Panel' : 'Show Panel'}
      </button>
    </header>
  )
}

