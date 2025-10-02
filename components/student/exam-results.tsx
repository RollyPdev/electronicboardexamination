'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Award, BarChart3 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ExamResultsProps {
  resultId: string
}

interface DetailedResult {
  examTitle: string
  examDescription: string
  startedAt: string
  submittedAt: string
  score: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  passed: boolean
  passingScore: number
  questions: Array<{
    id: string
    text: string
    type: string
    choices: Array<{
      id: string
      label: string
      text: string
      isCorrect: boolean
    }>
    studentAnswer: string
    correctAnswer: string
    isCorrect: boolean
    timeSpent: number
    points: number
  }>
}

export function ExamResults({ resultId }: ExamResultsProps) {
  const [results, setResults] = useState<DetailedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [resultId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/student/results/${resultId}/detailed`)
      const data = await response.json()
      
      if (response.ok) {
        setResults(data)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading results...</div>
  }

  if (!results) {
    return <div>Results not found</div>
  }

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Results Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {results.examTitle}
            </CardTitle>
            <Badge variant={results.passed ? "default" : "destructive"}>
              {results.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              {results.score.toFixed(1)}%
            </div>
            <div className="text-muted-foreground">
              {results.correctAnswers} out of {results.totalQuestions} correct
            </div>
            <Progress value={results.score} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {results.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {results.incorrectAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {results.passingScore}%
              </div>
              <div className="text-sm text-muted-foreground">Passing Score</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {formatDuration(results.startedAt, results.submittedAt)}
              </div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(!showDetails)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Question Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Question Details */}
      {showDetails && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Question by Question Review</h3>
          
          {results.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    Question {index + 1}
                    {question.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={question.isCorrect ? "default" : "destructive"}>
                      {question.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {question.timeSpent}s
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{question.text}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Choices:</h4>
                  <div className="grid gap-2">
                    {question.choices.map((choice) => {
                      const isStudentChoice = choice.text === question.studentAnswer
                      const isCorrectChoice = choice.isCorrect
                      
                      let bgColor = 'bg-muted'
                      if (isCorrectChoice) {
                        bgColor = 'bg-green-50 border border-green-200'
                      } else if (isStudentChoice && !isCorrectChoice) {
                        bgColor = 'bg-red-50 border border-red-200'
                      }
                      
                      return (
                        <div 
                          key={choice.id}
                          className={`flex items-center gap-2 p-2 rounded text-sm ${bgColor}`}
                        >
                          <span className="font-medium">{choice.label})</span>
                          <span className="flex-1">{choice.text}</span>
                          <div className="flex gap-1">
                            {isStudentChoice && (
                              <Badge variant="outline" size="sm">Your Answer</Badge>
                            )}
                            {isCorrectChoice && (
                              <Badge variant="default" size="sm">Correct</Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}