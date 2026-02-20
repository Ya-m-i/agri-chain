/**
 * Build HTML for RSBSA Enrollment Form (matches official template layout).
 * Receives formState (same shape as frontend farmerToRsbsaFormState).
 * Used by Puppeteer to generate PDF.
 */
function esc(v) {
  if (v == null || v === '') return '—'
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cb(checked) {
  return checked ? '☑' : '☐'
}

function getRSBSAFormHtml(formState) {
  const f = formState || {}
  const ed = Array.isArray(f.highestEducation) ? f.highestEducation.join(', ') : (f.highestEducation || '—')
  const placeBirth = [f.placeOfBirthProvince, f.placeOfBirthCountry].filter(Boolean).join(', ') || '—'
  const farming = [f.farmingRice && 'Rice', f.farmingCorn && 'Corn', f.farmingOtherCrops, f.farmingLivestock, f.farmingPoultry].filter(Boolean).join(', ') || '—'
  const fullName = [f.lastName, f.firstName, f.middleName, f.extensionName].filter(Boolean).join(', ') || '—'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RSBSA Enrollment Form</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 12px 14px; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; background: #fff; }
    .page { max-width: 210mm; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }
    .header-left { flex: 1; }
    .logo-placeholder { width: 42px; height: 42px; border: 1px solid #333; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; font-size: 8px; }
    .dept { font-size: 9px; font-weight: bold; margin-bottom: 2px; }
    .main-title { font-size: 16px; font-weight: bold; text-transform: uppercase; margin: 2px 0; }
    .subtitle { font-size: 10px; color: #333; }
    .header-right { text-align: right; }
    .revised { font-size: 8px; margin-bottom: 4px; }
    .photo-box { width: 52px; height: 62px; border: 2px solid #000; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7px; text-align: center; padding: 4px; }
    .anikita { text-align: center; margin: 8px 0 10px; font-size: 10px; font-weight: bold; }
    .section-bar { background: #2d2d2d; color: #fff; padding: 6px 10px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin: 8px 0 6px; }
    .row { display: flex; gap: 8px; margin-bottom: 6px; }
    .col { flex: 1; }
    .label { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #444; margin-bottom: 2px; }
    .field { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 4px; font-size: 10px; }
    .field-full { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 4px; font-size: 10px; width: 100%; }
    .two-cols { display: flex; gap: 12px; }
    .two-cols .col { flex: 1; }
    .checkbox-row { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
    .checkbox-row span { font-size: 10px; }
    .ref-row { display: flex; gap: 6px; margin-bottom: 4px; }
    .ref-box { flex: 1; border: 1px solid #000; min-height: 22px; padding: 4px; font-size: 9px; }
    .ref-label { font-size: 6px; text-align: center; margin-top: 2px; }
    .date-admin { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .client-copy { margin-top: 14px; padding-top: 10px; border-top: 2px dashed #666; }
    .client-copy .main-title { font-size: 11px; }
    .not-for-sale { font-weight: bold; text-transform: uppercase; margin-top: 8px; font-size: 10px; }
    .part2-cols { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
    .part2-cols .block { flex: 1; min-width: 120px; border: 1px solid #ccc; padding: 6px; margin-bottom: 6px; }
    .part2-cols .block .label { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-left">
        <div class="logo-placeholder">DA<br/>1898</div>
        <div class="dept">DEPARTMENT OF AGRICULTURE</div>
        <div class="main-title">ANI AT KITA RSBSA ENROLLMENT FORM</div>
        <div class="subtitle">REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)</div>
      </div>
      <div class="header-right">
        <div class="revised">REVISED VERSION: 03-2021</div>
        <div class="photo-box">
          <span>2x2 PICTURE</span>
          <span>PHOTO TAKEN WITHIN 6 MONTHS</span>
        </div>
      </div>
    </div>
    <div class="anikita">Masaganang ANI Mataas na KITA</div>

    <div class="label">ENROLLMENT TYPE &amp; DATE ADMINISTERED</div>
    <div class="date-admin">
      <span>${cb(f.enrollmentType === 'New')} New</span>
      <span>${cb(f.enrollmentType === 'Updating')} Updating</span>
      <span style="margin-left: 12px;">Date: ${esc(f.dateAdministered)}</span>
    </div>

    <div class="label">REFERENCE NUMBER</div>
    <div class="ref-row">
      <div style="flex:1;"><div class="ref-box">${esc(f.refRegion)}</div><div class="ref-label">REGION</div></div>
      <div style="flex:1;"><div class="ref-box">${esc(f.refProvince)}</div><div class="ref-label">PROVINCE</div></div>
      <div style="flex:1;"><div class="ref-box">${esc(f.refCityMuni)}</div><div class="ref-label">CITY/MUNI</div></div>
      <div style="flex:1;"><div class="ref-box">${esc(f.refBarangay)}</div><div class="ref-label">BARANGAY</div></div>
    </div>

    <div class="section-bar">PART I: PERSONAL INFORMATION</div>

    <div class="row">
      <div class="col">
        <div class="label">SURNAME</div>
        <div class="field">${esc(f.lastName)}</div>
      </div>
      <div class="col">
        <div class="label">FIRST NAME</div>
        <div class="field">${esc(f.firstName)}</div>
      </div>
      <div class="col" style="flex: 0.4;">
        <div class="label">SEX</div>
        <div class="checkbox-row"><span>${cb(f.gender === 'Male')} Male</span> <span>${cb(f.gender === 'Female')} Female</span></div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="label">MIDDLE NAME</div>
        <div class="field">${esc(f.middleName)}</div>
      </div>
      <div class="col">
        <div class="label">EXTENSION NAME</div>
        <div class="field">${esc(f.extensionName)}</div>
      </div>
    </div>

    <div class="label" style="margin-top: 8px;">ADDRESS</div>
    <div class="row">
      <div class="col"><div class="label">HOUSE/LOT/BLDG. NO./PUROK</div><div class="field">${esc(f.houseLotPurok)}</div></div>
      <div class="col"><div class="label">STREET/SITIO/SUBDV.</div><div class="field">${esc(f.streetSitioSubdv)}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="label">MUNICIPALITY/CITY</div><div class="field">${esc(f.municipalityCity)}</div></div>
      <div class="col"><div class="label">BARANGAY</div><div class="field">${esc(f.barangay)}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="label">PROVINCE</div><div class="field">${esc(f.province)}</div></div>
      <div class="col"><div class="label">REGION</div><div class="field">${esc(f.region)}</div></div>
    </div>
    <div style="margin-bottom: 6px;">
      <div class="label">FULL ADDRESS (OR MAP)</div>
      <div class="field">${esc(f.address)}</div>
    </div>

    <div class="row">
      <div class="col"><div class="label">MOBILE NUMBER</div><div class="field">${esc(f.contactNum)}</div></div>
      <div class="col"><div class="label">LANDLINE NUMBER</div><div class="field">${esc(f.landlineNum)}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="label">DATE OF BIRTH</div><div class="field">${esc(f.birthday)}</div></div>
      <div class="col"><div class="label">PLACE OF BIRTH (PROVINCE/CITY, COUNTRY)</div><div class="field">${esc(placeBirth)}</div></div>
    </div>

    <div class="label">HIGHEST FORMAL EDUCATION</div>
    <div class="field" style="margin-bottom: 8px;">${esc(ed)}</div>

    <div class="two-cols">
      <div class="col">
        <div class="label">PWD</div><div class="field">${esc(f.pwd)}</div>
        <div class="label">RELIGION</div><div class="field">${esc(f.religion === 'Others' ? f.religionOthers : f.religion)}</div>
        <div class="label">4P's BENEFICIARY</div><div class="field">${esc(f.fourPsBeneficiary)}</div>
        <div class="label">CIVIL STATUS</div><div class="field">${esc(f.civilStatus)}</div>
        <div class="label">NAME OF SPOUSE (IF MARRIED)</div><div class="field">${esc(f.spouseName)}</div>
        <div class="label">MOTHER'S MAIDEN NAME</div><div class="field">${esc(f.motherMaidenName)}</div>
        <div class="label">HOUSEHOLD HEAD</div><div class="field">${esc(f.householdHead)}</div>
        <div class="label">NO. OF LIVING HOUSEHOLD MEMBERS</div><div class="field">${esc(f.numHouseholdMembers)}</div>
        <div class="label">NO. OF MALE / FEMALE</div><div class="field">${esc(f.numMale)} / ${esc(f.numFemale)}</div>
      </div>
      <div class="col">
        <div class="label">MEMBER OF INDIGENOUS GROUP</div><div class="field">${esc(f.indigenousGroup === 'Yes' ? f.indigenousSpecify : f.indigenousGroup)}</div>
        <div class="label">WITH GOVERNMENT ID</div><div class="field">${esc(f.withGovId === 'Yes' ? (f.govIdType + ' ' + f.govIdNumber).trim() : f.withGovId)}</div>
        <div class="label">MEMBER OF FARMERS ASSOCIATION/COOPERATIVE</div><div class="field">${esc(f.farmersAssociation === 'Yes' ? f.farmersAssociationSpecify : f.farmersAssociation)}</div>
        <div class="label">PERSON TO NOTIFY IN CASE OF EMERGENCY</div><div class="field">${esc(f.emergencyContactName)}</div>
        <div class="label">EMERGENCY CONTACT NUMBER</div><div class="field">${esc(f.emergencyContactNum)}</div>
      </div>
    </div>

    <div class="section-bar">PART II: FARM PROFILE</div>
    <div class="label">MAIN LIVELIHOOD</div>
    <div class="checkbox-row" style="margin-bottom: 8px;">
      <span>${cb(f.mainLivelihood === 'FARMER')} FARMER</span>
      <span>${cb(f.mainLivelihood === 'FARMWORKER/LABORER')} FARMWORKER/LABORER</span>
      <span>${cb(f.mainLivelihood === 'FISHERFOLK')} FISHERFOLK</span>
      <span>${cb(f.mainLivelihood === 'AGRI YOUTH')} AGRI YOUTH</span>
    </div>
    <div class="label">TYPE OF FARMING ACTIVITY (if FARMER)</div>
    <div class="field" style="margin-bottom: 8px;">${esc(farming)}</div>
    <div class="row">
      <div class="col"><div class="label">GROSS ANNUAL INCOME LAST YEAR - FARMING</div><div class="field">${esc(f.grossIncomeFarming)}</div></div>
      <div class="col"><div class="label">GROSS ANNUAL INCOME LAST YEAR - NON-FARMING</div><div class="field">${esc(f.grossIncomeNonFarming)}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="label">CROP TYPE</div><div class="field">${esc(f.cropType)}</div></div>
      <div class="col"><div class="label">CROP AREA (HECTARES)</div><div class="field">${esc(f.cropArea)}</div></div>
    </div>
    <div class="row">
      <div class="col"><div class="label">LOT NUMBER</div><div class="field">${esc(f.lotNumber)}</div></div>
      <div class="col"><div class="label">LOT AREA</div><div class="field">${esc(f.lotArea)}</div></div>
    </div>
    <div class="checkbox-row" style="margin-top: 6px;">
      <span>${cb(f.rsbsaRegistered)} RSBSA REGISTERED: Yes (Required for some programs)</span>
    </div>

    <div class="client-copy">
      <div class="main-title">REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA) - ENROLLMENT CLIENT'S COPY</div>
      <div style="margin-top: 6px;">Ref: ${esc(f.refRegion)} / ${esc(f.refProvince)} / ${esc(f.refCityMuni)} / ${esc(f.refBarangay)}</div>
      <div style="margin-top: 4px;">Name: ${esc(fullName)}</div>
      <div class="not-for-sale">THIS FORM IS NOT FOR SALE.</div>
    </div>
  </div>
</body>
</html>`
}

module.exports = { getRSBSAFormHtml }
