import { useTimerStore } from '@/state'

/**
 * Audience-facing timer display for broadcast.
 * Shows either countdown timer or chess clock based on active state.
 * Large text, high contrast, clean design for TV broadcast.
 */
export function TimerDisplay() {
  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)
  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const rightTimeMs = useTimerStore((s) => s.rightTimeMs)
  const leftTimeMs = useTimerStore((s) => s.leftTimeMs)
  const activeTimer = useTimerStore((s) => s.activeTimer)

  // Determine which mode to display
  const isChessClockActive = activeTimer !== null || rightTimeMs < 100_000 || leftTimeMs < 100_000
  const isCountdownActive = countdownRunning

  // If nothing is active, don't render
  if (!isChessClockActive && !isCountdownActive) {
    return null
  }

  // Format time display: MM:SS or SS
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${seconds}`
  }

  // Chess clock display
  if (isChessClockActive) {
    const rightSeconds = Math.ceil(rightTimeMs / 1000)
    const leftSeconds = Math.ceil(leftTimeMs / 1000)
    const rightPoints = Math.floor(rightTimeMs / 5000)
    const leftPoints = Math.floor(leftTimeMs / 5000)

    return (
      <div className="flex items-center justify-center gap-8 mt-12">
        {/* Right team clock */}
        <div
          className={
            'flex flex-col items-center transition-all duration-300 ' +
            (activeTimer === 'right' ? 'opacity-100' : 'opacity-50')
          }
        >
          <div
            className={
              'bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-8 min-w-[12rem] ' +
              (activeTimer === 'right' ? 'team-glow-active' : '')
            }
          >
            <p className="text-white/80 text-2xl font-medium mb-2">الفريق الأيمن</p>
            <p className="text-white font-bold text-7xl tabular-nums western-numerals drop-shadow-lg">
              {formatTime(rightSeconds)}
            </p>
            <p className="text-white/60 text-xl mt-2">ثانية</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-white/80 text-3xl font-medium">
              = <span className="western-numerals">{rightPoints}</span> نقطة
            </p>
          </div>
        </div>

        {/* Left team clock */}
        <div
          className={
            'flex flex-col items-center transition-all duration-300 ' +
            (activeTimer === 'left' ? 'opacity-100' : 'opacity-50')
          }
        >
          <div
            className={
              'bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-8 min-w-[12rem] ' +
              (activeTimer === 'left' ? 'team-glow-active' : '')
            }
          >
            <p className="text-white/80 text-2xl font-medium mb-2">الفريق الأيسر</p>
            <p className="text-white font-bold text-7xl tabular-nums western-numerals drop-shadow-lg">
              {formatTime(leftSeconds)}
            </p>
            <p className="text-white/60 text-xl mt-2">ثانية</p>
          </div>
          <div className="mt-4 text-center">
            <p className="text-white/80 text-3xl font-medium">
              = <span className="western-numerals">{leftPoints}</span> نقطة
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Countdown display
  if (isCountdownActive) {
    // Determine color based on threshold
    let textColor = 'text-white'
    if (countdownRemaining <= 5) {
      textColor = 'text-red-500'
    } else if (countdownRemaining <= 10) {
      textColor = 'text-yellow-400'
    }

    return (
      <div className="flex flex-col items-center justify-center mt-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12">
          <p
            className={`font-bold text-9xl tabular-nums western-numerals drop-shadow-lg transition-colors duration-300 ${textColor}`}
          >
            {formatTime(countdownRemaining)}
          </p>
        </div>
        <p className="text-white/80 text-3xl font-medium mt-6">ثانية</p>
      </div>
    )
  }

  return null
}
