# Exercise Library & 3-Tier Composition Design

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/docs/EXERCISE-LIBRARY-DESIGN.md
**Description:** Architecture for separating reusable Exercises (with bound audio & animation media) from Routines and Sessions, plus Ikigai/Zazen restoration.
**Author:** Libor Ballaty <liborballaty@gmail.com>, with Gemini 4 Hydrogen (livelong-lead-b81b4d)
**Created:** 2026-11-26
**Last Updated:** 2026-11-26
**Last Updated By:** Gemini 4 Hydrogen (livelong-lead-b81b4d)

---

## 1. Problem Statement

Currently LiveLong has a **2-tier** model:
- **Routine** (`UnifiedProfile` with `type: 'series'`, containing inline `SeriesStep[]`)
- **Session** (`SessionPlan`, containing `SessionPlanItem[]` referencing `profileId`)

Because exercises live inline inside each routine's `SeriesStep[]`:
1. Reusable movements (such as `leg-swings`, `chin-tucks`, or `box-breathing`) cannot be picked from a shared library when authoring new routines.
2. Media bindings (`animation.pack`, `cueId`, `voiceScript`) are duplicated per step across routines, so updating an animation pack version or voice cue ID requires hunting through every routine, and cloning/editing a step risks detaching its media.

---

## 2. Target 3-Tier Model (`Exercise` → `Routine` → `Session`)

### Tier 1: `ExerciseDefinition` (Canonical Exercise Library)
Stored in `web-app/src/data/exercise-library.ts` (built-in) plus user-created exercises in `localStorage` (`livelong_custom_exercises`):

```ts
export type ExerciseCategory =
  | 'mobility'
  | 'strength'
  | 'balance'
  | 'cardio'
  | 'mindfulness'
  | 'breathing';

export type ExerciseModality = 'eastern' | 'western' | 'universal';

export interface ExerciseMediaBinding {
  animation?: {
    pack: string;        // e.g. 'rajio-taiso.side-bends' or 'mobility.leg-swings'
    version?: string;    // pinned semver, e.g. '0.1.0-draft.1'
    fallbackType?: 'robot-poc' | 'breathing' | 'stillness';
  };
  audio?: {
    cueId: string;               // e.g. 'exercise.leg-swings'
    defaultVoiceScript: string;  // Web Speech fallback when .mp3 pack is absent
    completionCueId?: string;    // optional end-of-step cue
  };
}

export interface ExerciseDefinition {
  id: string;                    // stable canonical slug, e.g. 'mobility.leg-swings'
  name: string;
  description: string;
  instructions: string;
  category: ExerciseCategory;
  modality: ExerciseModality;
  defaultDurationSeconds: number;
  defaultRestSeconds: number;
  supportedVariants: ExerciseVariant[]; // ['standing', 'chair']
  media: ExerciseMediaBinding;
  isDefault: boolean;
}
```

### Tier 2: `SeriesStep` inside a `Routine` (`UnifiedProfile`)
`SeriesStep` adds `exerciseId?: string` referencing `ExerciseDefinition.id`:
- A routine step **only needs to store routine-specific overrides** (`durationMinutes`, `durationSeconds`, `restMinutes`, `restSeconds`, and optional `instructions` / `voiceScript` overrides).
- At playback, `resolveSeriesStep(step, exerciseLibrary)` merges the canonical `ExerciseDefinition` with any step-level overrides.
- **Backward compatibility:** Existing custom routines without `exerciseId` continue to work unchanged using their inline fields.

### Tier 3: `SessionPlan` (`Session`)
Unchanged: sequences `SessionPlanItem[]` (`profileId`, `transitionRestSeconds`, `musicOverrideId`).

---

## 3. How Audio & Animations Stay Connected (No Separation)

1. **Single Source of Truth per Exercise:** `animation.pack` + `version` and `audio.cueId` + `defaultVoiceScript` live on `ExerciseDefinition.media`, not copied into every routine.
2. **Automatic Propagation:** When `animation` exports `0.1.0-draft.2` (e.g., sideways `arm-swings`, `leg-swings`) or `openScriptAudio` delivers a voice pack, updating the single `ExerciseDefinition` updates **every** routine (built-in or custom) that references `exerciseId`.
3. **Clone & Edit Safety:** Cloning a routine or changing a step's duration/rest in `RoutineEditorModal` preserves `exerciseId`, so the step never loses its animation or voice cue.
4. **Build-Time & Test Integrity Gate:** `data-series.test.ts` asserts:
   - Every `exerciseId` in built-in routines resolves in `EXERCISE_LIBRARY`.
   - Every `ExerciseDefinition` has a non-empty `audio.cueId` + `defaultVoiceScript` and either a valid `animation.pack` in `public/animations/manifest.json` or an explicit `fallbackType`.

---

## 4. UI / UX Plan

1. **Exercise Library Browser (in `Routines` view):**
   - Filterable by `Category` (`Mobility`, `Strength`, `Balance`, `Cardio`, `Mindfulness`, `Breathing`) and `Tradition` (`Eastern`, `Western`, `Universal`).
   - Shows readiness badges per exercise: `🎬 Animated` (external pack present) vs `🤖 Fallback`, and `🔊 Voice` (cue pack present) vs `🗣️ TTS`.
   - Allows previewing an exercise or creating a custom `ExerciseDefinition`.
2. **`RoutineEditorModal` Integration:**
   - Add **"+ Pick from Exercise Library"** button alongside **"+ Custom Step"** (with an option to save a custom step to the library).
   - Bound steps display a badge (`Linked: mobility.leg-swings`) so users know animation and voice cues stay attached when they adjust duration or reorder steps.

---

## 5. Complementary Eastern Series to Keep & Develop (Operator Confirmed 2026-11-26)

- **Ikigai Reflection (`ikigai-reflection-series`):** Guided 4-prompt purpose & gratitude reflection (`What energizes me`, `What I do well`, `Who it helps`, `One intention today`) using `fallbackType: 'stillness'` + `audio.cueId` voice prompts.
- **Zazen Sitting (`zazen-sitting-series`):** Posture alignment, breath counting, and silent sitting intervals with opening/interval/closing chimes and `fallbackType: 'stillness'`.
