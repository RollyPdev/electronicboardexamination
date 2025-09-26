'use client'

import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Mail, Shield } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        // Refresh the session to get updated user data
        await getSession()
        window.location.reload() // Force refresh to update header
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex-shrink-0">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base font-medium">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="h-10 sm:h-12 text-sm sm:text-base rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">Role</Label>
              <div className="flex items-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-xl border">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-sm sm:text-base font-medium text-green-800">Proctor</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}