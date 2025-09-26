'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TestCard from '@/components/test-card'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { fetchInitialFreeTests, fetchMoreTests } from '@/lib/actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Gift } from 'lucide-react'
import { getCachedData, setCachedData } from '@/lib/utils/cache'

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

export default function FreeTestClientPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tests, setTests] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [activeSubject, setActiveSubject] = useState('ALL')
  const [page, setPage] = useState(2)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)

  const loaderRef = useRef(null)
  const isLoadingRef = useRef(false)
  const userType = session?.user?.role || 'FREE'

  const subjects = [
    { key: 'ALL', label: 'ALL' },
    { key: 'ENGLISH', label: 'ENGLISH' },
    { key: 'GK_CA', label: 'GK' },
    { key: 'LEGAL_REASONING', label: 'LEGAL' },
    { key: 'LOGICAL_REASONING', label: 'LOGICAL' },
    { key: 'QUANTITATIVE_TECHNIQUES', label: 'MATHS' },
  ]

  useEffect(() => {
    const loadInitialData = async () => {
      const cachedData = getCachedData('free_tests_data')
      if (cachedData) {
        setTests(cachedData.tests)
        setHasMore(cachedData.hasMore)
        setIsInitialLoading(false)
      } else {
        setIsInitialLoading(true)
      }

      const { tests, hasMore } = await fetchInitialFreeTests()
      setTests(tests)
      setHasMore(hasMore)
      setCachedData('free_tests_data', { tests, hasMore })
      setIsInitialLoading(false)
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (activeSubject === 'ALL') {
      setFilteredTests(tests)
    } else {
      const filtered = tests.filter(
        (test) =>
          test.questions &&
          test.questions.some((q) => q.section === activeSubject)
      )
      setFilteredTests(filtered)
    }
  }, [activeSubject, tests])

  const loadMoreTests = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoadingMore(true)

    try {
      const newTests = await fetchMoreTests(page, 'free')

      if (newTests.length > 0) {
        setTests((prev) => {
          // Filter out any tests that are already in the list to prevent duplicates
          const existingIds = new Set(prev.map((test) => test.id))
          const uniqueNewTests = newTests.filter(
            (test) => !existingIds.has(test.id)
          )
          return [...prev, ...uniqueNewTests]
        })
        setPage((prev) => prev + 1)
      } else {
        setHasMore(false)
        setHasReachedEnd(true)
      }
    } catch (error) {
      console.error('Error loading more tests:', error)
      setHasMore(false)
      setHasReachedEnd(true)
    } finally {
      setIsLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [page, isLoadingMore, hasMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          hasMore &&
          !isLoadingRef.current
        ) {
          loadMoreTests()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current)
      }
    }
  }, [isLoadingMore, hasMore, loadMoreTests])

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'reattempt' || action === 'attempt') {
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'evaluate') {
      if (test.testAttemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${test.testAttemptId}`
        )
      } else {
        toast.error('Test attempt ID not found. Please try again.')
      }
    } else if (action === 'evaluateSpecific') {
      const attemptId = specificAttempt?.id || specificAttempt?._id
      if (attemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${attemptId}`
        )
      } else {
        toast.error('Attempt ID not found. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full
            bg-gradient-to-br from-green-500 to-emerald-600 flex items-center
            justify-center flex-shrink-0"
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-lg sm:text-xl lg:text-3xl font-bold
              tracking-tight text-slate-900 dark:text-white"
              >
                Free Practice Tests 🎁
              </h1>
              <p
                className="text-xs sm:text-sm lg:text-lg text-slate-600
              dark:text-slate-300 mt-1"
              >
                Access to high-quality practice tests at no cost
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => setActiveSubject(subject.key)}
              className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeSubject === subject.key
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                  : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {subject.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div>SCORE</div>
            <div>TAKE ACTION</div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {isInitialLoading ? (
              <>
                <TestCardSkeleton />
                <TestCardSkeleton />
                <TestCardSkeleton />
                <TestCardSkeleton />
              </>
            ) : filteredTests.length === 0 && !isLoadingMore ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No free tests available for the selected subject.
              </div>
            ) : (
              filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  userType={userType}
                  onAction={(action, specificAttempt) =>
                    handleTestAction(test, action, specificAttempt)
                  }
                />
              ))
            )}
            {isLoadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!isLoadingMore && hasMore && !hasReachedEnd && (
              <div ref={loaderRef} className="h-1 w-full" />
            )}
            {hasReachedEnd && filteredTests.length > 0 && (
              <div className="flex justify-center py-8">
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  ✨ You've reached the end of the list
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
