/**
 * Build HTML for RSBSA Enrollment Form - matches official template (Image 1) exactly.
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

/** Render value into a row of small segmented boxes (e.g. for date or phone). Use digitsOnly=false for ref (allow any char). */
function segmentedBoxes(value, length, opts) {
  const digitsOnly = opts && opts.digitsOnly
  const placeholder = (opts && opts.placeholder) || ''
  let s = value != null && value !== '' ? String(value) : ''
  if (digitsOnly) s = s.replace(/\D/g, '')
  s = s.slice(0, length)
  let html = '<div class="seg-row">'
  for (let i = 0; i < length; i++) {
    html += `<span class="seg-box">${s[i] || (placeholder[i] || '')}</span>`
  }
  html += '</div>'
  return html
}

/** Date as 8 boxes (MM DD YYYY) - pass value like 2024-01-15 */
function dateBoxes(dateStr) {
  if (!dateStr) return segmentedBoxes('', 8, { placeholder: 'MMDDYYYY' })
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return segmentedBoxes('', 8, { placeholder: 'MMDDYYYY' })
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return segmentedBoxes(mm + dd + yyyy, 8)
}

function getRSBSAFormHtml(formState) {
  const f = formState || {}
  const placeBirthProv = f.placeOfBirthProvince || '—'
  const placeBirthCountry = f.placeOfBirthCountry || '—'
  const ed = Array.isArray(f.highestEducation) ? f.highestEducation : (f.highestEducation ? [f.highestEducation] : [])
  const farming = [f.farmingRice && 'Rice', f.farmingCorn && 'Corn', f.farmingOtherCrops, f.farmingLivestock, f.farmingPoultry].filter(Boolean)
  const fullName = [f.lastName, f.firstName, f.middleName, f.extensionName].filter(Boolean).join(', ') || '—'

  const educationOptions = ['Pre-school', 'Elementary', 'High School (non K-12)', 'Junior High School (K-12)', 'Senior High School (K-12)', 'College', 'Vocational', 'Post-graduate', 'None']
  const edChecked = (opt) => ed.includes(opt) ? '☑' : '☐'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RSBSA Enrollment Form</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 4px 6px; font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #000; background: #fff; }
    /* Single page: compact layout so content fits A4 */
    .page { max-width: 210mm; margin: 0 auto; padding: 5px 7px; border: 2px solid #000; }
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; }
    .header-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
    .logo-wrap { flex-shrink: 0; }
    .logo-circle { width: 36px; height: 36px; border: 2px solid #000; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 5px; text-align: center; line-height: 1.2; }
    .logo-circle .da { font-weight: bold; }
    .logo-circle .yr { margin-top: 1px; }
    .title-wrap { flex: 1; }
    .dept { font-size: 6px; font-weight: bold; margin-bottom: 0; }
    .main-title { font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 0 1px 0; letter-spacing: 0.02em; }
    .subtitle { font-size: 7px; font-weight: bold; text-transform: uppercase; color: #222; }
    .header-right { text-align: right; flex-shrink: 0; }
    .revised { font-size: 6px; margin-bottom: 2px; }
    .photo-box { width: 40px; height: 48px; border: 2px solid #000; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6px; text-align: center; padding: 1px; font-weight: bold; }
    .photo-box span { display: block; }
    .anikita { text-align: center; margin: 3px 0 4px; font-size: 7px; font-weight: bold; }
    /* Enrollment box: bordered */
    .enrollment-box { border: 1px solid #000; padding: 4px 6px; margin-bottom: 4px; }
    .section-bar { background: #2d2d2d; color: #fff; padding: 3px 8px; font-weight: bold; font-size: 9px; text-transform: uppercase; margin: 0; letter-spacing: 0.02em; }
    .part1-inner { border: 1px solid #000; border-top: none; padding: 4px 6px; }
    .part2-inner { border: 1px solid #000; border-top: none; padding: 4px 6px; }
    /* Segmented boxes */
    .seg-row { display: flex; gap: 1px; align-items: stretch; }
    .seg-box { width: 12px; height: 16px; border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; font-size: 7px; }
    .ref-seg-row { display: flex; gap: 2px; margin-bottom: 1px; }
    .ref-seg-group { flex: 1; display: flex; gap: 1px; }
    .ref-seg-group .seg-box { flex: 1; min-width: 10px; }
    .ref-labels { display: flex; gap: 2px; font-size: 5px; text-align: center; margin-bottom: 4px; }
    .ref-labels span { flex: 1; }
    /* All input fields: full border (box) like official form */
    .label { font-size: 6px; font-weight: bold; text-transform: uppercase; color: #333; margin-bottom: 0; }
    .field { border: 1px solid #000; min-height: 14px; padding: 1px 3px; font-size: 8px; }
    .two-cols { display: flex; gap: 8px; margin-bottom: 2px; }
    .two-cols .col { flex: 1; }
    .checkbox-inline { font-size: 7px; margin-right: 6px; }
    .part1-left .label, .part1-right .label { margin-top: 2px; }
    .part1-left .label:first-child, .part1-right .label:first-child { margin-top: 0; }
    .addr-block .row { display: flex; gap: 6px; margin-bottom: 2px; }
    .addr-block .row .field { flex: 1; }
    .education-cols { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 1px; }
    .education-cols .col { min-width: 70px; }
    .education-cols .checkbox-inline { display: block; margin-bottom: 0; font-size: 6px; }
    /* Part II: four columns with clear borders */
    .part2-cols { display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
    .part2-cols .block { flex: 1; min-width: 75px; border: 1px solid #000; padding: 4px; }
    .part2-cols .block-title { font-size: 7px; font-weight: bold; margin-bottom: 2px; }
    .part2-cols .block .label { margin-top: 2px; }
    .part2-cols .block .label:first-of-type { margin-top: 0; }
    .part2-cols .note { font-size: 5px; margin: 2px 0; line-height: 1.2; color: #333; }
    .income-row { display: flex; gap: 6px; margin-top: 4px; }
    .income-row .col { flex: 1; }
    /* Client's copy: bordered box, dashed line at top */
    .client-copy { margin-top: 6px; padding: 4px 6px; border: 1px solid #000; border-top: 2px dashed #555; position: relative; }
    .client-copy .scissors { position: absolute; right: 4px; top: 2px; font-size: 8px; }
    .client-copy .main-title { font-size: 8px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .client-copy .name-row { display: flex; gap: 6px; margin: 2px 0; }
    .client-copy .name-row .field { border: 1px solid #000; min-height: 12px; font-size: 8px; }
    .client-copy .name-row > div { flex: 1; }
    .not-for-sale { font-weight: bold; text-transform: uppercase; margin-top: 4px; font-size: 8px; }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header: DA logo, title, revised + 2x2 box -->
    <div class="header">
      <div class="header-left">
        <div class="logo-wrap">
          <div class="logo-circle">
            <span class="da">DEPARTMENT OF AGRICULTURE</span>
            <span class="yr">1898</span>
          </div>
        </div>
        <div class="title-wrap">
          <div class="dept">DEPARTMENT OF AGRICULTURE</div>
          <div class="main-title">ANI AT KITA RSBSA ENROLLMENT FORM</div>
          <div class="subtitle">REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)</div>
        </div>
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

    <div class="enrollment-box">
    <!-- Enrollment Type & Date Administered -->
    <div class="label">ENROLLMENT TYPE &amp; DATE ADMINISTERED:</div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
      <span class="checkbox-inline">${cb(f.enrollmentType === 'New')} New</span>
      <span class="checkbox-inline">${cb(f.enrollmentType === 'Updating')} Updating</span>
      <span style="margin-left: 4px;">Date:</span>
      ${dateBoxes(f.dateAdministered)}
    </div>

    <!-- Reference Number: segmented boxes in 4 groups -->
    <div class="label">REFERENCE NUMBER:</div>
    <div class="ref-seg-row">
      <div class="ref-seg-group">${segmentedBoxes(f.refRegion, 4)}</div>
      <div class="ref-seg-group">${segmentedBoxes(f.refProvince, 4)}</div>
      <div class="ref-seg-group">${segmentedBoxes(f.refCityMuni, 4)}</div>
      <div class="ref-seg-group">${segmentedBoxes(f.refBarangay, 4)}</div>
    </div>
    <div class="ref-labels">
      <span>REGION</span><span>PROVINCE</span><span>CITY/MUNI</span><span>BARANGAY</span>
    </div>
    </div>

    <div class="section-bar">PART I: PERSONAL INFORMATION</div>
    <div class="part1-inner">
    <!-- Part I: Two columns - Left: Surname, Middle name, Address block, Mobile, DOB, Religion, Civil status, Spouse, Mother's maiden, Household head, members. Right: First name, Extension, Sex, Barangay, Region, Landline, Place of birth, Education, PWD, 4Ps, Indigenous, Gov ID, Farmers assoc, Emergency -->
    <div class="two-cols">
      <div class="col part1-left">
        <div class="label">SURNAME</div>
        <div class="field">${esc(f.lastName)}</div>
        <div class="label">MIDDLE NAME</div>
        <div class="field">${esc(f.middleName)}</div>
        <div class="label" style="margin-top: 6px;">ADDRESS</div>
        <div class="addr-block">
          <div class="row">
            <div><div class="label">HOUSE/LOT/BLDG. NO./PUROK</div><div class="field">${esc(f.houseLotPurok)}</div></div>
            <div><div class="label">STREET/SITIO/SUBDV.</div><div class="field">${esc(f.streetSitioSubdv)}</div></div>
          </div>
          <div class="row">
            <div><div class="label">MUNICIPALITY/CITY</div><div class="field">${esc(f.municipalityCity)}</div></div>
            <div><div class="label">BARANGAY</div><div class="field">${esc(f.barangay)}</div></div>
          </div>
          <div class="row">
            <div><div class="label">PROVINCE</div><div class="field">${esc(f.province)}</div></div>
            <div><div class="label">REGION</div><div class="field">${esc(f.region)}</div></div>
          </div>
        </div>
        <div class="label">MOBILE NUMBER:</div>
        ${segmentedBoxes(f.contactNum || '', 11, { digitsOnly: true })}
        <div class="label">DATE OF BIRTH:</div>
        ${dateBoxes(f.birthday)}
        <div class="label">RELIGION:</div>
        <div><span class="checkbox-inline">${cb(f.religion === 'Christianity')} Christianity</span><span class="checkbox-inline">${cb(f.religion === 'Islam')} Islam</span><span class="checkbox-inline">${cb(f.religion === 'Others')} Others, specify.</span></div>
        <div class="field" style="margin-top: 2px;">${f.religion === 'Others' ? esc(f.religionOthers) : ''}</div>
        <div class="label">CIVIL STATUS:</div>
        <div><span class="checkbox-inline">${cb(f.civilStatus === 'Single')} Single</span><span class="checkbox-inline">${cb(f.civilStatus === 'Married')} Married</span><span class="checkbox-inline">${cb(f.civilStatus === 'Widowed')} Widowed</span><span class="checkbox-inline">${cb(f.civilStatus === 'Separated')} Separated</span></div>
        <div class="label">NAME OF SPOUSE IF MARRIED:</div>
        <div class="field">${esc(f.spouseName)}</div>
        <div class="label">MOTHER'S MAIDEN NAME:</div>
        <div class="field">${esc(f.motherMaidenName)}</div>
        <div class="label">HOUSEHOLD HEAD?</div>
        <div><span class="checkbox-inline">${cb(f.householdHead === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.householdHead === 'No')} No</span></div>
        <div class="label">If no, name of household head:</div>
        <div class="field">${esc(f.householdHeadName)}</div>
        <div class="label">Relationship:</div>
        <div class="field">${esc(f.householdHeadRelationship)}</div>
        <div class="label">No. of living household members:</div>
        <div class="field">${esc(f.numHouseholdMembers)}</div>
        <div class="label">No. of male:</div>
        <div class="field">${esc(f.numMale)}</div>
        <div class="label">No. of female:</div>
        <div class="field">${esc(f.numFemale)}</div>
      </div>
      <div class="col part1-right">
        <div class="label">FIRST NAME</div>
        <div class="field">${esc(f.firstName)}</div>
        <div class="label">EXTENSION NAME</div>
        <div class="field">${esc(f.extensionName)}</div>
        <div class="label">SEX:</div>
        <div><span class="checkbox-inline">${cb(f.gender === 'Male')} Male</span><span class="checkbox-inline">${cb(f.gender === 'Female')} Female</span></div>
        <div class="label">BARANGAY</div>
        <div class="field">${esc(f.barangay)}</div>
        <div class="label">REGION</div>
        <div class="field">${esc(f.region)}</div>
        <div class="label">LANDLINE NUMBER:</div>
        ${segmentedBoxes(f.landlineNum || '', 7, { digitsOnly: true })}
        <div class="label">PLACE OF BIRTH:</div>
        <div class="field">${esc(placeBirthProv)}</div>
        <div class="label">PROVINCE/CITY/MUNI</div>
        <div class="label">COUNTRY</div>
        <div class="field">${esc(placeBirthCountry)}</div>
        <div class="label">HIGHEST FORMAL EDUCATION:</div>
        <div class="education-cols">
          <div class="col">${educationOptions.slice(0, 3).map(o => `<span class="checkbox-inline">${edChecked(o)} ${o}</span>`).join('')}</div>
          <div class="col">${educationOptions.slice(3, 6).map(o => `<span class="checkbox-inline">${edChecked(o)} ${o}</span>`).join('')}</div>
          <div class="col">${educationOptions.slice(6, 9).map(o => `<span class="checkbox-inline">${edChecked(o)} ${o}</span>`).join('')}</div>
        </div>
        <div class="label">PERSON WITH DISABILITY (PWD):</div>
        <div><span class="checkbox-inline">${cb(f.pwd === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.pwd === 'No')} No</span></div>
        <div class="label">4P's Beneficiary?</div>
        <div><span class="checkbox-inline">${cb(f.fourPsBeneficiary === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.fourPsBeneficiary === 'No')} No</span></div>
        <div class="label">Member of an Indigenous Group?</div>
        <div><span class="checkbox-inline">${cb(f.indigenousGroup === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.indigenousGroup === 'No')} No</span></div>
        <div class="label">If yes, specify.</div>
        <div class="field">${esc(f.indigenousGroup === 'Yes' ? f.indigenousSpecify : '')}</div>
        <div class="label">With Government ID?</div>
        <div><span class="checkbox-inline">${cb(f.withGovId === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.withGovId === 'No')} No</span></div>
        <div class="label">If yes, specify ID Type:</div>
        <div class="field">${esc(f.withGovId === 'Yes' ? f.govIdType : '')}</div>
        <div class="label">ID Number:</div>
        <div class="field">${esc(f.withGovId === 'Yes' ? f.govIdNumber : '')}</div>
        <div class="label">Member of any Farmers Association/Cooperative?</div>
        <div><span class="checkbox-inline">${cb(f.farmersAssociation === 'Yes')} Yes</span><span class="checkbox-inline">${cb(f.farmersAssociation === 'No')} No</span></div>
        <div class="label">If yes, specify.</div>
        <div class="field">${esc(f.farmersAssociation === 'Yes' ? f.farmersAssociationSpecify : '')}</div>
        <div class="label">PERSON TO NOTIFY IN CASE OF EMERGENCY:</div>
        <div class="field">${esc(f.emergencyContactName)}</div>
        <div class="label">CONTACT NUMBER:</div>
        ${segmentedBoxes(f.emergencyContactNum || '', 11, { digitsOnly: true })}
      </div>
    </div>

    <div style="margin-top: 4px;">
      <div class="label">FULL ADDRESS (OR MAP)</div>
      <div class="field">${esc(f.address)}</div>
    </div>
    </div>

    <div class="section-bar">PART II: FARM PROFILE</div>
    <div class="part2-inner">
    <div class="label">MAIN LIVELIHOOD</div>
    <div style="margin-bottom: 4px;">
      <span class="checkbox-inline">${cb(f.mainLivelihood === 'FARMER')} FARMER</span>
      <span class="checkbox-inline">${cb(f.mainLivelihood === 'FARMWORKER/LABORER')} FARMWORKER/LABORER</span>
      <span class="checkbox-inline">${cb(f.mainLivelihood === 'FISHERFOLK')} FISHERFOLK</span>
      <span class="checkbox-inline">${cb(f.mainLivelihood === 'AGRI YOUTH')} AGRI YOUTH</span>
    </div>

    <!-- Part II: Four columns (For farmers, For farmworkers, For fisherfolk, For agri youth) -->
    <div class="part2-cols">
      <div class="block">
        <div class="block-title">For farmers:</div>
        <div class="label">Type of Farming Activity</div>
        <div><span class="checkbox-inline">${cb(f.farmingRice)} Rice</span><span class="checkbox-inline">${cb(f.farmingCorn)} Corn</span></div>
        <div><span class="checkbox-inline">☐ Other crops, please specify:</span></div>
        <div class="field">${esc(f.farmingOtherCrops)}</div>
        <div><span class="checkbox-inline">☐ Livestock, please specify:</span></div>
        <div class="field">${esc(f.farmingLivestock)}</div>
        <div><span class="checkbox-inline">☐ Poultry, please specify:</span></div>
        <div class="field">${esc(f.farmingPoultry)}</div>
        <div class="label" style="margin-top: 6px;">Gross Annual Income Last Year:</div>
        <div class="label">Farming:</div>
        <div class="field">${esc(f.grossIncomeFarming)}</div>
      </div>
      <div class="block">
        <div class="block-title">For farmworkers:</div>
        <div class="label">Kind of Work</div>
        <div><span class="checkbox-inline">${cb(f.farmworkerLandPrep)} Land Preparation</span></div>
        <div><span class="checkbox-inline">${cb(f.farmworkerPlanting)} Planting/Transplanting</span></div>
        <div><span class="checkbox-inline">${cb(f.farmworkerCultivation)} Cultivation</span></div>
        <div><span class="checkbox-inline">${cb(f.farmworkerHarvesting)} Harvesting</span></div>
        <div><span class="checkbox-inline">☐ Others, please specify:</span></div>
        <div class="field">${esc(f.farmworkerOthers)}</div>
      </div>
      <div class="block">
        <div class="block-title">For fisherfolk:</div>
        <div class="note">The Lending Conduit shall coordinate with the Bureau of Fisheries and Aquatic Resources (BFAR) in the issuance of a certification that the fisherfolk-borrower under PUNLA/PLEA is registered under the Municipal Registration (FishR).</div>
        <div class="label">Type of Fishing Activity</div>
        <div><span class="checkbox-inline">☐ Fish Capture</span><span class="checkbox-inline">☐ Aquaculture</span><span class="checkbox-inline">☐ Gleaning</span></div>
        <div><span class="checkbox-inline">☐ Fish Processing</span><span class="checkbox-inline">☐ Fish Vending</span></div>
        <div><span class="checkbox-inline">☐ Others, please specify:</span></div>
        <div class="field">${esc(f.fisherfolkOthers)}</div>
      </div>
      <div class="block">
        <div class="block-title">For agri youth:</div>
        <div class="note">For the purposes of trainings, financial assistance, and other programs catered to the youth with involvement to any agriculture activity.</div>
        <div class="label">Type of involvement</div>
        <div><span class="checkbox-inline">☐ part of a farming household</span></div>
        <div><span class="checkbox-inline">☐ attending/attended formal agri-fishery related course</span></div>
        <div><span class="checkbox-inline">☐ attending/attended non-formal agri-fishery related course</span></div>
        <div><span class="checkbox-inline">☐ participated in any agricultural activity/program</span></div>
        <div><span class="checkbox-inline">☐ others, specify</span></div>
        <div class="field">${esc(f.agriYouthOthers)}</div>
      </div>
    </div>
    <div class="income-row">
      <div class="col"><div class="label">Non-farming:</div><div class="field">${esc(f.grossIncomeNonFarming)}</div></div>
    </div>
    <div style="margin-top: 4px;">
      <span class="checkbox-inline">${cb(f.rsbsaRegistered)} RSBSA REGISTERED: Yes (Required for some programs)</span>
    </div>
    </div>

    <!-- Client's copy -->
    <div class="client-copy">
      <span class="scissors">✂</span>
      <div class="main-title">REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA) ENROLLMENT CLIENT'S COPY</div>
      <div class="label">Reference Number:</div>
      <div class="ref-seg-row">
        <div class="ref-seg-group">${segmentedBoxes(f.refRegion, 4)}</div>
        <div class="ref-seg-group">${segmentedBoxes(f.refProvince, 4)}</div>
        <div class="ref-seg-group">${segmentedBoxes(f.refCityMuni, 4)}</div>
        <div class="ref-seg-group">${segmentedBoxes(f.refBarangay, 4)}</div>
      </div>
      <div class="ref-labels"><span>REGION</span><span>PROVINCE</span><span>CITY/MUN</span><span>BARANGAY</span></div>
      <div class="client-copy name-row">
        <div><div class="label">SURNAME</div><div class="field">${esc(f.lastName)}</div></div>
        <div><div class="label">MIDDLE NAME</div><div class="field">${esc(f.middleName)}</div></div>
        <div><div class="label">EXTENSION NAME</div><div class="field">${esc(f.extensionName)}</div></div>
        <div><div class="label">FIRST NAME</div><div class="field">${esc(f.firstName)}</div></div>
      </div>
      <div class="not-for-sale">THIS FORM IS NOT FOR SALE.</div>
    </div>
  </div>
</body>
</html>`
}

module.exports = { getRSBSAFormHtml }
