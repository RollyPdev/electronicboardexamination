import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'philippine-institutions.json')
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      // Return empty array if file doesn't exist
      return NextResponse.json([])
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const institutions = JSON.parse(fileContents)
    
    return NextResponse.json(institutions)
  } catch (error) {
    console.error('Error loading institutions:', error)
    return NextResponse.json([], { status: 500 })
  }
}