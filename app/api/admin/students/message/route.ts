import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function POST(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { studentId, message } = await req.json()

      if (!studentId || !message?.trim()) {
        return NextResponse.json(
          { error: 'Student ID and message are required' },
          { status: 400 }
        )
      }

      // Find the student
      const student = await (prisma as any).student.findUnique({
        where: { id: studentId },
        select: { email: true, firstName: true, lastName: true }
      })

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        )
      }

      // For now, just log the message (in a real app, you'd send an email or notification)
      console.log(`Message to ${student.firstName} ${student.lastName} (${student.email}): ${message}`)

      // You could store the message in a database table for message history
      // await (prisma as any).message.create({
      //   data: {
      //     fromUserId: authReq.user!.id,
      //     toStudentId: studentId,
      //     content: message,
      //     type: 'ADMIN_TO_STUDENT'
      //   }
      // })

      return NextResponse.json({ 
        success: true, 
        message: 'Message sent successfully' 
      })
    } catch (error) {
      console.error('Error sending message:', error)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }
  })
}

export { POST }