import { useEffect, useCallback, useRef } from 'react'
import { useOperatorStore, useShowStore } from '@/state'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import OperatorControls from './OperatorControls'
import { DisconnectBanner } from '@/components/operator/DisconnectBanner'
import { KeyboardShortcutOverlay } from '@/components/operator/KeyboardShortcutOverlay'
import { WindowLauncher } from '@/components/operator/WindowLauncher'
import { ConfidenceMonitor } from '@/components/operator/ConfidenceMonitor'
import { useAudienceWindow } from '@/hooks/useAudienceWindow'
import { validateEpisode } from '@/lib/episodeSchema'
import { FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Episode file picker ─────────────────────────────────────────
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target?.result as string)
          const result = validateEpisode(json)
          if (result.success && result.data) {
            useShowStore.getState().setData(result.data)
          } else {
            const msgs = result.errors
              ? Object.values(result.errors).flat().slice(0, 3).join('\n')
              : 'ملف غير صالح'
            window.alert(`خطأ في ملف الحلقة:\n${msgs}`)
          }
        } catch {
          window.alert('خطأ في قراءة الملف — تأكد أنه JSON صالح')
        }
      }
      reader.readAsText(file)

      // Reset input so re-selecting same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    []
  )

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
      <KeyboardShortcutOverlay />
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <h1 className="text-sm font-semibold text-foreground">Operator Panel</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="size-4" />
            تحميل حلقة
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileSelect}
          />
          <WindowLauncher />
        </div>
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
