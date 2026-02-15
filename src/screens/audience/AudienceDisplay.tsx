import { useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { ScoreOverlay } from '@/components/audience/ScoreOverlay'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { LetterDisplay } from '@/components/audience/LetterDisplay'
import { TypewriterText } from '@/components/animations/TypewriterText'
import { motion } from 'motion/react'
import { getSectionBackground, animationPresets } from '@/lib/animationPresets'

/**
 * Audience-facing broadcast display.
 * Fixed 16:9 aspect ratio targeting 4K (3840x2160).
 * Content positioned within configurable safe area margins.
 * Background fills entire viewport; content respects safe area.
 */
export default function AudienceDisplay() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  // TODO: Phase 5 Plan 04 adds section state to showStore.
  // For now, use a hardcoded default 'idle' section type.
  const currentSection = 'idle'

  return (
    <motion.div
      className="w-full h-full relative overflow-hidden"
      style={{ aspectRatio: '16/9' }}
      animate={{ background: getSectionBackground(currentSection) }}
      transition={animationPresets.sectionWipe}
    >
      {/* Score overlay - always visible at top */}
      <ScoreOverlay />

      {/* Letter display overlay - appears above content when letter is set */}
      <LetterDisplay />

      {/* Content area positioned by safe area margins */}
      <div style={contentStyle} className="flex flex-col items-center justify-center">
        {/* Show title with typewriter entrance animation */}
        <TypewriterText
          text="بشائر المعرفة"
          className="text-white font-bold text-center drop-shadow-lg"
          style={{ fontSize: 'clamp(2rem, 5vw, 6rem)' }}
          speed={0.05}
        />

        {/* Timer display (countdown or chess clock) */}
        <TimerDisplay />
      </div>
    </motion.div>
  )
}
