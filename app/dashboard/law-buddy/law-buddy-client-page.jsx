'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Send,
  Bot,
  User,
  History,
  BookOpen,
  X,
  ChevronLeft,
  MessageSquare,
  TestTube,
  Brain,
  Loader2,
  Sparkles,
  Search,
  Clock,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function LawBuddyClientPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTest, setSelectedTest] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [userTests, setUserTests] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTests, setFilteredTests] = useState([])

  // Roadmap States
  const [activeRoadmap, setActiveRoadmap] = useState(null)
  const [roadmaps, setRoadmaps] = useState([])
  const [showRoadmapDropdown, setShowRoadmapDropdown] = useState(false)

  // Pomodoro Timer States
  const [timerState, setTimerState] = useState('stopped') // 'stopped', 'running', 'paused'
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isStudyTime, setIsStudyTime] = useState(true) // true for study, false for break
  const [timerInterval, setTimerInterval] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Pomodoro Timer Functions
  const startTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished, switch between study and break
          if (isStudyTime) {
            // Study time finished, start break
            setIsStudyTime(false)
            setTimeLeft(5 * 60) // 5 minutes break
            // Record completed study session
            recordPomodoroSession('study', 25)
          } else {
            // Break finished, start study
            setIsStudyTime(true)
            setTimeLeft(25 * 60) // 25 minutes study
            // Record completed break session
            recordPomodoroSession('break', 5)
          }
          return prev
        }
        return prev - 1
      })
    }, 1000)

    setTimerInterval(interval)
    setTimerState('running')
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setTimerState('stopped')
    setTimeLeft(25 * 60)
    setIsStudyTime(true)
  }

  const restartTimer = () => {
    stopTimer()
    startTimer()
  }

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  // Record pomodoro session
  const recordPomodoroSession = async (sessionType, duration) => {
    try {
      await fetch('/api/user/pomodoro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType,
          duration,
        }),
      })
    } catch (error) {
      console.error('Error recording pomodoro session:', error)
    }
  }

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState === 'running') {
        stopTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [timerState])

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [timerInterval])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Filter tests based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = userTests.filter((test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTests(filtered)
    } else {
      setFilteredTests(userTests)
    }
  }, [searchQuery, userTests])

  // Debug chatHistory changes
  useEffect(() => {
    console.log('chatHistory state changed:', chatHistory)
  }, [chatHistory])

  // Debug messages changes
  useEffect(() => {
    console.log('messages state changed:', messages)
  }, [messages])

  // Load user's test attempts for reference
  useEffect(() => {
    const loadUserTests = async () => {
      try {
        const response = await fetch('/api/user/tests')
        if (response.ok) {
          const data = await response.json()
          setUserTests(data.tests || [])
        }
      } catch (error) {
        console.error('Error loading user tests:', error)
      }
    }

    if (session?.user?.id) {
      loadUserTests()
    }
  }, [session])

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        console.log('Loading chat history for user:', session?.user?.id)
        const response = await fetch('/api/law-buddy/history')
        console.log('History API response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Chat history data:', data)
          console.log('Setting chatHistory to:', data.chats || [])
          setChatHistory(data.chats || [])
        } else {
          console.error('Failed to load chat history:', response.status)
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }

    if (session?.user?.id) {
      loadChatHistory()
    }
  }, [session])

  // Load roadmaps
  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        console.log('Loading roadmaps for user:', session?.user?.id)
        const response = await fetch('/api/law-buddy/roadmap')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded roadmaps:', data.roadmaps)
          setRoadmaps(data.roadmaps || [])

          // Set active roadmap for current chat
          if (currentChatId) {
            const chatRoadmap = data.roadmaps.find(
              (roadmap) => roadmap.chatId === currentChatId
            )
            console.log('Active roadmap for chat:', chatRoadmap)
            setActiveRoadmap(chatRoadmap || null)
          }
        }
      } catch (error) {
        console.error('Error loading roadmaps:', error)
      }
    }

    if (session?.user?.id) {
      loadRoadmaps()
    }
  }, [session, currentChatId])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/law-buddy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatId: currentChatId,
          referenceTestId: selectedTest?.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        console.log('Response content:', data.response) // Debug the actual response content
        console.log('Response type:', typeof data.response) // Debug the type

        // Add AI message immediately (remove typing effect for debugging)
        setIsTyping(false)

        // Handle empty response
        const responseContent =
          data.response ||
          'Sorry, I received an empty response. Please try again.'

        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        }
        console.log('AI Message:', aiMessage) // Debug log

        setMessages((prev) => {
          console.log('Previous messages:', prev)
          const newMessages = [...prev, aiMessage]
          console.log('New messages:', newMessages)
          return newMessages
        })

        if (data.chatId && !currentChatId) {
          setCurrentChatId(data.chatId)
          // Reload chat history to include new chat
          fetch('/api/law-buddy/history')
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => (data ? setChatHistory(data.chats || []) : null))
            .catch((error) =>
              console.error('Error loading chat history:', error)
            )
        }

        // Handle roadmap creation
        if (data.roadmap) {
          console.log('Roadmap created:', data.roadmap)
          setActiveRoadmap(data.roadmap)
          // Reload roadmaps
          fetch('/api/law-buddy/roadmap')
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
              console.log('Reloaded roadmaps:', data)
              if (data) setRoadmaps(data.roadmaps || [])
            })
            .catch((error) => console.error('Error loading roadmaps:', error))
        }

        // Handle process completion
        if (data.completedProcess) {
          // Reload roadmaps to update completion status
          fetch('/api/law-buddy/roadmap')
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
              if (data) {
                setRoadmaps(data.roadmaps || [])
                // Update active roadmap
                const chatRoadmap = data.roadmaps.find(
                  (roadmap) => roadmap.chatId === currentChatId
                )
                setActiveRoadmap(chatRoadmap || null)
              }
            })
            .catch((error) => console.error('Error loading roadmaps:', error))
        }
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setSelectedTest(null)
    setActiveRoadmap(null)
  }

  const loadChat = (chatId) => {
    console.log('Loading chat with ID:', chatId)
    console.log('Available chats:', chatHistory)

    // Load specific chat from history
    const chat = chatHistory.find((c) => c.id === chatId)
    console.log('Found chat:', chat)

    if (chat) {
      console.log('Chat messages:', chat.messages)

      // Convert timestamp strings back to Date objects
      const messagesWithDates = (chat.messages || []).map((message) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }))

      setMessages(messagesWithDates)
      setCurrentChatId(chatId)
      setSelectedTest(chat.referenceTest || null)

      // Load roadmap for this chat
      fetch('/api/law-buddy/roadmap')
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data) {
            const chatRoadmap = data.roadmaps.find(
              (roadmap) => roadmap.chatId === chatId
            )
            setActiveRoadmap(chatRoadmap || null)
          }
        })
        .catch((error) => console.error('Error loading roadmap:', error))

      // Update chat title if it's generic
      if (
        chat.title === 'Law Buddy Chat' &&
        chat.messages &&
        chat.messages.length > 0
      ) {
        const firstMessage = chat.messages[0].content
        const newTitle = generateChatTitle(firstMessage)
        if (newTitle !== 'Law Buddy Chat') {
          // Update the chat title in the database
          fetch('/api/law-buddy/chat', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatId: chatId,
              title: newTitle,
            }),
          }).catch((error) =>
            console.error('Error updating chat title:', error)
          )
        }
      }

      // Close sidebar on mobile after loading chat
      setShowHistory(false)
      console.log('Chat loaded successfully')
    } else {
      console.log('Chat not found in history')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    // Close modal on Escape key
    if (e.key === 'Escape' && showTestModal) {
      setShowTestModal(false)
      setSearchQuery('')
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputMessage(value)

    // Clear selected test if user removes the @ reference
    if (selectedTest && !value.includes('@')) {
      setSelectedTest(null)
    }

    // Check for @ pattern - show modal immediately when @ is typed
    // But don't open if there's already a referenced test or if user is typing after @
    if (value.includes('@') && !value.includes('@ ')) {
      // Only open modal if @ is at the end of the input (user just typed @)
      const atIndex = value.lastIndexOf('@')
      const textAfterAt = value.substring(atIndex + 1)

      // Only open modal if @ is at the end or followed by whitespace
      if (textAfterAt === '' || textAfterAt === ' ') {
        setShowTestModal(true)
        // Clear selected test if user types a new @
        if (selectedTest) {
          setSelectedTest(null)
        }
      }
    }
  }

  const selectTestFromModal = (test) => {
    setSelectedTest(test)
    setShowTestModal(false)
    setSearchQuery('')
    // Replace @ with the actual test name in input
    const updatedMessage = inputMessage.replace(/@.*$/, `@${test.title}`)
    setInputMessage(updatedMessage)
  }

  const generateChatTitle = (message) => {
    // Generate a meaningful title based on the first message
    const words = message.toLowerCase().split(' ')

    // Check for roadmap requests first
    if (
      words.includes('#plan') ||
      words.includes('learning path') ||
      words.includes('roadmap')
    ) {
      // Extract topic from the message
      const topicMatch = message.match(/(?:for|about|on)\s+([^.!?]+)/i)
      if (topicMatch) {
        const topic = topicMatch[1].trim()
        return `Learning Path: ${
          topic.charAt(0).toUpperCase() + topic.slice(1)
        }`
      }
      return 'Learning Path Discussion'
    }

    // Check for specific legal topics
    if (words.includes('contract') || words.includes('agreement')) {
      return 'Contract Law Discussion'
    } else if (words.includes('tort') || words.includes('negligence')) {
      return 'Tort Law Questions'
    } else if (
      words.includes('constitutional') ||
      words.includes('fundamental')
    ) {
      return 'Constitutional Law Help'
    } else if (words.includes('criminal') || words.includes('penal')) {
      return 'Criminal Law Assistance'
    } else if (words.includes('posco') || words.includes('pocso')) {
      return 'POCSO Act Discussion'
    } else if (words.includes('family') || words.includes('marriage')) {
      return 'Family Law Discussion'
    } else if (words.includes('property') || words.includes('land')) {
      return 'Property Law Discussion'
    } else if (words.includes('test') || words.includes('exam')) {
      return 'Test Preparation Help'
    } else if (words.includes('study') || words.includes('preparation')) {
      return 'Study Strategy Discussion'
    } else if (words.includes('explain') || words.includes('what is')) {
      // Extract the topic being explained
      const explainMatch = message.match(
        /(?:explain|what is|tell me about)\s+([^.!?]+)/i
      )
      if (explainMatch) {
        const topic = explainMatch[1].trim()
        return `Explanation: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`
      }
      return 'General Legal Discussion'
    } else {
      // Try to extract key legal terms
      const legalTerms = [
        'law',
        'act',
        'section',
        'article',
        'clause',
        'provision',
        'statute',
        'code',
      ]
      const foundTerms = words.filter((word) => legalTerms.includes(word))

      if (foundTerms.length > 0) {
        return 'Legal Discussion'
      }

      // If message is short, use first few words
      if (message.length <= 50) {
        return message.charAt(0).toUpperCase() + message.slice(1)
      }

      // Use first few words as title
      const firstWords = message.split(' ').slice(0, 4).join(' ')
      return firstWords.charAt(0).toUpperCase() + firstWords.slice(1)
    }
  }

  const quickStartPrompts = [
    'Explain contract law basics',
    'Help with legal reasoning',
    'Study tips for CLAT',
    'What is tort law?',
    'Explain constitutional law',
    'Criminal law concepts',
    '#plan Create a learning path for constitutional law',
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 relative">
      {/* Mobile Overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Chat History Sidebar */}
      <div
        className={`${
          showHistory ? 'w-80' : 'w-0 lg:w-80'
        } transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col z-50 lg:z-auto ${
          showHistory ? 'fixed lg:relative inset-y-0 left-0' : 'hidden lg:flex'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 ">
              Chat History
            </h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Manual refresh of chat history
                  fetch('/api/law-buddy/history')
                    .then((response) => response.json())
                    .then((data) => {
                      console.log('Manual refresh - Chat history data:', data)
                      setChatHistory(data.chats || [])
                    })
                    .catch((error) =>
                      console.error('Manual refresh error:', error)
                    )
                }}
                className="text-xs dark:text-slate-100"
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                className=" sm:block md:hidden bg-slate-100 dark:bg-slate-800"
              >
                <X className="h-4 w-4 dark:text-slate-100" />
              </Button>
            </div>
          </div>

          {/* New Chat Button */}
          <div className="mt-4">
            <Button
              onClick={startNewChat}
              variant="outline"
              size="sm"
              className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-100"
            >
              <Sparkles className="h-4 w-4 mr-2 dark:text-slate-100" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatHistory.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p className="text-sm">No chat history yet</p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <Card
                key={chat.id}
                className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border-slate-200 dark:border-slate-700 ${
                  currentChatId === chat.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm'
                    : 'hover:shadow-sm'
                }`}
                onClick={() => {
                  loadChat(chat.id)
                  setShowHistory(false) // Close sidebar on mobile after selection
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {chat.title}
                    </p>
                    {/* Show first message preview */}
                    {chat.messages && chat.messages.length > 0 && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {chat.messages[0].content.length > 60
                          ? chat.messages[0].content.substring(0, 60) + '...'
                          : chat.messages[0].content}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </p>
                    {chat.referenceTest && (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      >
                        <TestTube className="h-3 w-3 mr-1" />
                        {chat.referenceTest.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile History Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100"
              >
                <History className="h-4 w-4 dark:text-slate-100" />
              </Button>
              <div className="hidden md:flex items-center space-x-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Law Buddy
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your AI study companion
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Pomodoro Timer */}
              <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isStudyTime ? 'Study' : 'Break'}
                  </span>
                </div>

                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex items-center space-x-1">
                  {timerState === 'stopped' ? (
                    <Button
                      onClick={startTimer}
                      size="sm"
                      className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      onClick={restartTimer}
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-100"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* {selectedTest && (
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                >
                  <TestTube className="h-3 w-3" />
                  <span className="max-w-32 truncate">
                    {selectedTest.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTest(null)}
                    className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )} */}
            </div>
          </div>
        </div>

        {/* Active Roadmap Display */}
        {activeRoadmap && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-blue-200 dark:border-blue-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {activeRoadmap.title}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Learning Path: {activeRoadmap.topic}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRoadmapDropdown(!showRoadmapDropdown)}
                  className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                >
                  <ChevronLeft
                    className={`h-4 w-4 transition-transform ${
                      showRoadmapDropdown ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
              </div>

              {showRoadmapDropdown && (
                <div className="space-y-2">
                  {activeRoadmap.roadmapProcesses?.map((process, index) => (
                    <div
                      key={process.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        process.isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          process.isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {process.isCompleted ? '✓' : process.order}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            process.isCompleted
                              ? 'text-green-900 dark:text-green-100 line-through'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {process.title}
                        </p>
                        {process.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {process.description}
                          </p>
                        )}
                      </div>
                      {process.isCompleted && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          {process.completedAt
                            ? new Date(process.completedAt).toLocaleDateString()
                            : 'Completed'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-6 shadow-sm">
                <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Welcome to Law Buddy!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md leading-relaxed">
                I'm here to help you with legal concepts, test preparation, and
                study guidance. Ask me anything about law or CLAT preparation!
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {quickStartPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(prompt)}
                    className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-100"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            (() => {
              console.log('Rendering messages:', messages) // Debug log
              return messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex space-x-3 max-w-3xl ${
                      message.role === 'user'
                        ? 'flex-row-reverse space-x-reverse'
                        : ''
                    }`}
                  >
                    <div
                      className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-3 rounded-xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm whitespace-pre-wrap text-white leading-relaxed">
                          {message.content}
                        </p>
                      ) : (
                        <div className="text-sm leading-relaxed">
                          <MarkdownRenderer
                            content={message.content}
                            className="text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user'
                            ? 'text-blue-100'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {message.timestamp instanceof Date
                          ? message.timestamp.toLocaleTimeString()
                          : new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            })()
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Law Buddy is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedTest
                    ? `Ask about ${selectedTest.title}...`
                    : 'Ask me anything about law, tests, or study tips... (Type @ to reference a test)'
                }
                disabled={isLoading}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl dark:text-slate-100"
              />
              {/* {selectedTest && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    onClick={() => setSelectedTest(null)}
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    <span className="max-w-20 truncate">
                      {selectedTest.title}
                    </span>
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                </div>
              )} */}
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Test Reference Modal */}
        <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
          <DialogContent className="max-w-2xl max-h-[60vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 dark:text-slate-100">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-slate-900 dark:text-slate-100">
                <TestTube className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Reference a Test</span>
              </DialogTitle>
            </DialogHeader>

            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 dark:text-slate-100"
                autoFocus
              />
            </div>

            {/* Test List - Compact */}
            <div className="overflow-y-auto max-h-64 space-y-2">
              {filteredTests.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  <TestTube className="h-6 w-6 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm">No tests found</p>
                </div>
              ) : (
                filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-sm"
                    onClick={() => selectTestFromModal(test)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                          <TestTube className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate text-sm">
                            {test.title}
                          </h3>
                          <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>Score: {test.score || 'N/A'}%</span>
                            <span>•</span>
                            <span>{test.type}</span>
                            <span>•</span>
                            <span>
                              {new Date(test.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Click to select
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
