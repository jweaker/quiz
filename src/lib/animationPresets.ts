import type { Transition, Variants } from 'motion/react'

/**
 * Energetic easing curves for broadcast-quality animations.
 * Based on Material Design emphasized curves with higher energy
 * for the "Who Wants to Be a Millionaire" tone.
 */
export const energeticEasing = {
  /** Sharp, punchy (score flash, entrance) */
  emphasized: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Quick exit (wipe out) */
  sharpExit: [0.4, 0, 1, 1] as [number, number, number, number],
  /** Bouncy entrance (optional for celebrations) */
  bounce: [0.68, -0.55, 0.27, 1.55] as [number, number, number, number],
  /** Standard responsive (UI feedback) */
  easeOut: 'easeOut' as const,
}

/**
 * Named transition presets for consistent animation timing.
 * All durations within 150-500ms range per NN/g research.
 */
export const animationPresets = {
  /** 150ms, button press / toggle */
  quickFeedback: { duration: 0.15, ease: 'easeOut' } satisfies Transition,
  /** 300ms, items appearing */
  entrance: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** 400ms, cinematic wipe between sections */
  sectionWipe: { duration: 0.4, ease: 'easeInOut' } satisfies Transition,
  /** 500ms, score celebration */
  scoreFlash: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } satisfies Transition,
  /** 30ms between letters for typewriter */
  typewriterStagger: { staggerChildren: 0.03 },
}

/**
 * Motion variants for letter-by-letter typewriter text reveal.
 * Letters slide up from below with opacity fade.
 */
export const typewriterVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.2,
      },
    },
  } satisfies Variants,
  letter: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } satisfies Variants,
}

type WipeDirection = 'left' | 'right' | 'up' | 'down'

/**
 * Generate wipe transition variants for a given direction.
 * Enter: new content slides in from the given direction.
 * Exit: old content slides out in the opposite direction.
 */
export function wipeVariants(direction: WipeDirection): Variants {
  const enterX = direction === 'left' ? '100%' : direction === 'right' ? '-100%' : 0
  const enterY = direction === 'up' ? '100%' : direction === 'down' ? '-100%' : 0
  const exitX = direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0
  const exitY = direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0

  return {
    enter: { x: enterX, y: enterY },
    center: { x: 0, y: 0 },
    exit: { x: exitX, y: exitY },
  }
}

/**
 * Background gradients per section type for atmospheric changes.
 * Each gradient creates a distinct mood on the audience display.
 */
const sectionBackgrounds: Record<string, string> = {
  idle: 'radial-gradient(circle, rgba(89,133,227,1) 0%, rgba(20,37,74,1) 100%)',
  default: 'radial-gradient(circle, rgba(89,133,227,1) 0%, rgba(20,37,74,1) 100%)',
  speedQuestions: 'radial-gradient(circle, rgba(30,100,200,1) 0%, rgba(10,25,60,1) 100%)',
  minefield: 'radial-gradient(circle, rgba(60,10,10,1) 0%, rgba(15,5,5,1) 100%)',
  debate: 'radial-gradient(circle, rgba(140,80,20,1) 0%, rgba(40,20,5,1) 100%)',
  windows: 'radial-gradient(circle, rgba(20,100,80,1) 0%, rgba(5,30,25,1) 100%)',
  puzzles: 'radial-gradient(circle, rgba(100,50,150,1) 0%, rgba(25,10,40,1) 100%)',
  poeticChase: 'radial-gradient(circle, rgba(150,120,50,1) 0%, rgba(40,30,10,1) 100%)',
  audienceQuestions: 'radial-gradient(circle, rgba(50,120,100,1) 0%, rgba(10,30,25,1) 100%)',
  quickQuestions: 'radial-gradient(circle, rgba(70,100,180,1) 0%, rgba(15,25,50,1) 100%)',
}

/**
 * Get the background gradient for a given section type.
 * Falls back to the default blue gradient for unknown sections.
 */
export function getSectionBackground(sectionType: string): string {
  return sectionBackgrounds[sectionType] ?? sectionBackgrounds['default']!
}
