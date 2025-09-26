import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/results - Get all exam results
async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const results = await (prisma as any).examResult.findMany({
        include: {
          exam: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              school: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
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

// POST /api/admin/results - Create new exam result
async function POST(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const body = await req.json()
      const { examId, userId, score, maxScore, status, answers } = body

      if (!examId || !userId) {
        return NextResponse.json(
          { error: 'Exam ID and User ID are required' },
          { status: 400 }
        )
      }

      const result = await (prisma as any).examResult.create({
        data: {
          examId,
          userId,
          score: score || null,
          maxScore: maxScore || null,
          status: status || 'IN_PROGRESS',
          answers: answers || {},
          events: [],
        },
        include: {
          exam: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
              school: true,
            },
          },
        },
      })

      return NextResponse.json({ result }, { status: 201 })
    } catch (error) {
      console.error('Error creating result:', error)
      return NextResponse.json(
        { error: 'Failed to create result' },
        { status: 500 }
      )
    }
  })
}

export { GET, POST }