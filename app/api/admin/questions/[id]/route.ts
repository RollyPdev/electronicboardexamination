import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/questions/[id] - Update question
async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      const body = await req.json()
      const { type, text, options, points, correctAnswer } = body

      // Check if question exists
      const existingQuestion = await ((prisma as any).question as any).findUnique({
        where: { id },
      })

      if (!existingQuestion) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }

      // Format options based on question type
      let formattedOptions = null
      
      if (type === 'MCQ' && options) {
        formattedOptions = options.map((opt: string, index: number) => ({
          label: String.fromCharCode(65 + index),
          text: opt,
          correct: opt === correctAnswer
        }))
      } else if (type === 'TRUE_FALSE') {
        formattedOptions = [
          { label: 'True', text: 'True', correct: correctAnswer === 'True' },
          { label: 'False', text: 'False', correct: correctAnswer === 'False' }
        ]
      }

      const question = await ((prisma as any).question as any).update({
        where: { id },
        data: {
          type,
          text,
          options: formattedOptions,
          points: parseInt(points) || 1,
        },
      })

      return NextResponse.json(question)
    } catch (error) {
      console.error('Error updating question:', error)
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/admin/questions/[id] - Delete question
async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(req, async (authReq) => {
    try {
      const { id } = await params
      
      // Check if question exists
      const existingQuestion = await ((prisma as any).question as any).findUnique({
        where: { id },
      })

      if (!existingQuestion) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }

      await ((prisma as any).question as any).delete({
        where: { id },
      })

      return NextResponse.json({ message: 'Question deleted successfully' })
    } catch (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }
  })
}

export { PUT, DELETE }