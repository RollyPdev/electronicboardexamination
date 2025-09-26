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
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmitExam = async () => {
    if (!confirm('Are you sure you want to submit this exam? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/student/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'direct-submit' }), // Special token for direct submission
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh exam details to show updated status
        await fetchExamDetails()
        alert(`Exam submitted successfully! Score: ${data.score}/${data.maxScore} (${data.percentage}%)`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit exam')
      }
    } catch (error) {
      setError('An error occurred while submitting the exam')
    } finally {
      setIsSubmitting(false)
    }
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
  const canSubmit = exam.result?.status === 'IN_PROGRESS'
  const isCompleted = exam.result?.status === 'SUBMITTED' || exam.result?.status === 'GRADED'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-responsive space-responsive">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="heading-responsive font-bold truncate">{exam.title}</h1>
            <p className="text-responsive text-muted-foreground mt-1">Exam Details</p>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid-responsive grid-cols-1 lg:grid-cols-3">
          {/* Exam Info */}
          <div className="lg:col-span-2 space-responsive">
            <Card className="shadow-sm">
              <CardHeader className="card-responsive pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                  <span className="truncate">About This Exam</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="card-responsive pt-0">
                <p className="text-responsive text-muted-foreground leading-relaxed">
                  {exam.description || 'No description available for this exam.'}
                </p>
              </CardContent>
            </Card>

            {/* Results Card (if completed) */}
            {isCompleted && exam.result && (
              <Card className="shadow-sm">
                <CardHeader className="card-responsive pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 flex-shrink-0" />
                    <span className="truncate">Your Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="card-responsive pt-0">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Score</p>
                      <p className="text-lg sm:text-2xl font-bold">
                        {exam.result.score || 0} / {exam.maxScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Percentage</p>
                      <p className="text-lg sm:text-2xl font-bold">
                        {Math.round(((exam.result.score || 0) / exam.maxScore) * 100)}%
                      </p>
                    </div>
                  </div>
                  {exam.result.submittedAt && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
                      Submitted on {new Date(exam.result.submittedAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-responsive">
            {/* Exam Stats */}
            <Card className="shadow-sm">
              <CardHeader className="card-responsive pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="card-responsive pt-0 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Duration</span>
                  </div>
                  <span className="font-medium text-xs sm:text-sm flex-shrink-0">{exam.durationMin} minutes</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Questions</span>
                  </div>
                  <span className="font-medium text-xs sm:text-sm flex-shrink-0">{exam.questionCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm truncate">Max Score</span>
                  </div>
                  <span className="font-medium text-xs sm:text-sm flex-shrink-0">{exam.maxScore} points</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="shadow-sm">
              <CardHeader className="card-responsive pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="card-responsive pt-0 space-y-3 sm:space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {canStart && (
                  <Button 
                    onClick={handleStartExam}
                    disabled={isStarting}
                    className="button-responsive w-full"
                    size="lg"
                  >
                    {isStarting ? (
                      <>
                        <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        <span className="text-xs sm:text-sm">Starting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Start Exam</span>
                      </>
                    )}
                  </Button>
                )}

                {canContinue && (
                  <>
                    <Button 
                      onClick={handleContinueExam}
                      disabled={isStarting || isSubmitting}
                      className="button-responsive w-full"
                      size="lg"
                    >
                      {isStarting ? (
                        <>
                          <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          <span className="text-xs sm:text-sm">Resuming...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Continue Exam</span>
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleSubmitExam}
                      disabled={isStarting || isSubmitting}
                      variant="outline"
                      className="button-responsive w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span className="text-xs sm:text-sm">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Submit Exam</span>
                        </>
                      )}
                    </Button>
                  </>
                )}

                {isCompleted && (
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-green-800 font-medium">
                      Exam Completed
                    </p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/student')}
                  className="button-responsive w-full"
                >
                  <span className="text-xs sm:text-sm">Back to Dashboard</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}