'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Trophy, Medal, Award, GraduationCap, Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { calculateCLEResult, type CLEResult } from '@/lib/cle-scoring'

interface MockResult {
  id: string
  rank: number
  generalAverage: number
  status: 'PASS' | 'DEFERRED' | 'FAIL'
  submittedAt: string
  user: {
    name: string | null
    email: string
    school: string | null
  }
  exam: {
    title: string
  }
}

export default function MockBoardResultsPage() {
  const [results, setResults] = useState<MockResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState<MockResult | null>(null)
  const [cleResult, setCleResult] = useState<CLEResult | null>(null)

  useEffect(() => {
    fetchMockResults()
  }, [])

  const fetchMockResults = async () => {
    try {
      const response = await fetch('/api/admin/mock-results')
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error fetching mock results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const viewResult = (result: MockResult) => {
    setSelectedResult(result)
    
    // Only show CLE breakdown for criminologist exams
    if (result.exam.title.toLowerCase().includes('criminologist')) {
      let mockScores: Record<string, number>
      
      if (result.status === 'PASS') {
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 85,
          'Law Enforcement Administration': 78,
          'Criminalistics': 82,
          'Crime Detection and Investigation': 76,
          'Criminology': 80,
          'Correctional Administration': 79
        }
      } else if (result.status === 'DEFERRED') {
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 85,
          'Law Enforcement Administration': 45, // Below 50%
          'Criminalistics': 82,
          'Crime Detection and Investigation': 85,
          'Criminology': 85,
          'Correctional Administration': 90
        }
      } else { // FAIL
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 65,
          'Law Enforcement Administration': 42,
          'Criminalistics': 38,
          'Crime Detection and Investigation': 45,
          'Criminology': 55,
          'Correctional Administration': 48
        }
      }
      
      setCleResult(calculateCLEResult(mockScores, true))
    } else {
      setCleResult(null)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{rank}</div>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-green-100 text-green-800'
      case 'DEFERRED': return 'bg-yellow-100 text-yellow-800'
      case 'FAIL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredResults = results.filter(result =>
    result.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const passedResults = filteredResults.filter(r => r.status === 'PASS')
  const deferredResults = filteredResults.filter(r => r.status === 'DEFERRED')
  const failedResults = filteredResults.filter(r => r.status === 'FAIL')

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
                    <div className="h-4 bg-slate-200 rounded w-16 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-xl mb-6"></div>
        </div>
        <Card className="border-0 shadow-lg animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-48"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="h-6 bg-slate-200 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-24"></div>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Mock Board Exam Results</h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
              Criminologist Licensure Examination mock board results and rankings
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl flex-shrink-0">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Passed</p>
                <p className="text-3xl font-bold text-green-900">{passedResults.length}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-900">Deferred</p>
                <p className="text-3xl font-bold text-yellow-900">{deferredResults.length}</p>
              </div>
              <div className="p-3 bg-yellow-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Failed</p>
                <p className="text-3xl font-bold text-red-900">{failedResults.length}</p>
              </div>
              <div className="p-3 bg-red-600 rounded-xl">
                <Medal className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Pass Rate</p>
                <p className="text-3xl font-bold text-blue-900">
                  {results.length > 0 ? Math.round((passedResults.length / results.length) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 sm:pl-12 h-10 sm:h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl text-sm sm:text-base"
          />
        </div>
      </div>

      <Tabs defaultValue="rankings" className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-100 p-1 rounded-xl gap-1">
            <TabsTrigger value="rankings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Rankings</span>
              <span className="sm:hidden">Rank</span>
            </TabsTrigger>
            <TabsTrigger value="passed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Passed ({passedResults.length})</span>
              <span className="sm:hidden">Pass</span>
            </TabsTrigger>
            <TabsTrigger value="deferred" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Deferred ({deferredResults.length})</span>
              <span className="sm:hidden">Defer</span>
            </TabsTrigger>
            <TabsTrigger value="failed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Medal className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Failed ({failedResults.length})</span>
              <span className="sm:hidden">Fail</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rankings">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                Overall Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 sm:space-y-3">
                {filteredResults.slice(0, 20).map((result) => (
                  <div key={result.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 gap-3 sm:gap-0 ${
                    result.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-yellow-500' 
                      : 'bg-white hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {getRankIcon(result.rank)}
                        <span className="font-bold text-base sm:text-lg text-slate-900">#{result.rank}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{result.user.name || result.user.email}</p>
                        <p className="text-xs sm:text-sm text-slate-600 truncate">
                          🏫 {result.user.school || 'No School Listed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end sm:gap-4 gap-3">
                      <div className="text-center sm:text-right">
                        <p className="font-bold text-lg sm:text-xl lg:text-2xl text-slate-900">{result.generalAverage}%</p>
                        <Badge className={`${getStatusColor(result.status)} font-semibold text-xs sm:text-sm`}>
                          {result.status}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewResult(result)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-xs sm:text-sm px-2 sm:px-3"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passed">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                Passed Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {passedResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(result.rank)}
                        <span className="font-bold text-lg text-slate-900">#{result.rank}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{result.user.name || result.user.email}</p>
                        <p className="text-sm text-slate-600">
                          🏫 {result.user.school || 'No School Listed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-2xl text-green-800">{result.generalAverage}%</p>
                        <Badge className="bg-green-100 text-green-800 font-semibold">PASSED</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewResult(result)}
                        className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deferred">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
                Deferred Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deferredResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(result.rank)}
                        <span className="font-bold text-lg text-slate-900">#{result.rank}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{result.user.name || result.user.email}</p>
                        <p className="text-sm text-slate-600">
                          🏫 {result.user.school || 'No School Listed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-2xl text-yellow-800">{result.generalAverage}%</p>
                        <Badge className="bg-yellow-100 text-yellow-800 font-semibold">DEFERRED</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewResult(result)}
                        className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <Medal className="h-6 w-6 text-white" />
                </div>
                Failed Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {failedResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getRankIcon(result.rank)}
                        <span className="font-bold text-lg text-slate-900">#{result.rank}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{result.user.name || result.user.email}</p>
                        <p className="text-sm text-slate-600">
                          🏫 {result.user.school || 'No School Listed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-2xl text-red-800">{result.generalAverage}%</p>
                        <Badge className="bg-red-100 text-red-800 font-semibold">FAILED</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewResult(result)}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CLE Result Modal */}
      {selectedResult && cleResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-0 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">CLE Mock Board Exam Results</h2>
                <Button variant="outline" size="sm" onClick={() => setSelectedResult(null)}>
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedResult.user.name || selectedResult.user.email}</h3>
                  <p className="text-sm text-muted-foreground">Rank: #{selectedResult.rank}</p>
                  <p className="text-sm text-muted-foreground">General Average: {selectedResult.generalAverage}%</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Subject</th>
                        <th className="text-center py-2">Score</th>
                        <th className="text-center py-2">Weight</th>
                        <th className="text-center py-2">Weighted Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cleResult.subjects.map((subject, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{subject.name}</td>
                          <td className="text-center py-2">{subject.score}%</td>
                          <td className="text-center py-2">{subject.weight}%</td>
                          <td className="text-center py-2">{((subject.score * subject.weight) / 100).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">General Average:</span>
                      <span className="font-bold text-lg">{cleResult.generalAverage}%</span>
                    </div>
                    <div className={`p-3 rounded-lg font-medium ${
                      cleResult.status === 'PASS' ? 'bg-green-100 text-green-800' :
                      cleResult.status === 'DEFERRED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <div className="text-center mb-2">{cleResult.message}</div>
                      {cleResult.retakeSubjects && cleResult.retakeSubjects.length > 0 && (
                        <div className="text-sm mt-2">
                          <strong>Subjects to retake:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {cleResult.retakeSubjects.map((subject, index) => (
                              <li key={index}>{subject}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {cleResult.status === 'FAIL' && (
                        <div className="text-sm mt-2">
                          <strong>Failed subjects (below 50%):</strong>
                          <ul className="list-disc list-inside mt-1">
                            {cleResult.subjects
                              .filter(s => s.score < 50)
                              .map((subject, index) => (
                                <li key={index}>{subject.name} ({subject.score}%)</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}