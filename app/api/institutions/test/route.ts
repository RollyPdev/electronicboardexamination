import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await (prisma as any).institution.count()
    
    return NextResponse.json({
      status: 'working',
      institutionsCount: count
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code
    }, { status: 500 })
  }
}