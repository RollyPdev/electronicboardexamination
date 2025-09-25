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
  Settings,
  FileText,
  Camera,
  Trophy,
  UserCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Exams', href: '/admin/exams', icon: BookOpen },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Results', href: '/admin/results', icon: FileText },
  { name: 'Mock Board Results', href: '/admin/mock-results', icon: Trophy },
  { name: 'Recordings', href: '/admin/recordings', icon: Camera },
  { name: 'Rankings', href: '/admin/rankings', icon: BarChart3 },
  { name: 'Activation', href: '/admin/activation', icon: UserCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
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
        <Link href="/admin" className={cn(
          "flex items-center group transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-4">
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Coeus</span>
              <div className="text-sm text-slate-500 font-medium">Admin Portal</div>
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
                  className={cn(
                    'group flex items-center text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-10"></div>
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
      
      {!isCollapsed && (
        <div className="p-6 flex-shrink-0">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <div className="text-sm font-medium text-slate-900 mb-1">📚 Need Help?</div>
            <div className="text-xs text-slate-600 mb-3">Access our comprehensive documentation and guides</div>
            <a 
              href="https://docs.coeus-exams.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block text-xs bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 font-medium"
            >
              📖 View Documentation
            </a>
          </div>
        </div>
      )}
      </div>
    </>
  )
}