import { NextRequest, NextResponse } from 'next/server'
import { detectAnswers } from '@/lib/ai-answer-detector'

export async function POST(request: NextRequest) {
  try {
    const { questions } = await request.json()

    const analyzedQuestions = detectAnswers(questions)
    
    const summary = {
      total: analyzedQuestions.length,
      highConfidence: 0,
      mediumConfidence: 0,
      lowConfidence: 0,
      needsReview: 0
    }

    analyzedQuestions.forEach(q => {
      const confidence = q.analysis.confidence
      if (confidence >= 0.8) summary.highConfidence++
      else if (confidence >= 0.5) summary.mediumConfidence++
      else summary.lowConfidence++
      
      if (q.analysis.needsReview) summary.needsReview++
    })

    return NextResponse.json({
      success: true,
      questions: analyzedQuestions,
      summary,
      readyForUse: summary.needsReview === 0
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}