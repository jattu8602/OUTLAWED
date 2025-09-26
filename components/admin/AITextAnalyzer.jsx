'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Brain,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  Download,
  Sparkles,
  BookOpen,
  Target,
  Scale,
  Brain as BrainIcon,
  Calculator,
  Edit3,
  Table,
  Image as ImageIcon,
  Wand2,
  Save,
  X,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AITextAnalyzer({ testId, onImportComplete }) {
  const [text, setText] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [progress, setProgress] = useState(0)

  // Editing states
  const [editingPassage, setEditingPassage] = useState(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isEditingTable, setIsEditingTable] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [tableEditData, setTableEditData] = useState(null)
  const [imageUploadData, setImageUploadData] = useState(null)

  // Helper function to validate and clean explanations
  const validateAndCleanExplanations = (questions) => {
    return questions.map((question, index) => {
      if (!question.explanation) return question

      let explanation = question.explanation.trim()

      // Check if explanation contains content from next questions
      const nextQuestionPattern = /Q\d+|Question\s+\d+/i
      const nextQuestionMatch = explanation.match(nextQuestionPattern)

      if (nextQuestionMatch) {
        // Find the position of the next question reference
        const nextQuestionIndex = explanation.indexOf(nextQuestionMatch[0])
        // Truncate explanation at the next question boundary
        explanation = explanation.substring(0, nextQuestionIndex).trim()
      }

      // Remove any trailing dashes or separators that might indicate bleeding
      explanation = explanation.replace(/[-—–]\s*$/, '').trim()

      return {
        ...question,
        explanation: explanation || null,
      }
    })
  }

  // Helper function to check if answers were properly extracted
  const checkAnswerExtraction = (analysis) => {
    if (!analysis)
      return { hasAnswers: 0, totalQuestions: 0, extractionRate: 0 }

    let hasAnswers = 0
    let totalQuestions = 0

    analysis.sections.forEach((section) => {
      section.passages.forEach((passage) => {
        passage.questions.forEach((question) => {
          totalQuestions++
          if (question.correctAnswer && question.correctAnswer.trim()) {
            hasAnswers++
          }
        })
      })
    })

    const extractionRate =
      totalQuestions > 0 ? Math.round((hasAnswers / totalQuestions) * 100) : 0

    return { hasAnswers, totalQuestions, extractionRate }
  }

  const handleEnhanceText = async (sectionIndex, passageIndex) => {
    if (!analysis) return

    setIsEnhancing(true)
    const passage = analysis.sections[sectionIndex].passages[passageIndex]

    // Validate and clean explanations before enhancement
    const cleanedQuestions = validateAndCleanExplanations(passage.questions)

    const questionTexts = cleanedQuestions.map((q) => q.questionText || '')
    const questionExplanations = cleanedQuestions.map(
      (q) => q.explanation || ''
    )

    try {
      const response = await fetch('/api/admin/tests/ai-enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageContent: passage.content,
          questionTexts,
          questionExplanations,
          section: analysis.sections[sectionIndex].name,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Update the analysis with enhanced content
        const updatedAnalysis = { ...analysis }
        const passageToUpdate =
          updatedAnalysis.sections[sectionIndex].passages[passageIndex]

        passageToUpdate.content = data.enhancedPassage
        passageToUpdate.contentFormat = data.passageFormatting

        if (
          data.enhancedQuestionTexts &&
          Array.isArray(data.enhancedQuestionTexts)
        ) {
          passageToUpdate.questions.forEach((question, index) => {
            if (data.enhancedQuestionTexts[index]) {
              question.questionText = data.enhancedQuestionTexts[index]
              // Note: You might want a separate formatting object for questions from the API
            }
          })
        }

        if (
          data.enhancedExplanations &&
          Array.isArray(data.enhancedExplanations)
        ) {
          passageToUpdate.questions.forEach((question, index) => {
            if (data.enhancedExplanations[index]) {
              question.explanation = data.enhancedExplanations[index]
              question.explanationFormat = data.explanationFormatting
                ? data.explanationFormatting[index]
                : null
            }
          })
        }

        setAnalysis(updatedAnalysis)

        toast.success(
          'Passage and question explanations enhanced successfully!'
        )
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to enhance text')
      }
    } catch (error) {
      console.error('Error enhancing text:', error)
      toast.error('Error enhancing text. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const sectionOptions = [
    { value: 'ENGLISH', label: 'English' },
    { value: 'GK_CA', label: 'GK & Current Affairs' },
    { value: 'LEGAL_REASONING', label: 'Legal Reasoning' },
    { value: 'LOGICAL_REASONING', label: 'Logical Reasoning' },
    { value: 'QUANTITATIVE_TECHNIQUES', label: 'Quantitative Techniques' },
  ]

  const sectionIcons = {
    ENGLISH: BookOpen,
    GK_CA: Target,
    LEGAL_REASONING: Scale,
    LOGICAL_REASONING: BrainIcon,
    QUANTITATIVE_TECHNIQUES: Calculator,
  }

  const sectionColors = {
    ENGLISH: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    GK_CA: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    LEGAL_REASONING:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    LOGICAL_REASONING:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    QUANTITATIVE_TECHNIQUES:
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze')
      return
    }

    if (!selectedSection) {
      toast.error('Please select a section type')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysis(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch('/api/admin/tests/ai-analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          testId,
          selectedSection,
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()

        // Clean explanations in the analysis result
        const cleanedAnalysis = {
          ...data.analysis,
          sections: data.analysis.sections.map((section) => ({
            ...section,
            passages: section.passages.map((passage) => ({
              ...passage,
              questions: validateAndCleanExplanations(passage.questions),
            })),
          })),
        }

        setAnalysis(cleanedAnalysis)
        toast.success('Text analyzed successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to analyze text')
      }
    } catch (error) {
      console.error('Error analyzing text:', error)
      toast.error('Error analyzing text. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const handleImport = async () => {
    if (!analysis) {
      toast.error('No analysis to import')
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch('/api/admin/tests/ai-import-analyzed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          analysis,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          `Successfully imported ${data.summary.questionsCreated} questions and ${data.summary.passagesCreated} passages!`
        )

        if (onImportComplete) {
          onImportComplete(data)
        }

        // Reset form
        setText('')
        setSelectedSection('')
        setAnalysis(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to import content')
      }
    } catch (error) {
      console.error('Error importing content:', error)
      toast.error('Error importing content. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const getSectionIcon = (sectionName) => {
    const Icon = sectionIcons[sectionName] || FileText
    return <Icon className="h-4 w-4 dark:text-white" />
  }

  // Enhanced text editing functions
  const handleEditTable = (sectionIndex, passageIndex) => {
    const passage = analysis.sections[sectionIndex].passages[passageIndex]
    setTableEditData({
      sectionIndex,
      passageIndex,
      tableData: passage.tableData || [
        ['', ''],
        ['', ''],
      ],
      isTable: passage.isTable,
    })
    setIsEditingTable(true)
  }

  const handleSaveTable = () => {
    if (!tableEditData) return

    const updatedAnalysis = { ...analysis }
    updatedAnalysis.sections[tableEditData.sectionIndex].passages[
      tableEditData.passageIndex
    ].tableData = tableEditData.tableData
    updatedAnalysis.sections[tableEditData.sectionIndex].passages[
      tableEditData.passageIndex
    ].isTable = true
    setAnalysis(updatedAnalysis)

    setIsEditingTable(false)
    setTableEditData(null)
    toast.success('Table updated successfully!')
  }

  const handleAddTableRow = () => {
    if (!tableEditData) return
    const newRow = new Array(tableEditData.tableData[0]?.length || 2).fill('')
    setTableEditData({
      ...tableEditData,
      tableData: [...tableEditData.tableData, newRow],
    })
  }

  const handleAddTableColumn = () => {
    if (!tableEditData) return
    setTableEditData({
      ...tableEditData,
      tableData: tableEditData.tableData.map((row) => [...row, '']),
    })
  }

  const handleRemoveTableRow = (rowIndex) => {
    if (!tableEditData || tableEditData.tableData.length <= 1) return
    setTableEditData({
      ...tableEditData,
      tableData: tableEditData.tableData.filter(
        (_, index) => index !== rowIndex
      ),
    })
  }

  const handleRemoveTableColumn = (colIndex) => {
    if (!tableEditData || tableEditData.tableData[0]?.length <= 1) return
    setTableEditData({
      ...tableEditData,
      tableData: tableEditData.tableData.map((row) =>
        row.filter((_, index) => index !== colIndex)
      ),
    })
  }

  const handleUpdateTableCell = (rowIndex, colIndex, value) => {
    if (!tableEditData) return
    const newTableData = [...tableEditData.tableData]
    newTableData[rowIndex][colIndex] = value
    setTableEditData({
      ...tableEditData,
      tableData: newTableData,
    })
  }

  const handleUploadImage = (sectionIndex, passageIndex) => {
    setImageUploadData({ sectionIndex, passageIndex })
    setIsUploadingImage(true)
  }

  const handleImageUpload = async (file) => {
    if (!imageUploadData) return

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/admin/tests/upload-passage-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        // Update the analysis with new image
        const updatedAnalysis = { ...analysis }
        const passage =
          updatedAnalysis.sections[imageUploadData.sectionIndex].passages[
            imageUploadData.passageIndex
          ]
        passage.hasImage = true
        passage.imageUrls = [...(passage.imageUrls || []), data.imageUrl]
        setAnalysis(updatedAnalysis)

        toast.success('Image uploaded successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error uploading image. Please try again.')
    } finally {
      setIsUploadingImage(false)
      setImageUploadData(null)
    }
  }

  const handleRemoveImage = (sectionIndex, passageIndex, imageIndex) => {
    const updatedAnalysis = { ...analysis }
    const passage =
      updatedAnalysis.sections[sectionIndex].passages[passageIndex]
    passage.imageUrls.splice(imageIndex, 1)
    if (passage.imageUrls.length === 0) {
      passage.hasImage = false
    }
    setAnalysis(updatedAnalysis)
    toast.success('Image removed successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="dark:text-white">AI Text Analyzer</span>
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            Paste your test content and let AI extract passages, questions, and
            generate answers. <strong>Tip:</strong> If you have answers and
            explanations, include them in this format:
            <br />
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              answers - and explanations -<br />
              questions:
              <br />
              q1:
              <br />
              &nbsp;&nbsp;question_number: 1<br />
              &nbsp;&nbsp;answer: (b) Your answer here
              <br />
              &nbsp;&nbsp;explanation: Your explanation here
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="section-select"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Section Type
            </Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger
                className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50
                 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 transition-colors"
              >
                <SelectValue
                  placeholder="Select the section type for better AI analysis"
                  className="text-gray-700 dark:text-gray-100"
                />
              </SelectTrigger>
              <SelectContent
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 shadow-lg rounded-lg overflow-hidden"
              >
                {sectionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center space-x-2 px-3 py-2
                     text-gray-700 dark:text-gray-100
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     cursor-pointer transition-colors"
                  >
                    {/* Fixed width container for icons */}
                    <div className="flex items-center space-x-2 pl-2">
                      <span className="w-5 h-5 flex items-center justify-center dark:text-white">
                        {getSectionIcon(option.value)}
                      </span>
                      <span className="dark:text-white">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="test-content"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Test Content
            </Label>
            <Textarea
              id="test-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your test content here... (passages, questions, options)"
              rows={12}
              className="resize-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 transition-colors"
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim() || !selectedSection}
            className="w-full bg-black text-white hover:bg-gray-800 rounded-lg px-4 py-2 dark:bg-gray-50 dark:text-black dark:hover:bg-gray-200"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Text...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing content...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span className="dark:text-white">Analysis Results</span>
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Review the extracted content before importing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg ">
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.summary.totalPassages}
                </div>
                <div className="text-sm text-blue-600">Passages</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.summary.totalQuestions}
                </div>
                <div className="text-sm text-green-600">Questions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analysis.summary.sectionsDetected.length}
                </div>
                <div className="text-sm text-purple-600">Sections</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {(() => {
                    const answerStats = checkAnswerExtraction(analysis)
                    return `${answerStats.extractionRate}%`
                  })()}
                </div>
                <div className="text-sm text-orange-600">Answers</div>
              </div>
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {analysis.summary.hasTables ? '✓' : '✗'}
                </div>
                <div className="text-sm text-indigo-600">Tables</div>
              </div>
              <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">
                  {analysis.summary.hasImages ? '✓' : '✗'}
                </div>
                <div className="text-sm text-cyan-600">Images</div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Sections Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.summary.sectionsDetected.map((section) => (
                  <Badge
                    key={section}
                    className={`${sectionColors[section]} flex items-center space-x-1`}
                  >
                    {getSectionIcon(section)}
                    <span>{section.replace('_', ' & ')}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Detailed Content */}
            <div className="space-y-4 ">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Content Preview
              </h3>
              {analysis.sections.map((section, sectionIndex) => (
                <div
                  key={sectionIndex}
                  className="border rounded-lg p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    {getSectionIcon(section.name)}
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                      {section.name.replace('_', ' & ')}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {section.passages.length} passages
                    </Badge>
                  </div>

                  {section.passages.map((passage, passageIndex) => (
                    <div
                      key={passageIndex}
                      className="ml-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 dark:text-white" />
                          <span className="font-medium dark:text-white">
                            Passage {passage.passageNumber}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {passage.questions.length} questions
                          </Badge>
                          {passage.hasImage && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <FileText className="h-3 w-3 mr-1 dark:text-white" />
                              Has Images
                            </Badge>
                          )}
                          {passage.isTable && (
                            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              <Calculator className="h-3 w-3 mr-1 dark:text-white" />
                              Contains Table
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {passage.questions.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Questions:{' '}
                              {passage.questions
                                .map((q) => `Q${q.questionNumber}`)
                                .join(', ')}
                            </div>
                          )}

                          {/* Editing Tools */}
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEnhanceText(sectionIndex, passageIndex)
                              }
                              disabled={isEnhancing}
                              className="h-8 px-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              title="Enhance text with AI"
                            >
                              {isEnhancing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Wand2 className="h-3 w-3 dark:text-white" />
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEditTable(sectionIndex, passageIndex)
                              }
                              className="h-8 px-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              title="Edit table data"
                            >
                              <Table className="h-3 w-3" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUploadImage(sectionIndex, passageIndex)
                              }
                              className="h-8 px-2 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              title="Add image"
                            >
                              <ImageIcon className="h-3 w-3 dark:text-white" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Passage Content */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Passage Content:
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-700 p-3 rounded border">
                          {passage.content}
                        </div>
                      </div>

                      {/* Passage Images */}
                      {passage.hasImage &&
                        passage.imageUrls &&
                        passage.imageUrls.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Images:
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {passage.imageUrls.map((imageUrl, imageIndex) => (
                                <div
                                  key={imageIndex}
                                  className="relative group"
                                >
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
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() =>
                                      handleRemoveImage(
                                        sectionIndex,
                                        passageIndex,
                                        imageIndex
                                      )
                                    }
                                    title="Remove image"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Passage Table Data */}
                      {passage.isTable && passage.tableData && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Table Data:
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                              <tbody>
                                {passage.tableData.map((row, rowIndex) => (
                                  <tr
                                    key={rowIndex}
                                    className={
                                      rowIndex % 2 === 0
                                        ? 'bg-gray-50 dark:bg-gray-800'
                                        : 'bg-white dark:bg-gray-700'
                                    }
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-center"
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

                      <div className="space-y-3">
                        {passage.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Q{question.questionNumber}
                                </span>
                                {question.isTable && (
                                  <Badge className="bg-purple-100 text-purple-800">
                                    <Calculator className="h-3 w-3 mr-1" />
                                    Table Data
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {question.correctAnswer && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Has Answer
                                  </Badge>
                                )}
                                {question.correctAnswer &&
                                  question.explanation && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Provided
                                    </Badge>
                                  )}
                                {question.explanation && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Has Explanation
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Question Text */}
                            <div className="mb-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Question:
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {question.questionText}
                              </div>
                            </div>

                            {/* Table Data Display */}
                            {question.tableData && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                  Table Data:
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs border border-gray-300 dark:border-gray-600">
                                    <tbody>
                                      {question.tableData.map(
                                        (row, rowIndex) => (
                                          <tr
                                            key={rowIndex}
                                            className={
                                              rowIndex % 2 === 0
                                                ? 'bg-gray-50 dark:bg-gray-800'
                                                : 'bg-white dark:bg-gray-700'
                                            }
                                          >
                                            {row.map((cell, cellIndex) => (
                                              <td
                                                key={cellIndex}
                                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center"
                                              >
                                                {cell}
                                              </td>
                                            ))}
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Options */}
                            {question.options &&
                              question.options.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Options:
                                  </div>
                                  <div className="space-y-1">
                                    {question.options.map(
                                      (option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className="flex items-start space-x-2 text-sm"
                                        >
                                          <span className="font-medium text-gray-600 dark:text-gray-400 min-w-[20px]">
                                            {String.fromCharCode(
                                              97 + optionIndex
                                            )}
                                            )
                                          </span>
                                          <span className="text-gray-700 dark:text-gray-300">
                                            {option}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Correct Answer */}
                            {question.correctAnswer && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                  Correct Answer:
                                </div>
                                <div className="text-sm text-green-700 dark:text-green-400 font-medium">
                                  {question.correctAnswer}
                                </div>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center space-x-2">
                                  <span>Explanation:</span>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Isolated
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
                                  {question.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Import Button */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import to Test
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Editing Dialog */}
      <Dialog open={isEditingTable} onOpenChange={setIsEditingTable}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Edit Table Data</DialogTitle>
            <DialogDescription>
              Edit the table data for this passage. You can add/remove rows and
              columns, and edit cell values.
            </DialogDescription>
          </DialogHeader>

          {tableEditData && (
            <div className="space-y-4">
              {/* Table Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleAddTableRow}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Row</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTableColumn}
                  className="flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Column</span>
                </Button>
              </div>

              {/* Table Editor */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                  <tbody>
                    {tableEditData.tableData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className="border border-gray-300 dark:border-gray-600 p-1"
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                handleUpdateTableCell(
                                  rowIndex,
                                  colIndex,
                                  e.target.value
                                )
                              }
                              className="w-full p-1 text-sm border-none outline-none bg-transparent"
                            />
                          </td>
                        ))}
                        <td className="border border-gray-300 dark:border-gray-600 p-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveTableRow(rowIndex)}
                            disabled={tableEditData.tableData.length <= 1}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      {tableEditData.tableData[0]?.map((_, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-gray-300 dark:border-gray-600 p-1"
                        >
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveTableColumn(colIndex)}
                            disabled={tableEditData.tableData[0]?.length <= 1}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      ))}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Dialog Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingTable(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTable}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Table
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={isUploadingImage} onOpenChange={setIsUploadingImage}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image for this passage. Supported formats: JPG, PNG,
              GIF, WebP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    handleImageUpload(file)
                  }
                }}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click to select an image
                </span>
                <span className="text-xs text-gray-500">Max size: 5MB</span>
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline dark:border-gray-700 dark:text-white"
                onClick={() => setIsUploadingImage(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
