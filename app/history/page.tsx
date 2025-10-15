'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useCurrency } from '../../hooks/useCurrency'
import { 
  getCurrentMonth, 
  getRecentMonths, 
  formatDateDisplay,
  type MonthPeriod 
} from '../../lib/dates'
import { EXPENSE_CATEGORIES, type Expense } from '../../lib/validation'

export default function HistoryPage() {
  const { 
    expenses, 
    isLoading, 
    error, 
    getExpensesByMonth,
    getExpensesByCategory,
    getTotalForMonth,
    deleteExpense
  } = useExpenses()
  
  const { formatCurrency } = useCurrency()

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<MonthPeriod | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // UI state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get available months
  const availableMonths = getRecentMonths(12)

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let filtered = expenses

    // Apply month filter
    if (selectedMonth) {
      filtered = getExpensesByMonth(selectedMonth)
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = getExpensesByCategory(selectedCategory)
    }

    // Sort expenses
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'description':
          comparison = a.description.localeCompare(b.description)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [expenses, selectedMonth, selectedCategory, sortBy, sortOrder, getExpensesByMonth, getExpensesByCategory])

  // Calculate totals
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0

  const handleDeleteClick = (id: number) => {
    setDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deleteExpense(deleteId)
      if (result.success) {
        setDeleteId(null)
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteId(null)
  }

  const clearFilters = () => {
    setSelectedMonth(null)
    setSelectedCategory('')
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="card p-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading History
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Expense History</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review and manage all your recorded expenses
        </p>
      </div>

      {/* Filters and Summary */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Filters</div>
            </div>
            <div className="card-content">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Month Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Month</label>
                  <select
                    value={selectedMonth?.key || ''}
                    onChange={(e) => {
                      const month = availableMonths.find(m => m.key === e.target.value)
                      setSelectedMonth(month || null)
                    }}
                    className="input"
                  >
                    <option value="">All months</option>
                    {availableMonths.map(month => (
                      <option key={month.key} value={month.key}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">All categories</option>
                    {EXPENSE_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort by</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="input flex-1"
                    >
                      <option value="date">Date</option>
                      <option value="amount">Amount</option>
                      <option value="description">Description</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="btn btn-outline px-3"
                      title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedMonth || selectedCategory) && (
                <div className="pt-4 border-t border-border mt-4">
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline btn-sm"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Summary</div>
            </div>
            <div className="card-content space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-semibold text-foreground">{filteredExpenses.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(averageAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Expenses {selectedMonth && `for ${selectedMonth.label}`}
            {selectedCategory && ` in ${selectedCategory}`}
          </div>
          <div className="card-description">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
          </div>
        </div>
        <div className="card-content">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground truncate">{expense.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{formatDateDisplay(expense.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(expense.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Delete expense"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No expenses found</h3>
              <p className="text-muted-foreground mb-6">
                {selectedMonth || selectedCategory 
                  ? 'Try adjusting your filters or add some expenses.'
                  : 'Start by adding your first expense.'}
              </p>
              <a href="/add" className="btn btn-primary">
                Add Expense
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background border border-border rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete Expense</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}