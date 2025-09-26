import { NextRequest, NextResponse } from 'next/server'
import { withAdminOrProctorAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminOrProctorAuth(req, async () => {
    try {
      const students = await (prisma as any).student.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          school: true,
          course: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Transform data to match expected interface
      const transformedStudents = students.map((student: any) => ({
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        school: student.school,
        course: student.course,
        createdAt: student.createdAt,
        _count: {
          examsTaken: 0 // TODO: Calculate actual exam count if needed
        }
      }))

      return NextResponse.json({ students: transformedStudents })
    } catch (error) {
      console.error('Error fetching students:', error)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }
  })
}

export { GET }