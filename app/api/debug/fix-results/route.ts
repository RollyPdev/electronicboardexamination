import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { gradeExam } from '@/lib/grading'

export async function POST(request: NextRequest) {
  try {
    // Find all submitted exams that haven't been graded
    const ungraded = await (prisma as any).examResult.findMany({
      where: {
        OR: [
          { status: 'SUBMITTED', score: null },
          { status: 'IN_PROGRESS', submittedAt: { not: null } }
        ]
      },
      include: {
        exam: {
          include: {
            questions: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${ungraded.length} ungraded exam results`)

    const results = []
    
    for (const examResult of ungraded) {
      try {
        console.log(`Processing exam result ${examResult.id} for ${examResult.user.email}`)
        
        // Update status to SUBMITTED if it's still IN_PROGRESS but has submittedAt
        if (examResult.status === 'IN_PROGRESS' && examResult.submittedAt) {
          await (prisma as any).examResult.update({
            where: { id: examResult.id },
            data: { status: 'SUBMITTED' }
          })
        }
        
        // Grade the exam
        const gradingResult = await gradeExam(examResult.id)
        
        results.push({
          examResultId: examResult.id,
          studentEmail: examResult.user.email,
          examTitle: examResult.exam.title,
          success: true,
          score: gradingResult.totalScore,
          maxScore: gradingResult.maxScore,
          percentage: gradingResult.percentage,
          status: gradingResult.needsManualReview ? 'SUBMITTED' : 'GRADED'
        })
        
        console.log(`Successfully graded exam result ${examResult.id}: ${gradingResult.totalScore}/${gradingResult.maxScore}`)
        
      } catch (error) {
        console.error(`Failed to grade exam result ${examResult.id}:`, error)
        results.push({
          examResultId: examResult.id,
          studentEmail: examResult.user.email,
          examTitle: examResult.exam.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${ungraded.length} exam results`,
      totalProcessed: ungraded.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    })
    
  } catch (error) {
    console.error('Error fixing results:', error)
    return NextResponse.json({ 
      error: 'Failed to fix results',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}