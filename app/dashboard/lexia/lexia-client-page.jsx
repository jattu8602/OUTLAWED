'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wand2, History } from 'lucide-react'
import TestCard from '@/components/test-card'
import { Skeleton } from '@/components/ui/skeleton'

const TestCardSkeleton = () => (
  <div className="p-4">
    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] items-center gap-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-8 w-3/4" />
    </div>
    <div className="md:hidden space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  </div>
)

export default function LexiaPageClient() {
  const { data: session } = useSession()
  const router = useRouter()
  const [testType, setTestType] = useState('MOCK')
  const [section, setSection] = useState('ENGLISH')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTests, setGeneratedTests] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchGeneratedTests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/lexia/tests')
      if (response.ok) {
        const tests = await response.json()
        console.log('Fetched Lexia tests:', tests)
        setGeneratedTests(tests)
      } else {
        toast.error('Failed to load generated tests.')
      }
    } catch (error) {
      toast.error('An error occurred while fetching tests.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGeneratedTests()
  }, [])

  const handleGenerateTest = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/lexia/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testType,
          ...(testType === 'SECTIONAL' && { section }),
        }),
      })

      if (response.ok) {
        toast.success('Test generated successfully!')
        fetchGeneratedTests() // Refresh the list
      } else {
        const data = await response.json()

        // Handle test generation limit
        if (data.limitReached) {
          toast.error(data.message, {
            duration: 6000,
            style: {
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fca5a5',
            },
          })

          // Show upgrade prompt
          setTimeout(() => {
            toast('💎 Upgrade to Pro for unlimited test generation!', {
              duration: 8000,
              style: {
                background: '#fef3c7',
                color: '#d97706',
                border: '1px solid #fbbf24',
              },
            })
          }, 2000)
        } else {
          toast.error(data.error || 'Failed to generate test.')
        }
      }
    } catch (error) {
      toast.error('An error occurred during test generation.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestAction = (test, action) => {
    console.log(
      'Test action:',
      action,
      'for test:',
      test.id,
      'latestAttemptId:',
      test.latestAttemptId
    )
    if (action === 'attempt' || action === 'reattempt') {
      router.push(`/dashboard/lexia/test/${test.id}`)
    } else if (action === 'evaluate') {
      if (test.latestAttemptId) {
        console.log(
          'Navigating to evaluation with attemptId:',
          test.latestAttemptId
        )
        router.push(
          `/dashboard/lexia/test/${test.id}/evaluate?attemptId=${test.latestAttemptId}`
        )
      } else {
        console.error('No latestAttemptId found for test:', test.id)
        toast.error('Could not find the latest attempt to evaluate.')
      }
    }
  }

  const sections = [
    { key: 'ENGLISH', label: 'English' },
    { key: 'GK_CA', label: 'General Knowledge & Current Affairs' },
    { key: 'LEGAL_REASONING', label: 'Legal Reasoning' },
    { key: 'LOGICAL_REASONING', label: 'Logical Reasoning' },
    { key: 'QUANTITATIVE_TECHNIQUES', label: 'Quantitative Techniques' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-2 md:p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-900 dark:ring-1 dark:ring-zinc-600">
                  <Image
                    src="https://res.cloudinary.com/doxmvuss9/image/upload/v1758572676/link-generator/nov3afjjyzht0b8z7u4k.png"
                    alt="Lexia"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>

                <div className="flex-1">
                  <CardTitle className="dark:text-white">
                    Lexia Test Generator
                  </CardTitle>
                  <CardDescription className="dark:text-white">
                    Create your own custom CLAT practice tests.
                  </CardDescription>
                  {/* Test Count and Limit Indicator */}
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Generated: {generatedTests.length} tests
                    </span>
                    {session?.user?.role === 'FREE' && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        (Limit: 5 tests)
                      </span>
                    )}
                    {session?.user?.role === 'PAID' && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        (Unlimited)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Leaderboard Note - Mobile Responsive */}
              <div className="w-full">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                        !
                      </span>
                    </div>
                    <div className="text-xs text-amber-800 dark:text-amber-200">
                      <div className="font-medium mb-1">Note:</div>
                      <div>
                        Lexia test scores are not included in leaderboard
                        rankings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* dark:bg-[#1E293B]  */}
          </CardHeader>
          <CardContent className="space-y-4 md:flex md:items-end md:justify-between md:space-y-0 md:space-x-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Test Type
                </label>
                <Select value={testType} onValueChange={setTestType}>
                  <SelectTrigger className="w-full mt-1 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-300 bg-zinc-100">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-300 bg-zinc-100">
                    <SelectItem value="MOCK">
                      Full Mock Test (120 Questions)
                    </SelectItem>
                    <SelectItem value="SECTIONAL">Sectional Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {testType === 'SECTIONAL' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Section
                  </label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger className="w-full mt-1 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-300 bg-zinc-100">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-300 bg-zinc-100">
                      {sections.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={handleGenerateTest}
                disabled={
                  isGenerating ||
                  (session?.user?.role === 'FREE' && generatedTests.length >= 5)
                }
                className="dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-300 bg-zinc-200"
              >
                {isGenerating
                  ? 'Generating...'
                  : session?.user?.role === 'FREE' && generatedTests.length >= 5
                  ? 'Limit Reached'
                  : 'Generate Test'}
              </Button>

              {session?.user?.role === 'FREE' && generatedTests.length >= 5 && (
                <Button
                  onClick={() => router.push('/dashboard/payments')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  💎 Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <History className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <CardTitle className="dark:text-white">
                  Generated Test History
                </CardTitle>
                <CardDescription className="dark:text-white">
                  Review and retake your previously generated tests.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {isLoading ? (
              <>
                <TestCardSkeleton />
                <TestCardSkeleton />
                <TestCardSkeleton />
              </>
            ) : generatedTests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                You haven't generated any tests yet.
              </div>
            ) : (
              <>
                <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <div>NAME</div>
                  <div>TYPE</div>
                  <div>STATUS</div>
                  <div>SCORE</div>
                  <div>TAKE ACTION</div>
                </div>
                {generatedTests.map((test) => (
                  <TestCard
                    key={test.id}
                    id={test.id}
                    title={test.title}
                    type={test.isPaid ? 'PAID' : 'FREE'} // Lexia tests are free
                    locked={false}
                    isAttempted={test.isAttempted}
                    lastScore={test.lastScore}
                    obtainedMarks={test.obtainedMarks}
                    totalMarks={test.totalMarks}
                    onAction={(action) => handleTestAction(test, action)}
                    userType={session?.user?.role}
                    latestAttemptId={test.latestAttemptId}
                    apiPrefix="/api/lexia/tests"
                    testType="lexia" // Added this prop to distinguish Lexia tests
                  />
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
