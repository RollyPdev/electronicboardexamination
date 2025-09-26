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

      // If token is provided, verify it and get exam result ID
      let examResultId: string | null = null
      if (token) {
        const tokenData = verifyExamToken(token)
        if (tokenData && tokenData.examId === id && tokenData.userId === user.id) {
          // Find the exam result for this user and exam
          const examResult = await (prisma as any).examResult.findUnique({
            where: {
              examId_userId: {
                examId: id,
                userId: user.id,
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
            where: { userId: user.id },
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
      const sanitizedQuestions = exam.questions.map((question: any) => {
        let sanitizedOptions = null
        
        if (question.options) {
          try {
            let options = question.options
            
            // Parse if it's a JSON string
            if (typeof options === 'string') {
              options = JSON.parse(options)
            }
            
            // Handle array of options - ONLY return text strings
            if (Array.isArray(options)) {
              sanitizedOptions = options.map((option: any, index: number) => {
                if (typeof option === 'string') {
                  return option
                } else if (option && typeof option === 'object' && option.text) {
                  return String(option.text) // Convert to string only
                }
                return `Option ${String.fromCharCode(65 + index)}`
              })
            }
          } catch (e) {
            console.error('Error sanitizing options for question:', question.id, e)
            sanitizedOptions = []
          }
        }
        
        return {
          id: question.id,
          type: question.type,
          text: question.text,
          points: question.points,
          order: question.order,
          options: sanitizedOptions
        }
      })

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