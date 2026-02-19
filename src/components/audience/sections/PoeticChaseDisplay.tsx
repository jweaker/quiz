import { TimerDisplay } from '@/components/audience/TimerDisplay'

/**
 * Audience display for the Poetic Chase (المطاردة الشعرية) section.
 *
 * Shows the chess clock via TimerDisplay (which auto-detects chess clock mode
 * when activeTimer is set or times have diverged from 100s default).
 *
 * LetterDisplay overlay is conditionally rendered in AudienceDisplay.tsx
 * only when this section is active.
 */
export function PoeticChaseDisplay() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <TimerDisplay />
    </div>
  )
}
