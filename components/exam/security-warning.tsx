'use client'

import { AlertTriangle, Shield, Camera, Monitor } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SecurityWarningProps {
  isOpen: boolean
  onClose: () => void
  eventType: string
  eventCount: number
  onContinue: () => void
}

const getEventDetails = (eventType: string) => {
  switch (eventType) {
    case 'screenshot_attempt':
      return {
        icon: Camera,
        title: 'Screenshot Attempt Detected',
        description: 'Taking screenshots during the exam is not allowed and has been logged.',
        severity: 'high' as const
      }
    case 'screen_recording':
      return {
        icon: Monitor,
        title: 'Screen Recording Detected',
        description: 'Screen recording during the exam is prohibited and has been logged.',
        severity: 'high' as const
      }
    case 'context_menu_blocked':
      return {
        icon: Shield,
        title: 'Right-Click Blocked',
        description: 'Right-click menu is disabled during the exam for security purposes.',
        severity: 'medium' as const
      }
    case 'devtools_attempt':
      return {
        icon: Shield,
        title: 'Developer Tools Blocked',
        description: 'Developer tools access is not allowed during the exam.',
        severity: 'high' as const
      }
    default:
      return {
        icon: AlertTriangle,
        title: 'Security Event Detected',
        description: 'A security-related action was detected and logged.',
        severity: 'medium' as const
      }
  }
}

export function SecurityWarning({
  isOpen,
  onClose,
  eventType,
  eventCount,
  onContinue
}: SecurityWarningProps) {
  const eventDetails = getEventDetails(eventType)
  const Icon = eventDetails.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              eventDetails.severity === 'high' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-left">
                {eventDetails.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <DialogDescription className="text-left">
            {eventDetails.description}
          </DialogDescription>

          {eventDetails.severity === 'high' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Multiple security violations may result in exam termination.
                Current violations: {eventCount}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <h4 className="font-medium mb-2">Exam Security Reminders:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Screenshots and screen recording are prohibited</li>
              <li>• Right-click and developer tools are disabled</li>
              <li>• All security events are logged and monitored</li>
              <li>• Focus on completing your exam honestly</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={onContinue} className="w-full">
              I Understand - Continue Exam
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}