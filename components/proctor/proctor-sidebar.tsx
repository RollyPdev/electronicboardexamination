'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/sidebar-context'
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  BarChart3,
  FileText,
  Trophy,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/proctor', icon: LayoutDashboard },
  { name: 'Exams', href: '/proctor/exams', icon: BookOpen },
  { name: 'Students', href: '/proctor/students', icon: Users },
  { name: 'Results', href: '/proctor/results', icon: FileText },
  { name: 'Mock Board Results', href: '/proctor/mock-results', icon: Trophy },
  { name: 'Rankings', href: '/proctor/rankings', icon: BarChart3 },
]

export function ProctorSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-white/20 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl flex flex-col transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-16" : "lg:w-72",
        "w-72"
      )}>
      <div className={cn(
        "flex h-20 items-center border-b border-slate-200/60 flex-shrink-0 transition-all duration-300",
        isCollapsed ? "justify-center px-4" : "justify-between px-8"
      )}>
        <Link href="/proctor" className={cn(
          "flex items-center group transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-4">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Coeus</span>
              <div className="text-sm text-slate-500 font-medium">Proctor Portal</div>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 text-slate-600" /> : <ChevronLeft className="h-5 w-5 text-slate-600" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
      
      <nav className={cn(
        "flex-1 mt-8 overflow-y-auto transition-all duration-300",
        isCollapsed ? "px-2" : "px-6"
      )}>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'group flex items-center text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg shadow-green-500/25'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-10"></div>
                  )}
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors relative z-10",
                    isCollapsed ? "mr-0" : "mr-3",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                  {!isCollapsed && (
                    <span className="relative z-10">{item.name}</span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-75"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      </div>
    </>
  )
}