import { useState } from 'react'
import { useShowStore, useTimerStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

export function DebatePanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'debate'

  const debateTopic = data?.parts.debate?.text ?? 'النقاش'
  const debateDuration = data?.parts.debate?.duration ?? data?.settings?.debateDuration ?? 60

  // Local state for vote entry (before confirmation)
  const [judgesRight, setJudgesRight] = useState(0)
  const [judgesLeft, setJudgesLeft] = useState(0)
  const [audienceRight, setAudienceRight] = useState(0)
  const [audienceLeft, setAudienceLeft] = useState(0)
  const [guestRight, setGuestRight] = useState(0)
  const [guestLeft, setGuestLeft] = useState(0)

  const debateVotes = sectionState.debateVotes
  const debateRevealedCount = sectionState.debateRevealedCount ?? 0

  // T: start/stop countdown timer (debate round)
  useHotkeys(
    't',
    () => {
      const timer = useTimerStore.getState()
      if (timer.countdownRunning) {
        useTimerStore.getState().setCountdownRunning(false)
      } else {
        if (timer.countdownRemaining <= 0) {
          useTimerStore.getState().setCountdown(debateDuration)
        }
        useTimerStore.getState().setCountdownRunning(true)
      }
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive, debateDuration]
  )

  // Shift+T: reset timer to 40s (second round)
  useHotkeys(
    'shift+t',
    () => {
      useTimerStore.getState().setCountdownRunning(false)
      useTimerStore.getState().setCountdown(40)
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive]
  )

  // Confirm button handler — writes votes to store
  const handleConfirm = () => {
    const votes = {
      right: { judges: judgesRight, audience: audienceRight, guest: guestRight },
      left: { judges: judgesLeft, audience: audienceLeft, guest: guestLeft },
    }
    useShowStore.getState().setSectionState({ debateVotes: votes, debateRevealedCount: 0 })
  }

  // Enter: reveal next slot (only active after confirm, only when no input focused)
  useHotkeys(
    'enter',
    () => {
      const state = useShowStore.getState().sectionState
      const count = state.debateRevealedCount ?? 0
      if (count < 3) {
        // Reveal next slot
        useShowStore.getState().setSectionState({
          debateRevealedCount: count + 1,
        })
      } else if (count === 3) {
        // All revealed — apply total scores to both teams
        const votes = state.debateVotes!
        const rightTotal = votes.right.judges + votes.right.audience + votes.right.guest
        const leftTotal = votes.left.judges + votes.left.audience + votes.left.guest
        useShowStore.getState().addRightScore(rightTotal)
        useShowStore.getState().addLeftScore(leftTotal)
        // Mark as fully applied (count = 4 means "scores applied")
        useShowStore.getState().setSectionState({ debateRevealedCount: 4 })
      }
    },
    {
      enabled: isActive && debateVotes !== null && debateRevealedCount < 4,
      enableOnFormTags: false,
    },
    [isActive, debateVotes, debateRevealedCount]
  )

  if (!isActive) return null

  // Clamp helper for numeric input
  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, isNaN(val) ? 0 : val))

  // Vote entry phase (debateVotes === null in store)
  if (!debateVotes) {
    return (
      <div className="space-y-3 pt-1">
        {/* Section label */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">النقاش</span>
        </div>

        {/* Debate topic */}
        <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[2rem]">
          {debateTopic}
        </div>

        {/* Vote entry grid: 3 groups × 2 teams */}
        <div className="space-y-1.5">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-1 items-center text-center">
            <span className="text-[10px] text-muted-foreground text-right" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {data?.rightTeamName ?? 'الأيمن'}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {data?.leftTeamName ?? 'الأيسر'}
            </span>
          </div>

          {/* Judges row (0-9) */}
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-1 items-center">
            <span className="text-[11px] text-right">الحكام (0-9)</span>
            <input
              type="number"
              min={0}
              max={9}
              value={judgesRight}
              onChange={(e) => setJudgesRight(clamp(Number(e.target.value), 0, 9))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              min={0}
              max={9}
              value={judgesLeft}
              onChange={(e) => setJudgesLeft(clamp(Number(e.target.value), 0, 9))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Audience row (0-3) */}
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-1 items-center">
            <span className="text-[11px] text-right">الجمهور (0-3)</span>
            <input
              type="number"
              min={0}
              max={3}
              value={audienceRight}
              onChange={(e) => setAudienceRight(clamp(Number(e.target.value), 0, 3))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              min={0}
              max={3}
              value={audienceLeft}
              onChange={(e) => setAudienceLeft(clamp(Number(e.target.value), 0, 3))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Guest row (0-3) */}
          <div className="grid grid-cols-[1fr_3.5rem_3.5rem] gap-1 items-center">
            <span className="text-[11px] text-right">الضيف (0-3)</span>
            <input
              type="number"
              min={0}
              max={3}
              value={guestRight}
              onChange={(e) => setGuestRight(clamp(Number(e.target.value), 0, 3))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <input
              type="number"
              min={0}
              max={3}
              value={guestLeft}
              onChange={(e) => setGuestLeft(clamp(Number(e.target.value), 0, 3))}
              className="h-7 w-14 rounded border border-border bg-card text-center text-[11px] tabular-nums western-numerals outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          className="w-full rounded border border-primary bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          تأكيد
        </button>

        {/* Timer shortcuts */}
        <div className="flex gap-1 flex-wrap">
          <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5">T</kbd>
          <span className="text-[10px] text-muted-foreground">مؤقت {debateDuration}ث</span>
          <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5 ms-2">⇧T</kbd>
          <span className="text-[10px] text-muted-foreground">إعادة 40ث</span>
        </div>
      </div>
    )
  }

  // Reveal phase (debateVotes !== null)
  const rightTotal = debateVotes.right.judges + debateVotes.right.audience + debateVotes.right.guest
  const leftTotal = debateVotes.left.judges + debateVotes.left.audience + debateVotes.left.guest

  const slots = [
    { key: 'judges' as const, label: 'الحكام', rightVal: debateVotes.right.judges, leftVal: debateVotes.left.judges },
    { key: 'audience' as const, label: 'الجمهور', rightVal: debateVotes.right.audience, leftVal: debateVotes.left.audience },
    { key: 'guest' as const, label: 'الضيف', rightVal: debateVotes.right.guest, leftVal: debateVotes.left.guest },
  ]

  return (
    <div className="space-y-3 pt-1">
      {/* Section label + progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">كشف التصويت</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {Math.min(debateRevealedCount, 3)} / 3
        </span>
      </div>

      {/* Reveal progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(Math.min(debateRevealedCount, 3) / 3) * 100}%` }}
        />
      </div>

      {/* Vote slots — read-only summary */}
      <div className="space-y-1">
        {slots.map((slot, i) => (
          <div
            key={slot.key}
            className={
              'flex items-center gap-2 rounded border px-2 py-1 text-[11px] transition-colors ' +
              (debateRevealedCount > i
                ? 'border-green-500/30 bg-green-500/10'
                : 'border-border bg-card opacity-50')
            }
          >
            <span className="w-3 text-center">
              {debateRevealedCount > i ? '✓' : '○'}
            </span>
            <span className="flex-1">{slot.label}</span>
            {debateRevealedCount > i ? (
              <span className="tabular-nums western-numerals font-medium">
                {slot.rightVal} : {slot.leftVal}
              </span>
            ) : (
              <span className="text-muted-foreground">─</span>
            )}
          </div>
        ))}
      </div>

      {/* Totals (after all 3 revealed) */}
      {debateRevealedCount >= 3 && (
        <div className="flex items-center justify-between rounded border border-border bg-card px-2 py-1.5 text-xs font-bold">
          <span>المجموع</span>
          <span className="tabular-nums western-numerals">
            {rightTotal} : {leftTotal}
          </span>
        </div>
      )}

      {/* Applied confirmation */}
      {debateRevealedCount === 4 && (
        <div className="rounded border border-green-500/30 bg-green-500/10 px-2 py-1 text-[11px] text-green-400 text-center">
          تم تطبيق النتائج ✓
        </div>
      )}

      {/* Keyboard hints */}
      <div className="flex gap-1">
        <kbd className="text-[10px] bg-muted rounded px-1.5 py-0.5">Enter</kbd>
        <span className="text-[10px] text-muted-foreground">
          {debateRevealedCount < 3
            ? 'الكشف التالي'
            : debateRevealedCount === 3
              ? 'تطبيق النتائج'
              : 'تم التطبيق'}
        </span>
      </div>
    </div>
  )
}
