import { 
  calculateScore, 
  generateExamToken, 
  verifyExamToken, 
  formatDuration, 
  getTimeRemaining 
} from '@/lib/exam-utils'
import { describe, it, expect } from 'vitest'

describe('Exam Utilities', () => {
  describe('calculateScore', () => {
    it('should calculate score for MCQ questions', () => {
      const answers = {
        q1: { answer: 'A' },
      }
      
      const questions = [
        {
          id: 'q1',
          type: 'MCQ',
          points: 5,
          options: [
            { label: 'A', text: 'Correct', correct: true },
            { label: 'B', text: 'Wrong', correct: false },
          ],
        },
      ]

      const result = calculateScore(answers, questions)
      expect(result.score).toBe(5)
      expect(result.maxScore).toBe(5)
    })

    it('should calculate score for TRUE_FALSE questions', () => {
      const answers = {
        q1: { answer: 'True' },
      }
      
      const questions = [
        {
          id: 'q1',
          type: 'TRUE_FALSE',
          points: 3,
          options: [{ correct: true }],
        },
      ]

      const result = calculateScore(answers, questions)
      expect(result.score).toBe(3)
      expect(result.maxScore).toBe(3)
    })

    it('should calculate score for NUMERIC questions', () => {
      const answers = {
        q1: { answer: '42.0' },
      }
      
      const questions = [
        {
          id: 'q1',
          type: 'NUMERIC',
          points: 4,
          options: [{ correct_answer: 42 }],
        },
      ]

      const result = calculateScore(answers, questions)
      expect(result.score).toBe(4)
      expect(result.maxScore).toBe(4)
    })

    it('should not auto-score SHORT_ANSWER questions', () => {
      const answers = {
        q1: { answer: 'This is a short answer' },
      }
      
      const questions = [
        {
          id: 'q1',
          type: 'SHORT_ANSWER',
          points: 10,
        },
      ]

      const result = calculateScore(answers, questions)
      expect(result.score).toBe(0)
      expect(result.maxScore).toBe(10)
    })
  })

  describe('Exam Tokens', () => {
    it('should generate and verify exam tokens', () => {
      const examId = 'exam-123'
      const userId = 'user-456'
      
      const token = generateExamToken(examId, userId)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      
      const decoded = verifyExamToken(token)
      expect(decoded).toBeDefined()
      expect(decoded?.examId).toBe(examId)
      expect(decoded?.userId).toBe(userId)
    })

    it('should return null for invalid tokens', () => {
      const invalidToken = 'invalid-token'
      const result = verifyExamToken(invalidToken)
      expect(result).toBeNull()
    })

    it('should return null for expired tokens', () => {
      // Create a token with an old timestamp
      const payload = {
        examId: 'exam-123',
        userId: 'user-456',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      }
      const oldToken = Buffer.from(JSON.stringify(payload)).toString('base64url')
      
      const result = verifyExamToken(oldToken)
      expect(result).toBeNull()
    })
  })

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30m')
      expect(formatDuration(90)).toBe('1h 30m')
      expect(formatDuration(150)).toBe('2h 30m')
    })
  })

  describe('getTimeRemaining', () => {
    it('should calculate remaining time correctly', () => {
      const startTime = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      const durationMin = 30 // 30 minutes total
      
      const remaining = getTimeRemaining(startTime, durationMin)
      // Should be approximately 20 minutes in milliseconds
      expect(remaining).toBeCloseTo(20 * 60 * 1000, -3) // Allow 1 second tolerance
    })

    it('should return 0 when time is expired', () => {
      const startTime = new Date(Date.now() - 40 * 60 * 1000) // 40 minutes ago
      const durationMin = 30 // 30 minutes total
      
      const remaining = getTimeRemaining(startTime, durationMin)
      expect(remaining).toBe(0)
    })
  })
})