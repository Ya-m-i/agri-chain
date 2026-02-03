import jsPDF from 'jspdf'

/**
 * Generate PCIC APPLICATION FOR CROP INSURANCE PDF
 * Matches the official PCIC form template (same structure as the application form image)
 * Uses record.pcicForm when present, otherwise falls back to record + farmer data.
 */
export const generateCropInsuranceApplicationPDF = (record, farmerData = null) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  doc.setFont('helvetica', 'normal')

  const drawField = (x, y, value, width = 50) => {
    const displayValue = value !== null && value !== undefined ? String(value) : ''
    doc.setFontSize(8)
    doc.text(displayValue.substring(0, Math.floor(width / 2.5)), x, y)
    doc.line(x, y + 0.5, Math.min(x + width, 200), y + 0.5)
  }

  const drawCheckbox = (x, y, checked) => {
    doc.rect(x, y, 3, 3)
    if (checked) doc.text('x', x + 0.8, y + 2.2)
  }

  const pf = record.pcicForm || {}
  const farmer = farmerData || (typeof record.farmerId === 'object' ? record.farmerId : null)

  let y = 12

  // Title
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PHILIPPINE CROP INSURANCE CORPORATION', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.text('APPLICATION FOR CROP INSURANCE', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Kindly fill out all entries and tick all boxes [✔] as appropriate.', 105, y, { align: 'center' })
  y += 8

  // Top section: CROP, APPLICATION TYPE, TOTAL AREA, FARMER CATEGORY, DATE OF APPLICATION
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CROP (Choose only one):', 14, y)
  const cropType = record.cropType || pf.cropType || ''
  drawCheckbox(14, y + 1.5, /rice/i.test(cropType))
  doc.setFont('helvetica', 'normal')
  doc.text('Rice', 18, y + 3)
  drawCheckbox(30, y + 1.5, /corn/i.test(cropType))
  doc.text('Corn', 34, y + 3)
  drawCheckbox(46, y + 1.5, !/rice|corn/i.test(cropType) && cropType)
  doc.text('High Value (Please Specify)', 50, y + 3)
  drawField(95, y + 2, !/rice|corn/i.test(cropType) ? cropType : '', 50)
  y += 6

  doc.text('APPLICATION TYPE:', 14, y)
  const appType = pf.applicationType || 'New Application'
  drawCheckbox(50, y + 1.5, /new/i.test(appType))
  doc.text('New Application', 54, y + 3)
  drawCheckbox(85, y + 1.5, /renewal/i.test(appType))
  doc.text('Renewal', 89, y + 3)
  y += 6

  doc.text('TOTAL AREA (in hectares):', 14, y)
  drawField(55, y + 2, record.cropArea ?? pf.totalArea ?? '', 25)
  doc.text('FARMER CATEGORY:', 95, y + 3)
  const fCat = pf.farmerCategory || 'Self-Financed'
  drawCheckbox(135, y + 1.5, /self/i.test(fCat))
  doc.text('Self-Financed', 139, y + 3)
  drawCheckbox(165, y + 1.5, /borrow/i.test(fCat))
  doc.text('Borrowing', 169, y + 3)
  if (pf.lender) doc.text('Lender: ' + pf.lender, 14, y + 7)
  y += /borrow/i.test(fCat) ? 10 : 6

  doc.text('DATE OF APPLICATION:', 14, y)
  const dateApp = pf.dateOfApplication ? new Date(pf.dateOfApplication).toLocaleDateString() : (record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '')
  drawField(55, y + 2, dateApp, 35)
  doc.text('(mm/dd/yyyy)', 92, y + 3)
  y += 10

  // A. BASIC FARMER INFORMATION
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('A. BASIC FARMER INFORMATION', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  const lastName = pf.applicantName?.lastName || farmer?.lastName || ''
  const firstName = pf.applicantName?.firstName || farmer?.firstName || ''
  const middleName = pf.applicantName?.middleName || farmer?.middleName || ''
  const suffix = pf.applicantName?.suffix || ''

  doc.text('A.1 Name:', 14, y)
  doc.text('Last Name', 25, y + 4)
  drawField(25, y + 5, lastName, 35)
  doc.text('First Name', 65, y + 4)
  drawField(65, y + 5, firstName, 35)
  doc.text('Middle Name', 105, y + 4)
  drawField(105, y + 5, middleName, 35)
  doc.text('Suffix (Jr., Sr., III)', 145, y + 4)
  drawField(145, y + 5, suffix, 55)
  y += 12

  doc.text('A.2 Address:', 14, y)
  doc.text('No. & Street/Sitio', 25, y + 4)
  drawField(25, y + 5, pf.address?.street || farmer?.address || '', 50)
  doc.text('Barangay', 80, y + 4)
  drawField(80, y + 5, pf.address?.barangay || '', 35)
  doc.text('Municipality/City', 120, y + 4)
  drawField(120, y + 5, pf.address?.municipality || '', 35)
  doc.text('Province', 160, y + 4)
  drawField(160, y + 5, pf.address?.province || '', 40)
  y += 12

  doc.text('A.3 Contact Number:', 14, y)
  drawField(50, y + 2, pf.contactNumber || farmer?.contactNum || '', 50)
  doc.text('A.4 Date of Birth:', 110, y + 3)
  drawField(135, y + 2, pf.dateOfBirth ? new Date(pf.dateOfBirth).toLocaleDateString() : (farmer?.birthday || ''), 35)
  doc.text('(mm/dd/yyyy)', 172, y + 3)
  y += 8

  doc.text('A.5 Sex:', 14, y)
  drawCheckbox(25, y + 1.5, (pf.sex || farmer?.gender || '').toLowerCase() === 'male')
  doc.text('Male', 29, y + 3)
  drawCheckbox(40, y + 1.5, (pf.sex || farmer?.gender || '').toLowerCase() === 'female')
  doc.text('Female', 44, y + 3)
  y += 8

  doc.text('A.6 Are you part of a special sector? Please tick [✔] as many as necessary:', 14, y)
  y += 5
  const special = pf.specialSector || []
  drawCheckbox(14, y + 1.5, special.some(s => /pwd/i.test(s)))
  doc.text('PWD', 18, y + 3)
  drawCheckbox(30, y + 1.5, special.some(s => /senior/i.test(s)))
  doc.text('Senior Citizen', 34, y + 3)
  drawCheckbox(55, y + 1.5, special.some(s => /youth/i.test(s)))
  doc.text('Youth', 59, y + 3)
  drawCheckbox(72, y + 1.5, special.some(s => /indigenous/i.test(s)))
  doc.text('Indigenous People', 76, y + 3)
  doc.text('Indicate tribe:', 110, y + 3)
  drawField(130, y + 2, pf.tribe || '', 65)
  y += 10

  doc.text('A.7 Civil Status:', 14, y)
  const civil = pf.civilStatus || ''
  ;['Single', 'Married', 'Widowed', 'Separated'].forEach((s, i) => {
    drawCheckbox(14 + i * 28, y + 1.5, civil.toLowerCase() === s.toLowerCase())
    doc.text(s, 18 + i * 28, y + 3)
  })
  if (civil.toLowerCase() === 'married' && pf.spouseName) {
    y += 5
    doc.text('Name of Spouse:', 14, y + 3)
    drawField(45, y + 2, pf.spouseName, 80)
    y += 5
  }
  y += 8

  doc.text('A.8 Name of Legal Beneficiary (in case of death benefit, as applicable):', 14, y)
  y += 5
  doc.setFontSize(7)
  doc.text('Primary Beneficiary', 14, y + 3)
  const prim = pf.beneficiary?.primary || {}
  drawField(45, y + 2, prim.lastName || '', 25)
  drawField(72, y + 2, prim.firstName || '', 25)
  drawField(99, y + 2, prim.middleName || '', 25)
  drawField(126, y + 2, prim.suffix || '', 15)
  drawField(143, y + 2, prim.relationship || '', 25)
  drawField(170, y + 2, prim.birthdate ? new Date(prim.birthdate).toLocaleDateString() : '', 25)
  y += 7
  doc.text('Guardian', 14, y + 3)
  const guard = pf.beneficiary?.guardian || {}
  drawField(45, y + 2, guard.lastName || '', 25)
  drawField(72, y + 2, guard.firstName || '', 25)
  drawField(99, y + 2, guard.middleName || '', 25)
  drawField(126, y + 2, guard.suffix || '', 15)
  drawField(143, y + 2, guard.relationship || '', 25)
  drawField(170, y + 2, guard.birthdate ? new Date(guard.birthdate).toLocaleDateString() : '', 25)
  y += 10
  doc.setFontSize(8)

  doc.text('A.9 In the event of claim, what is your preferred method of receiving indemnity payment?', 14, y)
  y += 5
  const indemnity = (pf.indemnityPaymentOption || '').toLowerCase()
  drawCheckbox(14, y + 1.5, /landbank|dbp/i.test(indemnity))
  doc.text('LandBank or DBP', 18, y + 3)
  drawCheckbox(50, y + 1.5, /palawan|palawan express/i.test(indemnity))
  doc.text('Palawan Express', 54, y + 3)
  drawCheckbox(85, y + 1.5, /gcash/i.test(indemnity))
  doc.text('GCash', 89, y + 3)
  drawCheckbox(105, y + 1.5, /other/i.test(indemnity))
  doc.text('Others (Please specify)', 109, y + 3)
  drawField(155, y + 2, pf.indemnityOther || '', 45)
  y += 12

  // B. FARM INFORMATION
  doc.setFont('helvetica', 'bold')
  doc.text('B. FARM INFORMATION', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  const lots = (pf.lots && pf.lots.length > 0) ? pf.lots : [{
    farmLocation: {},
    boundaries: {},
    geoRefId: '',
    variety: '',
    plantingMethod: record.plantingMethod,
    dateOfSowing: record.plantingDate,
    dateOfPlanting: record.plantingDate,
    dateOfHarvest: record.expectedHarvestDate,
    numberOfTreesHills: '',
    landCategory: '',
    tenurialStatus: '',
    desiredAmountOfCover: null,
    lotArea: record.lotArea
  }]

  const colWidth = 63
  for (let lotIndex = 0; lotIndex < Math.min(lots.length, 3); lotIndex++) {
    const lot = lots[lotIndex]
    const xStart = 14 + lotIndex * colWidth
    doc.setFontSize(7)
    doc.text(`Lot ${lotIndex + 1}`, xStart, y)
    y += 4
    doc.text('B.1 Farm Location:', xStart, y)
    y += 3
    doc.text('a.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.street || '', colWidth - 10)
    y += 5
    doc.text('b.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.barangay || '', colWidth - 10)
    y += 5
    doc.text('c.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.municipality || '', colWidth - 10)
    y += 5
    doc.text('d.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.province || '', colWidth - 10)
    y += 6
    doc.text('B.2 Boundaries:', xStart, y)
    y += 3
    doc.text('N:', xStart, y + 2)
    drawField(xStart + 8, y + 2, lot.boundaries?.north || '', colWidth - 15)
    doc.text('E:', xStart + (colWidth / 2), y + 2)
    drawField(xStart + (colWidth / 2) + 5, y + 2, lot.boundaries?.east || '', colWidth - 20)
    y += 5
    doc.text('S:', xStart, y + 2)
    drawField(xStart + 8, y + 2, lot.boundaries?.south || '', colWidth - 15)
    doc.text('W:', xStart + (colWidth / 2), y + 2)
    drawField(xStart + (colWidth / 2) + 5, y + 2, lot.boundaries?.west || '', colWidth - 20)
    y += 6
    doc.text('B.3 Geo Ref ID / Farm ID:', xStart, y + 2)
    drawField(xStart, y + 4, lot.geoRefId || '', colWidth - 5)
    y += 8
    doc.text('B.4 Variety:', xStart, y + 2)
    drawField(xStart, y + 4, lot.variety || '', colWidth - 5)
    y += 7
    doc.text('B.5 Planting Method:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.plantingMethod || '').toLowerCase().includes('direct'))
    doc.text('DS', xStart + 4, y + 5)
    drawCheckbox(xStart + 15, y + 3.5, (lot.plantingMethod || '').toLowerCase().includes('transplant'))
    doc.text('TP', xStart + 19, y + 5)
    y += 8
    doc.text('B.6 Date of Sowing:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfSowing ? new Date(lot.dateOfSowing).toLocaleDateString() : '', colWidth - 5)
    y += 7
    doc.text('B.7 Date of Planting:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfPlanting ? new Date(lot.dateOfPlanting).toLocaleDateString() : '', colWidth - 5)
    y += 7
    doc.text('B.8 Date of Harvest:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfHarvest ? new Date(lot.dateOfHarvest).toLocaleDateString() : '', colWidth - 5)
    y += 7
    doc.text('B.9 No. of Trees/Hills:', xStart, y + 2)
    drawField(xStart, y + 4, lot.numberOfTreesHills || '', colWidth - 5)
    y += 7
    doc.text('B.10 Land Category:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.landCategory || '').toLowerCase().includes('irrigat'))
    doc.text('Irrigated', xStart + 4, y + 5)
    drawCheckbox(xStart + 28, y + 3.5, (lot.landCategory || '').toLowerCase().includes('non'))
    doc.text('Non-Irrigated', xStart + 32, y + 5)
    y += 8
    doc.text('B.11 Tenurial Status:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.tenurialStatus || '').toLowerCase() === 'owner')
    doc.text('Owner', xStart + 4, y + 5)
    drawCheckbox(xStart + 22, y + 3.5, (lot.tenurialStatus || '').toLowerCase() === 'lessee')
    doc.text('Lessee', xStart + 26, y + 5)
    y += 8
    doc.text('B.12 Desired Amount of Cover (PHP):', xStart, y + 2)
    drawField(xStart, y + 4, lot.desiredAmountOfCover != null ? String(lot.desiredAmountOfCover) : '', colWidth - 5)
    y += 10
  }

  if (y > 240) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(8)
  // C. CERTIFICATION AND DATA PRIVACY CONSENT
  doc.setFont('helvetica', 'bold')
  doc.text('C. CERTIFICATION AND DATA PRIVACY CONSENT STATEMENT', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  drawCheckbox(14, y + 1.5, !!pf.certificationConsent)
  doc.text('I certify that the statements made herein are true and correct. I understand that PCIC may reject or void this application...', 18, y + 3)
  y += 8
  drawCheckbox(14, y + 1.5, !!pf.deedOfAssignmentConsent)
  doc.text('Deed of Assignment for borrowing farmers (If applicable)', 18, y + 3)
  y += 10
  doc.text('Signature / Thumb Mark over Printed Name Farmer - Applicant:', 14, y)
  if (pf.signatureImage) {
    try {
      doc.addImage(pf.signatureImage, 'JPEG', 14, y + 2, 40, 15)
    } catch (e) {
      doc.line(14, y + 10, 54, y + 10)
    }
  } else {
    doc.line(14, y + 10, 54, y + 10)
  }
  doc.text('Date:', 70, y + 11)
  drawField(80, y + 10, pf.certificationDate ? new Date(pf.certificationDate).toLocaleDateString() : '', 30)
  y += 18

  // D. COVERAGE (FOR PCIC USE ONLY)
  doc.setFont('helvetica', 'bold')
  doc.text('D. COVERAGE (FOR PCIC USE ONLY)', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text('D.1 Source of Premium:', 14, y)
  y += 5
  const sources = pf.sourceOfPremium || []
  drawCheckbox(14, y + 1.5, sources.some(s => /non-subsidized|regular/i.test(s)))
  doc.text('Non-Subsidized/Regular', 18, y + 3)
  drawCheckbox(60, y + 1.5, sources.some(s => /nciff|ncip/i.test(s)))
  doc.text('Subsidized/NCIFF - NCIPs No.', 64, y + 3)
  y += 5
  drawCheckbox(14, y + 1.5, sources.some(s => /rsbsa/i.test(s)))
  doc.text('Subsidized/RSBSA - Ref. No.', 18, y + 3)
  drawCheckbox(65, y + 1.5, sources.some(s => /other/i.test(s)))
  doc.text('Others', 69, y + 3)
  drawField(85, y + 2, pf.sourceOfPremiumOther || '', 50)
  y += 10

  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.text('Generated from AGRI-CHAIN. ' + new Date().toLocaleString(), 105, doc.internal.pageSize.height - 10, { align: 'center' })

  const safeName = (firstName + '_' + lastName).replace(/\s+/g, '_').slice(0, 30)
  const outFilename = `PCIC_Application_Crop_Insurance_${record._id || 'Form'}_${safeName}.pdf`
  doc.save(outFilename)
  return outFilename
}

export default generateCropInsuranceApplicationPDF
