'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  RotateCcw,
  Lock,
  Crown,
  BookOpen,
  Scale,
  Brain,
  Calculator,
  Globe,
  Clock,
} from 'lucide-react'

const subjectIcons = {
  ENGLISH: <BookOpen className="h-4 w-4" />,
  GK_CA: <Globe className="h-4 w-4" />,
  LEGAL_REASONING: <Scale className="h-4 w-4" />,
  LOGICAL_REASONING: <Brain className="h-4 w-4" />,
  QUANTITATIVE_TECHNIQUES: <Calculator className="h-4 w-4" />,
}

const mockTestData = [
  {
    id: '1',
    title: 'CLAT Mock Test - 01',
    subjects: [
      { name: 'English', questions: 28, icon: subjectIcons.ENGLISH },
      { name: 'GK & CA', questions: 35, icon: subjectIcons.GK_CA },
      {
        name: 'Legal Reasoning',
        questions: 35,
        icon: subjectIcons.LEGAL_REASONING,
      },
      {
        name: 'Logical Reasoning',
        questions: 28,
        icon: subjectIcons.LOGICAL_REASONING,
      },
      {
        name: 'Quantitative Techniques',
        questions: 14,
        icon: subjectIcons.QUANTITATIVE_TECHNIQUES,
      },
    ],
    totalQuestions: 140,
    totalTime: 120,
    status: 'completed',
    score: 85,
    isPaid: false,
  },
  {
    id: '2',
    title: 'CLAT Mock Test - 02',
    subjects: [
      { name: 'English', questions: 28, icon: subjectIcons.ENGLISH },
      { name: 'GK & CA', questions: 35, icon: subjectIcons.GK_CA },
      {
        name: 'Legal Reasoning',
        questions: 35,
        icon: subjectIcons.LEGAL_REASONING,
      },
      {
        name: 'Logical Reasoning',
        questions: 28,
        icon: subjectIcons.LOGICAL_REASONING,
      },
      {
        name: 'Quantitative Techniques',
        questions: 14,
        icon: subjectIcons.QUANTITATIVE_TECHNIQUES,
      },
    ],
    totalQuestions: 140,
    totalTime: 120,
    status: 'in-progress',
    score: 42,
    isPaid: false,
  },
  {
    id: '3',
    title: 'CLAT Premium Test - 01',
    subjects: [
      { name: 'English', questions: 30, icon: subjectIcons.ENGLISH },
      { name: 'GK & CA', questions: 40, icon: subjectIcons.GK_CA },
      {
        name: 'Legal Reasoning',
        questions: 40,
        icon: subjectIcons.LEGAL_REASONING,
      },
      {
        name: 'Logical Reasoning',
        questions: 30,
        icon: subjectIcons.LOGICAL_REASONING,
      },
      {
        name: 'Quantitative Techniques',
        questions: 20,
        icon: subjectIcons.QUANTITATIVE_TECHNIQUES,
      },
    ],
    totalQuestions: 160,
    totalTime: 150,
    status: 'not-attempted',
    isPaid: true,
  },
  {
    id: '4',
    title: 'CLAT Sectional Test - Legal',
    subjects: [
      {
        name: 'Legal Reasoning',
        questions: 50,
        icon: subjectIcons.LEGAL_REASONING,
      },
    ],
    totalQuestions: 50,
    totalTime: 45,
    status: 'completed',
    score: 92,
    isPaid: false,
  },
  {
    id: '5',
    title: 'CLAT Premium Test - 02',
    subjects: [
      { name: 'English', questions: 30, icon: subjectIcons.ENGLISH },
      { name: 'GK & CA', questions: 40, icon: subjectIcons.GK_CA },
      {
        name: 'Legal Reasoning',
        questions: 40,
        icon: subjectIcons.LEGAL_REASONING,
      },
      {
        name: 'Logical Reasoning',
        questions: 30,
        icon: subjectIcons.LOGICAL_REASONING,
      },
      {
        name: 'Quantitative Techniques',
        questions: 20,
        icon: subjectIcons.QUANTITATIVE_TECHNIQUES,
      },
    ],
    totalQuestions: 160,
    totalTime: 150,
    status: 'not-attempted',
    isPaid: true,
  },
]

const mockUser = {
  isPro: false, // Set to true to test pro user experience
}

export function TestDashboard() {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            Completed
          </Badge>
        )
      case 'in-progress':
        return (
          <Badge variant="outline" className="border-accent text-accent">
            In Progress
          </Badge>
        )
      case 'not-attempted':
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground text-muted-foreground"
          >
            Not Attempted
          </Badge>
        )
    }
  }

  const getScoreDisplay = (test) => {
    if (test.status === 'not-attempted') {
      return <span className="text-muted-foreground">--/100</span>
    }

    if (test.status === 'in-progress') {
      return (
        <div className="flex items-center gap-2">
          <Progress value={test.score} className="w-16 h-2" />
          <span className="text-sm font-medium">{test.score}%</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <div
          className={`text-lg font-bold ${
            test.score >= 80
              ? 'text-primary'
              : test.score >= 60
              ? 'text-accent'
              : 'text-muted-foreground'
          }`}
        >
          {test.score}/100
        </div>
      </div>
    )
  }

  const getActionButtons = (test) => {
    const isLocked = test.isPaid && !mockUser.isPro

    if (isLocked) {
      return (
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="outline"
            disabled
            className="text-muted-foreground bg-transparent"
          >
            <Crown className="h-4 w-4 mr-2" />
            Pro Only
          </Button>
        </div>
      )
    }

    if (test.status === 'not-attempted') {
      return (
        <Button className="bg-primary hover:bg-primary/90">Start Test</Button>
      )
    }

    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analysis
        </Button>
        <Button variant="outline" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Re-attempt
        </Button>
      </div>
    )
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">
            Test Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress across all subjects
          </p>
        </div>
        {!mockUser.isPro && (
          <Button className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6">
        {mockTestData.map((test) => (
          <Card
            key={test.id}
            className={`transition-all hover:shadow-md ${
              test.isPaid && !mockUser.isPro ? 'opacity-75' : ''
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <CardTitle className="text-lg sm:text-xl">
                      {test.title}
                    </CardTitle>
                    {test.isPaid && (
                      <Badge
                        variant="outline"
                        className="border-accent text-accent w-fit"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {test.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md"
                      >
                        {subject.icon}
                        <span className="hidden sm:inline">{subject.name}</span>
                        <span className="sm:hidden">
                          {subject.name.split(' ')[0]}
                        </span>
                        <span className="font-medium">
                          ({subject.questions})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-start sm:justify-end">
                  {getStatusBadge(test.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-start lg:items-center">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Total Questions
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">
                    {test.totalQuestions}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Duration
                  </p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-lg sm:text-xl font-bold">
                      {formatTime(test.totalTime)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Score
                  </p>
                  {getScoreDisplay(test)}
                </div>

                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm sm:text-base font-medium capitalize">
                    {test.status.replace('-', ' ')}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex justify-start lg:justify-end">
                  {getActionButtons(test)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
