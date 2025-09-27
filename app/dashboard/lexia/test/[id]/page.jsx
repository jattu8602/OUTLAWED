'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmModal from '@/components/ui/confirm-modal'
import CalmingScreen from '@/components/CalmingScreen'
import {
  Clock,
  FileText,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  Check,
  CheckSquare,
  RefreshCcw,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react'

// Test taking page component
export default function TestTakingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const testId = params.id

  // State management
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [passages, setPassages] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [markedForLater, setMarkedForLater] = useState(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState(new Set())

  // New state for reattempt management
  const [currentAttemptId, setCurrentAttemptId] = useState(null)
  const [attemptHistory, setAttemptHistory] = useState([])
  const [isReattempt, setIsReattempt] = useState(false)

  // Prevent multiple auto-submissions
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [showStartModal, setShowStartModal] = useState(true)
  const [questionStartTime, setQuestionStartTime] = useState(null)
  const [questionTimes, setQuestionTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Get current question
  const currentQuestion = questions[currentQuestionIndex]

  // Helper function to get passage for a question
  const getPassageForQuestion = (question) => {
    if (!question?.passageId || !passages.length) return null
    return passages.find((passage) => passage.id === question.passageId)
  }

  const recordTimeForCurrentQuestion = useCallback(() => {
    try {
      if (!isTestStarted || !currentQuestion || !questionStartTime) return
      const elapsedMs = Date.now() - questionStartTime
      const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000))
      if (elapsedSec <= 0) return
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + elapsedSec,
      }))
      setQuestionStartTime(Date.now())
    } catch (e) {
      // no-op
    }
  }, [isTestStarted, currentQuestion, questionStartTime])

  const submitTest = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      // Ensure we capture the final state before submitting
      const currentElapsed = questionStartTime
        ? Math.max(0, Math.floor((Date.now() - questionStartTime) / 1000))
        : 0

      // Create final question times including current question
      const finalQuestionTimes = {
        ...questionTimes,
        ...(currentQuestion?.id
          ? {
              [currentQuestion.id]:
                (questionTimes[currentQuestion.id] || 0) + currentElapsed,
            }
          : {}),
      }

      // Ensure we have all the current answers and marked questions
      const finalAnswers = { ...answers }
      const finalMarkedForLater = new Set(markedForLater)

      // If there's a current question with an answer, ensure it's included
      if (currentQuestion?.id && finalAnswers[currentQuestion.id]) {
        // Answer is already captured
      }

      const submitPayload = {
        answers: finalAnswers,
        markedForLater: Array.from(finalMarkedForLater),
        timeSpent: test.durationInMinutes * 60 - timeRemaining,
        questionTimes: finalQuestionTimes,
      }

      // If this is a reattempt, include the attempt ID
      if (currentAttemptId) {
        submitPayload.attemptId = currentAttemptId
      }

      console.log('Submitting test with payload:', submitPayload)
      console.log('Current attempt ID:', currentAttemptId)
      console.log('Is reattempt:', !!currentAttemptId)
      console.log('Answers count:', Object.keys(submitPayload.answers).length)
      console.log(
        'Marked for later count:',
        submitPayload.markedForLater.length
      )
      console.log('Time spent:', submitPayload.timeSpent)

      const response = await fetch(`/api/lexia/tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitPayload),
      })

      if (response.ok) {
        const resultData = await response.json()
        console.log('Test submission successful:', resultData)
        setTestResults(resultData)
        setShowResults(true)
        setIsTestCompleted(true)
        setShowExitModal(false) // Close modal on success

        const message = resultData.isReattempt
          ? 'Test reattempt submitted successfully!'
          : 'Test submitted successfully!'
        toast.success(message)
      } else {
        const errorData = await response.text()
        console.error('Test submission failed:', response.status, errorData)
        toast.error(`Failed to submit test: ${response.status}`)
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Error submitting test')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    answers,
    currentAttemptId,
    currentQuestion,
    markedForLater,
    questionStartTime,
    questionTimes,
    test,
    testId,
    timeRemaining,
    isSubmitting,
  ])

  // Timer effect
  useEffect(() => {
    if (!isTestStarted || isTestCompleted) return

    let fiveMinWarningShown = false
    let oneMinWarningShown = false

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        // Show warning when 5 minutes remaining
        if (prev === 300 && !isTestCompleted && !fiveMinWarningShown) {
          fiveMinWarningShown = true
          toast('⚠️ 5 minutes remaining! Please submit your test soon.', {
            icon: '⚠️',
            style: {
              background: '#fbbf24',
              color: '#92400e',
            },
          })
        }

        // Show warning when 1 minute remaining
        if (prev === 60 && !isTestCompleted && !oneMinWarningShown) {
          oneMinWarningShown = true
          toast('🚨 1 minute remaining! Test will auto-submit soon.', {
            icon: '🚨',
            style: {
              background: '#dc2626',
              color: '#ffffff',
            },
          })
        }

        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTestStarted, isTestCompleted])

  const handleAutoSubmit = useCallback(async () => {
    // Prevent multiple auto-submissions
    if (isAutoSubmitting || isTestCompleted) return

    try {
      setIsAutoSubmitting(true)

      // Time for the current question is correctly calculated inside submitTest
      // recordTimeForCurrentQuestion()

      // Set test as completed to prevent further interactions
      setIsTestCompleted(true)

      // Show a toast notification
      toast('⏰ Time is up! Test will be submitted automatically.', {
        icon: '⏰',
        style: {
          background: '#dc2626',
          color: '#ffffff',
        },
        duration: 5000,
      })

      // Wait a moment for state updates, then submit
      setTimeout(async () => {
        await submitTest()
      }, 100)
    } catch (error) {
      console.error('Error in auto submit:', error)
      // Fallback: try to submit anyway
      try {
        await submitTest()
      } catch (fallbackError) {
        console.error('Fallback submit also failed:', fallbackError)
        toast.error('Failed to auto-submit test. Please contact support.')
      }
    } finally {
      setIsAutoSubmitting(false)
    }
  }, [
    isAutoSubmitting,
    isTestCompleted,
    recordTimeForCurrentQuestion,
    submitTest,
  ])

  // Effect to handle auto-submission when timer runs out
  useEffect(() => {
    if (timeRemaining === 0 && isTestStarted && !isTestCompleted) {
      handleAutoSubmit()
    }
  }, [timeRemaining, isTestStarted, isTestCompleted, handleAutoSubmit])

  // Question timer effect
  useEffect(() => {
    if (isTestStarted && currentQuestion) {
      setQuestionStartTime(Date.now())
    }
  }, [currentQuestionIndex, isTestStarted])

  // Track visited questions for accurate status coloring
  useEffect(() => {
    if (!isTestStarted || !currentQuestion?.id) return
    setVisitedQuestions((prev) => {
      const updated = new Set(prev)
      updated.add(currentQuestion.id)
      return updated
    })
  }, [isTestStarted, currentQuestion])

  // Fetch test data and attempt history
  useEffect(() => {
    if (testId) {
      fetchTestData()
      fetchAttemptHistory()
    }
  }, [testId])

  // Prevent page exit/refresh during test
  useEffect(() => {
    if (!isTestStarted) return

    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const handleKeyDown = (e) => {
      if (e.key === 'F11' || e.key === 'F5') {
        e.preventDefault()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isTestStarted])

  const fetchTestData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/lexia/tests/${testId}`)
      if (response.ok) {
        const data = await response.json()
        setTest(data.test)
        setQuestions(data.questions)
        setPassages(data.passages || [])
        setTimeRemaining(data.test.durationInMinutes * 60)
      } else {
        toast.error('Failed to fetch test data')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      toast.error('Error loading test')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAttemptHistory = async () => {
    if (!session?.user?.id) {
      console.log('No session available for fetching attempt history')
      return
    }
    try {
      const response = await fetch(
        `/api/lexia/tests/${testId}/attempts?userId=${session.user.id}`
      )
      if (response.ok) {
        const attempts = await response.json()
        console.log('Attempt history fetched:', attempts)
        setAttemptHistory(attempts)
      } else {
        console.error(
          'Failed to fetch attempt history:',
          response.status,
          response.statusText
        )
        const errorData = await response.text()
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching attempt history:', error)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = async () => {
    try {
      // Always create a new attempt (first attempt or reattempt)
      const isReattempt = attemptHistory.length > 0
      if (isReattempt) {
        setIsReattempt(true)
      }

      // Create new attempt
      const response = await fetch(`/api/lexia/tests/${testId}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          testId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('New attempt created:', data)
        setCurrentAttemptId(data.attempt.id)
      } else {
        const errorData = await response.text()
        console.error('Failed to create attempt:', response.status, errorData)
        toast.error('Failed to create new attempt')
        return
      }

      setShowStartModal(false)
      setIsTestStarted(true)
      setQuestionStartTime(Date.now())

      console.log('Test started. Is reattempt:', isReattempt)
      console.log('Current attempt ID:', currentAttemptId)

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.error('Error starting test:', error)
      toast.error('Failed to start test')
    }
  }

  const handleAnswerChange = (questionId, answer, isMulti = false) => {
    setAnswers((prev) => {
      if (isMulti) {
        const currentAnswers = prev[questionId] || []
        if (currentAnswers.includes(answer)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((a) => a !== answer),
          }
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, answer],
          }
        }
      } else {
        return {
          ...prev,
          [questionId]: answer,
        }
      }
    })
  }

  const handleMarkForLater = () => {
    if (currentQuestion) {
      setMarkedForLater((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(currentQuestion.id)) {
          newSet.delete(currentQuestion.id)
        } else {
          newSet.add(currentQuestion.id)
        }
        return newSet
      })
    }
  }

  const handleNextQuestion = () => {
    recordTimeForCurrentQuestion()
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    recordTimeForCurrentQuestion()
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionNavigation = (index) => {
    recordTimeForCurrentQuestion()
    setCurrentQuestionIndex(index)
  }

  const handleSubmitTest = async () => {
    // The submitTest function already handles recording the final question time
    // recordTimeForCurrentQuestion()
    await submitTest()
  }

  const handleEvaluate = async () => {
    try {
      // Navigate to the evaluate page with the test attempt ID
      const attemptId = testResults.id || testResults.testAttemptId
      if (!attemptId) {
        toast.error('Could not find attempt ID for evaluation')
        return
      }
      router.push(
        `/dashboard/lexia/test/${testId}/evaluate?attemptId=${attemptId}`
      )
    } catch (error) {
      console.error('Error navigating to evaluate page:', error)
      toast.error('Error navigating to evaluate page')
    }
  }

  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex]
    if (!question) return 'unattempted'

    const hasAnswer = (() => {
      const ans = answers[question.id]
      if (Array.isArray(ans)) return ans.length > 0
      if (typeof ans === 'string') return ans.trim() !== ''
      return Boolean(ans)
    })()

    if (hasAnswer) return 'attempted'
    if (markedForLater.has(question.id)) return 'marked'
    if (visitedQuestions.has(question.id)) return 'seen'
    return 'unattempted'
  }

  const getQuestionStatusColor = (status) => {
    switch (status) {
      case 'attempted':
        return 'bg-green-500 text-white'
      case 'marked':
        return 'bg-orange-500 text-white'
      case 'seen':
        return 'bg-red-500 text-white'
      default:
        return 'bg-white text-gray-700 border border-gray-300'
    }
  }

  const groupQuestionsBySection = () => {
    const sections = {
      ENGLISH: [],
      GK_CA: [],
      LEGAL_REASONING: [],
      LOGICAL_REASONING: [],
      QUANTITATIVE_TECHNIQUES: [],
    }

    questions.forEach((question, index) => {
      if (sections[question.section]) {
        sections[question.section].push({ ...question, index })
      }
    })

    return sections
  }

  // Helper function to format table data for display
  const formatTableData = (tableData) => {
    if (!tableData) return null

    try {
      // Handle the new structure: { rows, columns, data }
      if (tableData && typeof tableData === 'object' && tableData.data) {
        // If data array exists, use it directly
        if (Array.isArray(tableData.data) && tableData.data.length > 0) {
          return tableData.data
        }
      }

      // If it's already a 2D array, return as is
      if (
        Array.isArray(tableData) &&
        tableData.length > 0 &&
        Array.isArray(tableData[0])
      ) {
        return tableData
      }

      // If it's a 1D array, convert to 2D array
      if (Array.isArray(tableData)) {
        return [['Data'], ...tableData.map((item) => [item])]
      }

      // If it's a single value, wrap it in an array
      if (typeof tableData === 'object') {
        // Handle JSON objects by converting to string
        return [['Data'], [JSON.stringify(tableData, null, 2)]]
      }

      return [['Data'], [String(tableData)]]
    } catch (error) {
      console.error('Error formatting table data:', error)
      return [['Error'], ['Failed to format table data']]
    }
  }

  // Helper function to get table dimensions
  const getTableDimensions = (tableData) => {
    if (!tableData) return { rows: 0, cols: 0 }

    try {
      // Handle the new structure: { rows, columns, data }
      if (
        tableData &&
        typeof tableData === 'object' &&
        tableData.rows &&
        tableData.columns
      ) {
        return { rows: tableData.rows, cols: tableData.columns }
      }

      // Fallback to array-based calculation
      if (Array.isArray(tableData)) {
        if (tableData.length === 0) return { rows: 0, cols: 0 }

        if (Array.isArray(tableData[0])) {
          return {
            rows: tableData.length,
            cols: Math.max(
              ...tableData.map((row) => (Array.isArray(row) ? row.length : 1))
            ),
          }
        }

        return { rows: tableData.length, cols: 1 }
      }

      return { rows: 0, cols: 0 }
    } catch (error) {
      console.error('Error getting table dimensions:', error)
      return { rows: 0, cols: 0 }
    }
  }

  // Helper function to check if table data is valid
  const isValidTableData = (tableData) => {
    if (!tableData) return false

    try {
      if (Array.isArray(tableData)) {
        return tableData.length > 0
      }
      return true
    } catch (error) {
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Test not found</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Start confirmation modal
  if (showStartModal) {
    return (
      <CalmingScreen
        onStartTest={handleStartTest}
        onCancel={() => router.push('/dashboard')}
        testName={test.title}
        testDuration={test.durationInMinutes}
      />
    )
  }

  // Exit confirmation modal
  if (showExitModal) {
    return (
      <ConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleSubmitTest}
        title="Exit Test?"
        message="Are you sure you want to exit? This will submit your test automatically."
        confirmText="Submit & Exit"
        cancelText="Continue Test"
        loading={isSubmitting}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {test.title}
            </h1>
            <div className="hidden sm:flex items-center gap-2">
              <Badge
                variant={test.type === 'PAID' ? 'default' : 'secondary'}
                className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-green-900 bg-green-200"
              >
                {test.type}
              </Badge>
              <Badge
                variant="outline"
                className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-yellow-900 bg-yellow-200"
              >
                {questions.length} Questions
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  timeRemaining <= 300
                    ? 'text-red-500 animate-pulse'
                    : 'text-red-500'
                }`}
              />
              <span
                className={`text-sm sm:text-lg font-mono font-semibold ${
                  timeRemaining <= 300
                    ? 'text-red-600 animate-pulse'
                    : 'text-red-600'
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
              {timeRemaining <= 300 && (
                <span className="hidden sm:inline text-xs text-red-500 font-medium animate-pulse">
                  ⚠️ Time running out!
                </span>
              )}
            </div>
            {/* Theme Toggle */}
            <div className="rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors dark:text-white">
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExitModal(true)}
              disabled={isSubmitting}
              className="border-2 border-gray-200 dark:border-gray-700 dark:text-white"
            >
              <X className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Exit Test</span>
            </Button>
          </div>
        </div>
        {/* Mobile badges row */}
        <div className="flex items-center gap-2 mt-2 sm:hidden">
          <Badge
            variant={test.type === 'PAID' ? 'default' : 'secondary'}
            className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-green-900 bg-green-200"
          >
            {test.type}
          </Badge>
          <Badge
            variant="outline"
            className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-yellow-900 bg-yellow-200"
          >
            {questions.length} Questions
          </Badge>
          {timeRemaining <= 300 && (
            <span className="text-xs text-red-500 font-medium animate-pulse">
              ⚠️ Time running out!
            </span>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-160px)] sm:h-[calc(100vh-140px)]">
        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto pb-24 sm:pb-20">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto">
              {/* Question Header */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Question {currentQuestion.questionNumber}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-yellow-900 bg-yellow-200 text-xs sm:text-sm"
                  >
                    {currentQuestion.section.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Passage (if exists) */}
              {(() => {
                const passage = getPassageForQuestion(currentQuestion)
                if (!passage) return null

                return (
                  <Card className="mb-4 sm:mb-6 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Passage {passage.passageNumber}
                        </h3>
                        {/* <Badge
                          variant="outline"
                          className="text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 dark:bg-blue-900 bg-blue-200 text-xs"
                        >
                          {passage.section.replace('_', ' ')}
                        </Badge> */}
                      </div>
                      {passage.title && (
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {passage.title}
                        </h4>
                      )}
                      <div
                        className="text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none text-sm sm:text-base"
                        dangerouslySetInnerHTML={{
                          __html: passage.content,
                        }}
                      />

                      {/* Passage Images */}
                      {passage.hasImage &&
                        passage.imageUrls &&
                        passage.imageUrls.length > 0 && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Images:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {passage.imageUrls.map((imageUrl, imageIndex) => (
                                <div key={imageIndex} className="relative">
                                  <img
                                    src={imageUrl}
                                    alt={`Passage ${
                                      passage.passageNumber
                                    } Image ${imageIndex + 1}`}
                                    className="w-full h-auto rounded border border-gray-300 dark:border-gray-600 max-h-64 object-contain bg-white dark:bg-gray-700"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Passage Table Data */}
                      {passage.isTable && passage.tableData && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Table Data:
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white">
                              <tbody>
                                {passage.tableData.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={
                                      rowIndex % 2 === 0
                                        ? 'bg-gray-50 dark:bg-gray-800 dark:text-white'
                                        : 'bg-white dark:bg-gray-700 dark:text-white'
                                    }
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-center dark:text-white"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })()}

              {/* Question Content */}
              <Card className="mb-4 sm:mb-6 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-3 sm:p-6">
                  {/* Question Text */}
                  <div className="mb-4 sm:mb-6">
                    <div
                      className="text-base sm:text-lg text-gray-900 dark:text-white prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: currentQuestion.questionText,
                      }}
                    />
                  </div>

                  {/* Images */}
                  {currentQuestion.imageUrls &&
                    Array.isArray(currentQuestion.imageUrls) &&
                    currentQuestion.imageUrls.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {currentQuestion.imageUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Question image ${index + 1}`}
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Table */}
                  {currentQuestion.isTable &&
                    isValidTableData(currentQuestion.tableData) && (
                      <div className="mb-4 sm:mb-6">
                        <div className="mb-3 sm:mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                              Table Data
                            </h4>
                          </div>
                          {(() => {
                            const dimensions = getTableDimensions(
                              currentQuestion.tableData
                            )
                            return (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                {dimensions.rows} × {dimensions.cols}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <table className="w-full min-w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                {(() => {
                                  const formattedData = formatTableData(
                                    currentQuestion.tableData
                                  )
                                  if (
                                    formattedData &&
                                    formattedData.length > 0
                                  ) {
                                    return formattedData[0].map(
                                      (header, headerIndex) => (
                                        <th
                                          key={headerIndex}
                                          className="border-b border-gray-200 dark:border-gray-600 p-2 sm:p-4 text-left font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm whitespace-nowrap"
                                        >
                                          {header}
                                        </th>
                                      )
                                    )
                                  }
                                  return null
                                })()}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const formattedData = formatTableData(
                                  currentQuestion.tableData
                                )
                                if (formattedData && formattedData.length > 1) {
                                  return formattedData
                                    .slice(1)
                                    .map((row, rowIndex) => (
                                      <tr
                                        key={rowIndex}
                                        className={`transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 ${
                                          rowIndex % 2 === 0
                                            ? 'bg-white dark:bg-gray-800'
                                            : 'bg-gray-50/50 dark:bg-gray-700/50'
                                        }`}
                                      >
                                        {Array.isArray(row) ? (
                                          row.map((cell, cellIndex) => (
                                            <td
                                              key={cellIndex}
                                              className="border-b border-gray-100 dark:border-gray-700 p-2 sm:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                              {cell}
                                            </td>
                                          ))
                                        ) : (
                                          <td className="border-b border-gray-100 dark:border-gray-700 p-2 sm:p-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {String(row)}
                                          </td>
                                        )}
                                      </tr>
                                    ))
                                }
                                return null
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  {/* Options */}
                  {currentQuestion.questionType === 'OPTIONS' &&
                    Array.isArray(currentQuestion.options) && (
                      <div className="space-y-2 sm:space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                              currentQuestion.optionType === 'SINGLE'
                                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                            } ${
                              currentQuestion.optionType === 'SINGLE'
                                ? answers[currentQuestion.id] === option
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : ''
                                : (answers[currentQuestion.id] || []).includes(
                                    option
                                  )
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : ''
                            }`}
                          >
                            {currentQuestion.optionType === 'SINGLE' ? (
                              <input
                                type="radio"
                                name={`question-${currentQuestion.id}`}
                                value={option}
                                checked={answers[currentQuestion.id] === option}
                                onChange={() =>
                                  handleAnswerChange(currentQuestion.id, option)
                                }
                                className="mr-2 sm:mr-3 text-blue-600"
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={(
                                  answers[currentQuestion.id] || []
                                ).includes(option)}
                                onChange={() =>
                                  handleAnswerChange(
                                    currentQuestion.id,
                                    option,
                                    true
                                  )
                                }
                                className="mr-2 sm:mr-3 text-blue-600"
                              />
                            )}
                            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                              {option}
                            </span>
                          </label>
                        ))}
                        {(() => {
                          const ans = answers[currentQuestion.id]
                          const hasAnswer = Array.isArray(ans)
                            ? ans.length > 0
                            : typeof ans === 'string'
                            ? ans.trim() !== ''
                            : Boolean(ans)
                          if (!hasAnswer) return null
                          return (
                            <div className="pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAnswers((prev) => {
                                    const updated = { ...prev }
                                    delete updated[currentQuestion.id]
                                    return updated
                                  })
                                }}
                                className="border-2 border-gray-200 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
                              >
                                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                Clear response
                              </Button>
                            </div>
                          )
                        })()}
                      </div>
                    )}

                  {/* Input Answer */}
                  {currentQuestion.questionType === 'INPUT' && (
                    <div>
                      <input
                        type="text"
                        value={answers[currentQuestion.id] || ''}
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        placeholder="Enter your answer..."
                        className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                      />
                      {(() => {
                        const ans = answers[currentQuestion.id]
                        const hasAnswer =
                          typeof ans === 'string'
                            ? ans.trim() !== ''
                            : Boolean(ans)
                        if (!hasAnswer) return null
                        return (
                          <div className="pt-2 sm:pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAnswers((prev) => {
                                  const updated = { ...prev }
                                  delete updated[currentQuestion.id]
                                  return updated
                                })
                              }}
                              className="border-2 border-gray-200 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
                            >
                              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Clear response
                            </Button>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Question Navigation
          </h3>

          {Object.entries(groupQuestionsBySection()).map(
            ([section, sectionQuestions]) => (
              <div key={section} className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {section.replace('_', ' ')} ({sectionQuestions.length})
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {sectionQuestions.map(({ index }) => {
                    const status = getQuestionStatus(index)
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
                        {markedForLater.has(questions[index].id) &&
                          answers[questions[index].id] && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full ring-1 ring-white"></span>
                          )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Test Results Section */}
      {showResults && testResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Test Results
                  </h2>
                  {attemptHistory.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        Attempt #{attemptHistory.length + 1}
                      </Badge>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
                {/* <Button variant="outline" onClick={() => setShowResults(false)}>
                  <X className="w-4 h-4" />
                </Button> */}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(
                      testResults.percentage ||
                      testResults.percentageScore ||
                      0
                    ).toFixed(2)}
                    %
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                    Score
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {testResults.correctAnswers || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                    Correct
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {testResults.wrongAnswers ||
                      testResults.incorrectAnswers ||
                      0}
                  </div>
                  <div className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    Wrong
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {testResults.unattempted ||
                      Math.max(
                        0,
                        questions.length -
                          (testResults.correctAnswers || 0) -
                          (testResults.wrongAnswers ||
                            testResults.incorrectAnswers ||
                            0)
                      )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Unattempted
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
                <Button
                  onClick={handleEvaluate}
                  className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Detailed Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="border-2 border-gray-200 dark:border-gray-700 dark:text-white text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Note about detailed results */}
              <div className="text-center py-4 sm:py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm sm:text-base">
                  Click "View Detailed Results" to see question-by-question
                  analysis on a separate page
                </p>
                {attemptHistory.length > 0 && (
                  <p className="mt-2 text-xs sm:text-sm">
                    This is attempt #{attemptHistory.length + 1}. Previous
                    attempts are preserved for comparison.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[80px] sm:min-h-[60px]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="border-2 border-gray-200 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkForLater}
              className={`text-xs sm:text-sm ${
                markedForLater.has(currentQuestion?.id)
                  ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 hover:text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700'
                  : 'border-2 border-gray-200 dark:border-gray-700 dark:text-white'
              }`}
            >
              <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">
                {markedForLater.has(currentQuestion?.id)
                  ? 'Marked'
                  : 'Mark for Later'}
              </span>
              <span className="sm:hidden">
                {markedForLater.has(currentQuestion?.id) ? '✓' : '☆'}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
              Time on this question:{' '}
              {(questionTimes[currentQuestion?.id] || 0) +
                (questionStartTime
                  ? Math.floor((Date.now() - questionStartTime) / 1000)
                  : 0)}
              s
            </div>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={() => {
                  console.log('Submit button clicked')
                  console.log('Current attempt ID:', currentAttemptId)
                  setShowExitModal(true)
                }}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Submit Test</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="border-2 border-gray-200 dark:border-gray-700 dark:text-white text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">→</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            )}
          </div>
        </div>
        {/* Mobile question info */}
        <div className="sm:hidden text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
          Q{currentQuestionIndex + 1} of {questions.length} • Time:{' '}
          {(questionTimes[currentQuestion?.id] || 0) +
            (questionStartTime
              ? Math.floor((Date.now() - questionStartTime) / 1000)
              : 0)}
          s
        </div>
      </div>
    </div>
  )
}
