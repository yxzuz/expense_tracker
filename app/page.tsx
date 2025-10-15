'use client'

import { useExpenses } from '../hooks/useExpenses'
import { getCurrentMonth, formatDateDisplay } from '../lib/dates'
import { formatCurrency } from '../lib/currency'
import { 
  MonthSummaryCard, 
  RecentActivityCard, 
  TopCategoryCard 
} from '../components/cards/SummaryCards'

export default function HomePage() {
  const { 
    expenses, 
    isLoading, 
    error, 
    getTotalForMonth,
    getCategoryTotals 
  } = useExpenses()

  const currentMonth = getCurrentMonth()
  const currentMonthTotal = getTotalForMonth(currentMonth)
  const categoryTotals = getCategoryTotals()

  // Get recent expenses (last 5)
  const recentExpenses = expenses.slice(0, 5)

  // Get top categories (top 3 by amount)
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  // Prepare data for cards
  const recentExpense = recentExpenses.length > 0 ? recentExpenses[0] : undefined
  const topCategory = topCategories.length > 0 ? {
    name: topCategories[0][0],
    amount: topCategories[0][1],
    percentage: Math.round((topCategories[0][1] / currentMonthTotal) * 100)
  } : undefined

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
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
            Error Loading Dashboard
          </h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Your Expense Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Overview of your spending for {currentMonth.label}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <MonthSummaryCard 
          amount={currentMonthTotal}
          expenseCount={expenses.length}
          monthLabel={currentMonth.label}
        />
        
        <RecentActivityCard recentExpense={recentExpense} />
        
        <TopCategoryCard category={topCategory} />
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Expenses</div>
          <div className="card-description">
            Your latest spending activity
          </div>
        </div>
        <div className="card-content">
          {recentExpenses.length > 0 ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{expense.category}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDateDisplay(expense.date, { format: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
              
              {expenses.length > 5 && (
                <div className="text-center pt-4">
                  <a 
                    href="/history" 
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    View all {expenses.length} expenses →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking your spending by adding your first expense.</p>
              <a 
                href="/add" 
                className="btn btn-primary btn-lg"
              >
                Add First Expense
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/add" className="btn btn-primary">
          Add New Expense
        </a>
        <a href="/history" className="btn btn-secondary">
          View History
        </a>
        <a href="/reports" className="btn btn-outline">
          View Reports
        </a>
      </div>
    </div>
  )
}