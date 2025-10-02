import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { searchParams } = new URL(req.url)
      const examId = searchParams.get('examId')

      if (!examId) {
        return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 })
      }

      const questions = await (prisma as any).question.findMany({
        where: { examId },
        include: {
          choices: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      })

      return NextResponse.json({ questions })
    } catch (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }
  })
}