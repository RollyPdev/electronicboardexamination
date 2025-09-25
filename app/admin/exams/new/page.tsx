'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Save, Upload, FileText, Clock, Settings, BookOpen, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface CreateExamForm {
  title: string
  description: string
  durationMin: number
  randomize: boolean
  published: boolean
}

export default function CreateExamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMockExam, setIsMockExam] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importedQuestions, setImportedQuestions] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState<CreateExamForm>({
    title: '',
    description: '',
    durationMin: 60,
    randomize: true,
    published: false,
  })

  useEffect(() => {
    const type = searchParams.get('type')
    const subject = searchParams.get('subject')
    
    if (type === 'mock' && subject) {
      setIsMockExam(true)
      const subjectTitle = subject.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      // Set duration based on CLE subject
      const subjectDurations: Record<string, number> = {
        'criminal-jurisprudence-procedure-and-evidence': 210, // 3h 30m
        'law-enforcement-administration': 150, // 2h 30m
        'crime-detection-and-investigation': 210, // 3h 30m
        'criminalistics': 150, // 2h 30m
        'correctional-administration': 210, // 3h 30m
        'criminology': 150 // 2h 30m
      }
      
      const duration = subjectDurations[subject] || 150
      
      updateForm('title', `CLE Mock Exam - ${subjectTitle}`)
      updateForm('description', `GENERAL INSTRUCTIONS:

1. Choose the correct answer for each question.
2. This exam is strictly monitored by your proctor.
3. You are NOT allowed to close tabs or switch windows during the exam.
4. This exam is being recorded and your camera must remain open throughout.
5. Any suspicious activity will be logged and may result in disqualification.
6. Copy and paste functions are disabled during the exam.
7. Ensure stable internet connection before starting.
8. Read each question carefully before answering.
9. There is NO time limit per question - manage your time wisely.
10. The exam will AUTOMATICALLY SUBMIT when the total time expires.
11. You can review and change answers until time runs out.
12. Save your progress frequently as you work.

IMPORTANT: When time expires, the system will automatically submit your exam regardless of completion status.

VIOLATION OF ANY RULE MAY RESULT IN AUTOMATIC FAILURE.`)
      updateForm('durationMin', duration)
    }
  }, [searchParams])

  const updateForm = (field: keyof CreateExamForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const parseQuestionsFromText = (text: string) => {
    const questions: any[] = []
    
    // Split by question numbers - improved pattern
    const questionPattern = /^\s*\d+[.)\s]/gm
    const matches = [...text.matchAll(questionPattern)]
    
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i]
      const nextMatch = matches[i + 1]
      
      const startIndex = currentMatch.index!
      const endIndex = nextMatch ? nextMatch.index! : text.length
      
      const questionBlock = text.slice(startIndex, endIndex).trim()
      const lines = questionBlock.split('\n').map(line => line.trim()).filter(line => line)
      
      if (lines.length < 1) continue
      
      // Extract question text - improved regex
      const questionText = lines[0].replace(/^\s*\d+[.)\s]+/, '').trim()
      if (!questionText) continue
      
      // Find options with more flexible patterns
      const optionA = lines.find(line => /^\s*a[.)\s]/i.test(line))?.replace(/^\s*a[.)\s]*/i, '').trim() || ''
      const optionB = lines.find(line => /^\s*b[.)\s]/i.test(line))?.replace(/^\s*b[.)\s]*/i, '').trim() || ''
      const optionC = lines.find(line => /^\s*c[.)\s]/i.test(line))?.replace(/^\s*c[.)\s]*/i, '').trim() || ''
      const optionD = lines.find(line => /^\s*d[.)\s]/i.test(line))?.replace(/^\s*d[.)\s]*/i, '').trim() || ''
      
      // Find correct answer with more flexible patterns
      const answerLine = lines.find(line => 
        /correct\s*answer/i.test(line) || 
        /answer\s*:/i.test(line) ||
        /correct\s*:/i.test(line)
      )
      const correctMatch = answerLine?.match(/([a-d])/i)
      const correctAnswer = correctMatch ? correctMatch[1].toUpperCase() : ''
      
      questions.push({
        type: 'MCQ',
        text: questionText,
        optionA,
        optionB, 
        optionC,
        optionD,
        correctAnswer,
        points: 1
      })
    }
    
    return questions
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    setImportError('')
    setUploadProgress(0)
    
    // Slower progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 80) {
          clearInterval(progressInterval)
          return 80
        }
        return prev + 5
      })
    }, 300)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        setUploadProgress(85)
        
        // Process questions with progress updates
        setTimeout(() => {
          setUploadProgress(90)
          const questions = parseQuestionsFromText(text)
          
          setTimeout(() => {
            setUploadProgress(95)
            
            setTimeout(() => {
              setUploadProgress(100)
              
              setTimeout(() => {
                if (questions.length === 0) {
                  setImportError('No valid questions found. Please check the format.')
                } else {
                  setImportedQuestions(questions)
                }
                setIsImporting(false)
                setUploadProgress(0)
              }, 800)
            }, 500)
          }, 500)
        }, 300)
      } catch (error) {
        setImportError('Error reading file. Please try again.')
        setIsImporting(false)
        setUploadProgress(0)
      }
    }
    reader.onerror = () => {
      setImportError('Failed to read file')
      setIsImporting(false)
      setUploadProgress(0)
      clearInterval(progressInterval)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, questions: importedQuestions }),
      })

      if (response.ok) {
        const exam = await response.json()
        router.push(`/admin/exams/${exam.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create exam')
      }
    } catch (error) {
      setError('An error occurred while creating the exam')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/exams">
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Examination</h1>
              <p className="text-slate-600 text-lg">
                Design and configure your examination with professional settings
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Exam Details</span>
            </div>
            <div className="w-8 h-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Configuration</span>
            </div>
            <div className="w-8 h-px bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm">Review</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900">Examination Details</CardTitle>
                    <CardDescription className="text-slate-600">
                      Configure the basic information and settings for your exam
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Basic Information</h3>
                      <p className="text-sm text-slate-600">Essential details about your examination</p>
                    </div>
                    
                    {/* Title */}
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-medium text-slate-700">Examination Title *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                        placeholder="e.g., Advanced Criminology Assessment"
                        readOnly={isMockExam}
                        className={`h-12 ${isMockExam ? 'bg-slate-50 border-slate-200' : 'border-slate-300 focus:border-blue-500'} rounded-xl`}
                        required
                      />
                      {isMockExam && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                          Title is automatically set for CLE mock exams
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-medium text-slate-700">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        placeholder="Provide a comprehensive description of what this exam covers, including topics, objectives, and any special instructions..."
                        readOnly={isMockExam}
                        className={`${isMockExam ? 'bg-slate-50 border-slate-200' : 'border-slate-300 focus:border-blue-500'} rounded-xl resize-none`}
                        rows={4}
                      />
                      {isMockExam && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                          Description is automatically set for CLE mock exams
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="space-y-3">
                      <Label htmlFor="duration" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Duration (minutes) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="600"
                          value={form.durationMin}
                          onChange={(e) => updateForm('durationMin', parseInt(e.target.value) || 60)}
                          readOnly={isMockExam}
                          className={`h-12 ${isMockExam ? 'bg-slate-50 border-slate-200' : 'border-slate-300 focus:border-blue-500'} rounded-xl pr-16`}
                          required
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          min
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {isMockExam 
                          ? '⏱️ Duration is set according to official CLE time requirements'
                          : '⏱️ Recommended: 1-2 minutes per question for optimal completion'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Exam Configuration
                      </h3>
                      <p className="text-sm text-slate-600">Advanced settings for exam behavior</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="space-y-1">
                          <Label htmlFor="randomize" className="text-sm font-medium text-slate-700">Randomize Questions</Label>
                          <p className="text-sm text-slate-600">
                            Present questions in random order for each student to prevent cheating
                          </p>
                        </div>
                        <Switch
                          id="randomize"
                          checked={form.randomize}
                          onCheckedChange={(checked) => updateForm('randomize', checked)}
                          className="ml-4"
                        />
                      </div>

                      <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="space-y-1">
                          <Label htmlFor="published" className="text-sm font-medium text-slate-700">Publish Immediately</Label>
                          <p className="text-sm text-slate-600">
                            Make this exam available to students right away after creation
                          </p>
                        </div>
                        <Switch
                          id="published"
                          checked={form.published}
                          onCheckedChange={(checked) => updateForm('published', checked)}
                          className="ml-4"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Import Questions */}
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-4">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">Questions</h3>
                      <p className="text-sm text-slate-600">Add questions to your examination</p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-slate-900">Import Questions</h4>
                          <p className="text-sm text-slate-600">Upload a text file with your questions</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowImportModal(true)}
                          className="bg-white hover:bg-slate-50 border-slate-300"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Import Questions
                        </Button>
                      </div>
                      {importedQuestions.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg border border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {importedQuestions.length} questions imported successfully
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-8 border-t border-slate-200">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !form.title.trim()}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Creating Exam...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Examination
                        </>
                      )}
                    </Button>
                    <Link href="/admin/exams">
                      <Button variant="outline" type="button" className="h-12 px-6 rounded-xl border-slate-300 hover:bg-slate-50">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-600">Use clear, descriptive titles that students can easily understand</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-600">Include detailed instructions in the description field</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-600">Allow 1-2 minutes per question for optimal timing</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-slate-600">Enable randomization to prevent cheating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Exam Preview */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900">Exam Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2">{form.title || 'Exam Title'}</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{form.durationMin} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{importedQuestions.length} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${form.published ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      <span>{form.published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Import Questions Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border-0 shadow-2xl">
          <DialogHeader className="pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl text-slate-900">Import Questions</DialogTitle>
                <DialogDescription className="text-slate-600">
                  Upload a text file with questions. Format each question with options A-D and mark the correct answer.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-gradient-to-br from-slate-50 to-white hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileImport}
                className="hidden"
                id="file-upload"
                disabled={isImporting}
              />
              <label htmlFor="file-upload" className={`cursor-pointer block ${isImporting ? 'opacity-50' : ''}`}>
                <div className="text-center">
                  {isImporting ? (
                    <div className="space-y-6">
                      <div className="mx-auto h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <div className="w-full max-w-sm mx-auto">
                        <div className="bg-slate-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-center mt-3 font-medium text-slate-700">{uploadProgress}%</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900 mb-2">
                          Click to upload questions
                        </p>
                        <p className="text-sm text-slate-600">
                          Supports .txt files only • Maximum file size: 10MB
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="mt-6">
                    <p className="text-lg font-medium text-slate-700">
                      {isImporting ? 'Processing your questions...' : 'Drag and drop or click to browse'}
                    </p>
                    {isImporting && (
                      <p className="text-sm text-slate-500 mt-1">
                        Please wait while we process your file
                      </p>
                    )}
                  </div>
                </div>
              </label>
            </div>
            
            {importError && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-800 font-medium">{importError}</p>
                </div>
              </div>
            )}
            
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Expected Format:
              </h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
{`1. What is the capital of France?
a) London
b) Berlin
c) Paris
d) Madrid
Correct Answer: C

2. Which planet is closest to the sun?
a) Venus
b) Mercury
c) Earth
d) Mars
Correct Answer: B

Supported formats:
- Options: a), b), c), d) or a., b., c., d.
- Answer: "Correct Answer: C" or "Answer: C"
- Separate questions with blank lines`}
              </pre>
            </div>
            
            {importedQuestions.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold">
                      Successfully imported {importedQuestions.length} questions
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Questions are ready to be added to your examination
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setImportedQuestions([])
                  setImportError('')
                }}
                disabled={importedQuestions.length === 0}
                className="rounded-xl border-slate-300 hover:bg-slate-50"
              >
                Clear Questions
              </Button>
              <Button 
                onClick={() => setShowImportModal(false)}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}