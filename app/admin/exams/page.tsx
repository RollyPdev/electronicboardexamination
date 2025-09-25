'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  BookOpen,
  Clock,
  Users,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDuration } from '@/lib/exam-utils'

interface Exam {
  id: string
  title: string
  description: string | null
  durationMin: number
  published: boolean
  createdAt: string
  creator: {
    name: string | null
    email: string
  }
  _count: {
    questions: number
    results: number
  }
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [filter])

  const fetchExams = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('published', filter === 'published' ? 'true' : 'false')
      }
      
      const response = await fetch(`/api/admin/exams?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== examId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete exam')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      alert('Failed to delete exam')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-96"></div>
            </div>
            <div className="h-12 bg-slate-200 rounded-xl w-32"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-pulse">
          <div className="flex gap-4">
            <div className="h-12 bg-slate-200 rounded-xl flex-1"></div>
            <div className="h-12 bg-slate-200 rounded w-20"></div>
            <div className="h-12 bg-slate-200 rounded w-24"></div>
            <div className="h-12 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-slate-200 rounded-lg"></div>
                    <div className="h-8 bg-slate-200 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-slate-200 rounded-lg"></div>
                    <div className="h-8 bg-slate-200 rounded-lg"></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                    <div className="h-8 bg-slate-200 rounded flex-1"></div>
                    <div className="h-8 bg-slate-200 rounded w-10"></div>
                  </div>
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
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Examination Management</h1>
            <p className="text-slate-600 text-lg">
              Create, manage, and monitor your examination content
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search exams by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'hover:bg-slate-100'}
            >
              All ({exams.length})
            </Button>
            <Button
              variant={filter === 'published' ? 'default' : 'outline'}
              onClick={() => setFilter('published')}
              className={filter === 'published' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' : 'hover:bg-slate-100'}
            >
              Published
            </Button>
            <Button
              variant={filter === 'draft' ? 'default' : 'outline'}
              onClick={() => setFilter('draft')}
              className={filter === 'draft' ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white' : 'hover:bg-slate-100'}
            >
              Drafts
            </Button>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No exams found</h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {searchTerm ? 'No exams match your search criteria. Try adjusting your search terms.' : 'Get started by creating your first examination to begin testing students.'}
            </p>
            {!searchTerm && (
              <Link href="/admin/exams/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Exam
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors">{exam.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-slate-600 mt-2">
                      {exam.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={exam.published ? 'default' : 'secondary'}
                    className={exam.published 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    }
                  >
                    {exam.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{formatDuration(exam.durationMin)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{exam._count.questions} questions</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{exam._count.results} submissions</span>
                    </div>
                    <div className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg text-center">
                      <span className="font-medium">{new Date(exam.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/admin/exams/${exam.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/exams/${exam.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExam(exam.id)}
                      className="px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Exam</DialogTitle>
            <DialogDescription>
              Choose the type of examination you want to create
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              onClick={() => {
                setShowCreateModal(false)
                setShowCourseModal(true)
              }}
              className="h-16 text-left justify-start"
              variant="outline"
            >
              <div>
                <div className="font-semibold">Mock Board Exams</div>
                <div className="text-sm text-muted-foreground">Practice exams based on professional licensure tests</div>
              </div>
            </Button>
            <Link href="/admin/exams/new">
              <Button 
                className="h-16 text-left justify-start w-full"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                <div>
                  <div className="font-semibold">Create Examinations</div>
                  <div className="text-sm text-muted-foreground">Create custom examinations from scratch</div>
                </div>
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Selection Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Course</DialogTitle>
            <DialogDescription>
              Choose the professional course for your mock board exam
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              onClick={() => {
                setShowCourseModal(false)
                setShowSubjectModal(true)
              }}
              className="h-16 text-left justify-start"
              variant="outline"
            >
              <div>
                <div className="font-semibold">Criminologist Licensure Examination</div>
                <div className="text-sm text-muted-foreground">Professional examination for criminologists</div>
              </div>
            </Button>
            <Button 
              className="h-16 text-left justify-start"
              variant="outline"
              disabled
            >
              <div>
                <div className="font-semibold">Philippine Nursing Licensure Examinations</div>
                <div className="text-sm text-muted-foreground">Coming soon...</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Area Modal */}
      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Subject Area</DialogTitle>
            <DialogDescription>
              Choose the subject area for Criminologist Licensure Examination
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {[
              { name: 'Criminal Jurisprudence, Procedure and Evidence', weight: '20%' },
              { name: 'Law Enforcement Administration', weight: '20%' },
              { name: 'Criminalistics', weight: '20%' },
              { name: 'Crime Detection and Investigation', weight: '15%' },
              { name: 'Criminology', weight: '10%' },
              { name: 'Correctional Administration', weight: '15%' }
            ].map((subject) => (
              <Link 
                key={subject.name}
                href={`/admin/exams/new?type=mock&course=criminology&subject=${encodeURIComponent(subject.name.toLowerCase().replace(/\s+/g, '-'))}`}
              >
                <Button 
                  className="h-16 text-left justify-between w-full"
                  variant="outline"
                  onClick={() => setShowSubjectModal(false)}
                >
                  <div>
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-sm text-muted-foreground">Weight: {subject.weight}</div>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}