import { fetchWithRetry } from "./utils/fetchWithRetry";

// Legacy fetch functions (keeping for backward compatibility)
export const fetchMessage = async () => {
  return await fetchWithRetry('/api/hello');
};

// API functions without caching
export const registerFarmer = async (farmerData) => {
  return await fetchWithRetry('/api/farmers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(farmerData),
  });
};

export const deleteFarmer = async (farmerId) => {
  return await fetchWithRetry(`/api/farmers/${farmerId}`, {
    method: 'DELETE',
  });
};

// Fetch farmers without caching
export const fetchFarmers = async () => {
  return await fetchWithRetry('/api/farmers');
};

export const loginFarmer = async (username, password) => {
  return await fetchWithRetry('/api/farmers/login', {
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
    const result = await fetchWithRetry('/api/claims', {
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
  
  return await fetchWithRetry(url);
};

export const updateClaim = async (id, updateData) => {
  return await fetchWithRetry(`/api/claims/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

// Assistance operations without caching
export const createAssistance = async (assistanceData) => {
  return await fetchWithRetry('/api/assistance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assistanceData),
  });
};

export const fetchAssistances = async () => {
  return await fetchWithRetry('/api/assistance');
};

// Seed Assistance Flow API functions without caching
export const applyForAssistance = async (applicationData) => {
  return await fetchWithRetry('/api/assistance/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(applicationData),
  });
};

export const getFarmerApplications = async (farmerId) => {
  return await fetchWithRetry(`/api/assistance/applications/${farmerId}`);
};

export const getAllApplications = async () => {
  return await fetchWithRetry('/api/assistance/applications');
};

export const updateApplicationStatus = async (applicationId, statusData) => {
  return await fetchWithRetry(`/api/assistance/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });
};

export const updateInventory = async (assistanceId, inventoryData) => {
  return await fetchWithRetry(`/api/assistance/${assistanceId}/inventory`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inventoryData),
  });
};

export const deleteAssistance = async (assistanceId) => {
  return await fetchWithRetry(`/api/assistance/${assistanceId}`, {
    method: 'DELETE',
  });
};

// Crop insurance operations without caching
export const createCropInsurance = async (cropInsuranceData) => {
  return await fetchWithRetry('/api/crop-insurance', {
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
  
  return await fetchWithRetry(url);
};

export const updateCropInsurance = async (id, updateData) => {
  return await fetchWithRetry(`/api/crop-insurance/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

export const deleteCropInsurance = async (id) => {
  return await fetchWithRetry(`/api/crop-insurance/${id}`, {
    method: 'DELETE',
  });
};

export const getCropInsuranceStats = async () => {
  return await fetchWithRetry('/api/crop-insurance/stats/overview');
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

// Removed preload function as caching is disabled
