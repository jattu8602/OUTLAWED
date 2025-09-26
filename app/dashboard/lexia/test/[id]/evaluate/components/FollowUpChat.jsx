'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { Send } from 'lucide-react'

export default function FollowUpChat({ questionId, analysis }) {
  const [userMessage, setUserMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    const newMessage = { role: 'user', content: userMessage }
    setChatHistory((prev) => [...prev, newMessage])
    setUserMessage('')
    setLoading(true)

    try {
      const response = await fetch('/api/lexia/tests/follow-up-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          analysis,
          userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      const aiMessage = { role: 'assistant', content: data.followUpAnswer }
      setChatHistory((prev) => [...prev, aiMessage])
    } catch (error) {
      toast.error(error.message)
      setChatHistory((prev) => prev.slice(0, -1)) // remove user message on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <h4 className="text-sm font-semibold mb-2 dark:text-slate-100">Ask a follow-up question</h4>
      <div className="space-y-2 dark:text-slate-100">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            <p className="text-sm dark:text-slate-100">{msg.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="mt-2 flex gap-2 dark:text-slate-100 dark:bg-slate-800">
        <Input
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type your question..."
          disabled={loading}
          className="dark:text-slate-100 dark:placeholder-slate-400"
        />
        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
