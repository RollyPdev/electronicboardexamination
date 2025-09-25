'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Play, 
  Eye, 
  BookOpen,
  Clock,
  Users
} from 'lucide-react'
import { formatDuration } from '@/lib/exam-utils'
import { cn } from '@/lib/utils'

interface Exam {
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
    startedAt: string
  } | null
  canTake: boolean
  createdAt: string
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'in-progress'>('all')

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/student/exams')
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    switch (filter) {
      case 'available':
        return !exam.result
      case 'completed':
        return exam.result?.status === 'GRADED'
      case 'in-progress':
        return exam.result?.status === 'IN_PROGRESS'
      default:
        return true
    }
  })

  const getStatusBadge = (exam: Exam) => {
    if (!exam.result) {
      return <Badge variant="outline">Available</Badge>
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

  const getActionButton = (exam: Exam) => {
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Available Exams</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Available Exams</h1>
          <p className="text-gray-600">Take exams and track your progress</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}
          >
            All
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            onClick={() => setFilter('available')}
            size="sm"
            className={filter === 'available' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}
          >
            Available
          </Button>
          <Button
            variant={filter === 'in-progress' ? 'default' : 'outline'}
            onClick={() => setFilter('in-progress')}
            size="sm"
            className={filter === 'in-progress' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}
          >
            In Progress
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
            className={filter === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">No exams found</h3>
            <p className="text-gray-600 text-center">
              {searchTerm 
                ? 'No exams match your search criteria.' 
                : filter === 'available'
                ? 'No new exams available to take.'
                : filter === 'completed'
                ? 'You haven\'t completed any exams yet.'
                : filter === 'in-progress'
                ? 'No exams currently in progress.'
                : 'No exams are currently published.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="bg-white border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all shadow-sm">
              <CardHeader className="pb-3 bg-gray-50/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-gray-900 line-clamp-2">{exam.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {exam.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="ml-3">
                    {getStatusBadge(exam)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="h-3 w-3" />
                      {formatDuration(exam.durationMin)}
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <BookOpen className="h-3 w-3" />
                      {exam.questionCount} questions
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Max Score: <span className="font-medium text-gray-900">{exam.maxScore}</span> points
                    </div>
                    <span className="text-xs">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {exam.result && exam.result.score !== null && exam.result.maxScore && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-sm text-blue-700 mb-1">Your Score</div>
                      <div className={cn(
                        "text-base font-medium",
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
  )
}