'use client'

import { useState, useEffect } from 'react'
import { getPreferredCurrency, formatCurrency as originalFormatCurrency } from '../lib/currency'

export function useCurrency() {
  const [currency, setCurrency] = useState(() => {
    if (typeof window === 'undefined') {
      return { code: 'USD', locale: 'en-US' }
    }
    return getPreferredCurrency()
  })
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Update currency when preferences change
    const updateCurrency = () => {
      setCurrency(getPreferredCurrency())
    }

    // Initial update after mount
    updateCurrency()

    // Listen for storage changes (when settings are saved)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferences:v1') {
        updateCurrency()
      }
    }

    // Listen for custom events (for immediate updates in same tab)
    const handlePreferenceChange = () => {
      updateCurrency()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('preferencesChanged', handlePreferenceChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('preferencesChanged', handlePreferenceChange)
    }
  }, [])

  // Memoized format function that uses current currency
  const formatCurrency = (
    amount: number,
    options?: {
      minimumFractionDigits?: number
      maximumFractionDigits?: number
    }
  ) => {
    return originalFormatCurrency(amount, {
      currency: currency.code,
      locale: currency.locale,
      ...options
    })
  }

  return {
    currency,
    formatCurrency,
    mounted
  }
}