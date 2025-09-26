'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bot,
  ArrowLeft,
  FileText,
  Clock,
  RefreshCcw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  X,
  TrendingUp,
} from 'lucide-react'

export default function ProgressiveAITestCreator({
  editingTest,
  onCancel,
  onSuccess,
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: editingTest?.title || '',
    keyTopic: editingTest?.keyTopic || '',
    type: editingTest?.type || 'FREE',
    durationInMinutes: editingTest?.durationInMinutes || 180,
    rawText: '',
  })
  const [processingId, setProcessingId] = useState(null)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const intervalRef = useRef(null)
  const isContinuation = editingTest?.aiContinuation

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const startProcessing = async () => {
    if (!formData.rawText.trim()) {
      setError('Please paste the test content to process with AI')
      return
    }

    setError(null)
    setIsProcessing(true)

    try {
      // First create the test if it's a new test
      let testId = editingTest?.id

      if (!isContinuation) {
        const testResponse = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title || 'AI Generated Test',
            keyTopic: formData.keyTopic,
            type: formData.type,
            durationInMinutes: formData.durationInMinutes,
          }),
        })

        if (testResponse.ok) {
          const testResult = await testResponse.json()
          testId = testResult.testId
        } else {
          const errorData = await testResponse.json()
          throw new Error(errorData.message || 'Error creating test')
        }
      }

      // Start progressive processing
      const response = await fetch('/api/admin/tests/ai-process-progressive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          rawText: formData.rawText,
          testTitle: formData.title || 'AI Generated Test',
          testId: testId,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProcessingId(result.processingId)

        // Start polling for status updates
        startStatusPolling(result.processingId)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to start processing')
      }
    } catch (error) {
      console.error('Error starting processing:', error)
      setError(error.message)
      setIsProcessing(false)
    }
  }

  const startStatusPolling = (id) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          '/api/admin/tests/ai-process-progressive',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'status',
              processingId: id,
            }),
          }
        )

        if (response.ok) {
          const status = await response.json()
          setProcessingStatus(status)

          if (
            status.status === 'completed' ||
            status.status === 'error' ||
            status.status === 'cancelled'
          ) {
            setIsProcessing(false)
            clearInterval(intervalRef.current)

            if (status.status === 'completed') {
              // Redirect to questions page
              const testId = editingTest?.id || status.testId
              router.push(`/admin/create-test/${testId}/questions`)
            }
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  const cancelProcessing = async () => {
    if (processingId) {
      try {
        await fetch('/api/admin/tests/ai-process-progressive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'cancel',
            processingId: processingId,
          }),
        })
      } catch (error) {
        console.error('Error cancelling processing:', error)
      }
    }

    setIsProcessing(false)
    setProcessingId(null)
    setProcessingStatus(null)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent space-y-6 p-3 sm:p-4 lg:p-0">
      {/* Header Section */}
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tests</span>
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isContinuation ? 'Continue Test with AI' : 'Create Test with AI'}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
            {isContinuation
              ? `Add AI-generated questions to "${editingTest?.title}"`
              : 'Paste your test content and let AI extract questions progressively'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input Form */}
        <div className="space-y-6">
          {/* Test Information - Only show for new tests */}
          {!isContinuation && (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Test Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Basic test details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {/* Test Title */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Test Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter test title (optional - AI will generate if empty)"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>

                {/* Key Topic */}
                <div className="space-y-2">
                  <Label
                    htmlFor="keyTopic"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Key Topic
                  </Label>
                  <Input
                    id="keyTopic"
                    value={formData.keyTopic}
                    onChange={(e) =>
                      handleInputChange('keyTopic', e.target.value)
                    }
                    placeholder="Enter key topic"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>

                {/* Test Type and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Test Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleInputChange('type', value)
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Free Test</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PAID">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span>Paid Test</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="durationInMinutes"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Duration (minutes)
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="durationInMinutes"
                        type="number"
                        value={formData.durationInMinutes}
                        onChange={(e) =>
                          handleInputChange(
                            'durationInMinutes',
                            parseInt(e.target.value)
                          )
                        }
                        placeholder="180"
                        min="1"
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Text Input */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">
                    Test Content
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Paste your PDF/Word test content here
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="rawText"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Raw Test Data
                    <span className="text-red-500 pl-1">*</span>
                  </Label>
                  <Textarea
                    id="rawText"
                    value={formData.rawText}
                    onChange={(e) =>
                      handleInputChange('rawText', e.target.value)
                    }
                    placeholder="Paste your complete test data here... (PDF/Word content, questions, passages, answers, etc.)"
                    className="min-h-[300px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                    disabled={isProcessing}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  </div>
                )}

                <div className="flex gap-3">
                  {!isProcessing ? (
                    <Button
                      onClick={startProcessing}
                      disabled={!formData.rawText.trim()}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Progressive Processing
                    </Button>
                  ) : (
                    <Button
                      onClick={cancelProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Processing
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress */}
        <div className="space-y-6">
          {processingStatus ? (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    {processingStatus.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : processingStatus.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-spin" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Processing Status
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {processingStatus.status === 'completed'
                        ? 'Processing completed successfully!'
                        : processingStatus.status === 'error'
                        ? 'Processing failed'
                        : processingStatus.status === 'cancelled'
                        ? 'Processing cancelled'
                        : 'Processing in progress...'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {processingStatus.progress?.percentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                          processingStatus.progress?.percentage || 0
                        )}`}
                        style={{
                          width: `${
                            processingStatus.progress?.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Questions Processed
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {processingStatus.progress?.processedQuestions || 0} /{' '}
                        {processingStatus.progress?.totalQuestions || 0}
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Sections
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-900 dark:text-green-100">
                        {processingStatus.progress?.currentSection || 0} /{' '}
                        {processingStatus.progress?.totalSections || 0}
                      </p>
                    </div>
                  </div>

                  {/* Current Section */}
                  {processingStatus.progress?.currentSection !== undefined && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Currently processing:{' '}
                        <span className="font-medium">
                          Section {processingStatus.progress.currentSection + 1}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Error Display */}
                  {processingStatus.error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Error: {processingStatus.error}
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {processingStatus.status === 'completed' && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        All questions have been processed and saved
                        successfully!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Processing status will appear here</p>
                  <p className="text-sm mt-2">
                    Start processing to see real-time progress updates
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
