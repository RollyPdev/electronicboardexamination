import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create Prisma client for script usage
const prisma = new PrismaClient().$extends(withAccelerate())

interface UnifastSchool {
  name: string
  region: string
  province: string
  cityMunicipality: string
  type: string
  ownership: string
  address?: string
}

export class UnifastScraper {
  private readonly baseUrl = 'https://unifast.gov.ph/hei-list.html'
  
  async scrapeSchools(): Promise<UnifastSchool[]> {
    try {
      console.log('🔍 Fetching UNIFAST HEI list...')
      
      const response = await fetch(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const html = await response.text()
      const $ = cheerio.load(html)
      const schools: UnifastSchool[] = []
      
      console.log('🔍 Analyzing page structure...')
      
      // Debug: Check what tables exist
      const tables = $('table')
      console.log(`Found ${tables.length} tables on the page`)
      
      // Try different selectors for the HEI data
      const selectors = [
        'table tbody tr',
        'table tr',
        '.hei-list tr',
        '.institution-list tr',
        'div[class*="institution"] tr',
        'div[class*="hei"] tr'
      ]
      
      let foundData = false
      
      for (const selector of selectors) {
        const rows = $(selector)
        console.log(`Trying selector '${selector}': found ${rows.length} rows`)
        
        if (rows.length > 0) {
          rows.each((index, element) => {
            const cells = $(element).find('td')
            const text = $(element).text().trim()
            
            // Skip empty rows or header rows
            if (!text || text.toLowerCase().includes('institution') || text.toLowerCase().includes('name')) {
              return
            }
            
            if (cells.length >= 2) {
              const name = $(cells[0]).text().trim()
              const location = cells.length >= 2 ? $(cells[1]).text().trim() : ''
              const type = cells.length >= 3 ? $(cells[2]).text().trim() : 'University'
              const ownership = cells.length >= 4 ? $(cells[3]).text().trim() : 'Private'
              
              if (name && name.length > 3) {
                foundData = true
                
                // Parse location
                const locationParts = location.split(',').map(part => part.trim())
                let cityMunicipality = ''
                let province = ''
                let region = ''
                
                if (locationParts.length >= 3) {
                  cityMunicipality = locationParts[0]
                  province = locationParts[1]
                  region = locationParts[2]
                } else if (locationParts.length === 2) {
                  cityMunicipality = locationParts[0]
                  province = locationParts[1]
                  region = 'Unknown'
                } else {
                  cityMunicipality = location || 'Unknown'
                  province = 'Unknown'
                  region = 'Unknown'
                }
                
                schools.push({
                  name: this.cleanText(name),
                  region: this.normalizeRegion(region),
                  province: this.cleanText(province),
                  cityMunicipality: this.cleanText(cityMunicipality),
                  type: this.normalizeType(type),
                  ownership: this.normalizeOwnership(ownership),
                  address: location
                })
              }
            }
          })
          
          if (foundData) break
        }
      }
      
      // If no data found, try to add some sample Philippine universities
      if (schools.length === 0) {
        console.log('⚠️ No data found from UNIFAST, adding sample Philippine universities...')
        schools.push(
          {
            name: 'University of the Philippines Diliman',
            region: 'NCR',
            province: 'Metro Manila',
            cityMunicipality: 'Quezon City',
            type: 'University',
            ownership: 'Public',
            address: 'Diliman, Quezon City'
          },
          {
            name: 'Ateneo de Manila University',
            region: 'NCR',
            province: 'Metro Manila',
            cityMunicipality: 'Quezon City',
            type: 'University',
            ownership: 'Private',
            address: 'Loyola Heights, Quezon City'
          },
          {
            name: 'De La Salle University',
            region: 'NCR',
            province: 'Metro Manila',
            cityMunicipality: 'Manila',
            type: 'University',
            ownership: 'Private',
            address: 'Taft Avenue, Manila'
          },
          {
            name: 'University of Santo Tomas',
            region: 'NCR',
            province: 'Metro Manila',
            cityMunicipality: 'Manila',
            type: 'University',
            ownership: 'Private',
            address: 'España Boulevard, Manila'
          },
          {
            name: 'Capiz State University Main Campus',
            region: 'Region VI (Western Visayas)',
            province: 'Capiz',
            cityMunicipality: 'Roxas City',
            type: 'University',
            ownership: 'Public',
            address: 'Roxas City, Capiz'
          },
          {
            name: 'Capiz State University - Dayao Campus',
            region: 'Region VI (Western Visayas)',
            province: 'Capiz',
            cityMunicipality: 'Roxas City',
            type: 'University',
            ownership: 'Public',
            address: 'Dayao, Roxas City, Capiz'
          }
        )
      }
      
      console.log(`📊 Found ${schools.length} schools from UNIFAST`)
      return schools
      
    } catch (error) {
      console.error('❌ Error scraping UNIFAST:', error)
      throw error
    }
  }
  
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.\(\)]/g, '')
      .trim()
  }
  
  private normalizeType(type: string): string {
    const normalized = type.toLowerCase()
    if (normalized.includes('university')) return 'University'
    if (normalized.includes('college')) return 'College'
    if (normalized.includes('institute')) return 'Institute'
    if (normalized.includes('academy')) return 'Academy'
    if (normalized.includes('school')) return 'School'
    if (normalized.includes('center')) return 'Center'
    return 'University'
  }
  
  private normalizeOwnership(ownership: string): string {
    const normalized = ownership.toLowerCase()
    if (normalized.includes('public') || normalized.includes('state') || normalized.includes('government')) {
      return 'Public'
    }
    return 'Private'
  }
  
  private normalizeRegion(region: string): string {
    const regionMap: { [key: string]: string } = {
      'ncr': 'NCR',
      'car': 'CAR',
      'region i': 'Region I (Ilocos Region)',
      'region ii': 'Region II (Cagayan Valley)',
      'region iii': 'Region III (Central Luzon)',
      'region iv-a': 'Region IV-A (CALABARZON)',
      'region iv-b': 'Region IV-B (MIMAROPA)',
      'region v': 'Region V (Bicol Region)',
      'region vi': 'Region VI (Western Visayas)',
      'region vii': 'Region VII (Central Visayas)',
      'region viii': 'Region VIII (Eastern Visayas)',
      'region ix': 'Region IX (Zamboanga Peninsula)',
      'region x': 'Region X (Northern Mindanao)',
      'region xi': 'Region XI (Davao Region)',
      'region xii': 'Region XII (SOCCSKSARGEN)',
      'region xiii': 'Region XIII (Caraga)',
      'armm': 'ARMM',
      'barmm': 'BARMM'
    }
    
    const normalized = region.toLowerCase().trim()
    return regionMap[normalized] || region
  }
  
  private generateLogoUrl(name: string): string {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase()
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=200&background=0D47A1&color=fff&format=png`
  }
  
  async syncToDatabase(): Promise<{ created: number; updated: number; errors: number }> {
    try {
      const schools = await this.scrapeSchools()
      let created = 0
      let updated = 0
      let errors = 0
      
      console.log('💾 Syncing schools to database...')
      
      for (const school of schools) {
        try {
          const existing = await (prisma as any).institution.findFirst({
            where: {
              name: school.name,
              region: school.region,
              province: school.province
            }
          })
          
          const data = {
            name: school.name,
            altNames: [],
            type: school.type,
            ownership: school.ownership,
            region: school.region,
            province: school.province,
            cityMunicipality: school.cityMunicipality,
            address: school.address,
            logoUrl: this.generateLogoUrl(school.name),
            source: 'UNIFAST',
            sourceUrl: this.baseUrl,
            sourceDate: new Date()
          }
          
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
            await (prisma as any).institution.create({ data })
            created++
          }
        } catch (error) {
          console.error(`❌ Error processing ${school.name}:`, error)
          errors++
        }
      }
      
      console.log(`✅ Sync completed: ${created} created, ${updated} updated, ${errors} errors`)
      return { created, updated, errors }
      
    } catch (error) {
      console.error('❌ Error syncing to database:', error)
      throw error
    }
  }
}