/**
 * Validation guards and parsers for Expense and Preferences types
 * Provides runtime type safety and data sanitization
 */

// Core type definitions
export interface Expense {
  id: number
  amount: number
  description: string
  category: string
  date: string // ISO date string (YYYY-MM-DD)
  createdAt: string // ISO datetime string
  updatedAt: string // ISO datetime string
}

export interface Preferences {
  currency: string
  theme: 'light' | 'dark' | 'system'
  monthlyBudget: number | null
  createdAt: string // ISO datetime string
  updatedAt?: string // ISO datetime string
}

// Validation result type
export interface ValidationResult<T> {
  isValid: boolean
  data?: T
  errors: string[]
}

// Expense categories
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Home & Garden',
  'Gifts & Donations',
  'Business',
  'Other'
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'
] as const

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

// Theme options
export const THEME_OPTIONS = ['light', 'dark', 'system'] as const
export type ThemeOption = typeof THEME_OPTIONS[number]

/**
 * Validate and parse expense data
 */
export function validateExpense(data: any): ValidationResult<Expense> {
  const errors: string[] = []

  // Check required fields
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid expense data'] }
  }

  // Validate ID
  if (typeof data.id !== 'number' || data.id <= 0) {
    errors.push('ID must be a positive number')
  }

  // Validate amount
  if (typeof data.amount !== 'number' || isNaN(data.amount)) {
    errors.push('Amount must be a valid number')
  } else if (data.amount <= 0) {
    errors.push('Amount must be greater than zero')
  } else if (data.amount > 1000000) {
    errors.push('Amount cannot exceed 1,000,000')
  }

  // Validate description
  if (typeof data.description !== 'string') {
    errors.push('Description must be a string')
  } else if (data.description.trim().length === 0) {
    errors.push('Description is required')
  } else if (data.description.length > 200) {
    errors.push('Description cannot exceed 200 characters')
  }

  // Validate category
  if (typeof data.category !== 'string') {
    errors.push('Category must be a string')
  } else if (!EXPENSE_CATEGORIES.includes(data.category as ExpenseCategory)) {
    errors.push(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`)
  }

  // Validate date
  if (typeof data.date !== 'string') {
    errors.push('Date must be a string')
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format')
    } else {
      const parsedDate = new Date(data.date + 'T00:00:00.000Z')
      if (isNaN(parsedDate.getTime())) {
        errors.push('Date must be a valid date')
      }
    }
  }

  // Validate createdAt
  if (typeof data.createdAt !== 'string') {
    errors.push('CreatedAt must be a string')
  } else {
    const createdAt = new Date(data.createdAt)
    if (isNaN(createdAt.getTime())) {
      errors.push('CreatedAt must be a valid ISO datetime')
    }
  }

  // Validate updatedAt
  if (typeof data.updatedAt !== 'string') {
    errors.push('UpdatedAt must be a string')
  } else {
    const updatedAt = new Date(data.updatedAt)
    if (isNaN(updatedAt.getTime())) {
      errors.push('UpdatedAt must be a valid ISO datetime')
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Sanitize and return valid expense
  const expense: Expense = {
    id: data.id,
    amount: Number(data.amount.toFixed(2)), // Round to 2 decimal places
    description: data.description.trim(),
    category: data.category,
    date: data.date,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }

  return { isValid: true, data: expense, errors: [] }
}

/**
 * Validate expense array
 */
export function validateExpenses(data: any): ValidationResult<Expense[]> {
  if (!Array.isArray(data)) {
    return { isValid: false, errors: ['Expenses must be an array'] }
  }

  const expenses: Expense[] = []
  const allErrors: string[] = []

  data.forEach((item, index) => {
    const result = validateExpense(item)
    if (result.isValid && result.data) {
      expenses.push(result.data)
    } else {
      allErrors.push(`Expense ${index}: ${result.errors.join(', ')}`)
    }
  })

  if (allErrors.length > 0) {
    return { isValid: false, errors: allErrors }
  }

  return { isValid: true, data: expenses, errors: [] }
}

/**
 * Validate and parse preferences data
 */
export function validatePreferences(data: any): ValidationResult<Preferences> {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid preferences data'] }
  }

  // Validate currency
  if (typeof data.currency !== 'string') {
    errors.push('Currency must be a string')
  } else if (!SUPPORTED_CURRENCIES.includes(data.currency as SupportedCurrency)) {
    errors.push(`Currency must be one of: ${SUPPORTED_CURRENCIES.join(', ')}`)
  }

  // Validate theme
  if (typeof data.theme !== 'string') {
    errors.push('Theme must be a string')
  } else if (!THEME_OPTIONS.includes(data.theme as ThemeOption)) {
    errors.push(`Theme must be one of: ${THEME_OPTIONS.join(', ')}`)
  }

  // Validate monthlyBudget
  if (data.monthlyBudget !== null && data.monthlyBudget !== undefined) {
    if (typeof data.monthlyBudget !== 'number' || isNaN(data.monthlyBudget)) {
      errors.push('Monthly budget must be a number or null')
    } else if (data.monthlyBudget <= 0) {
      errors.push('Monthly budget must be greater than zero')
    } else if (data.monthlyBudget > 10000000) {
      errors.push('Monthly budget cannot exceed 10,000,000')
    }
  }

  // Validate createdAt
  if (typeof data.createdAt !== 'string') {
    errors.push('CreatedAt must be a string')
  } else {
    const createdAt = new Date(data.createdAt)
    if (isNaN(createdAt.getTime())) {
      errors.push('CreatedAt must be a valid ISO datetime')
    }
  }

  // Validate updatedAt (optional)
  if (data.updatedAt !== undefined) {
    if (typeof data.updatedAt !== 'string') {
      errors.push('UpdatedAt must be a string')
    } else {
      const updatedAt = new Date(data.updatedAt)
      if (isNaN(updatedAt.getTime())) {
        errors.push('UpdatedAt must be a valid ISO datetime')
      }
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  // Sanitize and return valid preferences
  const preferences: Preferences = {
    currency: data.currency,
    theme: data.theme,
    monthlyBudget: data.monthlyBudget === null ? null : Number(data.monthlyBudget?.toFixed(2)),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }

  return { isValid: true, data: preferences, errors: [] }
}

/**
 * Create a new expense with validation
 */
export function createExpense(data: {
  id: number
  amount: number | string
  description: string
  category: string
  date: string
}): ValidationResult<Expense> {
  const now = new Date().toISOString()
  
  const expenseData = {
    id: data.id,
    amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
    description: data.description,
    category: data.category,
    date: data.date,
    createdAt: now,
    updatedAt: now
  }

  return validateExpense(expenseData)
}

/**
 * Update an existing expense with validation
 */
export function updateExpense(
  existing: Expense,
  updates: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>
): ValidationResult<Expense> {
  const updatedData = {
    ...existing,
    ...updates,
    amount: updates.amount !== undefined 
      ? (typeof updates.amount === 'string' ? parseFloat(updates.amount as any) : updates.amount)
      : existing.amount,
    updatedAt: new Date().toISOString()
  }

  return validateExpense(updatedData)
}

/**
 * Create default preferences
 */
export function createDefaultPreferences(): Preferences {
  return {
    currency: 'USD',
    theme: 'system',
    monthlyBudget: null,
    createdAt: new Date().toISOString()
  }
}

/**
 * Update preferences with validation
 */
export function updatePreferences(
  existing: Preferences,
  updates: Partial<Pick<Preferences, 'currency' | 'theme' | 'monthlyBudget'>>
): ValidationResult<Preferences> {
  const updatedData = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  }

  return validatePreferences(updatedData)
}

/**
 * Type guard for Expense
 */
export function isExpense(data: any): data is Expense {
  const result = validateExpense(data)
  return result.isValid
}

/**
 * Type guard for Preferences
 */
export function isPreferences(data: any): data is Preferences {
  const result = validatePreferences(data)
  return result.isValid
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 200): string {
  return input.trim().slice(0, maxLength)
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(input: number | string, min: number = 0, max: number = 1000000): number {
  const num = typeof input === 'string' ? parseFloat(input) : input
  
  if (isNaN(num)) {
    throw new Error('Invalid number')
  }
  
  return Math.max(min, Math.min(max, Number(num.toFixed(2))))
}

/**
 * Validate form data for expense creation
 */
export function validateExpenseForm(formData: {
  amount: string
  description: string
  category: string
  date: string
}): ValidationResult<{
  amount: number
  description: string
  category: ExpenseCategory
  date: string
}> {
  const errors: string[] = []

  // Validate amount
  const amount = parseFloat(formData.amount)
  if (isNaN(amount) || amount <= 0) {
    errors.push('Please enter a valid amount greater than zero')
  } else if (amount > 1000000) {
    errors.push('Amount cannot exceed 1,000,000')
  }

  // Validate description
  const description = formData.description.trim()
  if (!description) {
    errors.push('Please enter a description')
  } else if (description.length > 200) {
    errors.push('Description cannot exceed 200 characters')
  }

  // Validate category
  if (!EXPENSE_CATEGORIES.includes(formData.category as ExpenseCategory)) {
    errors.push('Please select a valid category')
  }

  // Validate date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(formData.date)) {
    errors.push('Please enter a valid date')
  } else {
    const date = new Date(formData.date + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) {
      errors.push('Please enter a valid date')
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      amount: Number(amount.toFixed(2)),
      description,
      category: formData.category as ExpenseCategory,
      date: formData.date
    },
    errors: []
  }
}