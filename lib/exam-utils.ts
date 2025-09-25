import { z } from 'zod'

// Validation schemas for exam creation and updates
export const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  durationMin: z.number().min(1, 'Duration must be at least 1 minute').max(600, 'Duration cannot exceed 10 hours'),
  randomize: z.boolean().default(true),
  published: z.boolean().default(false),
})

export const createQuestionSchema = z.object({
  type: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'NUMERIC']),
  text: z.string().min(1, 'Question text is required'),
  options: z.any().optional(), // Will be validated based on question type
  points: z.number().min(1, 'Points must be at least 1').max(50, 'Points cannot exceed 50'),
  order: z.number().default(0),
})

export const submitAnswerSchema = z.object({
  questionId: z.string().cuid(),
  answer: z.any(), // Can be string, number, or array depending on question type
  timeSpent: z.number().optional(), // Time spent on this question in seconds
})

export const examResultEventSchema = z.object({
  type: z.enum(['TAB_SWITCH', 'PASTE_ATTEMPT', 'COPY_ATTEMPT', 'WINDOW_BLUR', 'WINDOW_FOCUS', 'CAMERA_ERROR', 'FULLSCREEN_EXIT']),
  timestamp: z.string().datetime(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Type definitions
export type CreateExamInput = z.infer<typeof createExamSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>
export type ExamResultEvent = z.infer<typeof examResultEventSchema>

// MCQ Option type
export interface MCQOption {
  label: string
  text: string
  correct: boolean
}

// Exam result calculation utilities
export function calculateScore(answers: any, questions: any[]): { score: number; maxScore: number } {
  let score = 0
  let maxScore = 0

  questions.forEach(question => {
    maxScore += question.points
    const answer = answers[question.id]
    
    if (!answer) return

    switch (question.type) {
      case 'MCQ':
      case 'TRUE_FALSE':
        const correctOption = question.options?.find((opt: MCQOption) => opt.correct)
        if (correctOption && answer.answer === correctOption.label) {
          score += question.points
        }
        break
      
      case 'NUMERIC':
        const correctAnswer = question.options?.[0]?.correct_answer
        if (correctAnswer && Math.abs(parseFloat(answer.answer) - correctAnswer) < 0.01) {
          score += question.points
        }
        break
      
      case 'SHORT_ANSWER':
        // Short answers need manual grading, so we don't auto-score them
        break
    }
  })

  return { score, maxScore }
}

// Generate exam token for security
export function generateExamToken(examId: string, userId: string): string {
  const payload = {
    examId,
    userId,
    timestamp: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

// Verify exam token
export function verifyExamToken(token: string): { examId: string; userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const payload = JSON.parse(decoded)
    
    // Check if token is not older than 24 hours
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// Format time duration
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Calculate time remaining
export function getTimeRemaining(startTime: Date, durationMin: number): number {
  const elapsed = Date.now() - startTime.getTime()
  const total = durationMin * 60 * 1000
  return Math.max(0, total - elapsed)
}