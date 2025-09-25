import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'

// POST /api/upload/complete - Signal that recording is complete
async function POST(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      const body = await req.json()
      const { examResultId, token, totalChunks } = body

      if (!examResultId || !token) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Verify exam token
      const tokenData = verifyExamToken(token)
      if (!tokenData || tokenData.userId !== authReq.user!.id) {
        return NextResponse.json(
          { error: 'Invalid exam token' },
          { status: 401 }
        )
      }

      // Verify exam result exists and belongs to user
      const examResult = await (prisma as any).examResult.findFirst({
        where: {
          id: examResultId,
          userId: authReq.user!.id,
        },
      })

      if (!examResult) {
        return NextResponse.json(
          { error: 'Invalid exam session' },
          { status: 404 }
        )
      }

      // Get all recordings for this exam result
      const recordings = await (prisma as any).recording.findMany({
        where: { examResultId },
        orderBy: { chunkIndex: 'asc' },
      })

      // Verify all chunks are present
      const expectedChunks = totalChunks || recordings.length
      const missingChunks = []
      
      for (let i = 0; i < expectedChunks; i++) {
        if (!recordings.find((r: any) => r.chunkIndex === i)) {
          missingChunks.push(i)
        }
      }

      // Create audit log entry for recording completion
      await (prisma as any).auditLog.create({
        data: {
          examResultId,
          userId: authReq.user!.id,
          action: 'RECORDING_COMPLETE',
          details: {
            totalChunks: recordings.length,
            missingChunks,
            totalSize: recordings.reduce((sum: any, r: any) => sum + r.size, 0),
            duration: recordings.length * 5, // Approximate duration (5s per chunk)
          },
          timestamp: new Date(),
        },
      })

      return NextResponse.json({
        message: 'Recording marked as complete',
        totalChunks: recordings.length,
        missingChunks,
        recordingComplete: missingChunks.length === 0,
      })
    } catch (error) {
      console.error('Error completing recording:', error)
      return NextResponse.json(
        { error: 'Failed to mark recording as complete' },
        { status: 500 }
      )
    }
  })
}

export { POST }