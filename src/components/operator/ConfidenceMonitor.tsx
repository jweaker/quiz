import { useRef, useState, useEffect } from 'react'
import AudienceDisplay from '@/screens/audience/AudienceDisplay'

/**
 * Target resolution for the audience display.
 * The confidence monitor renders AudienceDisplay at this native size
 * and scales it down to fit the available container space.
 */
const NATIVE_WIDTH = 3840
const NATIVE_HEIGHT = 2160

/**
 * Confidence Monitor — scaled live preview of the audience display.
 *
 * Renders the same AudienceDisplay component used in the /audience route
 * at native 3840x2160 resolution, then CSS-transforms it to fit within
 * the available panel space. Uses ResizeObserver for responsive scaling.
 *
 * This ensures the operator sees exactly what the audience sees,
 * including safe area margins and background styling.
 */
export function ConfidenceMonitor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function updateScale() {
      if (!container) return
      const { width, height } = container.getBoundingClientRect()
      const scaleX = width / NATIVE_WIDTH
      const scaleY = height / NATIVE_HEIGHT
      setScale(Math.min(scaleX, scaleY))
    }

    // Initial calculation
    updateScale()

    // Recalculate on container resize
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div className="h-full flex flex-col border-s border-border">
      <div className="px-3 py-1 border-b bg-muted/50 flex items-center gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
          PREVIEW
        </span>
        <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden bg-black relative"
      >
        <div
          style={{
            width: NATIVE_WIDTH,
            height: NATIVE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <AudienceDisplay />
        </div>
      </div>
    </div>
  )
}

export default ConfidenceMonitor
