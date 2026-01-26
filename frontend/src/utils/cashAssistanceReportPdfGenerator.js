import { Canvg } from 'canvg'

/**
 * Generate Cash Assistance Claims Report PDF
 * Includes charts, data analysis, and statistics
 */
export const generateCashAssistanceReportPDF = async ({
  claims = [],
  chartRefs = {}
}) => {
  try {
    // Use dynamic imports to avoid build issues
    const jsPDFModule = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDFModule.jsPDF('landscape', 'mm', 'a4') // Landscape orientation for better chart display
    
    let yPosition = 15
    
    // ============================================
    // TITLE SECTION
    // ============================================
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Cash Assistance Claims Data Analysis Report', 148, yPosition, { align: 'center' })
    
    yPosition += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 148, yPosition, { align: 'center' })
    
    yPosition += 15
    
    // ============================================
    // SUMMARY STATISTICS SECTION
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary Statistics', 20, yPosition)
    
    yPosition += 8
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    // Calculate statistics
    const totalClaims = claims.length || 0
    const pendingClaims = claims.filter(c => c.status === 'pending').length
    const approvedClaims = claims.filter(c => c.status === 'approved').length
    const rejectedClaims = claims.filter(c => c.status === 'rejected').length
    
    const pendingPercentage = totalClaims > 0 ? ((pendingClaims / totalClaims) * 100).toFixed(1) : '0.0'
    const approvedPercentage = totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : '0.0'
    const rejectedPercentage = totalClaims > 0 ? ((rejectedClaims / totalClaims) * 100).toFixed(1) : '0.0'
    
    // Summary box
    const summaryData = [
      ['Total Claims', totalClaims.toString()],
      ['Pending Claims', `${pendingClaims} (${pendingPercentage}%)`],
      ['Approved Claims', `${approvedClaims} (${approvedPercentage}%)`],
      ['Rejected Claims', `${rejectedClaims} (${rejectedPercentage}%)`],
    ]
    
    doc.autoTable({
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [132, 204, 22], textColor: [0, 0, 0], fontStyle: 'bold' },
      bodyStyles: { textColor: [0, 0, 0] },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 20, right: 20 }
    })
    
    yPosition = doc.lastAutoTable.finalY + 15
    
    // ============================================
    // MONTHLY STATUS COMPARISON DATA TABLE
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Monthly Status Comparison (Current Year)', 20, yPosition)
    
    yPosition += 8
    
    // Generate monthly data for the current year
    const currentYear = new Date().getFullYear()
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const monthlyData = monthNames.map((month, index) => {
      const monthClaims = claims.filter(claim => {
        const claimDate = new Date(claim.date)
        return claimDate.getFullYear() === currentYear && claimDate.getMonth() === index
      })
      
      return {
        month: month,
        pending: monthClaims.filter(claim => claim.status === 'pending').length,
        approved: monthClaims.filter(claim => claim.status === 'approved').length,
        rejected: monthClaims.filter(claim => claim.status === 'rejected').length,
        total: monthClaims.length
      }
    })
    
    const monthlyTableData = monthlyData.map(item => [
      item.month,
      item.pending.toString(),
      item.approved.toString(),
      item.rejected.toString(),
      item.total.toString()
    ])
    
    if (monthlyTableData.length > 0) {
      doc.autoTable({
        startY: yPosition,
        head: [['Month', 'Pending', 'Approved', 'Rejected', 'Total']],
        body: monthlyTableData,
        theme: 'grid',
        headStyles: { fillColor: [132, 204, 22], textColor: [0, 0, 0], fontStyle: 'bold' },
        bodyStyles: { textColor: [0, 0, 0] },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 15
      
      // Add analysis
      const maxMonth = monthlyData.reduce((max, item) => item.total > max.total ? item : max, monthlyData[0])
      const avgMonthlyClaims = Math.round(totalClaims / 12)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Peak Month: ${maxMonth.month} (${maxMonth.total} claims)`, 20, yPosition)
      
      yPosition += 6
      doc.text(`Average Claims per Month: ${avgMonthlyClaims} claims`, 20, yPosition)
      
      yPosition += 10
    }
    
    // Check if we need a new page
    if (yPosition > 150) {
      doc.addPage('landscape')
      yPosition = 15
    }
    
    // ============================================
    // CLAIMS DISTRIBUTION ANALYSIS
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Claims Distribution Analysis', 20, yPosition)
    
    yPosition += 8
    
    const distributionData = [
      ['Status', 'Count', 'Percentage'],
      ['Pending', pendingClaims.toString(), `${pendingPercentage}%`],
      ['Approved', approvedClaims.toString(), `${approvedPercentage}%`],
      ['Rejected', rejectedClaims.toString(), `${rejectedPercentage}%`],
      ['Total', totalClaims.toString(), '100.0%']
    ]
    
    doc.autoTable({
      startY: yPosition,
      head: [distributionData[0]],
      body: distributionData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [132, 204, 22], textColor: [0, 0, 0], fontStyle: 'bold' },
      bodyStyles: { textColor: [0, 0, 0] },
      styles: { fontSize: 10, cellPadding: 3 },
      margin: { left: 20, right: 20 }
    })
    
    yPosition = doc.lastAutoTable.finalY + 15
    
    // Add top status analysis
    const topStatus = pendingClaims >= approvedClaims && pendingClaims >= rejectedClaims 
      ? 'Pending' 
      : approvedClaims >= rejectedClaims 
        ? 'Approved' 
        : 'Rejected'
    const topStatusCount = topStatus === 'Pending' ? pendingClaims : topStatus === 'Approved' ? approvedClaims : rejectedClaims
    const topStatusPercentage = totalClaims > 0 
      ? ((topStatusCount / totalClaims) * 100).toFixed(1) 
      : '0.0'
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Most Common Status: ${topStatus} (${topStatusCount} claims, ${topStatusPercentage}%)`, 20, yPosition)
    
    yPosition += 10
    
    // ============================================
    // CHART VISUALIZATIONS
    // ============================================
    // Add new page for charts
    doc.addPage('landscape')
    yPosition = 15
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Chart Visualizations', 148, yPosition, { align: 'center' })
    
    yPosition += 15
    
    // Try to add chart images if provided
    if (chartRefs.barChartRef) {
      try {
        const barChartImg = await captureChartAsImage(chartRefs.barChartRef)
        if (barChartImg) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Status Comparison Over Time', 148, yPosition, { align: 'center' })
          yPosition += 5
          
          const imgWidth = 220
          const imgHeight = 120
          const xPos = (297 - imgWidth) / 2 // Center horizontally in landscape
          doc.addImage(barChartImg, 'PNG', xPos, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 15
        }
      } catch (error) {
        console.warn('Could not capture bar chart:', error)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('Status comparison chart visualization could not be included', 148, yPosition, { align: 'center' })
        yPosition += 10
      }
    }
    
    // Check if we need a new page for the second chart
    if (yPosition > 150) {
      doc.addPage('landscape')
      yPosition = 15
    }
    
    // Add Doughnut Chart
    if (chartRefs.doughnutChartRef) {
      try {
        const doughnutChartImg = await captureChartAsImage(chartRefs.doughnutChartRef)
        if (doughnutChartImg) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Claims Distribution', 148, yPosition, { align: 'center' })
          yPosition += 5
          
          const imgWidth = 150
          const imgHeight = 150
          const xPos = (297 - imgWidth) / 2 // Center horizontally in landscape
          doc.addImage(doughnutChartImg, 'PNG', xPos, yPosition, imgWidth, imgHeight)
        }
      } catch (error) {
        console.warn('Could not capture doughnut chart:', error)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('Claims distribution chart visualization could not be included', 148, yPosition, { align: 'center' })
      }
    }
    
    // ============================================
    // FOOTER
    // ============================================
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Page ${i} of ${pageCount} - Cash Assistance Claims Data Analysis Report`,
        148,
        200,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    const fileName = `cash-assistance-claims-report-${new Date().getTime()}.pdf`
    doc.save(fileName)
    
    return true
  } catch (error) {
    console.error('Error generating PDF report:', error)
    throw new Error('Failed to generate PDF report. Please try again.')
  }
}

/**
 * Capture chart as image
 * Supports both Chart.js canvas and Recharts SVG
 */
const captureChartAsImage = async (chartRef) => {
  if (!chartRef || !chartRef.current) {
    return null
  }
  
  try {
    const chartElement = chartRef.current
    
    // For Chart.js (canvas element) - direct access
    if (chartElement.tagName === 'CANVAS') {
      return chartElement.toDataURL('image/png')
    }
    
    // Try to find canvas within the element (Chart.js)
    const canvas = chartElement.querySelector('canvas')
    if (canvas) {
      return canvas.toDataURL('image/png')
    }
    
    // For Recharts (SVG element) - use canvg to convert SVG to canvas
    const svg = chartElement.querySelector('svg')
    if (svg) {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svg.cloneNode(true)
      
      // Get computed styles and apply them
      const computedStyle = window.getComputedStyle(svg)
      const width = parseFloat(computedStyle.width) || svg.clientWidth || 800
      const height = parseFloat(computedStyle.height) || svg.clientHeight || 400
      
      // Create a canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      // Serialize SVG
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      
      // Use canvg to render SVG to canvas
      const v = Canvg.fromString(ctx, svgData)
      await v.render()
      
      return canvas.toDataURL('image/png')
    }
    
    // Fallback: try to find SVG within the element
    if (chartElement.querySelector && chartElement.querySelector('svg')) {
      const svg = chartElement.querySelector('svg')
      const clonedSvg = svg.cloneNode(true)
      
      const computedStyle = window.getComputedStyle(svg)
      const width = parseFloat(computedStyle.width) || svg.clientWidth || 800
      const height = parseFloat(computedStyle.height) || svg.clientHeight || 400
      
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg)
      const v = Canvg.fromString(ctx, svgData)
      await v.render()
      
      return canvas.toDataURL('image/png')
    }
    
    return null
  } catch (error) {
    console.error('Error capturing chart:', error)
    return null
  }
}
