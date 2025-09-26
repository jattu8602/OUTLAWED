'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import TestCard from '@/components/test-card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Award, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'

export default function TestSeriesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [series, setSeries] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSeriesDetails(params.id)
    }
  }, [params.id])

  const fetchSeriesDetails = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/test-series/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSeries(data.series)
        setCompletion(data.completion)
      } else {
        toast.error('Failed to fetch test series details.')
        router.push('/dashboard/test-series')
      }
    } catch (error) {
      toast.error('An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleTestCardAction = (testId, action) => {
    if (action === 'upgrade') {
      router.push('/dashboard/payment-history')
    } else if (action === 'attempt' || action === 'reattempt') {
      router.push(`/dashboard/test/${testId}`)
    }
  }

  const sortedTests = series?.tests.sort((a, b) => {
    if (series.type === 'DAILY') {
      // Assuming 'addedAt' is available from the relation table, but it's not on the final test object.
      // Let's sort by test creation date as a proxy for "newness".
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    // PLAYLIST keeps the default order from the DB (addedAt asc)
    return 0
  })

  if (loading) {
    return <div>Loading...</div>
  }

  if (!series) {
    return <div>Test series not found.</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 dark:bg-slate-800 dark:text-white hover:bg-slate-800 hover:text-white dark:border-slate-700 border-slate-200 dark:hover:bg-slate-700 dark:hover:text-white bg-slate-700 text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Test Series
      </Button>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {series.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {series.description}
          </p>
        </div>
        {series.type === 'PLAYLIST' && completion && (
          <Card className="mt-4 md:mt-0 dark:bg-slate-800 dark:text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Progress
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completion.completed} / {completion.total}
              </div>
              <p className="text-xs text-muted-foreground">tests completed</p>
              <Progress value={completion.percentage} className="mt-2" />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8">
        {series.type === 'DAILY' && (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Daily Series
            </p>
            <p>New tests will appear at the top of this list.</p>
          </div>
        )}

        {/* Table Layout */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div>SCORE</div>
            <div>TAKE ACTION</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {sortedTests.map((test, index) => (
              <div key={test.id} className="relative">
                <TestCard
                  id={test.id}
                  title={test.title}
                  type={test.type}
                  userType={session?.user?.role}
                  isAttempted={test.isAttempted}
                  attemptCount={test.attemptCount}
                  lastScore={test.lastScore}
                  obtainedMarks={test.obtainedMarks}
                  totalMarks={test.totalMarks}
                  attemptHistory={test.attemptHistory}
                  locked={
                    test.type === 'PAID' && session?.user?.role === 'FREE'
                  }
                  lockLabel="Upgrade to Premium"
                  onAction={(action) => handleTestCardAction(test.id, action)}
                  isNew={series.type === 'DAILY' && index === 0} // Example 'new' tag logic
                />
                {series.type === 'DAILY' && index === 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    NEW
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
