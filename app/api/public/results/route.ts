import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCLEResult } from '@/lib/cle-scoring'

async function GET(req: NextRequest) {
  try {
    // Fetch CLE exam results
    const results = await (prisma as any).examResult.findMany({
      where: {
        status: 'GRADED',
        exam: {
          title: {
            contains: 'Criminologist',
            mode: 'insensitive'
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        exam: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })

    // Mock data for demonstration
    const mockResults = [
      { name: 'Juan Dela Cruz', school: 'University of the Philippines', generalAverage: 89.5, status: 'PASS' },
      { name: 'Maria Santos', school: 'Ateneo de Manila University', generalAverage: 87.2, status: 'PASS' },
      { name: 'Jose Rizal', school: 'De La Salle University', generalAverage: 85.8, status: 'PASS' },
      { name: 'Ana Garcia', school: 'University of Santo Tomas', generalAverage: 84.3, status: 'PASS' },
      { name: 'Pedro Martinez', school: 'Far Eastern University', generalAverage: 82.7, status: 'PASS' },
      { name: 'Carmen Lopez', school: 'Adamson University', generalAverage: 81.4, status: 'PASS' },
      { name: 'Miguel Torres', school: 'San Beda University', generalAverage: 80.9, status: 'PASS' },
      { name: 'Sofia Reyes', school: 'Lyceum of the Philippines', generalAverage: 79.6, status: 'PASS' },
      { name: 'Carlos Mendoza', school: 'Arellano University', generalAverage: 78.8, status: 'PASS' },
      { name: 'Isabella Cruz', school: 'Philippine Christian University', generalAverage: 77.5, status: 'PASS' },
      { name: 'Roberto Silva', school: 'Centro Escolar University', generalAverage: 76.9, status: 'PASS' },
      { name: 'Lucia Fernandez', school: 'New Era University', generalAverage: 76.2, status: 'PASS' },
      { name: 'Diego Morales', school: 'Philippine Normal University', generalAverage: 75.8, status: 'PASS' },
      { name: 'Valentina Herrera', school: 'Technological University of the Philippines', generalAverage: 75.3, status: 'PASS' },
      { name: 'Francisco Jimenez', school: 'Polytechnic University of the Philippines', generalAverage: 75.1, status: 'PASS' }
    ]

    const formattedResults = mockResults.map((result, index) => ({
      id: `mock-${index + 1}`,
      rank: index + 1,
      studentName: result.name,
      school: result.school,
      generalAverage: result.generalAverage,
      status: result.status as 'PASS' | 'DEFERRED' | 'FAIL'
    }))

    // Mock completion tracking
    const totalStudents = 50
    const completedStudents = 35
    const completionPercentage = Math.round((completedStudents / totalStudents) * 100)
    const isComplete = completionPercentage >= 100

    // Split into top 10 and others
    const topResults = isComplete ? formattedResults.slice(0, 10) : []
    const passedResults = isComplete ? formattedResults.slice(10).filter((r: any) => r.status === 'PASS') : []

    return NextResponse.json({
      topResults,
      passedResults,
      completionPercentage,
      isComplete
    })
  } catch (error) {
    console.error('Error fetching public results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

export { GET }