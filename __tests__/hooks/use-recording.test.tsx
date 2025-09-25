import { renderHook, act } from '@testing-library/react'
import { useRecording } from '@/hooks/use-recording'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock MediaRecorder and related APIs
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  requestData: vi.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
  onerror: null,
}

const mockMediaStream = {
  getVideoTracks: vi.fn().mockReturnValue([]),
  getAudioTracks: vi.fn().mockReturnValue([]),
}

global.MediaRecorder = vi.fn(() => mockMediaRecorder) as any
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue(mockMediaStream),
} as any

describe('useRecording Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMediaRecorder.start.mockClear()
    mockMediaRecorder.stop.mockClear()
    mockMediaRecorder.requestData.mockClear()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => 
      useRecording({ 
        examResultId: 'result-123', 
        token: 'token-456' 
      })
    )

    expect(result.current.isRecording).toBe(false)
    expect(result.current.recordingStatus).toBe('idle')
    expect(result.current.recordingTime).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('should start recording successfully', async () => {
    const { result } = renderHook(() => 
      useRecording({ 
        examResultId: 'result-123', 
        token: 'token-456' 
      })
    )

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(true)
    expect(result.current.recordingStatus).toBe('recording')
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(5000) // 5 second chunks
  })

  it('should handle recording errors', async () => {
    const errorMessage = 'Camera access denied'
    ;(global.navigator.mediaDevices.getUserMedia as vi.Mock).mockRejectedValue(
      new Error(errorMessage)
    )

    const { result } = renderHook(() => 
      useRecording({ 
        examResultId: 'result-123', 
        token: 'token-456' 
      })
    )

    await act(async () => {
      await result.current.startRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.recordingStatus).toBe('error')
    expect(result.current.error).toBe(errorMessage)
  })

  it('should stop recording', async () => {
    const { result } = renderHook(() => 
      useRecording({ 
        examResultId: 'result-123', 
        token: 'token-456' 
      })
    )

    // Start recording first
    await act(async () => {
      await result.current.startRecording()
    })

    // Then stop it
    await act(async () => {
      await result.current.stopRecording()
    })

    expect(result.current.isRecording).toBe(false)
    expect(result.current.recordingStatus).toBe('stopped')
    expect(mockMediaRecorder.stop).toHaveBeenCalled()
  })

  it('should upload chunks when data is available', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    global.fetch = mockFetch

    const { result } = renderHook(() => 
      useRecording({ 
        examResultId: 'result-123', 
        token: 'token-456' 
      })
    )

    // Start recording
    await act(async () => {
      await result.current.startRecording()
    })

    // Simulate data available event
    const blob = new Blob(['test video data'], { type: 'video/webm' })
    const event = new BlobEvent('dataavailable', { data: blob })
    
    await act(async () => {
      mockMediaRecorder.ondataavailable?.(event as any)
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/upload/chunk',
      expect.objectContaining({
        method: 'POST',
      })
    )
  })
})