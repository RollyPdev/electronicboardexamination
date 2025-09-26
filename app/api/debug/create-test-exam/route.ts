import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // First, get an admin user to be the creator
    let adminUser = await (prisma as any).user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      // Create admin user if none exists
      adminUser = await (prisma as any).user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
    }

    // Create a test exam
    const exam = await (prisma as any).exam.create({
      data: {
        title: 'Test Exam - Sample Questions',
        description: 'This is a test exam with sample questions for testing purposes.',
        durationMin: 30,
        randomize: true,
        published: true,
        creatorId: adminUser.id,
      }
    })

    // Create sample questions
    const questions = [
      {
        examId: exam.id,
        type: 'MCQ',
        text: 'What is the capital of France?',
        options: [
          { label: 'A', text: 'London', correct: false },
          { label: 'B', text: 'Berlin', correct: false },
          { label: 'C', text: 'Paris', correct: true },
          { label: 'D', text: 'Madrid', correct: false }
        ],
        points: 1,
        order: 1
      },
      {
        examId: exam.id,
        type: 'MCQ',
        text: 'Which planet is closest to the sun?',
        options: [
          { label: 'A', text: 'Venus', correct: false },
          { label: 'B', text: 'Mercury', correct: true },
          { label: 'C', text: 'Earth', correct: false },
          { label: 'D', text: 'Mars', correct: false }
        ],
        points: 1,
        order: 2
      },
      {
        examId: exam.id,
        type: 'TRUE_FALSE',
        text: 'The Earth is flat.',
        options: [
          { label: 'A', text: 'True', correct: false },
          { label: 'B', text: 'False', correct: true }
        ],
        points: 1,
        order: 3
      }
    ]

    for (const questionData of questions) {
      await (prisma as any).question.create({
        data: questionData
      })
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        questionCount: questions.length
      }
    })
  } catch (error) {
    console.error('Error creating test exam:', error)
    return NextResponse.json({ 
      error: 'Failed to create test exam',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}