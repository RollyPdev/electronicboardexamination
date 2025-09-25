import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { generateExamToken } from '@/lib/exam-utils'

// POST /api/student/exams/[id]/start - Start an exam
async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { id } = await params
      
      // Check if exam exists and is published
      const exam = await (prisma as any).exam.findUnique({
        where: { id, published: true },
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Check if student already has a result for this exam
      const existingResult = await (prisma as any).examResult.findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: authReq.user!.id,
          },
        },
      })

      if (existingResult) {
        if (existingResult.status === 'SUBMITTED' || existingResult.status === 'GRADED') {
          return NextResponse.json(
            { error: 'You have already completed this exam' },
            { status: 400 }
          )
        }
        
        // If exam is in progress, return existing result
        if (existingResult.status === 'IN_PROGRESS') {
          const token = generateExamToken(id, authReq.user!.id)
          return NextResponse.json({
            resultId: existingResult.id,
            token,
            startedAt: existingResult.startedAt,
            message: 'Resuming existing exam',
          })
        }
      }

      // Ensure User record exists for this student
      const user = await (prisma as any).user.upsert({
        where: { id: authReq.user!.id },
        update: {},
        create: {
          id: authReq.user!.id,
          email: authReq.user!.email || 'student@example.com',
          name: authReq.user!.name || 'Student',
          role: 'STUDENT'
        }
      })

      // Create new exam result
      const examResult = await (prisma as any).examResult.create({
        data: {
          examId: id,
          userId: user.id,
          status: 'IN_PROGRESS',
          answers: {},
          events: [],
        },
      })

      // Generate secure exam token
      const token = generateExamToken(id, authReq.user!.id)

      return NextResponse.json({
        resultId: examResult.id,
        token,
        startedAt: examResult.startedAt,
        message: 'Exam started successfully',
      }, { status: 201 })
    } catch (error) {
      console.error('Error starting exam:', error)
      return NextResponse.json(
        { error: 'Failed to start exam' },
        { status: 500 }
      )
    }
  })
}

export { POST }