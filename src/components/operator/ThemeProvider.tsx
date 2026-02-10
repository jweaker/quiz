import { useLayoutEffect } from 'react'
import { useOperatorStore } from '@/state'

/**
 * Syncs the operator theme preference to the document element.
 * Adds/removes 'dark' class on <html> for Tailwind dark mode.
 * Uses useLayoutEffect to prevent FOUC (flash of unstyled content).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useOperatorStore((s) => s.theme)

  useLayoutEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = (dark: boolean) => {
        root.classList.toggle('dark', dark)
      }
      apply(systemDark.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      systemDark.addEventListener('change', handler)
      return () => systemDark.removeEventListener('change', handler)
    }

    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}
