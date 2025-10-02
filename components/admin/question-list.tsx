'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Edit, Trash2, Plus, BookOpen, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: string
  type: string
  text: string
  correctAnswer: string
  points: number
  order: number
  choices: Array<{
    id: string
    text: string
    label: string
    isCorrect: boolean
    order: number
  }>
}

interface QuestionListProps {
  examId: string
  onQuestionUpdate?: () => void
}

export function QuestionList({ examId, onQuestionUpdate }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [updatingCorrectAnswer, setUpdatingCorrectAnswer] = useState<string | null>(null)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/exams/${examId}/questions`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      setQuestions(data.questions || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [examId])

  const handleUpdateCorrectAnswer = async (questionId: string, newCorrectAnswer: string) => {
    try {
      setUpdatingCorrectAnswer(questionId)
      
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correctAnswer: newCorrectAnswer
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update correct answer')
      }

      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, correctAnswer: newCorrectAnswer }
          : q
      ))

      if (onQuestionUpdate) {
        onQuestionUpdate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update correct answer')
    } finally {
      setUpdatingCorrectAnswer(null)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete question')
      }

      // Remove from local state
      setQuestions(prev => prev.filter(q => q.id !== questionId))

      if (onQuestionUpdate) {
        onQuestionUpdate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchQuestions}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <p className="text-sm text-gray-600">
            Manage questions and their correct answers
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">
              Upload a file or manually add questions to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      Question {index + 1}
                      <Badge variant="secondary" className="ml-2">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {question.text}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuestion(
                        editingQuestion === question.id ? null : question.id
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Choices */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-sm">Choices:</h4>
                  <div className="grid gap-2">
                    {question.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className={`flex items-center gap-2 p-2 rounded border ${
                          choice.isCorrect 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="font-medium text-sm w-6">
                          {choice.label})
                        </span>
                        <span className="flex-1 text-sm">{choice.text}</span>
                        {choice.isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer Dropdown */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Correct Answer:</Label>
                  <Select
                    value={question.correctAnswer}
                    onValueChange={(value) => handleUpdateCorrectAnswer(question.id, value)}
                    disabled={updatingCorrectAnswer === question.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.choices.map((choice) => (
                        <SelectItem key={choice.id} value={choice.text}>
                          {choice.label}) {choice.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updatingCorrectAnswer === question.id && (
                    <p className="text-xs text-gray-500">Updating...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
