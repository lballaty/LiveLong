# LiveLong

Public web app scaffold using vanilla HTML/CSS/JS. You can start building features directly or later migrate to Flutter Web if desired.

## Quick Start

- Open `index.html` in a browser, or serve locally:
  - Python: `python3 -m http.server 8000` then visit `http://localhost:8000`
  - Node (if installed): `npx serve` in the project root

## Start/Stop Scripts

- Start the local server and open your browser:
  - `./scripts/start.sh` (defaults to port 8000)
  - `./scripts/start.sh 8080` or `./scripts/start.sh --port 8080` to use a different port
  - Optionally set `PORT=9090 ./scripts/start.sh`
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

## Next Steps

- Replace placeholder UI with your first page/component.
- If migrating to Flutter Web later, you can place the Flutter build output under `./` or configure a separate hosting path.
