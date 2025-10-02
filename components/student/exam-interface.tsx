'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: string
  choices: Array<{
    id: string
    text: string
    label: string
  }>
}

interface ExamInterfaceProps {
  examId: string
  questions: Question[]
  token: string
  onComplete: () => void
}

export function ExamInterface({ examId, questions, token, onComplete }: ExamInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({})
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const saveAnswer = async (questionId: string, answer: string) => {
    setSaving(true)
    
    const currentTime = Date.now()
    const questionTime = Math.floor((currentTime - questionStartTime) / 1000)
    
    try {
      const response = await fetch(`/api/student/exams/${examId}/answer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          answer,
          timeSpent: questionTime,
          token
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save answer')
      }

      // Update local state
      setAnswers(prev => ({ ...prev, [questionId]: answer }))
      setTimeSpent(prev => ({ ...prev, [questionId]: questionTime }))
      
    } catch (error) {
      console.error('Error saving answer:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAnswerChange = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const handleNext = async () => {
    const currentAnswer = answers[currentQuestion.id]
    
    if (currentAnswer) {
      await saveAnswer(currentQuestion.id, currentAnswer)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Last question - complete exam
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  if (!currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswerChange}
          >
            {currentQuestion.choices.map((choice) => (
              <div key={choice.id} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                <RadioGroupItem value={choice.text} id={choice.id} />
                <Label htmlFor={choice.id} className="flex-1 cursor-pointer">
                  <span className="font-medium">{choice.label})</span> {choice.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          {answers[currentQuestion.id] ? 'Answer saved' : 'Select an answer'}
        </div>

        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || saving}
        >
          {saving ? 'Saving...' : currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : 'Next'}
          {currentQuestionIndex < questions.length - 1 && (
            <ChevronRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
    </div>
  )
}