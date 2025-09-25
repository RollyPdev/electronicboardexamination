import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const user = await (prisma as any).user.findUnique({
      where: { email },
      select: { activationCode: true, isActive: true }
    })

    if (!user || user.isActive) {
      return NextResponse.json({ activationCode: null })
    }

    return NextResponse.json({ activationCode: user.activationCode })
  } catch (error) {
    return NextResponse.json({ activationCode: null })
  }
}