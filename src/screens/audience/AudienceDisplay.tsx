import { useOperatorStore, useShowStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'

/**
 * Audience-facing broadcast display.
 * Fixed 16:9 aspect ratio targeting 4K (3840x2160).
 * Content positioned within configurable safe area margins.
 * Background fills entire viewport; content respects safe area.
 */
export default function AudienceDisplay() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const leftScore = useShowStore((s) => s.leftScore)
  const rightScore = useShowStore((s) => s.rightScore)
  const data = useShowStore((s) => s.data)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)

  const leftTeamName = data?.leftTeamName ?? 'الفريق الأيسر'
  const rightTeamName = data?.rightTeamName ?? 'الفريق الأيمن'

  const contentStyle = getContentStyle(safeArea)

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Content area positioned by safe area margins */}
      <div style={contentStyle} className="flex flex-col items-center justify-center">
        {/* Show title */}
        <h1
          className="text-white font-bold text-center mb-8 drop-shadow-lg"
          style={{ fontSize: 'clamp(2rem, 5vw, 6rem)' }}
        >
          بشائر المعرفة
        </h1>

        {/* Score display */}
        <div className="flex items-center gap-8 justify-center">
          {/* Right team */}
          <AudienceScoreCard
            teamName={rightTeamName}
            score={rightScore}
            isActive={rightsTurn && turned}
          />

          <div
            className="text-white font-bold opacity-50"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 4rem)' }}
          >
            :
          </div>

          {/* Left team */}
          <AudienceScoreCard
            teamName={leftTeamName}
            score={leftScore}
            isActive={!rightsTurn && turned}
          />
        </div>

        {/* Turn indicator */}
        {turned && (
          <div className="mt-8">
            <span
              className="text-white/80 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full"
              style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1.5rem)' }}
            >
              الدور: {rightsTurn ? rightTeamName : leftTeamName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Score card for audience display — broadcast-ready styling.
 */
function AudienceScoreCard({
  teamName,
  score,
  isActive,
}: {
  teamName: string
  score: number
  isActive: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-white/80 font-medium drop-shadow-md"
        style={{ fontSize: 'clamp(0.8rem, 2vw, 2.5rem)' }}
      >
        {teamName}
      </span>
      <div
        className={
          'bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all ' +
          (isActive
            ? 'ring-4 ring-white/40 bg-white/20'
            : '')
        }
        style={{
          width: 'clamp(6rem, 12vw, 14rem)',
          height: 'clamp(6rem, 12vw, 14rem)',
        }}
      >
        <span
          className="text-white font-bold tabular-nums drop-shadow-lg"
          style={{ fontSize: 'clamp(2rem, 6vw, 7rem)' }}
        >
          {score}
        </span>
      </div>
    </div>
  )
}
