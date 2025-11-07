"use client"

import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthTextColor, getPasswordStrengthLabel } from "../utils/passwordValidator"

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null

  const { score, level } = calculatePasswordStrength(password)

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${getPasswordStrengthTextColor(level)}`}>
          Password Strength: {getPasswordStrengthLabel(level)}
        </span>
        <span className="text-xs text-gray-500">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(level)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Use 8+ characters with uppercase, lowercase, numbers, and special characters
      </p>
    </div>
  )
}

export default PasswordStrengthMeter

