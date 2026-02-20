import { Map, Shield } from "lucide-react"
import adminLogoImage from "../assets/Images/DALOGO.png"
import dashboardIcon from "../assets/Images/dashboard.png"
import registrationIcon from "../assets/Images/Registration.png"
import cashIcon from "../assets/Images/cash.png"
import distributionIcon from "../assets/Images/Distribution.png"
import inventoryIcon from "../assets/Images/Inventory.png"
import fileIcon from "../assets/Images/File.png"

const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarExpanded,
  setSidebarExpanded,
  activeTab,
  handleTabSwitch,
  setActiveTab,
  showMapModal,
  setShowMapModal,
  setMapMode,
  /** SuperAdmin, OfficeHead, RSBSA, PCIC - Admin tab hidden for OfficeHead and RSBSA */
  currentAdminRole = "SuperAdmin",
}) => {
  const hideAdminTab = currentAdminRole === "OfficeHead" || currentAdminRole === "RSBSA"
  const hideBlockchainTab = currentAdminRole === "RSBSA"
  /** PCIC: only Cash Assistance Claims tab is visible; all other tabs hidden */
  const isPcicOnly = currentAdminRole === "PCIC"
  return (
    <>
      {/* Mobile Sidebar */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden transition duration-150 ease-out z-30 w-64 border-r-4 border-black`}
        style={{ 
          backgroundColor: 'rgba(132, 204, 22, 0.15)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="p-6" style={{ backgroundColor: 'transparent' }}>
          <div className="flex flex-col items-center">
            <button 
              onClick={() => {
                handleTabSwitch("home")
                setSidebarOpen(false)
              }}
              className="transition-all duration-300 hover:scale-105 focus:outline-none mb-3"
            >
              <img 
                src={adminLogoImage || "/placeholder.svg"} 
                alt="Admin Logo" 
                className="h-32 w-32 object-contain"
              />
            </button>
            <h2 className="text-sm font-bold text-black text-center leading-tight">
              Kapalong Department Agriculture
            </h2>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {!isPcicOnly && (
            <li>
              <button
                onClick={() => handleTabSwitch("home")}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "home" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "home" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={dashboardIcon} alt="Dashboard" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                Dashboard
              </button>
            </li>
            )}
            {!isPcicOnly && (
            <li>
              <button
                onClick={() => handleTabSwitch("farmer-registration")}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "farmer-registration"
                    ? "text-black font-bold"
                    : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "farmer-registration" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={registrationIcon} alt="Registration" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                Farmer Registration
              </button>
            </li>
            )}
            {!isPcicOnly && (
            <li>
              <button
                onClick={() => {
                  setShowMapModal(true)
                  setMapMode("view")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg hover:bg-lime-600 ${showMapModal ? "text-black font-bold" : "text-black"}`}
                style={showMapModal ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <Map size={24} className="mr-3" />
                View Farm Locations
              </button>
            </li>
            )}
            <li>
              <button
                onClick={() => {
                  handleTabSwitch("claims")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "claims" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "claims" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={cashIcon} alt="Cash" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                Cash Assistance Claims
              </button>
            </li>
            {!hideBlockchainTab && !isPcicOnly && (
            <li>
              <button
                onClick={() => {
                  handleTabSwitch("distribution")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "distribution" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "distribution" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={distributionIcon} alt="Distribution" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                Blockchain Records
              </button>
            </li>
            )}
            {!isPcicOnly && (
            <li>
              <button
                onClick={() => {
                  setActiveTab("assistance")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "assistance" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "assistance" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={inventoryIcon} alt="Inventory" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                Assistance Inventory
              </button>
            </li>
            )}
            {!hideAdminTab && !isPcicOnly && (
            <li>
              <button
                onClick={() => {
                  handleTabSwitch("admin")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "admin" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "admin" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <Shield size={24} className="mr-3 w-10 min-w-[2.5rem]" />
                Admin
              </button>
            </li>
            )}
            {/* File for Farmers - Hidden for now */}
            {/* <li>
              <button
                onClick={() => {
                  setActiveTab("admin-filing")
                  setSidebarOpen(false)
                }}
                className={`flex items-center w-full p-2 rounded-lg ${
                  activeTab === "admin-filing" ? "text-black font-bold" : "text-black hover:bg-lime-600"
                }`}
                style={activeTab === "admin-filing" ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              >
                <img src={fileIcon} alt="File" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] mr-3 object-contain" />
                File for Farmers
              </button>
            </li> */}
          </ul>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block ${sidebarExpanded ? 'w-64' : 'w-16'} text-black space-y-6 fixed top-0 left-0 h-screen overflow-y-auto transition-all duration-150 ease-out group z-20 scrollbar-hide border-r-4 border-black`}
        style={{ 
          backgroundColor: 'rgba(132, 204, 22, 0.15)',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)'
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Admin Logo Section */}
        <div className={`p-6 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: 'transparent' }}>
          <div className="flex flex-col items-center">
            <button 
              onClick={() => handleTabSwitch("home")}
              className={`transition-all duration-300 hover:scale-105 focus:outline-none mb-3 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={adminLogoImage || "/placeholder.svg"} 
                alt="Admin Logo" 
                className="h-32 w-32 object-contain"
              />
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${sidebarExpanded ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'}`}>
              <h2 className="text-sm font-bold text-black text-center leading-tight">
                Kapalong Department Agriculture
              </h2>
            </div>
          </div>
        </div>

        {/* Main Navigation Section */}
        <div className="space-y-1 px-3">
          {!isPcicOnly && (
          <button
            onClick={() => handleTabSwitch("home")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "home" 
                ? "text-black font-bold" 
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "home" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Dashboard" : ""}
          >
            <img src={dashboardIcon} alt="Dashboard" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">Dashboard</span>}
          </button>
          )}
          {!isPcicOnly && (
          <button
            onClick={() => {
              handleTabSwitch("farmer-registration")
            }}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "farmer-registration"
                ? "text-black font-bold"
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "farmer-registration" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Farmer Registration" : ""}
          >
            <img src={registrationIcon} alt="Registration" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">Farmer Registration</span>}
          </button>
          )}

          <button
            onClick={() => handleTabSwitch("claims")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "claims" 
                ? "text-black font-bold" 
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "claims" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Cash Assistance Claims" : ""}
          >
            <img src={cashIcon} alt="Cash" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">Cash Assistance Claims</span>}
          </button>

          {!hideBlockchainTab && !isPcicOnly && (
          <button
            onClick={() => handleTabSwitch("distribution")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "distribution"
                ? "text-black font-bold"
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "distribution" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Blockchain Records" : ""}
            >
            <img src={distributionIcon} alt="Distribution" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">Blockchain Records</span>}
          </button>
          )}
        </div>

        {/* Secondary Navigation Section */}
        <div className="space-y-1 px-3">
          {!isPcicOnly && (
          <button
            onClick={() => handleTabSwitch("assistance")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "assistance"
                ? "text-black font-bold"
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "assistance" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Assistance Inventory" : ""}
          >
            <img src={inventoryIcon} alt="Inventory" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">Assistance Inventory</span>}
          </button>
          )}

          {!hideAdminTab && !isPcicOnly && (
          <button
            onClick={() => handleTabSwitch("admin")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "admin"
                ? "text-black font-bold"
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "admin" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "Admin" : ""}
          >
            <Shield size={24} className="w-10 min-w-[2.5rem] flex-shrink-0" />
            {sidebarExpanded && <span className="text-black">Admin</span>}
          </button>
          )}

          {/* File for Farmers - Hidden for now */}
          {/* <button
            onClick={() => handleTabSwitch("admin-filing")}
            className={`flex items-center ${sidebarExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-2.5 rounded-lg w-full text-left transition-colors ${
              activeTab === "admin-filing"
                ? "text-black font-bold"
                : "text-black hover:bg-lime-600"
            }`}
            style={activeTab === "admin-filing" && sidebarExpanded ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
            title={!sidebarExpanded ? "File for Farmers" : ""}
          >
            <img src={fileIcon} alt="File" className="w-10 h-10 min-w-[2.5rem] min-h-[2.5rem] max-w-[2.5rem] max-h-[2.5rem] flex-shrink-0 object-contain" />
            {sidebarExpanded && <span className="text-black">File for Farmers</span>}
          </button> */}
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar

