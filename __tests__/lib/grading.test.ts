import { gradeQuestion, gradeExam } from '@/lib/grading'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
const mockPrisma = {
  examResult: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Grading System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('gradeQuestion', () => {
    it('should correctly grade MCQ questions', () => {
      const question = {
        id: '1',
        type: 'MCQ',
        points: 5,
        options: [
          { label: 'A', text: 'Option A', correct: false },
          { label: 'B', text: 'Option B', correct: true },
          { label: 'C', text: 'Option C', correct: false },
        ],
      }

      // Correct answer
      const correctAnswer = { answer: 'B' }
      const correctResult = gradeQuestion(question, correctAnswer)
      expect(correctResult.points).toBe(5)
      expect(correctResult.isCorrect).toBe(true)
      expect(correctResult.feedback).toBe('')

      // Incorrect answer
      const incorrectAnswer = { answer: 'A' }
      const incorrectResult = gradeQuestion(question, incorrectAnswer)
      expect(incorrectResult.points).toBe(0)
      expect(incorrectResult.isCorrect).toBe(false)
      expect(incorrectResult.feedback).toBe('Correct answer: B) Option B')
    })

    it('should correctly grade TRUE_FALSE questions', () => {
      const question = {
        id: '2',
        type: 'TRUE_FALSE',
        points: 3,
        options: [{ correct: true }],
      }

      // Correct answer
      const correctAnswer = { answer: 'True' }
      const correctResult = gradeQuestion(question, correctAnswer)
      expect(correctResult.points).toBe(3)
      expect(correctResult.isCorrect).toBe(true)

      // Incorrect answer
      const incorrectAnswer = { answer: 'False' }
      const incorrectResult = gradeQuestion(question, incorrectAnswer)
      expect(incorrectResult.points).toBe(0)
      expect(incorrectResult.isCorrect).toBe(false)
      expect(incorrectResult.feedback).toBe('Correct answer: True')
    })

    it('should correctly grade NUMERIC questions', () => {
      const question = {
        id: '3',
        type: 'NUMERIC',
        points: 4,
        options: [{ correct_answer: '42', tolerance: 0.1 }],
      }

      // Correct answer within tolerance
      const correctAnswer = { answer: '42.05' }
      const correctResult = gradeQuestion(question, correctAnswer)
      expect(correctResult.points).toBe(4)
      expect(correctResult.isCorrect).toBe(true)

      // Incorrect answer
      const incorrectAnswer = { answer: '50' }
      const incorrectResult = gradeQuestion(question, incorrectAnswer)
      expect(incorrectResult.points).toBe(0)
      expect(incorrectResult.isCorrect).toBe(false)
      expect(incorrectResult.feedback).toBe('Correct answer: 42')
    })

    it('should mark SHORT_ANSWER questions for manual review', () => {
      const question = {
        id: '4',
        type: 'SHORT_ANSWER',
        points: 10,
      }

      const answer = { answer: 'This is a short answer' }
      const result = gradeQuestion(question, answer)
      expect(result.points).toBe(0)
      expect(result.isCorrect).toBe(false)
      expect(result.feedback).toBe('This question requires manual grading')
    })
  })

  describe('gradeExam', () => {
    it('should grade an entire exam and calculate total score', async () => {
      const examResult = {
        id: 'exam-result-1',
        answers: {
          'q1': { answer: 'B' },
          'q2': { answer: 'True' },
          'q3': { answer: '42' },
          'q4': { answer: 'Short answer text' },
        },
        exam: {
          questions: [
            {
              id: 'q1',
              type: 'MCQ',
              points: 5,
              options: [
                { label: 'A', text: 'Wrong', correct: false },
                { label: 'B', text: 'Correct', correct: true },
              ],
            },
            {
              id: 'q2',
              type: 'TRUE_FALSE',
              points: 3,
              options: [{ correct: true }],
            },
            {
              id: 'q3',
              type: 'NUMERIC',
              points: 4,
              options: [{ correct_answer: '42', tolerance: 0.1 }],
            },
            {
              id: 'q4',
              type: 'SHORT_ANSWER',
              points: 10,
            },
          ],
        },
      }

      mockPrisma.examResult.findUnique.mockResolvedValue(examResult)
      mockPrisma.examResult.update.mockResolvedValue({})

      const result = await gradeExam('exam-result-1')
      
      expect(result.totalScore).toBe(12) // 5 + 3 + 4 + 0
      expect(result.maxScore).toBe(22) // 5 + 3 + 4 + 10
      expect(result.percentage).toBe(55) // (12/22)*100 = 54.5% ≈ 55%
      expect(result.needsManualReview).toBe(true)
      expect(result.questionResults).toHaveLength(4)
    })

    it('should not require manual review for exams with only auto-gradable questions', async () => {
      const examResult = {
        id: 'exam-result-2',
        answers: {
          'q1': { answer: 'B' },
          'q2': { answer: 'True' },
        },
        exam: {
          questions: [
            {
              id: 'q1',
              type: 'MCQ',
              points: 5,
              options: [
                { label: 'A', text: 'Wrong', correct: false },
                { label: 'B', text: 'Correct', correct: true },
              ],
            },
            {
              id: 'q2',
              type: 'TRUE_FALSE',
              points: 3,
              options: [{ correct: true }],
            },
          ],
        },
      }

      mockPrisma.examResult.findUnique.mockResolvedValue(examResult)
      mockPrisma.examResult.update.mockResolvedValue({})

      const result = await gradeExam('exam-result-2')
      
      expect(result.needsManualReview).toBe(false)
    })
  })
})