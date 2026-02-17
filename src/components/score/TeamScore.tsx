import { useEffect, useRef, useState } from 'react'
import { useScoreDelta } from '@/hooks/useScoreDelta'
import { ScoreFlash } from '@/components/animations/ScoreFlash'

interface TeamScoreProps {
  teamName: string
  score: number
  isActive: boolean
  variant: 'audience' | 'operator'
}

/**
 * Reusable team score display with pop animation, delta indicator, and active team glow.
 * Supports two variants: audience (broadcast styling) and operator (themed controls).
 */
export function TeamScore({ teamName, score, isActive, variant }: TeamScoreProps) {
  const delta = useScoreDelta(score)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousScoreRef = useRef(score)

  // Trigger pop animation on score change
  useEffect(() => {
    if (score !== previousScoreRef.current) {
      previousScoreRef.current = score
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      return () => clearTimeout(timer)
    }
  }, [score])

  if (variant === 'audience') {
    return (
      <div className="flex flex-col items-center gap-3">
        <span
          className="text-white/80 font-medium drop-shadow-md"
          style={{ fontSize: 'clamp(1.2rem, 3vw, 3rem)' }}
        >
          {teamName}
        </span>
        <div
          className={
            'bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center transition-shadow duration-300 relative ' +
            (isActive ? 'team-glow-active' : '')
          }
          style={{
            width: 'clamp(6rem, 12vw, 14rem)',
            height: 'clamp(6rem, 12vw, 14rem)',
          }}
        >
          {/* Score celebration with confetti (audience only) - parallel animations */}
          {delta.map((d) => (
            <ScoreFlash key={d.id} delta={d.value} />
          ))}
          {/* Score number */}
          <span
            className={
              'text-white font-bold tabular-nums drop-shadow-lg score-number ' +
              (isAnimating ? 'animate-score-pop' : '')
            }
            style={{ fontSize: 'clamp(2rem, 6vw, 7rem)' }}
          >
            {score}
          </span>
        </div>
      </div>
    )
  }

  // Operator variant - also uses delta array
  return (
    <div
      className={
        'rounded-lg border p-6 text-center transition-all relative ' +
        (isActive
          ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/30'
          : 'border-border bg-card')
      }
    >
      <p className="text-sm font-medium text-muted-foreground mb-2">{teamName}</p>

      <div className="relative inline-block">
        {/* Delta indicator - parallel animations */}
        {delta.map((d) => (
          <div
            key={d.id}
            className={
              'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full font-bold text-2xl animate-delta-fade ' +
              (d.value > 0 ? 'text-green-600' : 'text-red-600')
            }
          >
            {d.value > 0 ? '+' : ''}
            {d.value}
          </div>
        ))}

        {/* Score number */}
        <p
          className={
            'text-5xl font-bold tabular-nums score-number ' +
            (isAnimating ? 'animate-score-pop' : '')
          }
        >
          {score}
        </p>
      </div>

      {isActive && (
        <span className="inline-block mt-2 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
          الدور الحالي
        </span>
      )}
    </div>
  )
}
