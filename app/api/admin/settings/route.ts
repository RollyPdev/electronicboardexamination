import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

async function GET(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const settings = await ((prisma as any).settings as any).findFirst()
      
      if (!settings) {
        // Return default settings if none exist
        const defaultSettings = {
          siteName: 'Coeus Online Exams',
          siteDescription: 'Electronic Board Examination System',
          allowRegistration: true,
          requireEmailVerification: false,
          enableProctoring: true,
          maxExamDuration: 180,
          autoGrading: true,
          showResultsImmediately: false,
        }
        
        // Create default settings in database
        const newSettings = await ((prisma as any).settings as any).create({
          data: defaultSettings
        })
        
        return NextResponse.json(newSettings)
      }

      return NextResponse.json(settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }
  })
}

async function PUT(req: NextRequest) {
  return withAdminAuth(req, async () => {
    try {
      const body = await req.json()
      
      // Filter out unknown fields
      const validFields = {
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        allowRegistration: body.allowRegistration,
        requireEmailVerification: body.requireEmailVerification,
        enableProctoring: body.enableProctoring,
        maxExamDuration: body.maxExamDuration,
        autoGrading: body.autoGrading,
        showResultsImmediately: body.showResultsImmediately
      }
      
      const existingSettings = await ((prisma as any).settings as any).findFirst()
      
      let settings
      if (existingSettings) {
        settings = await ((prisma as any).settings as any).update({
          where: { id: existingSettings.id },
          data: validFields
        })
      } else {
        settings = await ((prisma as any).settings as any).create({
          data: validFields
        })
      }

      return NextResponse.json(settings)
    } catch (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json(
        { error: 'Failed to update settings' },
        { status: 500 }
      )
    }
  })
}

export { GET, PUT }