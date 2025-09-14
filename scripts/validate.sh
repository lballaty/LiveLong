#!/usr/bin/env bash
set -euo pipefail

# Validate a JSON file against a JSON Schema.
# Defaults:
#  - Schema: schema/routine.schema.json
#  - Data:   src/data/routine.json
# You can override via flags: -s <schema> -d <data>

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="${SCRIPT_DIR%/scripts}"
cd "$ROOT_DIR"

SCHEMA="schema/routine.schema.json"
DATA="src/data/routine.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--schema) SCHEMA="$2"; shift 2 ;;
    -d|--data) DATA="$2"; shift 2 ;;
    -h|--help)
      echo "Usage: $0 [-s schema.json] [-d data.json]"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -f "$SCHEMA" ]]; then
  echo "Schema not found: $SCHEMA" >&2
  exit 2
fi
if [[ ! -f "$DATA" ]]; then
  echo "Data not found: $DATA" >&2
  exit 2
fi

echo "Validating $DATA against $SCHEMA ..."

# 1) Prefer ajv-cli via npx (Ajv v8)
if command -v npx >/dev/null 2>&1; then
  if npx -y ajv-cli@5 validate -s "$SCHEMA" -d "$DATA"; then
    echo "OK: ajv-cli validation passed."
    exit 0
  else
    echo "ajv-cli validation failed or ajv-cli unavailable. Falling back to Python if possible..." >&2
  fi
fi

# 2) Fallback to Python jsonschema (requires jsonschema >= 4.x for Draft 2020-12)
if command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
  PY_BIN="python3"
  command -v python3 >/dev/null 2>&1 || PY_BIN="python"
  "$PY_BIN" - "$SCHEMA" "$DATA" <<'PY'
import json, sys
schema_path, data_path = sys.argv[1], sys.argv[2]
try:
    import jsonschema
    from jsonschema import Draft202012Validator
except Exception as e:
    print("Python jsonschema not installed. Install with: pip install 'jsonschema>=4'", file=sys.stderr)
    sys.exit(3)

with open(schema_path, 'r', encoding='utf-8') as f:
    schema = json.load(f)
with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

validator = Draft202012Validator(schema)
errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
if errors:
    for e in errors:
        path = '/'.join(map(str, e.path)) or '<root>'
        print(f"Error at {path}: {e.message}", file=sys.stderr)
    sys.exit(4)
else:
    print("OK: Python jsonschema validation passed.")
    sys.exit(0)
PY
  status=$?
  if [[ $status -eq 0 ]]; then exit 0; else exit $status; fi
fi

echo "No validator available. Options:" >&2
echo " - Use npx: npx -y ajv-cli@5 validate -s '$SCHEMA' -d '$DATA'" >&2
echo " - Or install Python jsonschema: pip install 'jsonschema>=4' and rerun this script" >&2
exit 5

