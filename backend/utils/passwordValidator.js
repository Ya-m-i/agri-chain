/**
 * Password validation utility
 * Enforces strong password requirements to improve security
 */

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
    const errors = []
    
    if (!password) {
        return { isValid: false, errors: ['Password is required'] }
    }
    
    // Minimum length: 8 characters (increased from 6)
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long')
    }
    
    // Maximum length: 128 characters (prevent DoS)
    if (password.length > 128) {
        errors.push('Password must be less than 128 characters')
    }
    
    // At least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter')
    }
    
    // At least one lowercase letter
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter')
    }
    
    // At least one number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number')
    }
    
    // At least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*...)')
    }
    
    // Check for common weak passwords
    const commonPasswords = [
        'password', 'password123', 'admin', 'admin123', '12345678',
        'qwerty', 'abc123', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'sunshine', 'princess', 'football'
    ]
    
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a stronger password')
    }
    
    // Check for repeated characters (e.g., "aaaaaa")
    if (/(.)\1{3,}/.test(password)) {
        errors.push('Password cannot contain the same character repeated 4 or more times')
    }
    
    // Check for sequential characters (e.g., "1234", "abcd")
    if (/012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
        errors.push('Password cannot contain sequential characters (e.g., 1234, abcd)')
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
    
    // Length scoring
    if (password.length >= 8) score += 10
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10
    
    // Character variety
    if (/[a-z]/.test(password)) score += 10
    if (/[A-Z]/.test(password)) score += 10
    if (/[0-9]/.test(password)) score += 10
    if (/[^a-zA-Z0-9]/.test(password)) score += 10
    
    // Complexity bonus
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.6) score += 10
    
    // Penalties
    if (password.length < 8) score = Math.max(0, score - 20)
    if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 10)
    
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

