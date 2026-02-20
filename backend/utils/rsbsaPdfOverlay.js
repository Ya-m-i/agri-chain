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

/** Position map: left/top in %, width in %. Matches typical RSBSA layout (header → enrollment → Part I two cols → Part II → client copy). */
const POS = {
  dateAdministered: { left: 54, top: 16, width: 20 },
  refRegion: { left: 14, top: 19, width: 8 },
  refProvince: { left: 26, top: 19, width: 8 },
  refCityMuni: { left: 38, top: 19, width: 8 },
  refBarangay: { left: 50, top: 19, width: 8 },
  lastName: { left: 10, top: 24, width: 36 },
  firstName: { left: 50, top: 24, width: 36 },
  middleName: { left: 10, top: 27, width: 36 },
  extensionName: { left: 50, top: 27, width: 36 },
  gender: { left: 50, top: 30, width: 18 },
  houseLotPurok: { left: 10, top: 33, width: 36 },
  streetSitioSubdv: { left: 50, top: 33, width: 36 },
  barangay: { left: 10, top: 36, width: 36 },
  municipalityCity: { left: 50, top: 36, width: 36 },
  province: { left: 10, top: 39, width: 36 },
  region: { left: 50, top: 39, width: 36 },
  contactNum: { left: 10, top: 42, width: 36 },
  landlineNum: { left: 50, top: 42, width: 36 },
  birthday: { left: 10, top: 45, width: 36 },
  placeOfBirth: { left: 50, top: 45, width: 36 },
  highestEducation: { left: 10, top: 48, width: 36 },
  religion: { left: 50, top: 48, width: 36 },
  civilStatus: { left: 10, top: 51, width: 36 },
  pwd: { left: 50, top: 51, width: 18 },
  fourPsBeneficiary: { left: 50, top: 54, width: 18 },
  indigenousGroup: { left: 50, top: 57, width: 18 },
  indigenousSpecify: { left: 50, top: 60, width: 36 },
  withGovId: { left: 50, top: 63, width: 18 },
  govIdType: { left: 50, top: 66, width: 18 },
  govIdNumber: { left: 50, top: 69, width: 36 },
  farmersAssociation: { left: 50, top: 72, width: 18 },
  farmersAssociationSpecify: { left: 50, top: 75, width: 36 },
  spouseName: { left: 10, top: 54, width: 36 },
  motherMaidenName: { left: 10, top: 57, width: 36 },
  householdHead: { left: 10, top: 60, width: 36 },
  householdHeadName: { left: 10, top: 63, width: 36 },
  householdHeadRelationship: { left: 10, top: 66, width: 36 },
  numHouseholdMembers: { left: 10, top: 69, width: 12 },
  numMale: { left: 26, top: 69, width: 12 },
  numFemale: { left: 42, top: 69, width: 12 },
  emergencyContactName: { left: 10, top: 78, width: 36 },
  emergencyContactNum: { left: 50, top: 78, width: 36 },
  address: { left: 10, top: 81, width: 80 },
  addressFull: { left: 10, top: 84, width: 80 },
  mainLivelihood: { left: 10, top: 87, width: 80 },
  grossIncomeFarming: { left: 10, top: 90, width: 35 },
  grossIncomeNonFarming: { left: 50, top: 90, width: 35 },
  clientLastName: { left: 10, top: 93, width: 20 },
  clientMiddleName: { left: 32, top: 93, width: 20 },
  clientExtensionName: { left: 54, top: 93, width: 15 },
  clientFirstName: { left: 72, top: 93, width: 20 },
}

function styleFor(pos) {
  const w = pos.width != null ? pos.width : 20
  return `position:absolute;left:${pos.left}%;top:${pos.top}%;width:${w}%;font-size:9px;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:transparent;border:none;color:#000;font-family:Arial,sans-serif;padding:0 1px;margin:0;z-index:2;display:block;`
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
    body { margin: 0; padding: 0; width: 595px; height: 842px; overflow: visible; }
    .page {
      position: relative;
      width: 595px;
      height: 842px;
      overflow: visible;
      background-image: url('${imageDataUrl.replace(/'/g, "\\'")}');
      background-size: contain;
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
