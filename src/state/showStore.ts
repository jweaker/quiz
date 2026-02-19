import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { temporal } from 'zundo'
import { broadcast } from './sync/broadcastMiddleware'

// ─── Episode section types ──────────────────────────────────────

export type SectionStatus = 'pending' | 'active' | 'done'

export type SectionType =
  | 'speed-question'      // سؤال السرعة
  | 'windows'             // نوافذ المعرفة (includes minefield)
  | 'puzzle'              // الألغاز
  | 'debate'              // النقاش
  | 'poetic-chase'        // المطاردة الشعرية
  | 'ask-intelligently'   // اسأل بذكاء
  | 'rapid-questions'     // الرشق السريع
  | 'audience-questions'  // أسئلة الجمهور

export interface EpisodeSection {
  id: string           // unique id like 'speed-question'
  type: SectionType
  name: string         // Arabic display name
  status: SectionStatus
  order: number        // position in episode
}

// ─── Question data types ────────────────────────────────────────
// (re-exported from contexts for backward compatibility)
interface QuestionItem {
  text: string
  answer: string
  duration: number
  marks: number
  file?: string
  isImage?: boolean
  done?: boolean
}

interface QuickQuestionSet {
  title: string
  questions: QuestionItem[]
}

interface WindowsData {
  naturalSciences: QuestionItem[]
  humanSciences: QuestionItem[]
  misc: QuestionItem[]
  arts: QuestionItem[]
  religion: QuestionItem[]
  [key: string]: QuestionItem[]
}

interface EpisodeParts {
  speedQuestions: QuestionItem[]
  debate: QuestionItem
  puzzles: QuestionItem[]
  windows: WindowsData
  audienceQuestions: QuestionItem[]
  quickQuestions: QuickQuestionSet[]
  [key: string]: unknown
}

export interface EpisodeData {
  leftTeamName: string
  rightTeamName: string
  parts: EpisodeParts
  [key: string]: unknown
}

export interface ShowState {
  // Scores
  rightScore: number
  leftScore: number

  // Turn state
  rightsTurn: boolean
  turned: boolean

  // Side swap tracking
  sidesSwapped: boolean

  // Question tracking
  quickQuestion: number
  audienceQuestion: number

  // Episode data
  data: EpisodeData | null

  // Episode sections
  sections: EpisodeSection[]
  currentSection: string | null  // section id

  // Section-specific state (broadcast-synced, temporal-excluded)
  sectionState: {
    questionIndex: number         // 0-based, current question shown on audience
    answerRevealed: boolean       // whether answer is visible on audience display
    isMinefieldQuestion: boolean  // true when operator activates minefield visual treatment
    debateVotes: {
      right: { judges: number; audience: number; guest: number }
      left:  { judges: number; audience: number; guest: number }
    } | null
    debateRevealedCount: number   // 0=none, 1=judges revealed, 2=+audience, 3=+guest
    askedQuestions: number        // yes/no questions asked in Ask Intelligently (deducted from 20)
    rapidActiveTeam: 'right' | 'left' | null
  }

  // Actions
  setRightScore: (score: number) => void
  setLeftScore: (score: number) => void
  addRightScore: (delta: number) => void
  addLeftScore: (delta: number) => void
  setRightsTurn: (isRight: boolean) => void
  toggleTurn: () => void
  setTurned: (turned: boolean) => void
  swapSides: () => void
  setQuickQuestion: (index: number) => void
  setAudienceQuestion: (index: number) => void
  setData: (data: EpisodeData) => void
  updateData: (updater: (data: EpisodeData) => EpisodeData) => void
  jumpToSection: (sectionId: string) => void
  setSectionStatus: (sectionId: string, status: SectionStatus) => void
  setSectionState: (update: Partial<ShowState['sectionState']>) => void
  resetSectionState: () => void
  nextSection: () => void
  prevSection: () => void
  reset: () => void
}

const defaultSectionState: ShowState['sectionState'] = {
  questionIndex: 0,
  answerRevealed: false,
  isMinefieldQuestion: false,
  debateVotes: null,
  debateRevealedCount: 0,
  askedQuestions: 0,
  rapidActiveTeam: null,
}

const initialState = {
  rightScore: 0,
  leftScore: 0,
  rightsTurn: false,
  turned: false,
  sidesSwapped: false,
  quickQuestion: 0,
  audienceQuestion: 0,
  data: null as EpisodeData | null,
  sectionState: { ...defaultSectionState },
  sections: [
    { id: 'speed-question', type: 'speed-question' as SectionType, name: 'سؤال السرعة', status: 'pending' as SectionStatus, order: 0 },
    { id: 'windows', type: 'windows' as SectionType, name: 'نوافذ المعرفة', status: 'pending' as SectionStatus, order: 1 },
    { id: 'puzzle', type: 'puzzle' as SectionType, name: 'الألغاز', status: 'pending' as SectionStatus, order: 2 },
    { id: 'debate', type: 'debate' as SectionType, name: 'النقاش', status: 'pending' as SectionStatus, order: 3 },
    { id: 'poetic-chase', type: 'poetic-chase' as SectionType, name: 'المطاردة الشعرية', status: 'pending' as SectionStatus, order: 4 },
    { id: 'ask-intelligently', type: 'ask-intelligently' as SectionType, name: 'اسأل بذكاء', status: 'pending' as SectionStatus, order: 5 },
    { id: 'rapid-questions', type: 'rapid-questions' as SectionType, name: 'الرشق السريع', status: 'pending' as SectionStatus, order: 6 },
    { id: 'audience-questions', type: 'audience-questions' as SectionType, name: 'أسئلة الجمهور', status: 'pending' as SectionStatus, order: 7 },
  ],
  currentSection: null as string | null,
}

export const useShowStore = create<ShowState>()(
  broadcast(
    persist(
      temporal(
        (set) => ({
          ...initialState,

          setRightScore: (score) => set({ rightScore: score }),
          setLeftScore: (score) => set({ leftScore: score }),
          addRightScore: (delta) => set((state) => ({ rightScore: state.rightScore + delta })),
          addLeftScore: (delta) => set((state) => ({ leftScore: state.leftScore + delta })),
          setRightsTurn: (isRight) => set({ rightsTurn: isRight }),
          toggleTurn: () => set((state) => ({ rightsTurn: !state.rightsTurn, turned: true })),
          setTurned: (turned) => set({ turned }),
          swapSides: () =>
            set((state) => {
              if (!state.data) return state
              return {
                rightScore: state.leftScore,
                leftScore: state.rightScore,
                rightsTurn: !state.rightsTurn,
                sidesSwapped: !state.sidesSwapped,
                data: {
                  ...state.data,
                  leftTeamName: state.data.rightTeamName,
                  rightTeamName: state.data.leftTeamName,
                },
              }
            }),
          setQuickQuestion: (index) => set({ quickQuestion: index }),
          setAudienceQuestion: (index) => set({ audienceQuestion: index }),
          setData: (data) => set({ data }),
          updateData: (updater) =>
            set((state) => {
              if (!state.data) return state
              return { data: updater(state.data) }
            }),
          reset: () => set(initialState),

          // Section state actions
          setSectionState: (update) =>
            set((state) => ({ sectionState: { ...state.sectionState, ...update } })),
          resetSectionState: () =>
            set({ sectionState: { ...defaultSectionState } }),

          // Section navigation actions
          jumpToSection: (sectionId) =>
            set((state) => {
              const sections = state.sections.map((s) => {
                if (s.id === state.currentSection && s.status === 'active') {
                  return { ...s, status: 'done' as SectionStatus }
                }
                if (s.id === sectionId) {
                  return { ...s, status: 'active' as SectionStatus }
                }
                return s
              })
              return {
                sections,
                currentSection: sectionId,
                sectionState: { ...defaultSectionState },
              }
            }),

          setSectionStatus: (sectionId, status) =>
            set((state) => ({
              sections: state.sections.map((s) =>
                s.id === sectionId ? { ...s, status } : s
              ),
            })),

          nextSection: () =>
            set((state) => {
              const current = state.sections.find((s) => s.id === state.currentSection)
              const nextOrder = current ? current.order + 1 : 0
              const next = state.sections.find((s) => s.order === nextOrder)
              if (!next) return state
              const sections = state.sections.map((s) => {
                if (s.id === state.currentSection && s.status === 'active') {
                  return { ...s, status: 'done' as SectionStatus }
                }
                if (s.id === next.id) {
                  return { ...s, status: 'active' as SectionStatus }
                }
                return s
              })
              return { sections, currentSection: next.id, sectionState: { ...defaultSectionState } }
            }),

          prevSection: () =>
            set((state) => {
              const current = state.sections.find((s) => s.id === state.currentSection)
              if (!current || current.order === 0) return state
              const prev = state.sections.find((s) => s.order === current.order - 1)
              if (!prev) return state
              const sections = state.sections.map((s) => {
                if (s.id === state.currentSection && s.status === 'active') {
                  return { ...s, status: 'done' as SectionStatus }
                }
                if (s.id === prev.id) {
                  return { ...s, status: 'active' as SectionStatus }
                }
                return s
              })
              return { sections, currentSection: prev.id, sectionState: { ...defaultSectionState } }
            }),
        }),
        {
          limit: 50,
          partialize: (state) => {
            const { rightScore, leftScore, rightsTurn, turned, sidesSwapped } = state
            return { rightScore, leftScore, rightsTurn, turned, sidesSwapped }
          },
        }
      ),
      {
        name: 'show-storage', // localStorage key
        storage: createJSONStorage(() => localStorage),
      }
    ),
    'quiz-show-state' // BroadcastChannel name
  )
)
