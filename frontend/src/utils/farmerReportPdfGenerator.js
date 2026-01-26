import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Canvg } from 'canvg'

/**
 * Generate Farmer Registration Report PDF
 * Includes charts, data analysis, and statistics
 */
export const generateFarmerRegistrationReportPDF = async ({
  totalFarmers,
  timeBasedData,
  cropTypeDistribution,
  selectedYear,
  timePeriod,
  chartRefs = {}
}) => {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4') // Landscape orientation for better chart display
    
    let yPosition = 15
    
    // ============================================
    // TITLE SECTION
    // ============================================
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Farmer Registration Data Analysis Report', 148, yPosition, { align: 'center' })
    
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
    const totalRegistered = totalFarmers || 0
    const newRegistrations = timeBasedData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0
    const totalCropTypes = Object.keys(cropTypeDistribution || {}).length
    const totalInsuredCrops = Object.values(cropTypeDistribution || {}).reduce((sum, val) => sum + (val || 0), 0)
    
    // Summary box
    const summaryData = [
      ['Total Registered Farmers', totalRegistered.toString()],
      ['New Registrations (Selected Period)', newRegistrations.toString()],
      ['Total Crop Types', totalCropTypes.toString()],
      ['Total Insured Crop Records', totalInsuredCrops.toString()],
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
    // REGISTRATION OVER TIME DATA TABLE
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Registration Data - ${timePeriod === 'monthly' ? 'Monthly' : 'Quarterly'} (${selectedYear})`, 20, yPosition)
    
    yPosition += 8
    
    // Prepare time-based data table
    const timeTableData = timeBasedData?.map(item => [
      item.period || '',
      item.count?.toString() || '0',
      item.cumulative?.toString() || '0'
    ]) || []
    
    if (timeTableData.length > 0) {
      doc.autoTable({
        startY: yPosition,
        head: [['Period', 'New Registrations', 'Cumulative Total']],
        body: timeTableData,
        theme: 'grid',
        headStyles: { fillColor: [132, 204, 22], textColor: [0, 0, 0], fontStyle: 'bold' },
        bodyStyles: { textColor: [0, 0, 0] },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 15
      
      // Add percentage analysis
      const maxNewRegistrations = Math.max(...timeTableData.map(row => parseInt(row[1]) || 0))
      const periodWithMaxRegistrations = timeTableData.find(row => parseInt(row[1]) === maxNewRegistrations)?.[0] || 'N/A'
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text(`Peak Registration Period: ${periodWithMaxRegistrations} (${maxNewRegistrations} new farmers)`, 20, yPosition)
      
      if (timeTableData.length > 0) {
        const avgRegistrations = Math.round(newRegistrations / timeTableData.length)
        yPosition += 6
        doc.text(`Average Registrations per Period: ${avgRegistrations} farmers`, 20, yPosition)
      }
      
      yPosition += 10
    }
    
    // Check if we need a new page
    if (yPosition > 150) {
      doc.addPage('landscape')
      yPosition = 15
    }
    
    // ============================================
    // CROP TYPE DISTRIBUTION DATA TABLE
    // ============================================
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Crop Type Distribution Analysis', 20, yPosition)
    
    yPosition += 8
    
    // Prepare crop type distribution table
    const cropEntries = Object.entries(cropTypeDistribution || {})
      .sort((a, b) => (b[1] || 0) - (a[1] || 0)) // Sort by count descending
    
    const cropTableData = cropEntries.map(([cropType, count]) => {
      const percentage = totalInsuredCrops > 0 
        ? ((count / totalInsuredCrops) * 100).toFixed(1) 
        : '0.0'
      return [cropType || 'Unknown', count?.toString() || '0', `${percentage}%`]
    })
    
    if (cropTableData.length > 0) {
      doc.autoTable({
        startY: yPosition,
        head: [['Crop Type', 'Number of Records', 'Percentage']],
        body: cropTableData,
        theme: 'grid',
        headStyles: { fillColor: [132, 204, 22], textColor: [0, 0, 0], fontStyle: 'bold' },
        bodyStyles: { textColor: [0, 0, 0] },
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 15
      
      // Add top crop type analysis
      if (cropEntries.length > 0) {
        const topCrop = cropEntries[0]
        const topCropPercentage = totalInsuredCrops > 0 
          ? ((topCrop[1] / totalInsuredCrops) * 100).toFixed(1) 
          : '0.0'
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`Most Common Crop Type: ${topCrop[0]} (${topCrop[1]} records, ${topCropPercentage}%)`, 20, yPosition)
      }
      
      yPosition += 10
    }
    
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
    if (chartRefs.areaChartRef) {
      try {
        const areaChartImg = await captureChartAsImage(chartRefs.areaChartRef)
        if (areaChartImg) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Registered Farmers Over Time', 148, yPosition, { align: 'center' })
          yPosition += 5
          
          const imgWidth = 200
          const imgHeight = 100
          const xPos = (297 - imgWidth) / 2 // Center horizontally in landscape
          doc.addImage(areaChartImg, 'PNG', xPos, yPosition, imgWidth, imgHeight)
          yPosition += imgHeight + 15
        }
      } catch (error) {
        console.warn('Could not capture area chart:', error)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.text('Area chart visualization could not be included', 148, yPosition, { align: 'center' })
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
          doc.text('Crop Type Distribution', 148, yPosition, { align: 'center' })
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
        doc.text('Crop type distribution chart visualization could not be included', 148, yPosition, { align: 'center' })
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
        `Page ${i} of ${pageCount} - Farmer Registration Data Analysis Report`,
        148,
        200,
        { align: 'center' }
      )
    }
    
    // Save the PDF
    const fileName = `farmer-registration-report-${selectedYear}-${timePeriod}-${new Date().getTime()}.pdf`
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
