// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/src/data/japanese-exercise-series.ts
// Description: Japanese longevity exercise series data with detailed steps and timings
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import { ExerciseSeries, ExerciseStep } from '@/types/profile.types';
import { BREATHING_PATTERNS } from './breathing-patterns';

/**
 * Calculate total duration for an exercise series
 */
function calculateTotalDuration(steps: ExerciseStep[], warmup = 0, cooldown = 0): number {
  const stepsDuration = steps.reduce((total, step) =>
    total + step.durationMinutes + step.restDurationMinutes, 0
  );
  return warmup + stepsDuration + cooldown;
}

/**
 * Rajio Taiso (Radio Calisthenics) Exercise Series
 * Traditional Japanese morning exercise routine
 */
export const RAJIO_TAISO_SERIES: ExerciseSeries = {
  id: 'rajio-taiso-series',
  name: 'Rajio Taiso Complete Series',
  description: 'Traditional Japanese radio calisthenics - energizing morning routine',
  warmupDurationMinutes: 0.5, // 30 seconds
  cooldownDurationMinutes: 0.5, // 30 seconds
  steps: [
    {
      id: 'neck-arm-stretch',
      exerciseId: 'neck-arm-stretch',
      name: 'Neck and Arm Stretches',
      description: 'Gentle neck rotations and arm stretches',
      durationMinutes: 1,
      restDurationMinutes: 0.25, // 15 seconds
      instructions: 'Slowly rotate neck, stretch arms up and out',
      animation: { pack: 'rajio-taiso.neck-arm-stretch', version: '0.1.0-draft.1' }
    },
    {
      id: 'arm-swings',
      exerciseId: 'arm-swings',
      name: 'Arm Swings',
      description: 'Radio Taiso movement 2 — cross-body arm swings with knee bounce',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Swing arms across the front and out to the sides while gently bending and straightening knees with heel raises',
      animation: { pack: 'rajio-taiso.arm-swings', version: '^1' }
    },
    {
      id: 'chest-expansion',
      exerciseId: 'chest-expansion',
      name: 'Chest Expansion',
      description: 'Open chest and expand lungs',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Bring arms back to open chest, breathe deeply',
      animation: { pack: 'rajio-taiso.chest-expansion', version: '0.1.0-draft.1' }
    },
    {
      id: 'side-bends',
      exerciseId: 'side-bends',
      name: 'Side Bends',
      description: 'Lateral trunk flexibility',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Bend to each side, reach arm overhead',
      animation: { pack: 'rajio-taiso.side-bends', version: '0.1.0-draft.1' }
    },
    {
      id: 'trunk-twists',
      exerciseId: 'trunk-twists',
      name: 'Trunk Twists',
      description: 'Spinal rotation movements',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
      instructions: 'Rotate torso left and right with arms extended',
      animation: { pack: 'rajio-taiso.trunk-twists', version: '0.1.0-draft.1' }
    },
    {
      id: 'leg-swings',
      exerciseId: 'leg-swings',
      name: 'Leg Swings',
      description: 'Dynamic leg movements',
      durationMinutes: 1,
      restDurationMinutes: 0,
      instructions: 'Swing legs forward and back, side to side',
      animation: { pack: 'rajio-taiso.leg-swings', version: '^1' }
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Tai Chi Morning Flow Exercise Series
 * Gentle flowing movements for balance and energy
 */
export const TAI_CHI_MORNING_SERIES: ExerciseSeries = {
  id: 'tai-chi-morning-series',
  name: 'Tai Chi Morning Flow',
  description: 'Gentle flowing movements for balance, flexibility, and inner calm',
  warmupDurationMinutes: 1,
  cooldownDurationMinutes: 1,
  steps: [
    {
      id: 'beginning-stance',
      name: 'Beginning Stance',
      description: 'Center and ground yourself',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      instructions: 'Stand feet shoulder-width apart, breathe deeply',
      cueId: 'tai-chi.beginning-stance',
      animation: { pack: 'tai-chi.beginning-stance', version: '^1' }
    },
    {
      id: 'raise-arms',
      name: 'Raise Arms',
      description: 'Slow arm raising movement',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      instructions: 'Slowly raise arms to shoulder height',
      cueId: 'tai-chi.raise-arms',
      animation: { pack: 'tai-chi.raise-arms', version: '^1' }
    },
    {
      id: 'wave-hands',
      name: 'Wave Hands Like Clouds',
      description: 'Flowing horizontal arm movements',
      durationMinutes: 3,
      restDurationMinutes: 0.5,
      instructions: 'Move arms in smooth horizontal waves',
      cueId: 'tai-chi.wave-hands',
      animation: { pack: 'tai-chi.wave-hands', version: '^1' }
    },
    {
      id: 'single-whip',
      name: 'Single Whip',
      description: 'Classic tai chi movement',
      durationMinutes: 3,
      restDurationMinutes: 0.5,
      instructions: 'Extend one arm, turn body slowly',
      cueId: 'tai-chi.single-whip',
      animation: { pack: 'tai-chi.single-whip', version: '^1' }
    },
    {
      id: 'embrace-tiger',
      name: 'Embrace Tiger, Return to Mountain',
      description: 'Circular gathering movement',
      durationMinutes: 3,
      restDurationMinutes: 0,
      instructions: 'Large circular arm movements, gather energy',
      cueId: 'tai-chi.embrace-tiger',
      animation: { pack: 'tai-chi.embrace-tiger', version: '^1' }
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Shinrin-yoku (Forest Bathing) Meditation Series
 * Mindful nature connection practice
 */
export const SHINRIN_YOKU_SERIES: ExerciseSeries = {
  id: 'shinrin-yoku-series',
  name: 'Shinrin-yoku Practice',
  description: 'Forest bathing meditation - mindful connection with nature',
  warmupDurationMinutes: 2,
  cooldownDurationMinutes: 2,
  breathingPattern: BREATHING_PATTERNS.DEEP_BREATHING,
  backgroundAnimation: 'forest-leaves',
  steps: [
    {
      id: 'sensory-awakening',
      name: 'Sensory Awakening',
      description: 'Open all five senses',
      durationMinutes: 4,
      restDurationMinutes: 1,
      instructions: 'Notice what you see, hear, smell, feel, taste',
      cueId: 'shinrin-yoku.sensory-awakening',
      animation: { pack: 'shinrin-yoku.sensory-awakening', version: '^1' }
    },
    {
      id: 'mindful-breathing',
      name: 'Mindful Breathing',
      description: 'Breathe with the forest rhythm',
      durationMinutes: 5,
      restDurationMinutes: 1,
      instructions: 'Breathe deeply, imagine breathing with trees',
      cueId: 'shinrin-yoku.mindful-breathing',
      animation: { pack: 'shinrin-yoku.mindful-breathing', version: '^1' }
    },
    {
      id: 'tree-connection',
      name: 'Tree Connection',
      description: 'Connect with a specific tree or plant',
      durationMinutes: 6,
      restDurationMinutes: 1,
      instructions: 'Focus on one tree, feel its presence and energy',
      cueId: 'shinrin-yoku.tree-connection',
      animation: { pack: 'shinrin-yoku.tree-connection', version: '^1' }
    },
    {
      id: 'gratitude-reflection',
      name: 'Gratitude Reflection',
      description: 'Express gratitude to nature',
      durationMinutes: 4,
      restDurationMinutes: 0,
      instructions: 'Silently thank nature for its gifts and wisdom',
      cueId: 'shinrin-yoku.gratitude-reflection',
      animation: { pack: 'shinrin-yoku.gratitude-reflection', version: '^1' }
    }
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  }
};

/**
 * Ikigai Reflection Series
 * Purpose, strength, and daily intention prompts
 */
export const IKIGAI_REFLECTION_SERIES: ExerciseSeries = {
  id: 'ikigai-reflection-series',
  name: 'Ikigai Purpose Reflection',
  description: 'Guided reflection on energy, strengths, gratitude, and daily intention',
  warmupDurationMinutes: 0.5,
  cooldownDurationMinutes: 0.5,
  steps: [
    {
      id: 'ikigai-breath-settle',
      exerciseId: 'mindful-breathing',
      name: 'Settle & Breathe',
      description: 'Quiet the mind before reflecting',
      durationMinutes: 1.5,
      restDurationMinutes: 0.25,
    },
    {
      id: 'ikigai-purpose',
      exerciseId: 'ikigai-purpose-prompts',
      name: 'Purpose & Intention',
      description: 'Reflect on what energizes you and choose one meaningful action',
      durationMinutes: 3,
      restDurationMinutes: 0.25,
    },
    {
      id: 'ikigai-gratitude',
      exerciseId: 'gratitude-reflection',
      name: 'Gratitude Closing',
      description: 'Close with quiet appreciation',
      durationMinutes: 2,
      restDurationMinutes: 0,
    },
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  },
};

/**
 * Zazen Sitting Meditation Series
 * Upright Zen posture and breath-counting stillness
 */
export const ZAZEN_SITTING_SERIES: ExerciseSeries = {
  id: 'zazen-sitting-series',
  name: 'Zazen Seated Stillness',
  description: 'Traditional Zen posture alignment, breath counting, and silent sitting',
  warmupDurationMinutes: 0.5,
  cooldownDurationMinutes: 0.5,
  steps: [
    {
      id: 'zazen-posture',
      exerciseId: 'zazen-posture-breath',
      name: 'Posture & Breath Counting',
      description: 'Settle upright and count exhales 1 to 10',
      durationMinutes: 5,
      restDurationMinutes: 0,
    },
    {
      id: 'zazen-sitting',
      exerciseId: 'zazen-silent-sitting',
      name: 'Silent Seated Stillness',
      description: 'Open-awareness sitting until the closing bell',
      durationMinutes: 10,
      restDurationMinutes: 0,
    },
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  },
};

/**
 * Desk Reset & Posture Mobility (Western standard)
 */
export const DESK_RESET_SERIES: ExerciseSeries = {
  id: 'desk-reset-series',
  name: 'Desk Reset & Posture Mobility',
  description: 'Standard posture & mobility reset for neck, upper back, chest, and hips',
  warmupDurationMinutes: 0.25,
  cooldownDurationMinutes: 0.25,
  steps: [
    {
      id: 'desk-chin-tucks',
      exerciseId: 'chin-tucks',
      name: 'Chin Tucks',
      description: 'Release forward-head neck tension',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
    },
    {
      id: 'desk-thoracic-ext',
      exerciseId: 'seated-thoracic-extension',
      name: 'Seated Thoracic Extension',
      description: 'Open upper back over chair',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
    },
    {
      id: 'desk-chest-open',
      exerciseId: 'chest-expansion',
      name: 'Chest Expansion',
      description: 'Open chest and front shoulders',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
    },
    {
      id: 'desk-side-bends',
      exerciseId: 'side-bends',
      name: 'Side Bends',
      description: 'Lateral spine mobility',
      durationMinutes: 1,
      restDurationMinutes: 0.25,
    },
    {
      id: 'desk-leg-swings',
      exerciseId: 'leg-swings',
      name: 'Leg Swings',
      description: 'Loosen tight hip flexors',
      durationMinutes: 1,
      restDurationMinutes: 0,
    },
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  },
};

/**
 * Core AMRAP & Calisthenics Interval (2 min Sit-Ups + 30s Rest × 2 + Plank)
 */
export const CORE_AMRAP_SERIES: ExerciseSeries = {
  id: 'core-amrap-series',
  name: 'Core AMRAP & Calisthenics',
  description: 'Timed 2-minute sit-up intervals with 30s rest, jumping jacks, and plank hold',
  warmupDurationMinutes: 0.5,
  cooldownDurationMinutes: 0.5,
  steps: [
    {
      id: 'core-warmup-jacks',
      exerciseId: 'jumping-jacks',
      name: 'Jumping Jacks Warm-Up',
      description: '20 jumping jacks to raise heart rate',
      durationMinutes: 0.75,
      restDurationMinutes: 0.25,
      mode: 'reps',
      targetReps: 20,
    },
    {
      id: 'core-situps-round-1',
      exerciseId: 'situps',
      name: 'Sit-Ups (AMRAP Round 1)',
      description: 'As many quality sit-ups as possible in 2 minutes',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      mode: 'timed',
    },
    {
      id: 'core-situps-round-2',
      exerciseId: 'situps',
      name: 'Sit-Ups (AMRAP Round 2)',
      description: 'Second 2-minute timed sit-up block',
      durationMinutes: 2,
      restDurationMinutes: 0.5,
      mode: 'timed',
    },
    {
      id: 'core-plank-finish',
      exerciseId: 'plank-hold',
      name: 'Forearm Plank Hold',
      description: '60-second isometric core finisher',
      durationMinutes: 1,
      restDurationMinutes: 0,
      mode: 'hold',
    },
  ],
  get totalDurationMinutes() {
    return calculateTotalDuration(this.steps, this.warmupDurationMinutes, this.cooldownDurationMinutes);
  },
};

/**
 * Collection of all built-in exercise & mindfulness series
 */
export const JAPANESE_EXERCISE_SERIES = {
  RAJIO_TAISO: RAJIO_TAISO_SERIES,
  TAI_CHI_MORNING: TAI_CHI_MORNING_SERIES,
  SHINRIN_YOKU: SHINRIN_YOKU_SERIES,
  IKIGAI_REFLECTION: IKIGAI_REFLECTION_SERIES,
  ZAZEN_SITTING: ZAZEN_SITTING_SERIES,
  DESK_RESET: DESK_RESET_SERIES,
  CORE_AMRAP: CORE_AMRAP_SERIES,
} as const;

/**
 * Get all exercise series as an array
 */
export function getAllJapaneseExerciseSeries(): ExerciseSeries[] {
  return Object.values(JAPANESE_EXERCISE_SERIES);
}

/**
 * Get exercise series by ID
 */
export function getExerciseSeriesById(id: string): ExerciseSeries | undefined {
  return Object.values(JAPANESE_EXERCISE_SERIES).find(series => series.id === id);
}