import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect to signin if not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Role-based redirects
    if (pathname.startsWith('/admin')) {
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL(token.role === 'PROCTOR' ? '/proctor' : '/student', req.url))
      }
    }

    if (pathname.startsWith('/proctor')) {
      if (token.role !== 'PROCTOR') {
        return NextResponse.redirect(new URL(token.role === 'ADMIN' ? '/admin' : '/student', req.url))
      }
    }

    if (pathname.startsWith('/student')) {
      if (token.role !== 'STUDENT') {
        return NextResponse.redirect(new URL(token.role === 'ADMIN' ? '/admin' : '/proctor', req.url))
      }
    }

    // Allow loading page for all authenticated users
    if (pathname === '/loading') {
      return NextResponse.next()
    }

    // Redirect based on role from root
    if (pathname === '/') {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (token.role === 'PROCTOR') {
        return NextResponse.redirect(new URL('/proctor', req.url))
      } else if (token.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/proctor/:path*',
    '/student/:path*',
    '/loading'
  ]
}