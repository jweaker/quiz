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

  // Audio settings (persisted)
  masterVolume: number // 0-1, default 0.8
  timerVolume: number // 0-1, default 1
  feedbackVolume: number // 0-1, default 1
  transitionVolume: number // 0-1, default 0.7
  sectionVolume: number // 0-1, default 1
  audioMuted: boolean // default false

  // Runtime state (not persisted)
  audienceWindowConnected: boolean

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSafeArea: (safeArea: SafeArea) => void
  setConfidenceMonitorSize: (size: number) => void
  setMasterVolume: (volume: number) => void
  setTimerVolume: (volume: number) => void
  setFeedbackVolume: (volume: number) => void
  setTransitionVolume: (volume: number) => void
  setSectionVolume: (volume: number) => void
  setAudioMuted: (muted: boolean) => void
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

      // Audio settings (persisted)
      masterVolume: 0.8,
      timerVolume: 1,
      feedbackVolume: 1,
      transitionVolume: 0.7,
      sectionVolume: 1,
      audioMuted: false,

      // Runtime state (not persisted — set by window lifecycle manager)
      audienceWindowConnected: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      setSafeArea: (safeArea) => set({ safeArea }),
      setConfidenceMonitorSize: (size) => set({ confidenceMonitorSize: size }),
      setMasterVolume: (volume) => set({ masterVolume: volume }),
      setTimerVolume: (volume) => set({ timerVolume: volume }),
      setFeedbackVolume: (volume) => set({ feedbackVolume: volume }),
      setTransitionVolume: (volume) => set({ transitionVolume: volume }),
      setSectionVolume: (volume) => set({ sectionVolume: volume }),
      setAudioMuted: (muted) => set({ audioMuted: muted }),
      setAudienceWindowConnected: (connected) => set({ audienceWindowConnected: connected }),
    }),
    {
      name: 'operator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        safeArea: state.safeArea,
        confidenceMonitorSize: state.confidenceMonitorSize,
        masterVolume: state.masterVolume,
        timerVolume: state.timerVolume,
        feedbackVolume: state.feedbackVolume,
        transitionVolume: state.transitionVolume,
        sectionVolume: state.sectionVolume,
        audioMuted: state.audioMuted,
        // audienceWindowConnected intentionally excluded from persistence
      }),
    }
  )
)
