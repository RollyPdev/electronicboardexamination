const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestResult() {
  console.log('Creating test exam result with answers...')
  
  // Get the sample exam
  const exam = await prisma.exam.findFirst({
    where: { title: 'Sample Board Examination' },
    include: { questions: true }
  })
  
  if (!exam) {
    console.log('No sample exam found')
    return
  }
  
  // Get student user
  const student = await prisma.user.findFirst({
    where: { email: 'student@example.com' }
  })
  
  if (!student) {
    console.log('No student user found')
    return
  }
  
  console.log('Found exam:', exam.title, 'with', exam.questions.length, 'questions')
  console.log('Student:', student.email)
  
  // Create or update exam result with sample answers
  const answers = {}
  let totalScore = 0
  let maxScore = 0
  
  exam.questions.forEach((question, index) => {
    maxScore += question.points
    
    // Create sample answers based on question type
    let sampleAnswer = null
    let isCorrect = false
    
    if (question.type === 'MCQ' && question.options) {
      const options = Array.isArray(question.options) ? question.options : []
      const correctOption = options.find(opt => opt.correct)
      
      // Give correct answer for first 3 questions, wrong for others
      if (index < 3 && correctOption) {
        sampleAnswer = correctOption.text
        isCorrect = true
        totalScore += question.points
      } else if (options.length > 0) {
        // Give wrong answer
        const wrongOption = options.find(opt => !opt.correct)
        sampleAnswer = wrongOption ? wrongOption.text : options[0].text
      }
    } else if (question.type === 'TRUE_FALSE' && question.options) {
      const options = Array.isArray(question.options) ? question.options : []
      const correctOption = options.find(opt => opt.correct)
      
      if (index < 3 && correctOption) {
        sampleAnswer = correctOption.text
        isCorrect = true
        totalScore += question.points
      } else {
        sampleAnswer = correctOption?.text === 'True' ? 'False' : 'True'
      }
    }
    
    if (sampleAnswer) {
      answers[question.id] = {
        answer: sampleAnswer,
        timeSpent: Math.floor(Math.random() * 60) + 30,
        submittedAt: new Date().toISOString()
      }
      
      console.log(`Q${index + 1} (${question.type}):`, {
        answer: sampleAnswer,
        correct: isCorrect,
        points: isCorrect ? question.points : 0
      })
    }
  })
  
  // Create or update exam result
  const examResult = await prisma.examResult.upsert({
    where: {
      examId_userId: {
        examId: exam.id,
        userId: student.id
      }
    },
    update: {
      answers,
      score: totalScore,
      maxScore,
      status: 'GRADED',
      submittedAt: new Date(),
      gradedAt: new Date()
    },
    create: {
      examId: exam.id,
      userId: student.id,
      answers,
      score: totalScore,
      maxScore,
      status: 'GRADED',
      submittedAt: new Date(),
      gradedAt: new Date()
    }
  })
  
  console.log('\n✅ Test result created:')
  console.log('Result ID:', examResult.id)
  console.log('Score:', totalScore, '/', maxScore, `(${Math.round(totalScore/maxScore*100)}%)`)
  console.log('Answers saved:', Object.keys(answers).length)
  console.log('Status:', examResult.status)
}

createTestResult()
  .catch(console.error)
  .finally(() => prisma.$disconnect())