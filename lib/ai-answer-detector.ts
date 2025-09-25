export interface AnswerAnalysis {
  answer: any
  confidence: number
  reasoning: string
  needsReview: boolean
}

export function detectAnswers(questions: any[]): any[] {
  return questions.map(question => ({
    ...question,
    analysis: analyzeQuestion(question)
  }))
}

function analyzeQuestion(question: any): AnswerAnalysis {
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
      return {
        answer: null,
        confidence: 0,
        reasoning: 'Unknown question type',
        needsReview: true
      }
  }
}

function analyzeMCQ(text: string, options: any): AnswerAnalysis {
  if (!options?.choices || !Array.isArray(options.choices)) {
    return {
      answer: 'A',
      confidence: 0.1,
      reasoning: 'No options provided',
      needsReview: true
    }
  }

  // Explicit answer patterns in question
  const explicitAnswers = [
    /answer is ([A-D])/i,
    /correct answer is ([A-D])/i,
    /\(([A-D])\) is correct/i
  ]

  for (const pattern of explicitAnswers) {
    const match = text.match(pattern)
    if (match) {
      return {
        answer: match[1].toUpperCase(),
        confidence: 0.95,
        reasoning: 'Answer explicitly stated in question',
        needsReview: false
      }
    }
  }

  // High confidence patterns in choices
  const highConfidencePatterns = [
    /^all of the above$/i,
    /^both a and b$/i,
    /^a and b only$/i
  ]

  for (let i = 0; i < options.choices.length; i++) {
    const choice = options.choices[i].trim()
    
    if (highConfidencePatterns.some(pattern => pattern.test(choice))) {
      return {
        answer: String.fromCharCode(65 + i),
        confidence: 0.9,
        reasoning: `High confidence pattern: "${choice}"`,
        needsReview: false
      }
    }
  }

  // Content-based analysis
  const questionLower = text.toLowerCase()
  let bestMatch = { index: -1, score: 0, reason: '' }

  for (let i = 0; i < options.choices.length; i++) {
    const choice = options.choices[i].toLowerCase()
    let score = 0
    let reasons = []

    // Check for key terms overlap
    const questionWords = questionLower.match(/\b\w{4,}\b/g) || []
    const choiceWords = choice.match(/\b\w{4,}\b/g) || []
    const overlap = questionWords.filter(word => choiceWords.includes(word)).length
    
    if (overlap > 0) {
      score += overlap * 0.2
      reasons.push(`${overlap} key terms match`)
    }

    // Numerical consistency
    const questionNums = questionLower.match(/\d+/g) || []
    const choiceNums = choice.match(/\d+/g) || []
    if (questionNums.length > 0 && choiceNums.length > 0) {
      const numMatch = questionNums.some(num => choiceNums.includes(num))
      if (numMatch) {
        score += 0.3
        reasons.push('numerical consistency')
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { index: i, score, reason: reasons.join(', ') }
    }
  }

  if (bestMatch.score > 0.3) {
    return {
      answer: String.fromCharCode(65 + bestMatch.index),
      confidence: Math.min(0.8, bestMatch.score),
      reasoning: `Content analysis: ${bestMatch.reason}`,
      needsReview: bestMatch.score < 0.6
    }
  }

  return {
    answer: 'A',
    confidence: 0.1,
    reasoning: 'No reliable indicators found',
    needsReview: true
  }
}

function analyzeTrueFalse(text: string): AnswerAnalysis {
  // Explicit answer patterns
  const explicitTrue = /\b(true|correct|yes)\b.*\?$/i
  const explicitFalse = /\b(false|incorrect|no)\b.*\?$/i
  
  if (explicitTrue.test(text)) {
    return {
      answer: true,
      confidence: 0.95,
      reasoning: 'Explicit true statement',
      needsReview: false
    }
  }
  
  if (explicitFalse.test(text)) {
    return {
      answer: false,
      confidence: 0.95,
      reasoning: 'Explicit false statement',
      needsReview: false
    }
  }

  // Strong indicators
  const strongTrue = [
    /\balways\b/i,
    /\bevery\b/i,
    /\ball\b.*\bare\b/i,
    /\bcorrect statement\b/i
  ]

  const strongFalse = [
    /\bnever\b/i,
    /\bno\b.*\bcan\b/i,
    /\bimpossible\b/i,
    /\bincorrect statement\b/i
  ]

  for (const pattern of strongTrue) {
    if (pattern.test(text)) {
      return {
        answer: true,
        confidence: 0.85,
        reasoning: 'Strong true indicator found',
        needsReview: false
      }
    }
  }

  for (const pattern of strongFalse) {
    if (pattern.test(text)) {
      return {
        answer: false,
        confidence: 0.85,
        reasoning: 'Strong false indicator found',
        needsReview: false
      }
    }
  }

  // Moderate indicators
  const moderateTrue = [/\busually\b/i, /\boften\b/i, /\btypically\b/i]
  const moderateFalse = [/\brarely\b/i, /\bseldom\b/i, /\bunlikely\b/i]

  for (const pattern of moderateTrue) {
    if (pattern.test(text)) {
      return {
        answer: true,
        confidence: 0.7,
        reasoning: 'Moderate true indicator',
        needsReview: true
      }
    }
  }

  for (const pattern of moderateFalse) {
    if (pattern.test(text)) {
      return {
        answer: false,
        confidence: 0.7,
        reasoning: 'Moderate false indicator',
        needsReview: true
      }
    }
  }

  return {
    answer: true,
    confidence: 0.2,
    reasoning: 'No clear indicators found',
    needsReview: true
  }
}

function analyzeShortAnswer(text: string): AnswerAnalysis {
  // Common patterns for extracting answers
  const patterns = [
    /what is ([^?]+)\?/i,
    /define ([^?]+)/i,
    /([A-Za-z\s]+) is called/i,
    /the term for ([^?]+)/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return {
        answer: match[1].trim(),
        confidence: 0.6,
        reasoning: 'Extracted from question pattern',
        needsReview: true
      }
    }
  }

  return {
    answer: '',
    confidence: 0.1,
    reasoning: 'Could not extract answer from question',
    needsReview: true
  }
}

function analyzeNumeric(text: string): AnswerAnalysis {
  // Simple arithmetic calculations
  const simpleCalc = /(\d+)\s*([+\-*/])\s*(\d+)/g
  const calcMatch = text.match(simpleCalc)
  
  if (calcMatch && calcMatch.length === 1) {
    const parts = calcMatch[0].match(/(\d+)\s*([+\-*/])\s*(\d+)/)
    if (parts) {
      const num1 = parseFloat(parts[1])
      const operator = parts[2]
      const num2 = parseFloat(parts[3])
      
      let result = 0
      switch (operator) {
        case '+': result = num1 + num2; break
        case '-': result = num1 - num2; break
        case '*': result = num1 * num2; break
        case '/': result = num1 / num2; break
      }
      
      return {
        answer: result,
        confidence: 0.9,
        reasoning: `Calculated: ${num1} ${operator} ${num2} = ${result}`,
        needsReview: false
      }
    }
  }

  // Single number in context
  const contextPatterns = [
    /answer is (\d+\.?\d*)/i,
    /equals (\d+\.?\d*)/i,
    /result is (\d+\.?\d*)/i
  ]

  for (const pattern of contextPatterns) {
    const match = text.match(pattern)
    if (match) {
      return {
        answer: parseFloat(match[1]),
        confidence: 0.9,
        reasoning: 'Answer explicitly stated',
        needsReview: false
      }
    }
  }

  // Single isolated number
  const numbers = text.match(/\b\d+\.?\d*\b/g)
  if (numbers && numbers.length === 1) {
    return {
      answer: parseFloat(numbers[0]),
      confidence: 0.7,
      reasoning: 'Single number found',
      needsReview: true
    }
  }

  return {
    answer: 0,
    confidence: 0.1,
    reasoning: 'No clear numeric answer found',
    needsReview: true
  }
}