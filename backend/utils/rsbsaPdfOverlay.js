/**
 * RSBSA PDF: form image as background + data overlaid (pixel-perfect match to official form).
 * Use when backend/assets/rsbsa-form-template.png (or .jpg) exists.
 * Receives formState (same shape as frontend farmerToRsbsaFormState) and imageDataUrl (base64).
 */

function esc(v) {
  if (v == null || v === '') return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

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
  const s = String(str || '').replace(/\D/g, '').slice(0, maxLen)
  return s
}

/** Position map: left/top in %, width in %. Tune these to match your RSBSA form image. */
const POS = {
  dateAdministered: { left: 52, top: 18, width: 18 },
  refRegion: { left: 12, top: 21, width: 8 },
  refProvince: { left: 24, top: 21, width: 8 },
  refCityMuni: { left: 36, top: 21, width: 8 },
  refBarangay: { left: 48, top: 21, width: 8 },
  lastName: { left: 10, top: 30, width: 36 },
  middleName: { left: 10, top: 33.5, width: 36 },
  houseLotPurok: { left: 10, top: 37, width: 36 },
  municipalityCity: { left: 10, top: 40.5, width: 36 },
  contactNum: { left: 10, top: 44, width: 36 },
  birthday: { left: 10, top: 47.5, width: 36 },
  religion: { left: 10, top: 51, width: 36 },
  civilStatus: { left: 10, top: 54.5, width: 36 },
  spouseName: { left: 10, top: 58, width: 36 },
  motherMaidenName: { left: 10, top: 61.5, width: 36 },
  householdHead: { left: 10, top: 65, width: 36 },
  householdHeadName: { left: 10, top: 68.5, width: 36 },
  householdHeadRelationship: { left: 10, top: 72, width: 36 },
  numHouseholdMembers: { left: 10, top: 75.5, width: 12 },
  numMale: { left: 26, top: 75.5, width: 12 },
  numFemale: { left: 42, top: 75.5, width: 12 },
  firstName: { left: 52, top: 30, width: 36 },
  extensionName: { left: 52, top: 33.5, width: 36 },
  gender: { left: 52, top: 37, width: 18 },
  streetSitioSubdv: { left: 52, top: 40.5, width: 36 },
  barangay: { left: 52, top: 44, width: 36 },
  province: { left: 52, top: 47.5, width: 36 },
  region: { left: 52, top: 51, width: 36 },
  landlineNum: { left: 52, top: 54.5, width: 36 },
  placeOfBirth: { left: 52, top: 58, width: 36 },
  highestEducation: { left: 52, top: 61.5, width: 36 },
  pwd: { left: 52, top: 65, width: 18 },
  fourPsBeneficiary: { left: 52, top: 68.5, width: 18 },
  indigenousGroup: { left: 52, top: 72, width: 18 },
  indigenousSpecify: { left: 52, top: 75.5, width: 36 },
  withGovId: { left: 52, top: 79, width: 18 },
  govIdType: { left: 52, top: 82, width: 18 },
  govIdNumber: { left: 52, top: 85, width: 36 },
  farmersAssociation: { left: 52, top: 88, width: 18 },
  farmersAssociationSpecify: { left: 52, top: 91, width: 36 },
  emergencyContactName: { left: 52, top: 94, width: 36 },
  emergencyContactNum: { left: 52, top: 97, width: 36 },
  address: { left: 10, top: 80, width: 80 },
  addressFull: { left: 10, top: 83, width: 80 },
  mainLivelihood: { left: 10, top: 86, width: 80 },
  grossIncomeFarming: { left: 10, top: 89, width: 35 },
  grossIncomeNonFarming: { left: 50, top: 89, width: 35 },
  clientLastName: { left: 10, top: 92, width: 20 },
  clientMiddleName: { left: 32, top: 92, width: 20 },
  clientExtensionName: { left: 54, top: 92, width: 15 },
  clientFirstName: { left: 72, top: 92, width: 20 },
}

function styleFor(pos) {
  const w = pos.width != null ? pos.width : 20
  return `position:absolute;left:${pos.left}%;top:${pos.top}%;width:${w}%;font-size:8px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:transparent;border:none;color:#000;font-family:Arial,sans-serif;padding:0;margin:0;`
}

/**
 * Build HTML for one A4 page: background image + overlaid text.
 * @param {object} formState - RSBSA form data
 * @param {string} imageDataUrl - data:image/png;base64,... or data:image/jpeg;base64,...
 */
function getRSBSAFormHtmlWithBackground(formState, imageDataUrl) {
  const f = formState || {}
  const placeBirth = [f.placeOfBirthProvince, f.placeOfBirthCountry].filter(Boolean).join(', ') || ''
  const education = Array.isArray(f.highestEducation) ? f.highestEducation.join(', ') : (f.highestEducation || '')

  const fields = [
    { key: 'dateAdministered', value: formatDate(f.dateAdministered) },
    { key: 'refRegion', value: digitsOnly(f.refRegion, 4) },
    { key: 'refProvince', value: digitsOnly(f.refProvince, 4) },
    { key: 'refCityMuni', value: digitsOnly(f.refCityMuni, 4) },
    { key: 'refBarangay', value: digitsOnly(f.refBarangay, 4) },
    { key: 'lastName', value: esc(f.lastName) },
    { key: 'middleName', value: esc(f.middleName) },
    { key: 'address', value: esc(f.address) },
    { key: 'houseLotPurok', value: esc(f.houseLotPurok) },
    { key: 'municipalityCity', value: esc(f.municipalityCity) },
    { key: 'contactNum', value: digitsOnly(f.contactNum, 11) },
    { key: 'birthday', value: formatDate(f.birthday) },
    { key: 'religion', value: f.religion === 'Others' ? esc(f.religionOthers) : esc(f.religion) },
    { key: 'civilStatus', value: esc(f.civilStatus) },
    { key: 'spouseName', value: esc(f.spouseName) },
    { key: 'motherMaidenName', value: esc(f.motherMaidenName) },
    { key: 'householdHead', value: esc(f.householdHead) },
    { key: 'householdHeadName', value: esc(f.householdHeadName) },
    { key: 'householdHeadRelationship', value: esc(f.householdHeadRelationship) },
    { key: 'numHouseholdMembers', value: esc(f.numHouseholdMembers) },
    { key: 'numMale', value: esc(f.numMale) },
    { key: 'numFemale', value: esc(f.numFemale) },
    { key: 'firstName', value: esc(f.firstName) },
    { key: 'extensionName', value: esc(f.extensionName) },
    { key: 'gender', value: esc(f.gender) },
    { key: 'streetSitioSubdv', value: esc(f.streetSitioSubdv) },
    { key: 'barangay', value: esc(f.barangay) },
    { key: 'province', value: esc(f.province) },
    { key: 'region', value: esc(f.region) },
    { key: 'landlineNum', value: digitsOnly(f.landlineNum, 7) },
    { key: 'placeOfBirth', value: placeBirth },
    { key: 'highestEducation', value: education },
    { key: 'pwd', value: esc(f.pwd) },
    { key: 'fourPsBeneficiary', value: esc(f.fourPsBeneficiary) },
    { key: 'indigenousGroup', value: esc(f.indigenousGroup) },
    { key: 'indigenousSpecify', value: esc(f.indigenousSpecify) },
    { key: 'withGovId', value: esc(f.withGovId) },
    { key: 'govIdType', value: esc(f.govIdType) },
    { key: 'govIdNumber', value: esc(f.govIdNumber) },
    { key: 'farmersAssociation', value: esc(f.farmersAssociation) },
    { key: 'farmersAssociationSpecify', value: esc(f.farmersAssociationSpecify) },
    { key: 'emergencyContactName', value: esc(f.emergencyContactName) },
    { key: 'emergencyContactNum', value: digitsOnly(f.emergencyContactNum, 11) },
    { key: 'addressFull', value: esc(f.address) },
    { key: 'mainLivelihood', value: esc(f.mainLivelihood) },
    { key: 'grossIncomeFarming', value: esc(f.grossIncomeFarming) },
    { key: 'grossIncomeNonFarming', value: esc(f.grossIncomeNonFarming) },
    { key: 'clientLastName', value: esc(f.lastName) },
    { key: 'clientMiddleName', value: esc(f.middleName) },
    { key: 'clientExtensionName', value: esc(f.extensionName) },
    { key: 'clientFirstName', value: esc(f.firstName) },
  ]

  const overlayDivs = fields
    .filter(({ key }) => POS[key])
    .map(({ key, value }) => {
      if (!value) return ''
      const p = POS[key]
      return `<div style="${styleFor(p)}">${value}</div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RSBSA Enrollment Form</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 595px; height: 842px; }
    .page {
      position: relative;
      width: 595px;
      height: 842px;
      background-image: url('${imageDataUrl.replace(/'/g, "\\'")}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
  </style>
</head>
<body>
  <div class="page">
    ${overlayDivs}
  </div>
</body>
</html>`
}

module.exports = { getRSBSAFormHtmlWithBackground, POS }
