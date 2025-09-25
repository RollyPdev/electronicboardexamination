'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle, GraduationCap } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [createError, setCreateError] = useState('')
  const [createdAccount, setCreatedAccount] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const router = useRouter()

  const searchStudents = async (search: string) => {
    if (search.length < 2) {
      setStudents([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`/api/students/search?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      setStudents(data.students || [])
    } catch (error) {
      console.error('Error searching students:', error)
      setStudents([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        // Get session to check user role and redirect accordingly
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          setIsAdminLogin(true)
          setTimeout(() => {
            setIsRedirecting(true)
            router.push('/admin')
          }, 1500)
        } else {
          setIsRedirecting(true)
          router.push('/student')
        }
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (isAdminLogin) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Welcome Admin!</h2>
          <p className="text-blue-100">Preparing your dashboard...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Login Successful!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl border-0">
      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-gray-300 rounded-lg"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full h-11 sm:h-12 lg:h-14 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base lg:text-lg font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
        
        <div className="mt-4">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg border-gray-300">
                Create New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Create Student Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search" className="text-sm sm:text-base">Search Student Name</Label>
                  <Input
                    id="search"
                    placeholder="Type to search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      searchStudents(e.target.value)
                    }}
                    className="h-10 sm:h-12"
                  />
                  {isSearching && <p className="text-xs sm:text-sm text-gray-500">Searching...</p>}
                </div>
                
                <div>
                  <Label htmlFor="student" className="text-sm sm:text-base">Select Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="h-10 sm:h-12">
                      <SelectValue placeholder="Choose a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.length === 0 && searchTerm.length >= 2 && !isSearching ? (
                        <SelectItem value="no-results" disabled>
                          No students found
                        </SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} - {student.school || 'No School Listed'}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="newPassword" className="text-sm sm:text-base">Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="h-10 sm:h-12"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="h-10 sm:h-12"
                  />
                </div>
                
                {createError && (
                  <p className="text-red-500 text-xs sm:text-sm">{createError}</p>
                )}
                
                <Button onClick={handleCreateAccount} className="w-full h-10 sm:h-12">
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
          <DialogContent className="mx-4 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Account Created Successfully!
              </DialogTitle>
            </DialogHeader>
            {createdAccount && (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-sm sm:text-base">Name:</p>
                  <p className="text-gray-600 text-sm sm:text-base">{createdAccount.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">School:</p>
                  <p className="text-gray-600 text-sm sm:text-base">{createdAccount.school}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Email:</p>
                  <p className="text-gray-600 text-sm sm:text-base">{createdAccount.email}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">Password:</p>
                  <p className="text-gray-600 text-sm sm:text-base">{createdAccount.password}</p>
                </div>
                <Button onClick={() => setIsSuccessModalOpen(false)} className="w-full h-10 sm:h-12">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )

  async function handleCreateAccount() {
    setCreateError('')
    
    if (!selectedStudent || !newPassword || !confirmPassword) {
      setCreateError('Please fill in all fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setCreateError('Passwords do not match')
      return
    }
    
    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          password: newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setCreateError(data.error || 'Failed to create account')
        return
      }
      
      setCreatedAccount(data.student)
      setIsCreateModalOpen(false)
      setIsSuccessModalOpen(true)
      
      // Reset form
      setSelectedStudent('')
      setNewPassword('')
      setConfirmPassword('')
      setSearchTerm('')
      setStudents([])
      
    } catch (error) {
      setCreateError('Failed to create account')
    }
  }
}