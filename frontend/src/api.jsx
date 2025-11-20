import { fetchWithRetry } from "./utils/fetchWithRetry";

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://backend.kapalongagrichain.site'  // Production API domain
    : 'http://localhost:5000');  // Local development

// Helper function to build full API URLs
const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Legacy fetch functions (keeping for backward compatibility)
export const fetchMessage = async () => {
  return await fetchWithRetry(apiUrl('/api/hello'));
};

// API functions without caching
export const registerFarmer = async (farmerData) => {
  // Use extended timeout (45 seconds) and more retries (5) for farmer registration
  // Registration includes password hashing which can be slow on free tier servers
  return await fetchWithRetry(
    apiUrl('/api/farmers'), 
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farmerData),
    },
    5, // 5 retries
    45000, // 45 second timeout
    2000 // 2 second base backoff
  );
};

export const bulkImportFarmers = async (csvFile) => {
  const formData = new FormData();
  formData.append('csvFile', csvFile);
  
  return await fetchWithRetry(apiUrl('/api/farmers/import'), {
    method: 'POST',
    body: formData,
  }, 3, 60000); // 60 second timeout for bulk import
};

export const deleteFarmer = async (farmerId) => {
  // Use extended timeout (30 seconds) and more retries (5) for delete operations
  // Delete operations may need to clean up related data
  return await fetchWithRetry(
    apiUrl(`/api/farmers/${farmerId}`), 
    {
    method: 'DELETE',
    },
    5, // 5 retries
    30000, // 30 second timeout
    2000 // 2 second base backoff
  );
};

export const updateFarmer = async (farmerId, updateData) => {
  // Use extended timeout (60 seconds) and more retries (5) for password updates
  // Use extended timeout (45 seconds) for other updates on slow connections
  // Password hashing can be slow on free tier servers
  const timeout = updateData.password ? 60000 : 45000;
  const retries = updateData.password ? 5 : 5; // 5 retries for all updates
  return await fetchWithRetry(
    apiUrl(`/api/farmers/${farmerId}`), 
    {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
    }, 
    retries, 
    timeout,
    2000 // 2 second base backoff
  );
};

// Fetch farmers without caching
export const fetchFarmers = async () => {
  return await fetchWithRetry(apiUrl('/api/farmers'));
};

export const fetchActiveFarmers = async () => {
  return await fetchWithRetry(apiUrl('/api/farmers/active'));
};

export const loginFarmer = async (username, password) => {
  // Use extended timeout (45 seconds) and more retries (5) for login
  // This helps with low connection scenarios
  return await fetchWithRetry(
    apiUrl('/api/farmers/login'), 
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    },
    5, // 5 retries instead of 3
    45000, // 45 second timeout instead of 15
    2000 // 2 second base backoff instead of 1
  );
};

export const loginUser = async (username, password) => {
  // Use extended timeout (45 seconds) and more retries (5) for login
  // This helps with low connection scenarios
  return await fetchWithRetry(
    apiUrl('/api/users/login'), 
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    },
    5, // 5 retries instead of 3
    45000, // 45 second timeout instead of 15
    2000 // 2 second base backoff instead of 1
  );
};

export const getUserProfile = async (token) => {
  return await fetchWithRetry(apiUrl('/api/users/me'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Send notification to farmer
export const sendNotification = async (notificationData) => {
  return await fetchWithRetry(apiUrl('/api/notifications'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  }, 3, 15000);
};

export const updateUserProfile = async (userId, updateData, token) => {
  // Increase timeout to 120 seconds for password updates on free tier servers
  // Reduced bcrypt rounds to 6 for faster hashing, but still need buffer for slow servers
  // Use 15 seconds for other updates to maintain responsiveness
  const timeout = updateData.password ? 120000 : 15000;
  return await fetchWithRetry(apiUrl(`/api/users/${userId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  }, 3, timeout); // retries=3, timeout=90s for password updates, 15s for others
};

// Claim operations without caching
export const createClaim = async (claimData) => {
  try {
    const result = await fetchWithRetry(apiUrl('/api/claims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(claimData),
    }, 3, 30000);
    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw error;
  }
};

// Fetch claims without caching
export const fetchClaims = async (farmerId = null) => {
  let url = '/api/claims';
  if (farmerId) url += `?farmerId=${farmerId}`;
  
  return await fetchWithRetry(apiUrl(url));
};

export const updateClaim = async (id, updateData) => {
  return await fetchWithRetry(apiUrl(`/api/claims/${id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

// Assistance operations without caching
export const createAssistance = async (assistanceData) => {
  return await fetchWithRetry(apiUrl('/api/assistance'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assistanceData),
  });
};

export const fetchAssistances = async () => {
  return await fetchWithRetry(apiUrl('/api/assistance'));
};

// Seed Assistance Flow API functions without caching
export const applyForAssistance = async (applicationData) => {
  return await fetchWithRetry(apiUrl('/api/assistance/apply'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });
};

export const getFarmerApplications = async (farmerId) => {
  return await fetchWithRetry(apiUrl(`/api/assistance/applications/${farmerId}`));
};

export const getAllApplications = async () => {
  return await fetchWithRetry(apiUrl('/api/assistance/applications'));
};

export const updateApplicationStatus = async (applicationId, statusData) => {
  return await fetchWithRetry(apiUrl(`/api/assistance/applications/${applicationId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });
};

export const updateInventory = async (assistanceId, inventoryData) => {
  return await fetchWithRetry(apiUrl(`/api/assistance/${assistanceId}/inventory`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inventoryData),
  });
};

export const deleteAssistance = async (assistanceId) => {
  return await fetchWithRetry(apiUrl(`/api/assistance/${assistanceId}`), {
    method: 'DELETE',
  });
};

// Crop insurance operations without caching
export const createCropInsurance = async (cropInsuranceData) => {
  return await fetchWithRetry(apiUrl('/api/crop-insurance'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cropInsuranceData),
  });
};

export const fetchCropInsurance = async (farmerId = null) => {
  let url = '/api/crop-insurance';
  if (farmerId) url = `/api/crop-insurance/farmer/${farmerId}`;
  
  return await fetchWithRetry(apiUrl(url));
};

export const updateCropInsurance = async (id, updateData) => {
  return await fetchWithRetry(apiUrl(`/api/crop-insurance/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

export const deleteCropInsurance = async (id) => {
  return await fetchWithRetry(apiUrl(`/api/crop-insurance/${id}`), {
    method: 'DELETE',
  });
};

export const getCropInsuranceStats = async () => {
  return await fetchWithRetry(apiUrl('/api/crop-insurance/stats/overview'));
};

// Batch operations without caching
export const fetchDashboardData = async (farmerId = null) => {
  const requests = [
    fetchFarmers(),
    fetchAssistances()
  ];
  
  if (farmerId) {
    requests.push(
      fetchClaims(farmerId),
      fetchCropInsurance(farmerId),
      getFarmerApplications(farmerId)
    );
  } else {
    requests.push(
      fetchClaims(),
      fetchCropInsurance(),
      getAllApplications()
    );
  }
  
  const results = await Promise.allSettled(requests);
  return results.map((result) => ({
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null,
  }));
};

// Blockchain Claims Logs API Functions
export const getBlockchainClaims = async () => {
    const response = await fetch(apiUrl('/api/blockchain-claims'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const createBlockchainClaim = async (claimLogData) => {
    const response = await fetch(apiUrl('/api/blockchain-claims'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimLogData),
    });
    return response.json();
};

export const updateBlockchainClaim = async (id, claimLogData) => {
    const response = await fetch(apiUrl(`/api/blockchain-claims/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimLogData),
    });
    return response.json();
};

export const getBlockchainClaimsStats = async () => {
    const response = await fetch(apiUrl('/api/blockchain-claims/stats'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getBlockchainClaimsByFarmer = async (farmerName) => {
    const response = await fetch(apiUrl(`/api/blockchain-claims/farmer/${farmerName}`), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getBlockchainClaimsByStatus = async (status) => {
    const response = await fetch(apiUrl(`/api/blockchain-claims/status/${status}`), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

// Distribution Records API Functions (Real Blockchain)
export const getDistributionRecords = async () => {
    const response = await fetch(apiUrl('/api/distribution-records'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getDistributionRecordsByFarmer = async (farmerName) => {
    const response = await fetch(apiUrl(`/api/distribution-records/farmer/${farmerName}`), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getDistributionRecordsByStatus = async (status) => {
    const response = await fetch(apiUrl(`/api/distribution-records/status/${status}`), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const getDistributionRecordsStats = async () => {
    const response = await fetch(apiUrl('/api/distribution-records/stats'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.json();
};

export const logClaimToDistribution = async (claimData) => {
    const response = await fetch(apiUrl('/api/distribution-records/log'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
    });
    return response.json();
};

// Crop Prices API Functions
export const getCropPrices = async () => {
    return await fetchWithRetry(apiUrl('/api/crop-prices'));
};

export const getCropPrice = async (id) => {
    return await fetchWithRetry(apiUrl(`/api/crop-prices/${id}`));
};

export const createCropPrice = async (cropPriceData) => {
    return await fetchWithRetry(apiUrl('/api/crop-prices'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropPriceData),
    });
};

export const updateCropPrice = async (id, cropPriceData) => {
    return await fetchWithRetry(apiUrl(`/api/crop-prices/${id}`), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cropPriceData),
    });
};

export const deleteCropPrice = async (id) => {
    return await fetchWithRetry(apiUrl(`/api/crop-prices/${id}`), {
        method: 'DELETE',
    });
};

export const getCropPriceStats = async () => {
  return await fetchWithRetry(apiUrl('/api/crop-prices/stats/overview'));
};

// Profile Image API Functions
export const saveFarmerProfileImage = async (farmerId, profileImage) => {
  // Use extended timeout (60 seconds) and more retries (5) for profile image upload
  // Profile images can be large (base64 encoded), so they need more time on slow connections
  return await fetchWithRetry(
    apiUrl('/api/farmers/profile-image'), 
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ farmerId, profileImage }),
    },
    5, // 5 retries
    60000, // 60 second timeout for large image uploads
    2000 // 2 second base backoff
  );
};

export const getFarmerProfileImage = async (farmerId) => {
  return await fetchWithRetry(apiUrl(`/api/farmers/profile-image/${farmerId}`));
};

export const getAllFarmerProfileImages = async () => {
  return await fetchWithRetry(apiUrl('/api/farmers/profile-images'));
};

// Notification API functions
export const fetchNotifications = async (recipientType, recipientId = null) => {
  const endpoint = recipientType === 'admin' 
    ? '/api/notifications/admin'
    : `/api/notifications/farmer/${recipientId}`;
  return await fetchWithRetry(apiUrl(endpoint));
};

export const getUnreadNotificationCount = async (recipientType, recipientId = null) => {
  const endpoint = recipientType === 'admin'
    ? '/api/notifications/admin/count'
    : `/api/notifications/farmer/${recipientId}/count`;
  return await fetchWithRetry(apiUrl(endpoint));
};

export const markNotificationsAsRead = async (recipientType, recipientId = null, notificationIds = null) => {
  const endpoint = recipientType === 'admin'
    ? '/api/notifications/admin/read'
    : `/api/notifications/farmer/${recipientId}/read`;
  return await fetchWithRetry(apiUrl(endpoint), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notificationIds }),
  });
};

export const deleteNotification = async (notificationId) => {
  return await fetchWithRetry(apiUrl(`/api/notifications/${notificationId}`), {
    method: 'DELETE',
  });
};

export const clearNotifications = async (recipientType, recipientId = null) => {
  const endpoint = recipientType === 'admin'
    ? '/api/notifications/admin/clear'
    : `/api/notifications/farmer/${recipientId}/clear`;
  return await fetchWithRetry(apiUrl(endpoint), {
    method: 'DELETE',
  });
};

// Calendar Events API functions
export const getCalendarEvents = async (farmerId) => {
  return await fetchWithRetry(apiUrl(`/api/calendar-events/${farmerId}`));
};

export const createCalendarEvent = async (eventData) => {
  return await fetchWithRetry(apiUrl('/api/calendar-events'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
};

export const updateCalendarEvent = async (eventId, updateData) => {
  return await fetchWithRetry(apiUrl(`/api/calendar-events/${eventId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

export const deleteCalendarEvent = async (eventId) => {
  return await fetchWithRetry(apiUrl(`/api/calendar-events/${eventId}`), {
    method: 'DELETE',
  });
};

export const getCalendarEventsByRange = async (farmerId, startDate, endDate) => {
  return await fetchWithRetry(apiUrl(`/api/calendar-events/${farmerId}/range?startDate=${startDate}&endDate=${endDate}`));
};

// Removed preload function as caching is disabled
