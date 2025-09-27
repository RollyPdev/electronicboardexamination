import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const student = await ((prisma as any).user as any).findUnique({
      where: { email: 'student@example.com' }
    })

    if (!student) {
      return NextResponse.json({ error: 'Demo student not found' })
    }

    const updatedResult = await ((prisma as any).examResult as any).updateMany({
      where: { userId: { not: student.id } },
      data: { userId: student.id }
    })

    return NextResponse.json({ 
      message: 'Updated exam results to belong to demo student',
      updatedCount: updatedResult.count,
      studentId: student.id
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' })
  }
}