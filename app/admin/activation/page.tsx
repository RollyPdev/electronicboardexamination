'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { UserCheck, Clock, Search, Key } from 'lucide-react'

interface PendingStudent {
  id: string
  name: string
  email: string
  school: string
  activationCode: string
  createdAt: string
}

export default function ActivationPage() {
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activatingIds, setActivatingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingStudents()
  }, [])

  const fetchPendingStudents = async () => {
    try {
      const response = await fetch('/api/admin/pending-students')
      if (response.ok) {
        const data = await response.json()
        setPendingStudents(data.students)
      }
    } catch (error) {
      console.error('Error fetching pending students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActivate = async (studentId: string) => {
    setActivatingIds(prev => new Set(prev).add(studentId))
    try {
      const response = await fetch('/api/admin/activate-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      if (response.ok) {
        setPendingStudents(prev => prev.filter(s => s.id !== studentId))
      }
    } catch (error) {
      console.error('Error activating student:', error)
    } finally {
      setActivatingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(studentId)
        return newSet
      })
    }
  }

  const filteredStudents = pendingStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
          <div className="h-5 bg-slate-200 rounded w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Activation</h1>
            <p className="text-slate-600 text-lg">
              Manage student account activations and provide activation codes
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Pending Activation</p>
                <p className="text-3xl font-bold text-blue-900">{pendingStudents.length}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search students by name, email, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Pending Activations</h3>
            <p className="text-slate-600">All student accounts are activated</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-1">{student.email}</p>
                      <p className="text-sm text-slate-500">{student.school}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Registered: {new Date(student.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-700">Activation Code</span>
                        </div>
                        <div className="bg-slate-100 px-3 py-2 rounded-lg">
                          <span className="font-mono text-lg font-bold text-blue-600">
                            {student.activationCode}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleActivate(student.id)}
                        disabled={activatingIds.has(student.id)}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        {activatingIds.has(student.id) ? (
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-2" />
                        )}
                        {activatingIds.has(student.id) ? 'Activating...' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}