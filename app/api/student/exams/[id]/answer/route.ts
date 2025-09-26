import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken, submitAnswerSchema } from '@/lib/exam-utils'

// PATCH /api/student/exams/[id]/answer - Save/update answer for a question
async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const body = await req.json()
      const { questionId, answer, timeSpent, token } = body

      // Verify exam token
      const tokenData = verifyExamToken(token)
      if (!tokenData || tokenData.examId !== id) {
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
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
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
      }

      // Validate input
      const validatedData = submitAnswerSchema.parse({ questionId, answer, timeSpent })

      // Get the exam result
      const examResult = await ((prisma as any).examResult as any).findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: user.id,
          },
        },
      })

      if (!examResult) {
        return NextResponse.json({ error: 'Exam result not found' }, { status: 404 })
      }

      if (examResult.status !== 'IN_PROGRESS') {
        return NextResponse.json({ error: 'Exam is not in progress' }, { status: 400 })
      }

      // Verify question belongs to the exam
      const question = await ((prisma as any).question as any).findFirst({
        where: { id: questionId, examId: id },
      })

      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }

      // Update answers in the exam result
      const currentAnswers = examResult.answers as any || {}
      currentAnswers[questionId] = {
        answer: validatedData.answer,
        timeSpent: validatedData.timeSpent,
        submittedAt: new Date().toISOString(),
      }

      await ((prisma as any).examResult as any).update({
        where: { id: examResult.id },
        data: {
          answers: currentAnswers,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({ 
        message: 'Answer saved successfully',
        questionId,
      })
    } catch (error) {
      console.error('Error saving answer:', error)
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: (error as any).errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      )
    }
  })
}

export { PATCH }