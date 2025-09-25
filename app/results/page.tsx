'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, GraduationCap } from 'lucide-react'

interface PublicResult {
  id: string
  rank: number
  studentName: string
  school: string
  generalAverage: number
  status: 'PASS' | 'DEFERRED' | 'FAIL'
}

export default function PublicResultsPage() {
  const [topResults, setTopResults] = useState<PublicResult[]>([])
  const [passedResults, setPassedResults] = useState<PublicResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    fetchPublicResults()
  }, [])

  const fetchPublicResults = async () => {
    try {
      const response = await fetch('/api/public/results')
      if (response.ok) {
        const data = await response.json()
        setCompletionPercentage(data.completionPercentage)
        setIsComplete(data.isComplete)
        
        if (data.isComplete) {
          setTopResults(data.topResults)
          setPassedResults(data.passedResults)
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error)
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
        return <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{rank}</div>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">CLE Mock Board Exam Results</h1>
          <p className="text-muted-foreground mt-2">Criminologist Licensure Examination</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <GraduationCap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">CLE Mock Board Exam Results</h1>
        </div>
        <p className="text-muted-foreground text-lg">Criminologist Licensure Examination</p>
        <p className="text-sm text-muted-foreground mt-2">
          Results are ranked by General Average. Passing grade: 75% with no subject below 50%
        </p>
      </div>

      {/* Completion Progress */}
      {!isComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Exam in Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Students are currently taking all 6 subject areas. Results will be available once all examinations are completed.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${completionPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
              <p className="text-lg font-semibold">{completionPercentage}% Complete</p>
              <p className="text-sm text-muted-foreground mt-2">
                All students must complete all 6 CLE subject areas before results are published.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isComplete && (
        <>
        {/* Top 10 Results */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Top 10 Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">School</th>
                    <th className="text-center py-3 px-2">General Average</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topResults.map((result) => (
                    <tr key={result.id} className={`border-b hover:bg-gray-50 ${result.rank <= 3 ? 'bg-yellow-50' : ''}`}>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          {getRankIcon(result.rank)}
                          <span className="font-semibold">#{result.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 font-medium">{result.studentName}</td>
                      <td className="py-4 px-2 text-muted-foreground">{result.school}</td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-bold text-lg">{result.generalAverage}%</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className="bg-green-100 text-green-800">
                          ✅ PASSED
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Passed Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-green-600" />
            Other Passed Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          {passedResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No other passed students.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Rank</th>
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">School</th>
                    <th className="text-center py-3 px-2">General Average</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passedResults.map((result) => (
                    <tr key={result.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">
                            {result.rank}
                          </div>
                          <span className="font-semibold">#{result.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 font-medium">{result.studentName}</td>
                      <td className="py-4 px-2 text-muted-foreground">{result.school}</td>
                      <td className="py-4 px-2 text-center">
                        <span className="font-bold text-lg">{result.generalAverage}%</span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Badge className="bg-green-100 text-green-800">
                          ✅ PASSED
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>* Results are based on mock board examinations and are for practice purposes only.</p>
          <p>* Official results will be released by the Professional Regulation Commission (PRC).</p>
        </div>
        </>
      )}
    </div>
  )
}