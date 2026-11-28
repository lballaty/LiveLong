# CHANGELOG — rajio-taiso 0.1.0-draft.2 (DRAFT)

**File:** CHANGELOG.md (in the bundle folder `exports/rajio-taiso-0.1.0-draft.2/` of the animation repo)
**Description:** Changes, contents, exclusions and known limits of this exercise-animation bundle.
**Author:** Libor Ballaty <liborballaty@gmail.com>, with Claude Opus 5.5 (animation-lead-038475, draft export)
**Created:** 2026-11-28
**Last Updated:** 2026-11-28
**Last Updated By:** Claude Opus 5.5 (animation-lead-038475)

> **DRAFT.** Second draft (2026-11-28), still ahead of the full drawing review (plan gate g-review-all) and the operator's gate-g3 review of arm-swings and leg-swings. Drawings, timing and pack contents may still change before 1.0.0.

## 0.1.0-draft.2 — 2026-11-28

- Runtime 0.1.0-draft.2 (packs now require it): new pose keys stance.side (a single-leg variant stands on either foot; mirrored cycles alternate legs), prop.chair (a chair standing in front of the figure, drawn by the runtime) and handL.hold / handR.hold (a hand resting on its top rail, fixed in place while the body moves); the balance rule counts a resting free foot. The four draft.1 exercises draw and pose exactly as in draft.1 (tested to 1e-6 against the draft.1 runtime).
- arm-swings added, in the official Radio Taiso No. 1 form (LiveLong decision 2026-11-22): arms crossed low in front with knees bent and heels down, then out to the sides at about shoulder height on the toes with knees straight; palms toward the body when crossed and down when open. Excluded from draft.1 (it was the earlier forward/back form).
- leg-swings added: the NHS chair-supported leg lift (LiveLong decision 2026-11-26), one hand on the back of a chair, back raise and sideways lift, then the other leg. Built routine-neutral (shared module) under the existing id rajio-taiso.leg-swings.
- All six LiveLong steps are now in the bundle; only daily.squat is excluded. Exercise packs are listed in LiveLong's routine order.

### Contents

- Runtime: `runtime/exercise-figures-runtime.js` + `.d.ts`, version 0.1.0-draft.2.
- Exercises (standing, front and side views): `rajio-taiso.neck-arm-stretch`, `rajio-taiso.arm-swings`, `rajio-taiso.chest-expansion`, `rajio-taiso.side-bends`, `rajio-taiso.trunk-twists`, `rajio-taiso.leg-swings`.
- Characters: `robot-r1` (default) — pending-review; `m25-athletic` — approved; `f30-slim` — approved; `f72-stooped` — approved.

### Excluded

- `daily.squat` — Not a LiveLong step (it is the animation repo's prototype exercise).

### Known limits

- Standing variants only: no chair (seated) variant is built for any exercise. A player asked for variant "chair" draws standing and reports player.variant === "standing" (f72-stooped has chairByDefault: true). leg-swings is a standing exercise that holds the back of a chair; the chair is drawn by the runtime as part of that exercise.
- robot-r1 is the default character but has not passed its own drawing review (approval: "pending-review"); m25-athletic, f30-slim and f72-stooped are approved.
- arm-swings (official Radio Taiso form) and leg-swings (one hand on a chair) are new in this draft and have not had the operator's gate-g3 review. Open choreography questions are listed in their movement scripts (arm-swings: knee/heel rhythm; leg-swings: no forward swing, chair in front).
- leg-swings alternates legs every cycle (10 s per leg at pace 1). A step length that is not a whole number of left/right pairs ends on the left leg: at f72-stooped's pace 0.85 a 60 s step plays left, right, left, right, left.
- Prerelease version: 0.1.0-draft.2 does not satisfy a "^1" range. Reference the exact version (animation.version: "0.1.0-draft.2") while the bundle is a draft.
- The runtime draws only the appearance options in its catalogue (APPEARANCE_CATALOGUE); a new hairstyle or clothing style needs a runtime update, not just a pack.
- WebKit (Safari, iOS) draws the ink-wobble filter visibly blurred (measured in headless WebKit on macOS, 2026-11-23, re-checked 2026-11-28; Chromium draws it sharp). Recommended: pass inkWobble: false on Safari/iOS. The runtime default stays on pending an operator decision.
- Frame rate was measured in desktop headless engines (Playwright on macOS, 2026-11-28), not on an iPhone or iPad. One player (front + side, the app's case) holds the display rate for every exercise x character with ink on and off: WebKit 60 fps (59.8-60.8), Chromium 120 fps. The 24-player preview grid does not (WebKit 13 fps with ink, 18 without; Chromium 28): it is a review page, not how the app uses the runtime.

### Use

- Check before copying: `node validate-bundle.mjs <this folder>` (Node 18+, no dependencies; exit 0 = valid).
- Preview: serve this folder over HTTP and open `preview.html` (`?exercise=`, `?character=`, `?ink=0`, `?still=1`, `?duration=`).
