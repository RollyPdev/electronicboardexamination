'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, BookOpen, Target, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { formatDuration } from '@/lib/exam-utils'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'NUMERIC'
  text: string
  options: any
  points: number
  order: number
  studentAnswer: any
}

interface DetailedResult {
  id: string
  examId: string
  examTitle: string
  examDescription: string | null
  durationMin: number
  score: number | null
  maxScore: number | null
  percentage: number | null
  status: string
  startedAt: string
  submittedAt: string | null
  gradedAt: string | null
  questions: Question[]
}

export default function ResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<DetailedResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchResultDetail(params.id as string)
    }
  }, [params.id])

  const fetchResultDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/student/results/${id}`)
      if (response.ok) {
        const data = await response.json()
        setResult(data.result)
      }
    } catch (error) {
      console.error('Error fetching result detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-500'
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const renderAnswer = (question: Question) => {
    if (!question.studentAnswer) {
      return <span className="text-gray-500 italic">No answer provided</span>
    }

    switch (question.type) {
      case 'MCQ':
        const options = question.options
        if (!Array.isArray(options)) {
          return <span className="text-red-500">Invalid options format</span>
        }
        return (
          <div className="space-y-1 sm:space-y-2">
            {options.map((option, index) => {
              // Extract text from option object or use as string
              const optionText = typeof option === 'string' 
                ? option 
                : (option && typeof option === 'object' && option.text) 
                  ? String(option.text) 
                  : `Option ${String.fromCharCode(65 + index)}`
              
              return (
                <div key={index} className={cn(
                  "p-2 sm:p-3 rounded border text-sm sm:text-base",
                  question.studentAnswer === index 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-gray-50 border-gray-200"
                )}>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {optionText}
                  {question.studentAnswer === index && (
                    <CheckCircle className="inline ml-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  )}
                </div>
              )
            })}
          </div>
        )
      case 'TRUE_FALSE':
        return (
          <Badge variant={question.studentAnswer ? "default" : "secondary"}>
            {question.studentAnswer ? 'True' : 'False'}
          </Badge>
        )
      case 'SHORT_ANSWER':
      case 'NUMERIC':
        return (
          <div className="p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded text-sm sm:text-base">
            {question.studentAnswer}
          </div>
        )
      default:
        return <span className="text-gray-500">Unknown answer type</span>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Result not found</h3>
            <p className="text-gray-600 mb-4">The exam result you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button variant="outline" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{result.examTitle}</h1>
          <p className="text-sm sm:text-base text-gray-600">{result.examDescription || 'Detailed exam results'}</p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Exam Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs sm:text-sm text-blue-700">Duration</div>
              <div className="font-semibold text-sm sm:text-base text-blue-900">{formatDuration(result.durationMin)}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-2" />
              <div className="text-xs sm:text-sm text-green-700">Questions</div>
              <div className="font-semibold text-sm sm:text-base text-green-900">{result.questions.length}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs sm:text-sm text-purple-700">Submitted</div>
              <div className="font-semibold text-sm sm:text-base text-purple-900">
                {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            {result.score !== null && result.maxScore && (
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 mx-auto mb-2" />
                <div className="text-xs sm:text-sm text-amber-700">Score</div>
                <div className={cn("font-semibold text-base sm:text-lg", getScoreColor(result.percentage))}>
                  {result.score}/{result.maxScore}
                </div>
                {result.percentage && (
                  <div className={cn("text-xs sm:text-sm", getScoreColor(result.percentage))}>
                    ({result.percentage.toFixed(1)}%)
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions and Answers */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">Questions & Your Answers</h2>
        {result.questions.map((question, index) => (
          <Card key={question.id} className="bg-white border border-gray-200">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs sm:text-sm">Question {index + 1}</Badge>
                    <Badge variant="secondary" className="text-xs sm:text-sm">{question.type.replace('_', ' ')}</Badge>
                    <span className="text-xs sm:text-sm text-gray-600">{question.points} point{question.points !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-900">{question.text}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Your Answer:</h4>
                {renderAnswer(question)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}