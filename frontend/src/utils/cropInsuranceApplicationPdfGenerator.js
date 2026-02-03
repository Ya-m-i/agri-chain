import jsPDF from 'jspdf'
import { getCropInsuranceDetailsDisplayData } from './cropInsuranceDetailsDisplayData'

const LINE_HEIGHT = 4
const PAGE_TOP = 18
const PAGE_BOTTOM = 278
const MARGIN_RIGHT = 198
const TRUNCATE_MARGIN = 0.97

function truncateToWidth(doc, text, maxWidthMm, fontSize = 8) {
  if (text == null || text === '') return ''
  const str = String(text)
  doc.setFontSize(fontSize)
  const limit = maxWidthMm * TRUNCATE_MARGIN
  let w = doc.getTextWidth(str)
  if (w <= limit) return str
  for (let len = str.length - 1; len > 0; len--) {
    const part = str.substring(0, len) + '...'
    if (doc.getTextWidth(part) <= limit) return part
  }
  return '...'
}

function drawField(doc, x, y, value, width, fontSize = 8) {
  const effectiveWidth = Math.min(width, MARGIN_RIGHT - x - 1)
  const displayValue = value !== null && value !== undefined ? String(value) : ''
  const safe = truncateToWidth(doc, displayValue, effectiveWidth, fontSize)
  doc.setFontSize(fontSize)
  doc.text(safe, x, y)
  doc.line(x, y + 0.5, x + effectiveWidth, y + 0.5)
}

function drawCheckbox(doc, x, y, checked) {
  doc.rect(x, y, 3, 3)
  if (checked) doc.text('x', x + 0.8, y + 2.2)
}

function checkPageBreak(doc, currentY, neededSpace = LINE_HEIGHT * 3) {
  if (currentY > PAGE_BOTTOM - neededSpace) {
    doc.addPage()
    return PAGE_TOP
  }
  return currentY
}

/**
 * Generate PCIC APPLICATION FOR CROP INSURANCE PDF.
 * Uses the same template and display data as the View modal (shared getCropInsuranceDetailsDisplayData).
 */
export const generateCropInsuranceApplicationPDF = (record, farmerData = null) => {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  doc.setFont('helvetica', 'normal')

  const d = getCropInsuranceDetailsDisplayData(record, farmerData)
  const { name, address, beneficiary, lots: displayLots, record: rec } = d

  let y = 10

  // Header – compact to reduce whitespace
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Republic of the Philippines', 105, y, { align: 'center' })
  y += 4
  doc.text('PHILIPPINE CROP INSURANCE CORPORATION', 105, y, { align: 'center' })
  y += 4
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Regional Office No. _______________', 105, y, { align: 'center' })
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('APPLICATION FOR CROP INSURANCE', 105, y, { align: 'center' })
  y += 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('(Individual Application)', 105, y, { align: 'center' })
  y += 4
  doc.text('Kindly fill out all entries and tick all boxes [√] as appropriate.', 105, y, { align: 'center' })
  y += 6

  // Top section: CROPP, Application Type, Total Area, Farmer Category, Date
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CROP (Choose only one):', 14, y)
  doc.setFont('helvetica', 'normal')
  drawCheckbox(doc, 14, y + 1.5, d.crop.isCorn)
  doc.text('Corn', 18, y + 3)
  drawCheckbox(doc, 30, y + 1.5, d.crop.isRice)
  doc.text('Rice', 34, y + 3)
  drawCheckbox(doc, 46, y + 1.5, d.crop.isHighValue)
  doc.text('High-Value (Please Specify)', 50, y + 3)
  drawField(doc, 92, y + 2, d.crop.highValueSpec, 54)
  y += LINE_HEIGHT + 1

  doc.text('APPLICATION TYPE:', 14, y)
  drawCheckbox(doc, 50, y + 1.5, /new/i.test(d.applicationType))
  doc.text('New Application', 54, y + 3)
  drawCheckbox(doc, 85, y + 1.5, /renewal/i.test(d.applicationType))
  doc.text('Renewal', 89, y + 3)
  y += LINE_HEIGHT + 1

  doc.text('TOTAL AREA (in Hectares):', 14, y)
  drawField(doc, 55, y + 2, d.totalArea, 22)
  doc.text('FARMER CATEGORY:', 82, y + 3)
  drawCheckbox(doc, 120, y + 1.5, /self/i.test(d.farmerCategory))
  doc.text('Self-financed', 124, y + 3)
  drawCheckbox(doc, 152, y + 1.5, /borrow/i.test(d.farmerCategory))
  doc.text('Borrowing', 156, y + 3)
  drawCheckbox(doc, 172, y + 1.5, /lend/i.test(d.farmerCategory))
  doc.text('Lender', 176, y + 3)
  if (d.lender) {
    y += LINE_HEIGHT
    doc.text('Lender:', 14, y + 2)
    drawField(doc, 28, y + 2, d.lender, 168)
    y += LINE_HEIGHT
  }
  y += LINE_HEIGHT + 1

  doc.text('DATE OF APPLICATION:', 14, y)
  drawField(doc, 55, y + 2, d.dateOfApplication, 35)
  doc.text('(mm/dd/yyyy)', 92, y + 3)
  y += 6

  y = checkPageBreak(doc, y, 85)

  // Section A: BASIC FARMER INFORMATION (compact spacing to avoid extra page)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('A. BASIC FARMER INFORMATION', 14, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  doc.text('A.1 Name:', 14, y)
  doc.text('Last Name', 25, y + 3.5)
  drawField(doc, 25, y + 4.5, name.lastName, 30)
  doc.text('First Name', 57, y + 3.5)
  drawField(doc, 57, y + 4.5, name.firstName, 30)
  doc.text('Middle Name', 89, y + 3.5)
  drawField(doc, 89, y + 4.5, name.middleName, 30)
  doc.text('Suffix (Jr., Sr., II)', 121, y + 3.5)
  drawField(doc, 121, y + 4.5, name.suffix, 75)
  y += LINE_HEIGHT + 5

  doc.text('A.2 Contact Number:', 14, y)
  drawField(doc, 50, y + 2, d.contactNumber, 48)
  y += LINE_HEIGHT + 2

  doc.text('A.3 Address:', 14, y)
  doc.text('No. & Street/Sitio', 25, y + 3.5)
  drawField(doc, 25, y + 4.5, address.street, 48)
  doc.text('Barangay', 75, y + 3.5)
  drawField(doc, 75, y + 4.5, address.barangay, 32)
  doc.text('Municipality/City', 109, y + 3.5)
  drawField(doc, 109, y + 4.5, address.municipality, 32)
  doc.text('Province', 143, y + 3.5)
  drawField(doc, 143, y + 4.5, address.province, 53)
  y += LINE_HEIGHT + 5

  doc.text('A.4 Date of Birth:', 14, y)
  drawField(doc, 50, y + 2, d.dateOfBirth, 30)
  doc.text('(mm/dd/yyyy)', 82, y + 2.5)
  doc.text('A.5 Sex:', 104, y + 2.5)
  drawCheckbox(doc, 118, y + 1, d.sex === 'male')
  doc.text('Male', 122, y + 2.5)
  drawCheckbox(doc, 133, y + 1, d.sex === 'female')
  doc.text('Female', 137, y + 2.5)
  y += LINE_HEIGHT + 2

  doc.setFontSize(7)
  doc.text('A.6 Are you part of a special sector? Please tick [√] as many as necessary:', 14, y)
  y += 4
  const special = d.specialSector || []
  drawCheckbox(doc, 14, y + 1.5, special.some((s) => /senior/i.test(s)))
  doc.text('Senior Citizens', 18, y + 2.5)
  drawCheckbox(doc, 42, y + 1.5, special.some((s) => /youth/i.test(s)))
  doc.text('Youth', 46, y + 2.5)
  drawCheckbox(doc, 55, y + 1.5, special.some((s) => /pwd/i.test(s)))
  doc.text('PWD', 59, y + 2.5)
  drawCheckbox(doc, 68, y + 1.5, special.some((s) => /women/i.test(s)))
  doc.text('Women', 72, y + 2.5)
  drawCheckbox(doc, 82, y + 1.5, special.some((s) => /indigenous/i.test(s)))
  doc.text('Indigenous People (please indicate tribe)', 86, y + 2.5)
  drawField(doc, 155, y + 2, d.tribe, 40, 7)
  y += LINE_HEIGHT + 3
  doc.setFontSize(8)

  doc.text('A.7 Civil Status:', 14, y)
  const civilLabels = ['Single', 'Married', 'Widow/er', 'Separated', 'Annulled']
  civilLabels.forEach((s, i) => {
    const x = 14 + i * 22
    const match = d.civilStatus && d.civilStatus.toLowerCase().includes(s.toLowerCase().split('/')[0])
    drawCheckbox(doc, x, y + 1.5, !!match)
    doc.text(truncateToWidth(doc, s, 18, 8), x + 4, y + 2.5)
  })
  if (d.spouseName) {
    y += LINE_HEIGHT
    doc.text('Name of Spouse:', 14, y + 2)
    drawField(doc, 45, y + 2, d.spouseName, 150)
    y += LINE_HEIGHT
  }
  y += LINE_HEIGHT

  doc.setFontSize(7)
  doc.text('A.8 Name of Legal Beneficiary (in case of death benefit, as applicable):', 14, y)
  y += 4
  doc.text('Primary Beneficiary', 14, y + 2.5)
  const prim = beneficiary.primary || {}
  drawField(doc, 45, y + 2, prim.lastName || '', 21, 7)
  drawField(doc, 67, y + 2, prim.firstName || '', 21, 7)
  drawField(doc, 89, y + 2, prim.middleName || '', 21, 7)
  drawField(doc, 111, y + 2, prim.suffix || '', 12, 7)
  drawField(doc, 124, y + 2, prim.relationship || '', 21, 7)
  drawField(doc, 146, y + 2, prim.birthdate ? new Date(prim.birthdate).toLocaleDateString() : '', 21, 7)
  y += LINE_HEIGHT + 1.5
  doc.text('Guardian', 14, y + 2.5)
  const guard = beneficiary.guardian || {}
  drawField(doc, 45, y + 2, guard.lastName || '', 21, 7)
  drawField(doc, 67, y + 2, guard.firstName || '', 21, 7)
  drawField(doc, 89, y + 2, guard.middleName || '', 21, 7)
  drawField(doc, 111, y + 2, guard.suffix || '', 12, 7)
  drawField(doc, 124, y + 2, guard.relationship || '', 21, 7)
  drawField(doc, 146, y + 2, guard.birthdate ? new Date(guard.birthdate).toLocaleDateString() : '', 21, 7)
  y += LINE_HEIGHT + 3
  doc.setFontSize(8)

  doc.setFontSize(7)
  doc.text('A.9 In the event of claim, what is your preferred method of receiving indemnity payment?', 14, y)
  y += 4
  doc.setFontSize(8)
  const ind = d.indemnityOption || ''
  drawCheckbox(doc, 14, y + 1.5, /landbank|dbp/i.test(ind))
  doc.text('Landbank or DBP', 18, y + 2.5)
  drawCheckbox(doc, 48, y + 1.5, /pabahay|express/i.test(ind))
  doc.text('Pabahay Express', 52, y + 2.5)
  drawCheckbox(doc, 78, y + 1.5, /cash/i.test(ind))
  doc.text('Cash', 82, y + 2.5)
  drawCheckbox(doc, 95, y + 1.5, /other/i.test(ind))
  doc.text('Others (Please specify)', 99, y + 2.5)
  drawField(doc, 152, y + 2, d.indemnityOther || '', 44)
  y += LINE_HEIGHT + 4

  y = checkPageBreak(doc, y, 85)

  // Section B: FARM INFORMATION – table with Lot 1, Lot 2, Lot 3 columns (compact)
  doc.setFont('helvetica', 'bold')
  doc.text('B. FARM INFORMATION (Use separate sheet if more than three (3) lots)', 14, y)
  y += 4
  doc.setFont('helvetica', 'normal')

  const colWidth = 62
  const lotFieldWidth = colWidth - 10
  const lotsToRender = (displayLots || []).slice(0, 3)
  const getLotLoc = (lotIdx, key) => {
    const lot = lotsToRender[lotIdx]
    if (!lot) return ''
    const v = lot.farmLocation?.[key]
    if (v != null && v !== '') return v
    if (lotIdx === 0) return address[key] || ''
    return ''
  }
  const getLotBound = (lotIdx, dir) => lotsToRender[lotIdx]?.boundaries?.[dir] ?? ''
  const lotDateStr = (lot, key) => (lot?.[key] ? new Date(lot[key]).toLocaleDateString() : '')
  const lot1Planting = lotDateStr(lotsToRender[0], 'dateOfPlanting') || (rec?.plantingDate ? new Date(rec.plantingDate).toLocaleDateString() : '')
  const lot1Harvest = lotDateStr(lotsToRender[0], 'dateOfHarvest') || (rec?.expectedHarvestDate ? new Date(rec.expectedHarvestDate).toLocaleDateString() : '')
  doc.setFontSize(7)
  const rowH = 4
  const labelW = 52
  const xLot1 = 14 + labelW
  const xLot2 = xLot1 + colWidth
  const xLot3 = xLot2 + colWidth

  y = checkPageBreak(doc, y, 75)
  doc.text('B.1 Farm Location/ASP', 14, y)
  doc.text('Lot 1', xLot1, y)
  doc.text('Lot 2', xLot2, y)
  doc.text('Lot 3', xLot3, y)
  y += 3
  ;['street', 'barangay', 'municipality', 'province'].forEach((key, i) => {
    const label = key === 'street' ? 'a. No. & street/Sitio' : key === 'barangay' ? 'b. Barangay' : key === 'municipality' ? 'c. Municipality/City' : 'd. Province'
    doc.text(label, 14, y + 1.5)
    drawField(doc, xLot1, y + 1.5, getLotLoc(0, key), lotFieldWidth, 7)
    drawField(doc, xLot2, y + 1.5, getLotLoc(1, key), lotFieldWidth, 7)
    drawField(doc, xLot3, y + 1.5, getLotLoc(2, key), lotFieldWidth, 7)
    y += rowH
  })
  y += 1
  doc.text('B.2 Boundaries', 14, y)
  y += 2.5
  ;['north', 'east', 'south', 'west'].forEach((dir) => {
    doc.text(dir.charAt(0).toUpperCase() + dir.slice(1) + ':', 14, y + 1.5)
    drawField(doc, xLot1, y + 1.5, getLotBound(0, dir), lotFieldWidth, 7)
    drawField(doc, xLot2, y + 1.5, getLotBound(1, dir), lotFieldWidth, 7)
    drawField(doc, xLot3, y + 1.5, getLotBound(2, dir), lotFieldWidth, 7)
    y += rowH
  })
  y += 1.5
  doc.text('B.3 GeoRef ID (DA-RBEIA) or Farm ID (PCIC):', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lotsToRender[0]?.geoRefId ?? '', lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotsToRender[1]?.geoRefId ?? '', lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotsToRender[2]?.geoRefId ?? '', lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.4 Variety:', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lotsToRender[0]?.variety ?? '', lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotsToRender[1]?.variety ?? '', lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotsToRender[2]?.variety ?? '', lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.5 Planting Method:', 14, y)
  for (let i = 0; i < 3; i++) {
    const lot = lotsToRender[i] || {}
    const x = i === 0 ? xLot1 : i === 1 ? xLot2 : xLot3
    drawCheckbox(doc, x, y + 1, (lot.plantingMethod || '').toLowerCase().includes('direct'))
    doc.text('DS', x + 4, y + 2.5)
    drawCheckbox(doc, x + 12, y + 1, (lot.plantingMethod || '').toLowerCase().includes('transplant'))
    doc.text('TP', x + 16, y + 2.5)
  }
  y += rowH + 1.5
  doc.text('B.6 Date of Sowing:', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lotDateStr(lotsToRender[0], 'dateOfSowing'), lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotDateStr(lotsToRender[1], 'dateOfSowing'), lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotDateStr(lotsToRender[2], 'dateOfSowing'), lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.7 Date of Planting:', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lot1Planting, lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotDateStr(lotsToRender[1], 'dateOfPlanting'), lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotDateStr(lotsToRender[2], 'dateOfPlanting'), lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.8 Date of Harvest:', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lot1Harvest, lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotDateStr(lotsToRender[1], 'dateOfHarvest'), lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotDateStr(lotsToRender[2], 'dateOfHarvest'), lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.9 Number of Trees/Hills (for HVC only):', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lotsToRender[0]?.numberOfTreesHills ?? '', lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotsToRender[1]?.numberOfTreesHills ?? '', lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotsToRender[2]?.numberOfTreesHills ?? '', lotFieldWidth, 7)
  y += rowH + 1.5
  doc.text('B.10 Land Category:', 14, y)
  for (let i = 0; i < 3; i++) {
    const lot = lotsToRender[i] || {}
    const x = i === 0 ? xLot1 : i === 1 ? xLot2 : xLot3
    drawCheckbox(doc, x, y + 1, (lot.landCategory || '').toLowerCase().includes('irrigat'))
    doc.text('Irrigated', x + 4, y + 2.5)
    drawCheckbox(doc, x + 22, y + 1, (lot.landCategory || '').toLowerCase().includes('non'))
    doc.text('Non-Irrigated', x + 26, y + 2.5)
  }
  y += rowH + 1.5
  doc.text('B.11 Tenurial Status:', 14, y)
  for (let i = 0; i < 3; i++) {
    const lot = lotsToRender[i] || {}
    const x = i === 0 ? xLot1 : i === 1 ? xLot2 : xLot3
    drawCheckbox(doc, x, y + 1, (lot.tenurialStatus || '').toLowerCase().includes('owner'))
    doc.text('Owner', x + 4, y + 2.5)
    drawCheckbox(doc, x + 18, y + 1, (lot.tenurialStatus || '').toLowerCase().includes('lessee'))
    doc.text('Lessee', x + 22, y + 2.5)
  }
  y += rowH + 1.5
  doc.text('B.12 Desired Amount of Cover (Php):', 14, y + 1.5)
  drawField(doc, xLot1, y + 1.5, lotsToRender[0]?.desiredAmountOfCover != null ? String(lotsToRender[0].desiredAmountOfCover) : '', lotFieldWidth, 7)
  drawField(doc, xLot2, y + 1.5, lotsToRender[1]?.desiredAmountOfCover != null ? String(lotsToRender[1].desiredAmountOfCover) : '', lotFieldWidth, 7)
  drawField(doc, xLot3, y + 1.5, lotsToRender[2]?.desiredAmountOfCover != null ? String(lotsToRender[2].desiredAmountOfCover) : '', lotFieldWidth, 7)
  y += rowH + 4
  doc.setFontSize(8)

  y = checkPageBreak(doc, y, 45)

  // Section C: CERTIFICATION AND DATA PRIVACY CONSENT – wrap text and advance y to avoid collision
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('C. CERTIFICATION AND DATA PRIVACY CONSENT STATEMENT', 14, y)
  y += LINE_HEIGHT
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  drawCheckbox(doc, 14, y + 1.5, d.certificationConsent)
  const certText =
    'I hereby certify that the foregoing answers and statements are complete, true and correct. If the application is approved, the insurance shall be deemed based upon the statements contained herein. I further agree that PCIC reserves the right to reject and/or void the insurance if found that there is fraud/misrepresentation on this statement material to the risk. I am hereby consent to the collection, use, processing, and disclosure of my sensitive personal data in accordance with the Data Privacy Act of 2012.'
  const certLastY = doc.text(certText, 18, y + 3, { maxWidth: MARGIN_RIGHT - 18 })
  y = (Array.isArray(certLastY) ? certLastY[certLastY.length - 1] : certLastY) + 4
  drawCheckbox(doc, 14, y + 1.5, d.deedOfAssignmentConsent)
  const deedText =
    'Deed of Assignment for borrowing farmers (if applicable): I hereby assign all or part of my rights, title, and interest in this insurance coverage to the Assignee (Lender) stated above.'
  const deedLastY = doc.text(deedText, 18, y + 3, { maxWidth: MARGIN_RIGHT - 18 })
  y = (Array.isArray(deedLastY) ? deedLastY[deedLastY.length - 1] : deedLastY) + 5
  doc.text('Signature or Thumb Mark over Printed Name: _______________________', 14, y)
  doc.text('Farmer - Applicant', 14, y + 4)
  doc.text('Date:', 128, y + 5)
  drawField(doc, 138, y + 4, d.certificationDate || '', 28)
  y += LINE_HEIGHT + 6

  // Section D: COVERAGE (FOR PCIC USE ONLY) – same labels as View
  doc.setFont('helvetica', 'bold')
  doc.text('D. COVERAGE (FOR PCIC USE ONLY)', 14, y)
  y += LINE_HEIGHT + 1
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('D.1 Source of Premium:', 14, y)
  y += 5
  const sources = d.sourceOfPremium || []
  drawCheckbox(doc, 14, y + 1.5, sources.some((s) => /non-subsidized|regular/i.test(s)))
  doc.text('Non-Subsidized/Regular', 18, y + 3)
  drawCheckbox(doc, 58, y + 1.5, sources.some((s) => /ncfp/i.test(s)))
  doc.text('Subsidized/NCFP - NCFPo No.', 62, y + 3)
  drawField(doc, 105, y + 2, '', 28)
  y += LINE_HEIGHT + 2
  drawCheckbox(doc, 14, y + 1.5, sources.some((s) => /rsbsa/i.test(s)))
  doc.text('Subsidized/RSBSA - Ref. No.', 18, y + 3)
  drawField(doc, 72, y + 2, '', 28)
  drawCheckbox(doc, 105, y + 1.5, sources.some((s) => /other/i.test(s)))
  doc.text('Others', 109, y + 3)
  drawField(doc, 128, y + 2, d.sourceOfPremiumOther || '', 68)
  y += LINE_HEIGHT + 4

  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.text('Generated from AGRI-CHAIN. ' + new Date().toLocaleString(), 105, doc.internal.pageSize.height - 10, { align: 'center' })

  const safeName = (name.firstName + '_' + name.lastName).replace(/\s+/g, '_').slice(0, 30)
  const outFilename = `PCIC_Application_Crop_Insurance_${rec?._id || 'Form'}_${safeName}.pdf`
  doc.save(outFilename)
  return outFilename
}

export default generateCropInsuranceApplicationPDF
