'use client'

import { useEffect, useState } from 'react'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
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
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light')
    document.documentElement.className = theme
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.className = e.matches ? 'dark' : 'light'
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setTheme(document.documentElement.className as 'light' | 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.className = newTheme
    localStorage.setItem('theme', newTheme)
  }

  return { theme, toggleTheme }
}