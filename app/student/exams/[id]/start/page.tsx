'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  Shield,
  Camera,
  Eye
} from 'lucide-react'
import { formatDuration } from '@/lib/exam-utils'

interface ExamDetails {
  id: string
  title: string
  description: string | null
  durationMin: number
  questionCount: number
  maxScore: number
  result: any | null
  canTake: boolean
}

export default function ExamStartPage() {
  const router = useRouter()
  const params = useParams()
  const examId = params.id as string
  
  const [exam, setExam] = useState<ExamDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')
  const [agreements, setAgreements] = useState({
    terms: false,
    proctoring: false,
    conduct: false,
    timeLimit: false,
  })

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
        
        if (!data.canTake) {
          setError('This exam is not available for taking or has already been completed.')
        }
      } else {
        setError('Failed to load exam details.')
      }
    } catch (error) {
      setError('An error occurred while loading the exam.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }))
  }

  const allAgreementsChecked = Object.values(agreements).every(Boolean)

  const startExam = async () => {
    if (!allAgreementsChecked) return

    try {
      setIsStarting(true)
      setError('')
      
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-pulse">
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
          <Card className="animate-pulse">
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
        </div>
      </div>
    )
  }

  if (!exam || error) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/student/exams">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Not Available</h1>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'This exam could not be loaded.'}
          </AlertDescription>
        </Alert>
        
        <Link href="/student/exams">
          <Button>Back to Exams</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/student/exams">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          <p className="text-muted-foreground">Review the exam details before starting</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                {exam.description || 'No description provided.'}
              </p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
                <p className="text-muted-foreground">{formatDuration(exam.durationMin)}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-1 font-medium">
                  <BookOpen className="h-4 w-4" />
                  Questions
                </div>
                <p className="text-muted-foreground">{exam.questionCount} questions</p>
              </div>
              
              <div>
                <div className="font-medium">Max Score</div>
                <p className="text-muted-foreground">{exam.maxScore} points</p>
              </div>
              
              <div>
                <div className="font-medium">Attempts</div>
                <p className="text-muted-foreground">1 attempt only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Exam Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Proctoring Active</p>
                <p className="text-muted-foreground">Your camera will record during the exam</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />
              <div>
                <p className="font-medium">No Copy/Paste</p>
                <p className="text-muted-foreground">Copy and paste functions are disabled</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-red-500" />
              <div>
                <p className="font-medium">Time Limit Enforced</p>
                <p className="text-muted-foreground">Exam will auto-submit when time expires</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium">Tab Monitoring</p>
                <p className="text-muted-foreground">Switching tabs will be logged and flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreements */}
      <Card>
        <CardHeader>
          <CardTitle>Before You Begin</CardTitle>
          <CardDescription>
            Please read and agree to the following terms to start the exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreements.terms}
              onCheckedChange={(checked) => handleAgreementChange('terms', checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm leading-relaxed">
              I understand and agree to the <strong>exam terms and conditions</strong>. I will not engage in any form of academic dishonesty or cheating during this examination.
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="proctoring"
              checked={agreements.proctoring}
              onCheckedChange={(checked) => handleAgreementChange('proctoring', checked as boolean)}
            />
            <label htmlFor="proctoring" className="text-sm leading-relaxed">
              I consent to <strong>camera recording and monitoring</strong> during this exam. I understand that my video will be reviewed by instructors if suspicious activity is detected.
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="conduct"
              checked={agreements.conduct}
              onCheckedChange={(checked) => handleAgreementChange('conduct', checked as boolean)}
            />
            <label htmlFor="conduct" className="text-sm leading-relaxed">
              I agree to follow the <strong>examination conduct rules</strong>. I will not use unauthorized materials, communicate with others, or access external resources during the exam.
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="timeLimit"
              checked={agreements.timeLimit}
              onCheckedChange={(checked) => handleAgreementChange('timeLimit', checked as boolean)}
            />
            <label htmlFor="timeLimit" className="text-sm leading-relaxed">
              I understand the <strong>time limit</strong> of {formatDuration(exam.durationMin)} and that the exam will automatically submit when time expires, regardless of completion status.
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="flex gap-4">
        <Link href="/student/exams" className="flex-1">
          <Button variant="outline" className="w-full">
            Cancel
          </Button>
        </Link>
        <div className="flex-2">
          <Button 
            onClick={startExam}
            disabled={!allAgreementsChecked || isStarting}
            className="w-full"
            size="lg"
          >
            {isStarting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Starting Exam...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Exam
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}