'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { 
  getCurrentMonth, 
  getRecentMonths, 
  formatDateDisplay,
  type MonthPeriod 
} from '../../lib/dates'
import { formatCurrency } from '../../lib/currency'
import { EXPENSE_CATEGORIES } from '../../lib/validation'

export default function ReportsPage() {
  const { 
    expenses, 
    isLoading, 
    error, 
    getTotalForMonth,
    getCategoryTotals,
    getExpensesByMonth
  } = useExpenses()

  const [selectedMonth, setSelectedMonth] = useState<MonthPeriod>(getCurrentMonth())
  
  // Get available months (last 6 months)
  const availableMonths = getRecentMonths(6)

  // Current month data
  const currentMonth = getCurrentMonth()
  const currentMonthTotal = getTotalForMonth(currentMonth)
  const selectedMonthTotal = getTotalForMonth(selectedMonth)
  const selectedMonthExpenses = getExpensesByMonth(selectedMonth)

  // Category analysis for selected month
  const monthCategoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    selectedMonthExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount
    })
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: selectedMonthTotal > 0 ? Math.round((amount / selectedMonthTotal) * 100) : 0,
        count: selectedMonthExpenses.filter(e => e.category === category).length
      }))
  }, [selectedMonthExpenses, selectedMonthTotal])

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    return availableMonths.map(month => ({
      month: month.label,
      key: month.key,
      total: getTotalForMonth(month),
      count: getExpensesByMonth(month).length
    })).reverse() // Show oldest to newest
  }, [availableMonths, getTotalForMonth, getExpensesByMonth])

  // Top spending days in selected month
  const topSpendingDays = useMemo(() => {
    const dailyTotals: Record<string, { amount: number; count: number }> = {}
    
    selectedMonthExpenses.forEach(expense => {
      if (!dailyTotals[expense.date]) {
        dailyTotals[expense.date] = { amount: 0, count: 0 }
      }
      dailyTotals[expense.date].amount += expense.amount
      dailyTotals[expense.date].count += 1
    })

    return Object.entries(dailyTotals)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 5)
      .map(([date, data]) => ({
        date,
        ...data
      }))
  }, [selectedMonthExpenses])

  // Average expense amount
  const averageExpense = selectedMonthExpenses.length > 0 
    ? selectedMonthTotal / selectedMonthExpenses.length 
    : 0

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
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
            Error Loading Reports
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Expense Reports</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understand your spending patterns with calm insights
        </p>
      </div>

      {/* Month Selector */}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Month
          </label>
          <select
            value={selectedMonth.key}
            onChange={(e) => {
              const month = availableMonths.find(m => m.key === e.target.value)
              if (month) setSelectedMonth(month)
            }}
            className="input w-full"
          >
            {availableMonths.map(month => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Total Spent</div>
            <div className="card-description">{selectedMonth.label}</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(selectedMonthTotal)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Expenses</div>
            <div className="card-description">Total count</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">
              {selectedMonthExpenses.length}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Average</div>
            <div className="card-description">Per expense</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(averageExpense)}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Categories</div>
            <div className="card-description">Used this month</div>
          </div>
          <div className="card-content">
            <div className="text-3xl font-bold text-foreground">
              {monthCategoryTotals.length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Spending by Category</div>
            <div className="card-description">{selectedMonth.label}</div>
          </div>
          <div className="card-content">
            {monthCategoryTotals.length > 0 ? (
              <div className="space-y-4">
                {monthCategoryTotals.map(({ category, amount, percentage, count }) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">{category}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{count} expense{count !== 1 ? 's' : ''}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses in {selectedMonth.label}</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Spending Days */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Top Spending Days</div>
            <div className="card-description">{selectedMonth.label}</div>
          </div>
          <div className="card-content">
            {topSpendingDays.length > 0 ? (
              <div className="space-y-3">
                {topSpendingDays.map(({ date, amount, count }) => (
                  <div key={date} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {formatDateDisplay(date, { format: 'medium' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {count} expense{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">{formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses in {selectedMonth.label}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Monthly Trend</div>
          <div className="card-description">Last 6 months of spending</div>
        </div>
        <div className="card-content">
          {monthlyTrend.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {monthlyTrend.map(({ month, key, total, count }) => (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border ${
                      key === selectedMonth.key 
                        ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20' 
                        : 'border-border bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-foreground">{month}</h4>
                      <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {count} expense{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/add" className="btn btn-primary">
          Add New Expense
        </a>
        <a href="/history" className="btn btn-secondary">
          View History
        </a>
        <a href="/" className="btn btn-outline">
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}