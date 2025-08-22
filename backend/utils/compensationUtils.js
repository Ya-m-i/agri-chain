// Compensation calculation utility for backend
const calculateCompensation = (areaDamaged, degreeOfDamage, cropType, damageType) => {
  // Convert to numbers and provide defaults
  const area = parseFloat(areaDamaged) || 0;
  const damage = parseFloat(degreeOfDamage) || 0;
  
  // Base rates per hectare for different crops (in PHP)
  const cropRates = {
    'Rice': 15000,
    'Corn': 12000,
    'Wheat': 14000,
    'Soybeans': 13000,
    'Cotton': 11000,
    'Sugarcane': 10000,
    'Coffee': 18000,
    'Cacao': 16000,
    'Banana': 14000,
    'Mango': 20000,
    'Coconut': 8000,
    'Pineapple': 16000,
    'Vegetables': 12000,
    'Fruits': 15000,
    'Other': 10000
  };

  // Get base rate for crop type
  const cropRate = cropRates[cropType] || cropRates['Other'];

  // Damage multiplier based on degree of damage
  let damageMultiplier = 0;
  if (damage >= 80) damageMultiplier = 1.0; // 100% compensation for 80%+ damage
  else if (damage >= 60) damageMultiplier = 0.8; // 80% compensation for 60-79% damage
  else if (damage >= 40) damageMultiplier = 0.6; // 60% compensation for 40-59% damage
  else if (damage >= 20) damageMultiplier = 0.4; // 40% compensation for 20-39% damage
  else if (damage >= 10) damageMultiplier = 0.2; // 20% compensation for 10-19% damage
  else damageMultiplier = 0.1; // 10% compensation for <10% damage

  // Calculate base compensation
  const baseCompensation = area * cropRate * damageMultiplier;

  // Apply minimum and maximum limits
  const minCompensation = 1000; // Minimum ₱1,000
  const maxCompensation = 20000; // Maximum ₱20,000

  let finalCompensation = Math.max(minCompensation, Math.min(maxCompensation, baseCompensation));

  // Round to nearest peso
  finalCompensation = Math.round(finalCompensation);

  return {
    areaDamaged: area,
    degreeOfDamage: damage,
    cropType: cropType,
    damageType: damageType,
    cropRate: cropRate,
    damageMultiplier: damageMultiplier,
    baseCompensation: baseCompensation,
    finalCompensation: finalCompensation
  };
};

const getDamageSeverity = (degreeOfDamage) => {
  const damage = parseFloat(degreeOfDamage) || 0;
  
  if (damage >= 80) {
    return {
      level: 'Critical',
      description: 'Severe damage requiring immediate attention',
      bgColor: 'bg-red-100',
      color: 'text-red-800'
    };
  } else if (damage >= 60) {
    return {
      level: 'High',
      description: 'Significant damage affecting crop yield',
      bgColor: 'bg-orange-100',
      color: 'text-orange-800'
    };
  } else if (damage >= 40) {
    return {
      level: 'Moderate',
      description: 'Moderate damage with partial yield loss',
      bgColor: 'bg-yellow-100',
      color: 'text-yellow-800'
    };
  } else if (damage >= 20) {
    return {
      level: 'Low',
      description: 'Minor damage with minimal impact',
      bgColor: 'bg-blue-100',
      color: 'text-blue-800'
    };
  } else {
    return {
      level: 'Minimal',
      description: 'Very minor damage',
      bgColor: 'bg-green-100',
      color: 'text-green-800'
    };
  }
};

const getCoverageDetails = (cropType) => {
  const cropRates = {
    'Rice': { coverage: 'Comprehensive Rice Insurance', rate: 15000 },
    'Corn': { coverage: 'Corn Crop Protection', rate: 12000 },
    'Wheat': { coverage: 'Wheat Insurance Plan', rate: 14000 },
    'Soybeans': { coverage: 'Soybean Coverage', rate: 13000 },
    'Cotton': { coverage: 'Cotton Protection', rate: 11000 },
    'Sugarcane': { coverage: 'Sugarcane Insurance', rate: 10000 },
    'Coffee': { coverage: 'Premium Coffee Coverage', rate: 18000 },
    'Cacao': { coverage: 'Cacao Protection Plan', rate: 16000 },
    'Banana': { coverage: 'Banana Crop Insurance', rate: 14000 },
    'Mango': { coverage: 'Premium Mango Coverage', rate: 20000 },
    'Coconut': { coverage: 'Coconut Protection', rate: 8000 },
    'Pineapple': { coverage: 'Pineapple Insurance', rate: 16000 },
    'Vegetables': { coverage: 'Vegetable Crop Protection', rate: 12000 },
    'Fruits': { coverage: 'Fruit Tree Insurance', rate: 15000 },
    'Other': { coverage: 'General Crop Protection', rate: 10000 }
  };

  return cropRates[cropType] || cropRates['Other'];
};

module.exports = {
  calculateCompensation,
  getDamageSeverity,
  getCoverageDetails
}; 