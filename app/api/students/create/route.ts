import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json()

    if (!studentId || !password) {
      return NextResponse.json(
        { error: 'Student ID and password are required' },
        { status: 400 }
      )
    }

    // Find the student in the Student table
    const student = await (prisma as any).student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        school: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('Processing password for:', student.email)

    // Update student with password
    const updatedStudent = await (prisma as any).student.update({
      where: { id: studentId },
      data: {
        password: hashedPassword
      }
    })

    console.log('Password set for student:', updatedStudent.email)

    return NextResponse.json({
      student: {
        name: `${updatedStudent.firstName} ${updatedStudent.lastName}`,
        email: updatedStudent.email,
        school: updatedStudent.school,
        password: password // Return plain password for display
      }
    })
  } catch (error) {
    console.error('Error creating student account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}