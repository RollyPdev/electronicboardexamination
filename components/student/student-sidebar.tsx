'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/sidebar-context'
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Clock,
  Trophy,
  Target,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Available Exams', href: '/student/exams', icon: BookOpen },
  { name: 'My Results', href: '/student/results', icon: FileText },
  { name: 'Rankings', href: '/student/rankings', icon: Trophy },
  { name: 'Performance', href: '/student/performance', icon: Target },
]

interface SidebarStats {
  examsTaken: number
  averageScore: number
  currentRank: number
}

export function StudentSidebar() {
  const pathname = usePathname()
  const [stats, setStats] = useState<SidebarStats>({ examsTaken: 0, averageScore: 0, currentRank: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [performanceRes, rankingsRes] = await Promise.all([
        fetch('/api/student/performance'),
        fetch('/api/student/rankings?limit=1')
      ])
      
      if (performanceRes.ok) {
        const performanceData = await performanceRes.json()
        const examsTaken = performanceData.summary.totalExams
        const averageScore = performanceData.summary.averagePercentage
        
        let currentRank = 0
        if (rankingsRes.ok) {
          const rankingsData = await rankingsRes.json()
          const userRanking = rankingsData.rankings.find((r: any) => r.isCurrentUser) || rankingsData.currentUserRank
          currentRank = userRanking?.rank || 0
        }
        
        setStats({ examsTaken, averageScore, currentRank })
      }
    } catch (error) {
      console.error('Error fetching sidebar stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64"
      )}>
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-gray-100 flex-shrink-0 transition-all duration-300",
        isCollapsed ? "justify-center px-4" : "justify-between px-6"
      )}>
        <Link href="/student" className={cn(
          "flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-lg font-semibold text-gray-900">Coeus</div>
              <div className="text-xs text-gray-500 -mt-1">Student Portal</div>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5 text-gray-600" /> : <ChevronLeft className="h-5 w-5 text-gray-600" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className={cn(
          "transition-all duration-300",
          isCollapsed ? "px-2" : "px-3"
        )}>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium rounded-lg transition-colors',
                      isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isCollapsed ? "mr-0" : "mr-3"
                    )} />
                    {!isCollapsed && item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Stats Card */}
        {!isCollapsed && (
          <div className="mx-3 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h4 className="text-sm font-semibold text-blue-900">Quick Stats</h4>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-3 bg-blue-200 rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-blue-200 rounded w-8 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700 font-medium">Exams Taken</span>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">{stats.examsTaken}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700 font-medium">Average Score</span>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">
                        {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700 font-medium">Current Rank</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">
                        {stats.currentRank > 0 ? `#${stats.currentRank}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}