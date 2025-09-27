import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gradeQuestion } from '@/lib/grading'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await (prisma as any).examResult.findFirst({
      where: { 
        id: id,
        userId: user.id
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    const answers = result.answers as any || {}
    const questionsWithAnswers = result.exam.questions.map((question: any) => {
      const studentAnswer = answers[question.id]?.answer || null
      const gradingResult = gradeQuestion(question, answers[question.id] || { answer: null })
      
      // Get correct answer text for display
      let correctAnswerText = ''
      if (question.type === 'MCQ' || question.type === 'TRUE_FALSE') {
        const correctOption = question.options?.find((opt: any) => opt.correct)
        correctAnswerText = correctOption ? correctOption.text : 'No correct answer defined'
      } else if (question.type === 'NUMERIC') {
        correctAnswerText = question.options?.[0]?.correct_answer?.toString() || 'No correct answer defined'
      } else if (question.type === 'SHORT_ANSWER') {
        correctAnswerText = 'Manually graded'
      }
      
      return {
        id: question.id,
        type: question.type,
        text: question.text,
        options: question.options,
        points: question.points,
        order: question.order,
        studentAnswer,
        correctAnswer: correctAnswerText,
        isCorrect: gradingResult.isCorrect,
        pointsEarned: gradingResult.points,
        feedback: gradingResult.feedback
      }
    })

    const detailedResult = {
      id: result.id,
      examId: result.examId,
      examTitle: result.exam.title,
      examDescription: result.exam.description,
      durationMin: result.exam.durationMin,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.score && result.maxScore ? (result.score / result.maxScore) * 100 : null,
      status: result.status,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      gradedAt: result.gradedAt,
      questions: questionsWithAnswers
    }

    return NextResponse.json({ result: detailedResult })
  } catch (error) {
    console.error('Error fetching result details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}