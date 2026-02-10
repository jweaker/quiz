import { useEffect, useCallback } from 'react'
import { useOperatorStore } from '@/state/operatorStore'
import { windowManager } from '@/state/sync/windowManager'

/**
 * React hook for audience window lifecycle management.
 *
 * Provides connection state and controls for the audience window.
 * Syncs connection state with operatorStore.audienceWindowConnected.
 *
 * @returns {Object} Window controls and state
 * @returns {boolean} isConnected - Whether the audience window is open
 * @returns {() => void} openAudience - Open or focus the audience window
 * @returns {() => void} closeAudience - Close the audience window
 */
export function useAudienceWindow() {
  const isConnected = useOperatorStore((s) => s.audienceWindowConnected)
  const setAudienceWindowConnected = useOperatorStore((s) => s.setAudienceWindowConnected)

  // Register connection change callback
  useEffect(() => {
    const unsubscribe = windowManager.onConnectionChange((connected) => {
      setAudienceWindowConnected(connected)
    })

    // Sync initial state in case the window was already open
    // (e.g., during React StrictMode double-mount)
    if (windowManager.isConnected !== isConnected) {
      setAudienceWindowConnected(windowManager.isConnected)
    }

    return unsubscribe
  }, [setAudienceWindowConnected, isConnected])

  const openAudience = useCallback(() => {
    windowManager.open()
  }, [])

  const closeAudience = useCallback(() => {
    windowManager.close()
  }, [])

  return { isConnected, openAudience, closeAudience }
}
