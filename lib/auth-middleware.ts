import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { Role } from '@prisma/client'

export interface AuthRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name?: string | null
    role: Role
  }
}

// Middleware to check authentication
export async function withAuth(
  req: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const authReq = req as AuthRequest
  authReq.user = {
    id: token.sub!,
    email: token.email!,
    name: token.name,
    role: token.role as Role,
  }

  return handler(authReq)
}

// Middleware to check admin role
export async function withAdminAuth(
  req: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return withAuth(req, async (authReq) => {
    if (authReq.user?.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    return handler(authReq)
  })
}

// Middleware to check student role
export async function withStudentAuth(
  req: NextRequest,
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return withAuth(req, async (authReq) => {
    if (authReq.user?.role !== Role.STUDENT) {
      return NextResponse.json(
        { error: 'Student access required' },
        { status: 403 }
      )
    }
    return handler(authReq)
  })
}

// Utility to get current user from request
export async function getCurrentUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  if (!token) {
    return null
  }

  return {
    id: token.sub!,
    email: token.email!,
    name: token.name,
    role: token.role as Role,
  }
}