import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Audience display freezes on last good frame when component crashes.
 * No error UI shown to audience - just frozen content.
 */
export class AudienceErrorBoundary extends Component<Props, State> {
  private lastGoodSnapshot: ReactNode = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error for debugging but don't show to audience
    console.error('Audience component crashed:', error, info)
  }

  componentDidUpdate(prevProps: Props) {
    // Snapshot successful renders
    if (!this.state.hasError) {
      this.lastGoodSnapshot = prevProps.children
    }
  }

  render() {
    if (this.state.hasError) {
      // Show last good render (frozen frame) or empty div
      return this.lastGoodSnapshot ?? <div />
    }
    return this.props.children
  }
}
