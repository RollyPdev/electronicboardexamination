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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Trophy className="h-4 w-4 text-amber-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Rankings & Statistics</h1>
        </div>
        <p className="text-gray-600">View leaderboards and track your performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('leaderboard')}
          className={activeTab === 'leaderboard' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Leaderboard
        </Button>
        <Button
          variant={activeTab === 'stats' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stats')}
          className={activeTab === 'stats' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          My Statistics
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'leaderboard' ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Leaderboard</h2>
          </div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <Leaderboard limit={50} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">My Statistics</h2>
          </div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <StudentStats />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}