#!/usr/bin/env node

const { execSync } = require('child_process')

async function testUnifastSync() {
  console.log('🧪 Testing UNIFAST Sync...')
  
  try {
    // Test the scraper directly
    console.log('\n1. Testing scraper...')
    execSync('npx tsx scripts/sync-unifast.ts', { stdio: 'inherit' })
    
    // Test the API endpoint
    console.log('\n2. Testing API endpoint...')
    const response = await fetch('http://localhost:3000/api/institutions?limit=5&source=UNIFAST')
    const data = await response.json()
    
    console.log('📊 API Response:')
    console.log(`Total institutions: ${data.total}`)
    console.log(`UNIFAST schools found: ${data.results.length}`)
    console.log('\nSample schools:')
    data.results.slice(0, 3).forEach((school, index) => {
      console.log(`${index + 1}. ${school.name} - ${school.cityMunicipality}, ${school.province}`)
    })
    
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testUnifastSync()