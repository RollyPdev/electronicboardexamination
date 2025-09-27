import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not logged in' })
    }

    const user = await ((prisma as any).user as any).findUnique({
      where: { email: session.user.email }
    })

    const allResults = await ((prisma as any).examResult as any).findMany({
      include: {
        exam: { select: { title: true } }
      }
    })

    return NextResponse.json({
      currentUser: {
        id: user?.id,
        email: session.user.email,
        role: user?.role
      },
      allResults: allResults.map((r: any) => ({
        id: r.id,
        userId: r.userId,
        examTitle: r.exam.title,
        status: r.status,
        score: r.score
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' })
  }
}