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

    const user = await (prisma as any).user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const results = await (prisma as any).examResult.findMany({
      where: { 
        userId: user.id,
        status: 'GRADED',
        score: { not: null }
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            durationMin: true,
            questions: {
              select: { points: true }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    })

    const totalExams = results.length
    const totalScore = results.reduce((sum: any, r: any) => sum + (r.score || 0), 0)
    const totalMaxScore = results.reduce((sum: any, r: any) => sum + (r.maxScore || 0), 0)
    const averageScore = totalExams > 0 ? totalScore / totalExams : 0
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    const bestScore = results.length > 0 ? Math.max(...results.map((r: any) => r.maxScore ? (r.score! / r.maxScore) * 100 : 0)) : 0
    const worstScore = results.length > 0 ? Math.min(...results.map((r: any) => r.maxScore ? (r.score! / r.maxScore) * 100 : 0)) : 0

    const recentResults = results.slice(0, 10).map((result: any) => ({
      id: result.id,
      examTitle: result.exam.title,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.maxScore ? (result.score! / result.maxScore) * 100 : 0,
      submittedAt: result.submittedAt,
      durationMin: result.exam.durationMin
    }))

    const monthlyData = results.reduce((acc: any, result: any) => {
      if (result.submittedAt) {
        const month = new Date(result.submittedAt).toISOString().slice(0, 7)
        if (!acc[month]) {
          acc[month] = { totalScore: 0, totalMaxScore: 0, count: 0 }
        }
        acc[month].totalScore += result.score || 0
        acc[month].totalMaxScore += result.maxScore || 0
        acc[month].count += 1
      }
      return acc
    }, {})

    const performanceChart = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      percentage: data.totalMaxScore > 0 ? (data.totalScore / data.totalMaxScore) * 100 : 0,
      examsCount: data.count
    })).sort((a: any, b: any) => a.month.localeCompare(b.month))

    return NextResponse.json({
      summary: {
        totalExams,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        bestScore: Math.round(bestScore * 100) / 100,
        worstScore: Math.round(worstScore * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
        totalMaxScore: Math.round(totalMaxScore * 100) / 100
      },
      recentResults,
      performanceChart
    })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}