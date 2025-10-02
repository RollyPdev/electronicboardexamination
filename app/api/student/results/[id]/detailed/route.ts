import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
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

    // Get exam result with detailed information
    const examResult = await (prisma as any).examResult.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        exam: {
          select: {
            title: true,
            description: true,
            durationMin: true,
            passingScore: true
          }
        },
        studentAnswers: {
          include: {
            question: {
              include: {
                choices: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: {
            question: { order: 'asc' }
          }
        }
      }
    })

    if (!examResult) {
      return NextResponse.json({ error: 'Exam result not found' }, { status: 404 })
    }

    // Calculate detailed results
    const totalQuestions = examResult.studentAnswers.length
    const correctAnswers = examResult.studentAnswers.filter((answer: any) => answer.isCorrect).length
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const passed = score >= (examResult.exam.passingScore || 60)

    // Format the response
    const detailedResults = {
      examId: examResult.examId,
      examTitle: examResult.exam.title,
      examDescription: examResult.exam.description,
      startedAt: examResult.startedAt,
      submittedAt: examResult.submittedAt,
      score: Math.round(score * 100) / 100,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      passed,
      passingScore: examResult.exam.passingScore || 60,
      questions: examResult.studentAnswers.map((answer: any) => ({
        id: answer.question.id,
        text: answer.question.text,
        type: answer.question.type,
        choices: answer.question.choices.map((choice: any) => ({
          id: choice.id,
          label: choice.label,
          text: choice.text,
          isCorrect: choice.isCorrect
        })),
        studentAnswer: answer.selectedChoice,
        correctAnswer: answer.question.correctAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        points: answer.question.points || 1
      }))
    }

    return NextResponse.json(detailedResults)

  } catch (error) {
    console.error('Error fetching detailed results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detailed results' },
      { status: 500 }
    )
  }
}