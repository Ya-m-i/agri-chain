import { fetchWithRetry } from "./utils/fetchWithRetry";

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to build full API URLs
const apiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Legacy fetch functions (keeping for backward compatibility)
export const fetchMessage = async () => {
  return await fetchWithRetry(apiUrl('/api/hello'));
};

// API functions without caching
export const registerFarmer = async (farmerData) => {
  return await fetchWithRetry(apiUrl('/api/farmers'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farmerData),
  });
};

export const deleteFarmer = async (farmerId) => {
  return await fetchWithRetry(apiUrl(`/api/farmers/${farmerId}`), {
    method: 'DELETE',
  });
};

// Fetch farmers without caching
export const fetchFarmers = async () => {
  return await fetchWithRetry(apiUrl('/api/farmers'));
};

export const loginFarmer = async (username, password) => {
  return await fetchWithRetry(apiUrl('/api/farmers/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
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

// Removed preload function as caching is disabled
