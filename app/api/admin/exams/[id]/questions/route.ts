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

      // Format options for different question types
      let formattedOptions: any = null
      if (type === 'MCQ' && Array.isArray(parsedOptions) && parsedOptions.length > 0) {
        formattedOptions = parsedOptions.map((option, index) => {
          const optionText = typeof option === 'string' ? option : option.text || option
          return {
            label: String.fromCharCode(65 + index), // A, B, C, D
            text: optionText,
            correct: optionText === parsedCorrectAnswer
          }
        })
      } else if (type === 'TRUE_FALSE') {
        formattedOptions = [
          { label: 'True', text: 'True', correct: parsedCorrectAnswer === 'True' },
          { label: 'False', text: 'False', correct: parsedCorrectAnswer === 'False' }
        ]
      } else if (type === 'NUMERIC' && parsedCorrectAnswer) {
        formattedOptions = [{
          correct_answer: parseFloat(parsedCorrectAnswer),
          tolerance: requestBody.tolerance || 0.01
        }]
      } else if (type === 'SHORT_ANSWER' && parsedCorrectAnswer) {
        formattedOptions = [{
          sample_answer: parsedCorrectAnswer,
          keywords: requestBody.keywords || []
        }]
      }
      
      console.log('Parsed question:', { questionText, formattedOptions, parsedCorrectAnswer })
      
      const createData = {
        examId: id,
        type,
        text: questionText,
        options: formattedOptions,
        points: points || 1,
      }
      console.log('Creating question with data:', createData)

      const newQuestion = await (prisma as any).question.create({
        data: createData,
      })
      
      console.log('Question created successfully:', newQuestion)

      return NextResponse.json(newQuestion)
    } catch (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })
}

export { POST }