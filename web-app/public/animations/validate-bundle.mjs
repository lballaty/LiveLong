#!/usr/bin/env node
// File: scripts/validate-bundle.mjs
// Description: Zero-dependency bundle validator for exercise-animation bundles (Node 18+, plain JavaScript, no
//   newer APIs). Usage: `node validate-bundle.mjs [bundleDir]` (default: the directory this file is in). Checks the
//   manifest and every pack against the bundle's own schema/*.schema.json (a JSON Schema 2020-12 subset is built in:
//   it refuses schemas that use keywords it does not implement, so a check can never be skipped silently), every
//   file's sha256 and size, that no unlisted files are present, pack ids/versions against the manifest, and that the
//   shipped runtime satisfies every minimum runtime version. Exit 0 = valid, 1 = invalid, 2 = usage/IO error.
//   Shipped inside each bundle and used by the animation repo's own tests.
// Author: Libor Ballaty <liborballaty@gmail.com>, with Claude Opus 5.5 (animation-lead-038475, draft export)
// Created: 2026-11-23
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// ───────────────────────── JSON Schema (2020-12 subset) ─────────────────────────

const ANNOTATIONS = new Set(['$schema', '$id', '$defs', '$comment', 'title', 'description', 'default', 'examples']);
const KEYWORDS = new Set([
  '$ref', 'type', 'enum', 'const', 'properties', 'required', 'additionalProperties', 'patternProperties',
  'propertyNames', 'minProperties', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minimum', 'maximum',
  'exclusiveMinimum', 'exclusiveMaximum', 'minLength', 'maxLength', 'pattern', 'oneOf', 'anyOf', 'allOf',
]);

const typeOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
const isType = (v, t) => (t === 'integer' ? typeof v === 'number' && Number.isInteger(v) : t === 'number' ? typeof v === 'number' && Number.isFinite(v) : typeOf(v) === t);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const at = (path) => path || '(root)';
const regexCache = new Map();
const re = (p) => { if (!regexCache.has(p)) regexCache.set(p, new RegExp(p, 'u')); return regexCache.get(p); };

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`Unsupported $ref "${ref}" (only local "#/..." references)`);
  let node = root;
  for (const part of ref.slice(2).split('/')) {
    node = node?.[part.replace(/~1/g, '/').replace(/~0/g, '~')];
    if (node === undefined) throw new Error(`Unresolvable $ref "${ref}"`);
  }
  return node;
}

function check(schema, value, root, path, errors) {
  if (schema === true) return;
  if (schema === false) { errors.push(`${at(path)}: not allowed`); return; }
  for (const k of Object.keys(schema)) {
    if (!KEYWORDS.has(k) && !ANNOTATIONS.has(k)) throw new Error(`Schema keyword "${k}" at ${at(path)} is not supported by this validator`);
  }
  if (schema.$ref) check(resolveRef(root, schema.$ref), value, root, path, errors);
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => isType(value, t))) { errors.push(`${at(path)}: expected ${types.join(' or ')}, got ${typeOf(value)}`); return; }
  }
  if (schema.const !== undefined && !same(schema.const, value)) errors.push(`${at(path)}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((e) => same(e, value))) errors.push(`${at(path)}: ${JSON.stringify(value)} is not one of ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}`);

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${at(path)}: ${value} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${at(path)}: ${value} > maximum ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${at(path)}: ${value} must be > ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) errors.push(`${at(path)}: ${value} must be < ${schema.exclusiveMaximum}`);
    if (!Number.isFinite(value)) errors.push(`${at(path)}: not a finite number`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${at(path)}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${at(path)}: longer than ${schema.maxLength}`);
    if (schema.pattern !== undefined && !re(schema.pattern).test(value)) errors.push(`${at(path)}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${at(path)}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${at(path)}: more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${at(path)}: items are not unique`);
    if (schema.items !== undefined) value.forEach((v, i) => check(schema.items, v, root, `${path}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push(`${at(path)}: fewer than ${schema.minProperties} properties`);
    for (const r of schema.required ?? []) if (!(r in value)) errors.push(`${at(path)}: missing required property "${r}"`);
    for (const k of keys) {
      const p = path ? `${path}.${k}` : k;
      if (schema.propertyNames !== undefined) {
        const sub = [];
        check(schema.propertyNames, k, root, p, sub);
        if (sub.length) errors.push(`${p}: property name "${k}" is not allowed`);
      }
      let matched = false;
      if (schema.properties && Object.prototype.hasOwnProperty.call(schema.properties, k)) { matched = true; check(schema.properties[k], value[k], root, p, errors); }
      for (const [pat, sub] of Object.entries(schema.patternProperties ?? {})) if (re(pat).test(k)) { matched = true; check(sub, value[k], root, p, errors); }
      if (!matched && schema.additionalProperties !== undefined) {
        if (schema.additionalProperties === false) errors.push(`${p}: unexpected property "${k}"`);
        else check(schema.additionalProperties, value[k], root, p, errors);
      }
    }
  }
  if (schema.allOf) for (const s of schema.allOf) check(s, value, root, path, errors);
  if (schema.anyOf) {
    if (!schema.anyOf.some((s) => { const e = []; check(s, value, root, path, e); return e.length === 0; })) errors.push(`${at(path)}: matches none of anyOf`);
  }
  if (schema.oneOf) {
    const n = schema.oneOf.filter((s) => { const e = []; check(s, value, root, path, e); return e.length === 0; }).length;
    if (n !== 1) errors.push(`${at(path)}: must match exactly one of oneOf (matched ${n})`);
  }
}

/** Validate a value against a JSON Schema (2020-12 subset). Returns a list of error strings; empty = valid. */
export function validateJson(schema, value) {
  const errors = [];
  check(schema, value, schema, '', errors);
  return errors;
}

// ───────────────────────── semver ─────────────────────────

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-.]+)?$/;

/** Compare two semver strings with prerelease precedence (1.0.0-draft.1 < 1.0.0). Returns -1, 0 or 1. */
export function compareSemver(a, b) {
  const pa = SEMVER.exec(a), pb = SEMVER.exec(b);
  if (!pa || !pb) throw new Error(`Not a semver version: ${pa ? b : a}`);
  for (let i = 1; i <= 3; i++) { const d = Number(pa[i]) - Number(pb[i]); if (d) return d < 0 ? -1 : 1; }
  if (!pa[4] && !pb[4]) return 0;
  if (!pa[4]) return 1;
  if (!pb[4]) return -1;
  const xa = pa[4].split('.'), xb = pb[4].split('.');
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    if (xa[i] === undefined) return -1;
    if (xb[i] === undefined) return 1;
    const na = /^\d+$/.test(xa[i]), nb = /^\d+$/.test(xb[i]);
    if (na && nb) { const d = Number(xa[i]) - Number(xb[i]); if (d) return d < 0 ? -1 : 1; } else if (na !== nb) return na ? -1 : 1;
    else if (xa[i] !== xb[i]) return xa[i] < xb[i] ? -1 : 1;
  }
  return 0;
}

// ───────────────────────── bundle ─────────────────────────

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

function listFiles(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, base));
    else out.push(relative(base, full).split(sep).join('/'));
  }
  return out;
}

/**
 * Validate a bundle directory. Returns { ok, errors, summary }. Never throws for content problems (they are
 * reported as errors); throws only if the directory itself cannot be read.
 * options.io may replace file access ({ read(rel) → Buffer, exists(rel) → boolean, list() → relative paths }), e.g. to
 * check a bundle as if a file were altered without copying or touching it.
 */
export function validateBundle(bundleDir, options = {}) {
  const dir = resolve(bundleDir);
  const errors = [];
  if (!existsSync(dir) || !statSync(dir).isDirectory()) throw new Error(`Not a directory: ${dir}`);
  const io = {
    read: (rel) => readFileSync(join(dir, rel)),
    exists: (rel) => existsSync(join(dir, rel)),
    list: () => listFiles(dir),
    ...(options.io ?? {}),
  };
  const readJson = (rel) => {
    if (!io.exists(rel)) { errors.push(`${rel}: missing`); return undefined; }
    try { return JSON.parse(io.read(rel).toString('utf8')); } catch (e) { errors.push(`${rel}: not valid JSON (${e.message})`); return undefined; }
  };

  const schemas = {};
  for (const name of ['bundle-manifest', 'exercise-pack', 'character-pack']) schemas[name] = readJson(`schema/${name}.schema.json`);
  const manifest = readJson('manifest.json');
  if (!manifest || Object.values(schemas).some((s) => !s)) return { ok: false, errors, summary: null };

  const schemaCheck = (name, value, label) => {
    try { for (const e of validateJson(schemas[name], value)) errors.push(`${label}: ${e}`); } catch (e) { errors.push(`${label}: schema error (${e.message})`); }
  };
  schemaCheck('bundle-manifest', manifest, 'manifest.json');
  if (errors.length) return { ok: false, errors, summary: null };

  // checksums and sizes; nothing unlisted
  const listed = new Set(Object.keys(manifest.files));
  for (const [rel, want] of Object.entries(manifest.files)) {
    if (!io.exists(rel)) { errors.push(`${rel}: listed in manifest but missing`); continue; }
    const buf = io.read(rel);
    if (buf.length !== want.bytes) errors.push(`${rel}: size ${buf.length} bytes, manifest says ${want.bytes}`);
    const got = sha256(buf);
    if (got !== want.sha256) errors.push(`${rel}: sha256 mismatch (file ${got}, manifest ${want.sha256})`);
  }
  for (const rel of io.list()) if (rel !== 'manifest.json' && !listed.has(rel)) errors.push(`${rel}: present but not listed in manifest.json`);
  for (const rel of [manifest.runtime.file, manifest.runtime.types, 'validate-bundle.mjs', 'LICENSE-line-art', 'CHANGELOG.md']) {
    if (!listed.has(rel)) errors.push(`${rel}: required file not listed in manifest.json`);
  }

  // versions: the shipped runtime must satisfy the bundle and every pack
  const rt = manifest.runtime.version;
  const needs = (label, min) => { if (compareSemver(rt, min) < 0) errors.push(`${label}: needs runtime >= ${min}, bundle ships ${rt}`); };
  needs('manifest.json', manifest.minRuntimeVersion);

  // packs
  const series = manifest.bundle.split('.')[0];
  for (const e of manifest.exercises) {
    const pack = readJson(e.file);
    if (!pack) continue;
    schemaCheck('exercise-pack', pack, e.file);
    if (e.file !== `exercises/${pack.id}.json`) errors.push(`${e.file}: file name must be exercises/<id>.json (id "${pack.id}")`);
    if (pack.id !== e.id) errors.push(`${e.file}: id "${pack.id}" but manifest lists "${e.id}"`);
    if (pack.version !== e.version) errors.push(`${e.file}: version ${pack.version} but manifest lists ${e.version}`);
    if (pack.series !== series) errors.push(`${e.file}: series "${pack.series}" is not the bundle's "${series}"`);
    if (pack.livelongStepId !== e.livelongStepId) errors.push(`${e.file}: livelongStepId differs from manifest`);
    if (!same(Object.keys(pack.variants ?? {}).sort(), [...e.variants].sort())) errors.push(`${e.file}: variants differ from manifest`);
    if (!same(pack.views, e.views)) errors.push(`${e.file}: views differ from manifest`);
    if (pack.status !== manifest.status) errors.push(`${e.file}: status "${pack.status}" but bundle is "${manifest.status}"`);
    if (typeof pack.minRuntimeVersion === 'string') needs(e.file, pack.minRuntimeVersion);
  }
  for (const c of manifest.characters) {
    const pack = readJson(c.file);
    if (!pack) continue;
    schemaCheck('character-pack', pack, c.file);
    if (c.file !== `characters/${pack.id}.json`) errors.push(`${c.file}: file name must be characters/<id>.json (id "${pack.id}")`);
    if (pack.id !== c.id) errors.push(`${c.file}: id "${pack.id}" but manifest lists "${c.id}"`);
    if (pack.version !== c.version) errors.push(`${c.file}: version ${pack.version} but manifest lists ${c.version}`);
    if (pack.approval !== c.approval) errors.push(`${c.file}: approval differs from manifest`);
    if (typeof pack.minRuntimeVersion === 'string') needs(c.file, pack.minRuntimeVersion);
  }
  if (!manifest.characters.some((c) => c.id === manifest.defaultCharacter)) errors.push(`manifest.json: defaultCharacter "${manifest.defaultCharacter}" is not in characters`);
  const ids = manifest.exercises.map((e) => e.id);
  if (new Set(ids).size !== ids.length) errors.push('manifest.json: duplicate exercise ids');
  for (const x of manifest.excluded) if (ids.includes(x.id)) errors.push(`manifest.json: "${x.id}" is both included and excluded`);

  return {
    ok: errors.length === 0,
    errors,
    summary: { bundle: manifest.bundle, version: manifest.version, status: manifest.status, runtime: rt, exercises: ids, characters: manifest.characters.map((c) => c.id), files: listed.size },
  };
}

// ───────────────────────── CLI ─────────────────────────

const self = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? (() => { try { return realpathSync(resolve(process.argv[1])); } catch { return ''; } })() : '';
if (invoked && invoked === realpathSync(self)) {
  const target = process.argv[2] ?? dirname(self);
  let result;
  try { result = validateBundle(target); } catch (e) { console.error(`validate-bundle: ${e.message}`); process.exit(2); }
  if (result.ok) {
    const s = result.summary;
    console.log(`OK ${s.bundle} ${s.version} (${s.status}) — runtime ${s.runtime}; ${s.exercises.length} exercises, ${s.characters.length} characters, ${s.files} files checksummed`);
    process.exit(0);
  }
  console.error(`INVALID bundle ${resolve(target)} — ${result.errors.length} problem(s):`);
  for (const e of result.errors) console.error(`  - ${e}`);
  process.exit(1);
}
