'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditExamPage() {
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    // Redirect to the exam details page which has edit functionality
    router.replace(`/admin/exams/${params.id}`)
  }, [router, params.id])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Redirecting to exam editor...</p>
      </div>
    </div>
  )
}