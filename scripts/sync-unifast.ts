#!/usr/bin/env tsx

// Load environment variables first
require('dotenv').config({ path: '.env.local' })

import { UnifastScraper } from '../lib/unifast-scraper'

async function main() {
  console.log('🏫 Starting UNIFAST Schools Sync...')
  
  try {
    const scraper = new UnifastScraper()
    const result = await scraper.syncToDatabase()
    
    console.log('\n📊 Sync Results:')
    console.log(`✅ Created: ${result.created}`)
    console.log(`🔄 Updated: ${result.updated}`)
    console.log(`❌ Errors: ${result.errors}`)
    console.log(`📈 Total: ${result.created + result.updated}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  }
}

main()