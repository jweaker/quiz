import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useShowStore } from '@/state'
import type { SectionStatus } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

/**
 * Horizontal rundown rail showing all episode sections as compact cards.
 * Current section is visually highlighted (active state).
 * Click-to-jump: clicking a section card immediately jumps to that section.
 * Togglable: R key shows/hides the rail.
 * Cmd+Right/Left: navigate to next/previous section.
 */
export function RundownRail() {
  const [visible, setVisible] = useState(true)

  const sections = useShowStore((s) => s.sections)
  const currentSection = useShowStore((s) => s.currentSection)
  const jumpToSection = useShowStore((s) => s.jumpToSection)
  const nextSection = useShowStore((s) => s.nextSection)
  const prevSection = useShowStore((s) => s.prevSection)

  // Toggle rail visibility
  useHotkeys('r', () => setVisible((v) => !v), { enableOnFormTags: false })

  // Section navigation
  useHotkeys('mod+ArrowRight', () => nextSection(), { enableOnFormTags: false, preventDefault: true })
  useHotkeys('mod+ArrowLeft', () => prevSection(), { enableOnFormTags: false, preventDefault: true })

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="rundown-rail"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="flex gap-1.5 p-2 overflow-x-auto min-h-[60px] items-center scrollbar-thin scrollbar-thumb-muted">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                name={section.name}
                status={section.status}
                isActive={section.id === currentSection}
                onClick={() => jumpToSection(section.id)}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Section Card ──────────────────────────────────────────────

interface SectionCardProps {
  name: string
  status: SectionStatus
  isActive: boolean
  onClick: () => void
}

function SectionCard({ name, status, isActive, onClick }: SectionCardProps) {
  const statusStyles = isActive
    ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30'
    : status === 'done'
      ? 'border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-400'
      : 'border-border bg-card text-muted-foreground'

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={
        'min-w-[100px] px-3 py-2 rounded border text-center transition-colors shrink-0 cursor-pointer ' +
        statusStyles
      }
    >
      <p className="text-xs font-medium leading-tight">{name}</p>
      <StatusDot status={isActive ? 'active' : status} />
    </motion.button>
  )
}

// ─── Status Dot ────────────────────────────────────────────────

function StatusDot({ status }: { status: SectionStatus }) {
  if (status === 'active') {
    return (
      <span className="flex items-center justify-center mt-1">
        <span className="relative flex size-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-primary" />
        </span>
      </span>
    )
  }

  if (status === 'done') {
    return (
      <span className="flex items-center justify-center mt-1">
        <span className="inline-flex rounded-full size-2 bg-green-500" />
      </span>
    )
  }

  // pending
  return (
    <span className="flex items-center justify-center mt-1">
      <span className="inline-flex rounded-full size-2 bg-muted-foreground/40" />
    </span>
  )
}
