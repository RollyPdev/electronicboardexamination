import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/admin/results/[id] - Get specific exam result
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = await params

      const result = await (prisma as any).examResult.findUnique({
        where: { id },
        include: {
          exam: {
            select: {
              title: true,
              questions: true,
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

      if (!result) {
        return NextResponse.json(
          { error: 'Result not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ result })
    } catch (error) {
      console.error('Error fetching result:', error)
      return NextResponse.json(
        { error: 'Failed to fetch result' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/admin/results/[id] - Update exam result
async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = await params
      const body = await req.json()
      const { score, maxScore, status, answers } = body

      const result = await (prisma as any).examResult.update({
        where: { id },
        data: {
          score: score !== undefined ? score : undefined,
          maxScore: maxScore !== undefined ? maxScore : undefined,
          status: status || undefined,
          answers: answers !== undefined ? answers : undefined,
          gradedAt: status === 'GRADED' ? new Date() : undefined,
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

      return NextResponse.json({ result })
    } catch (error) {
      console.error('Error updating result:', error)
      return NextResponse.json(
        { error: 'Failed to update result' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/admin/results/[id] - Delete exam result
async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = await params

      await (prisma as any).examResult.delete({
        where: { id },
      })

      return NextResponse.json({ message: 'Result deleted successfully' })
    } catch (error) {
      console.error('Error deleting result:', error)
      return NextResponse.json(
        { error: 'Failed to delete result' },
        { status: 500 }
      )
    }
  })
}

export { GET, PUT, DELETE }