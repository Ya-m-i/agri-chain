"use client"

import { useState, useCallback } from "react"
import { Shield, User, Key, Eye, EyeOff } from "lucide-react"
import { useCreateAdminUser } from "../hooks/useAPI"
import { toast } from "react-hot-toast"

const MIN_LENGTH = 3
const NO_SPECIAL = /^[a-zA-Z0-9]*$/

function validateField(value, fieldName) {
  if (!value || value.trim() === "") return `${fieldName} is required`
  if (value.length < MIN_LENGTH) return `${fieldName} must be at least ${MIN_LENGTH} characters`
  if (!NO_SPECIAL.test(value)) return `${fieldName} cannot contain special characters (letters and numbers only)`
  return null
}

const AdminUserCreation = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  const createAdminMutation = useCreateAdminUser()

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

  return (
    <div className="mt-6 bg-white rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Admin User</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add an admin account that can log in to the admin dashboard.
        </p>
      </div>

      <div className="bg-white rounded-lg p-5 border-2 border-black relative" style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", maxWidth: "28rem" }}>
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
    </div>
  )
}

export default AdminUserCreation
