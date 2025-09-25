#!/usr/bin/env tsx

import * as cheerio from 'cheerio'

interface HEIData {
  regName: string
  heiName: string
  heiType: string
}

async function extractUnifastData() {
  try {
    console.log('🔍 Fetching UNIFAST HEI Registry...')
    
    const response = await fetch('https://unifast.gov.ph/hei-list.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    console.log('📄 Page loaded successfully')
    
    let allInstitutions: HEIData[] = []
    
    // Extract JavaScript data
    const scripts = $('script')
    
    scripts.each((index, script) => {
      const scriptContent = $(script).html() || ''
      
      // Look for the data array or object containing institutions
      if (scriptContent.includes('heiName') || scriptContent.includes('regName')) {
        console.log(`📜 Found HEI data in script ${index + 1}`)
        
        try {
          // Try to extract the data array
          const dataMatches = scriptContent.match(/var\s+\w+\s*=\s*\[([\s\S]*?)\];/g) ||
                             scriptContent.match(/const\s+\w+\s*=\s*\[([\s\S]*?)\];/g) ||
                             scriptContent.match(/let\s+\w+\s*=\s*\[([\s\S]*?)\];/g)
          
          if (dataMatches) {
            for (const match of dataMatches) {
              console.log('🔍 Processing data array...')
              
              // Extract individual objects
              const objectMatches = match.match(/\{[^}]*heiName[^}]*\}/g)
              
              if (objectMatches) {
                console.log(`📊 Found ${objectMatches.length} institution objects`)
                
                for (const objStr of objectMatches) {
                  try {
                    // Clean up the object string to make it valid JSON
                    let cleanObj = objStr
                      .replace(/(\w+):/g, '"$1":')  // Add quotes to keys
                      .replace(/'/g, '"')           // Replace single quotes with double quotes
                      .replace(/,\s*}/g, '}')       // Remove trailing commas
                    
                    const institution = JSON.parse(cleanObj) as HEIData
                    allInstitutions.push(institution)
                  } catch (parseError) {
                    // If JSON parsing fails, try manual extraction
                    const nameMatch = objStr.match(/heiName:\s*['"](.*?)['"]/)
                    const regionMatch = objStr.match(/regName:\s*['"](.*?)['"]/)
                    const typeMatch = objStr.match(/heiType:\s*['"](.*?)['"]/)
                    
                    if (nameMatch && regionMatch) {
                      allInstitutions.push({
                        heiName: nameMatch[1],
                        regName: regionMatch[1],
                        heiType: typeMatch ? typeMatch[1] : 'Unknown'
                      })
                    }
                  }
                }
              }
            }
          }
          
          // Also try to find individual object definitions
          const individualObjects = scriptContent.match(/\{[^}]*heiName[^}]*\}/g)
          if (individualObjects && individualObjects.length > allInstitutions.length) {
            console.log(`🔍 Found ${individualObjects.length} individual objects`)
            
            for (const objStr of individualObjects) {
              const nameMatch = objStr.match(/heiName:\s*['"](.*?)['"]/)
              const regionMatch = objStr.match(/regName:\s*['"](.*?)['"]/)
              const typeMatch = objStr.match(/heiType:\s*['"](.*?)['"]/)
              
              if (nameMatch && regionMatch) {
                const institution = {
                  heiName: nameMatch[1],
                  regName: regionMatch[1],
                  heiType: typeMatch ? typeMatch[1] : 'Unknown'
                }
                
                // Avoid duplicates
                if (!allInstitutions.some(inst => inst.heiName === institution.heiName)) {
                  allInstitutions.push(institution)
                }
              }
            }
          }
          
        } catch (error) {
          console.error('❌ Error parsing script data:', error)
        }
      }
    })
    
    // Remove duplicates
    const uniqueInstitutions = allInstitutions.filter((inst, index, self) => 
      index === self.findIndex(i => i.heiName === inst.heiName)
    )
    
    console.log('\n📊 EXTRACTION RESULTS:')
    console.log(`🏫 Total Institutions Found: ${uniqueInstitutions.length}`)
    
    // Group by region
    const byRegion = uniqueInstitutions.reduce((acc, inst) => {
      const region = inst.regName || 'Unknown'
      if (!acc[region]) acc[region] = []
      acc[region].push(inst)
      return acc
    }, {} as Record<string, HEIData[]>)
    
    console.log('\n📍 BY REGION:')
    Object.entries(byRegion).forEach(([region, institutions]) => {
      console.log(`${region}: ${institutions.length} institutions`)
    })
    
    // Group by type
    const byType = uniqueInstitutions.reduce((acc, inst) => {
      const type = inst.heiType || 'Unknown'
      if (!acc[type]) acc[type] = 0
      acc[type]++
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n🏛️ BY TYPE:')
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`${type}: ${count} institutions`)
    })
    
    // Show first 10 institutions
    console.log('\n📝 SAMPLE INSTITUTIONS:')
    uniqueInstitutions.slice(0, 10).forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.heiName} (${inst.regName}) - ${inst.heiType}`)
    })
    
    if (uniqueInstitutions.length > 10) {
      console.log(`... and ${uniqueInstitutions.length - 10} more`)
    }
    
    // Save to file
    const fs = require('fs')
    const data = {
      totalCount: uniqueInstitutions.length,
      scrapedAt: new Date().toISOString(),
      source: 'https://unifast.gov.ph/hei-list.html',
      byRegion,
      byType,
      institutions: uniqueInstitutions
    }
    
    fs.writeFileSync('unifast-complete-data.json', JSON.stringify(data, null, 2))
    console.log('\n💾 Complete data saved to unifast-complete-data.json')
    
    return uniqueInstitutions.length
    
  } catch (error) {
    console.error('❌ Error:', error)
    return 0
  }
}

extractUnifastData().then(count => {
  console.log(`\n🎯 FINAL COUNT: ${count} Higher Education Institutions in CHED Registry`)
  process.exit(0)
})