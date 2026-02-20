import { farmerToRsbsaFormState } from "../components/RSBSAEnrollmentForm"

const FONT = "helvetica"
const LABEL_SIZE = 7
const VALUE_SIZE = 8
const TITLE_SIZE = 12
const MARGIN = 14
const LINE = 5

/** Draw label + value line (single line); returns next y */
function line(doc, x, y, label, value, maxWidth = 80) {
  doc.setFontSize(LABEL_SIZE)
  doc.setFont(FONT, "normal")
  doc.setTextColor(80, 80, 80)
  doc.text(label, x, y)
  doc.setFontSize(VALUE_SIZE)
  doc.setTextColor(0, 0, 0)
  const v = value != null && value !== "" ? String(value) : "—"
  const lines = doc.splitTextToSize(v, maxWidth)
  doc.text(lines && lines[0] ? lines[0] : v, x + 2, y + 3.5)
  return y + LINE
}

/** Generate RSBSA Enrollment Form PDF from farmer (template matches ANI AT KITA RSBSA form) */
export async function generateRSBSAFormPDF(farmer) {
  const jsPDFModule = await import("jspdf")
  const jsPDF = jsPDFModule.jsPDF
  const doc = new jsPDF("p", "mm", "a4")
  const pageW = doc.internal.pageSize.getWidth()
  let y = 12
  const left = MARGIN
  const right = pageW - MARGIN

  const f = farmerToRsbsaFormState(farmer)

  // Header
  doc.setFontSize(8)
  doc.setFont(FONT, "bold")
  doc.text("Department of Agriculture", left, y)
  y += 5
  doc.setFontSize(TITLE_SIZE)
  doc.text("ANI AT KITA RSBSA ENROLLMENT FORM", left, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont(FONT, "normal")
  doc.text("REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)", left, y)
  doc.setFontSize(7)
  doc.text("REVISED VERSION: 03-2021", right - 35, 14)
  doc.rect(right - 28, 18, 22, 28)
  doc.setFontSize(6)
  doc.text("2x2 PICTURE", right - 26, 26)
  doc.text("PHOTO WITHIN", right - 26, 30)
  doc.text("6 MONTHS", right - 26, 34)
  y += 8

  // Enrollment type & date
  doc.setFontSize(LABEL_SIZE)
  doc.setFont(FONT, "bold")
  doc.text("Enrollment Type & Date Administered", left, y)
  y += 4
  doc.setFont(FONT, "normal")
  doc.text(`☐ New  ☐ Updating  → ${f.enrollmentType || "—"}`, left, y)
  doc.text(`Date: ${f.dateAdministered || "—"}`, left + 75, y)
  y += 6

  // Reference number
  doc.setFont(FONT, "bold")
  doc.text("Reference Number", left, y)
  y += 4
  doc.setFont(FONT, "normal")
  doc.text(`Region: ${f.refRegion || "—"}  Province: ${f.refProvince || "—"}  City/Muni: ${f.refCityMuni || "—"}  Barangay: ${f.refBarangay || "—"}`, left, y)
  y += 8

  // Part I
  doc.setFillColor(60, 60, 60)
  doc.rect(0, y - 2, pageW, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont(FONT, "bold")
  doc.text("PART I: PERSONAL INFORMATION", left, y + 5)
  doc.setTextColor(0, 0, 0)
  y += 12

  const col2 = left + 95
  y = line(doc, left, y, "SURNAME", f.lastName, 40)
  y = line(doc, col2, y - LINE, "FIRST NAME", f.firstName, 40)
  y += 2
  y = line(doc, left, y, "MIDDLE NAME", f.middleName, 40)
  y = line(doc, col2, y - LINE, "EXTENSION NAME", f.extensionName, 40)
  y += 2
  doc.setFontSize(LABEL_SIZE)
  doc.text("SEX:", left, y)
  doc.setFont(FONT, "normal")
  doc.text(` ${f.gender || "—"}`, left + 10, y)
  y += 6

  doc.setFont(FONT, "bold")
  doc.setFontSize(LABEL_SIZE)
  doc.text("ADDRESS", left, y)
  y += 5
  y = line(doc, left, y, "House/Lot/Bldg. No./Purok", f.houseLotPurok, 85)
  y = line(doc, col2, y - LINE, "Street/Sitio/Subdv.", f.streetSitioSubdv, 85)
  y += 2
  y = line(doc, left, y, "Municipality/City", f.municipalityCity, 40)
  y = line(doc, col2, y - LINE, "Barangay", f.barangay, 40)
  y += 2
  y = line(doc, left, y, "Province", f.province, 40)
  y = line(doc, col2, y - LINE, "Region", f.region, 40)
  y += 2
  doc.text("Full address (or map):", left, y)
  doc.setFont(FONT, "normal")
  doc.setFontSize(VALUE_SIZE)
  doc.text(doc.splitTextToSize(f.address || "—", pageW - 2 * MARGIN - 4)[0] || "—", left + 2, y + 3.5)
  y += 8

  y = line(doc, left, y, "Mobile Number", f.contactNum, 45)
  y = line(doc, col2, y - LINE, "Landline Number", f.landlineNum, 45)
  y += 2
  y = line(doc, left, y, "Date of Birth", f.birthday, 45)
  doc.text("Place of Birth:", col2, y - 1)
  doc.text(` ${[f.placeOfBirthProvince, f.placeOfBirthCountry].filter(Boolean).join(", ") || "—"}`, col2 + 2, y + 2.5)
  y += 6

  doc.setFont(FONT, "normal")
  doc.text("Highest Formal Education:", left, y)
  doc.text(` ${Array.isArray(f.highestEducation) ? f.highestEducation.join(", ") : f.highestEducation || "—"}`, left, y + 4)
  y += 8

  const row = (label, val) => {
    doc.setFontSize(LABEL_SIZE)
    doc.text(`${label}: ${val != null && val !== "" ? val : "—"}`, left, y)
    y += 4
  }
  row("PWD", f.pwd)
  row("Religion", f.religion === "Others" ? f.religionOthers : f.religion)
  row("4P's Beneficiary", f.fourPsBeneficiary)
  row("Civil Status", f.civilStatus)
  row("Name of Spouse (if married)", f.spouseName)
  row("Member of Indigenous Group", f.indigenousGroup === "Yes" ? f.indigenousSpecify : f.indigenousGroup)
  row("With Government ID", f.withGovId === "Yes" ? `${f.govIdType || ""} ${f.govIdNumber || ""}`.trim() : f.withGovId)
  row("Mother's Maiden Name", f.motherMaidenName)
  row("Household Head", f.householdHead)
  row("Member of Farmers Association/Cooperative", f.farmersAssociation === "Yes" ? f.farmersAssociationSpecify : f.farmersAssociation)
  row("Person to Notify (Emergency)", f.emergencyContactName)
  row("Emergency Contact Number", f.emergencyContactNum)
  row("No. of living household members", f.numHouseholdMembers)
  doc.text(`No. Male / Female: ${f.numMale || "—"} / ${f.numFemale || "—"}`, left, y)
  y += 8

  if (y > 240) {
    doc.addPage()
    y = 14
  }

  // Part II
  doc.setFillColor(60, 60, 60)
  doc.rect(0, y - 2, pageW, 8, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont(FONT, "bold")
  doc.text("PART II: FARM PROFILE", left, y + 5)
  doc.setTextColor(0, 0, 0)
  y += 12

  doc.setFont(FONT, "normal")
  doc.setFontSize(VALUE_SIZE)
  doc.text("Main Livelihood: " + (f.mainLivelihood || "—"), left, y)
  y += 6
  const farming = [f.farmingRice && "Rice", f.farmingCorn && "Corn", f.farmingOtherCrops, f.farmingLivestock, f.farmingPoultry].filter(Boolean)
  doc.text("Farming: " + (farming.length ? farming.join(", ") : "—"), left, y)
  y += 5
  doc.text("Gross Income (Farming): " + (f.grossIncomeFarming || "—"), left, y)
  doc.text("Gross Income (Non-farming): " + (f.grossIncomeNonFarming || "—"), col2, y)
  y += 6
  doc.text("Crop Type: " + (f.cropType || "—"), left, y)
  doc.text("Crop Area (ha): " + (f.cropArea || "—"), col2, y)
  y += 5
  doc.text("Lot Number: " + (f.lotNumber || "—"), left, y)
  doc.text("Lot Area: " + (f.lotArea || "—"), col2, y)
  y += 6
  doc.text("RSBSA Registered: " + (f.rsbsaRegistered ? "Yes" : "No"), left, y)
  y += 10

  // Client's copy (short)
  doc.setDrawColor(150, 150, 150)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(0, y, pageW, y)
  doc.setLineDashPattern([], 0)
  y += 6
  doc.setFontSize(8)
  doc.setFont(FONT, "bold")
  doc.text("REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA) - ENROLLMENT CLIENT'S COPY", left, y)
  y += 5
  doc.setFont(FONT, "normal")
  doc.setFontSize(7)
  doc.text(`Ref: ${f.refRegion || ""} / ${f.refProvince || ""} / ${f.refCityMuni || ""} / ${f.refBarangay || ""}`, left, y)
  y += 4
  doc.text(`Name: ${[f.lastName, f.firstName, f.middleName, f.extensionName].filter(Boolean).join(", ") || "—"}`, left, y)
  y += 4
  doc.text("THIS FORM IS NOT FOR SALE.", left, y)

  doc.save(`RSBSA-Enrollment-${(f.lastName || "").trim()}-${(f.firstName || "").trim()}.pdf`)
}
