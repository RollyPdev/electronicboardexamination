import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admin/proctors - List all proctors
async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const proctors = await (prisma as any).user.findMany({
        where: { role: 'PROCTOR' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              createdExams: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ proctors })
    } catch (error) {
      console.error('Error fetching proctors:', error)
      return NextResponse.json(
        { error: 'Failed to fetch proctors' },
        { status: 500 }
      )
    }
  })
}

// POST /api/admin/proctors - Create new proctor
async function POST(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const { name, email, password } = await req.json()

      if (!name || !email || !password) {
        return NextResponse.json(
          { error: 'Name, email, and password are required' },
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

      const proctor = await (prisma as any).user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'PROCTOR'
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              createdExams: true
            }
          }
        }
      })

      return NextResponse.json(proctor, { status: 201 })
    } catch (error) {
      console.error('Error creating proctor:', error)
      return NextResponse.json(
        { error: 'Failed to create proctor' },
        { status: 500 }
      )
    }
  })
}

export { GET, POST }