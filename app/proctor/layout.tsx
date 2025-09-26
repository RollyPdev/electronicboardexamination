'use client'

import { ReactNode } from 'react'
import { ProctorGuard } from '@/components/auth/role-guard'
import { ProctorSidebar } from '@/components/proctor/proctor-sidebar'
import { ProctorHeader } from '@/components/proctor/proctor-header'
import { SidebarProvider, useSidebar } from '@/components/sidebar-context'
import { cn } from '@/lib/utils'

interface ProctorLayoutProps {
  children: ReactNode
}

function ProctorLayoutContent({ children }: ProctorLayoutProps) {
  const { isCollapsed } = useSidebar()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col lg:flex-row">
      <ProctorSidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "lg:ml-0",
        isCollapsed ? "lg:pl-16" : "lg:pl-72"
      )}>
        <div className="sticky top-0 z-40 w-full">
          <ProctorHeader />
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

export default function ProctorLayout({ children }: ProctorLayoutProps) {
  return (
    <ProctorGuard 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600">You need proctor privileges to access this page.</p>
          </div>
        </div>
      }
    >
      <SidebarProvider>
        <ProctorLayoutContent>{children}</ProctorLayoutContent>
      </SidebarProvider>
    </ProctorGuard>
  )
}