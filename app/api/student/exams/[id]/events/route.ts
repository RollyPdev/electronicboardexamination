import { NextRequest, NextResponse } from 'next/server'
import { withStudentAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'

// POST /api/student/exams/[id]/events - Log exam events (anti-cheat)
async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withStudentAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const body = await req.json()
      const { token, event } = body

      if (!token || !event) {
        return NextResponse.json(
          { error: 'Token and event are required' },
          { status: 400 }
        )
      }

      // Verify the exam token
      const tokenData = verifyExamToken(token)
      if (!tokenData || tokenData.examId !== id || tokenData.userId !== authReq.user!.id) {
        return NextResponse.json(
          { error: 'Invalid exam token' },
          { status: 403 }
        )
      }

      // Find the exam result
      const examResult = await (prisma as any).examResult.findUnique({
        where: {
          examId_userId: {
            examId: id,
            userId: authReq.user!.id,
          },
        },
      })

      if (!examResult) {
        return NextResponse.json(
          { error: 'Exam session not found' },
          { status: 404 }
        )
      }

      if (examResult.status !== 'IN_PROGRESS') {
        return NextResponse.json(
          { error: 'Exam is not in progress' },
          { status: 400 }
        )
      }

      // Add event to the events array
      const currentEvents = Array.isArray(examResult.events) ? examResult.events : []
      const newEvents = [...currentEvents, event]

      // Update the exam result with the new event
      await (prisma as any).examResult.update({
        where: {
          id: examResult.id,
        },
        data: {
          events: newEvents,
        },
      })

      // Also create an audit log entry for important events
      if (['TAB_SWITCH', 'PASTE_ATTEMPT', 'COPY_ATTEMPT', 'FULLSCREEN_EXIT'].includes(event.type)) {
        await (prisma as any).auditLog.create({
          data: {
            userId: authReq.user!.id,
            action: `EXAM_${event.type}`,
            resourceType: 'EXAM',
            resourceId: id,
            details: {
              examResultId: examResult.id,
              event,
            },
            ipAddress: authReq.headers.get('x-forwarded-for') || 
                      authReq.headers.get('x-real-ip') || 
                      'unknown',
            userAgent: authReq.headers.get('user-agent') || 'unknown',
          },
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error logging exam event:', error)
      return NextResponse.json(
        { error: 'Failed to log event' },
        { status: 500 }
      )
    }
  })
}

export { POST }