import { Monitor, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudienceWindow } from '@/hooks/useAudienceWindow'

/**
 * Button to open or focus the audience display window.
 * Shows different text/icon based on connection state.
 * Includes keyboard shortcut hint (Cmd+Shift+A).
 */
export function WindowLauncher() {
  const { isConnected, openAudience } = useAudienceWindow()

  return (
    <Button
      variant={isConnected ? 'outline' : 'default'}
      size="sm"
      onClick={openAudience}
      className="gap-2"
    >
      {isConnected ? (
        <>
          <ExternalLink className="size-4" />
          <span>Focus Audience Display</span>
        </>
      ) : (
        <>
          <Monitor className="size-4" />
          <span>Open Audience Display</span>
        </>
      )}
      <kbd className="pointer-events-none ms-2 inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
        <span className="text-xs">&#x2318;</span>
        <span className="text-xs">&#x21E7;</span>
        <span>A</span>
      </kbd>
    </Button>
  )
}

export default WindowLauncher
