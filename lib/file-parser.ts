import mammoth from 'mammoth'

export interface ParsedQuestion {
  text: string
  choices: string[]
  correctAnswer: string
  correctAnswerIndex: number
}

export interface ParsingResult {
  questions: ParsedQuestion[]
  errors: string[]
  totalQuestions: number
}

/**
 * Parse a text file containing exam questions
 */
export function parseTextFile(content: string): ParsingResult {
  const errors: string[] = []
  const questions: ParsedQuestion[] = []
  
  // Split content by double newlines or question numbers
  const questionBlocks = content
    .split(/\n\s*\n|\d+\.\s*/)
    .map(block => block.trim())
    .filter(block => block.length > 0)

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i]
    
    try {
      const question = parseSingleQuestion(block)
      if (question) {
        questions.push(question)
      } else {
        errors.push(`Could not parse question block ${i + 1}: ${block.substring(0, 100)}...`)
      }
    } catch (error) {
      errors.push(`Error parsing question ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    questions,
    errors,
    totalQuestions: questions.length
  }
}

/**
 * Parse a single question from text
 */
function parseSingleQuestion(text: string): ParsedQuestion | null {
  // Remove extra whitespace and normalize line endings
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
  
  if (!cleanText) return null

  // Extract question text (everything before the first choice)
  const questionMatch = cleanText.match(/^([\s\S]*?)(?=\n[A-D]\.|\nCorrect\s+Answer:|$)/)
  const questionText = questionMatch ? questionMatch[1].trim() : cleanText

  if (!questionText) return null

  // Extract choices (A., B., C., D.)
  const choiceRegex = /^[A-D]\.\s*([^\n\r]+)/gm
  const choices: string[] = []
  let match

  while ((match = choiceRegex.exec(cleanText)) !== null) {
    choices.push(match[1].trim())
  }

  if (choices.length === 0) return null

  // Extract correct answer
  const correctAnswerMatch = cleanText.match(/Correct\s+Answer:\s*([A-D])/i)
  let correctAnswer = ''
  let correctAnswerIndex = -1

  if (correctAnswerMatch) {
    const correctLetter = correctAnswerMatch[1].toUpperCase()
    correctAnswerIndex = correctLetter.charCodeAt(0) - 65 // A=0, B=1, etc.
    
    if (correctAnswerIndex >= 0 && correctAnswerIndex < choices.length) {
      correctAnswer = choices[correctAnswerIndex]
    } else {
      correctAnswer = correctLetter
    }
  } else {
    // Try to find correct answer by looking for patterns like "Answer: A" or "Ans: B"
    const altAnswerMatch = cleanText.match(/(?:Answer|Ans):\s*([A-D])/i)
    if (altAnswerMatch) {
      const correctLetter = altAnswerMatch[1].toUpperCase()
      correctAnswerIndex = correctLetter.charCodeAt(0) - 65
      if (correctAnswerIndex >= 0 && correctAnswerIndex < choices.length) {
        correctAnswer = choices[correctAnswerIndex]
      }
    }
  }

  return {
    text: questionText,
    choices,
    correctAnswer,
    correctAnswerIndex
  }
}

/**
 * Parse a DOCX file containing exam questions
 */
export async function parseDocxFile(buffer: Buffer): Promise<ParsingResult> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    const content = result.value
    
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages)
    }
    
    return parseTextFile(content)
  } catch (error) {
    return {
      questions: [],
      errors: [`Failed to parse DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      totalQuestions: 0
    }
  }
}

/**
 * Validate parsed questions
 */
export function validateQuestions(questions: ParsedQuestion[]): string[] {
  const errors: string[] = []

  questions.forEach((question, index) => {
    if (!question.text || question.text.trim().length === 0) {
      errors.push(`Question ${index + 1}: Missing question text`)
    }

    if (!question.choices || question.choices.length < 2) {
      errors.push(`Question ${index + 1}: Must have at least 2 choices`)
    }

    if (question.choices.length > 10) {
      errors.push(`Question ${index + 1}: Too many choices (max 10)`)
    }

    if (!question.correctAnswer || question.correctAnswer.trim().length === 0) {
      errors.push(`Question ${index + 1}: Missing correct answer`)
    }

    if (question.correctAnswerIndex < 0 || question.correctAnswerIndex >= question.choices.length) {
      errors.push(`Question ${index + 1}: Invalid correct answer index`)
    }

    // Check for duplicate choices
    const uniqueChoices = new Set(question.choices.map(choice => choice.toLowerCase().trim()))
    if (uniqueChoices.size !== question.choices.length) {
      errors.push(`Question ${index + 1}: Duplicate choices found`)
    }
  })

  return errors
}

/**
 * Format questions for database insertion
 */
export function formatQuestionsForDatabase(
  questions: ParsedQuestion[], 
  examId: string
): Array<{
  examId: string
  type: string
  text: string
  correctAnswer: string
  points: number
  order: number
  choices: Array<{
    text: string
    label: string
    isCorrect: boolean
    order: number
  }>
}> {
  return questions.map((question, index) => ({
    examId,
    type: 'MCQ',
    text: question.text,
    correctAnswer: question.correctAnswer,
    points: 1,
    order: index + 1,
    choices: question.choices.map((choice, choiceIndex) => ({
      text: choice,
      label: String.fromCharCode(65 + choiceIndex), // A, B, C, D
      isCorrect: choiceIndex === question.correctAnswerIndex,
      order: choiceIndex + 1
    }))
  }))
}




