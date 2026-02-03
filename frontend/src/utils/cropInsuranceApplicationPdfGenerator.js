import jsPDF from 'jspdf'

// Layout constants to prevent overflow and keep consistent spacing
const LINE_HEIGHT = 5
const PAGE_TOP = 20
const PAGE_BOTTOM = 277
const MARGIN_RIGHT = 198

/**
 * Truncate text to fit within maxWidth (mm); add ellipsis if truncated.
 * Prevents data from overflowing the template.
 */
function truncateToWidth(doc, text, maxWidthMm, fontSize = 8) {
  if (text == null || text === '') return ''
  const str = String(text)
  doc.setFontSize(fontSize)
  let w = doc.getTextWidth(str)
  if (w <= maxWidthMm) return str
  for (let len = str.length - 1; len > 0; len--) {
    const part = str.substring(0, len) + '...'
    if (doc.getTextWidth(part) <= maxWidthMm) return part
  }
  return '...'
}

/**
 * Generate PCIC APPLICATION FOR CROP INSURANCE PDF
 * Matches the official PCIC form template (same structure as the application form image)
 * Uses record.pcicForm when present, otherwise falls back to record + farmer data.
 * Spacing and text truncation prevent overflow while keeping the template structure.
 */
export const generateCropInsuranceApplicationPDF = (record, farmerData = null) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  doc.setFont('helvetica', 'normal')

  const drawField = (x, y, value, width = 50, fontSize = 8) => {
    const displayValue = value !== null && value !== undefined ? String(value) : ''
    const safe = truncateToWidth(doc, displayValue, Math.min(width, MARGIN_RIGHT - x), fontSize)
    doc.setFontSize(fontSize)
    doc.text(safe, x, y)
    doc.line(x, y + 0.5, Math.min(x + width, MARGIN_RIGHT), y + 0.5)
  }

  const drawCheckbox = (x, y, checked) => {
    doc.rect(x, y, 3, 3)
    if (checked) doc.text('x', x + 0.8, y + 2.2)
  }

  const checkPageBreak = (currentY, neededSpace = LINE_HEIGHT * 3) => {
    if (currentY > PAGE_BOTTOM - neededSpace) {
      doc.addPage()
      return PAGE_TOP
    }
    return currentY
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
  drawField(92, y + 2, !/rice|corn/i.test(cropType) ? cropType : '', 54)
  y += LINE_HEIGHT + 1

  doc.text('APPLICATION TYPE:', 14, y)
  const appType = pf.applicationType || 'New Application'
  drawCheckbox(50, y + 1.5, /new/i.test(appType))
  doc.text('New Application', 54, y + 3)
  drawCheckbox(85, y + 1.5, /renewal/i.test(appType))
  doc.text('Renewal', 89, y + 3)
  y += LINE_HEIGHT + 1

  doc.text('TOTAL AREA (in hectares):', 14, y)
  drawField(55, y + 2, record.cropArea ?? pf.totalArea ?? '', 22)
  doc.text('FARMER CATEGORY:', 82, y + 3)
  const fCat = pf.farmerCategory || 'Self-Financed'
  drawCheckbox(120, y + 1.5, /self/i.test(fCat))
  doc.text('Self-Financed', 124, y + 3)
  drawCheckbox(152, y + 1.5, /borrow/i.test(fCat))
  doc.text('Borrowing', 156, y + 3)
  if (pf.lender) {
    doc.text('Lender:', 14, y + 7)
    drawField(28, y + 6, pf.lender, 168)
    y += LINE_HEIGHT + 2
  }
  y += LINE_HEIGHT + 1

  doc.text('DATE OF APPLICATION:', 14, y)
  const dateApp = pf.dateOfApplication ? new Date(pf.dateOfApplication).toLocaleDateString() : (record.createdAt ? new Date(record.createdAt).toLocaleDateString() : '')
  drawField(55, y + 2, dateApp, 35)
  doc.text('(mm/dd/yyyy)', 92, y + 3)
  y += 10

  y = checkPageBreak(y)

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
  drawField(25, y + 5, lastName, 32)
  doc.text('First Name', 59, y + 4)
  drawField(59, y + 5, firstName, 32)
  doc.text('Middle Name', 93, y + 4)
  drawField(93, y + 5, middleName, 32)
  doc.text('Suffix (Jr., Sr., III)', 127, y + 4)
  drawField(127, y + 5, suffix, 70)
  y += LINE_HEIGHT + 6

  doc.text('A.2 Address:', 14, y)
  doc.text('No. & Street/Sitio', 25, y + 4)
  drawField(25, y + 5, pf.address?.street || farmer?.address || '', 48)
  doc.text('Barangay', 76, y + 4)
  drawField(76, y + 5, pf.address?.barangay || '', 32)
  doc.text('Municipality/City', 110, y + 4)
  drawField(110, y + 5, pf.address?.municipality || '', 32)
  doc.text('Province', 144, y + 4)
  drawField(144, y + 5, pf.address?.province || '', 52)
  y += LINE_HEIGHT + 6

  doc.text('A.3 Contact Number:', 14, y)
  drawField(50, y + 2, pf.contactNumber || farmer?.contactNum || '', 52)
  doc.text('A.4 Date of Birth:', 106, y + 3)
  drawField(132, y + 2, pf.dateOfBirth ? new Date(pf.dateOfBirth).toLocaleDateString() : (farmer?.birthday || ''), 32)
  doc.text('(mm/dd/yyyy)', 166, y + 3)
  y += LINE_HEIGHT + 3

  doc.text('A.5 Sex:', 14, y)
  drawCheckbox(25, y + 1.5, (pf.sex || farmer?.gender || '').toLowerCase() === 'male')
  doc.text('Male', 29, y + 3)
  drawCheckbox(42, y + 1.5, (pf.sex || farmer?.gender || '').toLowerCase() === 'female')
  doc.text('Female', 46, y + 3)
  y += LINE_HEIGHT + 3

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
  doc.text('Indicate tribe:', 108, y + 3)
  drawField(128, y + 2, pf.tribe || '', 68)
  y += LINE_HEIGHT + 4

  doc.text('A.7 Civil Status:', 14, y)
  const civil = pf.civilStatus || ''
  const civilLabels = ['Single', 'Married', 'Widowed', 'Separated']
  civilLabels.forEach((s, i) => {
    const x = 14 + i * 24
    drawCheckbox(x, y + 1.5, civil.toLowerCase() === s.toLowerCase())
    doc.text(truncateToWidth(doc, s, 20, 8), x + 4, y + 3)
  })
  if (civil.toLowerCase() === 'married' && pf.spouseName) {
    y += LINE_HEIGHT
    doc.text('Name of Spouse:', 14, y + 3)
    drawField(45, y + 2, pf.spouseName, 150)
    y += LINE_HEIGHT
  }
  y += LINE_HEIGHT

  doc.setFontSize(7)
  doc.text('A.8 Name of Legal Beneficiary (in case of death benefit, as applicable):', 14, y)
  y += 5
  doc.text('Primary Beneficiary', 14, y + 3)
  const prim = pf.beneficiary?.primary || {}
  drawField(45, y + 2, prim.lastName || '', 22, 7)
  drawField(68, y + 2, prim.firstName || '', 22, 7)
  drawField(91, y + 2, prim.middleName || '', 22, 7)
  drawField(114, y + 2, prim.suffix || '', 12, 7)
  drawField(127, y + 2, prim.relationship || '', 22, 7)
  drawField(150, y + 2, prim.birthdate ? new Date(prim.birthdate).toLocaleDateString() : '', 22, 7)
  y += LINE_HEIGHT + 2
  doc.text('Guardian', 14, y + 3)
  const guard = pf.beneficiary?.guardian || {}
  drawField(45, y + 2, guard.lastName || '', 22, 7)
  drawField(68, y + 2, guard.firstName || '', 22, 7)
  drawField(91, y + 2, guard.middleName || '', 22, 7)
  drawField(114, y + 2, guard.suffix || '', 12, 7)
  drawField(127, y + 2, guard.relationship || '', 22, 7)
  drawField(150, y + 2, guard.birthdate ? new Date(guard.birthdate).toLocaleDateString() : '', 22, 7)
  y += LINE_HEIGHT + 4
  doc.setFontSize(8)

  doc.setFontSize(7)
  const a9Label = 'A.9 In the event of claim, what is your preferred method of receiving indemnity payment?'
  doc.text(a9Label, 14, y)
  y += 5
  doc.setFontSize(8)
  const indemnity = (pf.indemnityPaymentOption || '').toLowerCase()
  drawCheckbox(14, y + 1.5, /landbank|dbp/i.test(indemnity))
  doc.text('LandBank or DBP', 18, y + 3)
  drawCheckbox(48, y + 1.5, /palawan|palawan express/i.test(indemnity))
  doc.text('Palawan Express', 52, y + 3)
  drawCheckbox(82, y + 1.5, /gcash/i.test(indemnity))
  doc.text('GCash', 86, y + 3)
  drawCheckbox(102, y + 1.5, /other/i.test(indemnity))
  doc.text('Others (Please specify)', 106, y + 3)
  drawField(152, y + 2, pf.indemnityOther || '', 44)
  y += LINE_HEIGHT + 5

  y = checkPageBreak(y)

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

  const colWidth = 62
  const lotFieldWidth = colWidth - 8
  for (let lotIndex = 0; lotIndex < Math.min(lots.length, 3); lotIndex++) {
    y = checkPageBreak(y, 80)
    const lot = lots[lotIndex]
    const xStart = 14 + lotIndex * colWidth
    doc.setFontSize(7)
    doc.text(`Lot ${lotIndex + 1}`, xStart, y)
    y += 4
    doc.text('B.1 Farm Location:', xStart, y)
    y += 3
    doc.text('a.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.street || '', lotFieldWidth - 5, 7)
    y += 5
    doc.text('b.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.barangay || '', lotFieldWidth - 5, 7)
    y += 5
    doc.text('c.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.municipality || '', lotFieldWidth - 5, 7)
    y += 5
    doc.text('d.', xStart, y + 2)
    drawField(xStart + 5, y + 2, lot.farmLocation?.province || '', lotFieldWidth - 5, 7)
    y += 6
    doc.text('B.2 Boundaries:', xStart, y)
    y += 3
    doc.text('N:', xStart, y + 2)
    drawField(xStart + 6, y + 2, lot.boundaries?.north || '', lotFieldWidth / 2 - 4, 7)
    doc.text('E:', xStart + colWidth / 2, y + 2)
    drawField(xStart + colWidth / 2 + 4, y + 2, lot.boundaries?.east || '', lotFieldWidth / 2 - 6, 7)
    y += 5
    doc.text('S:', xStart, y + 2)
    drawField(xStart + 6, y + 2, lot.boundaries?.south || '', lotFieldWidth / 2 - 4, 7)
    doc.text('W:', xStart + colWidth / 2, y + 2)
    drawField(xStart + colWidth / 2 + 4, y + 2, lot.boundaries?.west || '', lotFieldWidth / 2 - 6, 7)
    y += 6
    doc.text('B.3 Geo Ref ID / Farm ID:', xStart, y + 2)
    drawField(xStart, y + 4, lot.geoRefId || '', lotFieldWidth, 7)
    y += 7
    doc.text('B.4 Variety:', xStart, y + 2)
    drawField(xStart, y + 4, lot.variety || '', lotFieldWidth, 7)
    y += 7
    doc.text('B.5 Planting Method:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.plantingMethod || '').toLowerCase().includes('direct'))
    doc.text('DS', xStart + 4, y + 5)
    drawCheckbox(xStart + 14, y + 3.5, (lot.plantingMethod || '').toLowerCase().includes('transplant'))
    doc.text('TP', xStart + 18, y + 5)
    y += 7
    doc.text('B.6 Date of Sowing:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfSowing ? new Date(lot.dateOfSowing).toLocaleDateString() : '', lotFieldWidth, 7)
    y += 6
    doc.text('B.7 Date of Planting:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfPlanting ? new Date(lot.dateOfPlanting).toLocaleDateString() : '', lotFieldWidth, 7)
    y += 6
    doc.text('B.8 Date of Harvest:', xStart, y + 2)
    drawField(xStart, y + 4, lot.dateOfHarvest ? new Date(lot.dateOfHarvest).toLocaleDateString() : '', lotFieldWidth, 7)
    y += 6
    doc.text('B.9 No. of Trees/Hills:', xStart, y + 2)
    drawField(xStart, y + 4, lot.numberOfTreesHills || '', lotFieldWidth, 7)
    y += 6
    doc.text('B.10 Land Category:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.landCategory || '').toLowerCase().includes('irrigat'))
    doc.text('Irrigated', xStart + 4, y + 5)
    drawCheckbox(xStart + 26, y + 3.5, (lot.landCategory || '').toLowerCase().includes('non'))
    doc.text('Non-Irrigated', xStart + 30, y + 5)
    y += 7
    doc.text('B.11 Tenurial Status:', xStart, y)
    drawCheckbox(xStart, y + 3.5, (lot.tenurialStatus || '').toLowerCase() === 'owner')
    doc.text('Owner', xStart + 4, y + 5)
    drawCheckbox(xStart + 20, y + 3.5, (lot.tenurialStatus || '').toLowerCase() === 'lessee')
    doc.text('Lessee', xStart + 24, y + 5)
    y += 7
    doc.text('B.12 Desired Amount of Cover (PHP):', xStart, y + 2)
    drawField(xStart, y + 4, lot.desiredAmountOfCover != null ? String(lot.desiredAmountOfCover) : '', lotFieldWidth, 7)
    y += 9
  }

  y = checkPageBreak(y)

  doc.setFontSize(8)
  // C. CERTIFICATION AND DATA PRIVACY CONSENT
  doc.setFont('helvetica', 'bold')
  doc.text('C. CERTIFICATION AND DATA PRIVACY CONSENT STATEMENT', 14, y)
  y += LINE_HEIGHT + 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  drawCheckbox(14, y + 1.5, !!pf.certificationConsent)
  const certText = 'I certify that the statements made herein are true and correct. I understand that PCIC may reject or void this application...'
  const certLastY = doc.text(certText, 18, y + 3, { maxWidth: MARGIN_RIGHT - 18 })
  y = (typeof certLastY === 'number' ? certLastY : y + 8) + 2
  drawCheckbox(14, y + 1.5, !!pf.deedOfAssignmentConsent)
  doc.text('Deed of Assignment for borrowing farmers (If applicable)', 18, y + 3)
  y += LINE_HEIGHT + 4
  doc.text('Signature / Thumb Mark over Printed Name Farmer - Applicant:', 14, y)
  const sigLineEnd = 120
  if (pf.signatureImage) {
    try {
      doc.addImage(pf.signatureImage, 'JPEG', 14, y + 2, 40, 12)
    } catch (e) {
      doc.line(14, y + 8, sigLineEnd, y + 8)
    }
  } else {
    doc.line(14, y + 8, sigLineEnd, y + 8)
  }
  doc.text('Date:', 128, y + 9)
  drawField(138, y + 8, pf.certificationDate ? new Date(pf.certificationDate).toLocaleDateString() : '', 28)
  y += LINE_HEIGHT + 8

  // D. COVERAGE (FOR PCIC USE ONLY)
  doc.setFont('helvetica', 'bold')
  doc.text('D. COVERAGE (FOR PCIC USE ONLY)', 14, y)
  y += LINE_HEIGHT + 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('D.1 Source of Premium:', 14, y)
  y += 5
  const sources = pf.sourceOfPremium || []
  drawCheckbox(14, y + 1.5, sources.some(s => /non-subsidized|regular/i.test(s)))
  doc.text('Non-Subsidized/Regular', 18, y + 3)
  drawCheckbox(58, y + 1.5, sources.some(s => /nciff|ncip/i.test(s)))
  doc.text('Subsidized/NCIFF - NCIPs No.', 62, y + 3)
  drawField(105, y + 2, '', 28)
  y += LINE_HEIGHT + 2
  drawCheckbox(14, y + 1.5, sources.some(s => /rsbsa/i.test(s)))
  doc.text('Subsidized/RSBSA - Ref. No.', 18, y + 3)
  drawField(72, y + 2, '', 28)
  drawCheckbox(105, y + 1.5, sources.some(s => /other/i.test(s)))
  doc.text('Others', 109, y + 3)
  drawField(128, y + 2, pf.sourceOfPremiumOther || '', 68)
  y += LINE_HEIGHT + 4

  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.text('Generated from AGRI-CHAIN. ' + new Date().toLocaleString(), 105, doc.internal.pageSize.height - 10, { align: 'center' })

  const safeName = (firstName + '_' + lastName).replace(/\s+/g, '_').slice(0, 30)
  const outFilename = `PCIC_Application_Crop_Insurance_${record._id || 'Form'}_${safeName}.pdf`
  doc.save(outFilename)
  return outFilename
}

export default generateCropInsuranceApplicationPDF
