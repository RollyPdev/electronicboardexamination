'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Trophy, Medal, Award } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Ranking {
  rank: number
  student: {
    name: string | null
    email: string
  }
  averageScore: number
  totalExams: number
  bestScore: number
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/admin/rankings')
      if (response.ok) {
        const data = await response.json()
        setRankings(data.rankings)
      }
    } catch (error) {
      console.error('Error fetching rankings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">{rank}</div>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-96"></div>
            </div>
            <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-5 bg-slate-200 rounded w-32"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-6"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card className="border-0 shadow-lg animate-pulse">
          <CardHeader>
            <div className="h-6 bg-slate-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="h-6 bg-slate-200 rounded-full w-6"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-32"></div>
                      <div className="h-4 bg-slate-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-12"></div>
                      <div className="h-6 bg-slate-200 rounded w-8"></div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                      <div className="h-6 bg-slate-200 rounded w-12"></div>
                    </div>
                    <div className="text-center space-y-1">
                      <div className="h-3 bg-slate-200 rounded w-12"></div>
                      <div className="h-6 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Student Rankings</h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
              Track and analyze student performance rankings across all examinations
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl flex-shrink-0">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">Total Students</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-900">{rankings.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-600 rounded-xl flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Top Performer</p>
                <p className="text-3xl font-bold text-green-900">
                  {rankings.length > 0 ? `${rankings[0]?.averageScore.toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Class Average</p>
                <p className="text-3xl font-bold text-purple-900">
                  {rankings.length > 0 
                    ? `${(rankings.reduce((sum, r) => sum + r.averageScore, 0) / rankings.length).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Total Exams</p>
                <p className="text-3xl font-bold text-orange-900">
                  {rankings.reduce((sum, r) => sum + r.totalExams, 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-xl">
                <Medal className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center">🏆 Top Performers</h2>
        <div className="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rankings.slice(0, 3).map((ranking) => (
            <Card key={ranking.rank} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              ranking.rank === 1 
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-l-yellow-500 lg:transform lg:scale-105' 
                : ranking.rank === 2
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-l-gray-400'
                : 'bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-l-amber-600'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 truncate pr-2">
                  {ranking.student.name || ranking.student.email}
                </CardTitle>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {getRankIcon(ranking.rank)}
                  <span className="font-bold text-lg sm:text-xl lg:text-2xl text-slate-900">#{ranking.rank}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-slate-900">{ranking.averageScore.toFixed(1)}%</div>
                <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                  <span>{ranking.totalExams} exams</span>
                  <span>Best: {ranking.bestScore}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Complete Rankings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Complete Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No rankings available</h3>
              <p className="text-slate-600 text-center max-w-md">
                Rankings will appear once students complete exams and scores are calculated.
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {rankings.map((ranking) => (
                <div key={ranking.rank} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 gap-3 sm:gap-0 ${
                  ranking.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-yellow-500' 
                    : 'bg-white hover:bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {getRankIcon(ranking.rank)}
                      <span className="font-bold text-base sm:text-lg text-slate-900">#{ranking.rank}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{ranking.student.name || 'No name provided'}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 truncate">{ranking.student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4 lg:space-x-6 gap-3">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium text-slate-900">Exams</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{ranking.totalExams}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium text-slate-900">Best Score</div>
                      <Badge className={`${getScoreColor(ranking.bestScore)} font-bold text-sm sm:text-base lg:text-lg px-2 sm:px-3 py-1`}>
                        {ranking.bestScore}%
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm font-medium text-slate-900">Average</div>
                      <Badge className={`${getScoreColor(ranking.averageScore)} font-bold text-sm sm:text-base lg:text-lg px-2 sm:px-3 py-1`}>
                        {ranking.averageScore.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}