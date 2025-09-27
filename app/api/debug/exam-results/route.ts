import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all exam results with details
    const examResults = await (prisma as any).examResult.findMany({
      include: {
        exam: {
          select: {
            id: true,
            title: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get count by status
    const statusCounts = await (prisma as any).examResult.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      examResults,
      statusCounts,
      totalResults: examResults.length
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}