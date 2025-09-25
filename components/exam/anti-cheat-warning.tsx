'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Eye, 
  Shield, 
  X 
} from 'lucide-react'

interface AntiCheatWarningProps {
  isOpen: boolean
  onClose: () => void
  eventType: string
  eventCount: number
  onContinue: () => void
}

export function AntiCheatWarning({ 
  isOpen, 
  onClose, 
  eventType, 
  eventCount, 
  onContinue 
}: AntiCheatWarningProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      onContinue()
    }
  }, [isOpen, countdown, onContinue])

  useEffect(() => {
    if (isOpen) {
      setCountdown(10) // Reset countdown when modal opens
    }
  }, [isOpen])

  if (!isOpen) return null

  const getEventMessage = (type: string) => {
    switch (type) {
      case 'TAB_SWITCH':
        return 'You switched to another tab or window'
      case 'PASTE_ATTEMPT':
        return 'You attempted to paste content'
      case 'COPY_ATTEMPT':
        return 'You attempted to copy content'
      case 'WINDOW_BLUR':
        return 'The exam window lost focus'
      case 'FULLSCREEN_EXIT':
        return 'You exited fullscreen mode'
      case 'RIGHT_CLICK':
        return 'You used the right-click context menu'
      default:
        return 'Suspicious activity was detected'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR':
      case 'FULLSCREEN_EXIT':
        return <Eye className="h-6 w-6 text-yellow-500" />
      case 'PASTE_ATTEMPT':
      case 'COPY_ATTEMPT':
      case 'RIGHT_CLICK':
        return <Shield className="h-6 w-6 text-red-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-orange-500" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-2 border-red-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getEventIcon(eventType)}
              <div>
                <CardTitle className="text-red-600">Security Alert</CardTitle>
                <CardDescription>
                  Proctoring system notification
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{getEventMessage(eventType)}</strong>
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              This activity has been logged and will be reviewed by your instructor.
            </p>
            
            {eventCount > 1 && (
              <p className="text-red-600 font-medium">
                This is event #{eventCount}. Multiple violations may result in exam termination.
              </p>
            )}

            <div className="bg-blue-50 p-3 rounded-md mt-3">
              <h4 className="font-medium text-blue-800 mb-1">Reminder:</h4>
              <ul className="text-blue-700 text-xs space-y-1">
                <li>• Stay in this exam tab throughout the test</li>
                <li>• Do not copy, paste, or use external resources</li>
                <li>• Keep the exam window in focus and fullscreen</li>
                <li>• Your camera is recording for security</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Auto-continuing in {countdown}s
            </div>
            <Button 
              onClick={onContinue}
              variant="outline"
              size="sm"
            >
              Continue Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}