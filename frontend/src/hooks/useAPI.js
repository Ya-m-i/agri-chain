import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api.jsx'

// Query Keys - centralized for consistency
export const QUERY_KEYS = {
  FARMERS: 'farmers',
  CLAIMS: 'claims',
  FARMER_CLAIMS: (farmerId) => ['claims', farmerId],
  ASSISTANCES: 'assistances',
  FARMER_APPLICATIONS: (farmerId) => ['applications', farmerId],
  ALL_APPLICATIONS: 'allApplications',
  CROP_INSURANCE: 'cropInsurance',
  FARMER_CROP_INSURANCE: (farmerId) => ['cropInsurance', farmerId],
  CROP_INSURANCE_STATS: 'cropInsuranceStats',
  DASHBOARD_DATA: (farmerId) => ['dashboardData', farmerId],
}

// ============ FARMERS ============
export const useFarmers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FARMERS],
    queryFn: api.fetchFarmers,
  })
}

export const useRegisterFarmer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.registerFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FARMERS] })
    },
  })
}

export const useDeleteFarmer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FARMERS] })
    },
  })
}

export const useLoginFarmer = () => {
  return useMutation({
    mutationFn: ({ username, password }) => api.loginFarmer(username, password),
  })
}

// ============ CLAIMS ============
export const useClaims = (farmerId = null) => {
  return useQuery({
    queryKey: farmerId ? QUERY_KEYS.FARMER_CLAIMS(farmerId) : [QUERY_KEYS.CLAIMS],
    queryFn: () => api.fetchClaims(farmerId),
  })
}

export const useCreateClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      queryClient.invalidateQueries({ queryKey: ['claims'] }) // Invalidate all claims
    },
  })
}

export const useUpdateClaim = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updateData }) => api.updateClaim(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLAIMS] })
      queryClient.invalidateQueries({ queryKey: ['claims'] }) // Invalidate all claims
    },
  })
}

// ============ ASSISTANCE ============
export const useAssistances = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSISTANCES],
    queryFn: api.fetchAssistances,
  })
}

export const useCreateAssistance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANCES] })
    },
  })
}

export const useDeleteAssistance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANCES] })
    },
  })
}

// ============ ASSISTANCE APPLICATIONS ============
export const useFarmerApplications = (farmerId) => {
  return useQuery({
    queryKey: QUERY_KEYS.FARMER_APPLICATIONS(farmerId),
    queryFn: () => api.getFarmerApplications(farmerId),
    enabled: !!farmerId, // Only run query if farmerId exists
  })
}

export const useAllApplications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ALL_APPLICATIONS],
    queryFn: api.getAllApplications,
  })
}

export const useApplyForAssistance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.applyForAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_APPLICATIONS] })
      queryClient.invalidateQueries({ queryKey: ['applications'] }) // Invalidate all applications
    },
  })
}

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, statusData }) => api.updateApplicationStatus(applicationId, statusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_APPLICATIONS] })
      queryClient.invalidateQueries({ queryKey: ['applications'] }) // Invalidate all applications
    },
  })
}

export const useUpdateInventory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assistanceId, inventoryData }) => api.updateInventory(assistanceId, inventoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSISTANCES] })
    },
  })
}

// ============ CROP INSURANCE ============
export const useCropInsurance = (farmerId = null) => {
  return useQuery({
    queryKey: farmerId ? QUERY_KEYS.FARMER_CROP_INSURANCE(farmerId) : [QUERY_KEYS.CROP_INSURANCE],
    queryFn: () => api.fetchCropInsurance(farmerId),
  })
}

export const useCreateCropInsurance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCropInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_INSURANCE] })
      queryClient.invalidateQueries({ queryKey: ['cropInsurance'] }) // Invalidate all crop insurance
    },
  })
}

export const useUpdateCropInsurance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updateData }) => api.updateCropInsurance(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_INSURANCE] })
      queryClient.invalidateQueries({ queryKey: ['cropInsurance'] }) // Invalidate all crop insurance
    },
  })
}

export const useDeleteCropInsurance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCropInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_INSURANCE] })
      queryClient.invalidateQueries({ queryKey: ['cropInsurance'] }) // Invalidate all crop insurance
    },
  })
}

export const useCropInsuranceStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CROP_INSURANCE_STATS],
    queryFn: api.getCropInsuranceStats,
  })
}

// ============ DASHBOARD DATA ============
export const useDashboardData = (farmerId = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_DATA(farmerId),
    queryFn: () => api.fetchDashboardData(farmerId),
  })
}