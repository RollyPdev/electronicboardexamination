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

      // Verify exam token
      const tokenData = verifyExamToken(token)
      if (!tokenData || tokenData.examId !== id || tokenData.userId !== authReq.user!.id) {
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
      }

      // Get the exam result with exam and questions
      const examResult = await (prisma as any).examResult.findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: authReq.user!.id,
          },
        },
        include: {
          exam: {
            include: {
              questions: true,
            },
          },
        },
      })

      if (!examResult) {
        return NextResponse.json({ error: 'Exam result not found' }, { status: 404 })
      }

      if (examResult.status !== 'IN_PROGRESS') {
        return NextResponse.json({ error: 'Exam is not in progress' }, { status: 400 })
      }

      // Automatically grade the exam
      const gradingResult = await gradeExam(examResult.id)

      return NextResponse.json({
        message: 'Exam submitted successfully',
        resultId: examResult.id,
        score: gradingResult.totalScore,
        maxScore: gradingResult.maxScore,
        percentage: gradingResult.percentage,
        status: gradingResult.needsManualReview ? 'SUBMITTED' : 'GRADED',
        submittedAt: new Date(),
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