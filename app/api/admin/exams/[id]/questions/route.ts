import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { type, text, question, options, correctAnswer, points } = await request.json()
    
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
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
    }

    // Format options for MCQ questions
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
    }
    
    console.log('Parsed question:', { questionText, formattedOptions, parsedCorrectAnswer })

    const newQuestion = await (prisma as any).question.create({
      data: {
        examId: id,
        type,
        text: questionText,
        options: formattedOptions,
        points: points || 1,
      },
    })

    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}