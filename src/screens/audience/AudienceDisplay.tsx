import { useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { ScoreOverlay } from '@/components/audience/ScoreOverlay'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { LetterDisplay } from '@/components/audience/LetterDisplay'

/**
 * Audience-facing broadcast display.
 * Fixed 16:9 aspect ratio targeting 4K (3840x2160).
 * Content positioned within configurable safe area margins.
 * Background fills entire viewport; content respects safe area.
 */
export default function AudienceDisplay() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Score overlay - always visible at top */}
      <ScoreOverlay />

      {/* Letter display overlay - appears above content when letter is set */}
      <LetterDisplay />

      {/* Content area positioned by safe area margins */}
      <div style={contentStyle} className="flex flex-col items-center justify-center">
        {/* Show title */}
        <h1
          className="text-white font-bold text-center drop-shadow-lg"
          style={{ fontSize: 'clamp(2rem, 5vw, 6rem)' }}
        >
          بشائر المعرفة
        </h1>

        {/* Timer display (countdown or chess clock) */}
        <TimerDisplay />
      </div>
    </div>
  )
}
