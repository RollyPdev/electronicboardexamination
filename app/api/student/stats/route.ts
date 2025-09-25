import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const userId = authReq.user!.id

      const examResults = await (prisma as any).examResult.findMany({
        where: {
          userId,
          status: 'GRADED',
          score: { not: null },
        },
        include: {
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
      })

      const totalExams = await (prisma as any).exam.count({
        where: { published: true },
      })

      const completedExams = examResults.length
      const totalScore = examResults.reduce((sum: any, result: any) => sum + (result.score || 0), 0)
      const maxPossibleScore = examResults.reduce((sum: any, result: any) => sum + (result.maxScore || 0), 0)
      const averageScore = completedExams > 0 ? totalScore / completedExams : 0
      const averagePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0

      const bestResult = examResults.reduce((best: any, current: any) => {
        const currentPercentage = (current.maxScore || 0) > 0 ? ((current.score || 0) / (current.maxScore || 1)) * 100 : 0
        const bestPercentage = best ? ((best.score || 0) / (best.maxScore || 1)) * 100 : 0
        return currentPercentage > bestPercentage ? current : best
      }, null as typeof examResults[0] | null)

      const bestScore = bestResult?.score || 0
      const bestPercentage = bestResult && (bestResult.maxScore || 0) > 0 
        ? Math.round(((bestResult.score || 0) / (bestResult.maxScore || 1)) * 100) 
        : 0

      const userAvgStats = await (prisma as any).examResult.groupBy({
        by: ['userId'],
        where: {
          status: 'GRADED',
          score: { not: null },
        },
        _avg: {
          score: true,
        },
        having: {
          score: {
            _avg: {
              gt: averageScore,
            },
          },
        },
      })

      const rank = userAvgStats.length + 1

      const totalStudents = await (prisma as any).user.count({
        where: {
          role: 'STUDENT',
          examsTaken: {
            some: {
              status: 'GRADED',
              score: { not: null },
            },
          },
        },
      })

      const recentExams = examResults.slice(0, 5).map((result: any) => {
        const percentage = (result.maxScore || 0) > 0 
          ? Math.round(((result.score || 0) / (result.maxScore || 1)) * 100) 
          : 0

        return {
          id: result.exam.id,
          title: result.exam.title,
          score: result.score || 0,
          maxScore: result.maxScore || 0,
          percentage,
          submittedAt: result.submittedAt?.toISOString() || '',
        }
      })

      return NextResponse.json({
        totalExams,
        completedExams,
        averageScore: Math.round(averageScore * 100) / 100,
        totalScore,
        maxPossibleScore,
        averagePercentage,
        bestScore,
        bestPercentage,
        rank: completedExams > 0 ? rank : null,
        totalStudents,
        recentExams,
      })
    } catch (error) {
      console.error('Error fetching student stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      )
    }
  })
}

export { GET }