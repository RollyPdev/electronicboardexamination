import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await (prisma as any).student.findUnique({
      where: { email: session.user.email }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: `${student.firstName} ${student.lastName}`.trim(),
      email: student.email,
      school: student.school
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, email, school } = await request.json()
    
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const updatedStudent = await (prisma as any).student.update({
      where: { email: session.user.email },
      data: { 
        firstName: name.trim().split(' ')[0] || name.trim(),
        lastName: name.trim().split(' ').slice(1).join(' ') || '',
        email: email.trim(),
        school: school?.trim() || ''
      },
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      student: { 
        name: `${updatedStudent.firstName} ${updatedStudent.lastName}`.trim(),
        email: updatedStudent.email,
        school: updatedStudent.school
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}