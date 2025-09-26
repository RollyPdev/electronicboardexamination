'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Users, Mail, Calendar, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Student {
  id: string
  name: string | null
  email: string
  school?: string
  course?: string
  createdAt: string
  _count: {
    examsTaken: number
  }
}

export default function ProctorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-96"></div>
            </div>
            <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-slate-200 rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div>
                      <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Management</h1>
            <p className="text-slate-600 text-lg">
              View registered students and track their examination activity
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl">
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Students</p>
                <p className="text-3xl font-bold text-blue-900">{students.length}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Active Students</p>
                <p className="text-3xl font-bold text-green-900">
                  {students.filter(s => s._count.examsTaken > 0).length}
                </p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Total Exams Taken</p>
                <p className="text-3xl font-bold text-purple-900">
                  {students.reduce((sum, s) => sum + s._count.examsTaken, 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">New This Month</p>
                <p className="text-3xl font-bold text-orange-900">
                  {students.filter(s => {
                    const studentDate = new Date(s.createdAt)
                    const now = new Date()
                    return studentDate.getMonth() === now.getMonth() && 
                           studentDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search students by name, email, school, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
            <p className="text-slate-600 text-center max-w-md">
              {searchTerm ? 'No students match your search criteria. Try adjusting your search terms.' : 'No students have registered yet. Students will appear here once they create accounts.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{(student.name || 'No name provided').toUpperCase()}</h3>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        {student.email}
                      </div>
                      {student.school && (
                        <div className="text-sm text-slate-600 mt-1">
                          🏫 {student.school}
                        </div>
                      )}
                      {student.course && (
                        <div className="text-xs text-slate-500 mt-1">
                          📚 {student.course}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">{student._count.examsTaken}</div>
                      <div className="text-xs text-slate-500 font-medium">Exams Taken</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        Joined
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        variant="secondary" 
                        className={student._count.examsTaken > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                        }
                      >
                        {student._count.examsTaken > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        Last activity: {student._count.examsTaken > 0 ? 'Recently' : 'No activity'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(student)}
                        className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedStudent?.name?.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Full Name</Label>
                  <p className="text-lg font-semibold">{selectedStudent.name?.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Email Address</Label>
                  <p className="text-lg">{selectedStudent.email}</p>
                </div>
              </div>
              
              {selectedStudent.school && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">School/Institution</Label>
                  <p className="text-lg">{selectedStudent.school}</p>
                </div>
              )}
              
              {selectedStudent.course && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Course/Program</Label>
                  <p className="text-lg">{selectedStudent.course}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Registration Date</Label>
                  <p className="text-lg">{new Date(selectedStudent.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Exams Taken</Label>
                  <p className="text-lg font-semibold">{selectedStudent._count.examsTaken}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}