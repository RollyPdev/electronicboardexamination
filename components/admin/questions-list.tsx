'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Edit } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: string
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

interface QuestionsListProps {
  examId: string
  refresh: number
}

export function QuestionsList({ examId, refresh }: QuestionsListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestions()
  }, [examId, refresh])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/questions?examId=${examId}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading questions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No questions uploaded yet. Use the upload form above to add questions.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    Question {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{question.type}</Badge>
                    <Badge variant="outline">{question.points} pts</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{question.text}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Choices:</h4>
                  <div className="grid gap-2">
                    {question.choices.map((choice) => (
                      <div 
                        key={choice.id}
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          choice.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-muted'
                        }`}
                      >
                        <span className="font-medium">{choice.label})</span>
                        <span>{choice.text}</span>
                        {choice.isCorrect && (
                          <Badge variant="default" className="ml-auto">Correct</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Answer:</span>
                    <Select value={question.correctAnswer} disabled>
                      <SelectTrigger className="w-32 h-8 ml-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {question.choices.map((choice) => (
                          <SelectItem key={choice.id} value={choice.text}>
                            {choice.label}) {choice.text.substring(0, 20)}...
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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