'use client'

import { ReactNode } from 'react'
import { StudentGuard } from '@/components/auth/role-guard'
import { StudentSidebar } from '@/components/student/student-sidebar'
import { StudentHeader } from '@/components/student/student-header'
import { SidebarProvider, useSidebar } from '@/components/sidebar-context'
import { cn } from '@/lib/utils'

interface StudentLayoutProps {
  children: ReactNode
}

function StudentLayoutContent({ children }: StudentLayoutProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentSidebar />
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className={cn(
          "fixed top-0 right-0 left-0 z-40 transition-all duration-300",
          isCollapsed ? "lg:left-16" : "lg:left-64"
        )}>
          <StudentHeader />
        </div>
        <main className="pt-16 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <StudentGuard 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">You need student access to view this page.</p>
          </div>
        </div>
      }
    >
      <SidebarProvider>
        <StudentLayoutContent>{children}</StudentLayoutContent>
      </SidebarProvider>
    </StudentGuard>
  )
}