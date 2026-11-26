# Western & Standard Longevity Routines & Sessions Plan

**File:** /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/LiveLong/docs/WESTERN-ROUTINES-PLAN.md
**Description:** Research-backed catalog of standard Western mobility, bodyweight strength, balance, cardio, and relaxation routines and multi-routine sessions for LiveLong.
**Author:** Libor Ballaty <liborballaty@gmail.com>, with Gemini 4 Hydrogen (livelong-lead-b81b4d)
**Created:** 2026-11-26
**Last Updated:** 2026-11-26
**Last Updated By:** Gemini 4 Hydrogen (livelong-lead-b81b4d)

---

## 1. Evidence & Design Basis

Grounded in **ACSM**, **NHS**, and **Harvard Health** longevity guidance:
- **Break up sedentary time** every 60–90 minutes with brief mobility and posture resets.
- **Muscle & bone preservation (sarcopenia prevention):** 2–3×/week functional bodyweight resistance (squat, push, hinge/bridge, core stability).
- **Balance & fall-prevention:** 2–3×/week static and dynamic balance drills (tandem stance/walk, single-leg balance, sideways stepping).
- **Exercise variety:** Mixing aerobic movement, resistance, mobility, and nervous-system down-regulation correlates with lower all-cause mortality than any single modality alone.

All routines below require **zero gym equipment** (a sturdy chair, wall, or mat at most) and fit LiveLong's `SeriesStep` + `SessionPlan` model (`durationSeconds` / `restSeconds`, `instructions`, `cueId`, optional `animation`).

---

## 2. Proposed Standard Western Routines (6 Series)

### R1. Desk Reset & Posture Mobility (~6 min)
*Target: neck/shoulder tension, rounded upper back, and tight hip flexors from desk work.*
1. **Chin Tucks & Neck Release** (`60s`, rest `10s`) — Gently draw chin straight back, then tilt ear toward each shoulder.
2. **Seated Thoracic Extension** (`60s`, rest `10s`) — Hands behind head, gently arch upper back over chair back and lift chest.
3. **Chest & Pec Doorway/Wall Opener** (`60s`, rest `10s`) — Forearms on doorframe or wall, lean forward gently to open front shoulders.
4. **Standing Hip Flexor Stretch** (`60s`, rest `10s`) — Step one foot back into a shallow lunge, tuck tailbone slightly, 30s per side.
5. **Seated Figure-4 Glute Stretch** (`60s`, rest `0s`) — Cross ankle over opposite knee, sit tall, hinge forward gently, 30s per side.

### R2. Functional Bodyweight Strength (~10 min)
*Target: lower-body power, upper-body pushing, posterior chain, and core stability (2–3×/week).*
1. **Sit-to-Stand Chair Squats** (`90s`, rest `20s`) — Controlled tempo from chair edge, drive through heels, squeeze glutes at top.
2. **Incline or Wall Push-Ups** (`75s`, rest `20s`) — Hands on wall or sturdy desk/counter, straight line head to heels, steady tempo.
3. **Glute Bridges** (`90s`, rest `20s`) — Supine, knees bent, lift hips to straight line and pause 2s at the top.
4. **Bird-Dog Core Stability** (`90s`, rest `20s`) — Hands and knees, extend opposite arm and leg, hold 3s per side.
5. **Standing Calf Raises** (`60s`, rest `0s`) — Rise smoothly onto toes holding a chair/wall for light balance, lower slowly.

### R3. Balance & Fall-Prevention Stability (~7 min)
*Target: ankle proprioception, lateral hip stability, and static/dynamic balance (NHS framework).*
1. **Ankle Circles & Heel-Toe Rocks** (`60s`, rest `10s`) — Seated or supported standing; rock weight smoothly heel to toe.
2. **Sideways Stepping** (`90s`, rest `15s`) — Controlled lateral steps with soft knees near a counter or wall.
3. **Heel-to-Toe (Tandem) Walk** (`90s`, rest `15s`) — Place heel directly in front of opposite toe, eyes forward.
4. **Single-Leg Stand** (`90s`, rest `0s`) — Light fingertip support on chair/wall; hold 15–30s per leg, alternating.

### R4. Low-Back & Hip Decompression (~8 min)
*Target: spinal mobility and lower-back relief after sitting or standing.*
1. **Cat-Cow Spinal Flow** (`75s`, rest `15s`) — Hands and knees (or seated); alternate gentle arch and round with breath.
2. **Pelvic Tilts / Dead Bug** (`90s`, rest `15s`) — Supine; flatten lower back gently and alternate slow leg/arm lowers.
3. **Single & Double Knee-to-Chest** (`75s`, rest `15s`) — Supine; draw knee gently toward chest, breathing into lower back.
4. **Supine Spinal Twist** (`90s`, rest `0s`) — Knees bent, drop gently to each side for 45s while shoulders stay grounded.

### R5. Brisk Walk / Zone-2 Cardio Intervals (~15 min)
*Target: aerobic conditioning and midday circulation (indoor marching or outdoor walk).*
1. **Easy Warm-Up Pace** (`180s`, rest `0s`) — Comfortable stride, relaxed arms.
2. **Brisk Cadence Block 1** (`240s`, rest `60s`) — Purposeful brisk pace (able to speak in short sentences).
3. **Brisk Cadence Block 2** (`240s`, rest `60s`) — Repeat brisk pace, tall posture.
4. **Easy Cool-Down Pace** (`120s`, rest `0s`) — Gradually slow stride and deepen breathing.

### R6. Progressive Muscle Relaxation (PMR) (~8 min)
*Target: evening nervous-system down-regulation and somatic tension release.*
1. **Hands, Forearms & Shoulders** (`90s`, rest `15s`) — Gently clench fists and shrug shoulders for 5s, release completely for 15s.
2. **Face, Jaw & Neck** (`75s`, rest `15s`) — Lightly tense brow/jaw for 5s, soften jaw and drop shoulders on exhale.
3. **Core & Glutes** (`90s`, rest `15s`) — Gentle brace for 5s, full release into chair or mat.
4. **Legs & Feet** (`90s`, rest `0s`) — Point toes/tense calves gently for 5s, release and let legs feel heavy.

---

## 3. Built-In Sessions

### A. Added Now (from existing routines in `unifiedTimerStore.ts`)
1. **Morning Longevity Stack** (`🌅`): `Rajio Taiso Complete Series` → `Box Breathing`
2. **Midday Focus & Reset** (`⚡`): `Tai Chi Morning Flow` → `Deep Breathing` → `Pomodoro`
3. **Nature & Calm Decompression** (`🌲`): `Shinrin-yoku` → `4-7-8 Relaxation`
4. **Vitality & Breath Power** (`🔥`): `Wim Hof Breathing` → `Rajio Taiso Complete Series`

### B. Planned Sessions (once R1–R6 are added)
1. **Desk Worker Daily Reset** (`🪑`): `Desk Reset & Posture Mobility` → `Box Breathing` → `Pomodoro`
2. **Longevity Strength & Balance** (`💪`): `Rajio Taiso Complete Series` (or Warm-Up) → `Functional Bodyweight Strength` → `Balance & Fall-Prevention Stability`
3. **Back Care & Nervous System Reset** (`🧘`): `Low-Back & Hip Decompression` → `4-7-8 Relaxation`
4. **Evening Wind-Down** (`🌙`): `Progressive Muscle Relaxation` → `Deep Breathing`

---

## 4. Implementation Notes (When Ready to Build)
- Add `WESTERN_EXERCISE_SERIES` in `web-app/src/data/western-exercise-series.ts` (same `ExerciseSeries` shape as `japanese-exercise-series.ts`) and register in `unifiedTimerStore.ts` + `RoutineEditorModal` presets.
- `ExerciseAnimationPlayer` already falls back cleanly to the built-in animated robot SVG when an external `animation` pack is not yet bundled, so all routines work immediately with text + audio cues + fallback figure.
- Voice scripts (`cueId` / `voiceScript`) can be exported to `openScriptAudio` in a single batch once you pick which routines to ship first.
