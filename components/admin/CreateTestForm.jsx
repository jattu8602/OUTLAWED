'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Save,
  ArrowLeft,
  FileText,
  Clock,
  RefreshCcw,
  ChevronDown,
} from 'lucide-react'

export default function CreateTestForm({ editingTest, onCancel, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: editingTest?.title || '',
    keyTopic: editingTest?.keyTopic || '',
    type: editingTest?.type || 'FREE',
    durationInMinutes: editingTest?.durationInMinutes || 180,
  })

  const [keyTopicSuggestions, setKeyTopicSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch key topic suggestions on component mount
  useEffect(() => {
    const fetchKeyTopicSuggestions = async () => {
      try {
        const response = await fetch('/api/admin/tests/key-topics')
        if (response.ok) {
          const data = await response.json()
          setKeyTopicSuggestions(data.keyTopics || [])
        }
      } catch (error) {
        console.error('Error fetching key topic suggestions:', error)
      }
    }

    fetchKeyTopicSuggestions()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleKeyTopicSelect = (topic) => {
    setFormData((prev) => ({
      ...prev,
      keyTopic: topic,
    }))
    setShowSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingTest
        ? `/api/admin/tests/${editingTest.id}`
        : '/api/admin/tests'

      const method = editingTest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        if (editingTest) {
          // Update the test in the list
          onSuccess({ type: 'update', test: { ...editingTest, ...formData } })
          alert('Test updated successfully!')
        } else {
          // Create new test
          const { testId } = result
          router.push(`/admin/create-test/${testId}/questions`)
        }
      } else {
        const error = await response.json()
        alert(error.message || 'Error saving test')
      }
    } catch (error) {
      console.error('Error saving test:', error)
      alert('Error saving test')
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
            {editingTest ? 'Edit Test' : 'Create New Test'}
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1">
            {editingTest
              ? 'Update test information and settings'
              : 'Create a new test with basic information and settings'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                  Fill in the basic details for your test
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Test Title */}
            <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
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
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter test title"
                required
                className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 dark:placeholder-gray-300"
              />
            </div>

            {/* Key Topic */}
            <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
              <Label
                htmlFor="keyTopic"
                className="text-gray-700 dark:text-gray-300"
              >
                Key Topic
              </Label>
              <div className="relative">
                <Input
                  id="keyTopic"
                  value={formData.keyTopic}
                  onChange={(e) =>
                    handleInputChange('keyTopic', e.target.value)
                  }
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Enter key topic or select from suggestions"
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 dark:placeholder-gray-300"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Key Topic Suggestions */}
              {showSuggestions && keyTopicSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {keyTopicSuggestions.map((topic, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleKeyTopicSelect(topic)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Test Type */}
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Test Type
                <span className="text-red-500 pl-1">*</span>
              </Label>

              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-150 rounded-md px-3 py-2 text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-800 dark:text-gray-200">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>

                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
                  <SelectItem
                    value="FREE"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer px-3 py-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-700 dark:text-gray-200">
                        Free Test
                      </span>
                    </div>
                  </SelectItem>

                  <SelectItem
                    value="PAID"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer px-3 py-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-gray-700 dark:text-gray-200">
                        Paid Test
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="space-y-2 dark:placeholder-gray-300 dark:text-gray-300">
                <Label
                  htmlFor="durationInMinutes"
                  className="text-gray-700 dark:text-gray-300 dark:placeholder-gray-300 dark:text-gray-300"
                >
                  Duration (minutes)
                  <span className="text-red-500 pl-1">*</span>
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
                    required
                    className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title}
            className={`flex items-center gap-2 ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600'
                : editingTest
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
            } text-white`}
          >
            {loading ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : editingTest ? (
              <>
                <Save className="h-4 w-4" />
                <span>Update Test</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Create Test</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
