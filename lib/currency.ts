/**
 * Currency formatting utilities using Intl.NumberFormat
 * Provides locale-aware currency formatting with user preferences
 */

export interface CurrencySettings {
  code: string
  locale?: string
}

// Common currency codes and their typical locales
export const COMMON_CURRENCIES = {
  USD: { code: 'USD', locale: 'en-US', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', locale: 'en-EU', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', locale: 'en-GB', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', locale: 'ja-JP', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', locale: 'en-CA', symbol: '$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', locale: 'en-AU', symbol: '$', name: 'Australian Dollar' },
} as const

export type CurrencyCode = keyof typeof COMMON_CURRENCIES

/**
 * Get user's preferred currency from localStorage or detect from locale
 */
export function getPreferredCurrency(): CurrencySettings {
  if (typeof window === 'undefined') {
    return { code: 'USD', locale: 'en-US' }
  }

  try {
    const saved = localStorage.getItem('preferences:v1')
    if (saved) {
      const prefs = JSON.parse(saved)
      if (prefs.currency) {
        return {
          code: prefs.currency,
          locale: prefs.locale || detectLocaleFromCurrency(prefs.currency)
        }
      }
    }
  } catch (error) {
    console.warn('Error reading currency preference:', error)
  }

  // Fallback to user's locale
  const userLocale = navigator.language || 'en-US'
  const detectedCurrency = detectCurrencyFromLocale(userLocale)
  
  return {
    code: detectedCurrency,
    locale: userLocale
  }
}

/**
 * Detect currency code from locale
 */
function detectCurrencyFromLocale(locale: string): string {
  const region = locale.split('-')[1]?.toLowerCase()
  
  const regionToCurrency: Record<string, string> = {
    'us': 'USD',
    'ca': 'CAD',
    'gb': 'GBP',
    'au': 'AUD',
    'jp': 'JPY',
    'eu': 'EUR',
    'de': 'EUR',
    'fr': 'EUR',
    'es': 'EUR',
    'it': 'EUR',
    'nl': 'EUR',
  }
  
  return regionToCurrency[region] || 'USD'
}

/**
 * Get typical locale for a currency code
 */
function detectLocaleFromCurrency(currencyCode: string): string {
  const currencyToLocale: Record<string, string> = {
    'USD': 'en-US',
    'CAD': 'en-CA',
    'GBP': 'en-GB',
    'AUD': 'en-AU',
    'JPY': 'ja-JP',
    'EUR': 'en-EU',
  }
  
  return currencyToLocale[currencyCode] || 'en-US'
}

/**
 * Format amount as currency using user's preferences
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const prefs = getPreferredCurrency()
  const currency = options?.currency || prefs.code
  const locale = options?.locale || prefs.locale || 'en-US'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(amount)
  } catch (error) {
    console.warn('Error formatting currency:', error)
    // Fallback to simple formatting
    return `${COMMON_CURRENCIES.USD.symbol}${amount.toFixed(2)}`
  }
}

/**
 * Format amount as currency without symbol (for input fields)
 */
export function formatCurrencyInput(
  amount: number,
  options?: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  const prefs = getPreferredCurrency()
  const locale = options?.locale || prefs.locale || 'en-US'

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    }).format(amount)
  } catch (error) {
    console.warn('Error formatting currency input:', error)
    return amount.toFixed(2)
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0
  
  // Remove currency symbols, spaces, and formatting
  const cleaned = value
    .replace(/[^\d.,\-]/g, '') // Keep only digits, commas, periods, and minus
    .replace(/,/g, '.') // Normalize comma decimal separators
    
  const number = parseFloat(cleaned)
  return isNaN(number) ? 0 : number
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(value: string): {
  isValid: boolean
  amount: number
  error?: string
} {
  if (!value.trim()) {
    return { isValid: false, amount: 0, error: 'Amount is required' }
  }

  const amount = parseCurrency(value)
  
  if (isNaN(amount) || amount < 0) {
    return { isValid: false, amount: 0, error: 'Please enter a valid positive amount' }
  }

  if (amount > 1e9) {
    return { isValid: false, amount: 0, error: 'Amount is too large' }
  }

  return { isValid: true, amount }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  if (currencyCode in COMMON_CURRENCIES) {
    return COMMON_CURRENCIES[currencyCode as CurrencyCode].symbol
  }
  
  // Try to get symbol from Intl.NumberFormat
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    
    const parts = formatter.formatToParts(0)
    const symbolPart = parts.find(part => part.type === 'currency')
    return symbolPart?.value || currencyCode
  } catch (error) {
    return currencyCode
  }
}