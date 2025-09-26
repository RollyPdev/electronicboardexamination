'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { InstitutionSelect } from '@/components/ui/institution-select'
import { User, Mail, GraduationCap, Save } from 'lucide-react'

export default function StudentProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile')
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.name || '',
          email: data.email || '',
          school: data.school || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        fetchProfile()
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          </div>
          <p className="text-gray-600">Loading your profile information...</p>
        </div>
        <div className="max-w-2xl">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive space-responsive">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="heading-responsive font-semibold text-gray-900 truncate">Profile Settings</h1>
            <p className="text-responsive text-gray-600 truncate">Manage your account information and preferences</p>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="max-w-2xl mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Profile updated successfully!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="card-responsive">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="input-responsive pl-8 sm:pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="input-responsive pl-8 sm:pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="school" className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 block">School/Institution</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 z-10" />
                    <InstitutionSelect
                      value={formData.school}
                      onValueChange={(value) => setFormData({ ...formData, school: value })}
                      placeholder="Search and select your institution"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="button-responsive bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-xs sm:text-sm">Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Update Profile</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}