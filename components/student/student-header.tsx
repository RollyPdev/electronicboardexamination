'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bell, User, LogOut } from 'lucide-react'

export function StudentHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [studentData, setStudentData] = useState<{ name: string; school: string } | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      fetchStudentData()
    }
  }, [session])

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/student/profile')
      if (response.ok) {
        const data = await response.json()
        setStudentData({ name: data.name, school: data.school })
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-6">
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 ml-12 lg:ml-0 min-w-0 flex-1">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
          </div>
          <h1 className="text-sm sm:text-base lg:text-xl font-semibold text-gray-900 truncate">
            {status === 'loading' ? 'Loading...' : `Welcome, ${studentData?.name || session?.user?.name || 'Student'}`}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-gray-50 transition-colors hidden md:flex">
          <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">3</span>
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 lg:space-x-3 hover:bg-gray-50 transition-colors px-2 sm:px-3 py-2 rounded-lg" disabled={status === 'loading'}>
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
              </div>
              <div className="text-left hidden md:block min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {status === 'loading' ? 'Loading...' : (studentData?.name || session?.user?.name || 'Student')}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {status === 'loading' ? '' : (studentData?.school || 'No school selected')}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg border bg-white">
            <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={() => router.push('/student/profile')} 
              className="px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <User className="mr-3 h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-200" />
            <DropdownMenuItem 
              onClick={() => setShowLogoutDialog(true)} 
              className="px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-600" />
              <span className="text-gray-700">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}