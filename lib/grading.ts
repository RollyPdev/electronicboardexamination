import { prisma } from './prisma'

export interface GradingResult {
  questionId: string
  points: number
  maxPoints: number
  isCorrect: boolean
  feedback?: string
}

export interface ExamGradingResult {
  examResultId: string
  totalScore: number
  maxScore: number
  percentage: number
  questionResults: GradingResult[]
  needsManualReview: boolean
}

/**
 * Grade a single question answer
 */
export function gradeQuestion(
  question: any,
  answer: any
): GradingResult {
  let isCorrect = false
  let feedback = ''

  switch (question.type) {
    case 'MCQ':
      const options = Array.isArray(question.options) ? question.options : []
      const correctOption = options.find((opt: any) => opt.correct)
      isCorrect = correctOption && answer.answer === correctOption.label
      if (!isCorrect) {
        feedback = correctOption 
          ? `Correct answer: ${correctOption.label}) ${correctOption.text}`
          : 'No correct answer defined'
      }
      break

    case 'TRUE_FALSE':
      const tfOptions = Array.isArray(question.options) ? question.options : []
      const correctAnswer = tfOptions[0]?.correct
      isCorrect = answer.answer === (correctAnswer ? 'True' : 'False')
      if (!isCorrect) {
        feedback = `Correct answer: ${correctAnswer ? 'True' : 'False'}`
      }
      break

    case 'NUMERIC':
      const numOptions = Array.isArray(question.options) ? question.options : []
      const correctValue = numOptions[0]?.correct_answer
      const tolerance = numOptions[0]?.tolerance || 0.01
      if (correctValue !== undefined && answer.answer !== undefined) {
        const numericAnswer = parseFloat(answer.answer)
        const numericCorrect = parseFloat(correctValue)
        isCorrect = Math.abs(numericAnswer - numericCorrect) <= tolerance
        if (!isCorrect) {
          feedback = `Correct answer: ${numericCorrect}`
        }
      }
      break

    case 'SHORT_ANSWER':
      // Short answer questions need manual review
      feedback = 'This question requires manual grading'
      break

    default:
      feedback = 'Unknown question type'
  }

  return {
    questionId: question.id,
    points: isCorrect ? question.points : 0,
    maxPoints: question.points,
    isCorrect,
    feedback,
  }
}

/**
 * Auto-grade an entire exam
 */
export async function gradeExam(examResultId: string): Promise<ExamGradingResult> {
  // Get the exam result with questions and answers
  const examResult = await (prisma as any).examResult.findUnique({
    where: { id: examResultId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!examResult) {
    throw new Error('Exam result not found')
  }

  const answers = examResult.answers as Record<string, any>
  const questionResults: GradingResult[] = []
  let totalScore = 0
  let maxScore = 0
  let needsManualReview = false

  // Grade each question
  for (const question of examResult.exam.questions) {
    maxScore += question.points
    const answer = answers[question.id]

    if (!answer) {
      // No answer provided
      questionResults.push({
        questionId: question.id,
        points: 0,
        maxPoints: question.points,
        isCorrect: false,
        feedback: 'No answer provided',
      })
      continue
    }

    const result = gradeQuestion(question, answer)
    questionResults.push(result)
    totalScore += result.points

    // Check if manual review is needed
    if (question.type === 'SHORT_ANSWER') {
      needsManualReview = true
    }
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0

  // Update the exam result with scores
  await (prisma as any).examResult.update({
    where: { id: examResultId },
    data: {
      score: totalScore,
      maxScore,
      status: needsManualReview ? 'SUBMITTED' : 'GRADED',
      gradedAt: needsManualReview ? null : new Date(),
    },
  })

  return {
    examResultId,
    totalScore,
    maxScore,
    percentage,
    questionResults,
    needsManualReview,
  }
}

/**
 * Grade all pending exam results
 */
export async function gradeAllPending(): Promise<ExamGradingResult[]> {
  const pendingResults = await (prisma as any).examResult.findMany({
    where: {
      status: 'SUBMITTED',
      gradedAt: null,
    },
    include: {
      exam: {
        include: {
          questions: true,
        },
      },
    },
  })

  const results: ExamGradingResult[] = []

  for (const examResult of pendingResults) {
    try {
      const gradingResult = await gradeExam(examResult.id)
      results.push(gradingResult)
    } catch (error) {
      console.error(`Failed to grade exam result ${examResult.id}:`, error)
    }
  }

  return results
}

/**
 * Generate detailed feedback for an exam result
 */
export async function generateExamFeedback(examResultId: string): Promise<{
  overallFeedback: string
  questionFeedback: Array<{
    questionId: string
    questionText: string
    userAnswer: string
    correctAnswer: string
    feedback: string
    points: number
    maxPoints: number
  }>
}> {
  const examResult = await (prisma as any).examResult.findUnique({
    where: { id: examResultId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!examResult) {
    throw new Error('Exam result not found')
  }

  const answers = examResult.answers as Record<string, any>
  const questionFeedback = []
  let correctCount = 0

  for (const question of examResult.exam.questions) {
    const answer = answers[question.id]
    const gradingResult = gradeQuestion(question, answer)
    
    if (gradingResult.isCorrect) {
      correctCount++
    }

    let correctAnswerText = ''
    let userAnswerText = answer?.answer || 'No answer provided'

    switch (question.type) {
      case 'MCQ':
        const mcqOptions = Array.isArray(question.options) ? question.options : []
        const correctOption = mcqOptions.find((opt: any) => opt.correct)
        correctAnswerText = correctOption 
          ? `${correctOption.label}) ${correctOption.text}`
          : 'No correct answer defined'
        
        const userOption = mcqOptions.find((opt: any) => opt.label === answer?.answer)
        userAnswerText = userOption
          ? `${userOption.label}) ${userOption.text}`
          : answer?.answer || 'No answer provided'
        break

      case 'TRUE_FALSE':
        const tfFeedbackOptions = Array.isArray(question.options) ? question.options : []
        const correctBool = tfFeedbackOptions[0]?.correct
        correctAnswerText = correctBool ? 'True' : 'False'
        break

      case 'NUMERIC':
        const numFeedbackOptions = Array.isArray(question.options) ? question.options : []
        correctAnswerText = numFeedbackOptions[0]?.correct_answer?.toString() || 'No correct answer defined'
        break

      case 'SHORT_ANSWER':
        correctAnswerText = 'Manually graded'
        break
    }

    questionFeedback.push({
      questionId: question.id,
      questionText: question.text,
      userAnswer: userAnswerText,
      correctAnswer: correctAnswerText,
      feedback: gradingResult.feedback || '',
      points: gradingResult.points,
      maxPoints: gradingResult.maxPoints,
    })
  }

  const percentage = examResult.maxScore && examResult.maxScore > 0 
    ? Math.round((examResult.score! / examResult.maxScore) * 100) 
    : 0

  let overallFeedback = `You scored ${examResult.score}/${examResult.maxScore} points (${percentage}%). `
  overallFeedback += `You answered ${correctCount} out of ${examResult.exam.questions.length} questions correctly. `

  if (percentage >= 90) {
    overallFeedback += 'Excellent work! You demonstrated outstanding mastery of the material.'
  } else if (percentage >= 80) {
    overallFeedback += 'Great job! You have a strong understanding of the material.'
  } else if (percentage >= 70) {
    overallFeedback += 'Good work! Review the areas where you missed questions to improve further.'
  } else if (percentage >= 60) {
    overallFeedback += 'You passed, but consider reviewing the material to strengthen your understanding.'
  } else {
    overallFeedback += 'You may want to review the material and retake the exam if possible.'
  }

  return {
    overallFeedback,
    questionFeedback,
  }
}