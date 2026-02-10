import { Outlet } from 'react-router-dom'
import { AudienceErrorBoundary } from '@/app/AudienceErrorBoundary'

/**
 * Root wrapper for the audience display.
 * Fullscreen container with broadcast background (radial gradient).
 * No theme toggle — always uses broadcast styling.
 * Inherits dir="rtl" from html element set in Phase 1.
 */
export default function AudienceRoot() {
  return (
    <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)] overflow-hidden">
      <AudienceErrorBoundary>
        <Outlet />
      </AudienceErrorBoundary>
    </div>
  )
}
