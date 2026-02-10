import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface SafeArea {
  top: number
  right: number
  bottom: number
  left: number
  unit: 'px' | '%'
}

export interface OperatorState {
  // Settings
  theme: 'light' | 'dark' | 'system'
  safeArea: SafeArea
  confidenceMonitorSize: number // percentage, default 30

  // Runtime state (not persisted)
  audienceWindowConnected: boolean

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSafeArea: (safeArea: SafeArea) => void
  setConfidenceMonitorSize: (size: number) => void
  setAudienceWindowConnected: (connected: boolean) => void
}

const defaultSafeArea: SafeArea = {
  top: 0,
  right: 0,
  bottom: 15,
  left: 0,
  unit: '%',
}

export const useOperatorStore = create<OperatorState>()(
  persist(
    (set) => ({
      // Settings (persisted)
      theme: 'system',
      safeArea: defaultSafeArea,
      confidenceMonitorSize: 30,

      // Runtime state (not persisted — set by window lifecycle manager)
      audienceWindowConnected: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      setSafeArea: (safeArea) => set({ safeArea }),
      setConfidenceMonitorSize: (size) => set({ confidenceMonitorSize: size }),
      setAudienceWindowConnected: (connected) => set({ audienceWindowConnected: connected }),
    }),
    {
      name: 'operator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        safeArea: state.safeArea,
        confidenceMonitorSize: state.confidenceMonitorSize,
        // audienceWindowConnected intentionally excluded from persistence
      }),
    }
  )
)
