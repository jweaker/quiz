import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore } from '@/state'
import { useChessClock } from '@/hooks/useChessClock'
import { Button } from '@/components/ui/button'
import { PassControls } from '@/components/operator/PassControls'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface TimerPanelProps {
  /** Which mode to render controls for */
  mode: 'countdown' | 'chess-clock'
}

/**
 * Compact operator controls for countdown timer and chess clock.
 * Mode is controlled by parent (OperatorControls adaptive zone switcher).
 * No large countdown display — persistent zone shows that.
 *
 * NOTE: useCountdown + useTimerAudio + useLetterDisplay are now lifted
 * to OperatorControls so they stay mounted when the adaptive zone switches.
 * This component is pure UI + hotkeys.
 */
export function TimerPanel({ mode }: TimerPanelProps) {
  const [customDuration, setCustomDuration] = useState('')

  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)
  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const verseCount = useTimerStore((s) => s.verseCount)

  const {
    activeTimer,
    rightSeconds,
    leftSeconds,
    rightPoints,
    leftPoints,
    startClock,
    switchClock,
    pauseClock,
    resetClock,
  } = useChessClock()

  // Countdown keyboard shortcuts — use getState() to avoid stale closures
  useHotkeys('t', () => {
    if (mode !== 'countdown') return
    const running = useTimerStore.getState().countdownRunning
    useTimerStore.getState().setCountdownRunning(!running)
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('shift+t', () => {
    if (mode !== 'countdown') return
    const duration = useTimerStore.getState().countdownDuration || 60
    useTimerStore.getState().setCountdown(duration)
    useTimerStore.getState().setCountdownRunning(false)
  }, { enableOnFormTags: false }, [mode])

  // Chess clock keyboard shortcuts
  useHotkeys('BracketLeft', () => {
    if (mode !== 'chess-clock') return
    startClock('right')
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('BracketRight', () => {
    if (mode !== 'chess-clock') return
    startClock('left')
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('Backslash', () => {
    if (mode !== 'chess-clock') return
    switchClock()
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('p', () => {
    if (mode !== 'chess-clock') return
    pauseClock()
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('shift+p', () => {
    if (mode !== 'chess-clock') return
    resetClock()
  }, { enableOnFormTags: false }, [mode])

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}`
  }

  // ── Countdown mode ──
  if (mode === 'countdown') {
    return (
      <div className="space-y-2 pt-1">
        {/* Compact countdown readout + controls inline */}
        <div className="flex items-center gap-2">
          <div className="border rounded px-3 py-1.5 bg-card text-center min-w-[80px]">
            <p className="text-2xl font-bold tabular-nums western-numerals leading-tight">
              {formatTime(countdownRemaining)}
            </p>
          </div>
          <Button
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => {
              const running = useTimerStore.getState().countdownRunning
              useTimerStore.getState().setCountdownRunning(!running)
            }}
          >
            {countdownRunning ? (
              <Pause className="size-3 me-1" />
            ) : (
              <Play className="size-3 me-1" />
            )}
            {countdownRunning ? 'إيقاف' : 'بدء'}
            <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">T</kbd>
          </Button>
          <Button
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={() => {
              const duration = useTimerStore.getState().countdownDuration || 60
              useTimerStore.getState().setCountdown(duration)
              useTimerStore.getState().setCountdownRunning(false)
            }}
          >
            <RotateCcw className="size-3 me-1" />
            إعادة
            <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">⇧T</kbd>
          </Button>
        </div>

        {/* Duration presets + custom — compact row */}
        <div className="flex flex-wrap items-center gap-1">
          {[30, 60, 100, 120].map((duration) => (
            <Button
              key={duration}
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                useTimerStore.getState().setCountdown(duration)
                useTimerStore.getState().setCountdownRunning(false)
              }}
            >
              <span className="western-numerals">{duration}</span>s
            </Button>
          ))}
          <div className="flex items-center gap-1 ms-1">
            <input
              type="number"
              min={1}
              max={999}
              placeholder="مخصص"
              value={customDuration}
              onChange={(e) => setCustomDuration(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const dur = parseInt(customDuration, 10)
                  if (dur > 0 && dur <= 999) {
                    useTimerStore.getState().setCountdown(dur)
                    useTimerStore.getState().setCountdownRunning(false)
                    setCustomDuration('')
                  }
                }
              }}
              className="w-16 h-7 px-2 text-xs border rounded bg-background western-numerals"
            />
            <Button
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                const dur = parseInt(customDuration, 10)
                if (dur > 0 && dur <= 999) {
                  useTimerStore.getState().setCountdown(dur)
                  useTimerStore.getState().setCountdownRunning(false)
                  setCustomDuration('')
                }
              }}
            >
              تعيين
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Chess clock mode ──
  return (
    <div className="space-y-2 pt-1">
      {/* Compact two-column clock display */}
      <div className="grid grid-cols-2 gap-2">
        {/* Right team */}
        <div
          className={
            'p-2 border rounded text-center transition-all ' +
            (activeTimer === 'right'
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border bg-card')
          }
        >
          <p className="text-[10px] text-muted-foreground">الأيمن</p>
          <p className="text-2xl font-bold tabular-nums western-numerals leading-tight">
            {formatTime(rightSeconds)}
          </p>
          <div className="flex justify-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span className="western-numerals">{rightPoints} نقطة</span>
            <span>·</span>
            <span className="western-numerals">{verseCount.right} بيت</span>
          </div>
        </div>

        {/* Left team */}
        <div
          className={
            'p-2 border rounded text-center transition-all ' +
            (activeTimer === 'left'
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border bg-card')
          }
        >
          <p className="text-[10px] text-muted-foreground">الأيسر</p>
          <p className="text-2xl font-bold tabular-nums western-numerals leading-tight">
            {formatTime(leftSeconds)}
          </p>
          <div className="flex justify-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span className="western-numerals">{leftPoints} نقطة</span>
            <span>·</span>
            <span className="western-numerals">{verseCount.left} بيت</span>
          </div>
        </div>
      </div>

      {/* Chess clock controls — horizontal compact row */}
      <div className="flex flex-wrap gap-1">
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => startClock('right')}
        >
          بدء الأيمن
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">[</kbd>
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => startClock('left')}
        >
          بدء الأيسر
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">]</kbd>
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => switchClock()}
        >
          تبديل
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">\</kbd>
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => pauseClock()}
        >
          <Pause className="size-3 me-1" />
          إيقاف
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">P</kbd>
        </Button>
        <Button
          variant="outline"
          className="h-7 px-2 text-xs"
          onClick={() => resetClock()}
        >
          <RotateCcw className="size-3 me-1" />
          إعادة
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">⇧P</kbd>
        </Button>
      </div>

      {/* Pass mechanic controls */}
      <PassControls />
    </div>
  )
}
