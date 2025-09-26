'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Leaderboard } from '@/components/student/leaderboard'
import { StudentStats } from '@/components/student/student-stats'
import { Trophy, BarChart3, TrendingUp } from 'lucide-react'

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats'>('leaderboard')

  return (
    <div className="container-responsive space-responsive">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h1 className="heading-responsive font-semibold text-gray-900 truncate">Rankings & Statistics</h1>
            <p className="text-responsive text-gray-600 truncate">View leaderboards and track your performance</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 sm:gap-2">
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 ${activeTab === 'leaderboard' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="truncate">Leaderboard</span>
        </Button>
        <Button
          variant={activeTab === 'stats' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stats')}
          className={`flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-4 ${activeTab === 'stats' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="truncate">My Statistics</span>
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg flex-shrink-0">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900 truncate">Leaderboard</h2>
          </div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="card-responsive">
              <Leaderboard limit={10} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900 truncate">My Statistics</h2>
          </div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="card-responsive">
              <StudentStats />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}