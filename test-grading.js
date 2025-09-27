const { PrismaClient } = require('@prisma/client')
const { gradeQuestion } = require('./lib/grading')

const prisma = new PrismaClient()

async function testGrading() {
  try {
    // Get a sample question
    const question = await prisma.question.findFirst({
      where: { type: 'MCQ' }
    })
    
    if (!question) {
      console.log('No MCQ question found')
      return
    }
    
    console.log('Question:', {
      id: question.id,
      type: question.type,
      text: question.text,
      options: question.options,
      points: question.points
    })
    
    // Test with correct answer
    const correctOption = question.options?.find(opt => opt.correct)
    if (correctOption) {
      console.log('\nTesting with correct answer:', correctOption.text)
      const result = gradeQuestion(question, { answer: correctOption.text })
      console.log('Grading result:', result)
    }
    
    // Test with wrong answer
    const wrongOption = question.options?.find(opt => !opt.correct)
    if (wrongOption) {
      console.log('\nTesting with wrong answer:', wrongOption.text)
      const result = gradeQuestion(question, { answer: wrongOption.text })
      console.log('Grading result:', result)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGrading()