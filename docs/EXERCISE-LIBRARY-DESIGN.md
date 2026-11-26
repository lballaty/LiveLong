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

## 2. Target 4-Part Model (`Exercise` [1-iteration Step + Flow + Media] → `Block` → `Routine` → `Session`)

### Part 1: `ExerciseDefinition` (Canonical Exercise Library)
Implemented in `web-app/src/data/exercise-library.ts` with **neutral movement/practice slugs** (`situps`, `jumping-jacks`, `leg-swings`, `side-bends`, `ikigai-purpose-prompts`, `zazen-posture-breath`, etc.) and **tags** (`rajio-taiso`, `western`, `calisthenics`, `amrap`, `zazen`, `ikigai`, etc.) instead of encoding philosophy in the slug:

```ts
export type ExerciseCategory =
  | 'mobility'
  | 'strength'
  | 'balance'
  | 'cardio'
  | 'mindfulness'
  | 'breathing';

export type ExercisePrescriptionMode =
  | 'timed'      // e.g. 2 min Sit-Ups AMRAP
  | 'reps'       // e.g. 20 Jumping Jacks
  | 'hold'       // e.g. 60s Plank
  | 'interval'   // e.g. Tabata 20s/10s
  | 'breath'     // e.g. 4-4-4-4 Box Breathing
  | 'stillness'; // e.g. Zazen / Ikigai reflection

export interface ExerciseDefinition {
  id: string;                    // neutral slug, e.g. 'situps', 'leg-swings'
  name: string;
  description: string;
  flow: string;                  // how 1 iteration (the atomic Step) is carried out
  category: ExerciseCategory;
  tags: string[];
  defaultMode: ExercisePrescriptionMode;
  defaultDurationSeconds: number;
  defaultRestSeconds: number;
  defaultTargetReps?: number;
  supportedVariants: ExerciseVariant[]; // ['standing', 'chair']
  media: ExerciseMediaBinding;          // bound animation + audio cueId & voiceScript
  isDefault: boolean;
}
```

### Part 2: `SeriesStep` / Block inside a `Routine` (`UnifiedProfile`)
`SeriesStep` adds `exerciseId?: string`, `mode?`, `targetReps?`, `rounds?`:
- **Step = 1 iteration** of the exercise (`flow`), while the **Routine Block** prescribes *how* it runs (`timed` AMRAP, `reps`, `hold`, `interval`, `breath`, `stillness`) + rest + chimes + music.
- At initialization/playback, `resolveSeriesStep(step)` merges the canonical `ExerciseDefinition` with any block-level overrides.
- **Backward compatibility:** Existing custom routines without `exerciseId` continue to work unchanged using their inline fields.

### Part 3: `SessionPlan` (`Session`)
Sequences 1+ Routines (`SessionPlanItem[]` with `profileId`, `transitionRestSeconds`, `musicOverrideId`) and runs under the user's execution preferences (character, standing/chair, views, audio levels).

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
