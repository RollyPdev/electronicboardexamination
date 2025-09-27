import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await ((prisma as any).user as any).findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Allow ADMIN, STUDENT, and PROCTOR roles to view results
    if (!['ADMIN', 'STUDENT', 'PROCTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log('Fetching results for user:', user.id, user.email, 'Role:', user.role)
    
    // For ADMIN and PROCTOR, show all results. For STUDENT, show only their results
    // Only show submitted or graded exams (not in-progress)
    const whereClause = user.role === 'ADMIN' || user.role === 'PROCTOR' 
      ? { status: { in: ['SUBMITTED', 'GRADED'] } } // Show all submitted/graded results for admins and proctors
      : { userId: user.id, status: { in: ['SUBMITTED', 'GRADED'] } } // Show only user's submitted/graded results for students
    
    const results = await ((prisma as any).examResult as any).findMany({
      where: whereClause,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            durationMin: true,
            questions: {
              select: { points: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${results.length} exam results for ${user.role} user ${session.user.email}`)
    
    // Log each result for debugging
    results.forEach((result: any, index: number) => {
      console.log(`Result ${index + 1}:`, {
        id: result.id,
        examTitle: result.exam.title,
        status: result.status,
        score: result.score,
        maxScore: result.maxScore,
        submittedAt: result.submittedAt,
        gradedAt: result.gradedAt
      })
    })

    // Get student info for admin/proctor views
    const studentIds = [...new Set(results.map((r: any) => r.userId))]
    const students = await ((prisma as any).user as any).findMany({
      where: { id: { in: studentIds } },
      select: { id: true, name: true, email: true }
    })
    const studentMap = new Map(students.map((s: any) => [s.id, s]))

    const formattedResults = results.map((result: any) => {
      const calculatedMaxScore = result.exam.questions.reduce((sum: any, q: any) => sum + q.points, 0)
      const actualMaxScore = result.maxScore || calculatedMaxScore
      const percentage = result.score && actualMaxScore ? Math.round((result.score / actualMaxScore) * 100) : null
      const student = studentMap.get(result.userId)
      
      return {
        id: result.id,
        examId: result.examId,
        examTitle: result.exam.title,
        examDescription: result.exam.description,
        durationMin: result.exam.durationMin,
        questionCount: result.exam.questions.length,
        maxScore: actualMaxScore,
        score: result.score,
        percentage,
        status: result.status,
        startedAt: result.startedAt,
        submittedAt: result.submittedAt,
        gradedAt: result.gradedAt,
        hasAnswers: !!result.answers && Object.keys(result.answers).length > 0,
        answersCount: result.answers ? Object.keys(result.answers).length : 0,
        // Include student info for admin/proctor views
        studentName: student?.name,
        studentEmail: student?.email,
        isOwnResult: result.userId === user.id
      }
    })
    
    console.log('Formatted results:', formattedResults.map(r => ({
      id: r.id,
      examTitle: r.examTitle,
      status: r.status,
      score: r.score,
      maxScore: r.maxScore,
      percentage: r.percentage
    })))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error('Error fetching student results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}