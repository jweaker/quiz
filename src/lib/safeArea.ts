import type { CSSProperties } from 'react'
import type { SafeArea } from '@/state'

/**
 * Converts safe area margins to CSS properties for absolute positioning.
 * Content is positioned within the safe area, background fills full canvas.
 */
export function getContentStyle(safeArea: SafeArea): CSSProperties {
  const suffix = safeArea.unit === '%' ? '%' : 'px'
  return {
    position: 'absolute',
    top: `${safeArea.top}${suffix}`,
    right: `${safeArea.right}${suffix}`,
    bottom: `${safeArea.bottom}${suffix}`,
    left: `${safeArea.left}${suffix}`,
  }
}
