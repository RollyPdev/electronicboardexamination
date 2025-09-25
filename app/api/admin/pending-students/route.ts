import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const pendingUsers = await ((prisma as any).user as any).findMany({
        where: {
          role: 'STUDENT',
          isActive: false
        },
        select: {
          id: true,
          name: true,
          email: true,
          activationCode: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const studentsWithSchool = await Promise.all(
        pendingUsers.map(async (user: any) => {
          const student = await ((prisma as any).student as any).findFirst({
            where: { email: user.email },
            select: { school: true }
          })
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            school: student?.school || 'Unknown',
            activationCode: user.activationCode,
            createdAt: user.createdAt.toISOString()
          }
        })
      )

      return NextResponse.json({ students: studentsWithSchool })
    } catch (error) {
      console.error('Error fetching pending students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending students' },
        { status: 500 }
      )
    }
  })
}

export { GET }