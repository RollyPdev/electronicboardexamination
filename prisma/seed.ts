import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Student User',
      role: 'STUDENT',
    },
  })

  const proctor = await prisma.user.upsert({
    where: { email: 'proctor@example.com' },
    update: {},
    create: {
      email: 'proctor@example.com',
      name: 'Proctor User',
      role: 'PROCTOR',
    },
  })

  // Create sample exam
  const sampleExam = await prisma.exam.upsert({
    where: { id: 'sample-exam-1' },
    update: {},
    create: {
      id: 'sample-exam-1',
      title: 'Sample Board Examination',
      description: 'A comprehensive sample examination covering various topics',
      durationMin: 120,
      randomize: true,
      published: true,
      creatorId: admin.id,
    },
  })

  // Create sample questions
  const questions = [
    {
      id: 'q1',
      type: 'MCQ',
      text: 'What is the capital city of the Philippines?',
      options: [
        { label: 'A', text: 'Manila', correct: true },
        { label: 'B', text: 'Cebu', correct: false },
        { label: 'C', text: 'Davao', correct: false },
        { label: 'D', text: 'Iloilo', correct: false }
      ],
      points: 1,
      order: 1
    },
    {
      id: 'q2',
      type: 'TRUE_FALSE',
      text: 'The Philippines is an archipelago consisting of over 7,000 islands.',
      options: [
        { label: 'True', text: 'True', correct: true },
        { label: 'False', text: 'False', correct: false }
      ],
      points: 1,
      order: 2
    },
    {
      id: 'q3',
      type: 'MCQ',
      text: 'Which of the following is the largest island in the Philippines?\n\nConsider the total land area when making your selection.',
      options: [
        { label: 'A', text: 'Mindanao', correct: false },
        { label: 'B', text: 'Luzon', correct: true },
        { label: 'C', text: 'Visayas', correct: false },
        { label: 'D', text: 'Palawan', correct: false }
      ],
      points: 2,
      order: 3
    },
    {
      id: 'q4',
      type: 'SHORT_ANSWER',
      text: 'Explain the significance of the EDSA Revolution in Philippine history. Include the year it occurred and its main outcome.',
      options: null,
      points: 5,
      order: 4
    },
    {
      id: 'q5',
      type: 'NUMERIC',
      text: 'In what year did the Philippines gain independence from the United States?',
      options: null,
      points: 1,
      order: 5
    }
  ]

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {},
      create: {
        id: question.id,
        examId: sampleExam.id,
        type: question.type as any,
        text: question.text,
        options: question.options,
        points: question.points,
        order: question.order,
      },
    })
  }

  console.log('Demo users and sample exam created:', { admin, student, proctor, sampleExam })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })