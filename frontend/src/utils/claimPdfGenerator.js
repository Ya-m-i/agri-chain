import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate PCIC CLAIM FOR INDEMNITY (PAGHAHABOL BAYAD) PDF
 * Matches the official PCIC Regional Office form template
 * All data comes from the claim (filed via farmer File New Claim / Claim for Indemnity form)
 */
export const generateClaimPDF = (claim, farmerData = null) => {
  const doc = new jsPDF()
  doc.setFont('helvetica', 'normal')

  const drawField = (x, y, value, width = 50) => {
    const displayValue = value !== null && value !== undefined ? String(value) : ''
    doc.text(displayValue, x, y)
    doc.line(x, y + 0.5, x + width, y + 0.5)
  }

  const drawCheckbox = (x, y, checked) => {
    doc.rect(x, y, 3, 3)
    if (checked) doc.text('x', x + 0.8, y + 2.2)
  }

  let y = 14

  // TO / Header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('TO : The Chief CAD PCIC-RO XI', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.text('PHILIPPINE CROP INSURANCE CORPORATION', 105, y, { align: 'center' })
  y += 4
  doc.text('Regional Office No. X', 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(11)
  doc.text('CLAIM FOR INDEMNITY (PAGHAHABOL BAYAD)', 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Please send your team of Adjusters to assess damage of my insured crop.', 105, y, { align: 'center' })
  y += 4
  doc.text('(Mangyaring magpadala kayo ng tagapag-imbistige upang tasahin ang naging pinsala ng aking pananim)', 105, y, { align: 'center' })
  y += 4
  doc.text('Hereunder are the basic information needed by your office. (Narito ang mga kinakailangang tala ng inyong tanggapon)', 105, y, { align: 'center' })
  y += 10

  // I. BASIC INFORMATION (MGA PANGUNAHING IMPORMASYON)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('I. BASIC INFORMATION (MGA PANGUNAHING IMPORMASYON)', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  const name = claim.name || (farmerData ? `${farmerData.firstName || ''} ${farmerData.middleName || ''} ${farmerData.lastName || ''}`.trim() : '')
  const address = claim.address || farmerData?.address || ''
  const phone = claim.phone || farmerData?.contactNum || ''
  const farmerLocation = claim.farmerLocation || claim.address || farmerData?.address || ''
  const crop = claim.crop || ''
  const areaInsured = claim.areaInsured != null ? String(claim.areaInsured) : ''
  const varietyPlanted = claim.varietyPlanted || ''
  const plantingDate = claim.plantingDate ? new Date(claim.plantingDate).toLocaleDateString() : ''
  const cicNumber = claim.cicNumber || ''
  const underwriter = claim.underwriter || ''
  const programList = claim.program && claim.program.length ? claim.program : []
  const otherProgram = claim.otherProgramText || ''

  doc.text('1. Name of Farmer-Assured (Pangalan ng Magsasaka):', 14, y)
  drawField(14, y + 3, name, 180)
  y += 7
  doc.text('2. Address (Tirahan):', 14, y)
  drawField(14, y + 3, address, 180)
  y += 7
  doc.text('3. Cell Phone Number (Numero ng Telepono):', 14, y)
  drawField(14, y + 3, phone, 80)
  y += 7
  doc.text('4. Location of Farm (Lugar ng Saka):', 14, y)
  drawField(14, y + 3, farmerLocation, 180)
  y += 7
  doc.text('5. Insured Crops (Pananim na ipinaseguro):', 14, y)
  const isPalay = /palay|rice/i.test(crop)
  const isCorn = /corn|maize/i.test(crop)
  drawCheckbox(14, y + 1.5, isPalay)
  doc.text('Palay', 18, y + 3)
  drawCheckbox(30, y + 1.5, isCorn)
  doc.text('Corn', 34, y + 3)
  drawField(50, y + 3, !isPalay && !isCorn ? crop : '', 140)
  y += 7
  doc.text('6. Area Insured (Luwang/Sukat ng Bukid na ipinaseguro):', 14, y)
  drawField(75, y, areaInsured, 25)
  doc.text('ha. (ektorya)', 102, y)
  y += 6
  doc.text('7. Variety Planted (Binhing Itinanim):', 14, y)
  drawField(14, y + 3, varietyPlanted, 180)
  y += 7
  doc.text('8. Actual Date of Planting (Aktwal na Petsa ng Pagkakatanim):', 14, y)
  drawField(14, y + 3, plantingDate, 60)
  doc.text('DS', 78, y + 3)
  doc.rect(82, y + 1, 5, 4)
  doc.text('TP', 88, y + 3)
  doc.rect(92, y + 1, 5, 4)
  y += 7
  doc.text('9. CIC Number (Numero ng CIC):', 14, y)
  drawField(14, y + 3, cicNumber, 80)
  y += 7
  doc.text('10. Underwriter/Cooperative (Pangalan ng Ahente o Kooperatiba):', 14, y)
  drawField(14, y + 3, underwriter, 180)
  y += 7
  doc.text('11. Program (Programa):', 14, y)
  const programs = ['Regular', 'Sikat Sal', 'RSBSA', 'APCP-CAP-PBD', 'Punla', 'Cooperative Rice Farm']
  let xProg = 14
  programs.forEach((p) => {
    const checked = programList.some(pr => String(pr).toLowerCase().includes(p.toLowerCase().replace(/\s/g, '')))
    drawCheckbox(xProg, y + 1.5, checked)
    doc.text(p, xProg + 4, y + 3)
    xProg += 28
  })
  y += 5
  doc.text('( ) Others:', 14, y)
  drawField(32, y, otherProgram, 80)
  y += 10

  // II. DAMAGE INDICATORS (MGA IMPORMASYON TUNGKOL SA PINSALA)
  doc.setFont('helvetica', 'bold')
  doc.text('II. DAMAGE INDICATORS (MGA IMPORMASYON TUNGKOL SA PINSALA)', 14, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  const damageType = claim.damageType || ''
  const lossDate = claim.lossDate ? new Date(claim.lossDate).toLocaleDateString() : ''
  const ageStage = claim.ageStage || ''
  const areaDamaged = claim.areaDamaged != null ? String(claim.areaDamaged) : ''
  const degreeOfDamage = claim.degreeOfDamage != null ? String(claim.degreeOfDamage) : ''
  const expectedHarvest = claim.expectedHarvest || ''

  doc.text('1. Cause of Loss (Sanhi ng Pinsala):', 14, y)
  drawField(14, y + 3, damageType, 180)
  y += 7
  doc.text('2. Date of Loss Occurrence (Petsa ng Pinsala):', 14, y)
  drawField(14, y + 3, lossDate, 80)
  y += 7
  doc.text('3. Age/Stage of cultivation at time of loss (Edad ng Pananim ng Mapinsala):', 14, y)
  drawField(14, y + 3, ageStage, 180)
  y += 7
  doc.text('4. Area Damaged (Luwang o sukat ng Napinsalang Bahagi):', 14, y)
  drawField(75, y, areaDamaged, 25)
  doc.text('ha. (ektorya)', 102, y)
  y += 6
  doc.text('5. Extent/Degree of Damage (Tindi o Porsyento ng Pinsala):', 14, y)
  drawField(75, y, degreeOfDamage, 20)
  doc.text('% (porsyento)', 98, y)
  y += 6
  doc.text('6. Expected Date of Harvest (Tinatayang Petsa ng Pagpapagapas o Pag-ani):', 14, y)
  drawField(14, y + 3, expectedHarvest, 180)
  y += 10

  // III. LOCATION SKETCH PLAN (LSP)
  doc.setFont('helvetica', 'bold')
  doc.text('III. LOCATION SKETCH PLAN OF DAMAGED CROPS (LSP) (KROKIS NG BUKID NG MGA NASALANTANG NAKASEGURONG PANANIM)', 14, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Isulat ang pangalan ng may-ari/nagsasaka sa karatig na sakahan', 14, y)
  y += 6

  const lotBoundaries = claim.lotBoundaries || {}
  for (let lot = 1; lot <= 4; lot++) {
    const lb = lotBoundaries[lot] || {}
    doc.text(`Lot ${lot}`, 14, y)
    doc.line(24, y - 2.5, 45, y - 2.5)
    doc.text('ha.', 48, y)
    doc.text('North (Hilaga):', 60, y)
    drawField(78, y - 0.5, lb.north || '', 35)
    doc.text('South (Timog):', 118, y)
    drawField(136, y - 0.5, lb.south || '', 35)
    doc.text('East (Silangan):', 176, y)
    drawField(192, y - 0.5, lb.east || '', 15)
    y += 5
    doc.text('West (Kanluran):', 14, y)
    drawField(38, y - 0.5, lb.west || '', 50)
    y += 6
  }
  y += 4

  // Signature
  doc.setFontSize(8)
  doc.text('Thank You. Very truly yours,', 14, y)
  y += 6
  doc.line(14, y, 80, y)
  y += 4
  doc.setFontSize(7)
  doc.text('Signature over Printed Name of Assured Farmer-Claimant (Lagda sa Ibabaw ng Pangalan ng Magsasakang Nakaseguro)', 14, y)
  y += 10

  // PCIC use / claim info
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Claim No.:', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(String(claim.claimNumber || claim._id?.toString().slice(-8) || ''), 28, y)
  doc.text('Date Filed:', 80, y)
  doc.text(claim.date ? new Date(claim.date).toLocaleDateString() : '', 95, y)
  doc.text('Status:', 140, y)
  doc.text(String(claim.status || 'pending').toUpperCase(), 155, y)
  y += 6
  if (claim.compensation != null) {
    doc.text('Approved Indemnity/Compensation: PHP ' + Number(claim.compensation).toLocaleString(), 14, y)
    y += 5
  }
  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.text('Computer-generated from AGRI-CHAIN. Generated: ' + new Date().toLocaleString(), 105, 288, { align: 'center' })

  const claimNum = String(claim.claimNumber || claim._id?.toString().slice(-8) || 'Form')
  const safeName = String(name || 'Claimant').replace(/\s+/g, '_').slice(0, 30)
  const outFilename = `PCIC_Claim_Indemnity_${claimNum}_${safeName}.pdf`
  doc.save(outFilename)
  return outFilename
}

export default generateClaimPDF
