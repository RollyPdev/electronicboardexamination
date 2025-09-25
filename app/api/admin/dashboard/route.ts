import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const [
        totalExams,
        publishedExams,
        totalStudents,
        totalResults,
        recentActivity
      ] = await Promise.all([
        ((prisma as any).exam as any).count(),
        ((prisma as any).exam as any).count({ where: { published: true } }),
        ((prisma as any).student as any).count(),
        ((prisma as any).examResult as any).count({ where: { status: { in: ['SUBMITTED', 'GRADED'] } } }),
        ((prisma as any).examResult as any).findMany({
          where: { status: { in: ['SUBMITTED', 'GRADED'] } },
          include: {
            exam: { select: { title: true } },
            user: { select: { name: true, email: true } }
          },
          orderBy: { submittedAt: 'desc' },
          take: 5
        })
      ])

      const gradedResults = await ((prisma as any).examResult as any).findMany({
        where: { status: 'GRADED', score: { not: null }, maxScore: { not: null } },
        select: { score: true, maxScore: true }
      })

      const passedResults = gradedResults.filter((result: any) => 
        result.score! >= (result.maxScore! * 0.6)
      ).length

      const successRate = gradedResults.length > 0 ? Math.round((passedResults / gradedResults.length) * 100) : 0

      return NextResponse.json({
        stats: {
          totalExams,
          publishedExams,
          totalStudents,
          totalResults,
          successRate
        },
        recentActivity
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      )
    }
  })
}

export { GET }