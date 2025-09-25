import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'

// GET /api/student/exams/[id] - Get exam details for student (without correct answers)
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const url = new URL(req.url)
      const token = url.searchParams.get('token')
      
      // If token is provided, verify it and get exam result ID
      let examResultId: string | null = null
      if (token) {
        const tokenData = verifyExamToken(token)
        if (tokenData && tokenData.examId === id && tokenData.userId === authReq.user!.id) {
          // Find the exam result for this user and exam
          const examResult = await (prisma as any).examResult.findUnique({
            where: {
              examId_userId: {
                examId: id,
                userId: authReq.user!.id,
              },
            },
          })
          examResultId = examResult?.id || null
        }
      }
      const exam = await (prisma as any).exam.findUnique({
        where: { id, published: true },
        include: {
          questions: {
            select: {
              id: true,
              type: true,
              text: true,
              points: true,
              order: true,
              // Include options but filter out correct answers for students
              options: true,
            },
            orderBy: { order: 'asc' },
          },
          results: {
            where: { userId: authReq.user!.id },
            select: {
              id: true,
              status: true,
              startedAt: true,
              submittedAt: true,
              score: true,
              maxScore: true,
            },
          },
        },
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Filter out correct answers from options for students
      const sanitizedQuestions = exam.questions.map((question: any) => ({
        ...question,
        options: question.options ? 
          (Array.isArray(question.options) ? 
            question.options.map((option: any) => ({
              label: option.label,
              text: option.text,
              // Remove correct field
            })) : 
            question.options
          ) : null,
      }))

      const result = exam.results[0]
      const maxScore = exam.questions.reduce((sum: any, q: any) => sum + q.points, 0)

      return NextResponse.json({
        id: exam.id,
        title: exam.title,
        description: exam.description,
        durationMin: exam.durationMin,
        randomize: exam.randomize,
        questions: sanitizedQuestions,
        questionCount: exam.questions.length,
        maxScore,
        result: result || null,
        canTake: !result || result.status === 'IN_PROGRESS',
        examResultId, // Include examResultId when token is provided
      })
    } catch (error) {
      console.error('Error fetching exam:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exam' },
        { status: 500 }
      )
    }
  })
}

export { GET }