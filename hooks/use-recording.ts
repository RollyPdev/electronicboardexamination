import { useState, useCallback, useRef } from 'react'

interface RecordingState {
  isRecording: boolean
  isInitializing: boolean
  error: string | null
  cameraPermission: 'granted' | 'denied' | 'prompt'
  stats: {
    chunksUploaded: number
    totalSize: number
    duration: number
  }
}

interface UseRecordingOptions {
  examResultId: string
  token: string
  onError?: (error: string) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  chunkDuration?: number // in milliseconds
}

export function useRecording({
  examResultId,
  token,
  onError,
  onRecordingStart,
  onRecordingStop,
  chunkDuration = 5000
}: UseRecordingOptions) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isInitializing: false,
    error: null,
    cameraPermission: 'prompt',
    stats: {
      chunksUploaded: 0,
      totalSize: 0,
      duration: 0
    }
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunkIndexRef = useRef(0)
  const startTimeRef = useRef<Date | null>(null)

  const updateState = useCallback((updates: Partial<RecordingState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const uploadChunk = async (blob: Blob, chunkIndex: number) => {
    try {
      const formData = new FormData()
      formData.append('examResultId', examResultId)
      formData.append('chunkIndex', chunkIndex.toString())
      formData.append('token', token)
      formData.append('chunk', blob, `chunk_${chunkIndex}.webm`)

      const response = await fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const result = await response.json()
      
      // Update stats
      updateState({
        stats: {
          ...state.stats,
          chunksUploaded: state.stats.chunksUploaded + 1,
          totalSize: state.stats.totalSize + result.size
        }
      })

      return result
    } catch (error) {
      console.error('Chunk upload failed:', error)
      throw error
    }
  }

  const initializeCamera = async () => {
    try {
      updateState({ isInitializing: true, error: null })

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      streamRef.current = stream
      updateState({ cameraPermission: 'granted' })

      return stream
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access to continue with the exam.'
        : err.message || 'Failed to initialize camera'
      
      updateState({ 
        error: errorMsg, 
        cameraPermission: 'denied' 
      })
      onError?.(errorMsg)
      throw err
    } finally {
      updateState({ isInitializing: false })
    }
  }

  const startRecording = async () => {
    try {
      const stream = streamRef.current || await initializeCamera()

      if (!MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
        throw new Error('Video recording is not supported in this browser')
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8',
        videoBitsPerSecond: 1000000
      })

      mediaRecorderRef.current = mediaRecorder
      chunkIndexRef.current = 0
      startTimeRef.current = new Date()

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          try {
            await uploadChunk(event.data, chunkIndexRef.current++)
          } catch (error) {
            console.error('Failed to upload chunk:', error)
            // Continue recording even if upload fails
          }
        }
      }

      mediaRecorder.onerror = (event: any) => {
        const errorMsg = 'Recording error occurred'
        updateState({ error: errorMsg })
        onError?.(errorMsg)
      }

      mediaRecorder.start(chunkDuration)
      updateState({ isRecording: true, error: null })
      onRecordingStart?.()

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start recording'
      updateState({ error: errorMsg })
      onError?.(errorMsg)
      throw err
    }
  }

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      updateState({ isRecording: false })

      // Signal recording completion
      await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examResultId,
          token,
          totalChunks: chunkIndexRef.current,
        }),
      })

      onRecordingStop?.()
    } catch (error) {
      console.error('Failed to stop recording properly:', error)
    }
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunkIndexRef.current = 0
    startTimeRef.current = null
  }

  return {
    ...state,
    initializeCamera,
    startRecording,
    stopRecording,
    cleanup,
    stream: streamRef.current
  }
}