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
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Account Activation Required</DialogTitle>
          <DialogDescription className="text-center">
            Your account needs to be activated. Please enter the activation code provided by your administrator.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="activationCodeInput">Enter Activation Code</Label>
            <Input
              id="activationCodeInput"
              placeholder="Enter your activation code"
              value={enteredActivationCode}
              onChange={(e) => setEnteredActivationCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg"
              maxLength={6}
            />
          </div>
          {activationError && (
            <p className="text-red-500 text-sm text-center">{activationError}</p>
          )}
          <Button
            onClick={handleActivation}
            disabled={isActivating || !enteredActivationCode}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isActivating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Account'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}