import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { firstName, middleInitial, lastName, school, email, password } = await req.json()

    if (!firstName || !lastName || !school || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await (prisma as any).user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate activation code
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create user
    const user = await (prisma as any).user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${middleInitial ? middleInitial + ' ' : ''}${lastName}`,
        role: 'STUDENT',
        isActive: false,
        activationCode
      }
    })

    // Create student record
    await (prisma as any).student.create({
      data: {
        studentId: `STU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        firstName,
        lastName,
        middleName: middleInitial || null,
        gender: 'Not Specified',
        birthDate: new Date('2000-01-01'),
        age: 24,
        birthPlace: 'Not Specified',
        contactNumber: 'Not Specified',
        email,
        address: 'Not Specified',
        region: 'Not Specified',
        province: 'Not Specified',
        cityMunicipality: 'Not Specified',
        barangay: 'Not Specified',
        zipCode: '0000',
        guardianFirstName: 'Not Specified',
        guardianLastName: 'Not Specified',
        guardianContactNumber: 'Not Specified',
        guardianAddress: 'Not Specified',
        guardianRelationship: 'Not Specified',
        school,
        course: 'Not Specified',
        graduationYear: '2025',
        howDidYouKnow: 'Online Registration',
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        activationCode
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}