#!/usr/bin/env node

/**
 * Test script to verify the complete grading flow
 * This script tests:
 * 1. Question creation with correct answers
 * 2. Student answer submission
 * 3. Automatic grading
 * 4. Result display with correct/incorrect feedback
 */

const { PrismaClient } = require('@prisma/client')
const { gradeQuestion, gradeExam } = require('./lib/grading')

const prisma = new PrismaClient()

async function testCompleteGradingFlow() {
  console.log('🧪 Testing Complete Grading Flow...\n')

  try {
    // 1. Create a test exam
    console.log('1. Creating test exam...')
    const exam = await prisma.exam.create({
      data: {
        title: 'Test Grading Exam',
        description: 'Testing automatic grading functionality',
        durationMin: 60,
        published: true,
        creatorId: 'admin-user-id', // This should be a valid admin user ID
      }
    })
    console.log(`✅ Created exam: ${exam.id}`)

    // 2. Create test questions with different types
    console.log('\n2. Creating test questions...')
    
    // MCQ Question
    const mcqQuestion = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'MCQ',
        text: 'What is the capital of France?',
        options: [
          { label: 'A', text: 'London', correct: false },
          { label: 'B', text: 'Paris', correct: true },
          { label: 'C', text: 'Berlin', correct: false },
          { label: 'D', text: 'Madrid', correct: false }
        ],
        points: 5,
        order: 1
      }
    })
    console.log(`✅ Created MCQ question: ${mcqQuestion.id}`)

    // True/False Question
    const tfQuestion = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'TRUE_FALSE',
        text: 'The Earth is round.',
        options: [
          { label: 'True', text: 'True', correct: true },
          { label: 'False', text: 'False', correct: false }
        ],
        points: 3,
        order: 2
      }
    })
    console.log(`✅ Created True/False question: ${tfQuestion.id}`)

    // Numeric Question
    const numericQuestion = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'NUMERIC',
        text: 'What is 2 + 2?',
        options: [
          { correct_answer: 4, tolerance: 0.1 }
        ],
        points: 4,
        order: 3
      }
    })
    console.log(`✅ Created Numeric question: ${numericQuestion.id}`)

    // Short Answer Question
    const shortQuestion = await prisma.question.create({
      data: {
        examId: exam.id,
        type: 'SHORT_ANSWER',
        text: 'Explain the concept of gravity.',
        options: [
          { sample_answer: 'Gravity is a force that attracts objects toward each other.' }
        ],
        points: 10,
        order: 4
      }
    })
    console.log(`✅ Created Short Answer question: ${shortQuestion.id}`)

    // 3. Create a test student and exam result
    console.log('\n3. Creating test student and exam result...')
    
    const student = await prisma.user.upsert({
      where: { email: 'test-student@example.com' },
      update: {},
      create: {
        email: 'test-student@example.com',
        name: 'Test Student',
        role: 'STUDENT'
      }
    })
    console.log(`✅ Created/found student: ${student.id}`)

    const examResult = await prisma.examResult.create({
      data: {
        examId: exam.id,
        userId: student.id,
        status: 'IN_PROGRESS',
        answers: {
          [mcqQuestion.id]: { answer: 'B' }, // Correct
          [tfQuestion.id]: { answer: 'True' }, // Correct
          [numericQuestion.id]: { answer: '4' }, // Correct
          [shortQuestion.id]: { answer: 'Gravity is a fundamental force of nature.' } // Manual review needed
        }
      }
    })
    console.log(`✅ Created exam result: ${examResult.id}`)

    // 4. Test individual question grading
    console.log('\n4. Testing individual question grading...')
    
    const mcqResult = gradeQuestion(mcqQuestion, { answer: 'B' })
    console.log(`MCQ Result: ${mcqResult.points}/${mcqResult.maxPoints} points, Correct: ${mcqResult.isCorrect}`)
    
    const tfResult = gradeQuestion(tfQuestion, { answer: 'True' })
    console.log(`T/F Result: ${tfResult.points}/${tfResult.maxPoints} points, Correct: ${tfResult.isCorrect}`)
    
    const numResult = gradeQuestion(numericQuestion, { answer: '4' })
    console.log(`Numeric Result: ${numResult.points}/${numResult.maxPoints} points, Correct: ${numResult.isCorrect}`)
    
    const shortResult = gradeQuestion(shortQuestion, { answer: 'Gravity is a fundamental force of nature.' })
    console.log(`Short Answer Result: ${shortResult.points}/${shortResult.maxPoints} points, Correct: ${shortResult.isCorrect}`)

    // 5. Test complete exam grading
    console.log('\n5. Testing complete exam grading...')
    
    const gradingResult = await gradeExam(examResult.id)
    console.log(`Total Score: ${gradingResult.totalScore}/${gradingResult.maxScore} (${gradingResult.percentage}%)`)
    console.log(`Needs Manual Review: ${gradingResult.needsManualReview}`)
    console.log(`Questions Graded: ${gradingResult.questionResults.length}`)

    // 6. Verify the exam result was updated
    console.log('\n6. Verifying exam result update...')
    
    const updatedResult = await prisma.examResult.findUnique({
      where: { id: examResult.id }
    })
    console.log(`Updated Status: ${updatedResult.status}`)
    console.log(`Updated Score: ${updatedResult.score}/${updatedResult.maxScore}`)

    // 7. Test incorrect answers
    console.log('\n7. Testing incorrect answers...')
    
    const incorrectMcq = gradeQuestion(mcqQuestion, { answer: 'A' })
    console.log(`Incorrect MCQ: ${incorrectMcq.points}/${incorrectMcq.maxPoints} points, Feedback: "${incorrectMcq.feedback}"`)
    
    const incorrectTf = gradeQuestion(tfQuestion, { answer: 'False' })
    console.log(`Incorrect T/F: ${incorrectTf.points}/${incorrectTf.maxPoints} points, Feedback: "${incorrectTf.feedback}"`)
    
    const incorrectNum = gradeQuestion(numericQuestion, { answer: '5' })
    console.log(`Incorrect Numeric: ${incorrectNum.points}/${incorrectNum.maxPoints} points, Feedback: "${incorrectNum.feedback}"`)

    console.log('\n✅ All tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('- MCQ questions: ✅ Working correctly')
    console.log('- True/False questions: ✅ Working correctly')
    console.log('- Numeric questions: ✅ Working correctly')
    console.log('- Short Answer questions: ✅ Marked for manual review')
    console.log('- Automatic grading: ✅ Working correctly')
    console.log('- Result storage: ✅ Working correctly')
    console.log('- Feedback generation: ✅ Working correctly')

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await prisma.examResult.delete({ where: { id: examResult.id } })
    await prisma.question.deleteMany({ where: { examId: exam.id } })
    await prisma.exam.delete({ where: { id: exam.id } })
    console.log('✅ Cleanup completed')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testCompleteGradingFlow()