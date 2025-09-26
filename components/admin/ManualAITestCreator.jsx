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
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Bot,
  FileText,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

export default function ManualAITestCreator({
  editingTest,
  onCancel,
  onSuccess,
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [processingState, setProcessingState] = useState(null)
  const [formData, setFormData] = useState({
    title: editingTest?.title || '',
    keyTopic: editingTest?.keyTopic || '',
    type: editingTest?.type || 'FREE',
    durationInMinutes: editingTest?.durationInMinutes || 180,
    rawText: '',
  })
  const [error, setError] = useState(null)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [currentPassageInfo, setCurrentPassageInfo] = useState(null)
  const isContinuation = editingTest?.aiContinuation

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const startManualProcessing = async () => {
    if (!formData.rawText.trim()) {
      setError('Please paste your test content first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create test first if not continuing
      let testId = editingTest?.id
      if (!isContinuation) {
        const testResponse = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            keyTopic: formData.keyTopic,
            type: formData.type,
            durationInMinutes: formData.durationInMinutes,
            status: 'DRAFT',
          }),
        })

        if (!testResponse.ok) {
          const errorData = await testResponse.json()
          throw new Error(
            `Failed to create test: ${errorData.error || 'Unknown error'}`
          )
        }

        const testData = await testResponse.json()
        console.log('Test creation response:', testData)
        testId = testData.testId || testData.test?.id || testData.id

        console.log('Extracted testId:', testId)

        if (!testId) {
          console.error('Available response keys:', Object.keys(testData))
          throw new Error('Test ID not found in response')
        }
      }

      // Start manual processing
      const response = await fetch('/api/admin/tests/ai-process-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          rawText: formData.rawText,
          testId: testId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to start manual processing')
      }

      const data = await response.json()
      setProcessingId(data.processingId)
      setProcessingState(data.state)
    } catch (error) {
      console.error('Error starting manual processing:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateNextPassage = async () => {
    if (!processingId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/tests/ai-process-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-next',
          processingId: processingId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.completed) {
          // All passages processed
          alert('All passages have been processed! Test created successfully.')
          router.push(`/admin/create-test/${processingState.testId}/questions`)
          return
        }
        throw new Error(errorData.error || 'Failed to generate next passage')
      }

      const data = await response.json()
      setProcessingState(data.state)
      setGeneratedQuestions(data.generatedQuestions || [])
      setCurrentPassageInfo(data.passageInfo)
    } catch (error) {
      console.error('Error generating next passage:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelProcessing = async () => {
    if (!processingId) return

    try {
      await fetch('/api/admin/tests/ai-process-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          processingId: processingId,
        }),
      })
    } catch (error) {
      console.error('Error cancelling processing:', error)
    }

    setProcessingId(null)
    setProcessingState(null)
    setGeneratedQuestions([])
    setCurrentPassageInfo(null)
  }

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent space-y-6 p-3 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isContinuation ? 'Continue with AI' : 'Create Test with AI'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isContinuation
              ? 'Continue generating questions for your test'
              : 'Generate questions manually, passage by passage'}
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
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      Test Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Basic details for your test
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Test Title
                      <span className="text-red-500 pl-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange('title', e.target.value)
                      }
                      placeholder="Enter test title"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
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
                      placeholder="e.g., CLAT 2024 Mock Test"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">Free Test</SelectItem>
                        <SelectItem value="PAID">Paid Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="duration"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.durationInMinutes}
                      onChange={(e) =>
                        handleInputChange(
                          'durationInMinutes',
                          parseInt(e.target.value) || 180
                        )
                      }
                      placeholder="180"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                    />
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
            <CardContent className="space-y-4 p-6">
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
                  onChange={(e) => handleInputChange('rawText', e.target.value)}
                  placeholder="Paste your complete test data here... (PDF/Word content, questions, passages, answers, etc.)"
                  className="min-h-[300px] bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
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
              {!processingState ? (
                <Button
                  onClick={startManualProcessing}
                  disabled={loading || !formData.rawText.trim()}
                  className="w-full flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 h-4 w-4" />
                      <span>Start Manual Processing</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Ready to generate passages
                      </span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {processingState.passages?.length || 0} passages found
                    </span>
                  </div>
                  <Button
                    onClick={generateNextPassage}
                    disabled={
                      loading ||
                      processingState.currentPassageIndex >=
                        (processingState.passages?.length || 0)
                    }
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        <span>Generate Next Passage</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={cancelProcessing}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel Processing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {processingState ? (
            <>
              {/* Progress Card */}
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        Processing Progress
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Manual passage generation
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {processingState.currentPassageIndex} /{' '}
                        {processingState.passages?.length || 0}
                      </span>
                    </div>
                    <Progress
                      value={
                        (processingState.currentPassageIndex /
                          (processingState.passages?.length || 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {processingState.totalQuestions || 0}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Questions Generated
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {processingState.passages?.length || 0}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400">
                        Total Passages
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Passage Info */}
              {currentPassageInfo && (
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          Current Passage
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          {currentPassageInfo.title}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          Passage Content:
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white max-h-32 overflow-y-auto">
                          {currentPassageInfo.content?.substring(0, 300)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {currentPassageInfo.sectionType}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                          {generatedQuestions.length} questions generated
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Questions Preview */}
              {generatedQuestions.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          Latest Generated Questions
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          {generatedQuestions.length} questions from current
                          passage
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {generatedQuestions.map((question, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                              Q{question.number}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Correct: {question.correctOption}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 dark:text-white mb-2">
                            {question.question}
                          </div>
                          <div className="space-y-1">
                            {question.options?.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="text-xs text-gray-600 dark:text-gray-300"
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 h-full flex items-center justify-center">
              <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Manual generation results will appear here</p>
                <p className="text-sm mt-2">
                  Paste your content and click "Start Manual Processing" to
                  begin
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
