import { useEffect, useRef, useState } from 'react'
import { useShowStore } from '@/state'
import { TeamScore } from '@/components/score/TeamScore'
import { ScreenShake } from '@/components/animations/ScreenShake'
import { motion } from 'motion/react'
import { animationPresets } from '@/lib/animationPresets'

/**
 * Compact score overlay for audience display.
 * Fixed position at top of screen, always visible.
 * Shows both team scores with animations and active team glow.
 * Slides down with entrance animation on mount.
 * Wrapped in ScreenShake for negative score red flash effect.
 */
export function ScoreOverlay() {
  const rightScore = useShowStore((s) => s.rightScore)
  const leftScore = useShowStore((s) => s.leftScore)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)
  const data = useShowStore((s) => s.data)

  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'

  // Track negative score changes for ScreenShake trigger
  const [shakeTrigger, setShakeTrigger] = useState(0)
  const prevRightScoreRef = useRef(rightScore)
  const prevLeftScoreRef = useRef(leftScore)

  useEffect(() => {
    // Detect negative score changes (decreases)
    const rightDecreased = rightScore < prevRightScoreRef.current
    const leftDecreased = leftScore < prevLeftScoreRef.current

    if (rightDecreased || leftDecreased) {
      setShakeTrigger((prev) => prev + 1)
    }

    prevRightScoreRef.current = rightScore
    prevLeftScoreRef.current = leftScore
  }, [rightScore, leftScore])

  return (
    <ScreenShake trigger={shakeTrigger} intensity="heavy">
      <motion.div
        className="fixed top-6 left-0 right-0 flex items-center justify-center gap-8 px-6 z-10"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={animationPresets.entrance}
      >
        {/* Right team */}
        <TeamScore
          variant="audience"
          teamName={rightTeamName}
          score={rightScore}
          isActive={rightsTurn && turned}
        />

        {/* Separator */}
        <div
          className="text-white font-bold opacity-50"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 4rem)' }}
        >
          :
        </div>

        {/* Left team */}
        <TeamScore
          variant="audience"
          teamName={leftTeamName}
          score={leftScore}
          isActive={!rightsTurn && turned}
        />
      </motion.div>
    </ScreenShake>
  )
}
