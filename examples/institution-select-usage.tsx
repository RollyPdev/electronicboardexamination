import { useState } from 'react'
import { InstitutionSelect } from '@/components/ui/institution-select'

export function InstitutionSelectExample() {
  const [selectedInstitution, setSelectedInstitution] = useState('')

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Select Your Institution</h2>
      
      <InstitutionSelect
        value={selectedInstitution}
        onValueChange={setSelectedInstitution}
        placeholder="Search for your school..."
        className="mb-4"
      />
      
      {selectedInstitution && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Selected: <strong>{selectedInstitution}</strong>
          </p>
        </div>
      )}
    </div>
  )
}