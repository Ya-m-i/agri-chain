"use client"

import { AlertTriangle, X, Shield } from "lucide-react"
import { compressImageFileToDataUrl } from "../utils/imageOptimization"

/**
 * Shared PCIC application form content. Used by admin (CropInsuranceManagement) and farmer (FarmerCropInsurance).
 * Parent must provide form state, handlers, and wrap in <form onSubmit={handleSubmit}>.
 */
export default function PcicFormContent({
  formData,
  setFormData,
  pcicForm,
  setPcicForm,
  handleFormChange,
  handlePcicFormChange,
  handlePcicLotChange,
  handleAddLot,
  handleRemoveLot,
  cropConfigurations,
  farmers = [],
  showFarmerSelector = false,
  submitError,
  setSubmitError,
  loading,
  onCancel,
}) {
  return (
    <>
      {submitError && (
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 flex items-start gap-3" role="alert">
          <AlertTriangle className="flex-shrink-0 h-6 w-6 text-red-600" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-800">Create failed</p>
            <p className="text-sm text-red-700 mt-1">{submitError}</p>
          </div>
          <button type="button" onClick={() => setSubmitError(null)} className="text-red-600 hover:text-red-800 p-1" aria-label="Dismiss"> <X size={18} /> </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border-b-2 border-black pb-4">
        <div>
          <label className="block text-xs font-bold text-black mb-1 uppercase">CROP (Choose only one)</label>
          <select name="cropType" value={formData.cropType} onChange={handleFormChange} required className="w-full border-2 border-black p-2 rounded-lg text-sm">
            <option value="">Select</option>
            <option value="Rice">Rice</option>
            <option value="Corn">Corn</option>
            <option value="Other">High Value (Please Specify)</option>
          </select>
          {formData.cropType === "Other" && <input type="text" placeholder="Specify high value crop" value={formData.otherCrop || ""} className="mt-1 w-full border border-black p-1 rounded text-sm" onChange={(e) => setFormData(p => ({ ...p, otherCrop: e.target.value }))} />}
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-1 uppercase">Application Type</label>
          <select value={pcicForm.applicationType} onChange={(e) => handlePcicFormChange("applicationType", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm">
            <option value="New Application">New Application</option>
            <option value="Renewal">Renewal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-1 uppercase">Total Area (ha)</label>
          <input type="number" step="0.01" value={pcicForm.totalArea || formData.cropArea} onChange={(e) => { handlePcicFormChange("totalArea", e.target.value); setFormData(p => ({ ...p, cropArea: e.target.value })) }} className="w-full border-2 border-black p-2 rounded-lg text-sm" placeholder="e.g. 1.5" />
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-1 uppercase">Farmer Category</label>
          <select value={pcicForm.farmerCategory} onChange={(e) => handlePcicFormChange("farmerCategory", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm">
            <option value="Self-Financed">Self-Financed</option>
            <option value="Borrowing">Borrowing</option>
          </select>
          {pcicForm.farmerCategory === "Borrowing" && <input type="text" placeholder="Enter lender name" value={pcicForm.lender} onChange={(e) => handlePcicFormChange("lender", e.target.value)} className="mt-1 w-full border border-black p-1 rounded text-sm" />}
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-1 uppercase">Date of Application</label>
          <input type="date" value={pcicForm.dateOfApplication ? (typeof pcicForm.dateOfApplication === "string" && pcicForm.dateOfApplication.length <= 10 ? pcicForm.dateOfApplication : new Date(pcicForm.dateOfApplication).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("dateOfApplication", e.target.value)} className="w-full border-2 border-black p-2 rounded-lg text-sm" />
        </div>
      </div>
      {showFarmerSelector && (
        <div className="border-b-2 border-black pb-4">
          <label className="block text-xs font-bold text-black mb-2 uppercase">Farmer (for linking)</label>
          <select name="farmerId" value={formData.farmerId} onChange={handleFormChange} required className="w-full max-w-xs border-2 border-black p-2 rounded-lg text-sm">
            <option value="">Select Farmer</option>
            {farmers.map((f) => <option key={f._id} value={f._id}>{f.firstName} {f.lastName}</option>)}
          </select>
        </div>
      )}

      <div className="border-2 border-black rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-black uppercase">A. BASIC FARMER INFORMATION</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-bold mb-1">Last Name</label><input type="text" placeholder="e.g. Dela Cruz" value={pcicForm.applicantName?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, lastName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">First Name</label><input type="text" placeholder="e.g. Juan" value={pcicForm.applicantName?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, firstName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Middle Name</label><input type="text" placeholder="Optional" value={pcicForm.applicantName?.middleName || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, middleName: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Suffix (Jr., Sr., III)</label><input type="text" placeholder="Optional" value={pcicForm.applicantName?.suffix || ""} onChange={(e) => setPcicForm(p => ({ ...p, applicantName: { ...p.applicantName, suffix: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-bold mb-1">No. & Street/Sitio</label><input type="text" placeholder="e.g. 123 Purok 10-A" value={pcicForm.address?.street || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, street: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Barangay</label><input type="text" placeholder="e.g. Maniki" value={pcicForm.address?.barangay || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, barangay: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Municipality/City</label><input type="text" placeholder="e.g. Kapalong" value={pcicForm.address?.municipality || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, municipality: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Province</label><input type="text" placeholder="e.g. Davao del Norte" value={pcicForm.address?.province || ""} onChange={(e) => setPcicForm(p => ({ ...p, address: { ...p.address, province: e.target.value } }))} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="block text-xs font-bold mb-1">Contact Number</label><input type="text" placeholder="e.g. 09123456789" value={pcicForm.contactNumber || ""} onChange={(e) => handlePcicFormChange("contactNumber", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Date of Birth</label><input type="date" value={pcicForm.dateOfBirth ? (typeof pcicForm.dateOfBirth === "string" && pcicForm.dateOfBirth.length <= 10 ? pcicForm.dateOfBirth : new Date(pcicForm.dateOfBirth).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("dateOfBirth", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
          <div><label className="block text-xs font-bold mb-1">Sex</label><select value={pcicForm.sex || ""} onChange={(e) => handlePcicFormChange("sex", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-2">Are you part of a special sector? (tick as many)</label>
          <div className="flex flex-wrap gap-4">
            {["PWD", "Senior Citizen", "Youth", "Indigenous People"].map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(pcicForm.specialSector || []).includes(s)} onChange={(e) => setPcicForm(p => ({ ...p, specialSector: e.target.checked ? [...(p.specialSector || []), s] : (p.specialSector || []).filter(x => x !== s) }))} className="w-4 h-4" />
                <span className="text-sm">{s}</span>
              </label>
            ))}
            <span className="text-sm">Indicate tribe:</span>
            <input type="text" placeholder="If Indigenous People" value={pcicForm.tribe || ""} onChange={(e) => handlePcicFormChange("tribe", e.target.value)} className="border border-black p-1 rounded w-40 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label className="block text-xs font-bold mb-1">Civil Status</label><select value={pcicForm.civilStatus || ""} onChange={(e) => handlePcicFormChange("civilStatus", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm"><option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option><option value="Separated">Separated</option></select></div>
          {pcicForm.civilStatus === "Married" && <div><label className="block text-xs font-bold mb-1">Name of Spouse</label><input type="text" placeholder="Full name of spouse" value={pcicForm.spouseName || ""} onChange={(e) => handlePcicFormChange("spouseName", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>}
        </div>
        <div className="border border-black rounded p-3 space-y-2">
          <label className="block text-xs font-bold">Name of Legal Beneficiary</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="font-semibold">Primary Beneficiary</span><span></span>
            <input placeholder="Last Name" value={pcicForm.beneficiary?.primary?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, lastName: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input placeholder="First Name" value={pcicForm.beneficiary?.primary?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, firstName: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input placeholder="Middle Name" value={pcicForm.beneficiary?.primary?.middleName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, middleName: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input placeholder="Relationship" value={pcicForm.beneficiary?.primary?.relationship || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, relationship: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input type="date" placeholder="Birthdate" value={pcicForm.beneficiary?.primary?.birthdate ? (typeof pcicForm.beneficiary.primary.birthdate === "string" && pcicForm.beneficiary.primary.birthdate.length <= 10 ? pcicForm.beneficiary.primary.birthdate : new Date(pcicForm.beneficiary.primary.birthdate).toISOString().slice(0, 10)) : ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, primary: { ...p.beneficiary?.primary, birthdate: e.target.value } } }))} className="border border-black p-1 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <span className="font-semibold">Guardian</span><span></span>
            <input placeholder="Last Name" value={pcicForm.beneficiary?.guardian?.lastName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, lastName: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input placeholder="First Name" value={pcicForm.beneficiary?.guardian?.firstName || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, firstName: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input placeholder="Relationship" value={pcicForm.beneficiary?.guardian?.relationship || ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, relationship: e.target.value } } }))} className="border border-black p-1 rounded" />
            <input type="date" value={pcicForm.beneficiary?.guardian?.birthdate ? (typeof pcicForm.beneficiary.guardian.birthdate === "string" && pcicForm.beneficiary.guardian.birthdate.length <= 10 ? pcicForm.beneficiary.guardian.birthdate : new Date(pcicForm.beneficiary.guardian.birthdate).toISOString().slice(0, 10)) : ""} onChange={(e) => setPcicForm(p => ({ ...p, beneficiary: { ...p.beneficiary, guardian: { ...p.beneficiary?.guardian, birthdate: e.target.value } } }))} className="border border-black p-1 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Indemnity Payment option</label>
          <select value={pcicForm.indemnityPaymentOption || ""} onChange={(e) => handlePcicFormChange("indemnityPaymentOption", e.target.value)} className="w-full max-w-xs border-2 border-black p-2 rounded text-sm">
            <option value="">Select</option>
            <option value="LandBank or DBP">LandBank or DBP</option>
            <option value="Palawan Express">Palawan Express</option>
            <option value="GCash">GCash</option>
            <option value="Others">Others (Please specify)</option>
          </select>
          {pcicForm.indemnityPaymentOption === "Others" && <input type="text" placeholder="Specify" value={pcicForm.indemnityOther || ""} onChange={(e) => handlePcicFormChange("indemnityOther", e.target.value)} className="mt-1 w-full max-w-xs border border-black p-2 rounded text-sm" />}
        </div>
      </div>

      <div className="border-2 border-black rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-black uppercase">B. FARM INFORMATION</h3>
          <button type="button" onClick={handleAddLot} className="bg-lime-400 border-2 border-black text-black px-3 py-1 rounded font-bold text-sm">+ Add Lot</button>
        </div>
        {(pcicForm.lots || []).map((lot, idx) => (
          <div key={idx} className="border border-black rounded p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between"><span className="font-semibold text-sm">Lot {idx + 1}</span>{(pcicForm.lots || []).length > 1 && <button type="button" onClick={() => handleRemoveLot(idx)} className="text-red-600 text-sm">Remove</button>}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><label className="text-xs font-bold">Barangay</label><input type="text" placeholder="e.g. Maniki" value={lot.farmLocation?.barangay || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.barangay", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Municipality/City</label><input type="text" value={lot.farmLocation?.municipality || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.municipality", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Province</label><input type="text" value={lot.farmLocation?.province || ""} onChange={(e) => handlePcicLotChange(idx, "farmLocation.province", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><label className="text-xs font-bold">North</label><input type="text" value={lot.boundaries?.north || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.north", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">East</label><input type="text" value={lot.boundaries?.east || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.east", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">South</label><input type="text" value={lot.boundaries?.south || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.south", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">West</label><input type="text" value={lot.boundaries?.west || ""} onChange={(e) => handlePcicLotChange(idx, "boundaries.west", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><label className="text-xs font-bold">Geo Ref ID (DA-RSBSA) or Farm ID (PCIC)</label><input type="text" placeholder="Optional ID" value={lot.geoRefId || ""} onChange={(e) => handlePcicLotChange(idx, "geoRefId", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Variety</label><input type="text" placeholder="e.g. IR64" value={lot.variety || ""} onChange={(e) => handlePcicLotChange(idx, "variety", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Planting Method</label><select value={lot.plantingMethod || ""} onChange={(e) => handlePcicLotChange(idx, "plantingMethod", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Direct Seeded">Direct Seeded</option><option value="Transplanted">Transplanted</option></select></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><label className="text-xs font-bold">Date of Sowing</label><input type="date" value={lot.dateOfSowing ? (typeof lot.dateOfSowing === "string" && lot.dateOfSowing.length <= 10 ? lot.dateOfSowing : new Date(lot.dateOfSowing).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfSowing", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Date of Planting</label><input type="date" value={lot.dateOfPlanting ? (typeof lot.dateOfPlanting === "string" && lot.dateOfPlanting.length <= 10 ? lot.dateOfPlanting : new Date(lot.dateOfPlanting).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfPlanting", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Date of Harvest</label><input type="date" value={lot.dateOfHarvest ? (typeof lot.dateOfHarvest === "string" && lot.dateOfHarvest.length <= 10 ? lot.dateOfHarvest : new Date(lot.dateOfHarvest).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicLotChange(idx, "dateOfHarvest", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">No. of Trees/Hills (HVC only)</label><input type="text" value={lot.numberOfTreesHills || ""} onChange={(e) => handlePcicLotChange(idx, "numberOfTreesHills", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><label className="text-xs font-bold">Land Category</label><select value={lot.landCategory || ""} onChange={(e) => handlePcicLotChange(idx, "landCategory", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Irrigated">Irrigated</option><option value="Non-Irrigated">Non-Irrigated</option></select></div>
              <div><label className="text-xs font-bold">Tenurial Status</label><select value={lot.tenurialStatus || ""} onChange={(e) => handlePcicLotChange(idx, "tenurialStatus", e.target.value)} className="w-full border border-black p-1 rounded text-sm"><option value="">Select</option><option value="Owner">Owner</option><option value="Lessee">Lessee</option></select></div>
              <div><label className="text-xs font-bold">Desired Amount of Cover (PHP)</label><input type="number" placeholder="e.g. 50000" value={lot.desiredAmountOfCover ?? ""} onChange={(e) => handlePcicLotChange(idx, "desiredAmountOfCover", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
              <div><label className="text-xs font-bold">Lot Area (ha)</label><input type="number" step="0.01" placeholder="e.g. 1.0" value={lot.lotArea ?? ""} onChange={(e) => handlePcicLotChange(idx, "lotArea", e.target.value)} className="w-full border border-black p-1 rounded text-sm" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-2 border-black rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-black uppercase">C. CERTIFICATION AND DATA PRIVACY CONSENT STATEMENT</h3>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={!!pcicForm.certificationConsent} onChange={(e) => handlePcicFormChange("certificationConsent", e.target.checked)} className="mt-1 w-4 h-4" />
          <span className="text-sm">I certify that the statements made herein are true and correct. I understand that PCIC may reject or void this application if any information is found to be false.</span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={!!pcicForm.deedOfAssignmentConsent} onChange={(e) => handlePcicFormChange("deedOfAssignmentConsent", e.target.checked)} className="mt-1 w-4 h-4" />
          <span className="text-sm">Deed of Assignment for borrowing farmers (If applicable)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold mb-1">Signature / Thumb Mark (upload image)</label><input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { const dataUrl = await compressImageFileToDataUrl(f, 600, 0.6); handlePcicFormChange("signatureImage", dataUrl); } catch { const r = new FileReader(); r.onload = () => handlePcicFormChange("signatureImage", r.result); r.readAsDataURL(f); } } }} className="w-full border-2 border-black p-2 rounded text-sm" />{pcicForm.signatureImage && <img src={pcicForm.signatureImage} alt="Signature" className="mt-2 h-16 object-contain border border-black rounded" />}</div>
          <div><label className="block text-xs font-bold mb-1">Date</label><input type="date" value={pcicForm.certificationDate ? (typeof pcicForm.certificationDate === "string" && pcicForm.certificationDate.length <= 10 ? pcicForm.certificationDate : new Date(pcicForm.certificationDate).toISOString().slice(0, 10)) : ""} onChange={(e) => handlePcicFormChange("certificationDate", e.target.value)} className="w-full border-2 border-black p-2 rounded text-sm" /></div>
        </div>
      </div>

      <div className="border-2 border-black rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-black uppercase">D. COVERAGE (FOR PCIC USE ONLY)</h3>
        <label className="block text-xs font-bold mb-2">D.1 Source of Premium</label>
        <div className="flex flex-wrap gap-4">
          {["Non-Subsidized/Regular", "Subsidized/NCIFF - NCIPs No.", "Subsidized/RSBSA - Ref. No.", "Others"].map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={(pcicForm.sourceOfPremium || []).includes(s)} onChange={(e) => setPcicForm(p => ({ ...p, sourceOfPremium: e.target.checked ? [...(p.sourceOfPremium || []), s] : (p.sourceOfPremium || []).filter(x => x !== s) }))} className="w-4 h-4" />
              <span className="text-sm">{s}</span>
            </label>
          ))}
          {(pcicForm.sourceOfPremium || []).includes("Others") && <input type="text" placeholder="Specify" value={pcicForm.sourceOfPremiumOther || ""} onChange={(e) => handlePcicFormChange("sourceOfPremiumOther", e.target.value)} className="border border-black p-2 rounded w-48 text-sm" />}
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t-2 border-black">
        <button type="button" onClick={onCancel} className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"><Shield className="h-5 w-5" />{loading ? 'Creating...' : 'Create Record'}</button>
      </div>
    </>
  )
}
