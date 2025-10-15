/**
 * Custom hook for managing expenses with localStorage CRUD operations
 * Provides reactive state management for expense data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  getExpenses, 
  setExpenses, 
  getNextExpenseId,
  type StorageResult 
} from '../lib/storage'
import { 
  validateExpense,
  validateExpenses,
  createExpense,
  updateExpense,
  type Expense,
  type ValidationResult
} from '../lib/validation'
import { filterByMonth, filterByDateRange, type MonthPeriod, type DateRange } from '../lib/dates'

export interface UseExpensesReturn {
  // State
  expenses: Expense[]
  isLoading: boolean
  error: string | null
  
  // Operations
  addExpense: (data: {
    amount: number | string
    description: string
    category: string
    date: string
  }) => Promise<ValidationResult<Expense>>
  
  updateExpenseById: (
    id: number,
    updates: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>
  ) => Promise<ValidationResult<Expense>>
  
  deleteExpense: (id: number) => Promise<{ success: boolean; error?: string }>
  
  // Queries
  getExpenseById: (id: number) => Expense | undefined
  getExpensesByMonth: (period: MonthPeriod) => Expense[]
  getExpensesByDateRange: (range: DateRange) => Expense[]
  getExpensesByCategory: (category: string) => Expense[]
  
  // Utilities
  refreshExpenses: () => Promise<void>
  getTotalAmount: () => number
  getTotalForMonth: (period: MonthPeriod) => number
  getTotalForDateRange: (range: DateRange) => number
  getCategoryTotals: () => Record<string, number>
}

/**
 * Custom hook for expense management
 */
export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpensesState] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load expenses from storage
   */
  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = getExpenses()
      
      if (!result.success) {
        setError(result.error || 'Failed to load expenses')
        setExpensesState([])
        return
      }

      const data = result.data || []
      
      // Validate all expenses
      const validation = validateExpenses(data)
      
      if (!validation.isValid) {
        console.warn('Invalid expenses found:', validation.errors)
        // Filter out invalid expenses
        const validExpenses = data
          .map(item => validateExpense(item))
          .filter(result => result.isValid)
          .map(result => result.data!)
        
        setExpensesState(validExpenses)
        
        // Save cleaned data back to storage
        if (validExpenses.length !== data.length) {
          setExpenses(validExpenses)
        }
      } else {
        setExpensesState(validation.data || [])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      setExpensesState([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Save expenses to storage
   */
  const saveExpenses = useCallback(async (newExpenses: Expense[]) => {
    const result = setExpenses(newExpenses)
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save expenses')
    }
    
    setExpensesState(newExpenses)
  }, [])

  /**
   * Add new expense
   */
  const addExpense = useCallback(async (data: {
    amount: number | string
    description: string
    category: string
    date: string
  }): Promise<ValidationResult<Expense>> => {
    try {
      // Get next ID
      const idResult = getNextExpenseId()
      if (!idResult.success) {
        return {
          isValid: false,
          errors: [idResult.error || 'Failed to generate expense ID']
        }
      }

      // Create and validate expense
      const result = createExpense({
        id: idResult.data!,
        amount: data.amount,
        description: data.description,
        category: data.category,
        date: data.date
      })

      if (!result.isValid) {
        return result
      }

      // Add to expenses array
      const newExpenses = [...expenses, result.data!]
      
      // Sort by date (newest first)
      newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      await saveExpenses(newExpenses)
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add expense'
      return {
        isValid: false,
        errors: [message]
      }
    }
  }, [expenses, saveExpenses])

  /**
   * Update existing expense
   */
  const updateExpenseById = useCallback(async (
    id: number,
    updates: Partial<Pick<Expense, 'amount' | 'description' | 'category' | 'date'>>
  ): Promise<ValidationResult<Expense>> => {
    try {
      const existingIndex = expenses.findIndex(exp => exp.id === id)
      
      if (existingIndex === -1) {
        return {
          isValid: false,
          errors: ['Expense not found']
        }
      }

      const existing = expenses[existingIndex]
      const result = updateExpense(existing, updates)

      if (!result.isValid) {
        return result
      }

      // Update expenses array
      const newExpenses = [...expenses]
      newExpenses[existingIndex] = result.data!
      
      // Sort by date (newest first)
      newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      await saveExpenses(newExpenses)
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update expense'
      return {
        isValid: false,
        errors: [message]
      }
    }
  }, [expenses, saveExpenses])

  /**
   * Delete expense
   */
  const deleteExpense = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const existingIndex = expenses.findIndex(exp => exp.id === id)
      
      if (existingIndex === -1) {
        return { success: false, error: 'Expense not found' }
      }

      const newExpenses = expenses.filter(exp => exp.id !== id)
      await saveExpenses(newExpenses)
      
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense'
      return { success: false, error: message }
    }
  }, [expenses, saveExpenses])

  /**
   * Get expense by ID
   */
  const getExpenseById = useCallback((id: number): Expense | undefined => {
    return expenses.find(exp => exp.id === id)
  }, [expenses])

  /**
   * Get expenses by month
   */
  const getExpensesByMonth = useCallback((period: MonthPeriod): Expense[] => {
    return filterByMonth(expenses, period)
  }, [expenses])

  /**
   * Get expenses by date range
   */
  const getExpensesByDateRange = useCallback((range: DateRange): Expense[] => {
    return filterByDateRange(expenses, range)
  }, [expenses])

  /**
   * Get expenses by category
   */
  const getExpensesByCategory = useCallback((category: string): Expense[] => {
    return expenses.filter(exp => exp.category === category)
  }, [expenses])

  /**
   * Refresh expenses from storage
   */
  const refreshExpenses = useCallback(async () => {
    await loadExpenses()
  }, [loadExpenses])

  /**
   * Get total amount of all expenses
   */
  const getTotalAmount = useCallback((): number => {
    return expenses.reduce((total, exp) => total + exp.amount, 0)
  }, [expenses])

  /**
   * Get total amount for specific month
   */
  const getTotalForMonth = useCallback((period: MonthPeriod): number => {
    const monthExpenses = getExpensesByMonth(period)
    return monthExpenses.reduce((total, exp) => total + exp.amount, 0)
  }, [getExpensesByMonth])

  /**
   * Get total amount for date range
   */
  const getTotalForDateRange = useCallback((range: DateRange): number => {
    const rangeExpenses = getExpensesByDateRange(range)
    return rangeExpenses.reduce((total, exp) => total + exp.amount, 0)
  }, [getExpensesByDateRange])

  /**
   * Get totals by category
   */
  const getCategoryTotals = useCallback((): Record<string, number> => {
    const totals: Record<string, number> = {}
    
    expenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount
    })
    
    return totals
  }, [expenses])

  // Load expenses on mount
  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  return {
    // State
    expenses,
    isLoading,
    error,
    
    // Operations
    addExpense,
    updateExpenseById,
    deleteExpense,
    
    // Queries
    getExpenseById,
    getExpensesByMonth,
    getExpensesByDateRange,
    getExpensesByCategory,
    
    // Utilities
    refreshExpenses,
    getTotalAmount,
    getTotalForMonth,
    getTotalForDateRange,
    getCategoryTotals
  }
}