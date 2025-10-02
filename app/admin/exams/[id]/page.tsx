'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Plus, Trash2, Save, Edit } from 'lucide-react'
import Link from 'next/link'

interface Question {
  id?: string
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'NUMERIC'
  text: string
  options?: string[] | any
  correctAnswer: string
  points: number
}

interface Exam {
  id: string
  title: string
  description: string
  durationMin: number
  randomize: boolean
  published: boolean
  questions: Question[]
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [exam, setExam] = useState<Exam | null>(null)

  const getQuestionTextOnly = (text: string) => {
    if (!text) return ''
    // Extract only the question part before the first choice (A., B., etc.)
    const match = text.match(/^([\s\S]*?)(?=\r?\n?[A-D]\.|$)/)
    return match ? match[1].trim() : text
  }
  
  const parseMCQFromText = (fullText: string) => {
    // Extract question part (before first choice)
    const questionMatch = fullText.match(/^([\s\S]*?)(?=\r?\n?[A-D]\.|$)/)
    const question = questionMatch ? questionMatch[1].trim() : ''
    
    // Extract choices (A., B., C., D.)
    const choiceMatches = fullText.match(/[A-D]\.\s*[^\r\n]*(?=\r?\n?[A-D]\.|\r?\n?Correct|$)/g) || []
    const options = choiceMatches.map((choice: string) => {
      return choice.replace(/^[A-D]\.\s*/, '').trim()
    })
    
    // Pad options to 4 if less
    while (options.length < 4) {
      options.push('')
    }
    
    // Extract correct answer (look for "Correct Answer: X" pattern)
    const correctMatch = fullText.match(/Correct\s+Answer:\s*([A-D])/i)
    let correctAnswer = ''
    if (correctMatch && options.length > 0) {
      const correctIndex = correctMatch[1].charCodeAt(0) - 65 // A=0, B=1, etc.
      correctAnswer = options[correctIndex] || ''
    }
    
    return {
      question,
      options,
      correctAnswer
    }
  }
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [newQuestion, setNewQuestion] = useState<Question>({
    type: 'MCQ',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  })
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditingExam, setIsEditingExam] = useState(false)
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    durationMin: 0,
    randomize: false,
    published: false
  })

  useEffect(() => {
    fetchExam()
  }, [resolvedParams.id])

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/admin/exams/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
        setExamData({
          title: data.title,
          description: data.description || '',
          durationMin: data.durationMin,
          randomize: data.randomize,
          published: data.published
        })
      } else {
        setError('Failed to load exam')
      }
    } catch (error) {
      setError('An error occurred while loading the exam')
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = async () => {
    if (!newQuestion.text.trim() || !newQuestion.correctAnswer.trim()) {
      setError('Question and correct answer are required')
      return
    }

    setIsSaving(true)
    try {
      // Convert correct answer from A/B/C/D to actual option text for MCQ
      let correctAnswerValue = newQuestion.correctAnswer
      if (newQuestion.type === 'MCQ' && newQuestion.options) {
        const answerIndex = newQuestion.correctAnswer.charCodeAt(0) - 65 // A=0, B=1, etc.
        correctAnswerValue = newQuestion.options[answerIndex] || newQuestion.correctAnswer
      }
      
      const response = await fetch(`/api/admin/exams/${resolvedParams.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newQuestion,
          correctAnswer: correctAnswerValue
        }),
      })

      if (response.ok) {
        await fetchExam()
        setNewQuestion({
          type: 'MCQ',
          text: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1
        })
        setError('')
      } else {
        setError('Failed to add question')
      }
    } catch (error) {
      setError('An error occurred while adding the question')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchExam()
      } else {
        setError('Failed to delete question')
      }
    } catch (error) {
      setError('An error occurred while deleting the question')
    }
  }

  const updateNewQuestion = (field: keyof Question, value: any) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])]
    newOptions[index] = value
    updateNewQuestion('options', newOptions)
  }

  const startEditQuestion = (question: Question) => {
    console.log('Editing question:', question)
    
    const options = typeof question.options === 'string' 
      ? JSON.parse(question.options) 
      : question.options
    
    console.log('Parsed options:', options)
    
    // Extract options and find correct answer
    let optionTexts = ['', '', '', '']
    let correctAnswer = 'A'
    
    if (Array.isArray(options)) {
      options.forEach((opt, index) => {
        if (typeof opt === 'object' && opt !== null) {
          // Handle object format: { label: 'A', text: 'Option text', correct: true }
          if (opt.text) {
            optionTexts[index] = opt.text
          }
          if (opt.correct) {
            correctAnswer = opt.label || String.fromCharCode(65 + index)
          }
        } else if (typeof opt === 'string') {
          // Handle string format
          optionTexts[index] = opt
        }
      })
      
      // If no correct answer found in options, try to match with stored correctAnswer
      if (correctAnswer === 'A' && question.correctAnswer) {
        const correctIndex = optionTexts.findIndex(opt => opt === question.correctAnswer)
        if (correctIndex !== -1) {
          correctAnswer = String.fromCharCode(65 + correctIndex)
        }
      }
    }
    
    console.log('Extracted data:', { optionTexts, correctAnswer })
    
    setEditingQuestion({
      ...question,
      options: optionTexts,
      correctAnswer: correctAnswer
    })
  }

  const updateEditingQuestion = (field: keyof Question, value: any) => {
    setEditingQuestion(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateEditingOption = (index: number, value: string) => {
    if (!editingQuestion) return
    const newOptions = [...(editingQuestion.options || [])]
    newOptions[index] = value
    updateEditingQuestion('options', newOptions)
  }

  const saveEditedQuestion = async () => {
    if (!editingQuestion || !editingQuestion.text?.trim() || !editingQuestion.correctAnswer?.trim()) {
      setError('Question and correct answer are required')
      return
    }

    setIsUpdating(true)
    try {
      // Convert correct answer from A/B/C/D to actual option text for MCQ
      let correctAnswerValue = editingQuestion.correctAnswer
      if (editingQuestion.type === 'MCQ' && editingQuestion.options) {
        const answerIndex = editingQuestion.correctAnswer.charCodeAt(0) - 65 // A=0, B=1, etc.
        correctAnswerValue = editingQuestion.options[answerIndex] || editingQuestion.correctAnswer
      }
      
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingQuestion.type,
          text: editingQuestion.text,
          options: editingQuestion.options,
          correctAnswer: correctAnswerValue,
          points: editingQuestion.points
        }),
      })

      if (response.ok) {
        await fetchExam()
        setEditingQuestion(null)
        setError('')
      } else {
        setError('Failed to update question')
      }
    } catch (error) {
      setError('An error occurred while updating the question')
    } finally {
      setIsUpdating(false)
    }
  }

  const updateExam = async () => {
    if (!examData.title.trim()) {
      setError('Exam title is required')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/exams/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      })

      if (response.ok) {
        await fetchExam()
        setIsEditingExam(false)
        setError('')
      } else {
        setError('Failed to update exam')
      }
    } catch (error) {
      setError('An error occurred while updating the exam')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!exam) {
    return <div className="text-center p-8">Exam not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
            <p className="text-muted-foreground">
              {exam.questions.length} questions • {exam.durationMin} minutes
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditingExam(!isEditingExam)}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditingExam ? 'Cancel Edit' : 'Edit Exam'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Exam Settings */}
      {isEditingExam && (
        <Card>
          <CardHeader>
            <CardTitle>Exam Settings</CardTitle>
            <CardDescription>
              Update exam information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={examData.title}
                onChange={(e) => setExamData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter exam title"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={examData.description}
                onChange={(e) => setExamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter exam description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min="1"
                value={examData.durationMin}
                onChange={(e) => setExamData(prev => ({ ...prev, durationMin: parseInt(e.target.value) || 1 }))}
                placeholder="Enter duration in minutes"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={examData.randomize}
                onCheckedChange={(checked) => setExamData(prev => ({ ...prev, randomize: checked }))}
              />
              <Label>Randomize question order</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={examData.published}
                onCheckedChange={(checked) => setExamData(prev => ({ ...prev, published: checked }))}
              />
              <Label>Published (visible to students)</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({exam.questions.length})</CardTitle>
          <CardDescription>
            Manage the questions for this exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {exam.questions.map((question, index) => (
            <div key={question.id} className="border rounded-lg p-4">
              {editingQuestion?.id === question.id && editingQuestion ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Editing Question {index + 1}</h4>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEditedQuestion} disabled={isUpdating}>
                        {isUpdating ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingQuestion(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={editingQuestion.text}
                        onChange={(e) => updateEditingQuestion('text', e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editingQuestion.points}
                        onChange={(e) => updateEditingQuestion('points', parseInt(e.target.value) || 1)}
                        className="w-32"
                      />
                    </div>
                    
                    {editingQuestion.type === 'MCQ' && (
                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {editingQuestion.options?.map((option: string, optIndex: number) => (
                            <Input
                              key={optIndex}
                              value={option}
                              onChange={(e) => updateEditingOption(optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label>Correct Answer</Label>
                      {editingQuestion.type === 'MCQ' ? (
                        <Select value={editingQuestion.correctAnswer} onValueChange={(value) => updateEditingQuestion('correctAnswer', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct option" />
                          </SelectTrigger>
                          <SelectContent>
                            {editingQuestion.options?.map((option: string, index: number) => {
                              if (!option.trim()) return null
                              const label = String.fromCharCode(65 + index)
                              return (
                                <SelectItem key={index} value={label}>
                                  {label}. {option}
                                </SelectItem>
                              )
                            }).filter(Boolean)}
                          </SelectContent>
                        </Select>
                      ) : editingQuestion.type === 'TRUE_FALSE' ? (
                        <Select value={editingQuestion.correctAnswer} onValueChange={(value) => updateEditingQuestion('correctAnswer', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={editingQuestion.correctAnswer}
                          onChange={(e) => updateEditingQuestion('correctAnswer', e.target.value)}
                          placeholder="Enter the correct answer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{question.points} pts</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => question.id && deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mb-2">{question.type === 'MCQ' ? getQuestionTextOnly(question.text) : question.text}</p>
                  {question.type === 'MCQ' && question.options && (
                    <div className="space-y-1">
                      {(() => {
                        const options = typeof question.options === 'string' 
                          ? JSON.parse(question.options) 
                          : question.options;
                        return Array.isArray(options) ? options.map((option, optIndex) => {
                          const optionText = typeof option === 'object' ? option.text : option
                          const isCorrect = typeof option === 'object' ? option.correct : (optionText === question.correctAnswer)
                          
                          return (
                            <div key={optIndex} className={`text-sm p-2 rounded ${
                              isCorrect ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-50'
                            }`}>
                              <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {optionText}
                              {isCorrect && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
                            </div>
                          )
                        }) : null;
                      })()
                      }
                    </div>
                  )}
                  {question.type === 'TRUE_FALSE' && (
                    <p className="text-sm text-green-600">Correct: {question.correctAnswer}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add New Question */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
          <CardDescription>
            Create a new question for this exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={newQuestion.type} onValueChange={(value: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'NUMERIC') => {
                updateNewQuestion('type', value)
                // Reset options when type changes
                if (value === 'MCQ') {
                  updateNewQuestion('options', ['', '', '', ''])
                  updateNewQuestion('correctAnswer', '')
                } else {
                  updateNewQuestion('options', undefined)
                  updateNewQuestion('correctAnswer', '')
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                  <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                  <SelectItem value="NUMERIC">Numeric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                min="1"
                value={newQuestion.points}
                onChange={(e) => updateNewQuestion('points', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={newQuestion.text}
              onChange={(e) => {
                const text = e.target.value
                updateNewQuestion('text', text)
                
                // Auto-parse if it looks like a formatted question
                if (text.includes('A.') && text.includes('B.') && newQuestion.type === 'MCQ') {
                  const parsed = parseMCQFromText(text)
                  if (parsed.question && parsed.options.length > 0) {
                    updateNewQuestion('text', parsed.question)
                    updateNewQuestion('options', parsed.options)
                    if (parsed.correctAnswer) {
                      updateNewQuestion('correctAnswer', parsed.correctAnswer)
                    }
                  }
                }
              }}
              placeholder="Enter your question here... (or paste formatted question with A. B. C. D. options)"
              rows={6}
            />
            <div className="text-xs text-gray-500 mt-1">
              <strong>Auto-parse format:</strong> Question text followed by A. Option 1, B. Option 2, C. Option 3, D. Option 4, then "Correct Answer: A" (optional)
            </div>
          </div>

          {newQuestion.type === 'MCQ' && (
            <div className="space-y-2">
              <Label>Options</Label>
              {newQuestion.options?.map((option: string, index: number) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Correct Answer</Label>
            {newQuestion.type === 'MCQ' ? (
              <Select value={newQuestion.correctAnswer} onValueChange={(value) => updateNewQuestion('correctAnswer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {newQuestion.options?.map((option: string, index: number) => {
                    if (!option.trim()) return null
                    return (
                      <SelectItem key={index} value={option}>
                        {String.fromCharCode(65 + index)}. {option}
                      </SelectItem>
                    )
                  }).filter(Boolean)}
                </SelectContent>
              </Select>
            ) : newQuestion.type === 'TRUE_FALSE' ? (
              <Select value={newQuestion.correctAnswer} onValueChange={(value) => updateNewQuestion('correctAnswer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newQuestion.correctAnswer}
                onChange={(e) => updateNewQuestion('correctAnswer', e.target.value)}
                placeholder="Enter the correct answer"
              />
            )}
          </div>

          <Button onClick={addQuestion} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Update Exam Button */}
      {isEditingExam && (
        <div className="flex justify-end">
          <Button 
            onClick={updateExam} 
            disabled={isUpdating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isUpdating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Exam
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}