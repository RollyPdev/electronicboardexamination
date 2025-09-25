import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Extract and parse UNIFAST data
    const response = await fetch('https://unifast.gov.ph/hei-list.html')
    const html = await response.text()
    
    // Extract the JavaScript data array
    const dataMatch = html.match(/const data = \[([\s\S]*?)\];/)
    if (!dataMatch) {
      return NextResponse.json({ error: 'Could not extract data from UNIFAST' }, { status: 500 })
    }
    
    // Parse the data
    const dataString = '[' + dataMatch[1] + ']'
    const unifastData = eval(dataString) // Note: eval is used here for parsing, be careful in production
    
    let created = 0
    
    for (const item of unifastData) {
      const region = item.regName.split(' - ')[1] || item.regName
      const ownership = item.heiType === 'Private HEI' ? 'Private' : 'Public'
      const type = item.heiType === 'SUC' ? 'University' : 
                   item.heiType === 'LUC' ? 'College' : 'College'
      
      await (prisma as any).institution.upsert({
        where: {
          name_region_province: {
            name: item.heiName,
            region: region,
            province: region
          }
        },
        update: {},
        create: {
          name: item.heiName,
          type: type,
          ownership: ownership,
          region: region,
          province: region,
          cityMunicipality: 'Unknown',
          source: 'UNIFAST',
          sourceUrl: 'https://unifast.gov.ph/hei-list.html'
        }
      })
      created++
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${created} institutions from UNIFAST data`,
      created
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}