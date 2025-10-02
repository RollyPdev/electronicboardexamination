import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

function parseMCQQuestion(fullText: string) {
  // Extract question part (before first choice)
  const questionMatch = fullText.match(/^([\s\S]*?)(?=\r?\n?[A-D]\.|$)/)
  const question = questionMatch ? questionMatch[1].trim() : fullText
  
  // Extract choices (A., B., C., D.) - improved regex
  const choiceMatches = fullText.match(/[A-D]\.\s*[^\r\n]*(?=\r?\n?[A-D]\.|\r?\n?Correct|$)/g) || []
  const options = choiceMatches.map((choice: any) => {
    return choice.replace(/^[A-D]\.\s*/, '').trim()
  })
  
  // Extract correct answer (look for "Correct Answer: X" pattern)
  const correctMatch = fullText.match(/Correct\s+Answer:\s*([A-D])/i)
  let correctAnswer = ''
  if (correctMatch && options.length > 0) {
    const correctIndex = correctMatch[1].charCodeAt(0) - 65 // A=0, B=1, etc.
    correctAnswer = options[correctIndex] || ''
  }
  
  return {
    question,
    options,
    correctAnswer
  }
}

async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (authReq) => {
    try {
      const { id } = await params
      const requestBody = await request.json()
      console.log('Request body:', requestBody)
      const { type, text, question, options, correctAnswer, points } = requestBody
      
      let questionText = text || question
      let parsedOptions = options || []
      let parsedCorrectAnswer = correctAnswer
      
      // Auto-parse MCQ questions from text if no options provided
      if (type === 'MCQ' && questionText && (!options || options.length === 0)) {
        const parseResult = parseMCQQuestion(questionText)
        questionText = parseResult.question
        parsedOptions = parseResult.options
        parsedCorrectAnswer = parseResult.correctAnswer || correctAnswer
      } else if (type === 'MCQ' && Array.isArray(options) && options.length > 0) {
        parsedOptions = options
      }
      
      if (!questionText) {
        console.error('Question text is missing:', { questionText, text, question })
        return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
      }
      
      if (!type) {
        console.error('Question type is missing:', { type })
        return NextResponse.json({ error: 'Question type is required' }, { status: 400 })
      }
      
      // Check if exam exists
      const exam = await (prisma as any).exam.findUnique({
        where: { id }
      })
      
      if (!exam) {
        console.error('Exam not found:', { examId: id })
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Start transaction to create question and choices
      const result = await (prisma as any).$transaction(async (tx: any) => {
        // Create the question
        const newQuestion = await tx.question.create({
          data: {
            examId: id,
            type,
            text: questionText,
            correctAnswer: parsedCorrectAnswer,
            points: points || 1,
            order: requestBody.order || 0
          }
        })

        // Create choices for MCQ questions
        if (type === 'MCQ' && Array.isArray(parsedOptions) && parsedOptions.length > 0) {
          const choices = await Promise.all(
            parsedOptions.map((option, index) => {
              const optionText = typeof option === 'string' ? option : option.text || option
              return tx.choice.create({
                data: {
                  questionId: newQuestion.id,
                  text: optionText,
                  label: String.fromCharCode(65 + index), // A, B, C, D
                  isCorrect: optionText === parsedCorrectAnswer,
                  order: index + 1
                }
              })
            })
          )
          
          return { ...newQuestion, choices }
        }

        return newQuestion
      })
      
      console.log('Question created successfully:', result)

      return NextResponse.json(result)
    } catch (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

// GET /api/admin/exams/[id]/questions - Get all questions for an exam
async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth(request, async (authReq) => {
    try {
      const { id } = await params

      // Check if exam exists and user has permission
      const exam = await (prisma as any).exam.findUnique({
        where: { id },
        include: {
          questions: {
            include: {
              choices: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })

      if (!exam) {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
      }

      // Check if user is the creator or admin
      if (exam.creatorId !== authReq.user!.id && authReq.user!.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      return NextResponse.json({
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description
        },
        questions: exam.questions.map((question: any) => ({
          id: question.id,
          type: question.type,
          text: question.text,
          correctAnswer: question.correctAnswer,
          points: question.points,
          order: question.order,
          choices: question.choices.map((choice: any) => ({
            id: choice.id,
            text: choice.text,
            label: choice.label,
            isCorrect: choice.isCorrect,
            order: choice.order
          }))
        }))
      })
    } catch (error) {
      console.error('Error fetching questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }
  })
}

export { POST, GET }