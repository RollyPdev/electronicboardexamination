import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'
import { gradeExam } from '@/lib/grading'

// POST /api/student/exams/[id]/submit - Submit exam for grading
async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const body = await req.json()
      const { token } = body

      console.log('Submit exam request:', { examId: id, userId: authReq.user?.id })

      // Handle direct submission or verify exam token
      let tokenData = null
      if (token === 'direct-submit') {
        // Direct submission from exam details page
        tokenData = { examId: id, userId: authReq.user!.id }
      } else {
        // Regular token-based submission
        tokenData = verifyExamToken(token)
        if (!tokenData || tokenData.examId !== id) {
          console.error('Invalid token:', { tokenData, examId: id })
          return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
        }
      }

      // Ensure user exists
      const user = await (prisma as any).user.upsert({
        where: { email: authReq.user!.email },
        update: {},
        create: {
          id: authReq.user!.id,
          email: authReq.user!.email || 'student@example.com',
          name: authReq.user!.name || 'Student',
          role: 'STUDENT'
        }
      })

      // Verify token userId matches authenticated user
      if (tokenData.userId !== user.id) {
        console.error('Token user mismatch:', { tokenUserId: tokenData.userId, actualUserId: user.id })
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
      }

      // Get the exam result with exam and questions
      const examResult = await (prisma as any).examResult.findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: user.id,
          },
        },
        include: {
          exam: {
            include: {
              questions: {
                orderBy: { order: 'asc' }
              },
            },
          },
        },
      })

      if (!examResult) {
        console.error('Exam result not found:', { examId: id, userId: user.id })
        return NextResponse.json({ error: 'Exam result not found' }, { status: 404 })
      }
      
      // Validate that exam has questions
      if (!examResult.exam.questions || examResult.exam.questions.length === 0) {
        console.error('Exam has no questions:', { examId: id })
        return NextResponse.json({ error: 'Exam has no questions' }, { status: 400 })
      }

      console.log('Exam result found:', { id: examResult.id, status: examResult.status, answers: examResult.answers })

      // Check if already submitted
      if (examResult.status === 'SUBMITTED' || examResult.status === 'GRADED') {
        console.log('Exam already submitted, returning existing result')
        return NextResponse.json({
          message: 'Exam already submitted',
          resultId: examResult.id,
          score: examResult.score || 0,
          maxScore: examResult.maxScore || 0,
          percentage: examResult.maxScore ? Math.round((examResult.score || 0) / examResult.maxScore * 100) : 0,
          status: examResult.status,
          submittedAt: examResult.submittedAt || new Date(),
        })
      }

      if (examResult.status !== 'IN_PROGRESS') {
        console.error('Exam submission failed - status:', examResult.status, 'expected: IN_PROGRESS')
        return NextResponse.json({ 
          error: `Exam is not in progress. Current status: ${examResult.status}` 
        }, { status: 400 })
      }

      // Update status to SUBMITTED before grading
      await (prisma as any).examResult.update({
        where: { id: examResult.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
      })

      // Automatically grade the exam
      console.log('Starting automatic grading for exam result:', examResult.id)
      const gradingResult = await gradeExam(examResult.id)
      console.log('Grading completed:', gradingResult)

      return NextResponse.json({
        message: 'Exam submitted successfully',
        resultId: examResult.id,
        score: gradingResult.totalScore,
        maxScore: gradingResult.maxScore,
        percentage: gradingResult.percentage,
        status: gradingResult.needsManualReview ? 'SUBMITTED' : 'GRADED',
        submittedAt: new Date(),
        debug: {
          answersCount: Object.keys(examResult.answers || {}).length,
          questionsCount: examResult.exam.questions.length
        }
      })
    } catch (error) {
      console.error('Error submitting exam:', error)
      return NextResponse.json(
        { error: 'Failed to submit exam' },
        { status: 500 }
      )
    }
  })
}

export { POST }