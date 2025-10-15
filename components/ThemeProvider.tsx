'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Apply theme immediately on page load to prevent flash
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      let theme: string
      if (savedTheme === 'system' || !savedTheme) {
        // Use system preference if 'system' is selected or no preference saved
        theme = systemPrefersDark ? 'dark' : 'light'
      } else {
        // Use explicitly saved theme (light or dark)
        theme = savedTheme
      }
      
      // Apply theme using classList for better compatibility
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
      document.documentElement.className = theme // Keep for backwards compatibility
    }
    
    // Apply theme immediately
    applyTheme()
    
    // Aggressively clear all service workers and caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister()
          console.log('Service Worker unregistered:', registration.scope)
        }
      })
    }
    
    // Clear all caches to fix static file issues
    if ('caches' in window) {
      caches.keys().then(function(names) {
        for(let name of names) {
          caches.delete(name)
          console.log('Cache deleted:', name)
        }
      })
    }

    // Initialize theme based on system preference or localStorage
    applyTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme || savedTheme === 'system') {
        const newTheme = e.matches ? 'dark' : 'light'
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newTheme)
        document.documentElement.className = newTheme
      }
    }
    
    // Listen for theme changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        let themeToApply = e.newValue
        
        // If 'system' theme is set, resolve to actual theme
        if (themeToApply === 'system') {
          themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(themeToApply)
        document.documentElement.className = themeToApply
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Set initial theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    setTheme(currentTheme)
    
    // Listen for theme changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue as 'light' | 'dark')
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(e.newValue)
        document.documentElement.className = e.newValue
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    document.documentElement.className = newTheme
    localStorage.setItem('theme', newTheme)
  }

  return { theme, toggleTheme }
}