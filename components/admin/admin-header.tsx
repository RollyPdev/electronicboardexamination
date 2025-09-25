'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
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
import { Bell, User, LogOut, Search, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'

const getPageTitle = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 1) return 'Dashboard'
  const page = segments[1]
  return page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')
}

export function AdminHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 ml-12 lg:ml-0 min-w-0 flex-1">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900 truncate">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search..." 
            className="pl-10 w-48 xl:w-64 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 hidden md:flex">
          <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600" />
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 lg:h-3 lg:w-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
            <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white rounded-full"></span>
          </span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hover:bg-slate-100 hidden md:flex">
          <Settings className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 sm:space-x-3 hover:bg-slate-100 px-2 sm:px-3 py-2 rounded-xl" disabled={status === 'loading'}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <div className="text-left hidden md:block min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {status === 'loading' ? 'Loading...' : (session?.user?.name || 'Admin User')}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {session?.user?.email || 'admin@example.com'}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || 'Admin User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || 'admin@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Logout</DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to logout? You will need to sign in again to access the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}