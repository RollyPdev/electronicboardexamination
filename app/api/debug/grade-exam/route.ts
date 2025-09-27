import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gradeExam } from '@/lib/grading'

export async function POST(request: NextRequest) {
  try {
    const { examResultId } = await request.json()
    
    if (!examResultId) {
      return NextResponse.json({ error: 'examResultId is required' }, { status: 400 })
    }

    // Get the exam result
    const examResult = await (prisma as any).examResult.findUnique({
      where: { id: examResultId },
      include: {
        exam: {
          include: {
            questions: true
          }
        }
      }
    })

    if (!examResult) {
      return NextResponse.json({ error: 'Exam result not found' }, { status: 404 })
    }

    console.log('Manual grading request for:', {
      examResultId,
      status: examResult.status,
      answersCount: Object.keys(examResult.answers || {}).length,
      questionsCount: examResult.exam.questions.length
    })

    // Force grade the exam
    const gradingResult = await gradeExam(examResultId)

    return NextResponse.json({
      message: 'Exam graded successfully',
      gradingResult,
      examResult: {
        id: examResult.id,
        status: examResult.status,
        answers: examResult.answers,
        questionsCount: examResult.exam.questions.length
      }
    })
  } catch (error) {
    console.error('Manual grading error:', error)
    return NextResponse.json({ 
      error: 'Failed to grade exam',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}