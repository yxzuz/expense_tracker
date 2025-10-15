/**
 * Storage utilities for localStorage with versioned keys
 * Handles expenses and preferences with migration support
 */

// Storage version keys
const STORAGE_KEYS = {
  EXPENSES: 'expenses:v1',
  PREFERENCES: 'preferences:v1',
  LAST_EXPENSE_ID: 'lastExpenseId:v1'
} as const

// Type definitions
export interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface StorageMigration {
  version: string
  migrate: (data: any) => any
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Generic localStorage getter with error handling
 */
export function getStorageItem<T>(key: string): StorageResult<T> {
  if (!isStorageAvailable()) {
    return { 
      success: false, 
      error: 'localStorage is not available' 
    }
  }

  try {
    const item = localStorage.getItem(key)
    
    if (item === null) {
      return { success: true, data: undefined }
    }

    const parsed = JSON.parse(item) as T
    return { success: true, data: parsed }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to parse stored data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Generic localStorage setter with error handling
 */
export function setStorageItem<T>(key: string, value: T): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { 
      success: false, 
      error: 'localStorage is not available' 
    }
  }

  try {
    const serialized = JSON.stringify(value)
    localStorage.setItem(key, serialized)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to store data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { 
      success: false, 
      error: 'localStorage is not available' 
    }
  }

  try {
    localStorage.removeItem(key)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to remove data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Clear all app-related storage
 */
export function clearAppStorage(): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { 
      success: false, 
      error: 'localStorage is not available' 
    }
  }

  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Get expenses array from storage
 */
export function getExpenses(): StorageResult<any[]> {
  const result = getStorageItem<any[]>(STORAGE_KEYS.EXPENSES)
  
  if (result.success && result.data === undefined) {
    return { success: true, data: [] }
  }
  
  return result
}

/**
 * Save expenses array to storage
 */
export function setExpenses(expenses: any[]): StorageResult<void> {
  return setStorageItem(STORAGE_KEYS.EXPENSES, expenses)
}

/**
 * Get preferences from storage
 */
export function getPreferences(): StorageResult<any> {
  const result = getStorageItem<any>(STORAGE_KEYS.PREFERENCES)
  
  if (result.success && result.data === undefined) {
    // Return default preferences
    const defaultPreferences = {
      currency: 'USD',
      theme: 'system',
      monthlyBudget: null,
      createdAt: new Date().toISOString()
    }
    return { success: true, data: defaultPreferences }
  }
  
  return result
}

/**
 * Save preferences to storage
 */
export function setPreferences(preferences: any): StorageResult<void> {
  return setStorageItem(STORAGE_KEYS.PREFERENCES, preferences)
}

/**
 * Get last expense ID for auto-incrementing
 */
export function getLastExpenseId(): StorageResult<number> {
  const result = getStorageItem<number>(STORAGE_KEYS.LAST_EXPENSE_ID)
  
  if (result.success && result.data === undefined) {
    return { success: true, data: 0 }
  }
  
  return result
}

/**
 * Save last expense ID
 */
export function setLastExpenseId(id: number): StorageResult<void> {
  return setStorageItem(STORAGE_KEYS.LAST_EXPENSE_ID, id)
}

/**
 * Generate next expense ID
 */
export function getNextExpenseId(): StorageResult<number> {
  const result = getLastExpenseId()
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  const nextId = (result.data || 0) + 1
  const saveResult = setLastExpenseId(nextId)
  
  if (!saveResult.success) {
    return { success: false, error: saveResult.error }
  }
  
  return { success: true, data: nextId }
}

/**
 * Migrate data from old storage format
 */
export function migrateStorage(migrations: StorageMigration[]): StorageResult<void> {
  if (!isStorageAvailable()) {
    return { 
      success: false, 
      error: 'localStorage is not available' 
    }
  }

  try {
    migrations.forEach(migration => {
      // Check for old format data
      const legacyKeys = [
        'expenses', // Old key without version
        'preferences', // Old key without version
        `expenses:${migration.version}`,
        `preferences:${migration.version}`
      ]

      legacyKeys.forEach(legacyKey => {
        const item = localStorage.getItem(legacyKey)
        if (item) {
          try {
            const oldData = JSON.parse(item)
            const newData = migration.migrate(oldData)
            
            // Save to new versioned key
            if (legacyKey.includes('expenses')) {
              setStorageItem(STORAGE_KEYS.EXPENSES, newData)
            } else if (legacyKey.includes('preferences')) {
              setStorageItem(STORAGE_KEYS.PREFERENCES, newData)
            }
            
            // Remove old key
            localStorage.removeItem(legacyKey)
          } catch (error) {
            console.warn(`Failed to migrate ${legacyKey}:`, error)
          }
        }
      })
    })

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  available: boolean
  totalSize: number
  appSize: number
  keys: string[]
} {
  const info = {
    available: isStorageAvailable(),
    totalSize: 0,
    appSize: 0,
    keys: [] as string[]
  }

  if (!info.available) {
    return info
  }

  try {
    // Calculate total storage size
    let totalSize = 0
    let appSize = 0
    const keys: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        const itemSize = key.length + value.length
        
        totalSize += itemSize
        keys.push(key)
        
        // Check if it's our app's data
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          appSize += itemSize
        }
      }
    }

    info.totalSize = totalSize
    info.appSize = appSize
    info.keys = keys
  } catch (error) {
    console.warn('Failed to calculate storage info:', error)
  }

  return info
}

/**
 * Export all app data for backup
 */
export function exportAppData(): StorageResult<{
  expenses: any[]
  preferences: any
  lastExpenseId: number
  exportedAt: string
}> {
  const expenses = getExpenses()
  const preferences = getPreferences()
  const lastExpenseId = getLastExpenseId()

  if (!expenses.success) {
    return { success: false, error: expenses.error }
  }
  if (!preferences.success) {
    return { success: false, error: preferences.error }
  }
  if (!lastExpenseId.success) {
    return { success: false, error: lastExpenseId.error }
  }

  return {
    success: true,
    data: {
      expenses: expenses.data || [],
      preferences: preferences.data || {},
      lastExpenseId: lastExpenseId.data || 0,
      exportedAt: new Date().toISOString()
    }
  }
}

/**
 * Import app data from backup
 */
export function importAppData(data: {
  expenses?: any[]
  preferences?: any
  lastExpenseId?: number
}): StorageResult<void> {
  try {
    if (data.expenses) {
      const result = setExpenses(data.expenses)
      if (!result.success) return result
    }

    if (data.preferences) {
      const result = setPreferences(data.preferences)
      if (!result.success) return result
    }

    if (data.lastExpenseId !== undefined) {
      const result = setLastExpenseId(data.lastExpenseId)
      if (!result.success) return result
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}