# LiveLong

Public web app scaffold using vanilla HTML/CSS/JS. You can start building features directly or later migrate to Flutter Web if desired.

## Quick Start

- Open `index.html` in a browser, or serve locally:
  - Python: `python3 -m http.server 11000` then visit `http://localhost:11000`
  - Node (if installed): `npx serve` in the project root

## Start/Stop Scripts

- Start the local server and open your browser:
  - `./scripts/start.sh` (defaults to port 11000)
  - `./scripts/start.sh 8080` or `./scripts/start.sh --port 8080` to use a different port
  - Optionally set `PORT=9090 ./scripts/start.sh`
- Run the test suite:
  - `./scripts/start.sh test` (starts server, runs Playwright tests, then stops server)
- Stop the local server:
  - `./scripts/stop.sh`

Notes:
- Uses Python’s built-in `http.server` bound to `127.0.0.1`.
- Writes PID to `.server.pid` and logs to `server.log`.
- If a server is already running, `start.sh` will refuse to start another; use `stop.sh` first.

## Project Structure

- `index.html`: App entry point
- `src/styles.css`: Base styles
- `src/main.js`: App bootstrap script
- `src/data/routine.json`: Routine data (validated by `schema/routine.schema.json`)
- `src/data/pacer-presets.json`: Breathing pacer presets (validated by `schema/pacer-presets.schema.json`)
- `src/data/achievements.json`: XP policy, levels, and badges (validated by `schema/achievements.schema.json`)
- `src/data/goals.json`: Suggested incremental goals (validated by `schema/goals.schema.json`)
- `sw.js`: Service worker for offline
- `docs/Requirements.md`: Product requirements
- `docs/Design.md`: Architecture & design

## Validation

- Validate the routine JSON against the schema:
  - `./scripts/validate.sh` (defaults to `schema/routine.schema.json` and `src/data/routine.json`)
  - Custom files: `./scripts/validate.sh -s path/to/schema.json -d path/to/data.json`
  - The script tries `npx ajv-cli` first; if unavailable, it falls back to Python’s `jsonschema` if installed.

- Validate the goals JSON:
  - `./scripts/validate.sh -s schema/goals.schema.json -d src/data/goals.json`

- Validate the achievements JSON:
  - `./scripts/validate.sh -s schema/achievements.schema.json -d src/data/achievements.json`
- Validate breathing pacer presets:
  - `./scripts/validate.sh -s schema/pacer-presets.schema.json -d src/data/pacer-presets.json`

## Dev Notes

- Service worker caching during development can serve stale files.
  - Chrome/Edge: DevTools → Application → Service Workers → Unregister, then hard reload (Cmd/Ctrl+Shift+R). Or run on a new port: `./scripts/start.sh 8081`.
  - Safari: Enable the Develop menu, then Develop → Empty Caches and reload. You can also temporarily disable Service Workers in the Develop menu.
- Placeholder assets are included so the UI isn’t empty if you don’t have media yet.
  - Hero banner: `src/assets/images/hero-banner.svg`
  - Generic placeholder: `src/assets/images/placeholder.svg`
- Music loop (optional): place your MP3 at `src/assets/audio/calm-loop.mp3`.
  - Any short calm loop works; volume is low by default. If absent, the app falls back to a silent/no‑op player.

## Next Steps

- Replace placeholder UI with your first page/component.
- If migrating to Flutter Web later, you can place the Flutter build output under `./` or configure a separate hosting path.
