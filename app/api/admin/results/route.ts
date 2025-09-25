import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const results = await ((prisma as any).examResult as any).findMany({
        where: {
          status: {
            in: ['SUBMITTED', 'GRADED']
          }
        },
        select: {
          id: true,
          score: true,
          maxScore: true,
          submittedAt: true,
          status: true,
          answers: true,
          exam: {
            select: {
              title: true
            }
          },
          user: {
            select: {
              name: true,
              email: true,
              school: true
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        }
      })

      return NextResponse.json({ results })
    } catch (error) {
      console.error('Error fetching results:', error)
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      )
    }
  })
}

export { GET }