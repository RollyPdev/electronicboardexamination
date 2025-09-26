'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Shield } from 'lucide-react'

interface ActivationModalProps {
  isOpen: boolean
}

export function ActivationModal({ isOpen }: ActivationModalProps) {
  const [enteredActivationCode, setEnteredActivationCode] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [activationError, setActivationError] = useState('')
  const router = useRouter()

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
      
      // Refresh the page to update the activation status
      window.location.reload()
      
    } catch (error) {
      setActivationError('Network error. Please try again.')
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="modal-responsive" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-base sm:text-lg">Account Activation Required</DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Your account needs to be activated. Please enter the activation code provided by your administrator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div>
            <Label htmlFor="activationCodeInput" className="text-xs sm:text-sm">Enter Activation Code</Label>
            <Input
              id="activationCodeInput"
              placeholder="Enter your activation code"
              value={enteredActivationCode}
              onChange={(e) => setEnteredActivationCode(e.target.value.toUpperCase())}
              className="input-responsive text-center font-mono text-base sm:text-lg"
              maxLength={6}
            />
          </div>
          {activationError && (
            <p className="text-red-500 text-xs sm:text-sm text-center">{activationError}</p>
          )}
          <Button
            onClick={handleActivation}
            disabled={isActivating || !enteredActivationCode}
            className="button-responsive w-full bg-blue-600 hover:bg-blue-700"
          >
            {isActivating ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Activating...</span>
              </>
            ) : (
              <span className="text-xs sm:text-sm">Activate Account</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}