import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { createExamSchema } from '@/lib/exam-utils'

// GET /api/admin/exams/[id] - Get exam by ID
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const exam = await ((prisma as any).exam as any).findUnique({
        where: { id },
        include: {
          creator: { select: { name: true, email: true } },
          questions: {
            orderBy: { order: 'asc' },
          },
          results: {
            include: {
              user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              questions: true,
              results: true,
            },
          },
        },
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      return NextResponse.json(exam)
    } catch (error) {
      console.error('Error fetching exam:', error)
      return NextResponse.json(
        { error: 'Failed to fetch exam' },
        { status: 500 }
      )
    }
  })
}

// PUT /api/admin/exams/[id] - Update exam
async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const body = await req.json()
      const validatedData = createExamSchema.parse(body)

      // Check if exam exists
      const existingExam = await ((prisma as any).exam as any).findUnique({
        where: { id },
      })

      if (!existingExam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      const exam = await ((prisma as any).exam as any).update({
        where: { id },
        data: validatedData,
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

      return NextResponse.json(exam)
    } catch (error) {
      console.error('Error updating exam:', error)
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid input data', details: (error as any).errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to update exam' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/admin/exams/[id] - Delete exam
async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      // Check if exam exists
      const existingExam = await ((prisma as any).exam as any).findUnique({
        where: { id },
        include: { results: true },
      })

      if (!existingExam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Delete related data first (cascade deletion)
      if (existingExam.results.length > 0) {
        // Delete exam results first
        await ((prisma as any).examResult as any).deleteMany({
          where: { examId: id },
        })
      }

      // Delete questions
      await ((prisma as any).question as any).deleteMany({
        where: { examId: id },
      })

      // Finally delete the exam
      await ((prisma as any).exam as any).delete({
        where: { id },
      })

      return NextResponse.json({ message: 'Exam deleted successfully' })
    } catch (error) {
      console.error('Error deleting exam:', error)
      return NextResponse.json(
        { error: 'Failed to delete exam' },
        { status: 500 }
      )
    }
  })
}

export { GET, PUT, DELETE }