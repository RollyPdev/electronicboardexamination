'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Leaderboard } from '@/components/student/leaderboard'
import { StudentStats } from '@/components/student/student-stats'
import { ActivationModal } from '@/components/student/activation-modal'
import { BookOpen, Clock, Trophy, TrendingUp, Play, Eye, GraduationCap, Target, Award, Calendar } from 'lucide-react'
import { formatDuration } from '@/lib/exam-utils'
import { cn } from '@/lib/utils'

interface ExamSummary {
  id: string
  title: string
  description: string | null
  durationMin: number
  questionCount: number
  maxScore: number
  result: {
    id: string
    status: string
    score: number | null
    maxScore: number | null
    submittedAt: string | null
  } | null
  canTake: boolean
}

interface DashboardStats {
  totalExams: number
  completedExams: number
  averageScore: number
  bestScore: number
}

export default function StudentDashboard() {
  const searchParams = useSearchParams()
  const needsActivation = searchParams.get('needsActivation') === 'true'
  const [showActivationModal, setShowActivationModal] = useState(needsActivation)
  const [recentExams, setRecentExams] = useState<ExamSummary[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/student/exams?limit=5')
      if (response.ok) {
        const data = await response.json()
        setRecentExams(data.exams)
        
        // Calculate stats
        const completed = data.exams.filter((exam: ExamSummary) => exam.result?.status === 'GRADED')
        const scores = completed.map((exam: ExamSummary) => 
          exam.result?.score && exam.result?.maxScore 
            ? (exam.result.score / exam.result.maxScore) * 100 
            : 0
        )
        
        setStats({
          totalExams: data.exams.length,
          completedExams: completed.length,
          averageScore: scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (exam: ExamSummary) => {
    if (!exam.result) {
      return <Badge variant="outline">Not Started</Badge>
    }
    
    switch (exam.result.status) {
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'SUBMITTED':
        return <Badge variant="default">Under Review</Badge>
      case 'GRADED':
        return <Badge variant="default">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getActionButton = (exam: ExamSummary) => {
    if (!exam.result) {
      return (
        <Link href={`/student/exams/${exam.id}/start`}>
          <Button size="sm" className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Start Exam
          </Button>
        </Link>
      )
    }
    
    if (exam.result.status === 'IN_PROGRESS') {
      return (
        <Link href={`/student/exams/${exam.id}/take`}>
          <Button size="sm" className="w-full">
            <Play className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </Link>
      )
    }
    
    return (
      <Link href={`/student/results/${exam.result.id}`}>
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="mr-2 h-4 w-4" />
          View Result
        </Button>
      </Link>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading your exam overview...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <ActivationModal isOpen={showActivationModal} />
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Track your academic progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-700">Available Exams</CardTitle>
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-semibold text-blue-900">{stats.totalExams}</div>
            <p className="text-xs text-blue-600 mt-1">Ready to take</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-900">{stats.completedExams}</div>
            <p className="text-xs text-green-600 mt-1">Exams finished</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Average Score</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-900">
              {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-purple-600 mt-1">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Best Score</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-amber-900">
              {stats.bestScore > 0 ? `${stats.bestScore.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-amber-600 mt-1">Personal record</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </div>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Performance Analytics</h2>
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <StudentStats />
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
          </div>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Leaderboard</h2>
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-6">
            <Leaderboard limit={10} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Exams */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg flex-shrink-0">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900 truncate">Recent Exams</h2>
          </div>
          <Link href="/student/exams">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0">View All</Button>
          </Link>
        </div>

        {recentExams.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900">No exams available</h3>
              <p className="text-gray-600 text-center">
                Check back later for new exams to take.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentExams.map((exam) => (
              <Card key={exam.id} className="bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
                <CardHeader className="pb-2 sm:pb-3 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base font-medium text-gray-900 truncate">{exam.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                        {exam.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(exam)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">{formatDuration(exam.durationMin)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <BookOpen className="h-3 w-3" />
                        <span>{exam.questionCount} questions</span>
                      </div>
                    </div>
                    
                    {exam.result?.score !== null && exam.result?.maxScore && (
                      <div className="p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs sm:text-sm text-blue-700 mb-1">Your Score</div>
                        <div className={cn(
                          "text-sm sm:text-base font-medium",
                          (exam.result.score / exam.result.maxScore) >= 0.8 ? "text-green-600" :
                          (exam.result.score / exam.result.maxScore) >= 0.6 ? "text-amber-600" : "text-red-600"
                        )}>
                          {exam.result.score}/{exam.result.maxScore} ({((exam.result.score / exam.result.maxScore) * 100).toFixed(1)}%)
                        </div>
                      </div>
                    )}

                    {getActionButton(exam)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}