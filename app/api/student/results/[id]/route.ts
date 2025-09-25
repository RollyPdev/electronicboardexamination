import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const result = await (prisma as any).examResult.findFirst({
      where: { 
        id: id,
        userId: user.id
      },
      include: {
        exam: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    const answers = result.answers as any || {}
    const questionsWithAnswers = result.exam.questions.map((question: any) => ({
      id: question.id,
      type: question.type,
      text: question.text,
      options: question.options,
      points: question.points,
      order: question.order,
      studentAnswer: answers[question.id] || null
    }))

    const detailedResult = {
      id: result.id,
      examId: result.examId,
      examTitle: result.exam.title,
      examDescription: result.exam.description,
      durationMin: result.exam.durationMin,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.score && result.maxScore ? (result.score / result.maxScore) * 100 : null,
      status: result.status,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      gradedAt: result.gradedAt,
      questions: questionsWithAnswers
    }

    return NextResponse.json({ result: detailedResult })
  } catch (error) {
    console.error('Error fetching result details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}