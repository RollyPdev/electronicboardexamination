import { NextRequest, NextResponse } from 'next/server'

const institutions = [
  'Capiz State University Main Campus - Roxas City',
  'Capiz State University - Dayao Campus (Roxas City)',
  'Capiz State University Dayao Satellite College',
  'Hercor College (Roxas City)',
  'University of the Philippines',
  'Ateneo de Manila University',
  'De La Salle University',
  'University of Santo Tomas',
  'Far Eastern University',
  'Adamson University',
  'National University',
  'Polytechnic University of the Philippines',
  'Technological University of the Philippines',
  'Central Philippine University',
  'University of San Carlos',
  'Silliman University',
  'Xavier University',
  'Mindanao State University',
  'University of the Philippines Diliman',
  'University of the Philippines Los Baños'
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase() || ''

  const filteredInstitutions = institutions.filter((institution: any) =>
    institution.toLowerCase().includes(search)
  )

  return NextResponse.json({ institutions: filteredInstitutions })
}