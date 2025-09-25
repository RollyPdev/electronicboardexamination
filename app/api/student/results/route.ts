import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await ((prisma as any).user as any).findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const results = await ((prisma as any).examResult as any).findMany({
      where: { userId: user.id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            durationMin: true,
            questions: {
              select: { points: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    const formattedResults = results.map((result: any) => ({
      id: result.id,
      examId: result.examId,
      examTitle: result.exam.title,
      examDescription: result.exam.description,
      durationMin: result.exam.durationMin,
      questionCount: result.exam.questions.length,
      maxScore: result.exam.questions.reduce((sum: any, q: any) => sum + q.points, 0),
      score: result.score,
      percentage: result.score && result.maxScore ? (result.score / result.maxScore) * 100 : null,
      status: result.status,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      gradedAt: result.gradedAt
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error('Error fetching student results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}