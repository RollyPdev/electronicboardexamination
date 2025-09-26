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
    school: string | null
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
        return <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
      default:
        return <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{rank}</div>
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
    <div className="container-responsive space-responsive">
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="heading-responsive font-bold text-gray-900">Student Rankings</h1>
            <p className="text-responsive text-gray-600 mt-1">
              Track and analyze student performance rankings across all examinations
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-blue-100 rounded-lg flex-shrink-0">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid-responsive grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm bg-blue-50">
          <CardContent className="card-responsive">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">Total Students</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-blue-900">{rankings.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-600 rounded-lg flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-green-50">
          <CardContent className="card-responsive">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-green-900 truncate">Top Performer</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-900">
                  {rankings.length > 0 ? `${rankings[0]?.averageScore.toFixed(0)}%` : '0%'}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-600 rounded-lg flex-shrink-0">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-purple-50">
          <CardContent className="card-responsive">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-purple-900 truncate">Class Average</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-purple-900">
                  {rankings.length > 0 
                    ? `${(rankings.reduce((sum, r) => sum + r.averageScore, 0) / rankings.length).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-600 rounded-lg flex-shrink-0">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm bg-orange-50">
          <CardContent className="card-responsive">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-orange-900 truncate">Total Exams</p>
                <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-orange-900">
                  {rankings.reduce((sum, r) => sum + r.totalExams, 0)}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-orange-600 rounded-lg flex-shrink-0">
                <Medal className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="card-responsive pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
            <span className="truncate">Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-responsive pt-0">
          {rankings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No rankings available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600">Rank</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600">Student</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600">School</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600 text-center">Exams</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600 text-center">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.slice(0, 10).map((ranking) => (
                    <tr key={ranking.rank} className="border-b last:border-b-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(ranking.rank)}
                          <span className="font-bold text-sm sm:text-base">#{ranking.rank}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-sm sm:text-base text-gray-900 uppercase">
                          {ranking.student.name || 'No name'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs sm:text-sm text-gray-600 truncate uppercase">
                          {ranking.student.school || 'No school listed'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm sm:text-base font-medium">{ranking.totalExams}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${getScoreColor(ranking.averageScore)}`}>
                          {ranking.averageScore.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="card-responsive pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="truncate">Complete Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-responsive pt-0">
          {rankings.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full mb-4 w-fit mx-auto">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-2 text-gray-900">No rankings available</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Rankings will appear once students complete exams and scores are calculated.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600">Student</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600">School</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600 text-center">Exams</th>
                    <th className="pb-2 text-xs sm:text-sm font-medium text-gray-600 text-center">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.filter(ranking => ranking.averageScore >= 70).map((ranking) => (
                    <tr key={ranking.rank} className="border-b last:border-b-0">
                      <td className="py-3">
                        <span className="font-medium text-sm sm:text-base text-gray-900 uppercase">
                          {ranking.student.name || 'No name provided'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs sm:text-sm text-gray-600 truncate uppercase">
                          {ranking.student.school || 'No school listed'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm sm:text-base font-medium">{ranking.totalExams}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ${getScoreColor(ranking.averageScore)}`}>
                          {ranking.averageScore.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}