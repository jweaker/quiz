import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useState, useEffect, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onSkipSection?: () => void
}

function OperatorFallback({
  error,
  resetErrorBoundary,
  onSkipSection,
}: {
  error: unknown
  resetErrorBoundary: () => void
  onSkipSection?: () => void
}) {
  const message = error instanceof Error ? error.message : String(error)
  const [retryCount, setRetryCount] = useState(0)
  const [autoRetrying, setAutoRetrying] = useState(true)

  // Auto-retry once on first error
  useEffect(() => {
    if (autoRetrying && retryCount === 0) {
      const timer = setTimeout(() => {
        setRetryCount(1)
        resetErrorBoundary()
      }, 500)
      return () => clearTimeout(timer)
    }
    setAutoRetrying(false)
  }, [autoRetrying, retryCount, resetErrorBoundary])

  if (autoRetrying) {
    return (
      <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'orange',
            animation: 'pulse 1s infinite',
          }}
        />
        <span>Recovering...</span>
      </div>
    )
  }

  // Auto-retry failed, show subtle controls
  return (
    <div
      style={{
        padding: '10px',
        backgroundColor: 'rgba(255,0,0,0.1)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'red',
        }}
      />
      <span style={{ fontSize: '14px' }}>Section error</span>
      <pre style={{ fontSize: '12px', color: '#666' }}>{message}</pre>
      <button onClick={resetErrorBoundary} style={{ fontSize: '12px' }}>
        Retry
      </button>
      {onSkipSection && (
        <button onClick={onSkipSection} style={{ fontSize: '12px' }}>
          Skip Section
        </button>
      )}
    </div>
  )
}

export function OperatorErrorBoundary({ children, onSkipSection }: Props) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => (
        <OperatorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          onSkipSection={onSkipSection}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
