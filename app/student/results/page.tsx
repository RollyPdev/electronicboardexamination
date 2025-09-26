'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Clock, BookOpen, TrendingUp, Calendar, Eye } from 'lucide-react'
import { formatDuration } from '@/lib/exam-utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ExamResult {
  id: string
  examId: string
  examTitle: string
  examDescription: string | null
  durationMin: number
  questionCount: number
  maxScore: number
  score: number | null
  percentage: number | null
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'FLAGGED'
  startedAt: string
  submittedAt: string | null
  gradedAt: string | null
}

export default function StudentResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/student/results')
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'SUBMITTED':
        return <Badge variant="default">Under Review</Badge>
      case 'GRADED':
        return <Badge variant="default">Completed</Badge>
      case 'FLAGGED':
        return <Badge variant="destructive">Flagged</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getScoreColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-500'
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Results</h1>
          <p className="text-gray-600 mt-1">Loading your exam results...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
    <div className="container-responsive space-responsive">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </div>
          <h1 className="heading-responsive font-semibold text-gray-900">My Results</h1>
        </div>
        <p className="text-responsive text-gray-600">View your exam performance and detailed results</p>
      </div>

      {results.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">No results yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Take some exams to see your results here.
            </p>
            <Link href="/student/exams">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Exams
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {results.map((result) => (
            <Card key={result.id} className="bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all">
              <CardHeader className="pb-2 sm:pb-3 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-medium text-gray-900">{result.examTitle}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {result.examDescription || 'No description provided'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{formatDuration(result.durationMin)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <BookOpen className="h-3 w-3" />
                    <span>{result.questionCount} questions</span>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{new Date(result.startedAt).toLocaleDateString()}</span>
                  </div>
                  {result.submittedAt && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Submitted</span>
                    </div>
                  )}
                </div>

                {result.score !== null && result.percentage !== null && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-700 mb-1">Your Score</div>
                        <div className={cn("text-lg font-semibold", getScoreColor(result.percentage))}>
                          {result.score}/{result.maxScore} ({result.percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-blue-600 mb-1">Performance</div>
                        <div className={cn("text-sm font-medium", getScoreColor(result.percentage))}>
                          {result.percentage >= 80 ? 'Excellent' : 
                           result.percentage >= 60 ? 'Good' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.status === 'GRADED' && (
                  <Link href={`/student/results/${result.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Detailed Results
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}