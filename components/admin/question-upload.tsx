'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react'

interface QuestionUploadProps {
  examId: string
  onUploadComplete: () => void
}

export function QuestionUpload({ examId, onUploadComplete }: QuestionUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = ['.txt', '.docx']
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
      
      if (!validTypes.includes(fileExtension)) {
        setError('Please select a .txt or .docx file')
        return
      }
      
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('examId', examId)

      const response = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
      onUploadComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".txt,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload a .txt or .docx file with questions. Each question should include choices (A, B, C, D) and "Correct Answer: X"
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{file.name}</span>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload Questions'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully uploaded {result.questionsCount} questions!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}



