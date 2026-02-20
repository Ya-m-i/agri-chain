import { farmerToRsbsaFormState } from "../components/RSBSAEnrollmentForm"

const FONT = "helvetica"
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12
const BOX_H = 6
const LABEL_H = 3.5
const GAP = 2
const SECTION_BAR_H = 8
const LABEL_FONT = 6
const VALUE_FONT = 8
const TITLE_FONT = 14
const SUBTITLE_FONT = 9

/** Load image from public URL and return base64 data URL for jsPDF, or null on failure */
async function loadImageAsBase64(url) {
  try {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const res = await fetch(base + url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/** Draw a section bar (full width, dark fill, white text) */
function sectionBar(doc, y, text) {
  doc.setFillColor(55, 55, 55)
  doc.rect(0, y, PAGE_W, SECTION_BAR_H, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont(FONT, "bold")
  doc.text(text, MARGIN, y + 5.5)
  doc.setTextColor(0, 0, 0)
  return y + SECTION_BAR_H + GAP
}

/** Draw label above a box */
function labelAbove(doc, x, y, label) {
  doc.setFontSize(LABEL_FONT)
  doc.setFont(FONT, "normal")
  doc.setTextColor(60, 60, 60)
  doc.text(label, x, y)
  return y + LABEL_H
}

/** Draw a single bordered box with value inside; height can be overridden for multi-line */
function fieldBox(doc, x, y, width, value, boxHeight = BOX_H) {
  const v = value != null && value !== "" ? String(value) : ""
  doc.setDrawColor(0, 0, 0)
  doc.rect(x, y, width, boxHeight)
  doc.setFontSize(VALUE_FONT)
  doc.setFont(FONT, "normal")
  doc.setTextColor(0, 0, 0)
  const lines = doc.splitTextToSize(v || "—", width - 3)
  const toShow = lines && lines.length ? lines : [v || "—"]
  doc.text(toShow, x + 1.5, y + 4)
  return y + boxHeight
}

/** Draw two boxes in one row (left and right); returns y after row */
function twoBoxes(doc, y, leftX, leftW, rightX, rightW, leftLabel, rightLabel, leftVal, rightVal) {
  let yy = labelAbove(doc, leftX, y, leftLabel)
  yy = Math.max(yy, labelAbove(doc, rightX, y, rightLabel))
  const boxY = yy
  fieldBox(doc, leftX, boxY, leftW, leftVal)
  fieldBox(doc, rightX, boxY, rightW, rightVal)
  return boxY + BOX_H + GAP
}

/** Draw one full-width or single box with label (optionally taller for long text) */
function oneBox(doc, y, x, w, label, value, boxHeight = BOX_H) {
  const yy = labelAbove(doc, x, y, label)
  const endY = fieldBox(doc, x, yy, w, value, boxHeight)
  return endY + GAP
}

/** Draw checkbox(es) with label text */
function drawCheckbox(doc, x, y, checked, size = 2.5) {
  doc.rect(x, y - size, size, size)
  if (checked) {
    doc.setFontSize(8)
    doc.text("✓", x + 0.5, y - 0.2)
  }
}

/** Generate RSBSA Enrollment Form PDF matching official template (sections, borders, fields, spacing) */
export async function generateRSBSAFormPDF(farmer) {
  const jsPDFModule = await import("jspdf")
  const jsPDF = jsPDFModule.jsPDF
  const doc = new jsPDF("p", "mm", "a4")
  let y = 10
  const left = MARGIN
  const contentW = PAGE_W - 2 * MARGIN
  const col1W = contentW / 2 - GAP / 2
  const col2X = left + col1W + GAP

  const f = farmerToRsbsaFormState(farmer)

  // Optional: logos from public folder (place rsbsa-da-logo.png and rsbsa-anikita-logo.png in frontend/public/)
  const daLogo = await loadImageAsBase64("/rsbsa-da-logo.png")
  const anikitaLogo = await loadImageAsBase64("/rsbsa-anikita-logo.png")

  // ----- HEADER -----
  if (daLogo) {
    try {
      doc.addImage(daLogo, "PNG", left, y, 18, 18)
    } catch (_) {}
  }
  doc.setFontSize(8)
  doc.setFont(FONT, "bold")
  doc.text("Department of Agriculture", left + (daLogo ? 22 : 0), y + 5)
  doc.setFontSize(TITLE_FONT)
  doc.text("ANI AT KITA RSBSA ENROLLMENT FORM", left + (daLogo ? 22 : 0), y + 12)
  doc.setFontSize(SUBTITLE_FONT)
  doc.setFont(FONT, "normal")
  doc.text("REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)", left + (daLogo ? 22 : 0), y + 17)

  doc.setFontSize(7)
  doc.text("REVISED VERSION: 03-2021", PAGE_W - MARGIN - 38, y + 5)
  doc.rect(PAGE_W - MARGIN - 26, y + 6, 24, 30)
  doc.setFontSize(6)
  doc.text("2x2 PICTURE", PAGE_W - MARGIN - 24, y + 14)
  doc.text("PHOTO TAKEN", PAGE_W - MARGIN - 24, y + 18)
  doc.text("WITHIN 6 MONTHS", PAGE_W - MARGIN - 24, y + 22)

  y += 24

  if (anikitaLogo) {
    try {
      doc.addImage(anikitaLogo, "PNG", left + (contentW - 45) / 2, y, 45, 12)
    } catch (_) {}
  }
  y += 14

  // ----- ENROLLMENT TYPE & DATE -----
  doc.setFontSize(LABEL_FONT)
  doc.setFont(FONT, "bold")
  doc.text("ENROLLMENT TYPE & DATE ADMINISTERED:", left, y)
  y += LABEL_H
  const cbY = y + 2
  drawCheckbox(doc, left, cbY, f.enrollmentType === "New")
  doc.setFontSize(VALUE_FONT)
  doc.setFont(FONT, "normal")
  doc.text("New", left + 4, cbY)
  drawCheckbox(doc, left + 22, cbY, f.enrollmentType === "Updating")
  doc.text("Updating", left + 26, cbY)
  doc.text("Date: " + (f.dateAdministered || "—"), left + 55, cbY)
  y += BOX_H + GAP

  // ----- REFERENCE NUMBER -----
  doc.setFont(FONT, "bold")
  doc.setFontSize(LABEL_FONT)
  doc.text("REFERENCE NUMBER:", left, y)
  y += LABEL_H
  const refW = contentW / 4 - GAP / 4
  fieldBox(doc, left, y, refW, f.refRegion)
  fieldBox(doc, left + refW + GAP, y, refW, f.refProvince)
  fieldBox(doc, left + 2 * (refW + GAP), y, refW, f.refCityMuni)
  fieldBox(doc, left + 3 * (refW + GAP), y, refW, f.refBarangay)
  doc.setFontSize(5)
  doc.text("REGION", left + refW / 2 - 4, y + BOX_H + 2.5)
  doc.text("PROVINCE", left + refW + GAP + refW / 2 - 5, y + BOX_H + 2.5)
  doc.text("CITY/MUNI", left + 2 * (refW + GAP) + refW / 2 - 6, y + BOX_H + 2.5)
  doc.text("BARANGAY", left + 3 * (refW + GAP) + refW / 2 - 6, y + BOX_H + 2.5)
  y += BOX_H + 6 + GAP

  // ----- PART I: PERSONAL INFORMATION -----
  y = sectionBar(doc, y, "PART I: PERSONAL INFORMATION")

  // Name row 1: SURNAME, FIRST NAME
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "SURNAME", "FIRST NAME", f.lastName, f.firstName)
  // Name row 2: MIDDLE NAME, EXTENSION NAME
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "MIDDLE NAME", "EXTENSION NAME", f.middleName, f.extensionName)
  // SEX
  doc.setFontSize(LABEL_FONT)
  doc.text("SEX:", left, y)
  const sexY = y + 3
  drawCheckbox(doc, left + 12, sexY, f.gender === "Male")
  doc.setFontSize(VALUE_FONT)
  doc.text("Male", left + 15, sexY)
  drawCheckbox(doc, left + 28, sexY, f.gender === "Female")
  doc.text("Female", left + 31, sexY)
  y += BOX_H + GAP

  // ADDRESS
  doc.setFont(FONT, "bold")
  doc.setFontSize(LABEL_FONT)
  doc.text("ADDRESS", left, y)
  y += LABEL_H + GAP
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "HOUSE/LOT/BLDG. NO./PUROK", "STREET/SITIO/SUBDV.", f.houseLotPurok, f.streetSitioSubdv)
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "MUNICIPALITY/CITY", "BARANGAY", f.municipalityCity, f.barangay)
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "PROVINCE", "REGION", f.province, f.region)
  y = oneBox(doc, y, left, contentW, "FULL ADDRESS (OR MAP)", f.address, BOX_H * 1.5)
  y += GAP

  // Contact & birth
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "MOBILE NUMBER", "LANDLINE NUMBER", f.contactNum, f.landlineNum)
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "DATE OF BIRTH", "PLACE OF BIRTH (PROVINCE/CITY, COUNTRY)", f.birthday, [f.placeOfBirthProvince, f.placeOfBirthCountry].filter(Boolean).join(", "))
  y += GAP

  // Highest Formal Education
  doc.setFontSize(LABEL_FONT)
  doc.text("HIGHEST FORMAL EDUCATION:", left, y)
  y += LABEL_H
  const edVal = Array.isArray(f.highestEducation) ? f.highestEducation.join(", ") : f.highestEducation || "—"
  fieldBox(doc, left, y, contentW, edVal)
  y += BOX_H + GAP

  // PWD, Religion, 4Ps, Civil Status, etc. (label + value in one line or small box)
  const simpleRows = [
    ["PWD", f.pwd],
    ["RELIGION", f.religion === "Others" ? f.religionOthers : f.religion],
    ["4P's BENEFICIARY", f.fourPsBeneficiary],
    ["CIVIL STATUS", f.civilStatus],
    ["NAME OF SPOUSE (IF MARRIED)", f.spouseName],
    ["MEMBER OF INDIGENOUS GROUP", f.indigenousGroup === "Yes" ? f.indigenousSpecify : f.indigenousGroup],
    ["WITH GOVERNMENT ID", f.withGovId === "Yes" ? `${f.govIdType || ""} ${f.govIdNumber || ""}`.trim() : f.withGovId],
    ["MOTHER'S MAIDEN NAME", f.motherMaidenName],
    ["HOUSEHOLD HEAD", f.householdHead],
    ["MEMBER OF FARMERS ASSOCIATION/COOPERATIVE", f.farmersAssociation === "Yes" ? f.farmersAssociationSpecify : f.farmersAssociation],
    ["PERSON TO NOTIFY IN CASE OF EMERGENCY", f.emergencyContactName],
    ["EMERGENCY CONTACT NUMBER", f.emergencyContactNum],
    ["NO. OF LIVING HOUSEHOLD MEMBERS", f.numHouseholdMembers],
  ]
  for (const [label, val] of simpleRows) {
    y = oneBox(doc, y, left, contentW, label, val != null && val !== "" ? val : "—")
  }
  doc.setFontSize(LABEL_FONT)
  doc.text("NO. OF MALE / FEMALE:", left, y)
  y += LABEL_H
  doc.rect(left, y, col1W, BOX_H)
  doc.rect(col2X, y, col1W, BOX_H)
  doc.setFontSize(VALUE_FONT)
  doc.text((f.numMale != null && f.numMale !== "" ? f.numMale : "—") + " / " + (f.numFemale != null && f.numFemale !== "" ? f.numFemale : "—"), left + 2, y + 4)
  y += BOX_H + GAP * 2

  if (y > PAGE_H - 60) {
    doc.addPage()
    y = 12
  }

  // ----- PART II: FARM PROFILE -----
  y = sectionBar(doc, y, "PART II: FARM PROFILE")

  doc.setFontSize(LABEL_FONT)
  doc.text("MAIN LIVELIHOOD:", left, y)
  y += LABEL_H
  const livY = y + 2
  const livelihoods = ["FARMER", "FARMWORKER/LABORER", "FISHERFOLK", "AGRI YOUTH"]
  livelihoods.forEach((liv, i) => {
    drawCheckbox(doc, left + i * 48, livY, f.mainLivelihood === liv)
    doc.setFontSize(VALUE_FONT)
    doc.text(liv, left + i * 48 + 3.5, livY)
  })
  y += BOX_H + GAP

  doc.setFontSize(LABEL_FONT)
  doc.text("TYPE OF FARMING ACTIVITY (if FARMER):", left, y)
  y += LABEL_H
  const farmVal = [f.farmingRice && "Rice", f.farmingCorn && "Corn", f.farmingOtherCrops, f.farmingLivestock, f.farmingPoultry].filter(Boolean).join(", ") || "—"
  fieldBox(doc, left, y, contentW, farmVal)
  y += BOX_H + GAP

  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "GROSS ANNUAL INCOME LAST YEAR - FARMING", "GROSS ANNUAL INCOME LAST YEAR - NON-FARMING", f.grossIncomeFarming, f.grossIncomeNonFarming)
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "CROP TYPE", "CROP AREA (HECTARES)", f.cropType, f.cropArea)
  y = twoBoxes(doc, y, left, col1W, col2X, col1W, "LOT NUMBER", "LOT AREA", f.lotNumber, f.lotArea)

  doc.setFontSize(LABEL_FONT)
  doc.text("RSBSA REGISTERED:", left, y)
  y += LABEL_H
  drawCheckbox(doc, left, y + 2, f.rsbsaRegistered)
  doc.setFontSize(VALUE_FONT)
  doc.text("Yes (Required for some programs)", left + 3.5, y + 2)
  y += BOX_H + GAP * 2

  // ----- CLIENT'S COPY -----
  doc.setDrawColor(100, 100, 100)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(0, y, PAGE_W, y)
  doc.setLineDashPattern([], 0)
  y += 6
  doc.setFontSize(8)
  doc.setFont(FONT, "bold")
  doc.text("REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA) - ENROLLMENT CLIENT'S COPY", left, y)
  y += 5
  doc.setFont(FONT, "normal")
  doc.setFontSize(7)
  doc.text("Ref: " + [f.refRegion, f.refProvince, f.refCityMuni, f.refBarangay].filter(Boolean).join(" / ") || "—", left, y)
  y += 4
  doc.text("Name: " + [f.lastName, f.firstName, f.middleName, f.extensionName].filter(Boolean).join(", ") || "—", left, y)
  y += 5
  doc.setFont(FONT, "bold")
  doc.text("THIS FORM IS NOT FOR SALE.", left, y)

  doc.save(`RSBSA-Enrollment-${(f.lastName || "").trim()}-${(f.firstName || "").trim()}.pdf`)
}
