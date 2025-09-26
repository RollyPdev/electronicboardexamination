'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'
import { Role } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
  loading?: ReactNode
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = <div>Access denied</div>,
  loading = <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
}: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <>{loading}</>
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <>{fallback}</>
  }

  if (!allowedRoles.includes(session.user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Convenience components for specific roles
export function AdminGuard({ children, fallback, loading }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} fallback={fallback} loading={loading}>
      {children}
    </RoleGuard>
  )
}

export function StudentGuard({ children, fallback, loading }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[Role.STUDENT]} fallback={fallback} loading={loading}>
      {children}
    </RoleGuard>
  )
}

export function ProctorGuard({ children, fallback, loading }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[Role.PROCTOR]} fallback={fallback} loading={loading}>
      {children}
    </RoleGuard>
  )
}