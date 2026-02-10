import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudienceWindow } from '@/hooks/useAudienceWindow'

/**
 * Full-width warning banner shown when the audience window is disconnected.
 * Provides a one-click "Reopen" button to relaunch the audience window.
 * Only renders when audience window is not connected.
 */
export function DisconnectBanner() {
  const { isConnected, openAudience } = useAudienceWindow()

  if (isConnected) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-destructive/15 border-b border-destructive/30 px-4 py-2">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="size-4 shrink-0" />
        <span className="text-sm font-medium">Audience display disconnected</span>
      </div>
      <Button
        variant="destructive"
        size="xs"
        onClick={openAudience}
      >
        Reopen
      </Button>
    </div>
  )
}

export default DisconnectBanner
