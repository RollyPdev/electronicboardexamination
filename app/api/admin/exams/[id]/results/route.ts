import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { gradeExam } from '@/lib/grading'

// GET /api/admin/exams/[id]/results - Get exam results for grading
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = await params
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const status = url.searchParams.get('status') || 'SUBMITTED'

      const whereClause = {
        examId: id,
        status: status === 'ALL' ? undefined : status,
      }

      const [results, total] = await Promise.all([
        ((prisma as any).examResult as any).findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ((prisma as any).examResult as any).count({ where: whereClause }),
      ])

      return NextResponse.json({
        results: results.map((result: any) => ({
          id: result.id,
          userId: result.userId,
          userName: result.user.name,
          userEmail: result.user.email,
          examId: result.examId,
          examTitle: result.exam.title,
          status: result.status,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.maxScore ? Math.round((result.score! / result.maxScore) * 100) : 0,
          submittedAt: result.submittedAt,
          gradedAt: result.gradedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching exam results:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exam results' },
        { status: 500 }
      )
    }
  })
}

// POST /api/admin/exams/[id]/results - Manually grade an exam
async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = await params
      const body = await req.json()
      const { resultId, questionGrades, overallFeedback } = body

      // Validate input
      if (!resultId || !questionGrades || typeof questionGrades !== 'object') {
        return NextResponse.json(
          { error: 'Result ID and question grades are required' },
          { status: 400 }
        )
      }

      // Get the exam result
      const examResult = await ((prisma as any).examResult as any).findUnique({
        where: { id: resultId },
        include: {
          exam: {
            include: {
              questions: true,
            },
          },
        },
      })

      if (!examResult) {
        return NextResponse.json(
          { error: 'Exam result not found' },
          { status: 404 }
        )
      }

      if (examResult.examId !== id) {
        return NextResponse.json(
          { error: 'Exam result does not belong to this exam' },
          { status: 400 }
        )
      }

      if (examResult.status !== 'SUBMITTED') {
        return NextResponse.json(
          { error: 'Exam result is not ready for manual grading' },
          { status: 400 }
        )
      }

      // Process manual grades
      const answers = examResult.answers as Record<string, any>
      let totalScore = 0
      let maxScore = 0

      // Calculate scores for all questions
      for (const question of examResult.exam.questions) {
        maxScore += question.points
        const answer = answers[question.id]

        if (question.type === 'SHORT_ANSWER') {
          // Use manual grade for short answer questions
          const manualGrade = questionGrades[question.id]
          if (manualGrade !== undefined && manualGrade >= 0 && manualGrade <= question.points) {
            totalScore += manualGrade
          } else if (answer) {
            // If no manual grade provided, use automatic grading
            const gradingResult = await gradeExam(examResult.id) // This will use the existing logic
            // For now, we'll just use 0 points for ungraded short answers
            totalScore += 0
          }
        } else {
          // For auto-gradable questions, use existing scores
          const gradingResult = await gradeExam(examResult.id)
          const questionResult = gradingResult.questionResults.find((q: any) => q.questionId === question.id)
          if (questionResult) {
            totalScore += questionResult.points
          }
        }
      }

      // Update exam result with manual grades
      const updatedResult = await ((prisma as any).examResult as any).update({
        where: { id: resultId },
        data: {
          score: totalScore,
          maxScore,
          status: 'GRADED',
          gradedAt: new Date(),
          feedback: overallFeedback || '',
        },
      })

      return NextResponse.json({
        message: 'Exam graded successfully',
        resultId: updatedResult.id,
        score: updatedResult.score,
        maxScore: updatedResult.maxScore,
        percentage: updatedResult.maxScore ? Math.round((updatedResult.score! / updatedResult.maxScore) * 100) : 0,
        status: updatedResult.status,
        gradedAt: updatedResult.gradedAt,
      })
    } catch (error) {
      console.error('Error grading exam:', error)
      return NextResponse.json(
        { error: 'Failed to grade exam' },
        { status: 500 }
      )
    }
  })
}

export { GET, POST }