import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api.jsx'
import { SOCKET_QUERY_KEYS } from './useSocketQuery.js'

// Query Keys - centralized for consistency with Socket.IO integration
export const QUERY_KEYS = {
  FARMERS: SOCKET_QUERY_KEYS.FARMERS,
  CLAIMS: SOCKET_QUERY_KEYS.CLAIMS,
  FARMER_CLAIMS: (farmerId) => [SOCKET_QUERY_KEYS.CLAIMS, farmerId],
  ASSISTANCES: SOCKET_QUERY_KEYS.ASSISTANCE,
  FARMER_APPLICATIONS: (farmerId) => [SOCKET_QUERY_KEYS.APPLICATIONS, farmerId],
  ALL_APPLICATIONS: SOCKET_QUERY_KEYS.APPLICATIONS,
  CROP_INSURANCE: SOCKET_QUERY_KEYS.CROP_INSURANCE,
  FARMER_CROP_INSURANCE: (farmerId) => [SOCKET_QUERY_KEYS.CROP_INSURANCE, farmerId],
  CROP_INSURANCE_STATS: 'cropInsuranceStats',
  DASHBOARD_DATA: (farmerId) => ['dashboardData', farmerId],
  CROP_PRICES: 'cropPrices',
  CROP_PRICE: (id) => ['cropPrice', id],
  CROP_PRICE_STATS: 'cropPriceStats',
  NOTIFICATIONS: (recipientType, recipientId) => ['notifications', recipientType, recipientId],
  NOTIFICATION_COUNT: (recipientType, recipientId) => ['notificationCount', recipientType, recipientId],
}

// ============ FARMERS ============
export const useFarmers = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FARMERS],
    queryFn: api.fetchFarmers,
  })
}

export const useActiveFarmers = () => {
  return useQuery({
    queryKey: ['activeFarmers'],
    queryFn: api.fetchActiveFarmers,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
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

export const useUpdateFarmer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ farmerId, updateData }) => api.updateFarmer(farmerId, updateData),
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

const ADMIN_USERS_KEY = 'adminUsers'

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ username, password }) => api.createAdminUser(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] })
    },
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: [ADMIN_USERS_KEY],
    queryFn: api.fetchAdminUsers,
  })
}

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId) => api.deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] })
    },
  })
}

export const useSaveAdminProfileImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, file }) => api.saveAdminProfileImage(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_USERS_KEY] })
    },
  })
}

// ============ CLAIMS ============
export const useClaims = (farmerId = null) => {
  return useQuery({
    queryKey: farmerId ? QUERY_KEYS.FARMER_CLAIMS(farmerId) : [QUERY_KEYS.CLAIMS],
    queryFn: () => api.fetchClaims(farmerId),
    enabled: farmerId ? !!farmerId : true, // Only run farmer-specific query if farmerId exists
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
    enabled: farmerId ? !!farmerId : true, // Only run farmer-specific query if farmerId exists
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

// ============ CROP PRICES ============
export const useCropPrices = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CROP_PRICES],
    queryFn: api.getCropPrices,
  })
}

export const useCropPrice = (id) => {
  return useQuery({
    queryKey: QUERY_KEYS.CROP_PRICE(id),
    queryFn: () => api.getCropPrice(id),
    enabled: !!id,
  })
}

export const useCreateCropPrice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.createCropPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICE_STATS] })
    },
  })
}

export const useUpdateCropPrice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cropPriceData }) => api.updateCropPrice(id, cropPriceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICE_STATS] })
    },
  })
}

export const useDeleteCropPrice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCropPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CROP_PRICE_STATS] })
    },
  })
}

export const useCropPriceStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CROP_PRICE_STATS],
    queryFn: api.getCropPriceStats,
  })
}

// ============ NOTIFICATIONS ============
export const useNotifications = (recipientType, recipientId = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(recipientType, recipientId),
    queryFn: () => api.fetchNotifications(recipientType, recipientId),
    enabled: recipientType === 'admin' || (recipientType === 'farmer' && !!recipientId), // Only enable for farmer if recipientId exists
    refetchInterval: 7000, // Poll every 7 seconds
  })
}

export const useUnreadNotificationCount = (recipientType, recipientId = null) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATION_COUNT(recipientType, recipientId),
    queryFn: () => api.getUnreadNotificationCount(recipientType, recipientId),
    refetchInterval: 7000, // Poll every 7 seconds
  })
}

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipientType, recipientId, notificationIds }) => 
      api.markNotificationsAsRead(recipientType, recipientId, notificationIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.NOTIFICATIONS(variables.recipientType, variables.recipientId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.NOTIFICATION_COUNT(variables.recipientType, variables.recipientId) 
      })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ notificationId, recipientType, recipientId }) => 
      api.deleteNotification(notificationId).then(() => ({ recipientType, recipientId })),
    onSuccess: (_, variables) => {
      if (variables.recipientType) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.NOTIFICATIONS(variables.recipientType, variables.recipientId) 
        })
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.NOTIFICATION_COUNT(variables.recipientType, variables.recipientId) 
        })
      }
    },
  })
}

export const useClearNotifications = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ recipientType, recipientId }) => 
      api.clearNotifications(recipientType, recipientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.NOTIFICATIONS(variables.recipientType, variables.recipientId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.NOTIFICATION_COUNT(variables.recipientType, variables.recipientId) 
      })
    },
  })
}