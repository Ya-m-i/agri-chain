import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Generate Insurance Claim Form PDF
 * Based on the PCIC insurance claim form format
 */
export const generateClaimPDF = (claim, farmerData = null) => {
  const doc = new jsPDF()
  
  // Add header
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PHILIPPINE CROP INSURANCE CORPORATION', 105, 15, { align: 'center' })
  doc.text('INSURANCE CLAIM FORM', 105, 20, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('PCIC Form No. 2007-003', 15, 28)
  doc.text(`Claim Number: ${claim.claimNumber || claim._id?.slice(-8) || 'N/A'}`, 150, 28)
  
  // Draw border
  doc.rect(10, 10, 190, 277)
  
  let yPosition = 35
  
  // SECTION A: CLAIMANT INFORMATION
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('A. CLAIMANT INFORMATION', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  
  // Claimant name and details
  const claimantName = claim.name || 
    (farmerData ? `${farmerData.firstName || ''} ${farmerData.middleName || ''} ${farmerData.lastName || ''}`.trim() : 'N/A')
  
  doc.text(`Name of Insured/Claimant: ${claimantName}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Address: ${claim.address || farmerData?.address || 'N/A'}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Contact Number: ${claim.contactNum || farmerData?.contactNum || 'N/A'}`, 15, yPosition)
  doc.text(`Date Filed: ${new Date(claim.date || claim.createdAt).toLocaleDateString()}`, 120, yPosition)
  yPosition += 8
  
  // SECTION B: FARM AND CROP INFORMATION
  doc.setFont('helvetica', 'bold')
  doc.text('B. FARM AND CROP INFORMATION', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Crop Type: ${claim.crop || claim.cropType || 'N/A'}`, 15, yPosition)
  doc.text(`Farm Area: ${claim.farmArea || claim.areaInsured || farmerData?.cropArea || 'N/A'} ha`, 120, yPosition)
  yPosition += 5
  
  doc.text(`Farm Location/Address: ${claim.farmLocation || claim.address || 'N/A'}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Lot Number: ${farmerData?.lotNumber || 'N/A'}`, 15, yPosition)
  doc.text(`Insurance Period: ${farmerData?.periodFrom || 'N/A'} to ${farmerData?.periodTo || 'N/A'}`, 120, yPosition)
  yPosition += 8
  
  // SECTION C: LOSS/DAMAGE INFORMATION
  doc.setFont('helvetica', 'bold')
  doc.text('C. LOSS/DAMAGE INFORMATION', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Type of Damage/Loss: ${claim.damageType || claim.type || 'N/A'}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Date of Loss: ${claim.lossDate ? new Date(claim.lossDate).toLocaleDateString() : new Date(claim.date).toLocaleDateString()}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Cause of Loss: ${claim.causeOfLoss || claim.damageType || 'N/A'}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Degree of Damage: ${claim.degreeOfDamage || 'N/A'}%`, 15, yPosition)
  doc.text(`Area Damaged: ${claim.areaDamaged || claim.damageArea || 'N/A'} ha`, 120, yPosition)
  yPosition += 8
  
  // SECTION D: DESCRIPTION OF DAMAGE
  doc.setFont('helvetica', 'bold')
  doc.text('D. DESCRIPTION OF DAMAGE', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  const description = claim.description || claim.damageDescription || 'No description provided'
  const descLines = doc.splitTextToSize(description, 180)
  doc.text(descLines, 15, yPosition)
  yPosition += (descLines.length * 5) + 5
  
  // SECTION E: SUPPORTING DOCUMENTS
  doc.setFont('helvetica', 'bold')
  doc.text('E. SUPPORTING DOCUMENTS', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  const hasPhotos = claim.photos && claim.photos.length > 0
  doc.text(`☑ Damage Photos: ${hasPhotos ? 'Attached' : 'Not Provided'}`, 15, yPosition)
  yPosition += 5
  doc.text(`☑ Farm Inspection Report: ${claim.inspectionReport ? 'Available' : 'Pending'}`, 15, yPosition)
  yPosition += 5
  doc.text(`☑ Police/Barangay Report: ${claim.officialReport ? 'Available' : 'N/A'}`, 15, yPosition)
  yPosition += 8
  
  // SECTION F: CLAIM STATUS
  doc.setFont('helvetica', 'bold')
  doc.text('F. CLAIM STATUS AND ASSESSMENT', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Status: ${(claim.status || 'pending').toUpperCase()}`, 15, yPosition)
  yPosition += 5
  
  if (claim.compensation) {
    doc.text(`Approved Compensation: PHP ${claim.compensation.toLocaleString()}`, 15, yPosition)
    yPosition += 5
  }
  
  if (claim.status === 'approved' && claim.approvedDate) {
    doc.text(`Approval Date: ${new Date(claim.approvedDate).toLocaleDateString()}`, 15, yPosition)
    yPosition += 5
  }
  
  if (claim.status === 'rejected' && claim.rejectionReason) {
    doc.text(`Rejection Reason: ${claim.rejectionReason}`, 15, yPosition)
    yPosition += 5
  }
  
  if (claim.adminFeedback) {
    doc.text(`Admin Feedback/Notes:`, 15, yPosition)
    yPosition += 5
    const feedbackLines = doc.splitTextToSize(claim.adminFeedback, 180)
    doc.text(feedbackLines, 15, yPosition)
    yPosition += (feedbackLines.length * 5) + 5
  }
  
  yPosition += 3
  
  // SECTION G: PROCESSING INFORMATION
  doc.setFont('helvetica', 'bold')
  doc.text('G. PROCESSING INFORMATION', 15, yPosition)
  yPosition += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Claim Received: ${new Date(claim.date || claim.createdAt).toLocaleDateString()}`, 15, yPosition)
  yPosition += 5
  
  if (claim.reviewDate) {
    doc.text(`Reviewed On: ${new Date(claim.reviewDate).toLocaleDateString()}`, 15, yPosition)
    yPosition += 5
  }
  
  doc.text(`Reviewed By: ${claim.reviewedBy || 'Department of Agriculture Staff'}`, 15, yPosition)
  yPosition += 5
  
  doc.text(`Insurance Agency: ${farmerData?.agency || 'PCIC'}`, 15, yPosition)
  yPosition += 10
  
  // SIGNATURES SECTION
  doc.setFont('helvetica', 'bold')
  doc.text('H. CERTIFICATION AND SIGNATURES', 15, yPosition)
  yPosition += 10
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  
  // Claimant signature
  doc.text('_______________________________', 15, yPosition)
  doc.text('Signature over Printed Name', 15, yPosition + 3)
  doc.text('Insured/Claimant', 15, yPosition + 6)
  doc.text(`Date: _______________`, 15, yPosition + 9)
  
  // Witness signature
  doc.text('_______________________________', 110, yPosition)
  doc.text('Signature over Printed Name', 110, yPosition + 3)
  doc.text('Witness', 110, yPosition + 6)
  doc.text(`Date: _______________`, 110, yPosition + 9)
  
  yPosition += 18
  
  // Officer signature
  doc.text('_______________________________', 15, yPosition)
  doc.text('Signature over Printed Name', 15, yPosition + 3)
  doc.text('DA/LGU Officer', 15, yPosition + 6)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, yPosition + 9)
  
  // Manager signature
  doc.text('_______________________________', 110, yPosition)
  doc.text('Signature over Printed Name', 110, yPosition + 3)
  doc.text('PCIC Branch Manager', 110, yPosition + 6)
  doc.text(`Date: _______________`, 110, yPosition + 9)
  
  // Footer
  doc.setFontSize(6)
  doc.text('This is a computer-generated document from the Department of Agriculture - AGRI-CHAIN System', 105, 285, { align: 'center' })
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 288, { align: 'center' })
  
  // Add page number
  doc.text('Page 1 of 1', 195, 285, { align: 'right' })
  
  // Generate filename
  const filename = `Insurance_Claim_${claim.claimNumber || claim._id?.slice(-8) || 'Form'}_${claimantName.replace(/\s+/g, '_')}.pdf`
  
  // Save the PDF
  doc.save(filename)
  
  return filename
}

export default generateClaimPDF

