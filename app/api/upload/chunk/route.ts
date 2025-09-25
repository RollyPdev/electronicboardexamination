import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { verifyExamToken } from '@/lib/exam-utils'
import crypto from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST /api/upload/chunk - Upload video chunk during exam
async function POST(req: NextRequest) {
  return withAuth(req, async (authReq) => {
    try {
      const formData = await req.formData()
      const examResultId = formData.get('examResultId') as string
      const chunkIndex = parseInt(formData.get('chunkIndex') as string)
      const token = formData.get('token') as string
      const chunk = formData.get('chunk') as File

      if (!examResultId || isNaN(chunkIndex) || !token || !chunk) {
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
          status: 'IN_PROGRESS',
        },
      })

      if (!examResult) {
        return NextResponse.json(
          { error: 'Invalid exam session' },
          { status: 404 }
        )
      }

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'recordings', examResultId)
      await mkdir(uploadDir, { recursive: true })

      // Generate unique filename for this chunk
      const timestamp = Date.now()
      const fileName = `chunk_${chunkIndex.toString().padStart(4, '0')}_${timestamp}.webm`
      const filePath = path.join(uploadDir, fileName)
      const fileKey = `recordings/${examResultId}/${fileName}`

      // Save chunk to disk
      const buffer = Buffer.from(await chunk.arrayBuffer())
      await writeFile(filePath, buffer)

      // Save recording metadata to database
      await (prisma as any).recording.create({
        data: {
          examResultId,
          chunkIndex,
          fileKey,
          fileName,
          mimeType: chunk.type || 'video/webm',
          size: buffer.length,
        },
      })

      // Update exam result with recording keys
      const currentRecordingKeys = (examResult.recordingKeys as string[]) || []
      currentRecordingKeys.push(fileKey)
      
      await (prisma as any).examResult.update({
        where: { id: examResultId },
        data: { recordingKeys: currentRecordingKeys },
      })

      return NextResponse.json({
        message: 'Chunk uploaded successfully',
        chunkIndex,
        fileKey,
        size: buffer.length,
      })
    } catch (error) {
      console.error('Error uploading chunk:', error)
      return NextResponse.json(
        { error: 'Failed to upload chunk' },
        { status: 500 }
      )
    }
  })
}

export { POST }