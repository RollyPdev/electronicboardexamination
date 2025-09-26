'use client'

import { useEffect, useCallback } from 'react'

interface ScreenshotPreventionOptions {
  enabled: boolean
  onScreenshotAttempt?: () => void
  onScreenRecordingDetected?: () => void
}

export function useScreenshotPrevention({
  enabled,
  onScreenshotAttempt,
  onScreenRecordingDetected
}: ScreenshotPreventionOptions) {
  
  const logSecurityEvent = useCallback((type: string, details?: any) => {
    console.warn(`Security event: ${type}`, details)
    if (type === 'screenshot_attempt' && onScreenshotAttempt) {
      onScreenshotAttempt()
    }
    if (type === 'screen_recording' && onScreenRecordingDetected) {
      onScreenRecordingDetected()
    }
  }, [onScreenshotAttempt, onScreenRecordingDetected])

  useEffect(() => {
    if (!enabled) return

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logSecurityEvent('context_menu_blocked')
      return false
    }

    // Disable common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen key
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        logSecurityEvent('screenshot_attempt', { key: 'PrintScreen' })
        return false
      }

      // Windows screenshot shortcuts
      if (e.key === 'PrintScreen' || 
          (e.metaKey && e.shiftKey && e.key === 'S') || // Cmd+Shift+S (macOS)
          (e.ctrlKey && e.shiftKey && e.key === 'S') || // Ctrl+Shift+S (Windows)
          (e.altKey && e.key === 'PrintScreen') || // Alt+PrintScreen
          (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) // macOS screenshot shortcuts
      ) {
        e.preventDefault()
        logSecurityEvent('screenshot_attempt', { 
          key: e.key, 
          metaKey: e.metaKey, 
          ctrlKey: e.ctrlKey, 
          shiftKey: e.shiftKey, 
          altKey: e.altKey 
        })
        return false
      }

      // Developer tools shortcuts
      if ((e.ctrlKey && e.shiftKey && e.key === 'I') || // Ctrl+Shift+I
          (e.ctrlKey && e.shiftKey && e.key === 'J') || // Ctrl+Shift+J
          (e.ctrlKey && e.shiftKey && e.key === 'C') || // Ctrl+Shift+C
          (e.key === 'F12') || // F12
          (e.metaKey && e.altKey && e.key === 'I') || // Cmd+Option+I (macOS)
          (e.metaKey && e.altKey && e.key === 'J') || // Cmd+Option+J (macOS)
          (e.metaKey && e.altKey && e.key === 'C')    // Cmd+Option+C (macOS)
      ) {
        e.preventDefault()
        logSecurityEvent('devtools_attempt', { 
          key: e.key, 
          metaKey: e.metaKey, 
          ctrlKey: e.ctrlKey, 
          shiftKey: e.shiftKey, 
          altKey: e.altKey 
        })
        return false
      }
    }

    // Detect screen recording (experimental)
    const detectScreenRecording = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Monitor for screen capture API usage
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia
        navigator.mediaDevices.getDisplayMedia = function(...args) {
          logSecurityEvent('screen_recording', { method: 'getDisplayMedia' })
          return originalGetDisplayMedia.apply(this, args)
        }
      }
    }

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Monitor for visibility changes (potential screen recording)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent('tab_hidden')
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Apply CSS to prevent selection and screenshots
    const style = document.createElement('style')
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      body {
        -webkit-app-region: no-drag !important;
      }
      
      /* Prevent screenshot on mobile */
      @media screen {
        body {
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }
      }
    `
    document.head.appendChild(style)

    // Initialize screen recording detection
    detectScreenRecording()

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.head.removeChild(style)
    }
  }, [enabled, logSecurityEvent])

  // Additional mobile screenshot prevention
  useEffect(() => {
    if (!enabled) return

    // Prevent long press on mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
        logSecurityEvent('multi_touch_blocked')
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Prevent screenshot gesture on iOS (power + home/volume)
      if (e.timeStamp && e.touches.length === 0) {
        logSecurityEvent('touch_end_monitored')
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, logSecurityEvent])
}