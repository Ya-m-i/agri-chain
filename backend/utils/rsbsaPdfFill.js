/**
 * RSBSA PDF: fill a real PDF template using pdf-lib.
 * Exact layout, no stretching. A4 = 595 x 842 points (origin bottom-left).
 * Place rsbsa-form-template.pdf in backend/assets/ (convert from form image: Print → Save as PDF).
 */

const { PDFDocument, rgb } = require('pdf-lib')

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${mm}/${dd}/${yyyy}`
}

function digitsOnly(str, maxLen) {
  return String(str || '').replace(/\D/g, '').slice(0, maxLen)
}

function truncate(str, maxLen) {
  const s = String(str || '').trim()
  return s.length <= maxLen ? s : s.slice(0, maxLen)
}

/** A4: width 595, height 842 points. yFromTop = distance from top of page; we draw at y = pageHeight - yFromTop - lineHeight */
const PAGE_H = 842
const FONT_SIZE = 8
const LINE_H = 10

/** Coordinates: x (points from left), yFromTop (points from top of page). Tune to match your template.pdf */
const COORDS = {
  dateAdministered: { x: 320, yFromTop: 805 },
  refRegion: { x: 85, yFromTop: 788 },
  refProvince: { x: 155, yFromTop: 788 },
  refCityMuni: { x: 225, yFromTop: 788 },
  refBarangay: { x: 295, yFromTop: 788 },
  lastName: { x: 55, yFromTop: 745 },
  firstName: { x: 305, yFromTop: 745 },
  middleName: { x: 55, yFromTop: 728 },
  extensionName: { x: 305, yFromTop: 728 },
  gender: { x: 305, yFromTop: 711 },
  houseLotPurok: { x: 55, yFromTop: 694 },
  streetSitioSubdv: { x: 305, yFromTop: 694 },
  barangay: { x: 55, yFromTop: 677 },
  municipalityCity: { x: 305, yFromTop: 677 },
  province: { x: 55, yFromTop: 660 },
  region: { x: 305, yFromTop: 660 },
  contactNum: { x: 55, yFromTop: 643 },
  landlineNum: { x: 305, yFromTop: 643 },
  birthday: { x: 55, yFromTop: 626 },
  placeOfBirth: { x: 305, yFromTop: 626 },
  highestEducation: { x: 55, yFromTop: 609 },
  religion: { x: 305, yFromTop: 609 },
  civilStatus: { x: 55, yFromTop: 592 },
  pwd: { x: 305, yFromTop: 592 },
  fourPsBeneficiary: { x: 305, yFromTop: 575 },
  indigenousGroup: { x: 305, yFromTop: 558 },
  indigenousSpecify: { x: 305, yFromTop: 541 },
  withGovId: { x: 305, yFromTop: 524 },
  govIdType: { x: 305, yFromTop: 507 },
  govIdNumber: { x: 305, yFromTop: 490 },
  farmersAssociation: { x: 305, yFromTop: 473 },
  farmersAssociationSpecify: { x: 305, yFromTop: 456 },
  spouseName: { x: 55, yFromTop: 575 },
  motherMaidenName: { x: 55, yFromTop: 558 },
  householdHead: { x: 55, yFromTop: 541 },
  householdHeadName: { x: 55, yFromTop: 524 },
  householdHeadRelationship: { x: 55, yFromTop: 507 },
  numHouseholdMembers: { x: 55, yFromTop: 490 },
  numMale: { x: 155, yFromTop: 490 },
  numFemale: { x: 220, yFromTop: 490 },
  emergencyContactName: { x: 55, yFromTop: 422 },
  emergencyContactNum: { x: 305, yFromTop: 422 },
  address: { x: 55, yFromTop: 405 },
  addressFull: { x: 55, yFromTop: 388 },
  mainLivelihood: { x: 55, yFromTop: 355 },
  grossIncomeFarming: { x: 55, yFromTop: 322 },
  grossIncomeNonFarming: { x: 305, yFromTop: 322 },
  clientLastName: { x: 55, yFromTop: 195 },
  clientMiddleName: { x: 175, yFromTop: 195 },
  clientExtensionName: { x: 295, yFromTop: 195 },
  clientFirstName: { x: 355, yFromTop: 195 },
}

/**
 * Load template PDF buffer and fill with formState. Returns filled PDF buffer.
 * @param {Buffer} templatePdfBuffer
 * @param {object} formState
 * @returns {Promise<Uint8Array>}
 */
async function fillRSBSATemplate(templatePdfBuffer, formState) {
  const pdfDoc = await PDFDocument.load(templatePdfBuffer)
  const page = pdfDoc.getPages()[0]
  const pageHeight = page.getHeight()
  const black = rgb(0, 0, 0)

  const f = formState || {}
  const placeBirth = [f.placeOfBirthProvince, f.placeOfBirthCountry].filter(Boolean).join(', ') || ''
  const education = Array.isArray(f.highestEducation) ? f.highestEducation.join(', ') : (f.highestEducation || '')

  const entries = [
    ['dateAdministered', formatDate(f.dateAdministered)],
    ['refRegion', digitsOnly(f.refRegion, 4)],
    ['refProvince', digitsOnly(f.refProvince, 4)],
    ['refCityMuni', digitsOnly(f.refCityMuni, 4)],
    ['refBarangay', digitsOnly(f.refBarangay, 4)],
    ['lastName', truncate(f.lastName, 28)],
    ['firstName', truncate(f.firstName, 28)],
    ['middleName', truncate(f.middleName, 28)],
    ['extensionName', truncate(f.extensionName, 10)],
    ['gender', (f.gender || '').trim()],
    ['houseLotPurok', truncate(f.houseLotPurok, 22)],
    ['streetSitioSubdv', truncate(f.streetSitioSubdv, 22)],
    ['barangay', truncate(f.barangay, 22)],
    ['municipalityCity', truncate(f.municipalityCity, 22)],
    ['province', truncate(f.province, 22)],
    ['region', truncate(f.region, 22)],
    ['contactNum', digitsOnly(f.contactNum, 11)],
    ['landlineNum', digitsOnly(f.landlineNum, 7)],
    ['birthday', formatDate(f.birthday)],
    ['placeOfBirth', truncate(placeBirth, 28)],
    ['highestEducation', truncate(education, 35)],
    ['religion', truncate(f.religion === 'Others' ? f.religionOthers : f.religion, 18)],
    ['civilStatus', truncate(f.civilStatus, 12)],
    ['pwd', (f.pwd || '').trim()],
    ['fourPsBeneficiary', (f.fourPsBeneficiary || '').trim()],
    ['indigenousGroup', (f.indigenousGroup || '').trim()],
    ['indigenousSpecify', truncate(f.indigenousSpecify, 22)],
    ['withGovId', (f.withGovId || '').trim()],
    ['govIdType', truncate(f.govIdType, 18)],
    ['govIdNumber', truncate(f.govIdNumber, 20)],
    ['farmersAssociation', (f.farmersAssociation || '').trim()],
    ['farmersAssociationSpecify', truncate(f.farmersAssociationSpecify, 28)],
    ['spouseName', truncate(f.spouseName, 28)],
    ['motherMaidenName', truncate(f.motherMaidenName, 28)],
    ['householdHead', (f.householdHead || '').trim()],
    ['householdHeadName', truncate(f.householdHeadName, 28)],
    ['householdHeadRelationship', truncate(f.householdHeadRelationship, 18)],
    ['numHouseholdMembers', String(f.numHouseholdMembers ?? '').trim()],
    ['numMale', String(f.numMale ?? '').trim()],
    ['numFemale', String(f.numFemale ?? '').trim()],
    ['emergencyContactName', truncate(f.emergencyContactName, 28)],
    ['emergencyContactNum', digitsOnly(f.emergencyContactNum, 11)],
    ['address', truncate(f.address, 55)],
    ['addressFull', truncate(f.address, 60)],
    ['mainLivelihood', truncate(f.mainLivelihood, 22)],
    ['grossIncomeFarming', truncate(f.grossIncomeFarming, 18)],
    ['grossIncomeNonFarming', truncate(f.grossIncomeNonFarming, 18)],
    ['clientLastName', truncate(f.lastName, 18)],
    ['clientMiddleName', truncate(f.middleName, 18)],
    ['clientExtensionName', truncate(f.extensionName, 8)],
    ['clientFirstName', truncate(f.firstName, 18)],
  ]

  for (const [key, value] of entries) {
    if (!value || !COORDS[key]) continue
    const pos = COORDS[key]
    const y = pageHeight - pos.yFromTop - FONT_SIZE
    page.drawText(String(value), {
      x: pos.x,
      y,
      size: FONT_SIZE,
      color: black,
    })
  }

  return pdfDoc.save()
}

module.exports = { fillRSBSATemplate, COORDS }
