'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck,
  Mail,
  Calendar,
  Eye
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Proctor {
  id: string
  name: string | null
  email: string
  createdAt: string
  _count: {
    createdExams: number
  }
}

export default function ProctorsPage() {
  const [proctors, setProctors] = useState<Proctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProctor, setSelectedProctor] = useState<Proctor | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProctors()
  }, [])

  const fetchProctors = async () => {
    try {
      const response = await fetch('/api/admin/proctors')
      if (response.ok) {
        const data = await response.json()
        setProctors(data.proctors)
      }
    } catch (error) {
      console.error('Error fetching proctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProctors = proctors.filter(proctor =>
    proctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/proctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await fetchProctors()
        setShowCreateModal(false)
        setFormData({ name: '', email: '', password: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create proctor')
      }
    } catch (error) {
      console.error('Error creating proctor:', error)
      alert('Failed to create proctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedProctor || !formData.name || !formData.email) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/proctors/${selectedProctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.password && { password: formData.password })
        })
      })
      
      if (response.ok) {
        await fetchProctors()
        setShowEditModal(false)
        setSelectedProctor(null)
        setFormData({ name: '', email: '', password: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update proctor')
      }
    } catch (error) {
      console.error('Error updating proctor:', error)
      alert('Failed to update proctor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (proctorId: string) => {
    if (!confirm('Are you sure you want to delete this proctor?')) return

    try {
      const response = await fetch(`/api/admin/proctors/${proctorId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProctors(proctors.filter(p => p.id !== proctorId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete proctor')
      }
    } catch (error) {
      console.error('Error deleting proctor:', error)
      alert('Failed to delete proctor')
    }
  }

  const openEditModal = (proctor: Proctor) => {
    setSelectedProctor(proctor)
    setFormData({ name: proctor.name || '', email: proctor.email, password: '' })
    setShowEditModal(true)
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
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl card-responsive shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="heading-responsive font-bold text-slate-900 mb-2">Proctor Management</h1>
            <p className="text-slate-600 text-responsive">
              Manage proctor accounts and permissions
            </p>
          </div>
          <Button 
            onClick={() => {
              setFormData({ name: '', email: '', password: '' })
              setShowCreateModal(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white button-responsive rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Add Proctor
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl card-responsive shadow-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          <Input
            placeholder="Search proctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 sm:pl-12 input-responsive bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
          />
        </div>
      </div>

      {/* Proctors List */}
      {filteredProctors.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <UserCheck className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No proctors found</h3>
            <p className="text-slate-600 text-center mb-6 max-w-md">
              {searchTerm ? 'No proctors match your search criteria.' : 'Get started by adding your first proctor.'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => {
                  setFormData({ name: '', email: '', password: '' })
                  setShowCreateModal(true)
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Proctor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProctors.map((proctor) => (
            <Card key={proctor.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{proctor.name || 'No name'}</h3>
                      <div className="flex items-center text-sm text-slate-600 mt-1">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        {proctor.email}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        Joined {new Date(proctor.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900">{proctor._count.createdExams}</div>
                      <div className="text-xs text-slate-500 font-medium">Exams Created</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(proctor)}
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(proctor.id)}
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

      {/* Create Proctor Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Proctor</DialogTitle>
            <DialogDescription>
              Create a new proctor account with exam management permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!formData.name || !formData.email || !formData.password || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Proctor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Proctor Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Proctor</DialogTitle>
            <DialogDescription>
              Update proctor account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
                className="mt-2"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEdit}
                disabled={!formData.name || !formData.email || isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Proctor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}