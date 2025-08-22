// Utility to fetch and aggregate crop type distribution from crop insurance records
import { fetchCropInsurance } from '../api'

export async function getCropTypeDistributionFromInsurance() {
  const insuranceRecords = await fetchCropInsurance();
  const distribution = {};
  insuranceRecords.forEach(record => {
    const cropType = record.cropType || 'Unknown';
    distribution[cropType] = (distribution[cropType] || 0) + 1;
  });
  return distribution;
}
