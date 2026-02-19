"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Key, Save, Eye, EyeOff, AlertCircle, CheckCircle, UserCircle } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { getUserProfile, updateUserProfile, getAdminProfileImageUrl, saveAdminProfileImage } from "../api"
import { validatePassword } from "../utils/passwordValidator"
import PasswordStrengthMeter from "./PasswordStrengthMeter"
import { compressImageForProfile } from "../utils/imageOptimization"
import { toast } from "react-hot-toast"

const AdminProfile = () => {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState({
    username: "",
    name: "",
    role: "",
    profileImageVersion: 0,
  })
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [profileSavingImage, setProfileSavingImage] = useState(false)
  const [profileImageLoadFailed, setProfileImageLoadFailed] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingProfile, setLoadingProfile] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true)
      // Get token from localStorage or auth store
      const token = localStorage.getItem("token") || ""
      
      // If we have user data from auth store, use it
      if (user && (user.id || user._id)) {
        setProfile({
          username: user.username || "",
          name: user.name || user.username || "",
          role: user.role || "admin",
          profileImageVersion: user.profileImageVersion ?? 0,
        })
        setFormData({
          username: user.username || "",
          name: user.name || user.username || "",
          password: "",
          confirmPassword: "",
        })
        setLoadingProfile(false)
        return
      }

      // Otherwise, try to fetch from API
      if (token) {
        const profileData = await getUserProfile(token)
        setProfile({
          username: profileData.username || "",
          name: profileData.name || profileData.username || "",
          role: profileData.role || "admin",
          profileImageVersion: profileData.profileImageVersion ?? 0,
        })
        setFormData({
          username: profileData.username || "",
          name: profileData.name || profileData.username || "",
          password: "",
          confirmPassword: "",
        })
      }
    } catch (err) {
      console.error("Error loading profile:", err)
      // Use auth store data as fallback
      if (user) {
        setProfile({
          username: user.username || "",
          name: user.name || user.username || "",
          role: user.role || "admin",
          profileImageVersion: user.profileImageVersion ?? 0,
        })
        setFormData({
          username: user.username || "",
          name: user.name || user.username || "",
          password: "",
          confirmPassword: "",
        })
      }
    } finally {
      setLoadingProfile(false)
    }
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    setSuccess("")
  }

  const currentUserId = user?.id ?? user?._id

  const handleProfileImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.")
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

  const saveProfileImageToServer = async () => {
    if (!currentUserId || !profileImageFile) return
    setProfileSavingImage(true)
    try {
      const res = await saveAdminProfileImage(currentUserId, profileImageFile)
      const newVersion = res?.version ?? (profile.profileImageVersion || 0) + 1
      setProfile((prev) => ({ ...prev, profileImageVersion: newVersion }))
      useAuthStore.getState().updateUser({ profileImageVersion: newVersion })
      setProfileImageFile(null)
      if (profileImagePreview && profileImagePreview.startsWith("blob:")) URL.revokeObjectURL(profileImagePreview)
      setProfileImagePreview(null)
      setProfileImageLoadFailed(false)
      toast.success("Profile picture saved.")
    } catch (err) {
      toast.error(err?.message || "Failed to save profile image")
    } finally {
      setProfileSavingImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (loading) {
      return
    }
    
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Validation
      if (formData.password) {
        // Validate password strength
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
          setError(passwordValidation.errors[0] || "Password does not meet requirements")
          setLoading(false)
          return
        }

        // Check password match
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }
      }

      if (!formData.username.trim()) {
        setError("Username is required")
        setLoading(false)
        return
      }

      // Prepare update data
      const updateData = {}
      if (formData.username !== profile.username) {
        updateData.username = formData.username.trim()
      }
      if (formData.name !== profile.name) {
        updateData.name = formData.name.trim()
      }
      if (formData.password) {
        updateData.password = formData.password
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save")
        setLoading(false)
        return
      }

      // Get token
      const token = localStorage.getItem("token") || ""
      const userId = user?.id || user?._id

      if (!userId) {
        setError("User ID not found. Please log in again.")
        setLoading(false)
        return
      }

      // Update profile
      const updatedProfile = await updateUserProfile(userId, updateData, token)

      // Update local state
      setProfile({
        username: updatedProfile.username,
        name: updatedProfile.name || updatedProfile.username,
        role: updatedProfile.role || "admin",
      })

      // Update auth store
      const login = useAuthStore.getState().login
      login("admin", {
        ...user,
        username: updatedProfile.username,
        name: updatedProfile.name || updatedProfile.username,
        role: updatedProfile.role || "admin",
      })

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }))

      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="mt-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="flex items-center mb-6">
        <User size={24} className="text-lime-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {/* Profile Info Display */}
        <div className="mb-6 p-4 bg-lime-50 border-2 border-lime-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Username</p>
              <p className="text-lg font-semibold text-gray-800">{profile.username}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Role</p>
              <span className="inline-block px-3 py-1 bg-lime-600 text-white text-sm font-semibold rounded-full">
                {profile.role.toUpperCase()}
              </span>
            </div>
          </div>
          {profile.name && (
            <div className="mt-3 pt-3 border-t border-lime-200">
              <p className="text-sm font-medium text-gray-600">Display Name</p>
              <p className="text-lg font-semibold text-gray-800">{profile.name}</p>
            </div>
          )}
        </div>

        {/* Profile picture */}
        <div className="mb-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Profile picture</h4>
          <div className="flex flex-col items-center gap-3">
            {(profileImagePreview || (profile.profileImageVersion > 0 && !profileImageLoadFailed && currentUserId)) ? (
              <img
                src={profileImagePreview || getAdminProfileImageUrl(currentUserId, profile.profileImageVersion)}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                onError={() => setProfileImageLoadFailed(true)}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                <UserCircle className="h-12 w-12 text-gray-500" />
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleProfileImageSelect}
              className="w-full text-sm border-2 border-gray-300 p-2 rounded-lg"
            />
            <p className="text-xs text-gray-500">PNG or JPG, max 5MB.</p>
            {profileImageFile && (
              <button
                type="button"
                onClick={saveProfileImageToServer}
                disabled={profileSavingImage}
                className="w-full bg-lime-600 text-white py-2 rounded-lg font-semibold hover:bg-lime-700 disabled:opacity-50"
              >
                {profileSavingImage ? "Saving…" : "Save profile picture"}
              </button>
            )}
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              required
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              placeholder="Enter your display name"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Key size={16} className="mr-2" />
              New Password (leave blank to keep current)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.password && <PasswordStrengthMeter password={formData.password} />}
          </div>

          {/* Confirm Password */}
          {formData.password && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <CheckCircle className="text-green-600 mr-2" size={20} />
              <p className="text-green-600 font-medium">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} className="mr-2" />
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {formData.password ? "Updating password (this may take a moment)..." : "Saving..."}
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProfile

