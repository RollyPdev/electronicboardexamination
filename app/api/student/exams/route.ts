import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/student/exams - List published exams for students
async function GET(req: NextRequest) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { searchParams } = new URL(authReq.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const skip = (page - 1) * limit

      // Get published exams with student's results
      const [exams, total] = await Promise.all([
        (prisma as any).exam.findMany({
          where: { published: true },
          include: {
            questions: { select: { id: true, points: true } },
            results: {
              where: { userId: authReq.user!.id },
              select: {
                id: true,
                status: true,
                score: true,
                maxScore: true,
                submittedAt: true,
                startedAt: true,
              },
            },
            _count: {
              select: { questions: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        (prisma as any).exam.count({ where: { published: true } }),
      ])

      // Calculate max score for each exam and format response
      const formattedExams = exams.map((exam: any) => {
        const maxScore = exam.questions.reduce((sum: any, q: any) => sum + q.points, 0)
        const result = exam.results[0] // Student can only have one result per exam
        
        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          durationMin: exam.durationMin,
          questionCount: exam._count.questions,
          maxScore,
          result: result || null,
          canTake: !result || result.status === 'IN_PROGRESS',
          createdAt: exam.createdAt,
        }
      })

      return NextResponse.json({
        exams: formattedExams,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching student exams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exams' },
        { status: 500 }
      )
    }
  })
}

export { GET }