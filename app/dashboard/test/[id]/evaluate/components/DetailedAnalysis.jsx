'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { Sparkles, BrainCircuit } from 'lucide-react'
import FollowUpChat from './FollowUpChat'
import { useSanitizedHTML } from '@/hooks/useSanitizedHTML'

export default function DetailedAnalysis({
  testId,
  attemptId,
  questionId,
  analysisCache,
  setAnalysisCache,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const analysis = analysisCache[questionId] || ''
  const sanitizedAnalysis = useSanitizedHTML(analysis)

  const handleGenerateAnalysis = async () => {
    if (analysis) {
      setAnalysisCache((prev) => {
        const newCache = { ...prev }
        delete newCache[questionId]
        return newCache
      })
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tests/detailed-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          attemptId,
          questionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate analysis')
      }

      const data = await response.json()
      setAnalysisCache((prev) => ({
        ...prev,
        [questionId]: data.analysis,
      }))
    } catch (err) {
      setError(err.message)
      toast.error('Could not generate detailed analysis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex justify-start">
        <Button
          onClick={handleGenerateAnalysis}
          disabled={loading}
          variant="outline"
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : analysis ? (
            'Hide Detailed Analysis'
          ) : (
            <>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Get Detailed AI Analysis
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="mt-4 p-3 sm:p-6 rounded-lg border bg-slate-50 dark:bg-slate-800">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedAnalysis }}
          />
          <FollowUpChat questionId={questionId} analysis={analysis} />
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
