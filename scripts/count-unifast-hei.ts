#!/usr/bin/env tsx

import * as cheerio from 'cheerio'

async function countUnifastHEI() {
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
    
    // Look for the title or heading that mentions the count
    const pageTitle = $('title').text()
    console.log('📋 Page Title:', pageTitle)
    
    // Look for any text that mentions total count
    const bodyText = $('body').text()
    const countMatches = bodyText.match(/(\d+)\s*(participating|institutions|hei|higher education)/gi)
    
    if (countMatches) {
      console.log('🔢 Found count mentions:', countMatches)
    }
    
    // Try to find the actual data table or list
    const tables = $('table')
    console.log(`📊 Found ${tables.length} table(s)`)
    
    let totalInstitutions = 0
    const institutions: string[] = []
    
    // Check each table for institution data
    tables.each((tableIndex, table) => {
      const rows = $(table).find('tr')
      console.log(`Table ${tableIndex + 1}: ${rows.length} rows`)
      
      rows.each((rowIndex, row) => {
        const cells = $(row).find('td, th')
        if (cells.length > 0) {
          const firstCell = $(cells[0]).text().trim()
          
          // Skip header rows
          if (firstCell && 
              !firstCell.toLowerCase().includes('institution') && 
              !firstCell.toLowerCase().includes('name') &&
              !firstCell.toLowerCase().includes('no.') &&
              firstCell.length > 5) {
            
            institutions.push(firstCell)
            totalInstitutions++
            
            if (totalInstitutions <= 10) {
              console.log(`${totalInstitutions}. ${firstCell}`)
            }
          }
        }
      })
    })
    
    // Also check for div-based lists
    const divLists = $('div[class*="list"], div[class*="institution"], ul, ol')
    console.log(`📋 Found ${divLists.length} potential list container(s)`)
    
    divLists.each((index, element) => {
      const items = $(element).find('li, div, p').filter((i, el) => {
        const text = $(el).text().trim()
        return text.length > 10 && !text.toLowerCase().includes('institution')
      })
      
      if (items.length > 0) {
        console.log(`List container ${index + 1}: ${items.length} items`)
      }
    })
    
    // Look for any JavaScript data or JSON
    const scripts = $('script')
    scripts.each((index, script) => {
      const scriptContent = $(script).html() || ''
      if (scriptContent.includes('institution') || scriptContent.includes('hei')) {
        console.log(`📜 Found relevant script content in script ${index + 1}`)
        
        // Try to extract JSON data
        const jsonMatches = scriptContent.match(/\{[^}]*institution[^}]*\}/gi)
        if (jsonMatches) {
          console.log('🔍 Found JSON-like data:', jsonMatches.slice(0, 3))
        }
      }
    })
    
    console.log('\n📊 SUMMARY:')
    console.log(`🏫 Total Institutions Found: ${totalInstitutions}`)
    
    if (totalInstitutions > 10) {
      console.log('📝 First 10 institutions listed above...')
      console.log(`📝 And ${totalInstitutions - 10} more institutions`)
    }
    
    // Save the full list to a file
    if (institutions.length > 0) {
      const fs = require('fs')
      const data = {
        totalCount: totalInstitutions,
        scrapedAt: new Date().toISOString(),
        source: 'https://unifast.gov.ph/hei-list.html',
        institutions: institutions
      }
      
      fs.writeFileSync('unifast-hei-count.json', JSON.stringify(data, null, 2))
      console.log('💾 Full list saved to unifast-hei-count.json')
    }
    
    return totalInstitutions
    
  } catch (error) {
    console.error('❌ Error:', error)
    return 0
  }
}

countUnifastHEI().then(count => {
  console.log(`\n🎯 FINAL COUNT: ${count} Higher Education Institutions`)
  process.exit(0)
})