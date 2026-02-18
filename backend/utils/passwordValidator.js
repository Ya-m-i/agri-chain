/**
 * Password validation utility
 * Rules: more than 3 characters, no special characters (letters and numbers only).
 */

/**
 * Validates password
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
    const errors = []
    
    if (!password) {
        return { isValid: false, errors: ['Password is required'] }
    }
    
    // Minimum length: more than 3 characters (i.e. at least 4)
    if (password.length <= 3) {
        errors.push('Password must be more than 3 characters long')
    }
    
    // Maximum length: 128 characters (prevent DoS)
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters')
    }
    
    // No special characters allowed (letters and numbers only)
    if (/[^a-zA-Z0-9]/.test(password)) {
        errors.push('Password cannot contain special characters')
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        strength: calculatePasswordStrength(password)
    }
}

/**
 * Calculates password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {Object} - { score: number, level: string }
 */
const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, level: 'weak' }
    
    let score = 0
    
    // Length scoring (4+ required)
    if (password.length >= 4) score += 30
    if (password.length >= 6) score += 20
    if (password.length >= 8) score += 20
    
    // Character variety (letters and numbers only)
    if (/[a-z]/.test(password)) score += 15
    if (/[A-Z]/.test(password)) score += 15
    if (/[0-9]/.test(password)) score += 20
    
    if (password.length < 4) score = 0
    
    let level = 'weak'
    if (score >= 70) level = 'strong'
    else if (score >= 40) level = 'medium'
    
    return { score: Math.min(100, score), level }
}

/**
 * Validates password and returns user-friendly error message
 * @param {string} password - Password to validate
 * @returns {string|null} - Error message or null if valid
 */
const validatePasswordWithMessage = (password) => {
    const validation = validatePassword(password)
    
    if (validation.isValid) {
        return null
    }
    
    // Return first error or combined message
    if (validation.errors.length === 1) {
        return validation.errors[0]
    }
    
    return `Password requirements: ${validation.errors.join(', ')}`
}

module.exports = {
    validatePassword,
    calculatePasswordStrength,
    validatePasswordWithMessage
}

