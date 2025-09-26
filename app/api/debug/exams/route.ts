import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const exams = await (prisma as any).exam.findMany({
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        _count: {
          select: {
            questions: true
          }
        }
      }
    })

    return NextResponse.json({
      totalExams: exams.length,
      publishedExams: exams.filter(e => e.published).length,
      exams: exams.map(exam => ({
        id: exam.id,
        title: exam.title,
        published: exam.published,
        questionCount: exam._count.questions,
        createdAt: exam.createdAt
      }))
    })
  } catch (error) {
    console.error('Debug exams error:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}