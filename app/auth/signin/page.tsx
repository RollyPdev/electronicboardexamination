'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, GraduationCap, CheckCircle, Eye, EyeOff, Mail, Lock, Search, UserPlus, Shield } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
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
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false)
  const [activationCode, setActivationCode] = useState('')
  const [enteredActivationCode, setEnteredActivationCode] = useState('')
  const [newUserData, setNewUserData] = useState<any>(null)
  const [isActivating, setIsActivating] = useState(false)
  const [activationError, setActivationError] = useState('')
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    middleInitial: '',
    lastName: '',
    school: '',
    email: '',
    password: ''
  })
  const [institutions, setInstitutions] = useState<string[]>([])
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
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

  const searchInstitutions = async (search: string) => {
    if (search.length < 2) {
      setInstitutions([])
      return
    }
    
    setIsLoadingInstitutions(true)
    try {
      const response = await fetch(`/api/institutions?search=${encodeURIComponent(search)}`)
      const data = await response.json()
      setInstitutions(data.institutions || [])
    } catch (error) {
      console.error('Error searching institutions:', error)
      setInstitutions([])
    } finally {
      setIsLoadingInstitutions(false)
    }
  }

  const handleRegister = async () => {
    setRegisterError('')
    setIsRegistering(true)
    
    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setRegisterError(data.error || 'Failed to register')
        return
      }
      
      // Auto-login the user after registration
      const loginResult = await signIn('credentials', {
        email: registerForm.email,
        password: registerForm.password,
        redirect: false,
      })
      
      if (loginResult?.ok) {
        router.push('/student?needsActivation=true')
      } else {
        setRegisterError('Registration successful but login failed. Please try logging in manually.')
      }
      setIsRegisterModalOpen(false)
      
    } catch (error) {
      setRegisterError('Network error. Please try again.')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleActivation = async () => {
    setActivationError('')
    setIsActivating(true)
    
    try {
      const response = await fetch('/api/students/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationCode: enteredActivationCode })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setActivationError(data.error || 'Failed to activate account')
        return
      }
      
      setIsActivationModalOpen(false)
      router.push('/loading')
      
    } catch (error) {
      setActivationError('Network error. Please try again.')
    } finally {
      setIsActivating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login for:', email)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        console.log('SignIn error:', result.error)
        if (result.error === 'Account not activated') {
          // Check if user exists and get activation code
          const userResponse = await fetch('/api/auth/check-activation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })
          const userData = await userResponse.json()
          if (userData.activationCode) {
            setActivationCode(userData.activationCode)
            setIsActivationModalOpen(true)
          } else {
            setError('Account requires activation. Please contact administrator.')
          }
        } else {
          setError('Invalid email or password')
        }
      } else {
        console.log('Login successful, getting session...')
        // Small delay to ensure loading screen shows
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get session to check user role and redirect accordingly
        const session = await getSession()
        console.log('Session:', session)
        if (session?.user?.role === 'ADMIN') {
          console.log('Redirecting to admin')
          router.push('/admin')
        } else {
          console.log('Redirecting to loading screen')
          router.push('/loading')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Top/Left side - Animation */}
      <div className="lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="max-w-md text-center">
          <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-80 lg:h-80 mx-auto mb-4 sm:mb-6 lg:mb-8 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
              <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            e-BES
          </h1>
          <p className="text-sm sm:text-base lg:text-xl text-gray-600 leading-relaxed font-light px-4 lg:px-0">
            <span className="text-blue-600 font-semibold">Electronic Board Examination System</span> helps students connect and take exams with <span className="text-indigo-600 font-medium">advanced proctoring features</span>.
          </p>
        </div>
      </div>

      {/* Bottom/Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    disabled={isLoading}
                    className="h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg border-gray-300 rounded-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-11 lg:h-12 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base lg:text-lg font-semibold rounded-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>
              
              <div className="mt-4">
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 text-lg font-semibold rounded-lg border-gray-300">
                      Create New Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
                <DialogHeader className="pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl">
                      <UserPlus className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center text-slate-900">
                    Create or Change Password
                  </DialogTitle>
                  <p className="text-center text-slate-600 mt-2">
                    Set up or update your login password
                  </p>
                </DialogHeader>
                <div className="space-y-6 px-2">
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-slate-700 font-medium">Search & Select Student</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="Type student name to search and select..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          searchStudents(e.target.value)
                          setSelectedStudent('')
                        }}
                        className="pl-11 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                      />
                    </div>
                    {isSearching && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching students...
                      </div>
                    )}
                    {students.length > 0 && searchTerm.length >= 2 && (
                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            onClick={() => {
                              setSelectedStudent(student.id)
                              setSearchTerm(student.name)
                              setStudents([])
                            }}
                            className={`p-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0 ${
                              selectedStudent === student.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{student.name}</span>
                              <span className="text-sm text-slate-500">{student.school || 'No School Listed'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchTerm.length >= 2 && students.length === 0 && !isSearching && !selectedStudent && (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500 mb-3">No record shows</p>
                        <Button
                          onClick={() => setIsRegisterModalOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                          Create Account
                        </Button>
                      </div>
                    )}
                    {selectedStudent && (
                      <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        Student selected
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-slate-700 font-medium">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter password"
                          className="pl-11 pr-11 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className="pl-11 pr-11 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {createError && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{createError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 h-11 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                      disabled={isCreatingAccount}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateAccount} 
                      className="flex-1 h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={isCreatingAccount || !selectedStudent || !newPassword || !confirmPassword}
                    >
                      {isCreatingAccount ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5" />
                          Set Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                  </DialogContent>
                </Dialog>
              </div>
            
            <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
              <DialogContent className="sm:max-w-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-center text-slate-900">
                    Password Set Successfully!
                  </DialogTitle>
                  <p className="text-center text-slate-600 mt-2">
                    You can now sign in with your credentials
                  </p>
                </DialogHeader>
                {createdAccount && (
                  <div className="space-y-6 px-2">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-slate-600 mb-2">Student Name</p>
                          <p className="text-xl font-bold text-slate-900">{createdAccount.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">School/Institution</p>
                          <p className="text-slate-900 break-words">{createdAccount.school || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 mb-2">Email Address</p>
                          <p className="text-slate-900 font-mono text-sm break-all">{createdAccount.email}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-slate-600 mb-2">Login Password</p>
                          <div className="bg-white px-4 py-3 rounded-lg border border-slate-300">
                            <p className="text-slate-900 font-mono text-lg font-semibold text-center">{createdAccount.password}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your password has been set successfully. You can now sign in to access your examination portal. You can change your password anytime using this same process.
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => setIsSuccessModalOpen(false)} 
                      className="w-full h-11 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-xl"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Registration Modal */}
            <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First Name"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({...registerForm, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleInitial">Middle Initial</Label>
                      <Input
                        id="middleInitial"
                        placeholder="M.I."
                        value={registerForm.middleInitial}
                        onChange={(e) => setRegisterForm({...registerForm, middleInitial: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last Name"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({...registerForm, lastName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="school">School/Institution</Label>
                    <div className="relative">
                      <Input
                        id="school"
                        placeholder="Search and select your school..."
                        value={registerForm.school}
                        onChange={(e) => {
                          setRegisterForm({...registerForm, school: e.target.value})
                          searchInstitutions(e.target.value)
                        }}
                      />
                      {isLoadingInstitutions && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {institutions.length > 0 && registerForm.school && (
                        <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10 mt-1">
                          {institutions.map((institution, index) => (
                            <div
                              key={index}
                              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                              onClick={() => {
                                setRegisterForm({...registerForm, school: institution})
                                setInstitutions([])
                              }}
                            >
                              {institution}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    />
                  </div>
                  {registerError && (
                    <p className="text-red-500 text-sm">{registerError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRegisterModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="flex-1"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>


              

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  async function handleCreateAccount() {
    setCreateError('')
    setIsCreatingAccount(true)
    
    // Validation
    if (!selectedStudent || !newPassword || !confirmPassword) {
      setCreateError('Please fill in all fields')
      setIsCreatingAccount(false)
      return
    }
    
    if (newPassword.length < 6) {
      setCreateError('Password must be at least 6 characters long')
      setIsCreatingAccount(false)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setCreateError('Passwords do not match')
      setIsCreatingAccount(false)
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
        setIsCreatingAccount(false)
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
      setShowPassword(false)
      setShowConfirmPassword(false)
      
    } catch (error) {
      setCreateError('Network error. Please try again.')
    } finally {
      setIsCreatingAccount(false)
    }
  }
}