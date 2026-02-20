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

/** Truncate to max chars so text fits in form boxes and does not overflow */
function truncate(str, maxLen) {
  const s = String(str || '').trim()
  if (s.length <= maxLen) return s
  return s.slice(0, maxLen)
}

/** Position map: left/top in %, width in %. Left col ends before 48%, right col starts at 50%. */
const POS = {
  dateAdministered: { left: 54, top: 16, width: 16 },
  refRegion: { left: 14, top: 19, width: 7 },
  refProvince: { left: 24, top: 19, width: 7 },
  refCityMuni: { left: 34, top: 19, width: 7 },
  refBarangay: { left: 44, top: 19, width: 7 },
  lastName: { left: 10, top: 24, width: 35 },
  firstName: { left: 50, top: 24, width: 35 },
  middleName: { left: 10, top: 27, width: 35 },
  extensionName: { left: 50, top: 27, width: 35 },
  gender: { left: 50, top: 30, width: 14 },
  houseLotPurok: { left: 10, top: 33, width: 35 },
  streetSitioSubdv: { left: 50, top: 33, width: 35 },
  barangay: { left: 10, top: 36, width: 35 },
  municipalityCity: { left: 50, top: 36, width: 35 },
  province: { left: 10, top: 39, width: 35 },
  region: { left: 50, top: 39, width: 35 },
  contactNum: { left: 10, top: 42, width: 35 },
  landlineNum: { left: 50, top: 42, width: 35 },
  birthday: { left: 10, top: 45, width: 35 },
  placeOfBirth: { left: 50, top: 45, width: 35 },
  highestEducation: { left: 10, top: 48, width: 35 },
  religion: { left: 50, top: 48, width: 35 },
  civilStatus: { left: 10, top: 51, width: 35 },
  pwd: { left: 50, top: 51, width: 14 },
  fourPsBeneficiary: { left: 50, top: 54, width: 14 },
  indigenousGroup: { left: 50, top: 57, width: 14 },
  indigenousSpecify: { left: 50, top: 60, width: 35 },
  withGovId: { left: 50, top: 63, width: 14 },
  govIdType: { left: 50, top: 66, width: 18 },
  govIdNumber: { left: 50, top: 69, width: 35 },
  farmersAssociation: { left: 50, top: 72, width: 14 },
  farmersAssociationSpecify: { left: 50, top: 75, width: 35 },
  spouseName: { left: 10, top: 54, width: 35 },
  motherMaidenName: { left: 10, top: 57, width: 35 },
  householdHead: { left: 10, top: 60, width: 35 },
  householdHeadName: { left: 10, top: 63, width: 35 },
  householdHeadRelationship: { left: 10, top: 66, width: 35 },
  numHouseholdMembers: { left: 10, top: 69, width: 10 },
  numMale: { left: 24, top: 69, width: 10 },
  numFemale: { left: 38, top: 69, width: 10 },
  emergencyContactName: { left: 10, top: 78, width: 35 },
  emergencyContactNum: { left: 50, top: 78, width: 35 },
  address: { left: 10, top: 81, width: 78 },
  addressFull: { left: 10, top: 84, width: 78 },
  mainLivelihood: { left: 10, top: 87, width: 78 },
  grossIncomeFarming: { left: 10, top: 90, width: 32 },
  grossIncomeNonFarming: { left: 48, top: 90, width: 32 },
  clientLastName: { left: 10, top: 93, width: 18 },
  clientMiddleName: { left: 30, top: 93, width: 18 },
  clientExtensionName: { left: 50, top: 93, width: 12 },
  clientFirstName: { left: 65, top: 93, width: 18 },
}

function styleFor(pos) {
  const w = pos.width != null ? pos.width : 18
  return `position:absolute;left:${pos.left}%;top:${pos.top}%;width:${w}%;max-width:${w}%;font-size:7px;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:transparent;border:none;color:#000;font-family:Arial,sans-serif;padding:0;margin:0;z-index:2;display:block;box-sizing:border-box;`
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
    { key: 'lastName', value: truncate(esc(f.lastName), 28) },
    { key: 'middleName', value: truncate(esc(f.middleName), 28) },
    { key: 'address', value: truncate(esc(f.address), 50) },
    { key: 'houseLotPurok', value: truncate(esc(f.houseLotPurok), 22) },
    { key: 'municipalityCity', value: truncate(esc(f.municipalityCity), 22) },
    { key: 'contactNum', value: digitsOnly(f.contactNum, 11) },
    { key: 'birthday', value: formatDate(f.birthday) },
    { key: 'religion', value: truncate(f.religion === 'Others' ? esc(f.religionOthers) : esc(f.religion), 18) },
    { key: 'civilStatus', value: truncate(esc(f.civilStatus), 12) },
    { key: 'spouseName', value: truncate(esc(f.spouseName), 28) },
    { key: 'motherMaidenName', value: truncate(esc(f.motherMaidenName), 28) },
    { key: 'householdHead', value: esc(f.householdHead) },
    { key: 'householdHeadName', value: truncate(esc(f.householdHeadName), 28) },
    { key: 'householdHeadRelationship', value: truncate(esc(f.householdHeadRelationship), 18) },
    { key: 'numHouseholdMembers', value: esc(f.numHouseholdMembers) },
    { key: 'numMale', value: esc(f.numMale) },
    { key: 'numFemale', value: esc(f.numFemale) },
    { key: 'firstName', value: truncate(esc(f.firstName), 28) },
    { key: 'extensionName', value: truncate(esc(f.extensionName), 10) },
    { key: 'gender', value: esc(f.gender) },
    { key: 'streetSitioSubdv', value: truncate(esc(f.streetSitioSubdv), 22) },
    { key: 'barangay', value: truncate(esc(f.barangay), 22) },
    { key: 'province', value: truncate(esc(f.province), 22) },
    { key: 'region', value: truncate(esc(f.region), 22) },
    { key: 'landlineNum', value: digitsOnly(f.landlineNum, 7) },
    { key: 'placeOfBirth', value: truncate(placeBirth, 28) },
    { key: 'highestEducation', value: truncate(education, 35) },
    { key: 'pwd', value: esc(f.pwd) },
    { key: 'fourPsBeneficiary', value: esc(f.fourPsBeneficiary) },
    { key: 'indigenousGroup', value: esc(f.indigenousGroup) },
    { key: 'indigenousSpecify', value: truncate(esc(f.indigenousSpecify), 22) },
    { key: 'withGovId', value: esc(f.withGovId) },
    { key: 'govIdType', value: truncate(esc(f.govIdType), 18) },
    { key: 'govIdNumber', value: truncate(esc(f.govIdNumber), 20) },
    { key: 'farmersAssociation', value: esc(f.farmersAssociation) },
    { key: 'farmersAssociationSpecify', value: truncate(esc(f.farmersAssociationSpecify), 28) },
    { key: 'emergencyContactName', value: truncate(esc(f.emergencyContactName), 28) },
    { key: 'emergencyContactNum', value: digitsOnly(f.emergencyContactNum, 11) },
    { key: 'addressFull', value: truncate(esc(f.address), 60) },
    { key: 'mainLivelihood', value: truncate(esc(f.mainLivelihood), 22) },
    { key: 'grossIncomeFarming', value: truncate(esc(f.grossIncomeFarming), 18) },
    { key: 'grossIncomeNonFarming', value: truncate(esc(f.grossIncomeNonFarming), 18) },
    { key: 'clientLastName', value: truncate(esc(f.lastName), 18) },
    { key: 'clientMiddleName', value: truncate(esc(f.middleName), 18) },
    { key: 'clientExtensionName', value: truncate(esc(f.extensionName), 8) },
    { key: 'clientFirstName', value: truncate(esc(f.firstName), 18) },
  ]

  const overlayDivs = fields
    .filter(({ key }) => POS[key])
    .map(({ key, value }) => {
      const str = value != null && value !== '' ? String(value).trim() : ''
      if (str === '') return ''
      const p = POS[key]
      return `<div style="${styleFor(p)}">${esc(str)}</div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RSBSA Enrollment Form</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 595px; height: 842px; overflow: hidden; }
    .page {
      position: relative;
      width: 595px;
      height: 842px;
      overflow: hidden;
      background-image: url('${imageDataUrl.replace(/'/g, "\\'")}');
      background-size: cover;
      background-position: top center;
      background-repeat: no-repeat;
      background-color: #fff;
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
