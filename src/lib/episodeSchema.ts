import { z } from 'zod'

// ─── Question Schema ─────────────────────────────────────────────
export const QuestionSchema = z.object({
  text: z.string().min(1, 'النص مطلوب'),
  answer: z.string().default(''),
  duration: z.number().positive().default(30),
  marks: z.number().min(0).default(0),
  file: z.string().optional(),
  isImage: z.boolean().optional(),
})

export type Question = z.infer<typeof QuestionSchema>

// ─── Quick Question Set Schema ───────────────────────────────────
export const QuickQuestionSetSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  questions: z.array(QuestionSchema).min(1, 'يجب إضافة سؤال واحد على الأقل'),
})

export type QuickQuestionSet = z.infer<typeof QuickQuestionSetSchema>

// ─── Windows Schema ──────────────────────────────────────────────
const WindowsCategorySchema = z.array(QuestionSchema).min(1).max(2)

export const WindowsSchema = z.object({
  naturalSciences: WindowsCategorySchema,
  humanSciences: WindowsCategorySchema,
  misc: WindowsCategorySchema,
  arts: WindowsCategorySchema,
  religion: WindowsCategorySchema,
})

export type WindowsData = z.infer<typeof WindowsSchema>

// Utility type for dynamic category access in components
export type WindowsCategoryKey = keyof WindowsData

// ─── Episode Parts Schema ────────────────────────────────────────
export const EpisodePartsSchema = z.object({
  speedQuestions: z.array(QuestionSchema).min(1),
  debate: QuestionSchema,
  puzzles: z.array(QuestionSchema).min(1),
  windows: WindowsSchema,
  audienceQuestions: z.array(QuestionSchema),
  quickQuestions: z.array(QuickQuestionSetSchema),
})

export type EpisodeParts = z.infer<typeof EpisodePartsSchema>

// ─── Episode Settings Schema ─────────────────────────────────────
export const EpisodeSettingsSchema = z.object({
  puzzleDuration: z.number().positive().default(90),
  debateDuration: z.number().positive().default(60),
  rapidQuestionsDuration: z.number().positive().default(60),
  poeticChaseDuration: z.number().positive().default(100),
  askIntelligentlyDuration: z.number().positive().default(120),
})

export type EpisodeSettings = z.infer<typeof EpisodeSettingsSchema>

// ─── Full Episode Schema ─────────────────────────────────────────
export const EpisodeSchema = z.object({
  version: z.literal(1).default(1),
  title: z.string().optional(),
  date: z.string().optional(),
  leftTeamName: z.string().min(1, 'اسم الفريق الأيسر مطلوب'),
  rightTeamName: z.string().min(1, 'اسم الفريق الأيمن مطلوب'),
  settings: EpisodeSettingsSchema.optional(),
  parts: EpisodePartsSchema,
})

export type Episode = z.infer<typeof EpisodeSchema>

// ─── Validation Utility ──────────────────────────────────────────
export function validateEpisode(data: unknown): {
  success: boolean
  data?: Episode
  errors?: Record<string, string[]>
} {
  const result = EpisodeSchema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  const flat = result.error.flatten()
  const errors: Record<string, string[]> = { ...flat.fieldErrors }
  if (flat.formErrors.length > 0) errors._form = flat.formErrors
  return { success: false, errors }
}

// ─── Factory Functions ───────────────────────────────────────────

/** Creates a minimal blank episode with empty arrays and default settings */
export function createBlankEpisode(): Episode {
  return {
    version: 1,
    title: '',
    date: '',
    leftTeamName: '',
    rightTeamName: '',
    settings: {
      puzzleDuration: 90,
      debateDuration: 60,
      rapidQuestionsDuration: 60,
      poeticChaseDuration: 100,
      askIntelligentlyDuration: 120,
    },
    parts: {
      speedQuestions: [],
      debate: { text: '', answer: '', duration: 60, marks: 0 },
      puzzles: [],
      windows: {
        naturalSciences: [],
        humanSciences: [],
        misc: [],
        arts: [],
        religion: [],
      },
      audienceQuestions: [],
      quickQuestions: [],
    },
  }
}

const placeholderQuestion = (i: number, duration = 30, marks = 0): Question => ({
  text: `سؤال ${i}`,
  answer: '',
  duration,
  marks,
})

/** Creates a template episode pre-filled with placeholder structure */
export function createTemplateEpisode(): Episode {
  return {
    version: 1,
    title: 'حلقة جديدة',
    date: new Date().toISOString().split('T')[0],
    leftTeamName: 'الفريق الأيسر',
    rightTeamName: 'الفريق الأيمن',
    settings: {
      puzzleDuration: 90,
      debateDuration: 60,
      rapidQuestionsDuration: 60,
      poeticChaseDuration: 100,
      askIntelligentlyDuration: 120,
    },
    parts: {
      speedQuestions: [
        placeholderQuestion(1),
        placeholderQuestion(2),
        placeholderQuestion(3),
      ],
      debate: { text: 'موضوع النقاش', answer: '', duration: 60, marks: 0 },
      puzzles: [placeholderQuestion(1, 90)],
      windows: {
        naturalSciences: [placeholderQuestion(1, 30, 8), placeholderQuestion(2, 30, 8)],
        humanSciences: [placeholderQuestion(1, 30, 8), placeholderQuestion(2, 30, 8)],
        misc: [placeholderQuestion(1, 30, 8), placeholderQuestion(2, 30, 8)],
        arts: [placeholderQuestion(1, 30, 8), placeholderQuestion(2, 30, 8)],
        religion: [placeholderQuestion(1, 30, 8), placeholderQuestion(2, 30, 8)],
      },
      audienceQuestions: [],
      quickQuestions: [
        {
          title: 'ما؟',
          questions: Array.from({ length: 20 }, (_, i) => placeholderQuestion(i + 1, 45, 2)),
        },
      ],
    },
  }
}
