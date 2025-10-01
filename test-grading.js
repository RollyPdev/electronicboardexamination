const { PrismaClient } = require('@prisma/client')
// Import grading function
const gradeQuestion = (question, answer) => {
  let isCorrect = false
  let feedback = ''
  
  switch (question.type) {
    case 'MCQ':
      const correctOption = question.options?.find(opt => opt.correct)
      if (correctOption && answer.answer) {
        isCorrect = answer.answer === correctOption.text || answer.answer === correctOption.label
      }
      if (!isCorrect && correctOption) {
        feedback = `Correct answer: ${correctOption.label}) ${correctOption.text}`
      }
      break
    case 'TRUE_FALSE':
      const correctTF = question.options?.find(opt => opt.correct)
      isCorrect = answer.answer === correctTF?.text
      if (!isCorrect && correctTF) {
        feedback = `Correct answer: ${correctTF.text}`
      }
      break
  }
  
  return {
    questionId: question.id,
    points: isCorrect ? question.points : 0,
    maxPoints: question.points,
    isCorrect,
    feedback
  }
}

const prisma = new PrismaClient()

async function testGrading() {
  console.log('Testing grading system...')
  
  // Test MCQ question
  const mcqQuestion = {
    id: 'test-mcq',
    type: 'MCQ',
    text: 'What is 2 + 2?',
    options: [
      { label: 'A', text: '3', correct: false },
      { label: 'B', text: '4', correct: true },
      { label: 'C', text: '5', correct: false },
      { label: 'D', text: '6', correct: false }
    ],
    points: 1
  }
  
  // Test correct answer
  const correctAnswer = { answer: '4' }
  const correctResult = gradeQuestion(mcqQuestion, correctAnswer)
  console.log('Correct MCQ result:', correctResult)
  
  // Test wrong answer
  const wrongAnswer = { answer: '3' }
  const wrongResult = gradeQuestion(mcqQuestion, wrongAnswer)
  console.log('Wrong MCQ result:', wrongResult)
  
  // Test True/False question
  const tfQuestion = {
    id: 'test-tf',
    type: 'TRUE_FALSE',
    text: 'The sky is blue.',
    options: [
      { label: 'True', text: 'True', correct: true },
      { label: 'False', text: 'False', correct: false }
    ],
    points: 1
  }
  
  const tfCorrect = { answer: 'True' }
  const tfResult = gradeQuestion(tfQuestion, tfCorrect)
  console.log('True/False result:', tfResult)
  
  // Check if there are any actual exam results to test
  const examResults = await prisma.examResult.findMany({
    where: { status: { in: ['SUBMITTED', 'GRADED'] } },
    include: {
      exam: {
        include: { questions: true }
      }
    },
    take: 1
  })
  
  if (examResults.length > 0) {
    console.log('\nTesting with real exam data...')
    const result = examResults[0]
    console.log('Exam:', result.exam.title)
    console.log('Questions:', result.exam.questions.length)
    console.log('Answers:', Object.keys(result.answers || {}).length)
    console.log('Current score:', result.score, '/', result.maxScore)
    
    // Test grading each question
    const answers = result.answers || {}
    result.exam.questions.forEach((question, index) => {
      const answer = answers[question.id]
      if (answer) {
        const gradingResult = gradeQuestion(question, answer)
        console.log(`Q${index + 1}:`, {
          type: question.type,
          studentAnswer: answer.answer,
          isCorrect: gradingResult.isCorrect,
          points: gradingResult.points,
          feedback: gradingResult.feedback
        })
      }
    })
  }
}

testGrading()
  .catch(console.error)
  .finally(() => prisma.$disconnect())