import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function PUT(req: NextRequest) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const body = await req.json()
      const { name, email } = body

      const updatedUser = await (prisma as any).user.update({
        where: { id: authReq.user!.id },
        data: {
          name,
          email
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })

      return NextResponse.json(updatedUser)
    } catch (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }
  })
}

export { PUT }