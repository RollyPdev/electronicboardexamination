import { useSession } from 'next-auth/react'
import { Role } from '@prisma/client'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === Role.ADMIN,
    isStudent: session?.user?.role === Role.STUDENT,
  }
}

export function useRequireAuth(redirectTo = '/auth/signin') {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (typeof window !== 'undefined' && !isLoading && !isAuthenticated) {
    window.location.href = redirectTo
  }

  return { user, isLoading, isAuthenticated }
}

export function useRequireRole(allowedRoles: Role[], redirectTo = '/unauthorized') {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (typeof window !== 'undefined' && !isLoading) {
    if (!isAuthenticated) {
      window.location.href = '/auth/signin'
      return { user: null, isLoading: true, hasAccess: false }
    }

    if (user && !allowedRoles.includes(user.role)) {
      window.location.href = redirectTo
      return { user, isLoading: true, hasAccess: false }
    }
  }

  return {
    user,
    isLoading,
    hasAccess: user ? allowedRoles.includes(user.role) : false,
  }
}