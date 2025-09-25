import { POST as uploadChunk } from '@/app/api/upload/chunk/route'
import { NextRequest } from 'next/server'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    recording: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

// Mock file system operations
const mockWriteFile = vi.fn()
const mockMkdir = vi.fn()

vi.mock('fs/promises', () => ({
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
}))

vi.mock('path', () => ({
  join: vi.fn().mockImplementation((...args) => args.join('/')),
  resolve: vi.fn().mockImplementation((...args) => args.join('/')),
}))

describe('Upload Chunk API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject requests without required fields', async () => {
    const req = new NextRequest('http://localhost/api/upload/chunk', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await uploadChunk(req)
    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('should reject invalid tokens', async () => {
    const req = new NextRequest('http://localhost/api/upload/chunk', {
      method: 'POST',
      body: JSON.stringify({
        examResultId: 'result-123',
        token: 'invalid-token',
        chunkIndex: 0,
      }),
    })

    const response = await uploadChunk(req)
    expect(response.status).toBe(401)
    
    const data = await response.json()
    expect(data.error).toBe('Invalid token')
  })

  it('should reject when recording is not found', async () => {
    // Mock token verification
    vi.mock('@/lib/exam-utils', () => ({
      verifyExamToken: vi.fn().mockReturnValue({
        examResultId: 'result-123',
        userId: 'user-456',
        timestamp: Date.now(),
      }),
    }))

    ;(prisma.recording.findUnique as vi.Mock).mockResolvedValue(null)

    const formData = new FormData()
    formData.append('examResultId', 'result-123')
    formData.append('token', 'valid-token')
    formData.append('chunkIndex', '0')
    formData.append('chunk', new Blob(['test'], { type: 'video/webm' }))

    const req = new NextRequest('http://localhost/api/upload/chunk', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadChunk(req)
    expect(response.status).toBe(404)
    
    const data = await response.json()
    expect(data.error).toBe('Recording session not found')
  })

  it('should successfully upload a chunk', async () => {
    // Mock token verification
    vi.mock('@/lib/exam-utils', () => ({
      verifyExamToken: vi.fn().mockReturnValue({
        examResultId: 'result-123',
        userId: 'user-456',
        timestamp: Date.now(),
      }),
    }))

    ;(prisma.recording.findUnique as vi.Mock).mockResolvedValue({
      id: 'recording-123',
      examResultId: 'result-123',
      status: 'ACTIVE',
    })

    ;(prisma.recording.update as vi.Mock).mockResolvedValue({
      id: 'recording-123',
    })

    mockMkdir.mockResolvedValue(undefined)
    mockWriteFile.mockResolvedValue(undefined)

    const formData = new FormData()
    formData.append('examResultId', 'result-123')
    formData.append('token', 'valid-token')
    formData.append('chunkIndex', '0')
    formData.append('chunk', new Blob(['test video data'], { type: 'video/webm' }))

    const req = new NextRequest('http://localhost/api/upload/chunk', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadChunk(req)
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Chunk uploaded successfully')
  })
})