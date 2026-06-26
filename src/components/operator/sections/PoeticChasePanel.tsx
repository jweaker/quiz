import { useState } from 'react'
import { useShowStore, useTimerStore } from '@/state'
import { useChessClock } from '@/hooks/useChessClock'
import { useHotkeys } from 'react-hotkeys-hook'
import { PassControls } from '@/components/operator/PassControls'
import { Button } from '@/components/ui/button'
import { Pause, RotateCcw } from 'lucide-react'

/**
 * Operator panel for the Poetic Chase (المطاردة الشعرية) section.
 *
 * Features:
 * - Chess clock display (right/left teams with time + points + verses)
 * - Chess clock hotkeys: [ ] \ P Shift+P
 * - Pass mechanic via PassControls (g/v/x hotkeys)
 * - Letter display is handled by useLetterDisplay lifted to OperatorControls
 */
export function PoeticChasePanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const isActive = currentSection === 'poetic-chase'
  const verseCount = useTimerStore((s) => s.verseCount)
  const requiredLetter = useTimerStore((s) => s.requiredLetter)
  const addRightScore = useShowStore((s) => s.addRightScore)
  const addLeftScore = useShowStore((s) => s.addLeftScore)
  const setTurned = useShowStore((s) => s.setTurned)
  const rightTimeMs = useTimerStore((s) => s.rightTimeMs)
  const leftTimeMs = useTimerStore((s) => s.leftTimeMs)
  const [timeBonusApplied, setTimeBonusApplied] = useState(false)

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
  } = useChessClock({
    onTimerExpired: (expiredTeam) => {
      if (timeBonusApplied) return
      const timer = useTimerStore.getState()
      const opponentRemainingMs = expiredTeam === 'right' ? timer.leftTimeMs : timer.rightTimeMs
      const bonus = Math.floor(opponentRemainingMs / 5000)
      if (bonus > 0) {
        if (expiredTeam === 'right') addLeftScore(bonus)
        else addRightScore(bonus)
      }
      setTurned(true)
      setTimeBonusApplied(true)
    },
  })

  // Chess clock keyboard shortcuts
  useHotkeys('BracketLeft', () => {
    startClock('right')
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, startClock])

  useHotkeys('BracketRight', () => {
    startClock('left')
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, startClock])

  useHotkeys('Backslash', () => {
    switchClock()
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, switchClock])

  useHotkeys('p', () => {
    pauseClock()
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, pauseClock])

  const handleResetClock = () => {
    resetClock()
    setTimeBonusApplied(false)
  }

  useHotkeys('shift+p', handleResetClock, { enabled: isActive, enableOnFormTags: false }, [isActive, handleResetClock])

  const finalizePoeticChase = () => {
    if (timeBonusApplied) return
    pauseClock()
    const timer = useTimerStore.getState()
    const rightBonus = Math.floor(timer.rightTimeMs / 5000)
    const leftBonus = Math.floor(timer.leftTimeMs / 5000)
    if (rightBonus > 0) addRightScore(rightBonus)
    if (leftBonus > 0) addLeftScore(leftBonus)
    setTurned(true)
    setTimeBonusApplied(true)
  }

  useHotkeys('e', finalizePoeticChase, { enabled: isActive, enableOnFormTags: false }, [isActive, finalizePoeticChase])

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}`
  }

  if (!isActive) return null

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">المطاردة الشعرية</span>
        {requiredLetter && (
          <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded western-numerals">
            الحرف: {requiredLetter}
          </span>
        )}
      </div>

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

      {/* Chess clock controls */}
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
          onClick={handleResetClock}
        >
          <RotateCcw className="size-3 me-1" />
          إعادة
          <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">⇧P</kbd>
        </Button>
      </div>

      {/* Pass mechanic controls */}
      <PassControls />

      <Button
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={finalizePoeticChase}
      >
        إنهاء واحتساب الوقت
        <kbd className="px-1 py-0 text-[9px] bg-muted rounded ms-1">E</kbd>
      </Button>

      <div className="rounded border border-border bg-muted/30 p-2 text-[10px] text-muted-foreground">
        تحويل الوقت إلى نقاط: الأيمن {Math.floor(rightTimeMs / 5000)} · الأيسر {Math.floor(leftTimeMs / 5000)}
      </div>

      {/* Letter hint */}
      <div className="rounded border border-border bg-muted/30 p-2 text-[10px] text-muted-foreground space-y-0.5">
        <p>اضغط أي حرف <kbd className="bg-muted rounded px-1">A-Z</kbd> لعرض الحرف على الشاشة</p>
        <p>اضغط <kbd className="bg-muted rounded px-1">Esc</kbd> لإخفاء الحرف</p>
      </div>
    </div>
  )
}
