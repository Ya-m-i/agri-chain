// Example React Query Usage in AGRI-CHAIN
// This file demonstrates how to use the new React Query hooks

import React from 'react'
import { 
  useFarmers, 
  useClaims, 
  useAssistances, 
  useCreateClaim, 
  useApplyForAssistance 
} from '../hooks/useAPI'

const ReactQueryExample = () => {
  // ============ QUERIES (GET data) ============
  
  // Fetch all farmers
  const { data: farmers, isLoading: farmersLoading, error: farmersError } = useFarmers()
  
  // Fetch claims for a specific farmer
  const farmerId = "some-farmer-id"
  const { data: claims, isLoading: claimsLoading } = useClaims(farmerId)
  
  // Fetch all available assistance programs
  const { data: assistancePrograms, isLoading: assistanceLoading } = useAssistances()
  
  // ============ MUTATIONS (POST/PUT/DELETE data) ============
  
  // Create a new claim
  const createClaimMutation = useCreateClaim()
  
  // Apply for assistance
  const applyAssistanceMutation = useApplyForAssistance()
  
  // ============ HANDLERS ============
  
  const handleCreateClaim = async () => {
    try {
      const newClaim = await createClaimMutation.mutateAsync({
        farmerId: "farmer-123",
        crop: "Rice",
        damageType: "Flood",
        areaDamaged: 2.5,
        degreeOfDamage: 75
      })
      console.log('Claim created:', newClaim)
    } catch (error) {
      console.error('Failed to create claim:', error)
    }
  }
  
  const handleApplyAssistance = async () => {
    try {
      await applyAssistanceMutation.mutateAsync({
        farmerId: "farmer-123",
        assistanceId: "assistance-456",
        requestedQuantity: 50
      })
      console.log('Applied for assistance successfully!')
    } catch (error) {
      console.error('Failed to apply for assistance:', error)
    }
  }
  
  // ============ RENDER ============
  
  if (farmersLoading || claimsLoading || assistanceLoading) {
    return <div>Loading...</div>
  }
  
  if (farmersError) {
    return <div>Error loading farmers: {farmersError.message}</div>
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">React Query Example</h1>
      
      {/* Display Farmers */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Farmers ({farmers?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers?.map(farmer => (
            <div key={farmer._id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{farmer.name}</h3>
              <p className="text-sm text-gray-600">{farmer.cropType}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Display Claims */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Claims ({claims?.length || 0})</h2>
        <div className="space-y-2">
          {claims?.map(claim => (
            <div key={claim._id} className="p-3 border rounded">
              <span className="font-medium">{claim.crop}</span> - 
              <span className="ml-2 text-sm">{claim.status}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Display Assistance Programs */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Assistance Programs ({assistancePrograms?.length || 0})</h2>
        <div className="space-y-2">
          {assistancePrograms?.map(program => (
            <div key={program._id} className="p-3 border rounded">
              <span className="font-medium">{program.assistanceType}</span> - 
              <span className="ml-2 text-sm">{program.cropType}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-x-4">
        <button
          onClick={handleCreateClaim}
          disabled={createClaimMutation.isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {createClaimMutation.isPending ? 'Creating...' : 'Create Claim'}
        </button>
        
        <button
          onClick={handleApplyAssistance}
          disabled={applyAssistanceMutation.isPending}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {applyAssistanceMutation.isPending ? 'Applying...' : 'Apply for Assistance'}
        </button>
      </div>
      
      {/* Mutation Status */}
      {createClaimMutation.isError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error creating claim: {createClaimMutation.error?.message}
        </div>
      )}
      
      {createClaimMutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Claim created successfully!
        </div>
      )}
    </div>
  )
}

export default ReactQueryExample