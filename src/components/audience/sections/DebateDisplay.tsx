import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { motion, AnimatePresence } from 'motion/react'

const DEBATE_SLOTS = [
  { key: 'judges', label: 'الحكام', threshold: 1 },
  { key: 'audience', label: 'الجمهور', threshold: 2 },
  { key: 'guest', label: 'الضيف', threshold: 3 },
] as const

export function DebateDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const debateTopic = data?.parts.debate?.text ?? 'النقاش'
  const debateVotes = sectionState.debateVotes
  const revealedCount = sectionState.debateRevealedCount

  // Pre-reveal: show topic
  if (!debateVotes) {
    return (
      <div style={contentStyle} className="flex flex-col items-center justify-center h-full">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-white font-bold text-center drop-shadow-lg px-8 whitespace-pre-line"
          style={{ fontSize: 'clamp(2rem, 4vw, 5rem)' }}
        >
          {debateTopic}
        </motion.p>
      </div>
    )
  }

  // Reveal phase
  const rightTeamName = data?.rightTeamName ?? 'الأيمن'
  const leftTeamName = data?.leftTeamName ?? 'الأيسر'
  const rightTotal = debateVotes.right.judges + debateVotes.right.audience + debateVotes.right.guest
  const leftTotal = debateVotes.left.judges + debateVotes.left.audience + debateVotes.left.guest

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-8">
      {/* Team name headers */}
      <div className="flex justify-center gap-24 w-full max-w-4xl">
        <span className="text-white font-bold" style={{ fontSize: 'clamp(1.2rem, 2vw, 2.5rem)' }}>
          {rightTeamName}
        </span>
        <span className="text-white/40 font-bold" style={{ fontSize: 'clamp(1.2rem, 2vw, 2.5rem)' }}>
          VS
        </span>
        <span className="text-white font-bold" style={{ fontSize: 'clamp(1.2rem, 2vw, 2.5rem)' }}>
          {leftTeamName}
        </span>
      </div>

      {/* Vote reveal slots */}
      <div className="flex gap-8 justify-center items-end">
        <AnimatePresence>
          {DEBATE_SLOTS.map((slot) =>
            revealedCount >= slot.threshold ? (
              <motion.div
                key={slot.key}
                initial={{ scale: 0.3, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                className="flex flex-col items-center rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-6"
              >
                <span className="text-white/70 font-medium mb-3" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)' }}>
                  {slot.label}
                </span>
                <div className="flex items-center gap-3">
                  <span className="western-numerals text-amber-300 font-bold" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
                    {debateVotes.right[slot.key]}
                  </span>
                  <span className="text-white/40 font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
                    :
                  </span>
                  <span className="western-numerals text-amber-300 font-bold" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}>
                    {debateVotes.left[slot.key]}
                  </span>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>

      {/* Total row — visible after all 3 slots revealed */}
      <AnimatePresence>
        {revealedCount >= 3 && (
          <motion.div
            key="totals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-4 mt-4"
          >
            <span className="text-white/60 font-medium" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.8rem)' }}>
              المجموع
            </span>
            <span className="western-numerals text-white font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
              {rightTotal}
            </span>
            <span className="text-white/40 font-bold" style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)' }}>
              :
            </span>
            <span className="western-numerals text-white font-bold" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
              {leftTotal}
            </span>
            {revealedCount === 4 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-green-400 text-2xl"
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
