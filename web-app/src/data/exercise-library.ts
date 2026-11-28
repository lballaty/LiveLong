// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/web-app/src/data/exercise-library.ts
// Description: Canonical Exercise Library with neutral movement/practice slugs, iteration flow, and bound audio/animation media
// Author: Libor Ballaty <liborballaty@gmail.com>, with Gemini 4 Hydrogen (livelong-lead-b81b4d)
// Created: 2026-11-26

import {
  ExerciseCategory,
  ExerciseDefinition,
  SeriesStep,
} from '@/types/unified-profile.types';

export const EXERCISE_LIBRARY: ExerciseDefinition[] = [
  // --- Mobility & Calisthenics (Eastern + Western) ---
  {
    id: 'neck-arm-stretch',
    name: 'Neck and Arm Stretches',
    description: 'Gentle neck rotations and overhead arm stretches',
    flow: 'Stand or sit tall → slowly roll neck side to side → reach both arms overhead and lower with control',
    category: 'mobility',
    tags: ['mobility', 'warmup', 'rajio-taiso', 'desk-reset'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 15,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'rajio-taiso.neck-arm-stretch', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.neck-arm-stretch',
        defaultVoiceScript: 'Slowly rotate your neck, then stretch your arms up and out.',
      },
    },
    isDefault: true,
  },
  {
    id: 'arm-swings',
    name: 'Arm Swings',
    description: 'Cross-body arm swings with gentle knee bounce and heel raises',
    flow: 'Stand hip-width → swing arms across front and out to sides → bend knees gently and rise onto toes',
    category: 'mobility',
    tags: ['mobility', 'warmup', 'rajio-taiso', 'shoulders'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 15,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'rajio-taiso.arm-swings', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.arm-swings',
        defaultVoiceScript: 'Swing your arms across the front and out to the sides with a gentle knee bounce.',
      },
    },
    isDefault: true,
  },
  {
    id: 'chest-expansion',
    name: 'Chest Expansion',
    description: 'Open chest and expand lungs',
    flow: 'Inhale deeply → draw arms wide and back to open chest → exhale and relax arms forward',
    category: 'mobility',
    tags: ['mobility', 'posture', 'rajio-taiso', 'desk-reset'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 15,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'rajio-taiso.chest-expansion', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.chest-expansion',
        defaultVoiceScript: 'Bring your arms wide and back to open your chest and breathe deeply.',
      },
    },
    isDefault: true,
  },
  {
    id: 'side-bends',
    name: 'Side Bends',
    description: 'Lateral trunk flexibility',
    flow: 'Reach one arm overhead → bend smoothly to the opposite side → return upright and switch sides',
    category: 'mobility',
    tags: ['mobility', 'spine', 'rajio-taiso', 'desk-reset'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 15,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'rajio-taiso.side-bends', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.side-bends',
        defaultVoiceScript: 'Reach one arm overhead and bend smoothly to each side.',
      },
    },
    isDefault: true,
  },
  {
    id: 'trunk-twists',
    name: 'Trunk Twists',
    description: 'Spinal rotation movements',
    flow: 'Keep hips steady → rotate torso smoothly left → pass through center → rotate right',
    category: 'mobility',
    tags: ['mobility', 'spine', 'rajio-taiso'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 15,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'rajio-taiso.trunk-twists', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.trunk-twists',
        defaultVoiceScript: 'Rotate your torso smoothly left and right with relaxed arms.',
      },
    },
    isDefault: true,
  },
  {
    id: 'leg-swings',
    name: 'Leg Swings',
    description: 'Chair-supported dynamic leg lifts for hip mobility and balance',
    flow: 'Hold chair back lightly → raise leg gently back twice and lift to the side twice → alternate legs',
    category: 'balance',
    tags: ['mobility', 'balance', 'hips', 'rajio-taiso', 'western'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 0,
    supportedVariants: ['standing'],
    media: {
      animation: { pack: 'rajio-taiso.leg-swings', version: '0.1.0-draft.2', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.leg-swings',
        defaultVoiceScript: 'Hold a chair lightly for balance and lift one leg back and to the side, then alternate.',
      },
    },
    isDefault: true,
  },
  {
    id: 'chin-tucks',
    name: 'Chin Tucks',
    description: 'Cervical posture reset for forward-head tension',
    flow: 'Look straight ahead → glide chin straight back without tilting → hold 2 seconds → relax',
    category: 'mobility',
    tags: ['mobility', 'posture', 'western', 'desk-reset'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 10,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'mobility.chin-tucks', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.chin-tucks',
        defaultVoiceScript: 'Gently glide your chin straight back to lengthen the back of your neck, then relax.',
      },
    },
    isDefault: true,
  },
  {
    id: 'seated-thoracic-extension',
    name: 'Seated Thoracic Extension',
    description: 'Upper-back opener over chair back',
    flow: 'Interlace fingers behind head → gently arch upper back over chair → lift chest and inhale → return upright',
    category: 'mobility',
    tags: ['mobility', 'posture', 'western', 'desk-reset'],
    defaultMode: 'timed',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 10,
    supportedVariants: ['chair', 'standing'],
    media: {
      animation: { pack: 'mobility.thoracic-extension', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.thoracic-extension',
        defaultVoiceScript: 'Hands behind your head, gently arch your upper back and lift your chest toward the ceiling.',
      },
    },
    isDefault: true,
  },

  // --- Western Strength & Cardio ---
  {
    id: 'situps',
    name: 'Sit-Ups',
    description: 'Core flexion repetitions (timed AMRAP or rep-based)',
    flow: 'Lie supine with knees bent → curl torso smoothly up toward knees → lower shoulder blades with control',
    category: 'strength',
    tags: ['strength', 'core', 'calisthenics', 'western', 'amrap'],
    defaultMode: 'timed',
    defaultDurationSeconds: 120,
    defaultRestSeconds: 30,
    defaultTargetReps: 20,
    supportedVariants: ['standing'],
    media: {
      animation: { pack: 'strength.situps', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.situps',
        defaultVoiceScript: 'Begin sit-ups at a steady, strong pace. Keep your core engaged.',
      },
    },
    isDefault: true,
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    description: 'Full-body cardiovascular jumping iteration',
    flow: 'Start feet together, arms down → jump feet wide while swinging arms overhead → jump back to start',
    category: 'cardio',
    tags: ['cardio', 'calisthenics', 'warmup', 'western', 'hiit'],
    defaultMode: 'reps',
    defaultDurationSeconds: 45,
    defaultRestSeconds: 15,
    defaultTargetReps: 20,
    supportedVariants: ['standing'],
    media: {
      animation: { pack: 'cardio.jumping-jacks', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.jumping-jacks',
        defaultVoiceScript: 'Jumping jacks: jump feet wide and swing arms overhead, then return cleanly.',
      },
    },
    isDefault: true,
  },
  {
    id: 'plank-hold',
    name: 'Forearm Plank Hold',
    description: 'Isometric core and shoulder stability hold',
    flow: 'Forearms on mat, elbows under shoulders → brace core and glutes in a straight line → breathe steadily',
    category: 'strength',
    tags: ['strength', 'core', 'isometric', 'western'],
    defaultMode: 'hold',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 20,
    supportedVariants: ['standing'],
    media: {
      animation: { pack: 'strength.plank-hold', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.plank-hold',
        defaultVoiceScript: 'Hold a straight-line forearm plank, bracing your core and breathing steadily.',
      },
    },
    isDefault: true,
  },
  {
    id: 'sit-to-stand',
    name: 'Sit-to-Stand Chair Squats',
    description: 'Functional lower-body strength from a sturdy chair',
    flow: 'Sit near front edge of chair → drive through heels to stand tall → lower slowly back to tap chair',
    category: 'strength',
    tags: ['strength', 'legs', 'functional', 'western'],
    defaultMode: 'reps',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 20,
    defaultTargetReps: 12,
    supportedVariants: ['chair', 'standing'],
    media: {
      animation: { pack: 'strength.sit-to-stand', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.sit-to-stand',
        defaultVoiceScript: 'Stand up smoothly from your chair through your heels, then lower with control.',
      },
    },
    isDefault: true,
  },
  {
    id: 'incline-pushups',
    name: 'Incline / Wall Push-Ups',
    description: 'Upper-body push strength against a wall or sturdy counter',
    flow: 'Hands shoulder-width on wall or counter → lower chest with elbows at 45 degrees → press back to straight arms',
    category: 'strength',
    tags: ['strength', 'upper-body', 'calisthenics', 'western'],
    defaultMode: 'reps',
    defaultDurationSeconds: 60,
    defaultRestSeconds: 20,
    defaultTargetReps: 12,
    supportedVariants: ['standing'],
    media: {
      animation: { pack: 'strength.incline-pushups', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'exercise.incline-pushups',
        defaultVoiceScript: 'Keep a straight body line, lower your chest toward the wall or counter, and press back.',
      },
    },
    isDefault: true,
  },

  // --- Tai Chi Movements ---
  {
    id: 'beginning-stance',
    name: 'Beginning Stance',
    description: 'Center and ground posture',
    flow: 'Stand feet shoulder-width → soften knees → lengthen spine and settle breath',
    category: 'balance',
    tags: ['balance', 'tai-chi', 'grounding'],
    defaultMode: 'hold',
    defaultDurationSeconds: 120,
    defaultRestSeconds: 30,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'tai-chi.beginning-stance', version: '^1', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'tai-chi.beginning-stance',
        defaultVoiceScript: 'Stand feet shoulder-width apart, soften your knees, and breathe deeply.',
      },
    },
    isDefault: true,
  },
  {
    id: 'raise-arms',
    name: 'Raise Arms',
    description: 'Slow flowing arm raise and lower',
    flow: 'Inhale and float arms up to shoulder height → exhale and lower hands smoothly toward hips',
    category: 'mobility',
    tags: ['mobility', 'tai-chi', 'flow'],
    defaultMode: 'timed',
    defaultDurationSeconds: 120,
    defaultRestSeconds: 30,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'tai-chi.raise-arms', version: '^1', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'tai-chi.raise-arms',
        defaultVoiceScript: 'Slowly float your arms to shoulder height, then lower with your exhale.',
      },
    },
    isDefault: true,
  },
  {
    id: 'wave-hands',
    name: 'Wave Hands Like Clouds',
    description: 'Flowing horizontal arm and weight-shift movement',
    flow: 'Shift weight left while top hand sweeps across → switch hands → shift weight right smoothly',
    category: 'balance',
    tags: ['balance', 'tai-chi', 'flow'],
    defaultMode: 'timed',
    defaultDurationSeconds: 180,
    defaultRestSeconds: 30,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'tai-chi.wave-hands', version: '^1', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'tai-chi.wave-hands',
        defaultVoiceScript: 'Move your arms in smooth horizontal waves as you shift weight side to side.',
      },
    },
    isDefault: true,
  },
  {
    id: 'single-whip',
    name: 'Single Whip',
    description: 'Classic tai chi open-stance reach',
    flow: 'Form soft hook hand → step wide → extend opposite palm forward and turn waist gently',
    category: 'balance',
    tags: ['balance', 'tai-chi', 'flow'],
    defaultMode: 'timed',
    defaultDurationSeconds: 180,
    defaultRestSeconds: 30,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'tai-chi.single-whip', version: '^1', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'tai-chi.single-whip',
        defaultVoiceScript: 'Extend one arm smoothly and turn your body with calm control.',
      },
    },
    isDefault: true,
  },
  {
    id: 'embrace-tiger',
    name: 'Embrace Tiger, Return to Mountain',
    description: 'Circular gathering and grounding movement',
    flow: 'Sweep arms in a wide gathering circle → draw palms to center → settle breath',
    category: 'balance',
    tags: ['balance', 'tai-chi', 'cooldown'],
    defaultMode: 'timed',
    defaultDurationSeconds: 180,
    defaultRestSeconds: 0,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'tai-chi.embrace-tiger', version: '^1', fallbackType: 'robot-poc' },
      audio: {
        cueId: 'tai-chi.embrace-tiger',
        defaultVoiceScript: 'Make large circular arm movements and gather calm energy back to center.',
      },
    },
    isDefault: true,
  },

  // --- Mindfulness, Forest Bathing, Ikigai & Zazen ---
  {
    id: 'sensory-awakening',
    name: 'Sensory Awakening',
    description: 'Open all five senses to your surroundings',
    flow: 'Pause and notice sights → listen to distant and near sounds → notice air, scent, and contact',
    category: 'mindfulness',
    tags: ['mindfulness', 'shinrin-yoku', 'sensory'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 240,
    defaultRestSeconds: 60,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'shinrin-yoku.sensory-awakening', version: '^1', fallbackType: 'stillness' },
      audio: {
        cueId: 'shinrin-yoku.sensory-awakening',
        defaultVoiceScript: 'Notice what you see, hear, smell, feel, and taste around you.',
      },
    },
    isDefault: true,
  },
  {
    id: 'mindful-breathing',
    name: 'Mindful Breathing',
    description: 'Slow natural breath awareness',
    flow: 'Inhale gently without forcing → feel chest and belly soften → exhale slowly',
    category: 'breathing',
    tags: ['breathing', 'mindfulness', 'shinrin-yoku'],
    defaultMode: 'breath',
    defaultDurationSeconds: 300,
    defaultRestSeconds: 60,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'shinrin-yoku.mindful-breathing', version: '^1', fallbackType: 'breathing' },
      audio: {
        cueId: 'shinrin-yoku.mindful-breathing',
        defaultVoiceScript: 'Breathe deeply and slowly, resting attention on each natural breath.',
      },
    },
    isDefault: true,
  },
  {
    id: 'tree-connection',
    name: 'Nature & Grounding Focus',
    description: 'Steady attention on a natural anchor or tree',
    flow: 'Rest soft gaze on a tree or natural object → notice texture, light, and stillness',
    category: 'mindfulness',
    tags: ['mindfulness', 'shinrin-yoku'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 360,
    defaultRestSeconds: 60,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'shinrin-yoku.tree-connection', version: '^1', fallbackType: 'stillness' },
      audio: {
        cueId: 'shinrin-yoku.tree-connection',
        defaultVoiceScript: 'Focus gently on one tree or natural detail and feel its steady presence.',
      },
    },
    isDefault: true,
  },
  {
    id: 'gratitude-reflection',
    name: 'Gratitude Reflection',
    description: 'Quiet appreciation and closing reflection',
    flow: 'Bring to mind one thing you appreciate → hold it in quiet awareness → exhale with gratitude',
    category: 'mindfulness',
    tags: ['mindfulness', 'shinrin-yoku', 'ikigai', 'reflection'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 240,
    defaultRestSeconds: 0,
    supportedVariants: ['standing', 'chair'],
    media: {
      animation: { pack: 'shinrin-yoku.gratitude-reflection', version: '^1', fallbackType: 'stillness' },
      audio: {
        cueId: 'shinrin-yoku.gratitude-reflection',
        defaultVoiceScript: 'Take a quiet moment to acknowledge what you are grateful for today.',
      },
    },
    isDefault: true,
  },
  {
    id: 'ikigai-purpose-prompts',
    name: 'Purpose & Intention Reflection',
    description: 'Guided reflection on what matters, what energizes you, and one clear intention',
    flow: 'Reflect on what gives energy → recall a strength you enjoy using → choose one meaningful action for today',
    category: 'mindfulness',
    tags: ['mindfulness', 'ikigai', 'reflection'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 180,
    defaultRestSeconds: 15,
    supportedVariants: ['chair', 'standing'],
    media: {
      animation: { pack: 'mindfulness.ikigai-purpose', fallbackType: 'stillness' },
      audio: {
        cueId: 'ikigai.purpose-prompts',
        defaultVoiceScript: 'Reflect gently on what energizes you and choose one purposeful intention for today.',
      },
    },
    isDefault: true,
  },
  {
    id: 'zazen-posture-breath',
    name: 'Seated Posture & Breath Counting',
    description: 'Upright seated alignment and counting exhales 1 to 10',
    flow: 'Sit upright with balanced spine → relax shoulders and jaw → count each exhale silently from 1 to 10',
    category: 'mindfulness',
    tags: ['mindfulness', 'zazen', 'meditation', 'breathing'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 300,
    defaultRestSeconds: 0,
    supportedVariants: ['chair', 'standing'],
    media: {
      animation: { pack: 'mindfulness.zazen-posture', fallbackType: 'stillness' },
      audio: {
        cueId: 'zazen.posture-breath',
        defaultVoiceScript: 'Settle into an upright, balanced posture and count each slow exhale from one to ten.',
      },
    },
    isDefault: true,
  },
  {
    id: 'zazen-silent-sitting',
    name: 'Silent Seated Stillness',
    description: 'Open-awareness seated stillness without forcing thoughts',
    flow: 'Rest attention lightly on posture and breath → let thoughts pass without chasing → stay present until bell',
    category: 'mindfulness',
    tags: ['mindfulness', 'zazen', 'meditation'],
    defaultMode: 'stillness',
    defaultDurationSeconds: 600,
    defaultRestSeconds: 0,
    supportedVariants: ['chair', 'standing'],
    media: {
      animation: { pack: 'mindfulness.zazen-sitting', fallbackType: 'stillness' },
      audio: {
        cueId: 'zazen.silent-sitting',
        defaultVoiceScript: 'Sit in quiet awareness. Let thoughts come and go until the closing bell.',
      },
    },
    isDefault: true,
  },
];

const EXERCISE_BY_ID = new Map<string, ExerciseDefinition>(
  EXERCISE_LIBRARY.map((ex) => [ex.id, ex])
);

export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return EXERCISE_BY_ID.get(id);
}

export function getExercisesByCategory(category: ExerciseCategory): ExerciseDefinition[] {
  return EXERCISE_LIBRARY.filter((ex) => ex.category === category);
}

export function getExercisesByTag(tag: string): ExerciseDefinition[] {
  return EXERCISE_LIBRARY.filter((ex) => ex.tags.includes(tag));
}

/**
 * Resolve a routine step against the Exercise Library so linked animation,
 * audio cueId, voiceScript, and flow instructions stay bound automatically.
 */
export function resolveSeriesStep(step: SeriesStep): SeriesStep {
  const refId = step.exerciseId || step.id;
  const exercise = EXERCISE_BY_ID.get(refId);
  if (!exercise) return step;

  return {
    ...step,
    exerciseId: exercise.id,
    mode: step.mode || exercise.defaultMode,
    targetReps: step.targetReps ?? exercise.defaultTargetReps,
    instructions: step.instructions || exercise.flow,
    cueId: step.cueId || exercise.media.audio.cueId,
    voiceScript: step.voiceScript || exercise.media.audio.defaultVoiceScript,
    animation: step.animation || (exercise.media.animation ? {
      pack: exercise.media.animation.pack,
      version: exercise.media.animation.version,
    } : undefined),
  };
}
