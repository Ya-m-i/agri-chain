/**
 * Single source of truth for crop insurance details display data (View modal + PDF).
 * Merges record + farmer + pcicForm so View and PDF use the same structure and avoid duplication.
 *
 * @param {Object} record - Crop insurance record (may have farmerId as id or populated object)
 * @param {Object|Object[]} farmersOrResolvedFarmer - Either the farmers list or a single resolved farmer
 * @returns {Object} Display data for PCIC form template (sections A, B, C, D)
 */
export function getCropInsuranceDetailsDisplayData(record, farmersOrResolvedFarmer = []) {
  const farmers = Array.isArray(farmersOrResolvedFarmer) ? farmersOrResolvedFarmer : [farmersOrResolvedFarmer]
  const farmer =
    record?.farmerId && typeof record.farmerId === 'object'
      ? record.farmerId
      : farmers.find((f) => f && (f._id === record?.farmerId || f.id === record?.farmerId))

  const pf = record?.pcicForm || {}
  const cropType = record?.cropType || ''
  const isRice = /rice/i.test(cropType)
  const isCorn = /corn/i.test(cropType)
  const isHighValue = !isRice && !isCorn && cropType
  const lots =
    pf.lots && pf.lots.length > 0
      ? pf.lots
      : [
          {
            farmLocation: {},
            boundaries: {},
            geoRefId: '',
            variety: '',
            plantingMethod: '',
            dateOfSowing: record?.plantingDate,
            dateOfPlanting: record?.plantingDate,
            dateOfHarvest: record?.expectedHarvestDate,
            numberOfTreesHills: '',
            landCategory: '',
            tenurialStatus: '',
            desiredAmountOfCover: null,
            lotArea: record?.lotArea,
          },
        ]

  const toDateStr = (v) =>
    v && (v instanceof Date || typeof v === 'string') ? new Date(v).toLocaleDateString() : v || ''

  return {
    crop: { isRice, isCorn, isHighValue, highValueSpec: isHighValue ? cropType : '' },
    applicationType: pf.applicationType || 'New Application',
    totalArea: record?.cropArea ?? pf.totalArea ?? '',
    farmerCategory: pf.farmerCategory || 'Self-Financed',
    lender: pf.lender || '',
    dateOfApplication: toDateStr(pf.dateOfApplication || record?.createdAt),
    name: {
      lastName: pf.applicantName?.lastName ?? farmer?.lastName ?? '',
      firstName: pf.applicantName?.firstName ?? farmer?.firstName ?? '',
      middleName: pf.applicantName?.middleName ?? farmer?.middleName ?? '',
      suffix: pf.applicantName?.suffix ?? '',
    },
    contactNumber: pf.contactNumber ?? farmer?.contactNum ?? '',
    address: {
      street: pf.address?.street ?? farmer?.address ?? '',
      barangay: pf.address?.barangay ?? '',
      municipality: pf.address?.municipality ?? '',
      province: pf.address?.province ?? '',
    },
    dateOfBirth: toDateStr(pf.dateOfBirth || farmer?.birthday) || (farmer?.birthday || ''),
    sex: ((pf.sex || farmer?.gender) || '').toLowerCase(),
    specialSector: Array.isArray(pf.specialSector) ? pf.specialSector : [],
    tribe: pf.tribe || '',
    civilStatus: pf.civilStatus || '',
    spouseName: pf.spouseName || '',
    beneficiary: {
      primary: pf.beneficiary?.primary || {},
      guardian: pf.beneficiary?.guardian || {},
    },
    indemnityOption: ((pf.indemnityPaymentOption || '') + '').toLowerCase(),
    indemnityOther: pf.indemnityOther || '',
    certificationConsent: !!pf.certificationConsent,
    deedOfAssignmentConsent: !!pf.deedOfAssignmentConsent,
    certificationDate: toDateStr(pf.certificationDate),
    sourceOfPremium: Array.isArray(pf.sourceOfPremium) ? pf.sourceOfPremium : [],
    sourceOfPremiumOther: pf.sourceOfPremiumOther || '',
    lots,
    record,
  }
}
