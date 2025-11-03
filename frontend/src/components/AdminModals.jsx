"use client"

import { useEffect, useState } from "react"
import {
  X,
  MapPin,
  User,
  Layers,
  FileText,
  DollarSign,
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
import { calculateCompensation, getDamageSeverity, getCoverageDetails } from "../utils/insuranceUtils"
// Note: Notifications are now handled by backend API
import MapPicker from "./MapPicker"

const AdminModals = ({
  showModal,
  setShowModal,
  modalForm,
  setModalForm,
  initialModalForm,
  selectedLocation,
  setSelectedLocation,
  setShowMapModal,
  setMapMode,
  setFarmers,
  showEventModal,
  setShowEventModal,
  eventForm,
  handleEventChange,
  handleEventSubmit,
  showRegisterForm,
  setShowRegisterForm,
  formData,
  handleChange,
  handleSubmit,
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
  showMapModal,
  mapMode,
  mapSearchQuery,
  setMapSearchQuery,
  searchLocation,
  mapRef,
  showFarmerDetails,
  setShowFarmerDetails,
  selectedFarmer,
  showDeleteConfirmation,
  setShowDeleteConfirmation,
  farmerToDelete,
  setFarmerToDelete,
  farmers,
}) => {
  // State to force map remount when modal opens
  const [mapKey, setMapKey] = useState(Date.now());

  // Update map key when map modal opens to ensure fresh Kapalong-centered map
  useEffect(() => {
    if (showMapModal && mapMode === "add") {
      setMapKey(Date.now());
      console.log('🗺️ Map modal opened - resetting map to Kapalong center');
    }
  }, [showMapModal, mapMode]);

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

  // Before rendering the form, ensure modalForm.isCertified is always boolean
  const safeModalForm = { ...modalForm, isCertified: typeof modalForm.isCertified === 'boolean' ? modalForm.isCertified : false };

  return (
    <>
      <style>{scrollbarStyle}</style>

      {/* Modal Forms */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">Register Farmer</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Username uniqueness validation
                const storedFarmers = JSON.parse(localStorage.getItem("farmers") || "[]")
                if (storedFarmers.some(f => f.username === modalForm.username)) {
                  alert("Username already exists. Please choose a different username.")
                  return
                }
                if (!modalForm.username || !modalForm.password) {
                  alert("Username and password are required.")
                  return
                }
                const newFarmer = {
                  id: Date.now().toString(),
                  farmerName: `${modalForm.firstName} ${modalForm.middleName} ${modalForm.lastName}`.trim(),
                  address: modalForm.address,
                  cropType: modalForm.cropType,
                  cropArea: modalForm.cropArea,
                  farmName: modalForm.farmName,
                  insuranceType: modalForm.insuranceType,
                  premiumAmount: modalForm.premiumAmount,
                  lotNumber: modalForm.lotNumber,
                  lotArea: modalForm.lotArea,
                  agency: modalForm.agency,
                  isCertified: modalForm.isCertified,
                  periodFrom: modalForm.periodFrom,
                  periodTo: modalForm.periodTo,
                  birthday: modalForm.birthday,
                  gender: modalForm.gender,
                  contactNum: modalForm.contactNum,
                  location: selectedLocation,
                  username: modalForm.username,
                  password: modalForm.password,
                  rsbsaRegistered: !!modalForm.rsbsaRegistered,
                }
                // Save to localStorage
                const updatedFarmers = [...storedFarmers, newFarmer]
                localStorage.setItem("farmers", JSON.stringify(updatedFarmers))
                setFarmers(updatedFarmers)
                setModalForm(initialModalForm) // Reset
                setSelectedLocation(null)
                setShowModal(false) // Close
                alert("Farmer registered successfully!")
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6"
            >
              <input
                type="text"
                placeholder="First Name"
                value={modalForm.firstName}
                onChange={(e) => setModalForm({ ...modalForm, firstName: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Middle Name"
                value={modalForm.middleName}
                onChange={(e) => setModalForm({ ...modalForm, middleName: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={modalForm.lastName}
                onChange={(e) => setModalForm({ ...modalForm, lastName: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="date"
                placeholder="Birthday"
                value={modalForm.birthday}
                onChange={(e) => setModalForm({ ...modalForm, birthday: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <select
                value={modalForm.gender}
                onChange={(e) => setModalForm({ ...modalForm, gender: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="tel"
                placeholder="Contact Number"
                value={modalForm.contactNum}
                onChange={(e) => setModalForm({ ...modalForm, contactNum: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              {/* Username field */}
              <input
                type="text"
                placeholder="Username"
                value={modalForm.username || ""}
                onChange={e => setModalForm({ ...modalForm, username: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              {/* Password field */}
              <input
                type="password"
                placeholder="Password"
                value={modalForm.password || ""}
                onChange={e => setModalForm({ ...modalForm, password: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              {/* RSBSA Registered checkbox */}
              <div className="flex items-center space-x-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={!!modalForm.rsbsaRegistered}
                  onChange={e => setModalForm({ ...modalForm, rsbsaRegistered: e.target.checked })}
                />
                <label>RSBSA Registered <span className="text-xs text-gray-500">(Required to avail government assistance)</span></label>
              </div>
              <input
                type="text"
                placeholder="Address"
                value={modalForm.address}
                onChange={(e) => setModalForm({ ...modalForm, address: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Crop Type"
                value={modalForm.cropType}
                onChange={(e) => setModalForm({ ...modalForm, cropType: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Crop Area (hectares)"
                value={modalForm.cropArea}
                onChange={(e) => setModalForm({ ...modalForm, cropArea: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Farm Name"
                value={modalForm.farmName}
                onChange={(e) => setModalForm({ ...modalForm, farmName: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <select
                value={modalForm.insuranceType}
                onChange={(e) => setModalForm({ ...modalForm, insuranceType: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              >
                <option value="">Select Insurance Type</option>
                <option value="Crop Damage">Crop Damage</option>
                <option value="Flood">Flood</option>
                <option value="Pest">Pest</option>
              </select>
              <input
                type="number"
                placeholder="Premium Amount"
                value={modalForm.premiumAmount}
                onChange={(e) => setModalForm({ ...modalForm, premiumAmount: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Lot Number"
                value={modalForm.lotNumber}
                onChange={(e) => setModalForm({ ...modalForm, lotNumber: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Lot Area"
                value={modalForm.lotArea}
                onChange={(e) => setModalForm({ ...modalForm, lotArea: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="Agency"
                value={modalForm.agency}
                onChange={(e) => setModalForm({ ...modalForm, agency: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!!safeModalForm.isCertified}
                  onChange={e => setModalForm({ ...modalForm, isCertified: e.target.checked })}
                />
                <label>Certified</label>
              </div>
              <input
                type="date"
                value={modalForm.periodFrom}
                onChange={(e) => setModalForm({ ...modalForm, periodFrom: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="date"
                value={modalForm.periodTo}
                onChange={(e) => setModalForm({ ...modalForm, periodTo: e.target.value })}
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                required
              />
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMapModal(true)
                    setMapMode("add")
                  }}
                  className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition-colors flex items-center justify-center shadow-sm"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedLocation ? "Change Farm Location" : "Add Farm Location"}
                </button>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-lime-700 text-white px-4 py-2 rounded hover:bg-lime-600 w-full">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-xl shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar relative animate-[fadeIn_0.3s_ease-in]" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-lime-400 pointer-events-none z-10 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.8))' }}></div>
            
            {/* Decorative Lines */}
            <div className="absolute top-8 left-8 w-24 h-0.5 bg-gradient-to-r from-lime-500 to-transparent opacity-60 z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-0.5 bg-gradient-to-l from-lime-500 to-transparent opacity-60 z-10"></div>
            
            {/* Header */}
            <div className="sticky top-0 bg-white border-b-4 border-lime-500 p-6 flex justify-between items-center z-20 relative" style={{ boxShadow: '0 6px 20px rgba(132, 204, 22, 0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black rounded-lg animate-pulse" style={{ boxShadow: '0 0 20px rgba(132, 204, 22, 0.8)' }}>
                  <HandHeart className="h-7 w-7 text-lime-500" />
                </div>
              <div>
                  <h2 className="text-xl font-black text-black tracking-wide uppercase">⛓️ Add Assistance</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px rgba(132, 204, 22, 1)' }}></span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">Blockchain Protocol</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="text-lime-500 hover:text-lime-600 focus:outline-none transition-all hover:rotate-90 duration-300"
                style={{ filter: 'drop-shadow(0 0 8px rgba(132, 204, 22, 0.6))' }}
              >
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleEventSubmit} className="p-6 space-y-4 relative z-10">
              {/* Assistance Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Assistance Type</label>
                <select
                  name="assistanceType"
                  value={eventForm.assistanceType || ""}
                  onChange={handleEventChange}
                  className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
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
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Description</label>
                <textarea
                  name="description"
                  value={eventForm.description || ""}
                  onChange={handleEventChange}
                  className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600 resize-none"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  rows="3"
                  required
                  placeholder="Describe the assistance details..."
                />
              </div>
              
              {/* Crop Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Crop Type</label>
                <select
                  name="cropType"
                  value={eventForm.cropType}
                  onChange={handleEventChange}
                  className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
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
                <div className="space-y-2 animate-[fadeIn_0.3s_ease-in]">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Specify Crop Type</label>
                  <input
                    type="text"
                    name="otherCropType"
                    value={eventForm.otherCropType || ""}
                    onChange={handleEventChange}
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                    required
                    placeholder="Enter crop type..."
                  />
                </div>
              )}
              
              {/* Founder Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Founder/Agency Name</label>
                <input
                  type="text"
                  name="founderName"
                  value={eventForm.founderName}
                  onChange={handleEventChange}
                  className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                  style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  required
                  placeholder="e.g., DA-PCIC, LGU..."
                />
              </div>
              
              {/* Quantity & Date Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={eventForm.quantity}
                  onChange={handleEventChange}
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  required
                  min="1"
                    placeholder="0"
                />
              </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Date Added</label>
                <input
                  type="date"
                  name="dateAdded"
                  value={eventForm.dateAdded}
                  onChange={handleEventChange}
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                  required
                />
              </div>
              </div>
              
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-lime-600 uppercase tracking-wider">Photo/Logo</label>
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
                    className="w-full bg-white border-2 border-lime-500 p-3 rounded-lg text-black font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-600 transition-all hover:border-lime-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-lime-500 hover:file:bg-lime-500 hover:file:text-black file:transition-all"
                    style={{ boxShadow: '0 0 10px rgba(132, 204, 22, 0.2)' }}
                />
                </div>
                {eventForm.photo && (
                  <div className="mt-3 p-2 border-2 border-lime-400 rounded-lg bg-lime-50">
                    <img src={eventForm.photo} alt="Preview" className="h-24 object-contain mx-auto rounded" />
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-lime-500 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 bg-white text-black border-2 border-black px-6 py-3 rounded-lg hover:bg-black hover:text-white transition-all font-bold uppercase tracking-wide text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-black text-lime-500 px-6 py-3 rounded-lg hover:bg-lime-500 hover:text-black transition-all font-bold uppercase tracking-wide text-sm relative overflow-hidden group border-2 border-black hover:border-lime-500"
                  style={{ boxShadow: '0 4px 20px rgba(132, 204, 22, 0.5)' }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Save
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Farmer Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-5 rounded-t-xl flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Register a New Farmer</h2>
              <button
                className="text-white hover:text-gray-200 focus:outline-none"
                onClick={() => setShowRegisterForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Birthday</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    name="contactNum"
                    value={formData.contactNum}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Crop Area (hectares)</label>
                  <input
                    type="text"
                    name="cropArea"
                    value={formData.cropArea}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Insurance Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="insuranceType"
                      value={formData.insuranceType}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Premium Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="premiumAmount"
                      value={formData.premiumAmount}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lot Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lotNumber"
                      value={formData.lotNumber}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Lot Area</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="lotArea"
                      value={formData.lotArea}
                      onChange={handleChange}
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Agency</label>
                  <input
                    type="text"
                    name="agency"
                    value={formData.agency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center space-x-3 py-2">
                  <input
                    type="checkbox"
                    id="isCertified"
                    name="isCertified"
                    checked={formData.isCertified}
                    onChange={handleChange}
                    className="w-5 h-5 text-lime-600 rounded focus:ring-lime-500"
                  />
                  <label htmlFor="isCertified" className="text-gray-700 font-medium">
                    Certified Farmer
                  </label>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Period From</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="periodFrom"
                        value={formData.periodFrom}
                        onChange={handleChange}
                        className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Period To</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="periodTo"
                        value={formData.periodTo}
                        onChange={handleChange}
                        className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMapModal(true)
                      setMapMode("add")
                    }}
                    className="bg-lime-600 text-white px-4 py-3 rounded-lg hover:bg-lime-700 transition-colors flex items-center justify-center shadow-sm w-full mb-4"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    {selectedLocation ? "Change Farm Location" : "Add Farm Location"}
                  </button>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-lime-700 text-white px-4 py-3 rounded-lg hover:bg-lime-800 transition-colors flex items-center justify-center"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Farmer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Claim Details Modal */}
      {showClaimDetails && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="sticky top-0 bg-lime-700 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h2 className="text-xl font-bold">Claim Details</h2>
              <button
                onClick={() => setShowClaimDetails(false)}
                className="text-white hover:text-gray-200 focus:outline-none transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-lime-800 mb-3 flex items-center gap-2">
                    <Info size={20} />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Claim ID</span>
                      <p className="font-medium">{selectedClaim.claimNumber || selectedClaim.id || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Farmer Name</span>
                      <p className="font-medium">{selectedClaim.name || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Address</span>
                      <p className="font-medium">{selectedClaim.address || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Phone</span>
                      <p className="font-medium">{selectedClaim.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Farmer Location</span>
                      <p className="font-medium">{selectedClaim.farmerLocation || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Date Filed</span>
                      <p className="font-medium">{new Date(selectedClaim.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Status</span>
                      <p
                        className={`font-medium ${
                          selectedClaim.status === "approved"
                            ? "text-green-600"
                            : selectedClaim.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Crop Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 text-sm">Crop Type</span>
                      <p className="font-medium">{selectedClaim.crop || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Insured</span>
                      <p className="font-medium">{selectedClaim.areaInsured ? `${selectedClaim.areaInsured} hectares` : "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Area Damaged</span>
                      <p className="font-medium">{selectedClaim.areaDamaged ? `${selectedClaim.areaDamaged} hectares` : "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Degree of Damage</span>
                      <p className="font-medium">{selectedClaim.degreeOfDamage ? `${selectedClaim.degreeOfDamage}%` : "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Program</span>
                      <p className="font-medium">
                        {selectedClaim.program && selectedClaim.program.length > 0
                          ? selectedClaim.program.join(", ")
                          : selectedClaim.otherProgramText || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold text-lime-800 mb-3">Additional Crop Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Variety Planted</span>
                    <p className="font-medium">{selectedClaim.varietyPlanted || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Planting Date</span>
                    <p className="font-medium">
                      {selectedClaim.plantingDate
                        ? new Date(selectedClaim.plantingDate).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">CIC Number</span>
                    <p className="font-medium">{selectedClaim.cicNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Underwriter</span>
                    <p className="font-medium">{selectedClaim.underwriter || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Farmer Location</span>
                    <p className="font-medium">{selectedClaim.farmerLocation || "Not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Damage Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Cause of Loss</span>
                    <p className="font-medium">{selectedClaim.damageType || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Date of Loss</span>
                    <p className="font-medium">
                      {selectedClaim.lossDate ? new Date(selectedClaim.lossDate).toLocaleDateString() : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Age/Stage at Time of Loss</span>
                    <p className="font-medium">{selectedClaim.ageStage || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Expected Harvest</span>
                    <p className="font-medium">
                      {selectedClaim.expectedHarvest ? `${selectedClaim.expectedHarvest} tons` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Area Damaged</span>
                    <p className="font-medium">
                      {selectedClaim.areaDamaged ? `${selectedClaim.areaDamaged} hectares` : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Degree of Damage</span>
                    <p className="font-medium">
                      {selectedClaim.degreeOfDamage ? `${selectedClaim.degreeOfDamage}%` : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Damage Evidence Photos */}
              {selectedClaim.damagePhotos && selectedClaim.damagePhotos.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                  <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Camera size={20} />
                    Damage Evidence Photos ({selectedClaim.damagePhotos.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedClaim.damagePhotos.map((photo, index) => {
                      // Check if photo is a valid data URL
                      const isValidDataUrl = typeof photo === 'string' && photo.startsWith('data:');
                      
                      if (!isValidDataUrl) {
                        return (
                          <div key={index} className="relative group">
                            <div className="w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center">
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Photo {index + 1}</p>
                                <p className="text-xs text-gray-400">Not available</p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Damage evidence ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // Open photo in full screen modal
                              const modal = document.createElement('div');
                              modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4';
                              modal.innerHTML = `
                                <div class="relative max-w-4xl max-h-full">
                                  <img src="${photo}" alt="Damage evidence ${index + 1}" class="max-w-full max-h-full object-contain" />
                                  <button class="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-colors" onclick="this.parentElement.parentElement.remove()">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                              `;
                              document.body.appendChild(modal);
                              modal.addEventListener('click', (e) => {
                                if (e.target === modal) modal.remove();
                              });
                            }}
                          />
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Photo {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-orange-700 mt-3">
                    Click on any photo to view it in full size
                  </p>
                </div>
              )}

              {selectedClaim.lotBoundaries && Object.keys(selectedClaim.lotBoundaries).length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Location Sketch Information</h3>
                  <div className="space-y-4">
                    {Object.keys(selectedClaim.lotBoundaries).map((lot) => (
                      <div key={lot} className="border border-blue-100 p-3 rounded bg-white">
                        <h4 className="font-medium text-blue-700 mb-2">Lot {lot}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-gray-500 text-xs">North</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].north || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">South</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].south || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">East</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].east || "Not specified"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">West</span>
                            <p className="text-sm">{selectedClaim.lotBoundaries[lot].west || "Not specified"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClaim.status === "pending" && (
                <>
                  {/* Compensation Preview */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <DollarSign size={20} />
                      Compensation Preview
                    </h3>
                    {(() => {
                      const compensation = calculateCompensation(
                        Number.parseFloat(selectedClaim?.areaDamaged || 0),
                        Number.parseFloat(selectedClaim?.degreeOfDamage || 0),
                        selectedClaim?.crop || 'Other',
                        selectedClaim?.damageType || 'Other'
                      );
                      
                      const damageSeverity = getDamageSeverity(Number.parseFloat(selectedClaim?.degreeOfDamage || 0));
                      const coverageDetails = getCoverageDetails(selectedClaim?.crop || 'Other');
                      
                      return (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-yellow-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Estimated Compensation:</span>
                              <span className="text-2xl font-bold text-green-700">
                                ₱{compensation.finalCompensation.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-yellow-200">
                              <span className="text-gray-500 text-sm">Damage Severity</span>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${damageSeverity.bgColor} ${damageSeverity.color}`}>
                                {damageSeverity.level}
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-yellow-200">
                              <span className="text-gray-500 text-sm">Coverage Type</span>
                              <p className="font-medium text-sm">{coverageDetails.coverage}</p>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-yellow-200">
                            <span className="text-gray-500 text-sm">Calculation Summary</span>
                            <div className="text-xs text-gray-600 mt-1 space-y-1">
                              <div>Base Rate: ₱{compensation.cropRate.toLocaleString()}/hectare</div>
                              <div>Damage Multiplier: {compensation.damageMultiplier}x</div>
                              <div>Base Calculation: ₱{compensation.baseCompensation.toLocaleString()}</div>
                              <div className="font-medium text-green-700">Final Amount: ₱{compensation.finalCompensation.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Feedback Input for Quick Action */}
                  <div className="mt-6 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quick Feedback (Optional)
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                      rows={2}
                      placeholder="Add notes or feedback for the farmer..."
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => initiateStatusUpdate(selectedClaim._id || selectedClaim.id, "rejected", selectedClaim.farmerId)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                      <ThumbsDown size={18} className="mr-2" />
                      Reject Claim
                    </button>
                    <button
                      onClick={() => initiateStatusUpdate(selectedClaim._id || selectedClaim.id, "approved", selectedClaim.farmerId)}
                      className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition flex items-center"
                    >
                      <ThumbsUp size={18} className="mr-2" />
                      Approve Claim
                    </button>
                  </div>
                </>
              )}

              {selectedClaim.status === "approved" && selectedClaim.compensation && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Approved Compensation
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Final Compensation:</span>
                        <span className="text-2xl font-bold text-green-700">
                          ₱{selectedClaim.compensation.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <span className="text-gray-500 text-sm">Approval Date</span>
                      <p className="font-medium">
                        {selectedClaim.completionDate ? new Date(selectedClaim.completionDate).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    
                    {selectedClaim.adminFeedback && (
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <span className="text-gray-500 text-sm">Admin Feedback</span>
                        <p className="font-medium text-sm">{selectedClaim.adminFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowClaimDetails(false);
                    // Note: View/close notifications not necessary
                    console.log('Claim details closed',
                      title: 'Claim Details Closed',
                      message: `Finished reviewing claim from ${selectedClaim.name}.`,
                      timestamp: new Date()
                    });
                  }}
                  className="bg-lime-700 text-white px-6 py-2 rounded-lg hover:bg-lime-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Map Modal - Fullscreen */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-50 backdrop-blur-md">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-lime-700 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {mapMode === "view" ? "Farm Locations Map" : "Select Farm Location"}
              </h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    value={mapSearchQuery}
                    onChange={(e) => setMapSearchQuery(e.target.value)}
                    className="w-full p-2 pr-10 border rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        searchLocation()
                      }
                    }}
                  />
                  <button
                    onClick={searchLocation}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {mapMode === "view" && (
                <button
                  onClick={() => setMapMode("add")}
                  className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700 flex items-center"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Location
                </button>
              )}

              {mapMode === "add" && (
                <button
                  onClick={() => setMapMode("view")}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
                >
                  <Layers className="mr-2 h-5 w-5" />
                  View All Locations
                </button>
              )}
            </div>

            <div className="flex-1 relative bg-white overflow-hidden">
              {mapMode === "add" ? (
                <MapPicker
                  key={`map-picker-${mapKey}`}
                  onLocationSelect={(location) => {
                    setSelectedLocation(location);
                    // Reverse geocode to get address
                    fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&addressdetails=1`,
                      {
                        headers: {
                          'User-Agent': 'AGRI-CHAIN-App'
                        }
                      }
                    )
                      .then((res) => res.json())
                      .then((data) => {
                        if (data && data.display_name) {
                          const address = data.display_name;
                          // Update form data if callback exists
                          if (window.updateFarmerAddress) {
                            window.updateFarmerAddress(address, location.lat, location.lng);
                          }
                        }
                      })
                      .catch((error) => {
                        console.error('Error reverse geocoding:', error);
                      });
                  }}
                  initialCenter={[7.6042, 125.8450]}
                  initialZoom={13}
                />
              ) : (
                <div 
                  ref={mapRef} 
                  id="location-picker-map"
                  className="w-full h-full"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: '#f0f0f0'
                  }}
                ></div>
              )}
            </div>

            {mapMode === "add" && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    {selectedLocation ? (
                      <p className="text-sm text-gray-600">
                        Selected coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Click on the map to select a location</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMapModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (selectedLocation) {
                          setShowMapModal(false)
                        } else {
                          alert("Please select a location on the map first.")
                        }
                      }}
                      disabled={!selectedLocation}
                      className={`px-4 py-2 bg-lime-700 text-white rounded hover:bg-lime-800 ${
                        !selectedLocation ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Confirm Location
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
