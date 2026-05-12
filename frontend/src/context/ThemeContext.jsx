import { useCallback, useLayoutEffect, useMemo, useState } from 'react'

import { ThemeContext } from './theme-context'

const THEME_STORAGE_KEY = 'sudoko.theme'
const VALID_THEMES = new Set(['dark', 'light'])

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  return VALID_THEMES.has(storedTheme) ? storedTheme : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark'
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback(nextTheme => {
    if (VALID_THEMES.has(nextTheme)) {
      setThemeState(nextTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(current => (current === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === 'light',
      isDark: theme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
