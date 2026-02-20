"use client"

import { useState, useCallback } from "react"
import { Shield, User, Key, Eye, EyeOff, X, UserCircle, Trash2 } from "lucide-react"
import {
  useCreateAdminUser,
  useAdminUsers,
  useDeleteAdminUser,
  useSaveAdminProfileImage,
  useAdminProfileImage,
} from "../hooks/useAPI"
import { updateUserProfile } from "../api"
import { compressImageForProfile } from "../utils/imageOptimization"
import { useAuthStore } from "../store/authStore"
import { toast } from "react-hot-toast"

const MIN_LENGTH = 3
const NO_SPECIAL = /^[a-zA-Z0-9]*$/

function validateField(value, fieldName) {
  if (!value || value.trim() === "") return `${fieldName} is required`
  if (value.length < MIN_LENGTH) return `${fieldName} must be at least ${MIN_LENGTH} characters`
  if (!NO_SPECIAL.test(value)) return `${fieldName} cannot contain special characters (letters and numbers only)`
  return null
}

/** Renders admin profile image via fetch→blob URL so it always loads (no direct img src cross-origin issues). */
function AdminProfileAvatar({ userId, version, imgClassName, placeholderClassName, placeholderIconClassName }) {
  const { src, error } = useAdminProfileImage(userId, version)
  if (src && !error) {
    return <img src={src} alt="" className={imgClassName} />
  }
  return (
    <div className={placeholderClassName || "h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-black"}>
      <UserCircle className={placeholderIconClassName || "h-6 w-6 text-gray-500"} />
    </div>
  )
}

const AdminUserCreation = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  // Profile modal state
  const [profileModalAdmin, setProfileModalAdmin] = useState(null)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [profilePassword, setProfilePassword] = useState("")
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("")
  const [profileShowPassword, setProfileShowPassword] = useState(false)
  const [profilePasswordError, setProfilePasswordError] = useState(null)
  const [profileConfirmError, setProfileConfirmError] = useState(null)
  const [profileSavingImage, setProfileSavingImage] = useState(false)
  const [profileSavingPassword, setProfileSavingPassword] = useState(false)

  // Delete modal state
  const [deleteModalAdmin, setDeleteModalAdmin] = useState(null)

  const createAdminMutation = useCreateAdminUser()
  const { data: adminUsers = [], isLoading: adminUsersLoading, refetch: refetchAdmins } = useAdminUsers()
  const deleteAdminMutation = useDeleteAdminUser()
  const saveProfileImageMutation = useSaveAdminProfileImage()

  const validateUsername = useCallback((value) => {
    const err = validateField(value, "Username")
    setUsernameError(err)
    return !err
  }, [])

  const validatePassword = useCallback((value) => {
    const err = validateField(value, "Password")
    setPasswordError(err)
    return !err
  }, [])

  const handleUsernameChange = (e) => {
    const v = e.target.value
    setUsername(v)
    if (v) validateUsername(v)
    else setUsernameError(null)
  }

  const handlePasswordChange = (e) => {
    const v = e.target.value
    setPassword(v)
    if (v) validatePassword(v)
    else setPasswordError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const uValid = validateUsername(username)
    const pValid = validatePassword(password)
    if (!uValid || !pValid) return

    try {
      await createAdminMutation.mutateAsync({ username: username.trim(), password: password.trim() })
      toast.success("Admin user created successfully. They can now log in on the admin side.")
      setUsername("")
      setPassword("")
      setUsernameError(null)
      setPasswordError(null)
    } catch (err) {
      const msg = err?.message || "Failed to create admin user"
      toast.error(msg)
    }
  }

  const openProfileModal = (admin) => {
    setProfileModalAdmin(admin)
    setProfileImageFile(null)
    setProfileImagePreview(null)
    setProfilePassword("")
    setProfileConfirmPassword("")
    setProfilePasswordError(null)
    setProfileConfirmError(null)
  }

  const closeProfileModal = () => {
    setProfileModalAdmin(null)
    setProfileImageFile(null)
    setProfileImagePreview(null)
    if (profileImagePreview && profileImagePreview.startsWith("blob:")) URL.revokeObjectURL(profileImagePreview)
  }

  const handleProfileImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB. It will be compressed after selection.")
      return
    }
    try {
      const compressed = await compressImageForProfile(file, 400, 0.75)
      setProfileImageFile(compressed)
      const url = URL.createObjectURL(compressed)
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) URL.revokeObjectURL(profileImagePreview)
      setProfileImagePreview(url)
    } catch {
      setProfileImageFile(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  const saveProfileImage = async () => {
    if (!profileModalAdmin || !profileImageFile) return
    setProfileSavingImage(true)
    const adminId = profileModalAdmin._id
    try {
      const res = await saveProfileImageMutation.mutateAsync({
        userId: adminId,
        file: profileImageFile,
      })
      const newVersion = res?.version ?? (profileModalAdmin.profileImageVersion || 0) + 1
      // Update modal admin with new version immediately so the blob hook refetches and shows new image
      setProfileModalAdmin((prev) => (prev && prev._id === adminId ? { ...prev, profileImageVersion: newVersion } : prev))
      setProfileImageFile(null)
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) URL.revokeObjectURL(profileImagePreview)
      setProfileImagePreview(null)
      toast.success("Profile picture saved.")
      // Refetch so the table gets fresh data and shows the new image
      const refetchResult = await refetchAdmins()
      const updatedList = refetchResult?.data
      if (updatedList && adminId) {
        const updated = updatedList.find((a) => a._id === adminId)
        if (updated) setProfileModalAdmin(updated)
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save profile image")
    } finally {
      setProfileSavingImage(false)
    }
  }

  const saveProfilePassword = async () => {
    if (!profileModalAdmin) return
    const pwd = profilePassword.trim()
    const conf = profileConfirmPassword.trim()
    if (!pwd && !conf) {
      toast.error("Enter a new password to update.")
      return
    }
    const errP = pwd ? validateField(pwd, "Password") : null
    setProfilePasswordError(errP)
    if (errP) return
    if (pwd !== conf) {
      setProfileConfirmError("Passwords do not match")
      return
    }
    setProfileConfirmError(null)
    setProfileSavingPassword(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated. Please log in again.")
      await updateUserProfile(profileModalAdmin._id, { password: pwd }, token)
      toast.success("Password updated.")
      setProfilePassword("")
      setProfileConfirmPassword("")
    } catch (err) {
      toast.error(err?.message || "Failed to update password")
    } finally {
      setProfileSavingPassword(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModalAdmin) return
    try {
      await deleteAdminMutation.mutateAsync(deleteModalAdmin._id)
      toast.success("Admin account deleted.")
      setDeleteModalAdmin(null)
    } catch (err) {
      toast.error(err?.message || "Failed to delete account")
    }
  }

  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id ?? currentUser?._id ?? null
  const currentAdminRole = currentUser?.adminRole || "SuperAdmin"
  const canDelete = (admin) => admin._id !== currentUserId
  const canChangeRole = currentAdminRole === "SuperAdmin"

  const [updatingRoleForId, setUpdatingRoleForId] = useState(null)
  const handleRoleChange = async (adminId, newRole) => {
    if (!canChangeRole) return
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Not authenticated. Please log in again.")
      return
    }
    setUpdatingRoleForId(adminId)
    try {
      await updateUserProfile(adminId, { adminRole: newRole }, token)
      toast.success("Role updated.")
      await refetchAdmins()
    } catch (err) {
      toast.error(err?.message || "Failed to update role")
    } finally {
      setUpdatingRoleForId(null)
    }
  }

  const ADMIN_ROLES = ["SuperAdmin", "OfficeHead", "RSBSA", "PCIC"]

  return (
    <div className="mt-6 bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Admin User</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add an admin account that can log in to the admin dashboard.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Create form */}
        <div className="bg-white rounded-lg p-5 border-2 border-black relative flex-shrink-0" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", maxWidth: "28rem" }}>
          <div className="flex items-center mb-4 pb-3 border-b-2 border-black">
            <div className="p-2 bg-black rounded-lg mr-3" style={{ boxShadow: "0 0 10px rgba(132, 204, 22, 0.6)" }}>
              <Shield size={18} className="text-lime-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-wider">Login credentials</h3>
              <span className="text-[10px] text-gray-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-lime-500 rounded-full" />
                At least 3 characters, no special characters
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-lime-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={() => username && validateUsername(username)}
                  placeholder="Enter username for admin login"
                  className={`pl-10 w-full bg-white border-2 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400 ${
                    usernameError ? "border-red-500" : "border-black"
                  }`}
                  autoComplete="username"
                />
              </div>
              {usernameError && <p className="text-red-600 text-xs mt-1 font-semibold">{usernameError}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-lime-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => password && validatePassword(password)}
                  placeholder="Enter password for admin login"
                  className={`pl-10 pr-10 w-full bg-white border-2 p-3 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-500 transition-all hover:border-lime-400 ${
                    passwordError ? "border-red-500" : "border-black"
                  }`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-black hover:text-lime-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-red-600 text-xs mt-1 font-semibold">{passwordError}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={createAdminMutation.isPending}
                className="w-full bg-lime-400 border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-lime-500 transition-all font-bold shadow-lg flex items-center justify-center disabled:opacity-50"
                style={{ boxShadow: "0 0 10px rgba(132, 204, 22, 0.5)" }}
              >
                {createAdminMutation.isPending ? "Creating…" : "Create Admin User"}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Admin users table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-md border-2 border-black overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b-2 border-black bg-gradient-to-r from-lime-50 to-lime-100">
            <h3 className="text-lg font-bold text-black">Admin Users</h3>
            <button
              type="button"
              onClick={() => refetchAdmins()}
              disabled={adminUsersLoading}
              className="text-sm bg-lime-400 text-black px-3 py-1.5 rounded-lg border-2 border-black font-semibold hover:bg-lime-500 disabled:opacity-50"
            >
              {adminUsersLoading ? "Loading…" : "Refresh"}
            </button>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            {adminUsersLoading ? (
              <div className="p-8 text-center text-gray-500">Loading admin users…</div>
            ) : adminUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No admin users yet. Create one using the form.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-lime-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Profile</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminUsers.map((admin) => (
                    <tr key={admin._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openProfileModal(admin)}
                          className="flex items-center gap-2 focus:outline-none"
                        >
                          <AdminProfileAvatar
                            userId={admin._id}
                            version={admin.profileImageVersion}
                            imgClassName="h-12 w-12 rounded-full object-cover border-2 border-black"
                            placeholderClassName="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-black"
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-black">{admin.username}</td>
                      <td className="px-4 py-3">
                        {canChangeRole ? (
                          <select
                            value={admin.adminRole || "SuperAdmin"}
                            onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                            disabled={updatingRoleForId === admin._id}
                            className="px-2 py-1.5 text-sm font-medium border-2 border-black rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50"
                          >
                            {ADMIN_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm font-medium text-black">{admin.adminRole || "SuperAdmin"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        {canDelete(admin) ? (
                          <button
                            type="button"
                            onClick={() => setDeleteModalAdmin(admin)}
                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg border-2 border-black font-semibold text-sm hover:bg-red-600 flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">(you)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Profile modal */}
      {profileModalAdmin && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-2 border-black flex flex-col">
            <div className="sticky top-0 bg-lime-600 text-black p-4 rounded-t-xl flex justify-between items-center z-10 border-b-2 border-black">
              <h2 className="text-xl font-bold">Profile &amp; Password</h2>
              <button type="button" onClick={closeProfileModal} className="text-black hover:bg-lime-200 rounded-full p-1">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">{profileModalAdmin.username}</h3>
                <p className="text-gray-600 text-sm">Set profile picture and change password</p>
              </div>

              <div className="bg-white rounded-lg p-5 border-2 border-black">
                <div className="flex items-center mb-3 pb-2 border-b-2 border-black">
                  <User size={18} className="mr-2 text-lime-600" />
                  <h4 className="text-sm font-black text-black uppercase">Profile picture</h4>
                </div>
                <div className="flex flex-col items-center gap-3">
                  {profileImagePreview ? (
                    <img
                      key="preview"
                      src={profileImagePreview}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border-2 border-black"
                    />
                  ) : (
                    <AdminProfileAvatar
                      userId={profileModalAdmin._id}
                      version={profileModalAdmin.profileImageVersion}
                      imgClassName="h-24 w-24 rounded-full object-cover border-2 border-black"
                      placeholderClassName="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-black"
                      placeholderIconClassName="h-12 w-12 text-gray-500"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleProfileImageSelect}
                    className="w-full text-sm border-2 border-black p-2 rounded-lg"
                  />
                  <p className="text-xs text-gray-500">PNG or JPG, max 5MB. Image is compressed for faster upload.</p>
                  {profileImageFile && (
                    <button
                      type="button"
                      onClick={saveProfileImage}
                      disabled={profileSavingImage}
                      className="w-full bg-lime-400 border-2 border-black text-black py-2 rounded-lg font-bold hover:bg-lime-500 disabled:opacity-50"
                    >
                      {profileSavingImage ? "Saving…" : "Save profile picture"}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 border-2 border-black">
                <div className="flex items-center mb-3 pb-2 border-b-2 border-black">
                  <Key size={18} className="mr-2 text-lime-600" />
                  <h4 className="text-sm font-black text-black uppercase">Change password</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3">At least 3 characters, no special characters.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">New password</label>
                    <div className="relative">
                      <input
                        type={profileShowPassword ? "text" : "password"}
                        value={profilePassword}
                        onChange={(e) => {
                          setProfilePassword(e.target.value)
                          setProfilePasswordError(null)
                        }}
                        placeholder="New password"
                        className={`w-full bg-white border-2 p-3 rounded-lg pr-10 ${profilePasswordError ? "border-red-500" : "border-black"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setProfileShowPassword((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                      >
                        {profileShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {profilePasswordError && <p className="text-red-600 text-xs mt-1">{profilePasswordError}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-lime-600 mb-1 uppercase">Confirm password</label>
                    <input
                      type="password"
                      value={profileConfirmPassword}
                      onChange={(e) => {
                        setProfileConfirmPassword(e.target.value)
                        setProfileConfirmError(null)
                      }}
                      placeholder="Confirm new password"
                      className={`w-full bg-white border-2 p-3 rounded-lg ${profileConfirmError ? "border-red-500" : "border-black"}`}
                    />
                    {profileConfirmError && <p className="text-red-600 text-xs mt-1">{profileConfirmError}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={saveProfilePassword}
                    disabled={profileSavingPassword || (!profilePassword.trim() && !profileConfirmPassword.trim())}
                    className="w-full bg-lime-400 border-2 border-black text-black py-2 rounded-lg font-bold hover:bg-lime-500 disabled:opacity-50"
                  >
                    {profileSavingPassword ? "Updating…" : "Update password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalAdmin && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-black">
            <div className="bg-gradient-to-r from-lime-100 to-lime-50 border-b-2 border-black p-5 rounded-t-xl flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Delete Admin Account</h2>
              <button type="button" onClick={() => setDeleteModalAdmin(null)} className="text-black hover:bg-lime-200 rounded-full p-1">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
                <p className="text-sm font-semibold text-black mb-2">Are you sure you want to delete this admin account?</p>
                <p className="text-sm font-bold text-gray-800">{deleteModalAdmin.username}</p>
                <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalAdmin(null)}
                  className="flex-1 bg-white border-2 border-black text-black px-4 py-3 rounded-lg hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteAdminMutation.isPending}
                  className="flex-1 bg-red-500 border-2 border-black text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold flex items-center justify-center disabled:opacity-50"
                >
                  <Trash2 size={20} className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUserCreation
