import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate PCIC Insurance Claim Form PDF
 * Matches the official PCIC Form No. 2007-003 format
 */
export const generateClaimPDF = (claim, farmerData = null) => {
  const doc = new jsPDF()
  
  // Helper function to draw checkbox
  const drawCheckbox = (x, y, checked = false) => {
    doc.rect(x, y, 3, 3)
    if (checked) {
      doc.text('✓', x + 0.5, y + 2.3)
    }
  }
  
  // Helper function to draw underlined field
  const drawField = (x, y, value, width = 40) => {
    // Convert value to string and handle null/undefined
    const displayValue = value !== null && value !== undefined ? String(value) : ''
    doc.text(displayValue, x, y)
    doc.line(x, y + 0.5, x + width, y + 0.5)
  }
  
  // Set font
  doc.setFont('helvetica', 'normal')
  
  // HEADER
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PHILIPPINE CROP INSURANCE CORPORATION', 105, 12, { align: 'center' })
  doc.setFontSize(9)
  doc.text('HOME OFFICE, 9th Floor, PAIC Corporate Center, 116 Tordesillas St., Salcedo Village', 105, 17, { align: 'center' })
  doc.text('Makati City, 1227 Metro Manila, Philippines', 105, 21, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('NOTICE OF LOSS / INSURANCE CLAIM FORM', 105, 28, { align: 'center' })
  
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('PCIC Form No. 2007-003', 15, 35)
  
  // Main border
  doc.rect(10, 10, 190, 277)
  
  let y = 40
  
  // SECTION 1: TYPE OF LOSS
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('1. TYPE OF LOSS (Check as applicable)', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  // Row 1 of checkboxes
  const damageType = claim.damageType || claim.type || ''
  drawCheckbox(15, y, damageType.toLowerCase().includes('drought'))
  doc.text('Drought', 20, y + 2.2)
  
  drawCheckbox(45, y, damageType.toLowerCase().includes('flood'))
  doc.text('Flood', 50, y + 2.2)
  
  drawCheckbox(75, y, damageType.toLowerCase().includes('typhoon'))
  doc.text('Typhoon', 80, y + 2.2)
  
  drawCheckbox(105, y, damageType.toLowerCase().includes('pest'))
  doc.text('Pest Infestation', 110, y + 2.2)
  
  drawCheckbox(145, y, damageType.toLowerCase().includes('disease'))
  doc.text('Plant Disease', 150, y + 2.2)
  
  y += 5
  
  // Row 2 of checkboxes
  drawCheckbox(15, y, damageType.toLowerCase().includes('fire'))
  doc.text('Fire', 20, y + 2.2)
  
  drawCheckbox(45, y, damageType.toLowerCase().includes('earthquake'))
  doc.text('Earthquake', 50, y + 2.2)
  
  drawCheckbox(75, y, damageType.toLowerCase().includes('volcanic'))
  doc.text('Volcanic Eruption', 80, y + 2.2)
  
  drawCheckbox(105, y, false)
  doc.text('Others (specify): ', 110, y + 2.2)
  drawField(135, y + 2.2, damageType.toLowerCase().includes('other') ? damageType : '', 50)
  
  y += 8
  
  // SECTION 2: INSURED INFORMATION
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('2. INSURED / CLAIMANT INFORMATION', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  // Name
  const claimantName = claim.name || 
    (farmerData ? `${farmerData.firstName || ''} ${farmerData.middleName || ''} ${farmerData.lastName || ''}`.trim() : '')
  
  doc.text('Name of Insured/Claimant:', 15, y)
  doc.text('(Last Name)', 65, y - 1)
  doc.text('(First Name)', 105, y - 1)
  doc.text('(Middle Name)', 145, y - 1)
  drawField(15, y + 3, claimantName || '', 180)
  y += 8
  
  // Address
  doc.text('Address:', 15, y)
  doc.text('(House No./Street/Barangay)', 30, y - 1)
  drawField(15, y + 3, claim.address || farmerData?.address || '', 90)
  
  doc.text('Municipality/City:', 110, y)
  drawField(110, y + 3, '', 40)
  
  doc.text('Province:', 155, y)
  drawField(155, y + 3, '', 40)
  y += 8
  
  // Contact Details
  doc.text('Telephone/Mobile No.:', 15, y)
  drawField(45, y, claim.contactNum || farmerData?.contactNum || '', 50)
  
  doc.text('Fax No.:', 100, y)
  drawField(115, y, '', 35)
  
  doc.text('E-mail Address:', 155, y)
  drawField(175, y, '', 25)
  y += 6
  
  // SECTION 3: INSURANCE COVERAGE INFORMATION
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('3. INSURANCE COVERAGE INFORMATION', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  // Policy Number
  doc.text('Policy/Certificate No.:', 15, y)
  drawField(45, y, claim.policyNumber || '', 50)
  
  doc.text('Crop Year/Season:', 100, y)
  drawField(130, y, '', 35)
  
  doc.text('Crop Stage:', 170, y)
  drawField(185, y, '', 15)
  y += 6
  
  // Crop and Area
  doc.text('Crop Insured:', 15, y)
  drawField(35, y, claim.crop || claim.cropType || '', 50)
  
  doc.text('Variety:', 90, y)
  drawField(105, y, claim.varietyPlanted || '', 40)
  
  doc.text('Area Insured (ha):', 150, y)
  drawField(175, y, claim.areaInsured || farmerData?.cropArea || '', 25)
  y += 6
  
  // Sum Insured
  doc.text('Sum Insured (PHP):', 15, y)
  drawField(45, y, claim.sumInsured || '', 40)
  
  doc.text('Premium Paid (PHP):', 90, y)
  drawField(120, y, farmerData?.premiumAmount || '', 35)
  
  doc.text('Date:', 160, y)
  drawField(175, y, '', 25)
  y += 8
  
  // SECTION 4: FARM LOCATION
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('4. FARM LOCATION', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  doc.text('Barangay:', 15, y)
  drawField(32, y, '', 50)
  
  doc.text('Municipality/City:', 85, y)
  drawField(115, y, '', 40)
  
  doc.text('Province:', 160, y)
  drawField(175, y, '', 25)
  y += 6
  
  doc.text('Lot/Field No.:', 15, y)
  drawField(35, y, farmerData?.lotNumber || '', 40)
  
  doc.text('Coordinates (if available):', 80, y)
  doc.text('Latitude:', 125, y)
  drawField(140, y, '', 25)
  doc.text('Longitude:', 170, y)
  drawField(185, y, '', 15)
  y += 8
  
  // SECTION 5: LOSS/DAMAGE DETAILS
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('5. LOSS/DAMAGE DETAILS', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  // Date of Loss
  const lossDate = claim.lossDate ? new Date(claim.lossDate).toLocaleDateString() : 
                   new Date(claim.date).toLocaleDateString()
  
  doc.text('Date Loss Occurred:', 15, y)
  drawField(45, y, lossDate, 40)
  
  doc.text('Date Discovered:', 90, y)
  drawField(115, y, lossDate, 40)
  
  doc.text('Date Reported to PCIC:', 160, y)
  drawField(185, y, '', 15)
  y += 6
  
  // Area Affected
  doc.text('Total Area Affected (ha):', 15, y)
  drawField(50, y, claim.areaDamaged || claim.damageArea || '', 35)
  
  doc.text('% of Damage:', 90, y)
  drawField(115, y, String(claim.degreeOfDamage || ''), 20)
  doc.text('%', 137, y)
  
  doc.text('Estimated Yield Loss (bags/ha):', 145, y)
  drawField(185, y, '', 15)
  y += 8
  
  // Cause of Loss/Damage
  doc.text('Cause of Loss/Damage:', 15, y)
  y += 4
  const causeText = String(claim.causeOfLoss || claim.damageType || '')
  const causeLines = doc.splitTextToSize(causeText, 180)
  doc.text(causeLines, 15, y)
  y += Math.max(causeLines.length * 4, 8)
  doc.line(15, y, 195, y)
  y += 6
  
  // Description of Damage
  doc.text('Detailed Description of Damage:', 15, y)
  y += 4
  const description = String(claim.description || claim.damageDescription || '')
  const descLines = doc.splitTextToSize(description, 180)
  doc.text(descLines, 15, y)
  y += Math.max(descLines.length * 4, 12)
  doc.line(15, y, 195, y)
  doc.line(15, y + 4, 195, y + 4)
  y += 10
  
  // SECTION 6: PREVIOUS CLAIMS
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('6. PREVIOUS CLAIMS (if any)', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  doc.text('Have you filed any previous claims for this crop year?', 15, y)
  drawCheckbox(95, y - 1, false)
  doc.text('Yes', 100, y)
  drawCheckbox(115, y - 1, true)
  doc.text('No', 120, y)
  y += 5
  
  doc.text('If YES, provide details:', 15, y)
  drawField(50, y, '', 145)
  y += 8
  
  // SECTION 7: SUPPORTING DOCUMENTS
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('7. SUPPORTING DOCUMENTS (Please check documents attached)', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  const hasPhotos = claim.photos && claim.photos.length > 0
  
  drawCheckbox(15, y, hasPhotos)
  doc.text('Photographs of damaged crop', 20, y + 2.2)
  
  drawCheckbox(80, y, claim.inspectionReport)
  doc.text('Farm Inspection Report', 85, y + 2.2)
  
  drawCheckbox(140, y, false)
  doc.text('Weather Report', 145, y + 2.2)
  y += 5
  
  drawCheckbox(15, y, false)
  doc.text('Barangay Certification', 20, y + 2.2)
  
  drawCheckbox(80, y, false)
  doc.text('Police Report (if applicable)', 85, y + 2.2)
  
  drawCheckbox(140, y, false)
  doc.text('Others: __________', 145, y + 2.2)
  y += 10
  
  // SECTION 8: CLAIMANT'S DECLARATION
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('8. CLAIMANT\'S DECLARATION', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  
  const declaration = String('I hereby declare that the foregoing information are true and correct to the best of my knowledge and belief. I understand that any false statement may result in the denial of this claim and/or cancellation of my insurance policy.')
  const declLines = doc.splitTextToSize(declaration, 180)
  doc.text(declLines, 15, y)
  y += declLines.length * 3 + 8
  
  // Signature blocks
  doc.setFontSize(7)
  doc.text('________________________________', 15, y)
  doc.text('Signature over Printed Name of Insured', 15, y + 3)
  
  doc.text('________________________________', 115, y)
  doc.text('Date Signed', 115, y + 3)
  y += 12
  
  // SECTION 9: FOR PCIC USE ONLY
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('9. FOR PCIC USE ONLY', 15, y)
  y += 5
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  doc.text('Date Claim Received:', 15, y)
  drawField(45, y, new Date(claim.date || claim.createdAt).toLocaleDateString(), 40)
  
  doc.text('Received by:', 90, y)
  drawField(110, y, String(claim.reviewedBy || ''), 45)
  
  doc.text('Claim No.:', 160, y)
  drawField(175, y, String(claim.claimNumber || claim._id?.slice(-8) || ''), 25)
  y += 6
  
  doc.text('Date Inspected:', 15, y)
  drawField(45, y, '', 40)
  
  doc.text('Inspector:', 90, y)
  drawField(110, y, '', 45)
  
  doc.text('Status:', 160, y)
  drawField(175, y, String(claim.status || '').toUpperCase(), 25)
  y += 8
  
  // Assessment
  doc.text('Assessment/Remarks:', 15, y)
  y += 4
  const feedback = String(claim.adminFeedback || '')
  if (feedback && feedback.trim()) {
    const feedbackLines = doc.splitTextToSize(feedback, 180)
    doc.text(feedbackLines, 15, y)
    y += feedbackLines.length * 4 + 4
  } else {
    doc.line(15, y, 195, y)
    y += 4
    doc.line(15, y, 195, y)
    y += 4
  }
  y += 2
  
  // Compensation
  doc.text('Approved Indemnity/Compensation:', 15, y)
  doc.text('PHP', 60, y)
  drawField(68, y, claim.compensation ? String(claim.compensation.toLocaleString()) : '', 40)
  y += 8
  
  // Approval signatures
  doc.text('Approved by:', 15, y)
  y += 4
  doc.text('________________________________', 15, y)
  doc.text('Claims Officer', 15, y + 3)
  doc.text('Date: ___________', 15, y + 6)
  
  doc.text('________________________________', 115, y)
  doc.text('Branch Manager', 115, y + 3)
  doc.text('Date: ___________', 115, y + 6)
  
  // Footer
  doc.setFontSize(6)
  doc.setFont('helvetica', 'italic')
  doc.text('This is a computer-generated document from the Department of Agriculture - AGRI-CHAIN System', 105, 283, { align: 'center' })
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 286, { align: 'center' })
  doc.text('Page 1 of 1', 195, 285, { align: 'right' })
  
  // Generate filename
  const claimNum = String(claim.claimNumber || claim._id?.slice(-8) || 'Form')
  const safeName = String(claimantName || 'Claimant').replace(/\s+/g, '_')
  const filename = `PCIC_Claim_${claimNum}_${safeName}.pdf`
  
  // Save the PDF
  doc.save(filename)
  
  return filename
}

export default generateClaimPDF
