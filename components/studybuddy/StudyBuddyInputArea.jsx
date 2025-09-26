'use client'

import { forwardRef } from 'react'
import { Send } from 'lucide-react'

const StudyBuddyInputArea = forwardRef(function StudyBuddyInputArea(
  { inputMessage, isLoading, onChange, onSend },
  textareaRef
) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
      <div className="flex items-center space-x-3">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your studies..."
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
          style={{ minHeight: '52px', maxHeight: '160px' }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!inputMessage.trim() || isLoading}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
})

export default StudyBuddyInputArea

