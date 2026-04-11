'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  const isDark = theme === 'dark'

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="duo-btn duo-btn-outline px-2.5 py-1.5 relative overflow-hidden"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span
        className="transition-all duration-300"
        style={{
          display: 'flex',
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
          opacity: isDark ? 1 : 0,
          position: isDark ? 'relative' : 'absolute',
        }}
      >
        <Sun className="h-4 w-4 text-[var(--duo-orange)]" />
      </span>
      <span
        className="transition-all duration-300"
        style={{
          display: 'flex',
          transform: isDark ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)',
          opacity: isDark ? 0 : 1,
          position: isDark ? 'absolute' : 'relative',
        }}
      >
        <Moon className="h-4 w-4 text-[var(--duo-blue)]" />
      </span>
    </button>
  )
}
