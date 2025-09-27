import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all exam results with user and exam details
    const examResults = await (prisma as any).examResult.findMany({
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            questions: {
              select: {
                id: true,
                points: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Process results to show key information
    const processedResults = examResults.map((result: any) => {
      const totalPossibleScore = result.exam.questions.reduce((sum: number, q: any) => sum + q.points, 0)
      const answersCount = result.answers ? Object.keys(result.answers).length : 0
      
      return {
        id: result.id,
        examTitle: result.exam.title,
        studentName: result.user.name,
        studentEmail: result.user.email,
        status: result.status,
        score: result.score,
        maxScore: result.maxScore,
        calculatedMaxScore: totalPossibleScore,
        answersCount,
        questionsCount: result.exam.questions.length,
        percentage: result.score && result.maxScore ? Math.round((result.score / result.maxScore) * 100) : null,
        startedAt: result.startedAt,
        submittedAt: result.submittedAt,
        gradedAt: result.gradedAt,
        hasAnswers: !!result.answers && Object.keys(result.answers).length > 0,
        answers: result.answers
      }
    })

    // Get summary statistics
    const statusCounts = examResults.reduce((acc: any, result: any) => {
      acc[result.status] = (acc[result.status] || 0) + 1
      return acc
    }, {})

    const gradedResults = examResults.filter((r: any) => r.status === 'GRADED')
    const submittedResults = examResults.filter((r: any) => r.status === 'SUBMITTED')
    const inProgressResults = examResults.filter((r: any) => r.status === 'IN_PROGRESS')

    return NextResponse.json({
      totalResults: examResults.length,
      statusCounts,
      summary: {
        graded: gradedResults.length,
        submitted: submittedResults.length,
        inProgress: inProgressResults.length,
        withScores: examResults.filter((r: any) => r.score !== null).length,
        withoutScores: examResults.filter((r: any) => r.score === null).length
      },
      results: processedResults
    })
  } catch (error) {
    console.error('Error checking results:', error)
    return NextResponse.json({ 
      error: 'Failed to check results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}