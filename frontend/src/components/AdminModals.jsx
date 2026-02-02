"use client"

import {
  X,
  MapPin,
  User,
  Layers,
  FileText,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  Plus,
  Search,
  Camera,
  HandHeart,
} from "lucide-react"
// Note: Notifications are now handled by backend API

const AdminModals = ({
  showEventModal,
  setShowEventModal,
  eventForm,
  handleEventChange,
  handleEventSubmit,
  showClaimDetails,
  setShowClaimDetails,
  selectedClaim,
  initiateStatusUpdate,
  showConfirmationModal,
  setShowConfirmationModal,
  confirmationAction,
  confirmStatusUpdate,
  feedbackText,
  setFeedbackText,
  showFarmerDetails,
  setShowFarmerDetails,
  selectedFarmer,
  showDeleteConfirmation,
  setShowDeleteConfirmation,
  farmerToDelete,
  setFarmerToDelete,
  farmers,
  setFarmers,
}) => {
  // Map modal feature removed - all related code disabled
  // const [mapReady, setMapReady] = useState(false);
  
  // Map modal event listeners removed
  // useEffect(() => {
  //   const handleMapReady = () => {
  //     console.log('📍 AdminModals: Received leafletMapReady event');
  //     setMapReady(true);
  //   };
  //   window.addEventListener('leafletMapReady', handleMapReady);
  //   return () => {
  //     window.removeEventListener('leafletMapReady', handleMapReady);
  //   };
  // }, []);
  
  // Map modal reset logic removed
  // useEffect(() => {
  //   if (!showMapModal) {
  //     setMapReady(false);
  //   }
  // }, [showMapModal]);
  
  // Map modal initialization and resize logic removed
  // useEffect(() => {
  //   if (showMapModal && mapMode === "add") {
  //     // ... map modal initialization code removed
  //   }
  // }, [showMapModal, mapMode, mapRef, leafletMapRef]);

  // Custom scrollbar styling
  const scrollbarStyle = `
    /* Hide scrollbar but maintain functionality */
    .hide-scrollbar {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;  /* Chrome, Safari and Opera */
    }
  `

  return (
    <>
      <style>{scrollbarStyle}</style>

      {/* 
        ============================================
        NOTE: OLD LEGACY MODAL REMOVED
        ============================================
        The farmer registration modal (showModal) that used localStorage
        has been REMOVED to prevent duplicates.
        
        THE ONLY FARMER REGISTRATION MODAL is now in:
        - Component: FarmerRegistration.jsx
        - Location: Line 914
        - State: Local 'showRegisterForm' state
        - Trigger: "Register New Farmer" button in FarmerRegistration component
        ============================================
      */}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-lime-50 border border-black rounded-xl shadow-md w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar relative">
            {/* Header */}
            <div className="sticky top-0 bg-lime-50 border-b border-black p-6 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white border border-black rounded-lg">
                  <HandHeart className="h-7 w-7 text-black" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black">Add New Assistance</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-black hover:text-gray-700 focus:outline-none transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEventSubmit} className="p-6 space-y-4 bg-lime-50 relative z-10">
              {/* Assistance Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Assistance Type</label>
                <select
                  name="assistanceType"
                  value={eventForm.assistanceType || ""}
                  onChange={handleEventChange}
                  className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Seed Distribution">🌱 Seed Distribution</option>
                  <option value="Fertilizer Subsidy">💊 Fertilizer Subsidy</option>
                  <option value="Machinery Support">🚜 Machinery Support</option>
                  <option value="Cash Assistance">💸 Cash Assistance</option>
                  <option value="Food Packs">📦 Food Packs</option>
                  <option value="Training & Tools">🧪 Training & Tools</option>
                </select>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Description</label>
                <textarea
                  name="description"
                  value={eventForm.description || ""}
                  onChange={handleEventChange}
                  className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                  rows="3"
                  required
                  placeholder="Describe the assistance details..."
                />
              </div>
              
              {/* Crop Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Crop Type</label>
                <select
                  name="cropType"
                  value={eventForm.cropType}
                  onChange={handleEventChange}
                  className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                >
                  <option value="">Select Crop</option>
                  <option value="Rice">🌾 Rice</option>
                  <option value="Corn">🌽 Corn</option>
                  <option value="Vegetables">🥬 Vegetables</option>
                  <option value="Banana">🍌 Banana</option>
                  <option value="Coconut">🥥 Coconut</option>
                  <option value="Other">📝 Other</option>
                </select>
              </div>
              
              {/* Other Crop Type (conditional) */}
              {eventForm.cropType === "Other" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Specify Crop Type</label>
                  <input
                    type="text"
                    name="otherCropType"
                    value={eventForm.otherCropType || ""}
                    onChange={handleEventChange}
                    className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    required
                    placeholder="Enter crop type..."
                  />
                </div>
              )}
              
              {/* Founder Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Founder/Agency Name</label>
                <input
                  type="text"
                  name="founderName"
                  value={eventForm.founderName}
                  onChange={handleEventChange}
                  className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  required
                  placeholder="e.g., DA-PCIC, LGU..."
                />
              </div>
              
              {/* Quantity & Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={eventForm.quantity}
                    onChange={handleEventChange}
                    className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    required
                    min="1"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">Date Added</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={eventForm.dateAdded}
                    onChange={handleEventChange}
                    className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">Photo/Logo</label>
                <div className="relative">
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          handleEventChange({
                            target: {
                              name: 'photo',
                              value: ev.target.result,
                              type: 'text',
                            }
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-white border border-black p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-black file:bg-lime-50 file:text-black hover:file:bg-lime-100 file:transition-all"
                  />
                </div>
                {eventForm.photo && (
                  <div className="mt-3 p-2 border border-black rounded-lg bg-white">
                    <img src={eventForm.photo} alt="Preview" className="h-24 object-contain mx-auto rounded" />
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-black mt-6">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-white border-2 border-black text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition-all font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-lime-50 border-2 border-black text-black px-6 py-3 rounded-lg hover:bg-lime-100 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Details Modal - PCIC CLAIM FOR INDEMNITY form template (matches official form) */}
      {showClaimDetails && selectedClaim && (() => {
        const c = selectedClaim
        const isPalay = /palay|rice/i.test(c.crop || '')
        const isCorn = /corn|maize/i.test(c.crop || '')
        const programList = c.program && Array.isArray(c.program) ? c.program : []
        const programLabels = ['Regular', 'Sikat Sal', 'RSBSA', 'APCP-CAP-PBD', 'Punla', 'Cooperative Rice Farm']
        const isProgramChecked = (label) => programList.some(p => String(p).toLowerCase().replace(/\s/g, '').includes(label.toLowerCase().replace(/\s/g, '')))
        return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar border-2 border-black">
            <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex justify-between items-center z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Claim No. {c.claimNumber || c._id || c.id}</span>
                <span className="text-xs font-semibold text-gray-700 uppercase">({c.status})</span>
              </div>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="text-black hover:bg-gray-100 rounded-full p-1 focus:outline-none transition-all"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8 bg-white text-black">
              {/* Header - same as PCIC form image */}
              <div className="text-center mb-6">
                <p className="text-sm font-normal">TO: The Chief CAD, PCIC-RO XI</p>
                <p className="text-sm font-semibold mt-2">PHILIPPINE CROP INSURANCE CORPORATION</p>
                <p className="text-sm font-semibold">Regional Office No. XI</p>
                <p className="text-base font-bold mt-3">CLAIM FOR INDEMNITY (PAGHAHABOL BAYAD)</p>
                <p className="text-xs text-gray-700 mt-3 leading-relaxed">Please send your team of Adjusters to assess damage of my insured crop.<br />(Mangyaring magpadala kayo ng tagapag-imbistige upang tasahin ang naging pinsala ng aking pananim)</p>
                <p className="text-xs text-gray-700 mt-1">Hereunder are the basic information needed by your office. (Narito ang mga kinakailangang tala ng inyong tanggapon)</p>
              </div>

              {/* I. BASIC INFORMATION (MGA PANGUNAHING IMPORMASYON) - form layout with underlined value lines */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">I. BASIC INFORMATION (MGA PANGUNAHING IMPORMASYON)</h3>
                <div className="space-y-4 text-sm">
                  <div><p className="text-gray-700 font-medium">1. Name of Farmer-Assured (Pangalan ng Magsasaka):</p><p className="border-b border-black pt-0.5 font-medium">{c.name || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">2. Address (Tirahan):</p><p className="border-b border-black pt-0.5 font-medium">{c.address || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">3. Cell Phone Number (Numero ng Telepono):</p><p className="border-b border-black pt-0.5 font-medium">{c.phone || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">4. Location of Farm (Lugar ng Saka):</p><p className="border-b border-black pt-0.5 font-medium">{c.farmerLocation || c.address || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">5. Insured Crops (Pananim na ipinaseguro):</p>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <span className="inline-flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isPalay ? "✓" : ""}</span> Palay</span>
                      <span className="inline-flex items-center gap-1"><span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isCorn ? "✓" : ""}</span> Corn</span>
                      <span className="border-b border-black flex-1 min-w-[120px] font-medium">{!isPalay && !isCorn ? (c.crop || "") : ""}</span>
                    </div>
                  </div>
                  <div><p className="text-gray-700 font-medium">6. Area Insured (Luwang/Sukat ng Bukid na Ipinaseguro):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.areaInsured != null ? c.areaInsured : ""}</p><span className="ml-2 text-gray-600">ha. (ektorya)</span></div>
                  <div><p className="text-gray-700 font-medium">7. Variety Planted (Binhing Itinanim):</p><p className="border-b border-black pt-0.5 font-medium">{c.varietyPlanted || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">8. Actual Date of Planting (Aktwal na Petsa ng Pagkakatanim):</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1">DS <span className="border-b border-black min-w-[80px] font-medium">{c.plantingDate ? new Date(c.plantingDate).toLocaleDateString() : ""}</span></span>
                      <span className="flex items-center gap-1">TP <span className="border-b border-black min-w-[80px] font-medium"></span></span>
                    </div>
                  </div>
                  <div><p className="text-gray-700 font-medium">9. CIC Number (Numero ng CIC):</p><p className="border-b border-black pt-0.5 font-medium">{c.cicNumber || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">10. Underwriter/Cooperative (Pangalan ng Ahente o Kooperatiba):</p><p className="border-b border-black pt-0.5 font-medium">{c.underwriter || ""}</p></div>
                  <div>
                    <p className="text-gray-700 font-medium">11. Program (Programa):</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                      {programLabels.map((label) => (
                        <span key={label} className="inline-flex items-center gap-1">
                          <span className="inline-flex items-center justify-center w-4 h-4 border border-black rounded-sm flex-shrink-0 text-xs font-bold">{isProgramChecked(label) ? "✓" : ""}</span> {label}
                        </span>
                      ))}
                      <span className="inline-flex items-center gap-1">( ) Others: <span className="border-b border-black min-w-[80px] font-medium">{c.otherProgramText || ""}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* II. DAMAGE INDICATORS (MGA IMPORMASYON TUNGKOL SA PINSALA) */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-4">II. DAMAGE INDICATORS (MGA IMPORMASYON TUNGKOL SA PINSALA)</h3>
                <div className="space-y-4 text-sm">
                  <div><p className="text-gray-700 font-medium">1. Cause of Loss (Sanhi ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.damageType || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">2. Date of Loss Occurrence (Petsa ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.lossDate ? new Date(c.lossDate).toLocaleDateString() : ""}</p></div>
                  <div><p className="text-gray-700 font-medium">3. Age/Stage of cultivation at time of loss (Edad ng Pananim ng Mapinsala):</p><p className="border-b border-black pt-0.5 font-medium">{c.ageStage || ""}</p></div>
                  <div><p className="text-gray-700 font-medium">4. Area Damaged (Luwang o sukat ng Napinsalang Bahagi):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.areaDamaged != null ? c.areaDamaged : ""}</p><span className="ml-2 text-gray-600">ha. (ektaryo)</span></div>
                  <div><p className="text-gray-700 font-medium">5. Extent/Degree of Damage (Tindi o Porsyento ng Pinsala):</p><p className="border-b border-black pt-0.5 font-medium inline">{c.degreeOfDamage != null ? c.degreeOfDamage : ""}</p><span className="ml-2 text-gray-600">% (porsyento)</span></div>
                  <div><p className="text-gray-700 font-medium">6. Expected Date of Harvest (Tinatayang Petsa ng Pagpapagapas o Pag-ani):</p><p className="border-b border-black pt-0.5 font-medium">{c.expectedHarvest || ""}</p></div>
                </div>
              </div>

              {/* III. LOCATION SKETCH PLAN OF DAMAGED CROPS (LSP) */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase border-b border-black pb-1 mb-1">III. LOCATION SKETCH PLAN OF DAMAGED CROPS (LSP)</h3>
                <p className="text-xs text-gray-600 mb-3">(KROKIS NG BUKID NG MGA NASALANTANG NAKASEGURONG PANANIM)</p>
                <p className="text-xs text-gray-600 mb-3 italic">Isulat ang pangalan ng may-ari/nagsasaka sa karatig na sakahan</p>
                <div className="space-y-4 text-sm">
                  {[1, 2, 3, 4].map((lot) => {
                    const lb = c.lotBoundaries && c.lotBoundaries[lot] ? c.lotBoundaries[lot] : {}
                    return (
                      <div key={lot} className="border border-gray-300 p-3 rounded">
                        <p className="font-medium mb-2">Lot {lot} _____ ha.</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div><span className="text-gray-600">North (Hilaga):</span><p className="border-b border-black font-medium">{lb.north || ""}</p></div>
                          <div><span className="text-gray-600">South (Timog):</span><p className="border-b border-black font-medium">{lb.south || ""}</p></div>
                          <div><span className="text-gray-600">East (Silangan):</span><p className="border-b border-black font-medium">{lb.east || ""}</p></div>
                          <div><span className="text-gray-600">West (Kanluran):</span><p className="border-b border-black font-medium">{lb.west || ""}</p></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer - Thank You / Signature */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <p className="text-sm">Thank You.</p>
                <p className="text-sm mt-1">Very truly yours,</p>
                <p className="border-b-2 border-black pt-8 pb-1 mt-4 min-h-[2rem]"></p>
                <p className="text-xs text-gray-600 mt-1">Signature over Printed Name of Assured Farmer-Claimant (Lagda sa Ibabaw ng Pangalan ng Magsasakang Nakaseguro)</p>
              </div>

              {/* Damage Evidence Photos */}
              {c.damagePhotos && c.damagePhotos.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black">
                  <h4 className="text-sm font-bold uppercase mb-3 flex items-center gap-2">
                    <Camera size={16} />
                    Damage Evidence Photos ({c.damagePhotos.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {c.damagePhotos.map((photo, index) => {
                      const isValidDataUrl = typeof photo === 'string' && photo.startsWith('data:')
                      if (!isValidDataUrl) {
                        return (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 bg-gray-200 rounded-lg border-2 border-black flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Photo {index + 1}</p>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Damage evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-black cursor-pointer hover:opacity-90"
                            onClick={() => {
                              const modal = document.createElement('div')
                              modal.className = 'fixed inset-0 z-[60] bg-black bg-opacity-75 flex items-center justify-center p-4'
                              modal.innerHTML = `<div class="relative max-w-4xl max-h-full"><img src="${photo}" alt="Damage evidence ${index + 1}" class="max-w-full max-h-full object-contain" /><button class="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full" onclick="this.closest('.fixed').remove()">×</button></div>`
                              document.body.appendChild(modal)
                              modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove() })
                            }}
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Photo {index + 1}</div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-600 mt-3">Click on any photo to view it in full size</p>
                </div>
              )}

              {c.adminFeedback && (
                <div className="mt-6 p-4 rounded-lg border border-purple-200 bg-purple-50">
                  <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2"><Info size={16} /> Admin Feedback</h4>
                  <p className="text-gray-700 text-sm">{c.adminFeedback}</p>
                </div>
              )}

              {c.status === "pending" && (
                <>
                  <div className="mt-4 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quick Feedback (Optional)</label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500"
                      rows={2}
                      placeholder="Add notes or feedback for the farmer..."
                    />
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => initiateStatusUpdate(c._id || c.id, "rejected", c.farmerId)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                      <ThumbsDown size={18} className="mr-2" />
                      Reject Claim
                    </button>
                    <button
                      onClick={() => initiateStatusUpdate(c._id || c.id, "approved", c.farmerId)}
                      className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition flex items-center"
                    >
                      <ThumbsUp size={18} className="mr-2" />
                      Approve Claim
                    </button>
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { setShowClaimDetails(false); setFeedbackText && setFeedbackText(""); }}
                  className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Confirmation Modal for Claim Status Update */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {confirmationAction.type === "approved" ? "Approve Claim" : "Reject Claim"}
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to {confirmationAction.type === "approved" ? "approve" : "reject"} this claim? This
              action cannot be undone.
            </p>
            
            {/* Feedback Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {confirmationAction.type === "approved" ? "Approval Notes (Optional)" : "Rejection Reason (Optional)"}
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                rows={3}
                placeholder={confirmationAction.type === "approved" ? "Add any notes for the farmer..." : "Provide reason for rejection..."}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  confirmationAction.type === "approved"
                    ? "bg-lime-600 hover:bg-lime-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmationAction.type === "approved" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal - REMOVED - Feature disabled per user request */}

      {/* Farmer Details Modal */}
      {showFarmerDetails && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Farmer Details</h2>
              <button
                onClick={() => setShowFarmerDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Full Name</span>
                      <p className="font-medium">{selectedFarmer.farmerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Birthday</span>
                      <p className="font-medium">{selectedFarmer.birthday || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Gender</span>
                      <p className="font-medium">{selectedFarmer.gender || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Contact Number</span>
                      <p className="font-medium">{selectedFarmer.contactNum || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Address</span>
                      <p className="font-medium">{selectedFarmer.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Farm Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Crop Type</span>
                      <p className="font-medium">{selectedFarmer.cropType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Crop Area</span>
                      <p className="font-medium">{selectedFarmer.cropArea} hectares</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lot Number</span>
                      <p className="font-medium">{selectedFarmer.lotNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lot Area</span>
                      <p className="font-medium">{selectedFarmer.lotArea || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Certified</span>
                      <p className="font-medium">
                        {selectedFarmer.isCertified ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle size={16} className="mr-1" /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Insurance Type</span>
                    <p className="font-medium">{selectedFarmer.insuranceType || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Premium Amount</span>
                    <p className="font-medium">{selectedFarmer.premiumAmount || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Period From</span>
                    <p className="font-medium">{selectedFarmer.periodFrom || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Period To</span>
                    <p className="font-medium">{selectedFarmer.periodTo || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Agency</span>
                    <p className="font-medium">{selectedFarmer.agency || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFarmerDetails(false)}
                  className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && farmerToDelete && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={24} />
              Delete Farmer
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{farmerToDelete.farmerName}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setFarmerToDelete(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Remove farmer from the list
                  setFarmers((prevFarmers) => prevFarmers.filter((farmer) => farmer.id !== farmerToDelete.id))

                  // Update localStorage
                  const updatedFarmers = farmers.filter((farmer) => farmer.id !== farmerToDelete.id)
                  localStorage.setItem("farmers", JSON.stringify(updatedFarmers))

                  // Close modal
                  setShowDeleteConfirmation(false)
                  setFarmerToDelete(null)

                  // Show success message
                  alert("Farmer deleted successfully!")
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <X size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminModals
