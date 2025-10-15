'use client'

import { formatCurrency } from '../../lib/currency'
import { formatDateDisplay } from '../../lib/dates'

interface SummaryCardProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function SummaryCard({ title, description, children }: SummaryCardProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title}</div>
        {description && <div className="card-description">{description}</div>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

interface MonthSummaryCardProps {
  amount: number
  expenseCount: number
  monthLabel: string
}

export function MonthSummaryCard({ amount, expenseCount, monthLabel }: MonthSummaryCardProps) {
  return (
    <SummaryCard 
      title="This Month" 
      description={`Total spending in ${monthLabel}`}
    >
      <div className="text-3xl font-bold text-foreground">
        {formatCurrency(amount)}
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {expenseCount} expense{expenseCount !== 1 ? 's' : ''} total
      </p>
    </SummaryCard>
  )
}

interface RecentActivityCardProps {
  recentExpense?: {
    amount: number
    description: string
    date: string
  }
}

export function RecentActivityCard({ recentExpense }: RecentActivityCardProps) {
  return (
    <SummaryCard 
      title="Recent Activity" 
      description="Your latest expense"
    >
      {recentExpense ? (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(recentExpense.amount)}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {recentExpense.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDateDisplay(recentExpense.date, { format: 'short' })}
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-muted-foreground">--</div>
          <p className="text-sm text-muted-foreground mt-2">No expenses yet</p>
        </div>
      )}
    </SummaryCard>
  )
}

interface TopCategoryCardProps {
  category?: {
    name: string
    amount: number
    percentage: number
  }
}

export function TopCategoryCard({ category }: TopCategoryCardProps) {
  return (
    <SummaryCard 
      title="Top Category" 
      description="Your biggest spending area"
    >
      {category ? (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(category.amount)}
          </div>
          <p className="text-sm font-medium text-foreground">{category.name}</p>
          <p className="text-xs text-muted-foreground">
            {category.percentage}% of spending
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-muted-foreground">--</div>
          <p className="text-sm text-muted-foreground mt-2">No categories yet</p>
        </div>
      )}
    </SummaryCard>
  )
}

interface BudgetStatusCardProps {
  monthlyBudget?: number
  spent: number
  monthLabel: string
}

export function BudgetStatusCard({ monthlyBudget, spent, monthLabel }: BudgetStatusCardProps) {
  const remaining = monthlyBudget ? monthlyBudget - spent : null
  const percentage = monthlyBudget ? Math.round((spent / monthlyBudget) * 100) : null
  const isOverBudget = remaining !== null && remaining < 0

  return (
    <SummaryCard 
      title="Budget Status" 
      description={`Budget tracking for ${monthLabel}`}
    >
      {monthlyBudget ? (
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {remaining !== null ? formatCurrency(Math.abs(remaining)) : '--'}
          </div>
          <p className="text-sm font-medium text-foreground">
            {isOverBudget ? 'Over budget' : 'Remaining'}
          </p>
          <p className="text-xs text-muted-foreground">
            {percentage}% of {formatCurrency(monthlyBudget)} budget used
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl font-bold text-muted-foreground">--</div>
          <p className="text-sm text-muted-foreground mt-2">No budget set</p>
          <a href="/settings" className="text-xs text-primary hover:text-primary/80">
            Set monthly budget →
          </a>
        </div>
      )}
    </SummaryCard>
  )
}