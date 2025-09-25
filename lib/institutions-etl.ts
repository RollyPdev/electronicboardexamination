// Load environment variables first
import { config } from 'dotenv'
config({ path: '.env.local' })

import { prisma } from './prisma'

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

export class InstitutionsETL {
  private async generateLogoUrl(name: string): Promise<string> {
    // Generate placeholder logo with institution initials
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase()
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=0D47A1&color=fff&format=png`
  }

  private normalizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .toLowerCase()
  }

  private async fetchCHEDData(): Promise<InstitutionData[]> {
    // Mock CHED data - in production, fetch from actual CHED APIs
    const mockData: InstitutionData[] = [
      {
        name: 'University of the Philippines',
        altNames: ['UP'],
        type: 'University',
        ownership: 'Public',
        region: 'NCR',
        province: 'Metro Manila',
        cityMunicipality: 'Quezon City',
        address: 'Diliman, Quezon City',
        website: 'https://up.edu.ph',
        email: 'info@up.edu.ph',
        source: 'CHED',
        sourceUrl: 'https://ched.gov.ph/hei-list',
        sourceDate: new Date()
      },
      {
        name: 'Ateneo de Manila University',
        altNames: ['ADMU', 'Ateneo'],
        type: 'University',
        ownership: 'Private',
        region: 'NCR',
        province: 'Metro Manila',
        cityMunicipality: 'Quezon City',
        address: 'Loyola Heights, Quezon City',
        website: 'https://ateneo.edu',
        email: 'info@ateneo.edu',
        source: 'CHED',
        sourceUrl: 'https://ched.gov.ph/hei-list',
        sourceDate: new Date()
      }
    ]

    return mockData
  }

  private async fetchTESDAData(): Promise<InstitutionData[]> {
    // Mock TESDA data - in production, fetch from actual TESDA APIs
    return [
      {
        name: 'Technical Education and Skills Development Authority',
        altNames: ['TESDA'],
        type: 'Institute',
        ownership: 'Public',
        region: 'NCR',
        province: 'Metro Manila',
        cityMunicipality: 'Taguig City',
        address: 'East Service Road, Taguig City',
        website: 'https://tesda.gov.ph',
        source: 'TESDA',
        sourceUrl: 'https://tesda.gov.ph/tvi-list',
        sourceDate: new Date()
      }
    ]
  }

  private deduplicateInstitutions(institutions: InstitutionData[]): InstitutionData[] {
    const seen = new Set<string>()
    const deduplicated: InstitutionData[] = []

    for (const institution of institutions) {
      const key = `${this.normalizeName(institution.name)}-${institution.region}-${institution.province}`
      
      if (!seen.has(key)) {
        seen.add(key)
        deduplicated.push(institution)
      }
    }

    return deduplicated
  }

  async syncInstitutions(): Promise<{ created: number; updated: number }> {
    try {
      console.log('Starting institutions sync...')

      // Fetch data from all sources
      const [chedData, tesdaData] = await Promise.all([
        this.fetchCHEDData(),
        this.fetchTESDAData()
      ])

      // Combine and deduplicate
      const allData = [...chedData, ...tesdaData]
      const deduplicated = this.deduplicateInstitutions(allData)

      let created = 0
      let updated = 0

      // Upsert institutions
      for (const data of deduplicated) {
        // Generate logo if not provided
        if (!data.logoUrl) {
          data.logoUrl = await this.generateLogoUrl(data.name)
        }

        const existing = await (prisma as any).institution.findFirst({
          where: {
            name: data.name,
            region: data.region,
            province: data.province
          }
        })

        if (existing) {
          await (prisma as any).institution.update({
            where: { id: existing.id },
            data: {
              ...data,
              updatedAt: new Date()
            }
          })
          updated++
        } else {
          await (prisma as any).institution.create({
            data
          })
          created++
        }
      }

      console.log(`Sync completed: ${created} created, ${updated} updated`)
      return { created, updated }

    } catch (error) {
      console.error('Error syncing institutions:', error)
      throw error
    }
  }
}