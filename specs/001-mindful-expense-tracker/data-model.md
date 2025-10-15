# Data Model: Mindful Expense Tracker – Calm Page Outline

Date: 2025-10-15  
Branch: 001-mindful-expense-tracker

## Entities

### Expense

- id: string (UUID)
- title: string (1..120 chars)
- amount: number (> 0, max 1e9)
- category: string (1..40 chars)
- date: ISO date string (YYYY-MM-DD)
- note?: string (0..240 chars)

Validation:

- Required fields must be present and valid.
- Amount must be a finite positive number.
- Date must parse to a valid date; month derived for grouping.

### Budget (Preference)

- month: YYYY-MM
- limit: number (>= 0)

### Preferences

- currency: ISO-4217 code (default from locale)
- theme: 'light' | 'dark' | 'system'
- monthlyBudget?: number (>= 0)

### Derived Structures

- MonthlySummary: { month: YYYY-MM, spent: number, remaining?: number }
- CategoryTotals: Array<{ category: string, total: number }>

## Relationships

- Expense belongs to a month (by date).
- Budget applies per month; Preferences apply globally per device.

## State Transitions

- Create Expense → Expense[] appended
- Edit Expense → Expense updated by id
- Delete Expense → Expense removed by id
- Update Preferences → Preferences persisted, recalc Dashboard remaining

## Storage Keys (localStorage)

- expenses:v1 → JSON array of Expense
- preferences:v1 → JSON of Preferences and Budget

## Validation Rules

- Reject entries that fail validation with gentle messages.
- Normalize title trim, category trim; clamp extreme values politely.
