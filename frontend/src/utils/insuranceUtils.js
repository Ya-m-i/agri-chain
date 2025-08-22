// Insurance compensation calculation utilities

/**
 * Calculate insurance compensation based on damage parameters
 * @param {number} areaDamaged - Area damaged in hectares
 * @param {number} degreeOfDamage - Degree of damage percentage (0-100)
 * @param {string} cropType - Type of crop damaged
 * @param {string} damageType - Type of damage (Typhoon, Drought, etc.)
 * @returns {object} Compensation details
 */
export const calculateCompensation = (areaDamaged, degreeOfDamage, cropType, damageType) => {
  // Base compensation rates per hectare for different crops (in pesos)
  const cropRates = {
    'Palay': 15000,
    'Corn': 12000,
    'Vegetables': 18000,
    'Banana': 20000,
    'Coconut': 10000,
    'Other': 14000,
    'Rice': 15000, // Alias for Palay
  };

  // Damage type multipliers
  const damageMultipliers = {
    'Typhoon': 1.2,      // Higher compensation for natural disasters
    'Drought': 1.1,      // Moderate multiplier for drought
    'Floods': 1.3,       // High multiplier for floods
    'Pest infestations': 0.9, // Lower multiplier for preventable issues
    'Disease outbreaks': 0.9, // Lower multiplier for preventable issues
    'Fire': 1.4,         // High multiplier for fire damage
    'Theft (for animals)': 0.8, // Lower multiplier for theft
  };

  // Get base rate for crop type
  const baseRate = cropRates[cropType] || cropRates['Other'];
  
  // Get damage multiplier
  const damageMultiplier = damageMultipliers[damageType] || 1.0;
  
  // Calculate base compensation
  const baseCompensation = areaDamaged * baseRate * (degreeOfDamage / 100) * damageMultiplier;
  
  // Apply minimum and maximum limits
  const minCompensation = 1000; // ₱1,000 minimum
  const maxCompensation = 20000; // ₱20,000 maximum
  
  let finalCompensation = Math.max(minCompensation, Math.min(maxCompensation, baseCompensation));
  
  // Round to nearest 100
  finalCompensation = Math.round(finalCompensation / 100) * 100;
  
  return {
    baseCompensation: Math.round(baseCompensation),
    finalCompensation,
    cropRate: baseRate,
    damageMultiplier,
    calculationBreakdown: {
      areaDamaged,
      degreeOfDamage,
      cropType,
      damageType,
      baseRate,
      damageMultiplier,
      minCompensation,
      maxCompensation
    }
  };
};

/**
 * Get compensation status based on claim approval date
 * @param {string} approvalDate - Date when claim was approved
 * @returns {object} Payment status details
 */
export const getPaymentStatus = (approvalDate) => {
  if (!approvalDate) {
    return {
      status: 'Pending',
      statusColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      message: 'Awaiting approval'
    };
  }

  const approval = new Date(approvalDate);
  const now = new Date();
  const daysSinceApproval = Math.floor((now - approval) / (1000 * 60 * 60 * 24));
  
  // Payment timeline: 3-5 business days for processing, then 2-3 days for transfer
  if (daysSinceApproval < 3) {
    return {
      status: 'Processing',
      statusColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      message: 'Payment is being processed'
    };
  } else if (daysSinceApproval < 7) {
    return {
      status: 'In Transit',
      statusColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      message: 'Payment is being transferred to your account'
    };
  } else {
    return {
      status: 'Completed',
      statusColor: 'text-green-600',
      bgColor: 'bg-green-100',
      message: 'Payment has been completed'
    };
  }
};

/**
 * Calculate expected payment date
 * @param {string} approvalDate - Date when claim was approved
 * @returns {string} Expected payment date
 */
export const getExpectedPaymentDate = (approvalDate) => {
  if (!approvalDate) return 'N/A';
  
  const approval = new Date(approvalDate);
  // Add 5-7 business days for processing and transfer
  const expectedDate = new Date(approval.getTime() + 7 * 24 * 60 * 60 * 1000);
  return expectedDate.toLocaleDateString();
};

/**
 * Get damage severity level based on degree of damage
 * @param {number} degreeOfDamage - Degree of damage percentage
 * @returns {object} Damage severity information
 */
export const getDamageSeverity = (degreeOfDamage) => {
  if (degreeOfDamage <= 25) {
    return {
      level: 'Minor',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Light damage with minimal impact'
    };
  } else if (degreeOfDamage <= 50) {
    return {
      level: 'Moderate',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Significant damage with moderate impact'
    };
  } else if (degreeOfDamage <= 75) {
    return {
      level: 'Severe',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Heavy damage with major impact'
    };
  } else {
    return {
      level: 'Critical',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Complete or near-complete damage'
    };
  }
};

/**
 * Get insurance coverage details
 * @param {string} cropType - Type of crop
 * @returns {object} Coverage information
 */
export const getCoverageDetails = (cropType) => {
  const coverageRates = {
    'Palay': { rate: 15000, coverage: 'Full coverage for rice crops' },
    'Corn': { rate: 12000, coverage: 'Standard coverage for corn crops' },
    'Vegetables': { rate: 18000, coverage: 'Premium coverage for vegetable crops' },
    'Banana': { rate: 20000, coverage: 'High-value crop coverage' },
    'Coconut': { rate: 10000, coverage: 'Basic coverage for coconut crops' },
    'Other': { rate: 14000, coverage: 'General crop coverage' },
    'Rice': { rate: 15000, coverage: 'Full coverage for rice crops' },
  };
  
  return coverageRates[cropType] || coverageRates['Other'];
}; 