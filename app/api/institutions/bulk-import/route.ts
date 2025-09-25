import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface HEIRecord {
  region: string
  heiName: string
  heiType: string
}

export async function POST(request: NextRequest) {
  try {
    const { data }: { data: HEIRecord[] } = await request.json()

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Data must be an array of HEI records' },
        { status: 400 }
      )
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    }

    for (const record of data) {
      try {
        const { region, heiName, heiType } = record

        if (!region || !heiName || !heiType) {
          results.errors.push(`Missing required fields for: ${heiName || 'Unknown'}`)
          continue
        }

        // Parse region to extract region name and code
        const regionMatch = region.match(/^(\d+[A-Z]?)\s*-\s*(.+)$/)
        const regionCode = regionMatch ? regionMatch[1] : ''
        const regionName = regionMatch ? regionMatch[2] : region

        // Determine ownership type
        const ownership = heiType.includes('Private') ? 'Private' : 
                         heiType.includes('SUC') ? 'Public' : 
                         heiType.includes('LUC') ? 'Public' : 'Private'

        // Clean institution type
        const institutionType = heiType.replace(/Private HEI|SUC|LUC/g, '').trim() || 'HEI'

        // Try to upsert the institution
        await (prisma as any).institution.upsert({
          where: {
            name_region_province: {
              name: heiName,
              region: regionName,
              province: regionName // Using region as province for now
            }
          },
          update: {
            type: institutionType,
            ownership,
            updatedAt: new Date()
          },
          create: {
            name: heiName,
            altNames: [],
            type: institutionType,
            ownership,
            region: regionName,
            province: regionName,
            cityMunicipality: '',
            source: 'Manual Import',
            sourceDate: new Date()
          }
        })

        results.created++
      } catch (error) {
        results.errors.push(`Error processing ${record.heiName}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${data.length} records`,
      results
    })

  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}