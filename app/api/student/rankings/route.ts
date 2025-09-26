import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/student/rankings - Get leaderboards and rankings
async function GET(req: NextRequest) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const url = new URL(req.url)
      const examId = url.searchParams.get('examId')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const type = url.searchParams.get('type') || 'overall' // 'overall' | 'exam'

      if (type === 'exam' && examId) {
        // Get rankings for a specific exam
        const examResults = await ((prisma as any).examResult as any).findMany({
          where: {
            examId,
            status: 'GRADED',
            score: { not: null },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
                maxScore: true,
              },
            },
          },
          orderBy: [
            { score: 'desc' },
            { submittedAt: 'asc' }, // Earlier submission wins in case of tie
          ],
          take: limit,
        })

        // Add ranking position
        const rankings = examResults.map((result: any, index: number) => ({
          rank: index + 1,
          userId: result.user.id,
          userName: result.user.name,
          userEmail: result.user.email,
          score: result.score,
          maxScore: result.maxScore,
          percentage: result.maxScore ? Math.round((result.score! / result.maxScore) * 100) : 0,
          submittedAt: result.submittedAt,
          examTitle: result.exam.title,
          isCurrentUser: result.user.id === authReq.user!.id,
        }))

        // Find current user's rank if not in top results
        let currentUserRank = null
        const userRankIndex = rankings.findIndex((r: any) => r.isCurrentUser)
        
        if (userRankIndex === -1) {
          const userResult = await ((prisma as any).examResult as any).findUnique({
            where: {
              examId_userId: {
                examId,
                userId: authReq.user!.id,
              },
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          })

          if (userResult && userResult.status === 'GRADED' && userResult.score !== null) {
            // Count how many users scored higher
            const betterScores = await ((prisma as any).examResult as any).count({
              where: {
                examId,
                status: 'GRADED',
                OR: [
                  { score: { gt: userResult.score } },
                  {
                    score: userResult.score,
                    submittedAt: { lt: userResult.submittedAt },
                  },
                ],
              },
            })

            currentUserRank = {
              rank: betterScores + 1,
              userId: userResult.user.id,
              userName: userResult.user.name,
              userEmail: userResult.user.email,
              score: userResult.score,
              maxScore: userResult.maxScore,
              percentage: userResult.maxScore ? Math.round((userResult.score / userResult.maxScore) * 100) : 0,
              submittedAt: userResult.submittedAt,
              examTitle: userResult.exam?.title || '',
              isCurrentUser: true,
            }
          }
        }

        return NextResponse.json({
          type: 'exam',
          examId,
          rankings,
          currentUserRank,
          totalParticipants: await ((prisma as any).examResult as any).count({
            where: {
              examId,
              status: 'GRADED',
              score: { not: null },
            },
          }),
        })
      } else {
        // Get overall rankings (simplified query)
        const userStats = await ((prisma as any).examResult as any).findMany({
          where: {
            status: 'GRADED',
            score: { not: null },
          },
          select: {
            userId: true,
            score: true,
            maxScore: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc'
          }
        })

        // Group and calculate averages in memory
        const userMap = new Map<string, {
          userId: string,
          userName: string | null,
          userEmail: string,
          totalScore: number,
          maxScore: number,
          count: number
        }>()

        userStats.forEach((result: any) => {
          const existing = userMap.get(result.userId)
          if (existing) {
            existing.totalScore += result.score || 0
            existing.maxScore += result.maxScore || 0
            existing.count += 1
          } else {
            userMap.set(result.userId, {
              userId: result.userId,
              userName: result.user.name,
              userEmail: result.user.email,
              totalScore: result.score || 0,
              maxScore: result.maxScore || 0,
              count: 1
            })
          }
        })

        const sortedUsers = Array.from(userMap.values())
          .map((user: any) => ({
            ...user,
            averageScore: user.count > 0 ? user.totalScore / user.count : 0,
            averagePercentage: user.maxScore > 0 ? Math.round((user.totalScore / user.maxScore) * 100) : 0
          }))
          .filter((user: any) => user.averagePercentage >= 70)
          .sort((a: any, b: any) => b.averageScore - a.averageScore)
          .slice(0, limit)

        const rankings = sortedUsers.map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          userName: user.userName || 'Unknown User',
          userEmail: user.userEmail || '',
          averageScore: Math.round(user.averageScore * 100) / 100,
          totalScore: Math.round(user.totalScore * 100) / 100,
          maxPossibleScore: Math.round(user.maxScore * 100) / 100,
          averagePercentage: user.averagePercentage,
          examsCompleted: user.count,
          isCurrentUser: user.userId === authReq.user!.id,
        }))

        let currentUserRank = rankings.find(r => r.isCurrentUser) || null

        return NextResponse.json({
          type: 'overall',
          rankings,
          currentUserRank,
          totalParticipants: userMap.size,
        })
      }
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