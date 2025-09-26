'use client'

import { useState } from 'react'
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
} from 'lucide-react'

export default function AITestCreator({ editingTest, onCancel, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    title: editingTest?.title || '',
    keyTopic: editingTest?.keyTopic || '',
    type: editingTest?.type || 'FREE',
    durationInMinutes: editingTest?.durationInMinutes || 180,
    rawText: '',
  })
  const [aiResult, setAiResult] = useState(null)
  const [error, setError] = useState(null)
  const isContinuation = editingTest?.aiContinuation

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const processWithAI = async () => {
    if (!formData.rawText.trim()) {
      setError('Please paste the test content to process with AI')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/tests/ai-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawText: formData.rawText,
          testTitle: formData.title || 'AI Generated Test',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setAiResult(result)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to process with AI')
      }
    } catch (error) {
      console.error('Error processing with AI:', error)
      setError('Error processing with AI. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const createTestWithAI = async () => {
    if (!aiResult) return

    setLoading(true)

    try {
      if (isContinuation) {
        // Continue with existing test
        await continueWithAI(editingTest.id)
      } else {
        // Create new test
        const testResponse = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title || aiResult.testTitle,
            keyTopic: formData.keyTopic,
            type: formData.type,
            durationInMinutes: formData.durationInMinutes,
          }),
        })

        if (testResponse.ok) {
          const testResult = await testResponse.json()
          const { testId } = testResult

          // Then create questions using AI data
          const questionsResponse = await fetch(
            `/api/admin/tests/${testId}/questions/ai-bulk`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sections: aiResult.sections,
              }),
            }
          )

          if (questionsResponse.ok) {
            alert('Test created successfully with AI-generated questions!')
            router.push(`/admin/create-test/${testId}/questions`)
          } else {
            const errorData = await questionsResponse.json()
            alert(errorData.message || 'Error creating questions')
          }
        } else {
          const errorData = await testResponse.json()
          alert(errorData.message || 'Error creating test')
        }
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Error creating test')
    } finally {
      setLoading(false)
    }
  }

  const continueWithAI = async (testId) => {
    if (!aiResult) return

    setLoading(true)

    try {
      const response = await fetch(
        `/api/admin/tests/${testId}/questions/ai-bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sections: aiResult.sections,
          }),
        }
      )

      if (response.ok) {
        alert('Questions added successfully with AI!')
        router.push(`/admin/create-test/${testId}/questions`)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Error adding questions')
      }
    } catch (error) {
      console.error('Error adding questions:', error)
      alert('Error adding questions')
    } finally {
      setLoading(false)
    }
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
              : 'Paste your test content and let AI extract questions, passages, and answers'}
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

                <Button
                  onClick={processWithAI}
                  disabled={processing || !formData.rawText.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Process with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Results */}
        <div className="space-y-6">
          {aiResult && (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">
                      AI Processing Results
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Review the extracted content
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Test Title: {aiResult.testTitle}
                    </h3>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p>Total Sections: {aiResult.sections?.length || 0}</p>
                      <p>
                        Total Questions:{' '}
                        {aiResult.sections?.reduce(
                          (total, section) =>
                            total + (section.questions?.length || 0),
                          0
                        ) || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {aiResult.sections?.map((section, sectionIndex) => (
                      <div
                        key={sectionIndex}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {section.sectionType} (
                          {section.questions?.length || 0} questions)
                        </h4>
                        <div className="space-y-2">
                          {section.questions
                            ?.slice(0, 3)
                            .map((question, qIndex) => (
                              <div
                                key={qIndex}
                                className="text-sm text-gray-600 dark:text-gray-300"
                              >
                                <p className="font-medium">
                                  Q{question.number}:{' '}
                                  {question.question?.substring(0, 100)}...
                                </p>
                                <p className="text-xs text-gray-500">
                                  Correct: {question.correctOption}
                                </p>
                              </div>
                            ))}
                          {section.questions?.length > 3 && (
                            <p className="text-xs text-gray-500">
                              ... and {section.questions.length - 3} more
                              questions
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={createTestWithAI}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                          {isContinuation
                            ? 'Adding Questions...'
                            : 'Creating Test...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {isContinuation
                            ? 'Add Questions with AI'
                            : 'Create Test with AI'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!aiResult && (
            <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>AI processing results will appear here</p>
                  <p className="text-sm mt-2">
                    Paste your content and click "Process with AI" to get
                    started
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
