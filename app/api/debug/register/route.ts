import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Registration request received:', body)
    
    // Check required fields
    const required = ['firstName', 'lastName', 'school', 'email', 'password']
    const missing = required.filter(field => !body[field])
    
    if (missing.length > 0) {
      console.log('Missing fields:', missing)
      return NextResponse.json({
        error: `Missing required fields: ${missing.join(', ')}`,
        received: body
      }, { status: 400 })
    }
    
    console.log('All fields present, proceeding with registration...')
    
    // Forward to actual registration endpoint
    const response = await fetch(`${req.nextUrl.origin}/api/students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    console.log('Registration response:', data)
    
    return NextResponse.json(data, { status: response.status })
    
  } catch (error) {
    console.error('Debug registration error:', error)
    return NextResponse.json({
      error: 'Debug registration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}