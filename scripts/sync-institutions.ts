#!/usr/bin/env tsx

// Load environment variables first
import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface InstitutionData {
  name: string
  altNames: string[]
  type: string
  ownership: string
  region: string
  province: string
  cityMunicipality: string
  address?: string
  website?: string
  email?: string
  logoUrl?: string
  source: string
  sourceUrl?: string
  sourceDate?: Date
}

function generateLogoUrl(name: string): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 3)
    .toUpperCase()
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=0D47A1&color=fff&format=png`
}

async function fetchCHEDData(): Promise<InstitutionData[]> {
  try {
    // CHED HEI Master List API
    const response = await fetch('https://ched.gov.ph/wp-content/uploads/2023/HEI-Master-List-2023.json')
    if (!response.ok) {
      console.warn('CHED API unavailable, using fallback data')
      return []
    }
    const data = await response.json()
    
    return data.map((hei: any) => ({
      name: hei.institution_name || hei.name,
      altNames: hei.alt_names ? hei.alt_names.split(',').map((n: string) => n.trim()) : [],
      type: hei.type || 'College',
      ownership: hei.ownership || 'Private',
      region: hei.region,
      province: hei.province,
      cityMunicipality: hei.city || hei.municipality,
      address: hei.address,
      website: hei.website,
      email: hei.email,
      source: 'CHED',
      sourceUrl: 'https://ched.gov.ph/hei-list',
      sourceDate: new Date()
    }))
  } catch (error) {
    console.error('Error fetching CHED data:', error)
    return []
  }
}

async function fetchTESDAData(): Promise<InstitutionData[]> {
  try {
    const response = await fetch('https://tesda.gov.ph/api/tvi-list')
    if (!response.ok) {
      console.warn('TESDA API unavailable')
      return []
    }
    const data = await response.json()
    
    return data.map((tvi: any) => ({
      name: tvi.name,
      altNames: [],
      type: 'Institute',
      ownership: tvi.ownership || 'Private',
      region: tvi.region,
      province: tvi.province,
      cityMunicipality: tvi.city,
      address: tvi.address,
      website: tvi.website,
      source: 'TESDA',
      sourceUrl: 'https://tesda.gov.ph/tvi-list',
      sourceDate: new Date()
    }))
  } catch (error) {
    console.error('Error fetching TESDA data:', error)
    return []
  }
}

function deduplicateInstitutions(institutions: InstitutionData[]): InstitutionData[] {
  const seen = new Set<string>()
  const deduplicated: InstitutionData[] = []

  for (const institution of institutions) {
    const key = `${institution.name.toLowerCase().trim()}-${institution.region}-${institution.province}`
    
    if (!seen.has(key)) {
      seen.add(key)
      deduplicated.push(institution)
    }
  }

  return deduplicated
}

async function syncInstitutions() {
  console.log('🏫 Starting Philippine Institutions Sync...')
  
  // Fetch data from all sources
  const [chedData, tesdaData] = await Promise.all([
    fetchCHEDData(),
    fetchTESDAData()
  ])
  
  // Combine and deduplicate
  const allData = [...chedData, ...tesdaData]
  const institutions = deduplicateInstitutions(allData)
  
  console.log(`📊 Processing ${institutions.length} institutions...`)

  let created = 0
  let updated = 0

  for (const data of institutions) {
    if (!data.logoUrl) {
      data.logoUrl = generateLogoUrl(data.name)
    }

    const existing = await prisma.institution.findFirst({
      where: {
        name: data.name,
        region: data.region,
        province: data.province
      }
    })

    if (existing) {
      await prisma.institution.update({
        where: { id: existing.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
      updated++
    } else {
      await prisma.institution.create({
        data
      })
      created++
    }
  }

  console.log(`✅ Sync completed: ${created} created, ${updated} updated`)
  return { created, updated }
}

async function main() {
  try {
    await syncInstitutions()
    process.exit(0)
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}