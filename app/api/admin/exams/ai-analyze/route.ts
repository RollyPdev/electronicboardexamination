import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json()

    const analyzedQuestions = questions.map((q: any) => {
      const analysis = analyzeQuestion(q)
      return {
        ...q,
        suggestedAnswer: analysis.answer,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning
      }
    })

    return NextResponse.json({
      success: true,
      questions: analyzedQuestions
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}

function analyzeQuestion(question: any) {
  const { type, text, options } = question

  switch (type) {
    case 'MCQ':
      return analyzeMCQ(text, options)
    case 'TRUE_FALSE':
      return analyzeTrueFalse(text)
    case 'SHORT_ANSWER':
      return analyzeShortAnswer(text)
    case 'NUMERIC':
      return analyzeNumeric(text)
    default:
      return { answer: null, confidence: 0, reasoning: 'Unknown question type' }
  }
}

function analyzeMCQ(text: string, options: any) {
  const keywords = {
    correct: ['correct', 'right', 'true', 'yes', 'all of the above'],
    incorrect: ['incorrect', 'wrong', 'false', 'no', 'none of the above']
  }

  if (options?.choices) {
    for (let i = 0; i < options.choices.length; i++) {
      const choice = options.choices[i].toLowerCase()
      
      if (keywords.correct.some(k => choice.includes(k))) {
        return {
          answer: String.fromCharCode(65 + i),
          confidence: 0.7,
          reasoning: 'Contains positive keywords'
        }
      }
    }
  }

  return {
    answer: 'A',
    confidence: 0.3,
    reasoning: 'Default to first option - manual review needed'
  }
}

function analyzeTrueFalse(text: string) {
  const trueKeywords = ['always', 'all', 'every', 'correct', 'true']
  const falseKeywords = ['never', 'none', 'no', 'incorrect', 'false']

  const textLower = text.toLowerCase()
  const trueScore = trueKeywords.filter((k: any) => textLower.includes(k)).length
  const falseScore = falseKeywords.filter((k: any) => textLower.includes(k)).length

  if (trueScore > falseScore) {
    return { answer: 'TRUE', confidence: 0.6, reasoning: 'Contains positive indicators' }
  } else if (falseScore > trueScore) {
    return { answer: 'FALSE', confidence: 0.6, reasoning: 'Contains negative indicators' }
  }

  return { answer: 'TRUE', confidence: 0.3, reasoning: 'No clear indicators - manual review needed' }
}

function analyzeShortAnswer(text: string) {
  const matches = text.match(/is\s+([A-Za-z\s]+)|called\s+([A-Za-z\s]+)|known\s+as\s+([A-Za-z\s]+)/i)
  
  if (matches) {
    const answer = matches[1] || matches[2] || matches[3]
    return {
      answer: answer.trim(),
      confidence: 0.5,
      reasoning: 'Extracted from question pattern'
    }
  }

  return {
    answer: '',
    confidence: 0.2,
    reasoning: 'Could not extract answer - manual input required'
  }
}

function analyzeNumeric(text: string) {
  const numbers = text.match(/\d+\.?\d*/g)
  
  if (numbers && numbers.length === 1) {
    return {
      answer: parseFloat(numbers[0]),
      confidence: 0.8,
      reasoning: 'Single number found in question'
    }
  }

  return {
    answer: 0,
    confidence: 0.2,
    reasoning: 'Multiple or no numbers found - manual review needed'
  }
}