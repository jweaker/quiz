import { useEffect, useCallback } from 'react'
import { useOperatorStore } from '@/state'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import OperatorControls from './OperatorControls'
import { DisconnectBanner } from '@/components/operator/DisconnectBanner'
import { WindowLauncher } from '@/components/operator/WindowLauncher'
import { useAudienceWindow } from '@/hooks/useAudienceWindow'

const MONITOR_PANEL_ID = 'confidence-monitor'

/**
 * Main operator panel layout with resizable two-column design.
 * Left panel: controls area. Right panel: confidence monitor placeholder.
 * Panel sizes persist in operatorStore across refresh.
 * Includes DisconnectBanner, WindowLauncher, and Cmd+Shift+A shortcut.
 */
export default function OperatorPanel() {
  const confidenceMonitorSize = useOperatorStore((s) => s.confidenceMonitorSize)
  const setConfidenceMonitorSize = useOperatorStore((s) => s.setConfidenceMonitorSize)
  const { openAudience } = useAudienceWindow()

  // Keyboard shortcut: Cmd+Shift+A (Mac) / Ctrl+Shift+A (Windows)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        openAudience()
      }
    },
    [openAudience]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-screen flex flex-col">
      <DisconnectBanner />
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <h1 className="text-sm font-semibold text-foreground">Operator Panel</h1>
        <WindowLauncher />
      </div>
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup
          orientation="horizontal"
          onLayoutChanged={(layout) => {
            const monitorSize = layout[MONITOR_PANEL_ID]
            if (monitorSize !== undefined) {
              setConfidenceMonitorSize(monitorSize)
            }
          }}
        >
          <ResizablePanel
            defaultSize={100 - confidenceMonitorSize}
            minSize={40}
            id="controls"
          >
            <OperatorControls />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel
            defaultSize={confidenceMonitorSize}
            minSize={15}
            id={MONITOR_PANEL_ID}
          >
            <ConfidenceMonitorPlaceholder />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

/**
 * Placeholder for the confidence monitor (live audience mirror).
 * Will be replaced with actual ConfidenceMonitor in Task 3.
 */
function ConfidenceMonitorPlaceholder() {
  const audienceWindowConnected = useOperatorStore((s) => s.audienceWindowConnected)

  return (
    <div className="h-full flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="text-muted-foreground text-sm text-center space-y-2">
        <div className="w-16 h-12 mx-auto border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center">
          <span className="text-xs text-muted-foreground/50">📺</span>
        </div>
        <p className="font-medium">شاشة المراقبة</p>
        <p className="text-xs">
          {audienceWindowConnected
            ? 'متصلة'
            : 'سيتم عرض ما يراه الجمهور هنا'}
        </p>
      </div>
    </div>
  )
}
