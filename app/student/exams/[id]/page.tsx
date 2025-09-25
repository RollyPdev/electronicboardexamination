'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  FileText, 
  Users, 
  Trophy,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface ExamData {
  id: string
  title: string
  description: string
  durationMin: number
  questionCount: number
  maxScore: number
  result: {
    id: string
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED'
    startedAt: string
    submittedAt?: string
    score?: number
  } | null
  canTake: boolean
}

export default function ExamDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string
  
  const [exam, setExam] = useState<ExamData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (examId) {
      fetchExamDetails()
    }
  }, [examId])

  const fetchExamDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/student/exams/${examId}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
      } else {
        setError('Failed to load exam details')
      }
    } catch (error) {
      setError('An error occurred while loading exam details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartExam = async () => {
    try {
      setIsStarting(true)
      const response = await fetch(`/api/student/exams/${examId}/start`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/student/exams/${examId}/take?token=${data.token}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start exam')
      }
    } catch (error) {
      setError('An error occurred while starting the exam')
    } finally {
      setIsStarting(false)
    }
  }

  const handleContinueExam = async () => {
    await handleStartExam() // Same logic as start - will resume existing exam
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading exam details...</p>
        </div>
      </div>
    )
  }

  if (!exam || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Exam not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (!exam.result) return null
    
    switch (exam.result.status) {
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'SUBMITTED':
        return <Badge variant="outline">Submitted</Badge>
      case 'GRADED':
        return <Badge variant="default">Graded</Badge>
      default:
        return null
    }
  }

  const canStart = !exam.result
  const canContinue = exam.result?.status === 'IN_PROGRESS'
  const isCompleted = exam.result?.status === 'SUBMITTED' || exam.result?.status === 'GRADED'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{exam.title}</h1>
            <p className="text-muted-foreground mt-1">Exam Details</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  About This Exam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {exam.description || 'No description available for this exam.'}
                </p>
              </CardContent>
            </Card>

            {/* Results Card (if completed) */}
            {isCompleted && exam.result && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="text-2xl font-bold">
                        {exam.result.score || 0} / {exam.maxScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Percentage</p>
                      <p className="text-2xl font-bold">
                        {Math.round(((exam.result.score || 0) / exam.maxScore) * 100)}%
                      </p>
                    </div>
                  </div>
                  {exam.result.submittedAt && (
                    <p className="text-sm text-muted-foreground mt-4">
                      Submitted on {new Date(exam.result.submittedAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exam Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-medium">{exam.durationMin} minutes</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Questions</span>
                  </div>
                  <span className="font-medium">{exam.questionCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Max Score</span>
                  </div>
                  <span className="font-medium">{exam.maxScore} points</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {canStart && (
                  <Button 
                    onClick={handleStartExam}
                    disabled={isStarting}
                    className="w-full"
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Exam
                      </>
                    )}
                  </Button>
                )}

                {canContinue && (
                  <Button 
                    onClick={handleContinueExam}
                    disabled={isStarting}
                    className="w-full"
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Resuming...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Continue Exam
                      </>
                    )}
                  </Button>
                )}

                {isCompleted && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800 font-medium">
                      Exam Completed
                    </p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/student')}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}