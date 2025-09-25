'use client'

import { LoginForm } from '@/components/auth/login-form'
import { AuthProvider } from '@/components/auth/auth-provider'

export default function Home() {
  return (
    <AuthProvider>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          {/* Left Side - Branding and Illustration */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="mb-6 lg:mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-2 lg:mb-4">
                e-BES
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-4 lg:mb-6">
                Electronic Board Examination System
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-500 max-w-md mx-auto lg:mx-0 px-4 lg:px-0">
                Secure, reliable, and comprehensive board examinations with advanced proctoring features.
              </p>
            </div>
            
            {/* SVG Illustration */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Background Circle */}
                  <circle cx="200" cy="200" r="180" fill="#e0f2fe" opacity="0.5"/>
                  
                  {/* Student Figure */}
                  <g transform="translate(150, 120)">
                    {/* Head */}
                    <circle cx="50" cy="40" r="25" fill="#fbbf24"/>
                    
                    {/* Body */}
                    <rect x="30" y="60" width="40" height="60" rx="20" fill="#3b82f6"/>
                    
                    {/* Arms */}
                    <rect x="10" y="70" width="15" height="30" rx="7" fill="#fbbf24"/>
                    <rect x="75" y="70" width="15" height="30" rx="7" fill="#fbbf24"/>
                    
                    {/* Legs */}
                    <rect x="35" y="115" width="12" height="40" rx="6" fill="#1e40af"/>
                    <rect x="53" y="115" width="12" height="40" rx="6" fill="#1e40af"/>
                  </g>
                  
                  {/* Book */}
                  <g transform="translate(280, 180)">
                    <rect x="0" y="0" width="60" height="80" rx="5" fill="#ef4444"/>
                    <rect x="5" y="5" width="50" height="70" rx="3" fill="#ffffff" opacity="0.9"/>
                    <line x1="10" y1="15" x2="45" y2="15" stroke="#374151" strokeWidth="2"/>
                    <line x1="10" y1="25" x2="45" y2="25" stroke="#374151" strokeWidth="2"/>
                    <line x1="10" y1="35" x2="35" y2="35" stroke="#374151" strokeWidth="2"/>
                  </g>
                  
                  {/* Computer/Tablet */}
                  <g transform="translate(120, 250)">
                    <rect x="0" y="0" width="80" height="60" rx="8" fill="#1f2937"/>
                    <rect x="5" y="5" width="70" height="45" rx="3" fill="#3b82f6"/>
                    <rect x="10" y="10" width="60" height="35" rx="2" fill="#ffffff"/>
                    
                    {/* Screen content */}
                    <rect x="15" y="15" width="20" height="3" fill="#3b82f6"/>
                    <rect x="15" y="22" width="30" height="3" fill="#6b7280"/>
                    <rect x="15" y="29" width="25" height="3" fill="#6b7280"/>
                    <rect x="15" y="36" width="35" height="3" fill="#6b7280"/>
                  </g>
                  
                  {/* Floating Elements */}
                  <circle cx="100" cy="100" r="8" fill="#10b981" opacity="0.7">
                    <animate attributeName="cy" values="100;90;100" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="320" cy="120" r="6" fill="#f59e0b" opacity="0.7">
                    <animate attributeName="cy" values="120;110;120" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="80" cy="300" r="10" fill="#8b5cf6" opacity="0.7">
                    <animate attributeName="cy" values="300;290;300" dur="3.5s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full max-w-md px-4 lg:px-0">
              <LoginForm />
              
              {/* Features */}
              <div className="mt-6 lg:mt-8 space-y-2 lg:space-y-3">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  Advanced Proctoring
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                  Real-time Monitoring
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                  Secure Exam Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthProvider>
  )
}