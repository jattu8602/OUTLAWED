'use client'

import { useMemo } from 'react'
import { Bot, User } from 'lucide-react'
import StudyBuddyEmptyState from './StudyBuddyEmptyState'
import './animations.css'

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  if (Number.isNaN(date?.getTime?.())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
    >
      <div
        className={`flex max-w-3xl items-start space-x-3 ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isUser
              ? 'bg-blue-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-600'
          }`}
        >
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 shadow-md ${
            isUser ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200/80'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed prose">
            {message.content}
          </div>
          <div
            className={`mt-2 text-xs ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudyBuddyChatWindow({
  messages,
  isLoading,
  quickActions,
  messagesEndRef,
}) {
  const hasMessages = useMemo(() => messages.length > 0, [messages])

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {hasMessages ? (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          ) : (
            <StudyBuddyEmptyState quickActions={quickActions} />
          )}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl border border-gray-200/80 bg-white px-4 py-3 shadow-md">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gray-400" />
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  )
}

