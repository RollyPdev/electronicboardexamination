'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Save, Shield, Camera, Clock, Upload, Image, Palette } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SystemSettings {
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  enableProctoring: boolean
  maxExamDuration: number
  autoGrading: boolean
  showResultsImmediately: boolean
  logo?: string
  favicon?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Coeus Online Exams',
    siteDescription: 'Electronic Board Examination System',
    allowRegistration: true,
    requireEmailVerification: false,
    enableProctoring: true,
    maxExamDuration: 180,
    autoGrading: true,
    showResultsImmediately: false,
    logo: '',
    favicon: '',
  })
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          siteName: data.siteName,
          siteDescription: data.siteDescription,
          allowRegistration: data.allowRegistration,
          requireEmailVerification: data.requireEmailVerification,
          enableProctoring: data.enableProctoring,
          maxExamDuration: data.maxExamDuration,
          autoGrading: data.autoGrading,
          showResultsImmediately: data.showResultsImmediately,
          logo: data.logo || '',
          favicon: data.favicon || '',
        })
      } else {
        setError('Failed to load settings')
      }
    } catch (error) {
      setError('An error occurred while loading settings')
    } finally {
      setIsLoadingSettings(false)
    }
  }

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/admin/upload-branding', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        updateSetting(type, data.url)
        setMessage(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(`Failed to upload ${type}`)
      }
    } catch (error) {
      setError(`Error uploading ${type}`)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      setError('An error occurred while saving settings')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingSettings) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
              <div className="h-5 bg-slate-200 rounded w-96"></div>
            </div>
            <div className="w-16 h-16 bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-lg animate-pulse">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                  <div className="h-6 bg-slate-200 rounded w-48"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-80"></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-12 bg-slate-200 rounded w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                    <div className="h-20 bg-slate-200 rounded w-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-slate-200 rounded w-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
            <p className="text-slate-600 text-lg">
              Configure system-wide settings, branding, and preferences
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl">
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Branding Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Palette className="h-6 w-6 text-white" />
            </div>
            Branding & Identity
          </CardTitle>
          <CardDescription className="text-slate-600">
            Customize your platform's visual identity and branding elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName" className="text-sm font-semibold text-slate-900">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="text-sm font-semibold text-slate-900">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSetting('siteDescription', e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900">Logo</Label>
                <div className="flex items-center gap-4">
                  {settings.logo && (
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'logo')
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900">Favicon</Label>
                <div className="flex items-center gap-4">
                  {settings.favicon && (
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={settings.favicon} alt="Favicon" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'favicon')
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => faviconInputRef.current?.click()}
                      className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                    >
                      <Image className="mr-2 h-4 w-4" />
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            User Management
          </CardTitle>
          <CardDescription className="text-slate-600">
            Control user registration and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRegistration">Allow User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              id="allowRegistration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => updateSetting('allowRegistration', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing exams
              </p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exam Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            Exam Configuration
          </CardTitle>
          <CardDescription className="text-slate-600">
            Configure default exam behavior and system limitations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxExamDuration" className="text-sm font-semibold text-slate-900">Maximum Exam Duration (minutes)</Label>
            <Input
              id="maxExamDuration"
              type="number"
              min="30"
              max="600"
              value={settings.maxExamDuration}
              onChange={(e) => updateSetting('maxExamDuration', parseInt(e.target.value) || 180)}
              className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
            <p className="text-sm text-slate-600">
              Maximum allowed duration for any exam (30-600 minutes)
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoGrading">Enable Auto-Grading</Label>
              <p className="text-sm text-muted-foreground">
                Automatically grade objective questions
              </p>
            </div>
            <Switch
              id="autoGrading"
              checked={settings.autoGrading}
              onCheckedChange={(checked) => updateSetting('autoGrading', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showResultsImmediately">Show Results Immediately</Label>
              <p className="text-sm text-muted-foreground">
                Display results to students right after submission
              </p>
            </div>
            <Switch
              id="showResultsImmediately"
              checked={settings.showResultsImmediately}
              onCheckedChange={(checked) => updateSetting('showResultsImmediately', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Proctoring Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <Camera className="h-6 w-6 text-white" />
            </div>
            Proctoring & Security
          </CardTitle>
          <CardDescription className="text-slate-600">
            Configure exam monitoring and security features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableProctoring">Enable Camera Proctoring</Label>
              <p className="text-sm text-muted-foreground">
                Record students during exams for review
              </p>
            </div>
            <Switch
              id="enableProctoring"
              checked={settings.enableProctoring}
              onCheckedChange={(checked) => updateSetting('enableProctoring', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-slate-900">Save Changes</h3>
            <p className="text-sm text-slate-600">Apply all configuration changes to the system</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}