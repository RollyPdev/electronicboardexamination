'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, FileText, BarChart3, Plus } from 'lucide-react'

interface DashboardStats {
  totalExams: number
  publishedExams: number
  totalStudents: number
  totalResults: number
  successRate: number
}

interface RecentActivity {
  id: string
  score: number | null
  maxScore: number | null
  submittedAt: string | null
  exam: { title: string }
  user: { name: string | null; email: string }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    publishedExams: 0,
    totalStudents: 0,
    totalResults: 0,
    successRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-responsive">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl card-responsive text-white">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
          Here's an overview of your examination system performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-blue-900">Total Exams</CardTitle>
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-xl">
              <BookOpen className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-1">
              {isLoading ? (
                <div className="h-6 sm:h-8 w-12 sm:w-16 bg-blue-200 rounded animate-pulse"></div>
              ) : (
                stats.totalExams
              )}
            </div>
            <p className="text-xs sm:text-sm text-blue-700">
              {stats.publishedExams} published
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-900">Students</CardTitle>
            <div className="p-2 bg-green-600 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 mb-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-green-200 rounded animate-pulse"></div>
              ) : (
                stats.totalStudents
              )}
            </div>
            <p className="text-sm text-green-700">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-900">Exam Results</CardTitle>
            <div className="p-2 bg-purple-600 rounded-xl">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-purple-200 rounded animate-pulse"></div>
              ) : (
                stats.totalResults
              )}
            </div>
            <p className="text-sm text-purple-700">
              Completed exams
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-orange-900">Success Rate</CardTitle>
            <div className="p-2 bg-orange-600 rounded-xl">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 mb-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-orange-200 rounded animate-pulse"></div>
              ) : (
                `${stats.successRate}%`
              )}
            </div>
            <p className="text-sm text-orange-700">
              Average pass rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-slate-600">
                  Latest exam submissions and activities
                </CardDescription>
              </div>
              <div className="p-2 bg-slate-100 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No recent activity</p>
                  <p className="text-sm text-slate-400">Activity will appear here once students start taking exams</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.user.name || activity.user.email} completed "{activity.exam.title}"
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.submittedAt ? new Date(activity.submittedAt).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                        activity.score && activity.maxScore 
                          ? Math.round((activity.score / activity.maxScore) * 100) >= 75
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.score && activity.maxScore 
                          ? `${Math.round((activity.score / activity.maxScore) * 100)}%`
                          : 'Pending'
                        }
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">
                  Common tasks
                </CardDescription>
              </div>
              <div className="p-2 bg-slate-100 rounded-xl">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/exams/new" className="block">
              <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group">
                <div className="p-2 bg-blue-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">Create New Exam</div>
                  <div className="text-xs text-blue-700">Build custom examinations</div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/results" className="block">
              <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group">
                <div className="p-2 bg-purple-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-purple-900">Review Results</div>
                  <div className="text-xs text-purple-700">Check pending reviews</div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/students" className="block">
              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 group">
                <div className="p-2 bg-green-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green-900">Manage Students</div>
                  <div className="text-xs text-green-700">View student accounts</div>
                </div>
              </div>
            </Link>
            
            <button 
              className="w-full flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 group" 
              onClick={() => window.print()}
            >
              <div className="p-2 bg-orange-600 rounded-lg mr-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-orange-900">Export Results</div>
                <div className="text-xs text-orange-700">Download reports</div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}