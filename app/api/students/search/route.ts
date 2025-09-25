import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    if (!search || search.length < 2) {
      return NextResponse.json({ students: [] })
    }

    const students = await (prisma as any).student.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        school: true
      },
      take: 10
    })

    const transformedStudents = students.map((student: any) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      school: student.school
    }))

    return NextResponse.json({ students: transformedStudents })
  } catch (error) {
    console.error('Error searching students:', error)
    return NextResponse.json({ students: [] })
  }
}