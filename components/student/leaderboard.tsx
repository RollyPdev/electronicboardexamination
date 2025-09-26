'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Target,
  Star,
  Award
} from 'lucide-react'

interface RankingItem {
  rank: number
  userId: string
  userName: string
  userEmail: string
  score?: number
  maxScore?: number
  percentage?: number
  averageScore?: number
  totalScore?: number
  maxPossibleScore?: number
  averagePercentage?: number
  examsCompleted?: number
  submittedAt?: string
  examTitle?: string
  isCurrentUser: boolean
}

interface LeaderboardData {
  type: 'overall' | 'exam'
  examId?: string
  rankings: RankingItem[]
  currentUserRank: RankingItem | null
  totalParticipants: number
}

interface LeaderboardProps {
  examId?: string
  limit?: number
}

export function Leaderboard({ examId, limit = 20 }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewType, setViewType] = useState<'overall' | 'exam'>(examId ? 'exam' : 'overall')

  useEffect(() => {
    fetchRankings()
  }, [examId, viewType, limit])

  const fetchRankings = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        type: viewType,
      })
      
      if (examId && viewType === 'exam') {
        params.append('examId', examId)
      }

      const response = await fetch(`/api/student/rankings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setData(data)
      } else {
        setError('Failed to load rankings')
      }
    } catch (error) {
      setError('An error occurred while loading rankings')
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default' // Gold
      case 2:
        return 'secondary' // Silver
      case 3:
        return 'outline' // Bronze
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md animate-pulse">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leaderboard</h3>
        </div>
        <Alert>
          <AlertDescription>
            {error || 'No ranking data available'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            {data.type === 'exam' ? 'Exam Rankings' : 'Overall Leaderboard'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {data.type === 'exam' 
              ? `Rankings for this exam (${data.totalParticipants} participants)`
              : `Top performers across all exams (${data.totalParticipants} students)`
            }
          </p>
        </div>

        {!examId && (
          <div className="flex gap-2">
            <Button
              variant={viewType === 'overall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('overall')}
              className={`${viewType === 'overall' ? 'bg-blue-600 hover:bg-blue-700' : ''} text-xs sm:text-sm`}
            >
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Overall
            </Button>
          </div>
        )}
      </div>
        <div className="space-y-2 sm:space-y-3">
          {data.rankings.map((item, index) => (
            <div 
              key={item.userId}
              className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border transition-all ${
                item.isCurrentUser 
                  ? 'bg-blue-50 border-blue-200 shadow-sm' 
                  : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-center min-w-8 sm:min-w-12">
                {getRankIcon(item.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <p className="font-medium truncate text-sm sm:text-base">
                    {item.userName || 'Anonymous'}
                  </p>
                  <div className="flex gap-1">
                    {item.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                    {item.rank <= 3 && (
                      <Badge variant={getRankBadgeVariant(item.rank)} className="text-xs">
                        {item.rank === 1 ? 'Gold' : item.rank === 2 ? 'Silver' : 'Bronze'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  {data.type === 'exam' ? (
                    <>
                      <span>{item.score}/{item.maxScore} pts</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{item.percentage}%</span>
                    </>
                  ) : (
                    <>
                      <span>Avg: {item.averageScore} pts</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{item.averagePercentage}%</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{item.examsCompleted} exams</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-base sm:text-lg text-blue-600">
                  {data.type === 'exam' ? `${item.percentage}%` : `${item.averagePercentage}%`}
                </div>
                {data.type === 'overall' && (
                  <div className="text-xs text-gray-500">
                    {item.totalScore}/{item.maxPossibleScore}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Current user rank if not in top results */}
          {data.currentUserRank && !data.rankings.find(r => r.isCurrentUser) && (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-500 px-2">Your Rank</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center min-w-12">
                  <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">
                    #{data.currentUserRank.rank}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {data.currentUserRank.userName || 'You'}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {data.type === 'exam' ? (
                      <>
                        <span>{data.currentUserRank.score}/{data.currentUserRank.maxScore} points</span>
                        <span>•</span>
                        <span>{data.currentUserRank.percentage}%</span>
                      </>
                    ) : (
                      <>
                        <span>Avg: {data.currentUserRank.averageScore} pts</span>
                        <span>•</span>
                        <span>{data.currentUserRank.averagePercentage}%</span>
                        <span>•</span>
                        <span>{data.currentUserRank.examsCompleted} exams</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-blue-600">
                    {data.type === 'exam' 
                      ? `${data.currentUserRank.percentage}%` 
                      : `${data.currentUserRank.averagePercentage}%`
                    }
                  </div>
                  {data.type === 'overall' && (
                    <div className="text-xs text-gray-500">
                      {data.currentUserRank.totalScore}/{data.currentUserRank.maxPossibleScore}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {data.rankings.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full mb-4 w-fit mx-auto">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900">No rankings available yet</h3>
              <p className="text-gray-600">Complete some exams to see the leaderboard!</p>
            </div>
          )}
        </div>
    </div>
  )
}