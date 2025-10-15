/**
 * Date utilities for expense tracking
 * Handles month boundaries, filtering, and formatting
 */

export interface DateRange {
  start: Date
  end: Date
}

export interface MonthPeriod {
  year: number
  month: number // 0-based (0 = January)
  label: string // "January 2025"
  key: string // "2025-01"
}

/**
 * Get the current month period
 */
export function getCurrentMonth(): MonthPeriod {
  const now = new Date()
  return getMonthPeriod(now.getFullYear(), now.getMonth())
}

/**
 * Get month period for specific year and month
 */
export function getMonthPeriod(year: number, month: number): MonthPeriod {
  const date = new Date(year, month, 1)
  return {
    year,
    month,
    label: date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }),
    key: `${year}-${String(month + 1).padStart(2, '0')}`
  }
}

/**
 * Get month boundaries (start and end dates)
 */
export function getMonthBoundaries(year: number, month: number): DateRange {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get current month boundaries
 */
export function getCurrentMonthBoundaries(): DateRange {
  const now = new Date()
  return getMonthBoundaries(now.getFullYear(), now.getMonth())
}

/**
 * Get previous month period
 */
export function getPreviousMonth(period?: MonthPeriod): MonthPeriod {
  const current = period || getCurrentMonth()
  let year = current.year
  let month = current.month - 1
  
  if (month < 0) {
    month = 11
    year -= 1
  }
  
  return getMonthPeriod(year, month)
}

/**
 * Get next month period
 */
export function getNextMonth(period?: MonthPeriod): MonthPeriod {
  const current = period || getCurrentMonth()
  let year = current.year
  let month = current.month + 1
  
  if (month > 11) {
    month = 0
    year += 1
  }
  
  return getMonthPeriod(year, month)
}

/**
 * Get list of recent months (including current)
 */
export function getRecentMonths(count: number = 6): MonthPeriod[] {
  const months: MonthPeriod[] = []
  let current = getCurrentMonth()
  
  for (let i = 0; i < count; i++) {
    months.push(current)
    current = getPreviousMonth(current)
  }
  
  return months
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z')
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format date for display
 */
export function formatDateDisplay(
  date: Date | string,
  options?: {
    format?: 'short' | 'medium' | 'long'
    locale?: string
  }
): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  const locale = options?.locale || 'en-US'
  
  const formatOptionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { 
      month: 'short', 
      day: 'numeric' 
    },
    medium: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    },
    long: { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }
  }
  
  const formatOptions = formatOptionsMap[options?.format || 'medium']
  
  return dateObj.toLocaleDateString(locale, formatOptions)
}

/**
 * Get relative date string (e.g., "today", "yesterday", "3 days ago")
 */
export function getRelativeDateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return months === 1 ? '1 month ago' : `${months} months ago`
  }
  
  const years = Math.floor(diffInDays / 365)
  return years === 1 ? '1 year ago' : `${years} years ago`
}

/**
 * Check if date is in current month
 */
export function isCurrentMonth(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  const now = new Date()
  
  return dateObj.getFullYear() === now.getFullYear() &&
         dateObj.getMonth() === now.getMonth()
}

/**
 * Check if date is in specific month
 */
export function isInMonth(date: Date | string, period: MonthPeriod): boolean {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  
  return dateObj.getFullYear() === period.year &&
         dateObj.getMonth() === period.month
}

/**
 * Check if date is in date range
 */
export function isInDateRange(date: Date | string, range: DateRange): boolean {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  
  return dateObj >= range.start && dateObj <= range.end
}

/**
 * Filter array by date range
 */
export function filterByDateRange<T extends { date: string | Date }>(
  items: T[],
  range: DateRange
): T[] {
  return items.filter(item => isInDateRange(item.date, range))
}

/**
 * Filter array by month period
 */
export function filterByMonth<T extends { date: string | Date }>(
  items: T[],
  period: MonthPeriod
): T[] {
  return items.filter(item => isInMonth(item.date, period))
}

/**
 * Group array by month
 */
export function groupByMonth<T extends { date: string | Date }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  
  items.forEach(item => {
    const dateObj = typeof item.date === 'string' ? parseISODate(item.date) : item.date
    const period = getMonthPeriod(dateObj.getFullYear(), dateObj.getMonth())
    
    if (!groups[period.key]) {
      groups[period.key] = []
    }
    groups[period.key].push(item)
  })
  
  return groups
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return formatDateISO(new Date())
}

/**
 * Validate date string
 */
export function validateDate(dateString: string): {
  isValid: boolean
  date?: Date
  error?: string
} {
  if (!dateString.trim()) {
    return { isValid: false, error: 'Date is required' }
  }

  try {
    const date = parseISODate(dateString)
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }

    const now = new Date()
    const maxFutureDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    
    if (date > maxFutureDate) {
      return { isValid: false, error: 'Date cannot be more than a year in the future' }
    }

    const minPastDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())
    if (date < minPastDate) {
      return { isValid: false, error: 'Date cannot be more than 10 years in the past' }
    }

    return { isValid: true, date }
  } catch (error) {
    return { isValid: false, error: 'Invalid date format' }
  }
}