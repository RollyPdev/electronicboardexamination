import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'

export async function POST(
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
      if (!tokenData || tokenData.examId !== id) {
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
      }

      const user = await (prisma as any).user.findUnique({
        where: { email: authReq.user!.email }
      })

      if (!user || tokenData.userId !== user.id) {
        return NextResponse.json({ error: 'Invalid exam token' }, { status: 401 })
      }

      // Get the exam result
      const examResult = await (prisma as any).examResult.findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: user.id,
          },
        },
        include: {
          studentAnswers: true,
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

      if (examResult.status !== 'IN_PROGRESS') {
        return NextResponse.json({ error: 'Exam already submitted' }, { status: 400 })
      }

      // Calculate score based on StudentAnswer records
      const totalQuestions = examResult.exam.questions.length
      const correctAnswers = examResult.studentAnswers.filter((answer: any) => answer.isCorrect).length
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      const maxScore = totalQuestions * 1 // Assuming 1 point per question

      // Update exam result
      const updatedResult = await (prisma as any).examResult.update({
        where: { id: examResult.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          gradedAt: new Date(),
          score: correctAnswers,
          maxScore: maxScore
        }
      })

      return NextResponse.json({
        message: 'Exam submitted successfully',
        resultId: updatedResult.id,
        score: correctAnswers,
        maxScore: maxScore,
        percentage: Math.round(score * 100) / 100
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