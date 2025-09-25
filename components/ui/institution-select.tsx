'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, GraduationCap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Institution {
  region: string
  name: string
  type: string
}

function getIconColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500'
  ]
  const index = name.length % colors.length
  return colors[index]
}

interface InstitutionSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function InstitutionSelect({ value, onValueChange, placeholder = "Select institution", className }: InstitutionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/institutions')
        const data = await response.json()
        setInstitutions(data)
      } catch (error) {
        console.error('Error fetching institutions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInstitutions()
  }, [])

  useEffect(() => {
    if (search) {
      setSearching(true)
      const timer = setTimeout(() => {
        const filtered = institutions.filter(inst => 
          inst.name.toLowerCase().includes(search.toLowerCase())
        )
        setFilteredInstitutions(filtered.slice(0, 50))
        setSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setFilteredInstitutions(institutions.slice(0, 50))
      setSearching(false)
    }
  }, [search, institutions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (institution: Institution) => {
    onValueChange(institution.name)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {value ? (
            <div className={cn("w-6 h-6 rounded flex items-center justify-center", getIconColor(value))}>
              <GraduationCap className="h-3 w-3 text-white" />
            </div>
          ) : (
            <GraduationCap className="h-4 w-4 text-gray-400" />
          )}
          <span className={cn("truncate", !value && "text-gray-500")}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              {searching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <input
                ref={searchRef}
                type="text"
                placeholder="Search institutions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-500">Loading institutions...</span>
              </div>
            ) : searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-500">Searching...</span>
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                {search ? 'No institutions found' : 'No institutions available'}
              </div>
            ) : (
              filteredInstitutions.map((institution, index) => (
                <button
                  key={`${institution.region}-${institution.name}-${index}`}
                  type="button"
                  onClick={() => handleSelect(institution)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded flex items-center justify-center flex-shrink-0", getIconColor(institution.name))}>
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {institution.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {institution.type} • {institution.region}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}