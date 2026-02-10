import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useOperatorStore } from '@/state'

/**
 * Toggle between light and dark theme on the operator panel.
 * Uses shadcn/ui Switch with sun/moon icons.
 */
export function ThemeToggle() {
  const theme = useOperatorStore((s) => s.theme)
  const setTheme = useOperatorStore((s) => s.setTheme)

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  )
}
