import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center' }}>
      <p>Something went wrong</p>
      <pre style={{ fontSize: '12px', color: '#666' }}>{message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

export function ErrorBoundary({ children, fallback }: Props) {
  return (
    <ReactErrorBoundary
      fallbackRender={fallback ? () => <>{fallback}</> : DefaultFallback}
      onReset={() => {
        // Reset app state if needed
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
