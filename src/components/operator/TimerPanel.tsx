import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore } from '@/state'
import { useChessClock } from '@/hooks/useChessClock'
import { useCountdown } from '@/hooks/useCountdown'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Timer, Users } from 'lucide-react'

type TimerMode = 'countdown' | 'chess-clock'

/**
 * Operator controls for countdown timer and chess clock (Poetic Chase).
 * Full keyboard control with visual indicators.
 */
export function TimerPanel() {
  const [mode, setMode] = useState<TimerMode>('countdown')

  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)
  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const setCountdown = useTimerStore((s) => s.setCountdown)
  const setCountdownRunning = useTimerStore((s) => s.setCountdownRunning)
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

  // Countdown hooks
  useCountdown()

  // Countdown keyboard shortcuts
  useHotkeys('t', () => {
    if (mode !== 'countdown') return
    setCountdownRunning(!countdownRunning)
  }, { enableOnFormTags: false }, [mode, countdownRunning])

  useHotkeys('shift+t', () => {
    if (mode !== 'countdown') return
    setCountdown(countdownRemaining || 60)
    setCountdownRunning(false)
  }, { enableOnFormTags: false }, [mode, countdownRemaining])

  // Chess clock keyboard shortcuts
  useHotkeys('[', () => {
    if (mode !== 'chess-clock') return
    startClock('right')
  }, { enableOnFormTags: false }, [mode])

  useHotkeys(']', () => {
    if (mode !== 'chess-clock') return
    startClock('left')
  }, { enableOnFormTags: false }, [mode])

  useHotkeys('\\', () => {
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

  // Format time display: MM:SS or SS
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}`
  }

  return (
    <div className="space-y-6 mt-6 max-w-2xl mx-auto">
      {/* Section header with mode toggle */}
      <div className="border-b pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">المؤقتات</h2>
            <p className="text-xs text-muted-foreground mt-1">
              التحكم بالعد التنازلي وساعة الشطرنج (المطاردة الشعرية)
            </p>
          </div>
          {/* Mode toggle buttons */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'countdown' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('countdown')}
            >
              <Timer className="size-4 me-1" />
              عد تنازلي
            </Button>
            <Button
              variant={mode === 'chess-clock' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('chess-clock')}
            >
              <Users className="size-4 me-1" />
              المطاردة الشعرية
            </Button>
          </div>
        </div>
      </div>

      {/* Countdown mode */}
      {mode === 'countdown' && (
        <div className="space-y-4">
          {/* Countdown display */}
          <div className="text-center p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-2">الوقت المتبقي</p>
            <p className="text-5xl font-bold tabular-nums western-numerals">
              {formatTime(countdownRemaining)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">ثانية</p>
          </div>

          {/* Countdown controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCountdownRunning(!countdownRunning)}
            >
              {countdownRunning ? (
                <Pause className="size-4 me-1" />
              ) : (
                <Play className="size-4 me-1" />
              )}
              {countdownRunning ? 'إيقاف' : 'بدء'}
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">t</kbd>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCountdown(countdownRemaining || 60)
                setCountdownRunning(false)
              }}
            >
              <RotateCcw className="size-4 me-1" />
              إعادة تعيين
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">⇧T</kbd>
            </Button>
          </div>

          {/* Duration presets */}
          <div>
            <p className="text-sm font-medium mb-2">المدة المحددة مسبقًا</p>
            <div className="flex flex-wrap gap-2">
              {[30, 60, 100, 120].map((duration) => (
                <Button
                  key={duration}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCountdown(duration)
                    setCountdownRunning(false)
                  }}
                >
                  <span className="western-numerals">{duration}</span> ثانية
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chess clock mode */}
      {mode === 'chess-clock' && (
        <div className="space-y-4">
          {/* Chess clock display */}
          <div className="grid grid-cols-2 gap-4">
            {/* Right team */}
            <div
              className={
                'p-4 border rounded-lg text-center transition-all ' +
                (activeTimer === 'right'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
                  : 'border-border bg-card')
              }
            >
              <p className="text-xs text-muted-foreground mb-2">الفريق الأيمن</p>
              <p className="text-4xl font-bold tabular-nums western-numerals">
                {formatTime(rightSeconds)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">ثانية</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium">
                  <span className="western-numerals">{rightPoints}</span> نقطة
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="western-numerals">{verseCount.right}</span> بيت
                </p>
              </div>
            </div>

            {/* Left team */}
            <div
              className={
                'p-4 border rounded-lg text-center transition-all ' +
                (activeTimer === 'left'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
                  : 'border-border bg-card')
              }
            >
              <p className="text-xs text-muted-foreground mb-2">الفريق الأيسر</p>
              <p className="text-4xl font-bold tabular-nums western-numerals">
                {formatTime(leftSeconds)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">ثانية</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-medium">
                  <span className="western-numerals">{leftPoints}</span> نقطة
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="western-numerals">{verseCount.left}</span> بيت
                </p>
              </div>
            </div>
          </div>

          {/* Chess clock controls */}
          <div>
            <p className="text-sm font-medium mb-2">التحكم</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => startClock('right')}
              >
                بدء الأيمن
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">[</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startClock('left')}
              >
                بدء الأيسر
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">]</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => switchClock()}
              >
                تبديل الساعة
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">\</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pauseClock()}
              >
                <Pause className="size-4 me-1" />
                إيقاف
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">p</kbd>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetClock()}
              >
                <RotateCcw className="size-4 me-1" />
                إعادة تعيين
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded ms-2">⇧P</kbd>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
