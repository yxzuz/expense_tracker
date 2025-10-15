'use client'

import { useState, useEffect } from 'react'
import { 
  getPreferences, 
  setPreferences
} from '../../lib/storage'
import { 
  updatePreferences,
  SUPPORTED_CURRENCIES,
  THEME_OPTIONS 
} from '../../lib/validation'

export default function SettingsPage() {
  const [preferences, setPreferencesState] = useState({
    currency: 'USD',
    theme: 'light' as 'light' | 'dark' | 'system',
    monthlyBudget: null as number | null
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    // Load current preferences
    const result = getPreferences()
    if (result.success && result.data) {
      setPreferencesState(result.data)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setPreferencesState(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) : value
    }))
    
    // Clear message when user makes changes
    if (message) {
      setMessage(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // Get current preferences to maintain createdAt
      const currentResult = getPreferences()
      const currentPrefs = currentResult.success ? currentResult.data : null

      // Validate preferences with proper structure
      const validation = updatePreferences(
        currentPrefs || {
          currency: 'USD',
          theme: 'system' as const,
          monthlyBudget: null,
          createdAt: new Date().toISOString()
        },
        {
          currency: preferences.currency,
          theme: preferences.theme,
          monthlyBudget: preferences.monthlyBudget
        }
      )

      if (!validation.isValid) {
        setMessage({
          type: 'error',
          text: `Validation failed: ${validation.errors.join(', ')}`
        })
        return
      }

      // Save to storage
      const result = setPreferences(validation.data!)
      
      if (!result.success) {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to save preferences'
        })
        return
      }

      setMessage({
        type: 'success',
        text: 'Settings saved successfully!'
      })

      // Update local state with validated data
      setPreferencesState(validation.data!)

      // Apply theme immediately if it changed
      if (validation.data!.theme) {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(validation.data!.theme)
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred while saving settings'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Customize your expense tracking experience
        </p>
      </div>

      <div className="card max-w-2xl">
        <div className="card-header">
          <div className="card-title">Preferences</div>
          <div className="card-description">
            Configure your currency, theme, and budget settings
          </div>
        </div>
        
        <div className="card-content space-y-6">
          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Currency */}
          <div className="space-y-2">
            <label htmlFor="currency" className="label">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={preferences.currency}
              onChange={handleInputChange}
              className="input"
            >
              {SUPPORTED_CURRENCIES.map((currency: string) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred currency for displaying amounts
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label htmlFor="theme" className="label">
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={preferences.theme}
              onChange={handleInputChange}
              className="input"
            >
              {THEME_OPTIONS.map((theme: string) => (
                <option key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Choose between light and dark mode
            </p>
          </div>

          {/* Monthly Budget */}
          <div className="space-y-2">
            <label htmlFor="monthlyBudget" className="label">
              Monthly Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                id="monthlyBudget"
                name="monthlyBudget"
                value={preferences.monthlyBudget || ''}
                onChange={handleInputChange}
                placeholder="Enter budget amount"
                step="0.01"
                min="0"
                max="1000000"
                className="input pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a monthly spending limit to track your budget
            </p>
          </div>
        </div>

        <div className="card-footer">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card max-w-2xl">
        <div className="card-header">
          <div className="card-title">Data Management</div>
          <div className="card-description">
            Import, export, or clear your expense data
          </div>
        </div>
        
        <div className="card-content space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="btn btn-outline">
              Export Data
            </button>
            <button className="btn btn-outline">
              Import Data
            </button>
            <button className="btn btn-outline text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              Clear All Data
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Export your data as JSON, import from a backup, or permanently delete all expenses and settings
          </p>
        </div>
      </div>
    </div>
  )
}
