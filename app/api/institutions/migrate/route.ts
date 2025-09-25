import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Create institutions table using raw SQL
    await (prisma as any).$executeRaw`
      CREATE TABLE IF NOT EXISTS "institutions" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "name" TEXT NOT NULL,
        "altNames" TEXT[],
        "type" TEXT NOT NULL,
        "ownership" TEXT NOT NULL,
        "region" TEXT NOT NULL,
        "province" TEXT NOT NULL,
        "cityMunicipality" TEXT NOT NULL,
        "address" TEXT,
        "website" TEXT,
        "email" TEXT,
        "logoUrl" TEXT,
        "source" TEXT NOT NULL,
        "sourceUrl" TEXT,
        "sourceDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
      );
    `

    await (prisma as any).$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "institutions_name_region_province_key" 
      ON "institutions"("name", "region", "province");
    `

    return NextResponse.json({
      success: true,
      message: 'Institutions table created successfully'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}