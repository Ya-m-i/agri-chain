"use client"

import { useState, useEffect } from "react"
import { X, User, MapPin, Layers } from "lucide-react"

/** Default empty RSBSA form state (matches template + backend farmer fields) */
export const getDefaultRsbsaFormState = () => ({
  // Core farmer fields (required for API)
  firstName: "",
  middleName: "",
  lastName: "",
  extensionName: "",
  birthday: "",
  gender: "",
  contactNum: "",
  address: "",
  username: "",
  password: "",
  rsbsaRegistered: false,
  // RSBSA enrollment details
  enrollmentType: "New",
  dateAdministered: "",
  refRegion: "",
  refProvince: "",
  refCityMuni: "",
  refBarangay: "",
  // Address breakdown
  houseLotPurok: "",
  streetSitioSubdv: "",
  municipalityCity: "",
  barangay: "",
  province: "",
  region: "",
  landlineNum: "",
  placeOfBirthProvince: "",
  placeOfBirthCountry: "",
  // Part I
  highestEducation: [],
  pwd: "",
  religion: "",
  religionOthers: "",
  fourPsBeneficiary: "",
  civilStatus: "",
  indigenousGroup: "",
  indigenousSpecify: "",
  spouseName: "",
  withGovId: "",
  govIdType: "",
  govIdNumber: "",
  motherMaidenName: "",
  farmersAssociation: "",
  farmersAssociationSpecify: "",
  householdHead: "",
  householdHeadName: "",
  householdHeadRelationship: "",
  emergencyContactName: "",
  emergencyContactNum: "",
  numHouseholdMembers: "",
  numMale: "",
  numFemale: "",
  // Part II
  mainLivelihood: "",
  farmingRice: false,
  farmingCorn: false,
  farmingOtherCrops: "",
  farmingLivestock: "",
  farmingPoultry: "",
  farmworkerLandPrep: false,
  farmworkerPlanting: false,
  farmworkerCultivation: false,
  farmworkerHarvesting: false,
  farmworkerOthers: "",
  fisherfolkType: "",
  fisherfolkOthers: "",
  agriYouthType: [],
  agriYouthOthers: "",
  grossIncomeFarming: "",
  grossIncomeNonFarming: "",
  // Farm (existing)
  cropType: "",
  cropArea: "",
  lotNumber: "",
  lotArea: "",
  isCertified: false,
  periodFrom: "",
  periodTo: "",
  agency: "",
  insuranceType: "",
})

/** Map farmer from API to form state (for view/edit) */
export const farmerToRsbsaFormState = (farmer) => {
  if (!farmer) return getDefaultRsbsaFormState()
  const rd = farmer.rsbsaData || {}
  return {
    firstName: farmer.firstName || "",
    middleName: farmer.middleName || "",
    lastName: farmer.lastName || "",
    extensionName: rd.extensionName || "",
    birthday: farmer.birthday || "",
    gender: farmer.gender || "",
    contactNum: farmer.contactNum || "",
    address: farmer.address || "",
    username: farmer.username || "",
    password: "",
    rsbsaRegistered: !!farmer.rsbsaRegistered,
    enrollmentType: rd.enrollmentType || "New",
    dateAdministered: rd.dateAdministered || "",
    refRegion: rd.refRegion || "",
    refProvince: rd.refProvince || "",
    refCityMuni: rd.refCityMuni || "",
    refBarangay: rd.refBarangay || "",
    houseLotPurok: rd.houseLotPurok || "",
    streetSitioSubdv: rd.streetSitioSubdv || "",
    municipalityCity: rd.municipalityCity || "",
    barangay: rd.barangay || "",
    province: rd.province || "",
    region: rd.region || "",
    landlineNum: rd.landlineNum || "",
    placeOfBirthProvince: rd.placeOfBirthProvince || "",
    placeOfBirthCountry: rd.placeOfBirthCountry || "",
    highestEducation: Array.isArray(rd.highestEducation) ? rd.highestEducation : [],
    pwd: rd.pwd || "",
    religion: rd.religion || "",
    religionOthers: rd.religionOthers || "",
    fourPsBeneficiary: rd.fourPsBeneficiary || "",
    civilStatus: rd.civilStatus || "",
    indigenousGroup: rd.indigenousGroup || "",
    indigenousSpecify: rd.indigenousSpecify || "",
    spouseName: rd.spouseName || "",
    withGovId: rd.withGovId || "",
    govIdType: rd.govIdType || "",
    govIdNumber: rd.govIdNumber || "",
    motherMaidenName: rd.motherMaidenName || "",
    farmersAssociation: rd.farmersAssociation || "",
    farmersAssociationSpecify: rd.farmersAssociationSpecify || "",
    householdHead: rd.householdHead || "",
    householdHeadName: rd.householdHeadName || "",
    householdHeadRelationship: rd.householdHeadRelationship || "",
    emergencyContactName: rd.emergencyContactName || "",
    emergencyContactNum: rd.emergencyContactNum || "",
    numHouseholdMembers: rd.numHouseholdMembers || "",
    numMale: rd.numMale || "",
    numFemale: rd.numFemale || "",
    mainLivelihood: rd.mainLivelihood || "",
    farmingRice: !!rd.farmingRice,
    farmingCorn: !!rd.farmingCorn,
    farmingOtherCrops: rd.farmingOtherCrops || "",
    farmingLivestock: rd.farmingLivestock || "",
    farmingPoultry: rd.farmingPoultry || "",
    farmworkerLandPrep: !!rd.farmworkerLandPrep,
    farmworkerPlanting: !!rd.farmworkerPlanting,
    farmworkerCultivation: !!rd.farmworkerCultivation,
    farmworkerHarvesting: !!rd.farmworkerHarvesting,
    farmworkerOthers: rd.farmworkerOthers || "",
    fisherfolkType: rd.fisherfolkType || "",
    fisherfolkOthers: rd.fisherfolkOthers || "",
    agriYouthType: Array.isArray(rd.agriYouthType) ? rd.agriYouthType : [],
    agriYouthOthers: rd.agriYouthOthers || "",
    grossIncomeFarming: rd.grossIncomeFarming || "",
    grossIncomeNonFarming: rd.grossIncomeNonFarming || "",
    cropType: farmer.cropType || "",
    cropArea: farmer.cropArea || "",
    lotNumber: farmer.lotNumber || "",
    lotArea: farmer.lotArea || "",
    isCertified: !!farmer.isCertified,
    periodFrom: farmer.periodFrom || "",
    periodTo: farmer.periodTo || "",
    agency: farmer.agency || "",
    insuranceType: farmer.insuranceType || "",
  }
}

/** Build API payload from form state (for create/update) */
export const rsbsaFormStateToFarmerPayload = (form) => {
  const {
    firstName, middleName, lastName, extensionName, birthday, gender, contactNum, address,
    username, password, rsbsaRegistered, cropType, cropArea, lotNumber, lotArea,
    isCertified, periodFrom, periodTo, agency, insuranceType,
    enrollmentType, dateAdministered, refRegion, refProvince, refCityMuni, refBarangay,
    houseLotPurok, streetSitioSubdv, municipalityCity, barangay, province, region,
    landlineNum, placeOfBirthProvince, placeOfBirthCountry, highestEducation,
    pwd, religion, religionOthers, fourPsBeneficiary, civilStatus, indigenousGroup, indigenousSpecify,
    spouseName, withGovId, govIdType, govIdNumber, motherMaidenName, farmersAssociation, farmersAssociationSpecify,
    householdHead, householdHeadName, householdHeadRelationship, emergencyContactName, emergencyContactNum,
    numHouseholdMembers, numMale, numFemale, mainLivelihood,
    farmingRice, farmingCorn, farmingOtherCrops, farmingLivestock, farmingPoultry,
    farmworkerLandPrep, farmworkerPlanting, farmworkerCultivation, farmworkerHarvesting, farmworkerOthers,
    fisherfolkType, fisherfolkOthers, agriYouthType, agriYouthOthers, grossIncomeFarming, grossIncomeNonFarming,
  } = form
  const rsbsaData = {
    extensionName, enrollmentType, dateAdministered, refRegion, refProvince, refCityMuni, refBarangay,
    houseLotPurok, streetSitioSubdv, municipalityCity, barangay, province, region, landlineNum,
    placeOfBirthProvince, placeOfBirthCountry, highestEducation, pwd, religion, religionOthers,
    fourPsBeneficiary, civilStatus, indigenousGroup, indigenousSpecify, spouseName, withGovId, govIdType, govIdNumber,
    motherMaidenName, farmersAssociation, farmersAssociationSpecify, householdHead, householdHeadName,
    householdHeadRelationship, emergencyContactName, emergencyContactNum, numHouseholdMembers, numMale, numFemale,
    mainLivelihood, farmingRice, farmingCorn, farmingOtherCrops, farmingLivestock, farmingPoultry,
    farmworkerLandPrep, farmworkerPlanting, farmworkerCultivation, farmworkerHarvesting, farmworkerOthers,
    fisherfolkType, fisherfolkOthers, agriYouthType, agriYouthOthers, grossIncomeFarming, grossIncomeNonFarming,
  }
  const payload = {
    firstName,
    middleName,
    lastName,
    birthday,
    gender,
    contactNum,
    address: address || [houseLotPurok, streetSitioSubdv, municipalityCity, barangay, province, region].filter(Boolean).join(", "),
    username,
    password: password || undefined,
    rsbsaRegistered,
    cropType,
    cropArea,
    lotNumber,
    lotArea,
    isCertified,
    periodFrom,
    periodTo,
    agency,
    insuranceType,
    rsbsaData,
  }
  if (!payload.password) delete payload.password
  return payload
}

const SectionHeader = ({ children }) => (
  <div className="bg-gray-700 text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
    {children}
  </div>
)

const FieldRow = ({ label, children, className = "" }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 items-start ${className}`}>
    <label className="text-xs font-semibold text-gray-700 uppercase sm:pt-2">{label}</label>
    <div className="sm:col-span-2">{children}</div>
  </div>
)

const FieldView = ({ label, value }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 border-b border-gray-100">
    <span className="text-xs font-semibold text-gray-600 uppercase">{label}</span>
    <span className="sm:col-span-2 text-black">{value != null && value !== "" ? String(value) : "—"}</span>
  </div>
)

const CheckboxGroup = ({ options, value, onChange, readOnly, name, singleSelect }) => {
  const isArray = Array.isArray(value) && !singleSelect
  const toggle = (opt) => {
    if (readOnly) return
    if (isArray) {
      const next = value.includes(opt) ? value.filter((o) => o !== opt) : [...value, opt]
      onChange({ target: { name, value: next } })
    } else {
      onChange({ target: { name, value: value === opt ? "" : opt } })
    }
  }
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type={singleSelect ? "radio" : "checkbox"}
            name={singleSelect ? name : undefined}
            checked={isArray ? value.includes(opt.value) : value === opt.value}
            onChange={() => toggle(opt.value)}
            readOnly={readOnly}
            className="rounded border-gray-400"
          />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  )
}

/**
 * RSBSA Enrollment Form - matches ANI AT KITA RSBSA template.
 * mode: "edit" | "view"
 * initialData: farmer object (view) or undefined (new registration)
 * onSubmit: (payload) => void for edit mode
 * onCancel: () => void
 * setShowMapModal, setMapMode: optional, for map picker in edit
 */
const RSBSAEnrollmentForm = ({
  mode = "edit",
  initialData = null,
  onSubmit,
  onCancel,
  setShowMapModal,
  setMapMode,
  title = "ANI AT KITA RSBSA ENROLLMENT FORM",
  subTitle = "REGISTRY SYSTEM FOR BASIC SECTORS IN AGRICULTURE (RSBSA)",
}) => {
  const readOnly = mode === "view"
  const [form, setForm] = useState(() => getDefaultRsbsaFormState())

  useEffect(() => {
    if (initialData) setForm(farmerToRsbsaFormState(initialData))
    else setForm(getDefaultRsbsaFormState())
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = rsbsaFormStateToFarmerPayload(form)
    payload.farmerName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ").trim()
    onSubmit && onSubmit(payload)
  }

  const inputClass = "w-full border border-gray-400 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
  const labelClass = "text-xs font-semibold text-gray-700 uppercase"

  return (
    <div className="w-[80%] max-w-6xl mx-auto bg-white rounded-lg shadow-xl border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b-2 border-black p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase">Department of Agriculture</p>
            <h1 className="text-xl md:text-2xl font-bold text-black mt-1">{title}</h1>
            <p className="text-sm text-gray-700 mt-0.5">{subTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">REVISED VERSION: 03-2021</p>
            <div className="mt-2 w-24 h-28 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 rounded">
              <span className="text-xs font-bold text-gray-500 text-center px-1">2x2 PICTURE<br />PHOTO TAKEN WITHIN 6 MONTHS</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Enrollment Type & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={labelClass}>Enrollment Type & Date Administered</p>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              {!readOnly ? (
                <>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="enrollmentType" value="New" checked={form.enrollmentType === "New"} onChange={handleChange} />
                    <span className="text-sm">New</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="enrollmentType" value="Updating" checked={form.enrollmentType === "Updating"} onChange={handleChange} />
                    <span className="text-sm">Updating</span>
                  </label>
                </>
              ) : (
                <span className="text-black">{form.enrollmentType || "—"}</span>
              )}
              {!readOnly && (
                <input type="date" name="dateAdministered" value={form.dateAdministered} onChange={handleChange} className={inputClass} />
              )}
              {readOnly && form.dateAdministered && <span className="text-black">{form.dateAdministered}</span>}
            </div>
          </div>
          <div>
            <p className={labelClass}>Reference Number</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
              {["refRegion", "refProvince", "refCityMuni", "refBarangay"].map((name, i) => (
                <div key={name}>
                  <span className="text-xs text-gray-500">{["REGION", "PROVINCE", "CITY/MUNI", "BARANGAY"][i]}</span>
                  {!readOnly ? (
                    <input type="text" name={name} value={form[name]} onChange={handleChange} className={inputClass} />
                  ) : (
                    <p className="text-black text-sm">{form[name] || "—"}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PART I: PERSONAL INFORMATION */}
        <SectionHeader>Part I: Personal Information</SectionHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["SURNAME", "FIRST NAME", "MIDDLE NAME", "EXTENSION NAME"].map((label, i) => {
              const key = ["lastName", "firstName", "middleName", "extensionName"][i]
              return (
                <FieldRow key={key} label={label}>
                  {!readOnly ? (
                    <input type="text" name={key} value={form[key]} onChange={handleChange} className={inputClass} required={key === "lastName" || key === "firstName"} />
                  ) : (
                    <span className="text-black">{form[key] || "—"}</span>
                  )}
                </FieldRow>
              )
            })}
          </div>
          <FieldRow label="SEX">
            {!readOnly ? (
              <CheckboxGroup singleSelect options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]} value={form.gender} onChange={handleChange} name="gender" />
            ) : (
              <span className="text-black">{form.gender || "—"}</span>
            )}
          </FieldRow>
          <div>
            <p className={labelClass}>Address</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {[
                { key: "houseLotPurok", label: "House/Lot/Bldg. No./Purok" },
                { key: "streetSitioSubdv", label: "Street/Sitio/Subdv." },
                { key: "municipalityCity", label: "Municipality/City" },
                { key: "barangay", label: "Barangay" },
                { key: "province", label: "Province" },
                { key: "region", label: "Region" },
              ].map(({ key, label }) => (
                <FieldRow key={key} label={label}>
                  {!readOnly ? (
                    <input type="text" name={key} value={form[key]} onChange={handleChange} className={inputClass} />
                  ) : (
                    <span className="text-black">{form[key] || "—"}</span>
                  )}
                </FieldRow>
              ))}
            </div>
            {!readOnly && (
              <FieldRow label="Full address (or map)" className="mt-2">
                <div className="flex gap-2">
                  <input type="text" name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Or enter full address" />
                  {setShowMapModal && setMapMode && (
                    <button type="button" onClick={() => { setShowMapModal(true); setMapMode("add"); }} className="px-3 py-1.5 bg-lime-400 text-black rounded font-semibold text-sm flex items-center gap-1">
                      <MapPin size={16} /> Map
                    </button>
                  )}
                </div>
              </FieldRow>
            )}
            {readOnly && <FieldView label="Address" value={form.address} />}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Mobile Number">
              {!readOnly ? <input type="tel" name="contactNum" value={form.contactNum} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.contactNum || "—"}</span>}
            </FieldRow>
            <FieldRow label="Landline Number">
              {!readOnly ? <input type="text" name="landlineNum" value={form.landlineNum} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.landlineNum || "—"}</span>}
            </FieldRow>
            <FieldRow label="Date of Birth">
              {!readOnly ? <input type="date" name="birthday" value={form.birthday} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.birthday || "—"}</span>}
            </FieldRow>
            <FieldRow label="Place of Birth (Province/City/State, Country)">
              {!readOnly ? (
                <div className="flex gap-2">
                  <input type="text" name="placeOfBirthProvince" value={form.placeOfBirthProvince} onChange={handleChange} className={inputClass} placeholder="Province/City" />
                  <input type="text" name="placeOfBirthCountry" value={form.placeOfBirthCountry} onChange={handleChange} className={inputClass} placeholder="Country" />
                </div>
              ) : (
                <span className="text-black">{[form.placeOfBirthProvince, form.placeOfBirthCountry].filter(Boolean).join(", ") || "—"}</span>
              )}
            </FieldRow>
          </div>
          <FieldRow label="Highest Formal Education">
            {!readOnly ? (
              <CheckboxGroup
                name="highestEducation"
                value={form.highestEducation}
                onChange={handleChange}
                options={[
                  { value: "Pre-school", label: "Pre-school" },
                  { value: "Elementary", label: "Elementary" },
                  { value: "High School (non K-12)", label: "High School (non K-12)" },
                  { value: "Junior High School (K-12)", label: "Junior High School (K-12)" },
                  { value: "Senior High School (K-12)", label: "Senior High School (K-12)" },
                  { value: "College", label: "College" },
                  { value: "Vocational", label: "Vocational" },
                  { value: "Post-graduate", label: "Post-graduate" },
                  { value: "None", label: "None" },
                ]}
              />
            ) : (
              <span className="text-black">{form.highestEducation?.length ? form.highestEducation.join(", ") : "—"}</span>
            )}
          </FieldRow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="PWD">
              {!readOnly ? <CheckboxGroup singleSelect name="pwd" value={form.pwd} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} /> : <span>{form.pwd || "—"}</span>}
            </FieldRow>
            <FieldRow label="Religion">
              {!readOnly ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <CheckboxGroup name="religion" value={form.religion} onChange={handleChange} options={[{ value: "Christianity", label: "Christianity" }, { value: "Islam", label: "Islam" }]} />
                  <label className="flex items-center gap-2"><input type="checkbox" checked={form.religion === "Others"} onChange={() => setForm((p) => ({ ...p, religion: form.religion === "Others" ? "" : "Others" }))} /> Others</label>
                  {form.religion === "Others" && <input type="text" name="religionOthers" value={form.religionOthers} onChange={handleChange} className={inputClass} placeholder="Specify" />}
                </div>
              ) : (
                <span className="text-black">{form.religion === "Others" ? form.religionOthers : form.religion || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="4P's Beneficiary">
              {!readOnly ? <CheckboxGroup singleSelect name="fourPsBeneficiary" value={form.fourPsBeneficiary} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} /> : <span>{form.fourPsBeneficiary || "—"}</span>}
            </FieldRow>
            <FieldRow label="Civil Status">
              {!readOnly ? (
                <CheckboxGroup singleSelect name="civilStatus" value={form.civilStatus} onChange={handleChange} options={[{ value: "Single", label: "Single" }, { value: "Married", label: "Married" }, { value: "Widowed", label: "Widowed" }, { value: "Separated", label: "Separated" }]} />
              ) : (
                <span className="text-black">{form.civilStatus || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="Member of Indigenous Group">
              {!readOnly ? (
                <div className="flex flex-wrap gap-2">
                  <CheckboxGroup singleSelect name="indigenousGroup" value={form.indigenousGroup} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  {form.indigenousGroup === "Yes" && <input type="text" name="indigenousSpecify" value={form.indigenousSpecify} onChange={handleChange} className={inputClass} placeholder="Specify" />}
                </div>
              ) : (
                <span className="text-black">{form.indigenousGroup === "Yes" ? form.indigenousSpecify : form.indigenousGroup || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="Name of Spouse (if married)">
              {!readOnly ? <input type="text" name="spouseName" value={form.spouseName} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.spouseName || "—"}</span>}
            </FieldRow>
            <FieldRow label="With Government ID">
              {!readOnly ? (
                <div className="space-y-2">
                  <CheckboxGroup singleSelect name="withGovId" value={form.withGovId} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  {form.withGovId === "Yes" && (
                    <>
                      <input type="text" name="govIdType" value={form.govIdType} onChange={handleChange} className={inputClass} placeholder="ID Type" />
                      <input type="text" name="govIdNumber" value={form.govIdNumber} onChange={handleChange} className={inputClass} placeholder="ID Number" />
                    </>
                  )}
                </div>
              ) : (
                <span className="text-black">{form.withGovId === "Yes" ? `${form.govIdType || ""} ${form.govIdNumber || ""}`.trim() || "—" : form.withGovId || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="Mother's Maiden Name">
              {!readOnly ? <input type="text" name="motherMaidenName" value={form.motherMaidenName} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.motherMaidenName || "—"}</span>}
            </FieldRow>
            <FieldRow label="Member of Farmers Association/Cooperative">
              {!readOnly ? (
                <div className="flex flex-wrap gap-2">
                  <CheckboxGroup singleSelect name="farmersAssociation" value={form.farmersAssociation} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  {form.farmersAssociation === "Yes" && <input type="text" name="farmersAssociationSpecify" value={form.farmersAssociationSpecify} onChange={handleChange} className={inputClass} placeholder="Specify" />}
                </div>
              ) : (
                <span className="text-black">{form.farmersAssociation === "Yes" ? form.farmersAssociationSpecify : form.farmersAssociation || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="Household Head">
              {!readOnly ? (
                <div className="space-y-2">
                  <CheckboxGroup singleSelect name="householdHead" value={form.householdHead} onChange={handleChange} options={[{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]} />
                  {form.householdHead === "No" && (
                    <>
                      <input type="text" name="householdHeadName" value={form.householdHeadName} onChange={handleChange} className={inputClass} placeholder="Name of household head" />
                      <input type="text" name="householdHeadRelationship" value={form.householdHeadRelationship} onChange={handleChange} className={inputClass} placeholder="Relationship" />
                    </>
                  )}
                </div>
              ) : (
                <span className="text-black">{form.householdHead === "No" ? `${form.householdHeadName || ""} (${form.householdHeadRelationship || ""})` : form.householdHead || "—"}</span>
              )}
            </FieldRow>
            <FieldRow label="Person to Notify in Case of Emergency">
              {!readOnly ? <input type="text" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.emergencyContactName || "—"}</span>}
            </FieldRow>
            <FieldRow label="Emergency Contact Number">
              {!readOnly ? <input type="tel" name="emergencyContactNum" value={form.emergencyContactNum} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.emergencyContactNum || "—"}</span>}
            </FieldRow>
            <FieldRow label="No. of living household members">
              {!readOnly ? <input type="text" name="numHouseholdMembers" value={form.numHouseholdMembers} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.numHouseholdMembers || "—"}</span>}
            </FieldRow>
            <FieldRow label="No. of male / female">
              {!readOnly ? (
                <div className="flex gap-2">
                  <input type="text" name="numMale" value={form.numMale} onChange={handleChange} className={inputClass} placeholder="Male" />
                  <input type="text" name="numFemale" value={form.numFemale} onChange={handleChange} className={inputClass} placeholder="Female" />
                </div>
              ) : (
                <span className="text-black">{[form.numMale, form.numFemale].filter(Boolean).join(" / ") || "—"}</span>
              )}
            </FieldRow>
          </div>
        </div>

        {/* PART II: FARM PROFILE */}
        <SectionHeader>Part II: Farm Profile</SectionHeader>
        <div className="space-y-4">
          <FieldRow label="Main Livelihood">
            {!readOnly ? (
              <CheckboxGroup
                singleSelect
                name="mainLivelihood"
                value={form.mainLivelihood}
                onChange={handleChange}
                options={[
                  { value: "FARMER", label: "FARMER" },
                  { value: "FARMWORKER/LABORER", label: "FARMWORKER/LABORER" },
                  { value: "FISHERFOLK", label: "FISHERFOLK" },
                  { value: "AGRI YOUTH", label: "AGRI YOUTH" },
                ]}
              />
            ) : (
              <span className="text-black font-medium">{form.mainLivelihood || "—"}</span>
            )}
          </FieldRow>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(form.mainLivelihood === "FARMER" || readOnly) && (
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className={labelClass}>Type of Farming Activity</p>
                <div className="mt-2 space-y-2">
                  {!readOnly ? (
                    <>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={form.farmingRice} onChange={(e) => setForm((p) => ({ ...p, farmingRice: e.target.checked }))} /> Rice</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={form.farmingCorn} onChange={(e) => setForm((p) => ({ ...p, farmingCorn: e.target.checked }))} /> Corn</label>
                      <label className="flex items-center gap-2">Other crops <input type="text" name="farmingOtherCrops" value={form.farmingOtherCrops} onChange={handleChange} className={inputClass} /></label>
                      <label className="flex items-center gap-2">Livestock <input type="text" name="farmingLivestock" value={form.farmingLivestock} onChange={handleChange} className={inputClass} /></label>
                      <label className="flex items-center gap-2">Poultry <input type="text" name="farmingPoultry" value={form.farmingPoultry} onChange={handleChange} className={inputClass} /></label>
                    </>
                  ) : (
                    <p className="text-sm text-black">{[form.farmingRice && "Rice", form.farmingCorn && "Corn", form.farmingOtherCrops, form.farmingLivestock, form.farmingPoultry].filter(Boolean).join(", ") || "—"}</p>
                  )}
                </div>
              </div>
            )}
            {(form.mainLivelihood === "FARMWORKER/LABORER" || readOnly) && (
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className={labelClass}>Kind of Work</p>
                <div className="mt-2 space-y-2">
                  {!readOnly ? (
                    <>
                      {["Land Preparation", "Planting/Transplanting", "Cultivation", "Harvesting"].map((l, i) => {
                        const key = ["farmworkerLandPrep", "farmworkerPlanting", "farmworkerCultivation", "farmworkerHarvesting"][i]
                        return <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))} /> {l}</label>
                      })}
                      <label className="flex items-center gap-2">Others <input type="text" name="farmworkerOthers" value={form.farmworkerOthers} onChange={handleChange} className={inputClass} /></label>
                    </>
                  ) : (
                    <p className="text-sm text-black">{form.farmworkerOthers || "—"}</p>
                  )}
                </div>
              </div>
            )}
            {(form.mainLivelihood === "FISHERFOLK" || readOnly) && (
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className={labelClass}>Type of Fishing Activity</p>
                {!readOnly ? (
                  <div className="mt-2 space-y-2">
                    <input type="text" name="fisherfolkType" value={form.fisherfolkType} onChange={handleChange} className={inputClass} placeholder="e.g. Fish Capture, Aquaculture" />
                    <input type="text" name="fisherfolkOthers" value={form.fisherfolkOthers} onChange={handleChange} className={inputClass} placeholder="Others" />
                  </div>
                ) : (
                  <p className="text-sm text-black mt-2">{[form.fisherfolkType, form.fisherfolkOthers].filter(Boolean).join(", ") || "—"}</p>
                )}
              </div>
            )}
            {(form.mainLivelihood === "AGRI YOUTH" || readOnly) && (
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className={labelClass}>Type of involvement</p>
                {!readOnly ? (
                  <input type="text" name="agriYouthOthers" value={form.agriYouthOthers} onChange={handleChange} className={`${inputClass} mt-2`} placeholder="Specify" />
                ) : (
                  <p className="text-sm text-black mt-2">{form.agriYouthOthers || "—"}</p>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldRow label="Gross Annual Income Last Year - Farming">
              {!readOnly ? <input type="text" name="grossIncomeFarming" value={form.grossIncomeFarming} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.grossIncomeFarming || "—"}</span>}
            </FieldRow>
            <FieldRow label="Gross Annual Income Last Year - Non-farming">
              {!readOnly ? <input type="text" name="grossIncomeNonFarming" value={form.grossIncomeNonFarming} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.grossIncomeNonFarming || "—"}</span>}
            </FieldRow>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <FieldRow label="Crop Type">
              {!readOnly ? <input type="text" name="cropType" value={form.cropType} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.cropType || "—"}</span>}
            </FieldRow>
            <FieldRow label="Crop Area (hectares)">
              {!readOnly ? <input type="text" name="cropArea" value={form.cropArea} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.cropArea || "—"}</span>}
            </FieldRow>
            <FieldRow label="Lot Number">
              {!readOnly ? <input type="text" name="lotNumber" value={form.lotNumber} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.lotNumber || "—"}</span>}
            </FieldRow>
            <FieldRow label="Lot Area">
              {!readOnly ? <input type="text" name="lotArea" value={form.lotArea} onChange={handleChange} className={inputClass} /> : <span className="text-black">{form.lotArea || "—"}</span>}
            </FieldRow>
          </div>
          <FieldRow label="RSBSA Registered">
            {!readOnly ? (
              <label className="flex items-center gap-2">
                <input type="checkbox" name="rsbsaRegistered" checked={form.rsbsaRegistered} onChange={handleChange} />
                <span>Yes (Required for some programs)</span>
              </label>
            ) : (
              <span className="text-black">{form.rsbsaRegistered ? "Yes" : "No"}</span>
            )}
          </FieldRow>
        </div>

        {/* Login credentials - edit mode only for new registration */}
        {!readOnly && (
          <div className="border-t pt-4">
            <p className={labelClass}>Login Credentials (for farmer dashboard)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <FieldRow label="Username">
                <input type="text" name="username" value={form.username} onChange={handleChange} className={inputClass} required />
              </FieldRow>
              <FieldRow label="Password">
                <input type="password" name="password" value={form.password} onChange={handleChange} className={inputClass} placeholder={initialData ? "Leave blank to keep current" : ""} required={!initialData} />
              </FieldRow>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="px-4 py-2 border-2 border-black rounded-lg font-semibold hover:bg-gray-100">
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button type="submit" className="px-6 py-2 bg-lime-400 text-black rounded-lg font-bold border-2 border-black hover:bg-lime-500">
              Register Farmer
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default RSBSAEnrollmentForm
