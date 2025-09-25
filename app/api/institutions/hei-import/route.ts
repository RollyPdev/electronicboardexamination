import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

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

        const regionMatch = region.match(/^(\d+[A-Z]?)\s*-\s*(.+)$/)
        const regionName = regionMatch ? regionMatch[2] : region

        const ownership = heiType.includes('Private') ? 'Private' : 
                         heiType.includes('SUC') ? 'Public' : 
                         heiType.includes('LUC') ? 'Public' : 'Private'

        const institutionType = heiType.replace(/Private HEI|SUC|LUC/g, '').trim() || 'HEI'

        const cityMatch = heiName.match(/-([^-]+)$/)
        const cityMunicipality = cityMatch ? cityMatch[1].trim() : ''

        await (prisma as any).institution.upsert({
          where: {
            name_region_province: {
              name: heiName,
              region: regionName,
              province: regionName
            }
          },
          update: {
            type: institutionType,
            ownership,
            cityMunicipality,
            updatedAt: new Date()
          },
          create: {
            name: heiName,
            altNames: [],
            type: institutionType,
            ownership,
            region: regionName,
            province: regionName,
            cityMunicipality,
            source: 'HEI Import',
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
      message: `Processed ${data.length} HEI records`,
      results
    })

  } catch (error) {
    console.error('Error in HEI import:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'HEI Import API - Ready to accept POST requests with HEI data',
    expectedFormat: {
      data: [
        {
          region: "01 - Ilocos Region",
          heiName: "Sample University",
          heiType: "Private HEI"
        }
      ]
    }
  })
}