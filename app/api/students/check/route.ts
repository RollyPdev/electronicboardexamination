import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const studentCount = await (prisma as any).user.count({
      where: { role: 'STUDENT' }
    })

    const students = await (prisma as any).user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        school: true,
        createdAt: true
      },
      take: 5
    })

    return NextResponse.json({
      totalStudents: studentCount,
      sampleStudents: students,
      hasData: studentCount > 0
    })

  } catch (error) {
    console.error('Error checking students:', error)
    return NextResponse.json({
      error: (error as any)?.message || "Unknown error",
      totalStudents: 0,
      hasData: false
    }, { status: 500 })
  }
}