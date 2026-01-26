/**
 * Frontend password validation utility
 * Matches backend validation for consistency
 */

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: {score, level} }
 */
export const validatePassword = (password) => {
  const errors = []
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'], strength: { score: 0, level: 'weak' } }
  }
  
  // Minimum length: 4 characters
  if (password.length < 4) {
    errors.push('Password must be at least 4 characters long')
  }
  
  // Check for special characters - not allowed
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password cannot contain special characters')
  }
  
  const strength = calculatePasswordStrength(password)
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Calculates password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {Object} - { score: number, level: string }
 */
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, level: 'weak' }
  
  let score = 0
  
  // Length scoring (simplified for 4+ character requirement)
  if (password.length >= 4) score += 30
  if (password.length >= 6) score += 20
  if (password.length >= 8) score += 20
  
  // Character variety (no special characters allowed)
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 20
  
  // Penalties
  if (password.length < 4) score = 0
  
  let level = 'weak'
  if (score >= 70) level = 'strong'
  else if (score >= 40) level = 'medium'
  
  return { score: Math.min(100, score), level }
}

/**
 * Gets password strength color
 * @param {string} level - 'weak' | 'medium' | 'strong'
 * @returns {string} - Tailwind color class
 */
export const getPasswordStrengthColor = (level) => {
  switch (level) {
    case 'strong':
      return 'bg-green-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'weak':
    default:
      return 'bg-red-500'
  }
}

/**
 * Gets password strength text color
 * @param {string} level - 'weak' | 'medium' | 'strong'
 * @returns {string} - Tailwind color class
 */
export const getPasswordStrengthTextColor = (level) => {
  switch (level) {
    case 'strong':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'weak':
    default:
      return 'text-red-600'
  }
}

/**
 * Gets password strength label
 * @param {string} level - 'weak' | 'medium' | 'strong'
 * @returns {string} - Label text
 */
export const getPasswordStrengthLabel = (level) => {
  switch (level) {
    case 'strong':
      return 'Strong'
    case 'medium':
      return 'Medium'
    case 'weak':
    default:
      return 'Weak'
  }
}

