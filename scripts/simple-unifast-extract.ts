#!/usr/bin/env tsx

import * as cheerio from 'cheerio'

async function extractUnifastData() {
  try {
    console.log('🔍 Fetching UNIFAST HEI Registry...')
    
    const response = await fetch('https://unifast.gov.ph/hei-list.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    console.log('📄 Page loaded successfully')
    
    const institutions: any[] = []
    
    // Extract JavaScript data
    const scripts = $('script')
    
    scripts.each((index, script) => {
      const scriptContent = $(script).html() || ''
      
      if (scriptContent.includes('heiName')) {
        console.log(`📜 Found HEI data in script ${index + 1}`)
        
        // Extract all objects with heiName
        const regex = /\{\s*regName:\s*["']([^"']+)["'],\s*heiName:\s*["']([^"']+)["'],\s*heiType:\s*["']([^"']+)["']\s*\}/g
        let match
        
        while ((match = regex.exec(scriptContent)) !== null) {
          institutions.push({
            regName: match[1],
            heiName: match[2],
            heiType: match[3]
          })
        }
        
        // Also try simpler pattern
        const simpleRegex = /heiName:\s*["']([^"']+)["']/g
        const names = []
        let nameMatch
        
        while ((nameMatch = simpleRegex.exec(scriptContent)) !== null) {
          names.push(nameMatch[1])
        }
        
        console.log(`Found ${names.length} institution names in this script`)
      }
    })
    
    console.log(`\n📊 Total Institutions Found: ${institutions.length}`)
    
    if (institutions.length > 0) {
      // Group by region
      const byRegion: Record<string, any[]> = {}
      institutions.forEach(inst => {
        const region = inst.regName || 'Unknown'
        if (!byRegion[region]) byRegion[region] = []
        byRegion[region].push(inst)
      })
      
      console.log('\n📍 BY REGION:')
      Object.entries(byRegion).forEach(([region, insts]) => {
        console.log(`${region}: ${insts.length} institutions`)
      })
      
      // Show sample
      console.log('\n📝 SAMPLE INSTITUTIONS:')
      institutions.slice(0, 10).forEach((inst, i) => {
        console.log(`${i + 1}. ${inst.heiName} (${inst.regName})`)
      })
      
      // Save data
      const fs = require('fs')
      const data = {
        totalCount: institutions.length,
        scrapedAt: new Date().toISOString(),
        source: 'https://unifast.gov.ph/hei-list.html',
        institutions
      }
      
      fs.writeFileSync('unifast-hei-data.json', JSON.stringify(data, null, 2))
      console.log('\n💾 Data saved to unifast-hei-data.json')
    }
    
    return institutions.length
    
  } catch (error) {
    console.error('❌ Error:', error)
    return 0
  }
}

extractUnifastData().then(count => {
  console.log(`\n🎯 FINAL COUNT: ${count} Higher Education Institutions`)
})