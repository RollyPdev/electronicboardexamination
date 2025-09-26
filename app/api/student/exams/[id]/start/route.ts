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
      
      console.log('Starting exam:', { examId: id, userId: authReq.user!.id })
      
      // Check if exam exists and is published
      const exam = await (prisma as any).exam.findUnique({
        where: { id, published: true },
      })

      if (!exam) {
        console.log('Exam not found or not published:', id)
        return NextResponse.json({ error: 'Exam not found or not published' }, { status: 404 })
      }

      console.log('Exam found:', exam.title)

      // Ensure User record exists for this student
      console.log('Creating/updating user record')
      const user = await (prisma as any).user.upsert({
        where: { email: authReq.user!.email },
        update: {
          name: authReq.user!.name,
        },
        create: {
          id: authReq.user!.id,
          email: authReq.user!.email || 'student@example.com',
          name: authReq.user!.name || 'Student',
          role: 'STUDENT'
        }
      })

      console.log('User record ready:', user.id)

      // Use upsert to handle existing exam results
      console.log('Creating/finding exam result for:', { examId: id, userId: user.id })
      
      const examResult = await (prisma as any).examResult.upsert({
        where: {
          examId_userId: {
            examId: id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          examId: id,
          userId: user.id,
          status: 'IN_PROGRESS',
          answers: {},
          events: [],
        },
      })
      
      console.log('Exam result ready:', examResult.id, 'Status:', examResult.status)
      
      // Check if exam is already completed
      if (examResult.status === 'SUBMITTED' || examResult.status === 'GRADED') {
        return NextResponse.json(
          { error: 'You have already completed this exam' },
          { status: 400 }
        )
      }

      // Generate secure exam token
      const token = generateExamToken(id, user.id)

      return NextResponse.json({
        resultId: examResult.id,
        token,
        startedAt: examResult.startedAt,
        message: 'Exam started successfully',
      }, { status: 201 })
    } catch (error) {
      console.error('Error starting exam:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      return NextResponse.json(
        { error: `Failed to start exam: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  })
}

export { POST }