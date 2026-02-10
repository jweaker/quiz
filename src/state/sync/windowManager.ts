/**
 * Window lifecycle manager for the audience display window.
 *
 * Handles opening, closing, focusing, and detecting disconnection
 * of the audience window. Uses polling (500ms) to detect window.closed
 * since beforeunload events don't reliably fire for other windows.
 */

export interface WindowManager {
  /** Reference to the audience window, null if not open */
  readonly audienceWindow: Window | null
  /** Whether the audience window is currently open and connected */
  readonly isConnected: boolean
  /** Open the audience window (or focus if already open) */
  open(): void
  /** Close the audience window if open */
  close(): void
  /** Focus the existing audience window */
  focus(): void
  /** Register a callback for connection state changes */
  onConnectionChange(callback: (connected: boolean) => void): () => void
}

const POLL_INTERVAL_MS = 500
const AUDIENCE_ROUTE = '/audience'
const WINDOW_NAME = 'quiz-audience'
const WINDOW_FEATURES = 'popup,width=1920,height=1080'

function createWindowManager(): WindowManager {
  let audienceWindow: Window | null = null
  let pollInterval: ReturnType<typeof setInterval> | null = null
  let connected = false
  const listeners = new Set<(connected: boolean) => void>()

  function notifyListeners(newConnected: boolean): void {
    if (connected === newConnected) return
    connected = newConnected
    for (const listener of listeners) {
      listener(connected)
    }
  }

  function startPolling(): void {
    if (pollInterval !== null) return

    pollInterval = setInterval(() => {
      if (audienceWindow && audienceWindow.closed) {
        audienceWindow = null
        stopPolling()
        notifyListeners(false)
      }
    }, POLL_INTERVAL_MS)
  }

  function stopPolling(): void {
    if (pollInterval !== null) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  const manager: WindowManager = {
    get audienceWindow() {
      return audienceWindow
    },

    get isConnected() {
      return connected
    },

    open() {
      // If window exists and not closed, just focus it
      if (audienceWindow && !audienceWindow.closed) {
        audienceWindow.focus()
        return
      }

      // Open new audience window
      audienceWindow = window.open(AUDIENCE_ROUTE, WINDOW_NAME, WINDOW_FEATURES)

      if (audienceWindow) {
        notifyListeners(true)
        startPolling()
      }
    },

    close() {
      if (audienceWindow && !audienceWindow.closed) {
        audienceWindow.close()
      }
      audienceWindow = null
      stopPolling()
      notifyListeners(false)
    },

    focus() {
      if (audienceWindow && !audienceWindow.closed) {
        audienceWindow.focus()
      }
    },

    onConnectionChange(callback: (connected: boolean) => void): () => void {
      listeners.add(callback)
      // Return unsubscribe function
      return () => {
        listeners.delete(callback)
      }
    },
  }

  return manager
}

/** Singleton window manager instance */
export const windowManager = createWindowManager()

export { createWindowManager }
