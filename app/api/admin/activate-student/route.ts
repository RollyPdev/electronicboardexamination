import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function POST(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const { studentId } = await req.json()

      if (!studentId) {
        return NextResponse.json(
          { error: 'Student ID is required' },
          { status: 400 }
        )
      }

      await (prisma as any).user.update({
        where: { id: studentId },
        data: { 
          isActive: true,
          activationCode: null
        }
      })

      const user = await ((prisma as any).user as any).findUnique({
        where: { id: studentId }
      })

      if (user?.email) {
        await (prisma as any).student.updateMany({
          where: { 
            email: user.email
          },
          data: { status: 'active' }
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error activating student:', error)
      return NextResponse.json(
        { error: 'Failed to activate student' },
        { status: 500 }
      )
    }
  })
}

export { POST }