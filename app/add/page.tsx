'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExpenses } from '../../hooks/useExpenses'
import { useCurrency } from '../../hooks/useCurrency'
import { validateExpenseForm, EXPENSE_CATEGORIES } from '../../lib/validation'
import { COMMON_CURRENCIES } from '../../lib/currency'
import { getTodayISO } from '../../lib/dates'

export default function AddExpensePage() {
  const router = useRouter()
  const { addExpense } = useExpenses()
  const { currency, mounted } = useCurrency()
  
  // Get currency symbol from the currency code
  const currencySymbol = COMMON_CURRENCIES[currency.code as keyof typeof COMMON_CURRENCIES]?.symbol || '$'
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: getTodayISO()
  })
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    setErrors([])

    try {
      // Validate form data
      const validation = validateExpenseForm(formData)
      
      if (!validation.isValid) {
        setErrors(validation.errors)
        return
      }

      // Add expense
      const result = await addExpense(validation.data!)
      
      if (!result.isValid) {
        setErrors(result.errors)
        return
      }

      // Success - redirect to dashboard
      router.push('/')
    } catch (error) {
      setErrors(['An unexpected error occurred. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Add New Expense</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Record a new expense mindfully and keep track of your spending.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="card">
          <div className="card-header">
            <div className="card-title">Expense Details</div>
            <div className="card-description">
              Fill in the information about your expense
            </div>
          </div>
          
          <div className="card-content space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Please correct the following errors:
                </h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="label">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {mounted ? currencySymbol : '$'}
                </span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="1000000"
                  className="input pl-8"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the amount you spent (maximum {mounted ? currencySymbol : '$'}1,000,000)
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="label">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What did you spend money on?"
                maxLength={200}
                className="input"
                required
              />
              <p className="text-xs text-muted-foreground">
                Describe your expense (up to 200 characters)
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="">Select a category</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Choose the category that best fits your expense
              </p>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="label">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input"
                required
              />
              <p className="text-xs text-muted-foreground">
                When did this expense occur?
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="card-footer">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Expense'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Tips for mindful expense tracking
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Be honest and accurate with your amounts</li>
            <li>• Use descriptive names to help you remember later</li>
            <li>• Choose the most specific category available</li>
            <li>• Record expenses as soon as possible while they're fresh in your mind</li>
          </ul>
        </div>
      </div>
    </div>
  )
}