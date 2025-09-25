'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingUp, Award, BookOpen, Calendar, BarChart3, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceSummary {
  totalExams: number
  averageScore: number
  averagePercentage: number
  bestScore: number
  worstScore: number
  totalScore: number
  totalMaxScore: number
}

interface RecentResult {
  id: string
  examTitle: string
  score: number
  maxScore: number
  percentage: number
  submittedAt: string
  durationMin: number
}

interface ChartData {
  month: string
  percentage: number
  examsCount: number
}

interface PerformanceData {
  summary: PerformanceSummary
  recentResults: RecentResult[]
  performanceChart: ChartData[]
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/student/performance')
      if (response.ok) {
        const performanceData = await response.json()
        setData(performanceData)
      }
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { variant: 'default' as const, label: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (percentage >= 60) return { variant: 'secondary' as const, label: 'Good', color: 'bg-amber-100 text-amber-800' }
    return { variant: 'outline' as const, label: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
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

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">No performance data</h3>
            <p className="text-gray-600">Complete some exams to see your performance analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Performance Analytics</h1>
        </div>
        <p className="text-gray-600">Track your exam performance and progress over time</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Exams</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-900">{data.summary.totalExams}</div>
            <p className="text-xs text-blue-600 mt-1">Completed exams</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-green-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Average Score</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-900">
              {data.summary.averagePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-green-600 mt-1">Overall performance</p>
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
              {data.summary.bestScore.toFixed(1)}%
            </div>
            <p className="text-xs text-amber-600 mt-1">Personal best</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Progress</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-purple-900">
              {data.summary.totalScore.toFixed(0)}/{data.summary.totalMaxScore.toFixed(0)}
            </div>
            <p className="text-xs text-purple-600 mt-1">Total points</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {data.performanceChart.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Monthly Performance</h2>
          </div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.performanceChart.map((item) => (
                  <div key={item.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(item.month + '-01').toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">{item.examsCount} exam{item.examsCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-lg font-semibold", getScoreColor(item.percentage))}>
                        {item.percentage.toFixed(1)}%
                      </div>
                      <Badge className={getScoreBadge(item.percentage).color}>
                        {getScoreBadge(item.percentage).label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Results */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">Recent Performance</h2>
        </div>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {data.recentResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-full mb-4 w-fit mx-auto">
                  <BookOpen className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">No recent results</h3>
                <p className="text-gray-600">Complete some exams to see your recent performance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{result.examTitle}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.durationMin} min
                        </span>
                        <span>•</span>
                        <span>{new Date(result.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("text-lg font-semibold", getScoreColor(result.percentage))}>
                        {result.score}/{result.maxScore}
                      </div>
                      <div className={cn("text-sm", getScoreColor(result.percentage))}>
                        {result.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}