import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const rankings = await ((prisma as any).user as any).findMany({
        where: {
          role: 'STUDENT',
          examsTaken: {
            some: {
              status: 'GRADED',
              score: { not: null },
              maxScore: { not: null }
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          examsTaken: {
            where: {
              status: 'GRADED',
              score: { not: null },
              maxScore: { not: null }
            },
            select: {
              score: true,
              maxScore: true
            }
          }
        }
      })

      const rankedStudents = rankings
        .map((student: any) => {
          const scores = student.examsTaken.map((exam: any) => 
            (exam.score! / exam.maxScore!) * 100
          )
          const averageScore = scores.length > 0 
            ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
            : 0
          const bestScore = scores.length > 0 ? Math.max(...scores) : 0

          return {
            student: {
              name: student.name,
              email: student.email
            },
            averageScore: Math.round(averageScore * 10) / 10,
            totalExams: student.examsTaken.length,
            bestScore: Math.round(bestScore)
          }
        })
        .filter((student: any) => student.totalExams > 0 && student.averageScore >= 70)
        .sort((a: any, b: any) => b.averageScore - a.averageScore)
        .map((student: any, index: number) => ({
          ...student,
          rank: index + 1
        }))

      return NextResponse.json({ rankings: rankedStudents })
    } catch (error) {
      console.error('Error fetching rankings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch rankings' },
        { status: 500 }
      )
    }
  })
}

export { GET }