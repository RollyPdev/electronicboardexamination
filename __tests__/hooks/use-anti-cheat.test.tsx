import { renderHook, act } from '@testing-library/react'
import { useAntiCheat } from '@/hooks/use-anti-cheat'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

describe('useAntiCheat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize correctly', () => {
    const { result } = renderHook(() => 
      useAntiCheat({ 
        examId: 'exam-123', 
        token: 'token-456',
        enabled: true 
      })
    )

    expect(result.current.logEvent).toBeDefined()
  })

  it('should log copy attempts', () => {
    const mockLogEvent = vi.fn()
    const { result } = renderHook(() => 
      useAntiCheat({ 
        examId: 'exam-123', 
        token: 'token-456',
        enabled: true,
        onEvent: mockLogEvent
      })
    )

    // Simulate copy event
    act(() => {
      const event = new ClipboardEvent('copy', { 
        bubbles: true,
        cancelable: true 
      })
      document.dispatchEvent(event)
    })

    expect(mockLogEvent).toHaveBeenCalled()
    const call = mockLogEvent.mock.calls[0][0]
    expect(call.type).toBe('COPY_ATTEMPT')
  })

  it('should log paste attempts', () => {
    const mockLogEvent = vi.fn()
    const { result } = renderHook(() => 
      useAntiCheat({ 
        examId: 'exam-123', 
        token: 'token-456',
        enabled: true,
        onEvent: mockLogEvent
      })
    )

    // Simulate paste event
    act(() => {
      const event = new ClipboardEvent('paste', { 
        bubbles: true,
        cancelable: true 
      })
      document.dispatchEvent(event)
    })

    expect(mockLogEvent).toHaveBeenCalled()
    const call = mockLogEvent.mock.calls[0][0]
    expect(call.type).toBe('PASTE_ATTEMPT')
  })

  it('should log tab switching', () => {
    const mockLogEvent = vi.fn()
    const { result } = renderHook(() => 
      useAntiCheat({ 
        examId: 'exam-123', 
        token: 'token-456',
        enabled: true,
        onEvent: mockLogEvent
      })
    )

    // Simulate visibility change (tab switch)
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true })
      const event = new Event('visibilitychange')
      document.dispatchEvent(event)
    })

    expect(mockLogEvent).toHaveBeenCalled()
    const call = mockLogEvent.mock.calls[0][0]
    expect(call.type).toBe('TAB_SWITCH')
  })

  it('should not log events when disabled', () => {
    const mockLogEvent = vi.fn()
    const { result } = renderHook(() => 
      useAntiCheat({ 
        examId: 'exam-123', 
        token: 'token-456',
        enabled: false,
        onEvent: mockLogEvent
      })
    )

    // Simulate copy event
    act(() => {
      const event = new ClipboardEvent('copy', { 
        bubbles: true,
        cancelable: true 
      })
      document.dispatchEvent(event)
    })

    expect(mockLogEvent).not.toHaveBeenCalled()
  })
})