'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import AttemptHistoryModal from '@/components/ui/attempt-history-modal'
import EvaluationHeader from './components/EvaluationHeader'
import TestStatisticsSidebar from './components/TestStatisticsSidebar'
import QuestionDisplay from './components/QuestionDisplay'
import QuestionNavigationSidebar from './components/QuestionNavigationSidebar'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Target,
  Timer,
  BarChart3,
  User,
  Calendar,
  Award,
  TrendingUp,
  Filter,
  Search,
  Download,
  Share2,
  Menu,
  X,
  History,
} from 'lucide-react'

export default function TestEvaluationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const testId = params.id
  const attemptId = searchParams.get('attemptId')

  const [evaluationData, setEvaluationData] = useState(null)
  const [passages, setPassages] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showExplanations, setShowExplanations] = useState(true)
  const [groupedQuestions, setGroupedQuestions] = useState({})
  const [selectedSection, setSelectedSection] = useState('ALL')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showAttemptHistory, setShowAttemptHistory] = useState(false)
  const [analysisCache, setAnalysisCache] = useState({})

  // Get current question
  const currentQuestion = evaluationData?.questions?.[currentQuestionIndex]

  useEffect(() => {
    console.log(
      'Evaluation page loaded with testId:',
      testId,
      'attemptId:',
      attemptId
    )
    if (testId && attemptId) {
      fetchEvaluationData()
    } else {
      console.error('Missing testId or attemptId:', { testId, attemptId })
      toast.error('Missing test or attempt information')
    }
  }, [testId, attemptId])

  const fetchEvaluationData = async () => {
    try {
      setLoading(true)
      console.log(
        'Fetching evaluation data for test:',
        testId,
        'attempt:',
        attemptId
      )
      const response = await fetch(
        `/api/lexia/tests/${testId}/results?attemptId=${attemptId}`
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Evaluation Data:', data)
        setEvaluationData(data)
        setPassages(data.passages || [])
        groupQuestionsBySection(data.questions)
      } else {
        const errorData = await response.text()
        console.error(
          'Failed to fetch evaluation data:',
          response.status,
          errorData
        )
        toast.error('Failed to fetch evaluation data')
        router.push(`/dashboard/lexia/test/${testId}`)
      }
    } catch (error) {
      console.error('Error fetching evaluation data:', error)
      toast.error('Error loading evaluation data')
      router.push(`/dashboard/lexia/test/${testId}`)
    } finally {
      setLoading(false)
    }
  }

  const groupQuestionsBySection = (questions) => {
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

    setGroupedQuestions(sections)
  }

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index)
    setSidebarOpen(false) // Close mobile sidebar after selection
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < evaluationData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const getQuestionStatus = (question) => {
    if (question.isCorrect === true) {
      return 'correct'
    }
    if (question.isCorrect === false) {
      // For older data, unattempted answers might have isCorrect: false.
      // We can distinguish them by checking if an answer was actually provided.
      const hasAnswer = Array.isArray(question.userAnswer)
        ? question.userAnswer.length > 0
        : !!question.userAnswer
      return hasAnswer ? 'incorrect' : 'unattempted'
    }
    // isCorrect is null or undefined for new unattempted questions.
    return 'unattempted'
  }

  const getQuestionStatusColor = (status) => {
    switch (status) {
      case 'correct':
        return 'bg-emerald-500 text-white'
      case 'incorrect':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getQuestionStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="w-4 h-4" />
      case 'incorrect':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getSectionColor = (section) => {
    const colors = {
      ENGLISH:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      GK_CA:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      LEGAL_REASONING:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      LOGICAL_REASONING:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      QUANTITATIVE_TECHNIQUES:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    }
    return (
      colors[section] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    )
  }

  const handleSelectAttempt = (attempt) => {
    setShowAttemptHistory(false)
    // Navigate to the evaluate page with the selected attempt
    // Handle both id and _id formats for MongoDB compatibility
    const attemptId = attempt.id || attempt._id
    if (!attemptId) {
      console.error('No ID found on attempt object:', attempt)
      toast.error('Could not find a valid ID for this attempt.')
      return
    }
    router.push(
      `/dashboard/lexia/test/${testId}/evaluate?attemptId=${attemptId}`
    )
  }

  const filteredQuestions =
    evaluationData?.questions?.filter((question) => {
      if (selectedSection !== 'ALL' && question.section !== selectedSection)
        return false
      if (searchQuery) {
        // Strip HTML tags for search
        const plainText = question.questionText.replace(/<[^>]*>/g, '')
        if (!plainText.toLowerCase().includes(searchQuery.toLowerCase()))
          return false
      }
      return true
    }) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Loading your test results...
          </p>
        </div>
      </div>
    )
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
            No evaluation data found
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { test, questions, testAttempt } = evaluationData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <EvaluationHeader
        router={router}
        test={test}
        testAttempt={testAttempt}
        showExplanations={showExplanations}
        setShowExplanations={setShowExplanations}
        setShowAttemptHistory={setShowAttemptHistory}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <TestStatisticsSidebar
          testAttempt={testAttempt}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        <QuestionDisplay
          testId={testId}
          attemptId={attemptId}
          isProUser={
            session?.user?.role === 'PRO' || session?.user?.role === 'ADMIN'
          }
          currentQuestion={currentQuestion}
          questions={questions}
          passages={passages}
          currentQuestionIndex={currentQuestionIndex}
          getQuestionStatusColor={getQuestionStatusColor}
          getQuestionStatus={getQuestionStatus}
          showExplanations={showExplanations}
          handlePreviousQuestion={handlePreviousQuestion}
          handleNextQuestion={handleNextQuestion}
          handleQuestionNavigation={handleQuestionNavigation}
          analysisCache={analysisCache}
          setAnalysisCache={setAnalysisCache}
        />
        <QuestionNavigationSidebar
          groupedQuestions={groupedQuestions}
          questions={questions}
          getQuestionStatus={getQuestionStatus}
          getQuestionStatusColor={getQuestionStatusColor}
          handleQuestionNavigation={handleQuestionNavigation}
          currentQuestionIndex={currentQuestionIndex}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Attempt History Modal */}
      <AttemptHistoryModal
        isOpen={showAttemptHistory}
        onClose={() => setShowAttemptHistory(false)}
        testId={testId}
        testTitle={test?.title || 'Test'}
        onSelectAttempt={handleSelectAttempt}
        apiPrefix="/api/lexia/tests"
      />
    </div>
  )
}
