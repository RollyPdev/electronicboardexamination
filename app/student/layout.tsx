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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <StudentSidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "lg:ml-0", // Remove left margin on mobile, sidebar handles its own positioning
        isCollapsed ? "lg:pl-16" : "lg:pl-64"
      )}>
        <div className="sticky top-0 z-40 w-full">
          <StudentHeader />
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container-responsive py-4 sm:py-6 lg:py-8 space-responsive">
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