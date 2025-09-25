'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Award,
  Calendar,
  BarChart3
} from 'lucide-react'

interface StudentStats {
  totalExams: number
  completedExams: number
  averageScore: number
  totalScore: number
  maxPossibleScore: number
  averagePercentage: number
  bestScore: number
  bestPercentage: number
  rank: number | null
  totalStudents: number
  recentExams: Array<{
    id: string
    title: string
    score: number
    maxScore: number
    percentage: number
    submittedAt: string
    rank?: number
  }>
  streaks: {
    current: number
    longest: number
  }
  gradeDistribution: {
    A: number // 90-100%
    B: number // 80-89%
    C: number // 70-79%
    D: number // 60-69%
    F: number // <60%
  }
}

interface StudentStatsProps {
  className?: string
}

export function StudentStats({ className }: StudentStatsProps) {
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/student/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load statistics')
      }
    } catch (error) {
      setError('An error occurred while loading statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const getGradeFromPercentage = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              {error || 'No statistics available'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionRate = stats.totalExams > 0 ? (stats.completedExams / stats.totalExams) * 100 : 0

  return (
    <div className={className}>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averagePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageScore.toFixed(1)} points average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedExams}</div>
            <div className="flex items-center gap-2">
              <Progress value={completionRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {completionRate.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.bestScore} points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.rank ? `#${stats.rank}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              out of {stats.totalStudents} students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Exams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Exams
            </CardTitle>
            <CardDescription>
              Your latest exam performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentExams.length > 0 ? (
                stats.recentExams.map((exam) => {
                  const gradeInfo = getGradeFromPercentage(exam.percentage)
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{exam.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{exam.score}/{exam.maxScore} pts</span>
                          <span>•</span>
                          <span>{formatDate(exam.submittedAt)}</span>
                          {exam.rank && (
                            <>
                              <span>•</span>
                              <span>Rank #{exam.rank}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${gradeInfo.color} ${gradeInfo.bgColor} border-current`}
                      >
                        {gradeInfo.grade} ({exam.percentage}%)
                      </Badge>
                    </div>
                  )
                })
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No exams completed yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
            <CardDescription>
              Grade distribution and streaks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grade Distribution */}
            <div>
              <h4 className="font-medium mb-3">Grade Distribution</h4>
              <div className="space-y-2">
                {stats.gradeDistribution ? Object.entries(stats.gradeDistribution).map(([grade, count]) => {
                  const percentage = stats.completedExams > 0 ? (count / stats.completedExams) * 100 : 0
                  const gradeInfo = getGradeFromPercentage(
                    grade === 'A' ? 95 : grade === 'B' ? 85 : grade === 'C' ? 75 : grade === 'D' ? 65 : 50
                  )
                  
                  return (
                    <div key={grade} className="flex items-center gap-3">
                      <div className={`w-8 h-6 rounded text-xs font-bold flex items-center justify-center ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                        {grade}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{count} exams</span>
                          <span>{percentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-muted-foreground text-center py-4">
                    No grade data available
                  </p>
                )}
              </div>
            </div>

            {/* Streaks */}
            <div>
              <h4 className="font-medium mb-3">Performance Streaks</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">{stats.streaks?.current || 0}</div>
                  <div className="text-xs text-blue-600">Current Streak</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">{stats.streaks?.longest || 0}</div>
                  <div className="text-xs text-green-600">Best Streak</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Streak = consecutive exams with 80%+ score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}