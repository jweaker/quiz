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
import { ConfidenceMonitor } from '@/components/operator/ConfidenceMonitor'
import { useAudienceWindow } from '@/hooks/useAudienceWindow'

const MONITOR_PANEL_ID = 'confidence-monitor'

/**
 * Main operator panel layout with resizable two-column design.
 * Left panel: controls area. Right panel: confidence monitor (live preview).
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
            <ConfidenceMonitor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
