'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  CameraOff, 
  AlertTriangle, 
  Wifi, 
  WifiOff,
  Circle,
  Square,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface CameraRecorderProps {
  examResultId: string
  token: string
  onRecordingStart?: () => void
  onRecordingStop?: () => void
  onError?: (error: string) => void
  autoStart?: boolean
}

export function CameraRecorder({
  examResultId,
  token,
  onRecordingStart,
  onRecordingStop,
  onError,
  autoStart = true
}: CameraRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'uploading'>('disconnected')
  const [recordingStats, setRecordingStats] = useState({
    chunksUploaded: 0,
    totalSize: 0,
    duration: 0
  })
  const [isMinimized, setIsMinimized] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunkIndexRef = useRef(0)
  const startTimeRef = useRef<Date | null>(null)

  // Initialize camera on component mount
  useEffect(() => {
    if (autoStart) {
      initializeCamera()
    }
    
    return () => {
      stopRecording()
      cleanup()
    }
  }, [autoStart])

  // Update recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording && startTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!.getTime()) / 1000)
        setRecordingStats(prev => ({ ...prev, duration: elapsed }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const initializeCamera = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true // Include audio for better proctoring
      })

      streamRef.current = stream
      setCameraPermission('granted')

      // Display video preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Start recording automatically
      await startRecording(stream)
      
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access to continue with the exam.'
        : err.message || 'Failed to initialize camera'
      
      setError(errorMsg)
      setCameraPermission('denied')
      onError?.(errorMsg)
    } finally {
      setIsInitializing(false)
    }
  }

  const startRecording = async (stream: MediaStream) => {
    try {
      if (!MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
        throw new Error('Video recording is not supported in this browser')
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8',
        videoBitsPerSecond: 1000000 // 1 Mbps for good quality
      })

      mediaRecorderRef.current = mediaRecorder
      chunkIndexRef.current = 0
      startTimeRef.current = new Date()

      // Handle data availability (chunk ready)
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          await uploadChunk(event.data, chunkIndexRef.current++)
        }
      }

      // Handle recording errors
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error)
        setError('Recording error occurred')
        onError?.('Recording error occurred')
      }

      // Start recording with 5-second chunks
      mediaRecorder.start(5000)
      setIsRecording(true)
      setConnectionStatus('connected')
      onRecordingStart?.()

    } catch (err: any) {
      const errorMsg = err.message || 'Failed to start recording'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const uploadChunk = async (blob: Blob, chunkIndex: number) => {
    try {
      setConnectionStatus('uploading')
      
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
      setRecordingStats(prev => ({
        ...prev,
        chunksUploaded: prev.chunksUploaded + 1,
        totalSize: prev.totalSize + result.size
      }))

      setConnectionStatus('connected')
      
    } catch (err: any) {
      console.error('Chunk upload failed:', err)
      setConnectionStatus('disconnected')
      // Don't show error to user for individual chunk failures - continue recording
    }
  }

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)
    setConnectionStatus('disconnected')
    
    // Signal recording completion
    try {
      await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examResultId,
          token,
          totalChunks: chunkIndexRef.current,
        }),
      })
    } catch (err) {
      console.error('Failed to signal recording completion:', err)
    }

    onRecordingStop?.()
  }, [examResultId, token, onRecordingStop])

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isMinimized) {
    return (
      <Card className="w-16 h-16 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsMinimized(false)}>
        <CardContent className="p-2 h-full flex items-center justify-center relative">
          <Camera className="h-6 w-6 text-muted-foreground" />
          {isRecording && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          )}
          <div className="absolute -bottom-1 -right-1">
            {connectionStatus === 'connected' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            {connectionStatus === 'uploading' && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
            {connectionStatus === 'disconnected' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-72 shadow-lg">
      <CardHeader className="pb-2 px-3 py-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Camera className="h-4 w-4" />
            Proctoring
          </span>
          <div className="flex items-center gap-1">
            {connectionStatus === 'connected' && (
              <Badge variant="default" className="text-xs px-1 py-0">
                <Wifi className="h-2 w-2 mr-1" />
                Live
              </Badge>
            )}
            {connectionStatus === 'uploading' && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                <Wifi className="h-2 w-2 mr-1" />
                Upload
              </Badge>
            )}
            {connectionStatus === 'disconnected' && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                <WifiOff className="h-2 w-2 mr-1" />
                Off
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2 px-3 pb-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Video Preview */}
        <div className="relative bg-gray-100 rounded overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-20 object-cover"
          />
          
          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-1 left-1 flex items-center gap-1 bg-red-600 text-white px-1 py-0.5 rounded-full text-xs">
              <Circle className="h-1.5 w-1.5 fill-current animate-pulse" />
              REC
            </div>
          )}

          {/* Camera Off Overlay */}
          {(cameraPermission === 'denied' || error) && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff className="h-6 w-6 mx-auto mb-1" />
                <p className="text-xs">Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Recording Stats */}
        {isRecording && (
          <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
            <div className="text-center">
              <div className="font-medium text-xs">{formatDuration(recordingStats.duration)}</div>
              <div className="text-xs">Time</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-xs">{recordingStats.chunksUploaded}</div>
              <div className="text-xs">Chunks</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-xs">{formatFileSize(recordingStats.totalSize)}</div>
              <div className="text-xs">Size</div>
            </div>
          </div>
        )}

        {/* Controls */}
        {cameraPermission === 'denied' && (
          <Button
            onClick={initializeCamera}
            disabled={isInitializing}
            className="w-full"
            size="sm"
          >
            {isInitializing ? (
              <>
                <div className="mr-1 h-3 w-3 animate-spin rounded-full border border-background border-t-transparent" />
                Starting...
              </>
            ) : (
              <>
                <Camera className="mr-1 h-3 w-3" />
                Enable
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}