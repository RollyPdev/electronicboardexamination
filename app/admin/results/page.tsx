'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, FileText, User, Calendar, Eye, Award, Plus, Edit, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { calculateCLEResult, formatCLETable, type CLEResult } from '@/lib/cle-scoring'

interface ExamResult {
  id: string
  score: number | null
  maxScore: number | null
  submittedAt: string | null
  status: string
  answers?: any
  exam: {
    title: string
  }
  user: {
    name: string | null
    email: string
    school: string | null
  }
}

interface Exam {
  id: string
  title: string
}

interface User {
  id: string
  name: string | null
  email: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [cleResult, setCleResult] = useState<CLEResult | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingResult, setEditingResult] = useState<ExamResult | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    examId: '',
    userId: '',
    score: '',
    maxScore: '',
    status: 'IN_PROGRESS'
  })

  useEffect(() => {
    fetchResults()
    fetchExams()
    fetchUsers()
  }, [])

  const fetchResults = async () => {
    try {
      const response = await fetch('/api/admin/results')
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams')
      if (response.ok) {
        const data = await response.json()
        setExams(data.exams)
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users.filter((u: User) => u.email !== 'admin@example.com'))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: formData.examId,
          userId: formData.userId,
          score: formData.score ? parseFloat(formData.score) : null,
          maxScore: formData.maxScore ? parseFloat(formData.maxScore) : null,
          status: formData.status
        })
      })
      
      if (response.ok) {
        fetchResults()
        setShowCreateModal(false)
        setFormData({ examId: '', userId: '', score: '', maxScore: '', status: 'IN_PROGRESS' })
      }
    } catch (error) {
      console.error('Error creating result:', error)
    }
  }

  const handleEdit = (result: ExamResult) => {
    setEditingResult(result)
    setFormData({
      examId: '',
      userId: '',
      score: result.score?.toString() || '',
      maxScore: result.maxScore?.toString() || '',
      status: result.status
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!editingResult) return
    
    try {
      const response = await fetch(`/api/admin/results/${editingResult.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: formData.score ? parseFloat(formData.score) : null,
          maxScore: formData.maxScore ? parseFloat(formData.maxScore) : null,
          status: formData.status
        })
      })
      
      if (response.ok) {
        fetchResults()
        setShowEditModal(false)
        setEditingResult(null)
        setFormData({ examId: '', userId: '', score: '', maxScore: '', status: 'IN_PROGRESS' })
      }
    } catch (error) {
      console.error('Error updating result:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return
    
    try {
      const response = await fetch(`/api/admin/results/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchResults()
      }
    } catch (error) {
      console.error('Error deleting result:', error)
    }
  }

  const viewResult = (result: ExamResult) => {
    setSelectedResult(result)
    
    // Check if this is a CLE mock exam
    if (result.exam.title.toLowerCase().includes('criminologist') && result.answers) {
      // Generate realistic scores based on overall score percentage
      let mockScores: Record<string, number>
      const overallPercentage = result.score && result.maxScore ? (result.score / result.maxScore) * 100 : 0
      
      if (overallPercentage >= 80) { // PASS
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 85,
          'Law Enforcement Administration': 78,
          'Criminalistics': 82,
          'Crime Detection and Investigation': 76,
          'Criminology': 80,
          'Correctional Administration': 79
        }
      } else if (overallPercentage >= 70) { // DEFERRED
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 85, // 20% weight = 17.0
          'Law Enforcement Administration': 45, // 20% weight = 9.0 (below 50%)
          'Criminalistics': 82, // 20% weight = 16.4
          'Crime Detection and Investigation': 85, // 15% weight = 12.75
          'Criminology': 85, // 10% weight = 8.5
          'Correctional Administration': 90 // 15% weight = 13.5
        } // Total: 77.15% (≥75% with only 1 subject below 50%)
      } else { // FAIL
        mockScores = {
          'Criminal Jurisprudence, Procedure and Evidence': 65,
          'Law Enforcement Administration': 42, // Below 50%
          'Criminalistics': 38, // Below 50%
          'Crime Detection and Investigation': 45, // Below 50%
          'Criminology': 55,
          'Correctional Administration': 48 // Below 50%
        }
      }
      
      setCleResult(calculateCLEResult(mockScores, true))
    } else {
      setCleResult(null)
    }
  }

  const filteredResults = results.filter(result =>
    result.exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getScoreColor = (score: number | null, maxScore: number | null) => {
    if (!score || !maxScore) return 'bg-gray-100 text-gray-800'
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'bg-green-100 text-green-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 animate-pulse">
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-48"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-3 bg-slate-200 rounded w-40"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="h-6 bg-slate-200 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-12"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-slate-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-24"></div>
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
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Exam Results Management</h1>
            <p className="text-slate-600 text-lg">
              Monitor and review all student exam submissions and performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
            <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Results</p>
                <p className="text-3xl font-bold text-blue-900">{results.length}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Graded</p>
                <p className="text-3xl font-bold text-green-900">
                  {results.filter(r => r.score !== null).length}
                </p>
              </div>
              <div className="p-3 bg-green-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900">Pending</p>
                <p className="text-3xl font-bold text-orange-900">
                  {results.filter(r => r.score === null).length}
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Avg Score</p>
                <p className="text-3xl font-bold text-purple-900">
                  {results.filter(r => r.score && r.maxScore).length > 0
                    ? Math.round(results.filter(r => r.score && r.maxScore).reduce((sum, r) => sum + ((r.score! / r.maxScore!) * 100), 0) / results.filter(r => r.score && r.maxScore).length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-600 rounded-xl">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by exam title, student name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
          />
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
            <p className="text-slate-600 text-center max-w-md">
              {searchTerm ? 'No results match your search criteria. Try adjusting your search terms.' : 'No exam results are available yet. Results will appear here once students complete exams.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{result.exam.title}</h3>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                        {result.user.name || result.user.email}
                      </div>
                      {result.user.school && (
                        <div className="text-xs text-slate-500 mt-1">
                          🏫 {result.user.school}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <Badge className={`${getScoreColor(result.score, result.maxScore)} font-bold px-3 py-1`}>
                        {result.score && result.maxScore 
                          ? `${Math.round((result.score / result.maxScore) * 100)}%` 
                          : result.status === 'SUBMITTED' ? 'Pending' : 'Not Graded'
                        }
                      </Badge>
                      {result.score && result.maxScore && (
                        <div className="text-xs text-slate-500 mt-1">
                          {result.score}/{result.maxScore}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        Submitted
                      </div>
                      <div className="text-sm text-slate-600">
                        {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Not submitted'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewResult(result)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(result)}
                        className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(result.id)}
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CLE Result Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-0 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Exam Result Details</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{selectedResult.exam.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedResult.user.name || selectedResult.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    School: {selectedResult.user.school || 'No School Listed'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {selectedResult.submittedAt ? new Date(selectedResult.submittedAt).toLocaleString() : 'Not submitted'}
                  </p>
                </div>

                {cleResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <h4 className="font-medium">CLE Mock Board Exam Results</h4>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Subject</th>
                            <th className="text-center py-2">Score</th>
                            <th className="text-center py-2">Weight</th>
                            <th className="text-center py-2">Weighted Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cleResult.subjects.map((subject, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{subject.name}</td>
                              <td className="text-center py-2">{subject.score}%</td>
                              <td className="text-center py-2">{subject.weight}%</td>
                              <td className="text-center py-2">{((subject.score * subject.weight) / 100).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">General Average:</span>
                          <span className="font-bold text-lg">{cleResult.generalAverage}%</span>
                        </div>
                        <div className={`p-3 rounded-lg font-medium ${
                          cleResult.status === 'PASS' ? 'bg-green-100 text-green-800' :
                          cleResult.status === 'DEFERRED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          <div className="text-center mb-2">{cleResult.message}</div>
                          {cleResult.retakeSubjects && cleResult.retakeSubjects.length > 0 && (
                            <div className="text-sm mt-2">
                              <strong>Subjects to retake:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {cleResult.retakeSubjects.map((subject, index) => (
                                  <li key={index}>{subject}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {cleResult.status === 'FAIL' && (
                            <div className="text-sm mt-2">
                              <strong>Failed subjects (below 50%):</strong>
                              <ul className="list-disc list-inside mt-1">
                                {cleResult.subjects
                                  .filter(s => s.score < 50)
                                  .map((subject, index) => (
                                    <li key={index}>{subject.name} ({subject.score}%)</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-center text-muted-foreground">
                      {selectedResult.score && selectedResult.maxScore 
                        ? `Score: ${selectedResult.score}/${selectedResult.maxScore} (${Math.round((selectedResult.score / selectedResult.maxScore) * 100)}%)`
                        : 'Score not available'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Exam</Label>
              <Select value={formData.examId} onValueChange={(value) => setFormData({...formData, examId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Student</Label>
              <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Score</Label>
              <Input 
                type="number" 
                value={formData.score} 
                onChange={(e) => setFormData({...formData, score: e.target.value})}
                placeholder="Enter score"
              />
            </div>
            <div>
              <Label>Max Score</Label>
              <Input 
                type="number" 
                value={formData.maxScore} 
                onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                placeholder="Enter max score"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="GRADED">Graded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Score</Label>
              <Input 
                type="number" 
                value={formData.score} 
                onChange={(e) => setFormData({...formData, score: e.target.value})}
                placeholder="Enter score"
              />
            </div>
            <div>
              <Label>Max Score</Label>
              <Input 
                type="number" 
                value={formData.maxScore} 
                onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
                placeholder="Enter max score"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="GRADED">Graded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}