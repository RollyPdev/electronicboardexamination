import { NextRequest, NextResponse } from 'next/server'
import { UnifastScraper } from '@/lib/unifast-scraper'

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (optional - add your auth logic here)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const scraper = new UnifastScraper()
    const result = await scraper.syncToDatabase()

    return NextResponse.json({
      success: true,
      message: 'Institutions sync completed successfully',
      data: result
    })

  } catch (error) {
    console.error('Error syncing institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to trigger institutions sync',
    endpoint: '/api/institutions/sync',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <your-token>',
      'Content-Type': 'application/json'
    }
  })
}