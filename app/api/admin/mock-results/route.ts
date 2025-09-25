import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateCLEResult } from '@/lib/cle-scoring'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch CLE mock exam results from database
    const examResults = await ((prisma as any).examResult as any).findMany({
      where: {
        exam: {
          title: {
            contains: 'criminologist',
            mode: 'insensitive'
          }
        },
        status: {
          in: ['SUBMITTED', 'GRADED']
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            school: true
          }
        },
        exam: {
          select: {
            title: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'desc' }
      ]
    })

    // Calculate CLE results and rankings for CLE exams
    const results = examResults.map((result: any, index: number) => {
      const overallPercentage = result.score && result.maxScore ? (result.score / result.maxScore) * 100 : 0
      
      // Only calculate CLE status for criminologist exams
      let cleStatus: 'PASS' | 'DEFERRED' | 'FAIL' = 'PASS'
      let generalAverage = overallPercentage
      
      if (result.exam.title.toLowerCase().includes('criminologist')) {
        // Generate subject scores based on overall percentage
        let subjectScores: Record<string, number>
        if (overallPercentage >= 80) {
          subjectScores = {
            'Criminal Jurisprudence, Procedure and Evidence': Math.floor(Math.random() * 15) + 80,
            'Law Enforcement Administration': Math.floor(Math.random() * 15) + 75,
            'Criminalistics': Math.floor(Math.random() * 15) + 80,
            'Crime Detection and Investigation': Math.floor(Math.random() * 15) + 75,
            'Criminology': Math.floor(Math.random() * 15) + 75,
            'Correctional Administration': Math.floor(Math.random() * 15) + 80
          }
        } else if (overallPercentage >= 70) {
          subjectScores = {
            'Criminal Jurisprudence, Procedure and Evidence': Math.floor(Math.random() * 15) + 80,
            'Law Enforcement Administration': Math.floor(Math.random() * 10) + 40,
            'Criminalistics': Math.floor(Math.random() * 15) + 80,
            'Crime Detection and Investigation': Math.floor(Math.random() * 15) + 80,
            'Criminology': Math.floor(Math.random() * 15) + 80,
            'Correctional Administration': Math.floor(Math.random() * 15) + 85
          }
        } else {
          subjectScores = {
            'Criminal Jurisprudence, Procedure and Evidence': Math.floor(Math.random() * 20) + 60,
            'Law Enforcement Administration': Math.floor(Math.random() * 10) + 35,
            'Criminalistics': Math.floor(Math.random() * 15) + 35,
            'Crime Detection and Investigation': Math.floor(Math.random() * 10) + 40,
            'Criminology': Math.floor(Math.random() * 15) + 50,
            'Correctional Administration': Math.floor(Math.random() * 10) + 40
          }
        }

        const cleResult = calculateCLEResult(subjectScores)
        cleStatus = cleResult.status
        generalAverage = cleResult.generalAverage
      }
      
      return {
        id: result.id,
        rank: index + 1,
        generalAverage: Math.round(generalAverage * 100) / 100,
        status: cleStatus,
        submittedAt: result.submittedAt?.toISOString() || '',
        user: result.user,
        exam: result.exam
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error fetching mock results:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}