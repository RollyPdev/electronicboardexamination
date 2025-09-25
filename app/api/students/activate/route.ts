import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { activationCode } = await req.json()

    if (!activationCode) {
      return NextResponse.json(
        { error: 'Activation code is required' },
        { status: 400 }
      )
    }

    const user = await (prisma as any).user.findFirst({
      where: { 
        activationCode: activationCode.toUpperCase(),
        isActive: false
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired activation code' },
        { status: 400 }
      )
    }

    await (prisma as any).user.update({
      where: { id: user.id },
      data: { 
        isActive: true,
        activationCode: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate account' },
      { status: 500 }
    )
  }
}