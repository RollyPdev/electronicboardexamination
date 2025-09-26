'use client'

import '../../../exam-security.css'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CameraRecorder } from '@/components/exam/camera-recorder'
import { AntiCheatWarning } from '@/components/exam/anti-cheat-warning'
import { SecurityWarning } from '@/components/exam/security-warning'
import { useAntiCheat } from '@/hooks/use-anti-cheat'
import { useScreenshotPrevention } from '@/hooks/use-screenshot-prevention'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertTriangle,
  Save,
  Camera
} from 'lucide-react'
import { getTimeRemaining } from '@/lib/exam-utils'

interface Question {
  id: string
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'NUMERIC'
  text: string
  points: number
  order: number
  options?: Array<{ label: string; text: string }>
}

interface ExamData {
  id: string
  title: string
  durationMin: number
  questions: Question[]
  randomize: boolean
}

interface Answer {
  answer: any
  timeSpent?: number
  submittedAt: string
}

export default function TakeExamPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const examId = params.id as string
  const token = searchParams.get('token')
  
  const [exam, setExam] = useState<ExamData | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null)
  const [examResultId, setExamResultId] = useState<string | null>(null)
  const [antiCheatEvents, setAntiCheatEvents] = useState<number>(0)
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false)
  const [showSecurityWarning, setShowSecurityWarning] = useState(false)
  const [lastEventType, setLastEventType] = useState<string>('')
  const [lastSecurityEventType, setLastSecurityEventType] = useState<string>('')
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const [showRecoveryNotification, setShowRecoveryNotification] = useState(false)

  // Anti-cheat monitoring
  const { logEvent } = useAntiCheat({
    examId,
    token: token || '',
    enabled: !!token && !!exam,
    onEvent: (event) => {
      setAntiCheatEvents(prev => prev + 1)
      setLastEventType(event.type)
      setShowAntiCheatWarning(true)
      console.warn('Anti-cheat event detected:', event.type)
    },
  })

  // Screenshot prevention
  useScreenshotPrevention({
    enabled: !!token && !!exam,
    onScreenshotAttempt: () => {
      setAntiCheatEvents(prev => prev + 1)
      setLastSecurityEventType('screenshot_attempt')
      setShowSecurityWarning(true)
      logEvent({ type: 'screenshot_attempt', timestamp: new Date().toISOString() })
    },
    onScreenRecordingDetected: () => {
      setAntiCheatEvents(prev => prev + 1)
      setLastSecurityEventType('screen_recording')
      setShowSecurityWarning(true)
      logEvent({ type: 'screen_recording', timestamp: new Date().toISOString() })
    }
  })

  // Fullscreen enforcement
  useEffect(() => {
    if (exam && startTime) {
      // Request fullscreen when exam starts
      const enterFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen()
          }
        } catch (error) {
          console.warn('Could not enter fullscreen:', error)
        }
      }
      
      enterFullscreen()
    }
  }, [exam, startTime])

  // Prevent page refresh/close during exam
  useEffect(() => {
    if (exam && !isSubmitting) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'Your exam progress will be saved, but you may lose time. Are you sure you want to leave?'
        return e.returnValue
      }

      const handleUnload = () => {
        // Save current state before page unloads
        if (examId) {
          const state = {
            answers,
            currentQuestionIndex,
            antiCheatEvents,
            lastSaved: new Date().toISOString(),
            timeRemaining,
            startTime: startTime?.toISOString()
          }
          localStorage.setItem(`exam_state_${examId}`, JSON.stringify(state))
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('unload', handleUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('unload', handleUnload)
      }
    }
  }, [exam, isSubmitting, examId, answers, currentQuestionIndex, antiCheatEvents, timeRemaining, startTime])

  // Restore saved state from localStorage
  useEffect(() => {
    if (examId && !hasRestoredState) {
      const savedState = localStorage.getItem(`exam_state_${examId}`)
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          setAnswers(state.answers || {})
          setCurrentQuestionIndex(state.currentQuestionIndex || 0)
          setAntiCheatEvents(state.antiCheatEvents || 0)
          
          // Restore timer state if available
          if (state.startTime && state.timeRemaining) {
            const savedStartTime = new Date(state.startTime)
            const timePassed = Date.now() - savedStartTime.getTime()
            const adjustedTimeRemaining = Math.max(0, state.timeRemaining - timePassed)
            setTimeRemaining(adjustedTimeRemaining)
            setStartTime(savedStartTime)
          }
          
          setShowRecoveryNotification(true)
          setTimeout(() => setShowRecoveryNotification(false), 5000)
          console.log('Restored exam state from localStorage')
        } catch (error) {
          console.warn('Failed to restore exam state:', error)
        }
      }
      setHasRestoredState(true)
    }
  }, [examId, hasRestoredState])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (examId && hasRestoredState && exam) {
      const state = {
        answers,
        currentQuestionIndex,
        antiCheatEvents,
        lastSaved: new Date().toISOString(),
        timeRemaining,
        startTime: startTime?.toISOString()
      }
      localStorage.setItem(`exam_state_${examId}`, JSON.stringify(state))
    }
  }, [examId, answers, currentQuestionIndex, antiCheatEvents, hasRestoredState, exam])

  // Load exam data
  useEffect(() => {
    if (examId && token && hasRestoredState) {
      fetchExamData()
    } else if (examId && hasRestoredState) {
      // No token provided, redirect to exam details page to start exam
      router.push(`/student/exams/${examId}`)
    } else if (hasRestoredState) {
      setError('Invalid exam session')
    }
  }, [examId, token, router, hasRestoredState])

  // Timer countdown
  useEffect(() => {
    if (startTime && timeRemaining > 0) {
      const timer = setInterval(() => {
        const remaining = getTimeRemaining(startTime, exam?.durationMin || 0)
        setTimeRemaining(remaining)
        
        if (remaining <= 0) {
          handleSubmitExam(true) // Auto-submit when time expires
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [startTime, exam?.durationMin, timeRemaining])

  // Auto-save answers
  useEffect(() => {
    const currentQuestion = exam?.questions[currentQuestionIndex]
    if (currentQuestion && answers[currentQuestion.id]) {
      const saveTimer = setTimeout(() => {
        saveAnswer(currentQuestion.id, answers[currentQuestion.id].answer, false)
      }, 2000) // Save 2 seconds after user stops typing

      return () => clearTimeout(saveTimer)
    }
  }, [answers, currentQuestionIndex, exam])

  const fetchExamData = async () => {
    try {
      setIsLoading(true)
      const url = `/api/student/exams/${examId}${token ? `?token=${token}` : ''}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setExam(data)
        setStartTime(new Date())
        setTimeRemaining(data.durationMin * 60 * 1000)
        setExamResultId(data.examResultId) // Get the exam result ID from the response
        
        // If exam has randomize enabled, shuffle questions on client side
        if (data.randomize) {
          const shuffled = [...data.questions].sort(() => Math.random() - 0.5)
          setExam(prev => prev ? { ...prev, questions: shuffled } : null)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load exam')
      }
    } catch (error) {
      setError('An error occurred while loading the exam')
    } finally {
      setIsLoading(false)
    }
  }

  const saveAnswer = async (questionId: string, answer: any, showStatus = true) => {
    try {
      if (showStatus) setIsSaving(true)
      setAutoSaveStatus('saving')
      
      const response = await fetch(`/api/student/exams/${examId}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer,
          token,
          timeSpent: 0, // Could track time spent per question
        }),
      })

      if (response.ok) {
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(null), 2000)
      } else {
        setAutoSaveStatus('error')
      }
    } catch (error) {
      setAutoSaveStatus('error')
    } finally {
      if (showStatus) setIsSaving(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        answer,
        submittedAt: new Date().toISOString(),
      }
    }))
  }

  const handleSubmitExam = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Are you sure you want to submit your exam? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/student/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        // Clear saved state after successful submission
        localStorage.removeItem(`exam_state_${examId}`)
        router.push(`/student/results/${data.resultId}`)
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

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < (exam?.questions.length || 0)) {
      setCurrentQuestionIndex(index)
    }
  }

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getQuestionTextOnly = (text: string) => {
    if (!text) return ''
    // Extract only the question part before the first choice (A., B., etc.)
    const match = text.match(/^(.*?)(?=\r?\n?[A-D]\.|$)/)
    return match ? match[1].trim() : text
  }

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id]?.answer

    switch (question.type) {
      case 'MCQ':
        const options = typeof question.options === 'string' 
          ? JSON.parse(question.options) 
          : question.options
        
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {Array.isArray(options) && options.map((option) => (
              <div key={option.label} className="flex items-center space-x-2">
                <RadioGroupItem value={option.label} id={`${question.id}-${option.label}`} />
                <Label htmlFor={`${question.id}-${option.label}`} className="flex-1 cursor-pointer">
                  <span className="font-medium">{option.label})</span> {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'TRUE_FALSE':
        return (
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`} className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`} className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )

      case 'SHORT_ANSWER':
        return (
          <Textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer here..."
            rows={4}
            className="w-full"
          />
        )

      case 'NUMERIC':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter a number"
            className="w-full max-w-xs"
          />
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading exam...</p>
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
            {error || 'Failed to load exam'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1
  const timeWarning = timeRemaining < 5 * 60 * 1000 // 5 minutes warning

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 select-none exam-secure" 
      style={{ 
        userSelect: 'none', 
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitAppRegion: 'no-drag',
        pointerEvents: 'auto'
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onSelectStart={(e) => e.preventDefault()}
    >
      {/* Anti-cheat warning modal */}
      <AntiCheatWarning
        isOpen={showAntiCheatWarning}
        onClose={() => setShowAntiCheatWarning(false)}
        eventType={lastEventType}
        eventCount={antiCheatEvents}
        onContinue={() => setShowAntiCheatWarning(false)}
      />

      {/* Security warning modal */}
      <SecurityWarning
        isOpen={showSecurityWarning}
        onClose={() => setShowSecurityWarning(false)}
        eventType={lastSecurityEventType}
        eventCount={antiCheatEvents}
        onContinue={() => setShowSecurityWarning(false)}
      />

      {/* Recovery notification */}
      {showRecoveryNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Your exam progress has been restored!</span>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm sticky top-0 z-10">
        <div className="container-responsive py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold truncate">{exam.title}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Anti-cheat status */}
              {antiCheatEvents > 0 && (
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex-shrink-0">
                  ⚠ {antiCheatEvents} event{antiCheatEvents !== 1 ? 's' : ''}
                </div>
              )}

              {/* Auto-save status */}
              {autoSaveStatus && (
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {autoSaveStatus === 'saving' && 'Saving...'}
                  {autoSaveStatus === 'saved' && '✓ Saved'}
                  {autoSaveStatus === 'error' && '⚠ Save failed'}
                </div>
              )}

              {/* State restored indicator */}
              {hasRestoredState && localStorage.getItem(`exam_state_${examId}`) && (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded hidden sm:block">
                  ✓ Progress restored
                </div>
              )}

              {/* Timer */}
              <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-md flex-shrink-0 ${
                timeWarning ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-mono font-medium text-sm sm:text-base">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 sm:mt-4">
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>
        </div>
      </div>

      <div className="container-responsive space-responsive">
        {/* Camera Recording Component - Disabled */}
        {false && examResultId && token && (
          <div className="fixed top-20 right-4 z-20">
            <CameraRecorder
              examResultId={examResultId || ''}
              token={token || ''}
            />
          </div>
        )}

        {/* Question Card */}
        <Card className="card-responsive">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg">
                  Question {currentQuestionIndex + 1}
                  <span className="ml-2 text-xs sm:text-sm font-normal text-muted-foreground block sm:inline">
                    ({currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'})
                  </span>
                </CardTitle>
                <CardDescription className="mt-2 text-sm sm:text-base leading-relaxed">
                  {currentQuestion.type === 'MCQ' ? getQuestionTextOnly(currentQuestion.text) : currentQuestion.text}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderQuestion(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto button-responsive"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-center order-first sm:order-none">
            <span className="text-base sm:text-lg font-medium">
              {currentQuestionIndex + 1} of {exam.questions.length}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (isLastQuestion) {
                handleSubmitExam()
              } else {
                navigateToQuestion(currentQuestionIndex + 1)
              }
            }}
            className="w-full sm:w-auto button-responsive"
          >
            {isLastQuestion ? (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Exam
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Warning for time */}
        {timeWarning && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Less than 5 minutes remaining! The exam will auto-submit when time expires.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}