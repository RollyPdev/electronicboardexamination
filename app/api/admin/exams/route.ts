import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { createExamSchema } from '@/lib/exam-utils'

// GET /api/admin/exams - List all exams
async function GET(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { searchParams } = new URL(authReq.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const published = searchParams.get('published')

      const skip = (page - 1) * limit

      const where = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        ...(published !== null && { published: published === 'true' }),
      }

      const [exams, total] = await Promise.all([
        ((prisma as any).exam as any).findMany({
          where,
          include: {
            creator: { select: { name: true, email: true } },
            questions: { select: { id: true } },
            results: { select: { id: true } },
            _count: {
              select: {
                questions: true,
                results: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        ((prisma as any).exam as any).count({ where }),
      ])

      return NextResponse.json({
        exams,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      console.error('Error fetching exams:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exams' },
        { status: 500 }
      )
    }
  })
}

// POST /api/admin/exams - Create new exam
async function POST(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const body = await req.json()
      const { questions, ...examData } = body
      const validatedData = createExamSchema.parse(examData)

      const exam = await ((prisma as any).exam as any).create({
        data: {
          ...validatedData,
          creatorId: authReq.user!.id,
        },
        include: {
          creator: { select: { name: true, email: true } },
          _count: {
            select: {
              questions: true,
              results: true,
            },
          },
        },
      })

      // Create imported questions if provided
      if (questions && questions.length > 0) {
        await ((prisma as any).question as any).createMany({
          data: questions.map((q: any, index: number) => {
            const options = [
              { label: 'A', text: q.optionA || '', correct: q.correctAnswer === 'A' },
              { label: 'B', text: q.optionB || '', correct: q.correctAnswer === 'B' },
              { label: 'C', text: q.optionC || '', correct: q.correctAnswer === 'C' },
              { label: 'D', text: q.optionD || '', correct: q.correctAnswer === 'D' }
            ].filter((opt: any) => opt.text.trim() !== '')
            
            return {
              examId: exam.id,
              type: q.type,
              text: q.text,
              options: JSON.stringify(options),
              points: q.points || 1,
              order: index
            }
          })
        })
      }

      return NextResponse.json(exam, { status: 201 })
    } catch (error) {
      console.error('Error creating exam:', error)
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: (error as any).errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create exam' },
        { status: 500 }
      )
    }
  })
}

export { GET, POST }