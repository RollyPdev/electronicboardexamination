import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PUT /api/admin/proctors/[id] - Update proctor
async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(req, async () => {
    try {
      const { name, email, password } = await req.json()
      const { id } = params

      if (!name || !email) {
        return NextResponse.json(
          { error: 'Name and email are required' },
          { status: 400 }
        )
      }

      // Check if proctor exists and is actually a proctor
      const existingProctor = await (prisma as any).user.findFirst({
        where: { id, role: 'PROCTOR' }
      })

      if (!existingProctor) {
        return NextResponse.json(
          { error: 'Proctor not found' },
          { status: 404 }
        )
      }

      // Check if email is taken by another user
      const emailTaken = await (prisma as any).user.findFirst({
        where: { 
          email,
          id: { not: id }
        }
      })

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }

      const updateData: any = { name, email }

      // Hash new password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 12)
      }

      const proctor = await (prisma as any).user.update({
        where: { id },
        data: updateData,
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

      return NextResponse.json(proctor)
    } catch (error) {
      console.error('Error updating proctor:', error)
      return NextResponse.json(
        { error: 'Failed to update proctor' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/admin/proctors/[id] - Delete proctor
async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return withAdminAuth(req, async () => {
    try {
      const { id } = params

      // Check if proctor exists and is actually a proctor
      const existingProctor = await (prisma as any).user.findFirst({
        where: { id, role: 'PROCTOR' }
      })

      if (!existingProctor) {
        return NextResponse.json(
          { error: 'Proctor not found' },
          { status: 404 }
        )
      }

      // Check if proctor has created exams
      const examCount = await (prisma as any).exam.count({
        where: { creatorId: id }
      })

      if (examCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete proctor with existing exams' },
          { status: 400 }
        )
      }

      await (prisma as any).user.delete({
        where: { id }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting proctor:', error)
      return NextResponse.json(
        { error: 'Failed to delete proctor' },
        { status: 500 }
      )
    }
  })
}

export { PUT, DELETE }