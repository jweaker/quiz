import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/components/operator/ThemeProvider'
import { OperatorErrorBoundary } from '@/app/OperatorErrorBoundary'

/**
 * Root wrapper for the operator panel.
 * Provides theme context and error boundary.
 * Inherits dir="rtl" from html element set in Phase 1.
 */
export default function OperatorRoot() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <OperatorErrorBoundary>
          <Outlet />
        </OperatorErrorBoundary>
      </div>
    </ThemeProvider>
  )
}
