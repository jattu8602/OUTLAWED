'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { List, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function TestSeriesClientPage() {
  const [testSeries, setTestSeries] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTestSeries()
  }, [])

  const fetchTestSeries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-series')
      if (response.ok) {
        const data = await response.json()
        const sortedData = data.sort((a, b) => {
          if (a.type === 'DAILY' && b.type !== 'DAILY') {
            return -1
          }
          if (a.type !== 'DAILY' && b.type === 'DAILY') {
            return 1
          }
          return 0
        })
        setTestSeries(sortedData)
      } else {
        toast.error('Failed to fetch test series.')
      }
    } catch (error) {
      toast.error('An error occurred while fetching test series.')
    } finally {
      setLoading(false)
    }
  }

  const handleSeriesClick = (seriesId) => {
    router.push(`/dashboard/test-series/${seriesId}`)
  }

  return (
    <div className="mt-8">
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="dark:bg-slate-800 dark:text-white">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
          {testSeries.map((series) => (
            <Card
              key={series.id}
              className="cursor-pointer hover:shadow-lg transition-shadow dark:bg-slate-800 dark:text-white"
              onClick={() => handleSeriesClick(series.id)}
            >
              <CardHeader>
                <CardTitle>{series.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {series.description}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    {series.type === 'DAILY' ? (
                      <Zap className="mr-1 h-3 w-3" />
                    ) : (
                      <List className="mr-1 h-3 w-3" />
                    )}
                    {series.type}
                  </Badge>
                  <p className="text-sm font-medium">
                    {series._count.tests} Tests
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
