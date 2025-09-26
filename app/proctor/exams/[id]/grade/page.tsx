'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  BookOpen,
  Calendar
} from 'lucide-react'

interface ExamResult {
  id: string
  userId: string
  userName: string
  userEmail: string
  examId: string
  examTitle: string
  status: string
  score: number | null
  maxScore: number | null
  percentage: number
  submittedAt: string
  gradedAt: string | null
  answers: Record<string, any>
  feedback?: string
}

interface Question {
  id: string
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'NUMERIC'
  text: string
  points: number
  order: number
  options?: Array<{ label: string; text: string; correct?: boolean }>
  correctAnswer?: any
}

interface ManualGrades {
  [questionId: string]: number
}

export default function ManualGradingPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string
  
  const [examResult, setExamResult] = useState<ExamResult | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [manualGrades, setManualGrades] = useState<ManualGrades>({})
  const [overallFeedback, setOverallFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (examId) {
      fetchExamResult()
    }
  }, [examId])

  const fetchExamResult = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/exams/${examId}/results`)
      if (response.ok) {
        const data = await response.json()
        // Get the first submitted result for grading
        const submittedResult = data.results.find((r: any) => r.status === 'SUBMITTED')
        if (submittedResult) {
          setExamResult(submittedResult)
          fetchExamDetails(submittedResult.id)
        } else {
          setError('No submitted exams available for grading')
        }
      } else {
        setError('Failed to load exam results')
      }
    } catch (error) {
      setError('An error occurred while loading exam results')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExamDetails = async (resultId: string) => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching exam details:', error)
    }
  }

  const handleGradeChange = (questionId: string, points: number) => {
    const question = questions.find(q => q.id === questionId)
    if (question && points >= 0 && points <= question.points) {
      setManualGrades(prev => ({
        ...prev,
        [questionId]: points
      }))
    }
  }

  const handleSubmitGrades = async () => {
    if (!examResult) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/admin/exams/${examId}/results/${examResult.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionGrades: manualGrades,
          overallFeedback,
        }),
      })

      if (response.ok) {
        router.push(`/admin/exams/${examId}/results`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to submit grades')
      }
    } catch (error) {
      setError('An error occurred while submitting grades')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderQuestion = (question: Question) => {
    const answer = examResult?.answers[question.id]
    const manualGrade = manualGrades[question.id]
    
    switch (question.type) {
      case 'MCQ':
        return (
          <div className="space-y-2">
            <p className="font-medium">{answer?.answer || 'No answer provided'}</p>
            {question.options?.map(option => (
              <div 
                key={option.label} 
                className={`p-2 rounded ${
                  option.correct 
                    ? 'bg-green-100 border border-green-300' 
                    : answer?.answer === option.label 
                      ? 'bg-red-100 border border-red-300' 
                      : 'bg-muted'
                }`}
              >
                <span className={`font-medium ${
                  option.correct ? 'text-green-800' : 
                  answer?.answer === option.label ? 'text-red-800' : ''
                }`}>
                  {option.label}) {option.text}
                </span>
                {option.correct && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        )

      case 'TRUE_FALSE':
        const correctAnswer = question.options?.[0]?.correct ? 'True' : 'False'
        return (
          <div className="space-y-2">
            <p className={`font-medium ${
              answer?.answer === correctAnswer 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {answer?.answer || 'No answer provided'}
            </p>
            <p className="text-sm text-muted-foreground">
              Correct answer: <span className="font-medium">{correctAnswer}</span>
            </p>
          </div>
        )

      case 'SHORT_ANSWER':
        return (
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{answer?.answer || 'No answer provided'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`grade-${question.id}`}>
                Points ({question.points} max)
              </Label>
              <Input
                id={`grade-${question.id}`}
                type="number"
                min="0"
                max={question.points}
                value={manualGrade !== undefined ? manualGrade : ''}
                onChange={(e) => handleGradeChange(question.id, parseFloat(e.target.value) || 0)}
                className="max-w-20"
              />
            </div>
          </div>
        )

      case 'NUMERIC':
        const correctValue = (question.options?.[0] as any)?.correct_answer
        const tolerance = (question.options?.[0] as any)?.tolerance || 0.01
        const isCorrect = answer?.answer !== undefined && 
                         correctValue !== undefined &&
                         Math.abs(parseFloat(answer.answer) - parseFloat(correctValue)) <= tolerance
        
        return (
          <div className="space-y-2">
            <p className={`font-medium ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {answer?.answer || 'No answer provided'}
            </p>
            <p className="text-sm text-muted-foreground">
              Correct answer: <span className="font-medium">{correctValue}</span>
              {tolerance > 0 && (
                <span className="ml-1">(±{tolerance})</span>
              )}
            </p>
          </div>
        )

      default:
        return <p>Unsupported question type</p>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  if (error || !examResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/exams/${examId}/results`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Manual Grading</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Exam result not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/exams/${examId}/results`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Manual Grading</h1>
            <p className="text-muted-foreground">
              Grade short answer questions for {examResult.userName}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Submitted {formatDate(examResult.submittedAt)}
        </Badge>
      </div>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{examResult.userName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{examResult.userEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exam</p>
              <p className="font-medium">{examResult.examTitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Questions
        </h2>
        
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Question {index + 1}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({question.points} {question.points === 1 ? 'point' : 'points'})
                    </span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {question.text}
                  </CardDescription>
                </div>
                <Badge variant={
                  question.type === 'SHORT_ANSWER' ? 'default' : 
                  question.type === 'MCQ' ? 'secondary' : 'outline'
                }>
                  {question.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderQuestion(question)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
          <CardDescription>
            Provide general feedback for the student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter overall feedback for the student..."
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {Object.keys(manualGrades).length} of {questions.filter(q => q.type === 'SHORT_ANSWER').length} short answer questions graded
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/exams/${examId}/results`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button 
            onClick={handleSubmitGrades}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Grades
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}