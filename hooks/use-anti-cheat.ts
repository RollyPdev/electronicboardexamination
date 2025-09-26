'use client'

import { useEffect, useCallback } from 'react'

interface AntiCheatEvent {
  type: 'TAB_SWITCH' | 'PASTE_ATTEMPT' | 'COPY_ATTEMPT' | 'WINDOW_BLUR' | 'WINDOW_FOCUS' | 'FULLSCREEN_EXIT' | 'RIGHT_CLICK'
  timestamp: string
  metadata?: Record<string, any>
}

interface UseAntiCheatOptions {
  examId: string
  token: string
  enabled?: boolean
  onEvent?: (event: AntiCheatEvent) => void
}

export function useAntiCheat({ 
  examId, 
  token, 
  enabled = true, 
  onEvent 
}: UseAntiCheatOptions) {
  const logEvent = useCallback(async (event: AntiCheatEvent) => {
    try {
      // Log to API
      const response = await fetch(`/api/student/exams/${examId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          event,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('Anti-cheat event logging failed:', response.status, errorData.error)
        
        // Don't throw error for non-critical failures (404, 400) as they don't affect exam functionality
        if (response.status !== 404 && response.status !== 400) {
          throw new Error(`HTTP ${response.status}: ${errorData.error}`)
        }
      }
      
      // Call custom handler if provided
      onEvent?.(event)
    } catch (error) {
      console.error('Failed to log anti-cheat event:', error)
    }
  }, [examId, token, onEvent])

  // Prevent copy/paste
  useEffect(() => {
    if (!enabled) return

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      logEvent({
        type: 'COPY_ATTEMPT',
        timestamp: new Date().toISOString(),
        metadata: { prevented: true },
      })
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      logEvent({
        type: 'PASTE_ATTEMPT',
        timestamp: new Date().toISOString(),
        metadata: { prevented: true },
      })
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      logEvent({
        type: 'COPY_ATTEMPT',
        timestamp: new Date().toISOString(),
        metadata: { type: 'cut', prevented: true },
      })
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('cut', handleCut)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('cut', handleCut)
    }
  }, [enabled, logEvent])

  // Detect window focus/blur (potential tab switching)
  useEffect(() => {
    if (!enabled) return

    const handleBlur = () => {
      logEvent({
        type: 'WINDOW_BLUR',
        timestamp: new Date().toISOString(),
        metadata: { 
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      })
    }

    const handleFocus = () => {
      logEvent({
        type: 'WINDOW_FOCUS',
        timestamp: new Date().toISOString(),
        metadata: { 
          url: window.location.href,
        },
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logEvent({
          type: 'TAB_SWITCH',
          timestamp: new Date().toISOString(),
          metadata: { 
            visibilityState: document.visibilityState,
            hidden: document.hidden,
          },
        })
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, logEvent])

  // Detect fullscreen exit
  useEffect(() => {
    if (!enabled) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent({
          type: 'FULLSCREEN_EXIT',
          timestamp: new Date().toISOString(),
          metadata: { 
            fullscreenElement: document.fullscreenElement,
          },
        })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [enabled, logEvent])

  // Disable right-click context menu
  useEffect(() => {
    if (!enabled) return

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logEvent({
        type: 'RIGHT_CLICK',
        timestamp: new Date().toISOString(),
        metadata: { 
          x: e.clientX,
          y: e.clientY,
          target: (e.target as Element)?.tagName,
        },
      })
    }

    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [enabled, logEvent])

  // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault()
        logEvent({
          type: 'COPY_ATTEMPT',
          timestamp: new Date().toISOString(),
          metadata: { 
            key: 'F12',
            prevented: true,
            type: 'devtools_attempt',
          },
        })
        return
      }

      // Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        logEvent({
          type: 'COPY_ATTEMPT',
          timestamp: new Date().toISOString(),
          metadata: { 
            key: 'Ctrl+Shift+I',
            prevented: true,
            type: 'devtools_attempt',
          },
        })
        return
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        logEvent({
          type: 'COPY_ATTEMPT',
          timestamp: new Date().toISOString(),
          metadata: { 
            key: 'Ctrl+U',
            prevented: true,
            type: 'view_source_attempt',
          },
        })
        return
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        logEvent({
          type: 'COPY_ATTEMPT',
          timestamp: new Date().toISOString(),
          metadata: { 
            key: 'Ctrl+Shift+C',
            prevented: true,
            type: 'inspect_attempt',
          },
        })
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, logEvent])

  return {
    logEvent,
  }
}