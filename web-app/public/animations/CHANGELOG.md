# CHANGELOG — rajio-taiso 0.1.0-draft.1 (DRAFT)

**File:** CHANGELOG.md (in the bundle folder `exports/rajio-taiso-0.1.0-draft.1/` of the animation repo)
**Description:** Changes, contents, exclusions and known limits of this exercise-animation bundle.
**Author:** Libor Ballaty <liborballaty@gmail.com>, with Claude Opus 5.5 (animation-lead-038475, draft export)
**Created:** 2026-11-23
**Last Updated:** 2026-11-23
**Last Updated By:** Claude Opus 5.5 (animation-lead-038475)

> **DRAFT.** Exported on operator direction (2026-11-23) ahead of the full drawing review (plan gate g-review-all), so LiveLong can start integrating. Drawings, timing and pack contents may still change before 1.0.0.

## 0.1.0-draft.1 — 2026-11-23

- First draft bundle: runtime 0.1.0-draft.1 (ESM + .d.ts), 4 standing exercise packs, 4 character packs (robot-r1 default), JSON Schemas, Node-18 validator, preview page.

### Contents

- Runtime: `runtime/exercise-figures-runtime.js` + `.d.ts`, version 0.1.0-draft.1.
- Exercises (standing, front and side views): `rajio-taiso.neck-arm-stretch`, `rajio-taiso.chest-expansion`, `rajio-taiso.side-bends`, `rajio-taiso.trunk-twists`.
- Characters: `robot-r1` (default) — pending-review; `m25-athletic` — approved; `f30-slim` — approved; `f72-stooped` — approved.

### Excluded

- `rajio-taiso.arm-swings` — LiveLong switched arm-swings to the official Radio Taiso No. 1 form (arms across the front and out to the sides, knee bends, heel rise) on 2026-11-22; the current build is the earlier forward/back form. Rebuilding it is the next animation work item.
- `rajio-taiso.leg-swings` — Not built yet: it needs the "holding a chair" support mode.
- `daily.squat` — Not a LiveLong Rajio Taiso step (it is the animation repo's prototype exercise).

### Known limits

- Standing variants only. No chair variant is built for any exercise yet; a player asked for variant "chair" draws standing and reports player.variant === "standing" (f72-stooped has chairByDefault: true).
- robot-r1 is the default character but has not passed its own drawing review (approval: "pending-review"); m25-athletic, f30-slim and f72-stooped are approved.
- Prerelease version: 0.1.0-draft.1 does not satisfy a "^1" range. Reference the exact version (animation.version: "0.1.0-draft.1") while the bundle is a draft.
- The runtime draws only the appearance options in its catalogue (APPEARANCE_CATALOGUE); a new hairstyle or clothing style needs a runtime update, not just a pack.
- WebKit (Safari, iOS) draws the ink-wobble filter visibly blurred (measured in headless WebKit 2287 on macOS, 2026-11-23; Chromium draws it sharp). Recommended: pass inkWobble: false on Safari/iOS. The runtime default stays on pending an operator decision.
- Frame rate was measured in desktop headless engines, not on an iPhone or iPad. One player (front + side, the app's case) holds 60 fps in WebKit for every exercise x character with ink on and off (179-182 frames in 3 s). The 16-player preview grid does not (WebKit 21 fps with ink, 30 without; Chromium 45): it is a review page, not how the app uses the runtime.

### Use

- Check before copying: `node validate-bundle.mjs <this folder>` (Node 18+, no dependencies; exit 0 = valid).
- Preview: serve this folder over HTTP and open `preview.html` (`?exercise=`, `?character=`, `?ink=0`, `?still=1`, `?duration=`).
