/**
 * Standardize Egyptian phone numbers to E.164 format (+20...)
 * 
 * Handles formats:
 * - +201000499431 → +201000499431 (already correct)
 * - 01000499431 → +201000499431
 * - 1000499431 → +201000499431
 * 
 * Default country code is Egypt (+20)
 */
export function standardizePhoneNumber(phone: string, countryCode: string = '20'): string {
    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If already starts with +, validate and return
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // If starts with country code without +, add +
    if (cleaned.startsWith(countryCode)) {
        return `+${cleaned}`;
    }

    // If starts with 0 (local format like 01000499431), remove 0 and add country code
    if (cleaned.startsWith('0')) {
        return `+${countryCode}${cleaned.substring(1)}`;
    }

    // Otherwise, just prepend country code (e.g., 1000499431)
    return `+${countryCode}${cleaned}`;
}

/**
 * Format phone number for display (optional - adds spaces for readability)
 * +201000499431 → +20 100 049 9431
 */
export function formatPhoneForDisplay(phone: string): string {
    const standardized = standardizePhoneNumber(phone);

    // Egyptian format: +20 XXX XXX XXXX
    if (standardized.startsWith('+20') && standardized.length === 13) {
        return `${standardized.slice(0, 3)} ${standardized.slice(3, 6)} ${standardized.slice(6, 9)} ${standardized.slice(9)}`;
    }

    return standardized;
}

/**
 * Validate if phone number looks valid (basic check)
 */
export function isValidPhoneNumber(phone: string): boolean {
    const standardized = standardizePhoneNumber(phone);
    // Should start with + and have at least 10 digits total
    return standardized.startsWith('+') && standardized.length >= 11;
}
