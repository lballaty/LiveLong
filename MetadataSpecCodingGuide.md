# Metadata-Driven Spec Coding: Comprehensive Instructions

This document captures the characteristics, checklist, and scaffold for metadata-driven spec coding using **JSON-first principles**.

---

## 1. Core Characteristics

1. **Structure**

   * Use JSON front-matter in Markdown docs.
   * Keep narrative text separate from machine metadata.
   * Include `spec_version` for evolution tracking.

2. **Schema & Validation**

   * Define a JSON Schema for metadata.
   * Validate deterministically in CI/CD (e.g., with `ajv`).
   * Enforce naming conventions and required fields.

3. **Contracts**

   * Link to API contracts (OpenAPI in JSON).
   * Link to DB schema (JSON) and migrations.
   * Encode acceptance criteria in JSON or structured text.
   * Validate contracts in CI with deterministic tools.

4. **Governance**

   * Record feature owner, role, and unique ID.
   * Track non-functional requirements (latency, auth, compliance tags).
   * Version specs explicitly.

5. **Ingestion & AI**

   * Use metadata for classification (framework, standard, type).
   * Ensure ingestion pipelines parse JSON metadata predictably.
   * Keep consistent tags for RAG/AI orchestration.

6. **Automation**

   * CI gates merges if specs or contracts fail validation.
   * Auto-generate stubs/tests/docs where possible.
   * Rely on deterministic validators, not LLM judgment.

7. **Iterative Updates**

   * Specs live alongside code/docs in Git.
   * Changes diffable and reviewable.
   * Always update metadata and narrative together.

---

## 2. Checklist

### Structure

* [ ] JSON front-matter in each doc
* [ ] Separate narrative + metadata
* [ ] `spec_version` included

### Schema & Validation

* [ ] JSON Schema defined for metadata
* [ ] Validation enforced in CI/CD
* [ ] Naming conventions checked
* [ ] Required fields present

### Contracts

* [ ] OpenAPI JSON spec linked
* [ ] DB schema/migrations linked
* [ ] Acceptance criteria encoded
* [ ] Contract tests executable

### Governance

* [ ] Owner/role recorded
* [ ] Feature ID unique
* [ ] Non-functional reqs captured
* [ ] Version history tracked

### Ingestion & AI

* [ ] Metadata classification fields
* [ ] Documents parse predictably
* [ ] RAG pipelines consume metadata

### Automation

* [ ] CI gates merges on validation failure
* [ ] Autogen stubs/tests from specs
* [ ] Deterministic validation only

### Iterative Updates

* [ ] Specs co-located with code
* [ ] Git diffs reviewable
* [ ] Metadata + narrative updated together

---

## 3. Scaffold (JSON-oriented)

```
/your-project-root
├── docs/
│   ├── feature-template.md       # with JSON front-matter block
│   ├── ingestion-template.md     # with JSON front-matter block
│   └── design-template.md        # with JSON front-matter block
├── schema/
│   └── spec-frontmatter.schema.json
├── api/
│   └── openapi.json              # API contract in JSON
├── db/
│   ├── schema.json               # DB schema metadata in JSON
│   └── migrations/
│       └── 0001_init.sql
├── tests/
│   ├── contract.test.json        # machine-readable test definitions
│   └── acceptance.test.json
├── .github/
│   └── workflows/
│       └── validate-spec.yml     # workflow must remain YAML for GitHub Actions
└── README.md
```

---

## 4. JSON Front-Matter Example

````markdown
```json frontmatter
{
  "spec_version": 1,
  "feature_id": "AC-INV-012",
  "owner": "platform",
  "inputs": [
    { "name": "asset_id", "type": "uuid" }
  ],
  "outputs": [
    { "name": "risk_score", "type": "number" }
  ],
  "acceptance": [
    "Given asset exists → GET /assets/{id} returns 200",
    "Score ∈ [0,100]"
  ],
  "contracts": {
    "api": "./api/openapi.json#/paths/~1assets~1{id}/get",
    "db": "./db/schema.json#Asset"
  },
  "nonfunc": {
    "latency_p95_ms": 300,
    "auth": "org_member+scope:asset:read"
  }
}
````

# Inventory Risk Scoring

Narrative, rationale, and edge cases here.

```

---

## 5. Validation in CI/CD

- **Front-matter** validated with `ajv` against `schema/spec-frontmatter.schema.json`.  
- **OpenAPI** validated with `swagger-cli` or `spectral`.  
- **DB schema** validated with SQL lint + migration diffs.  
- **Tests** executed against real endpoints or DB.  

---

## 6. Conversion Note

- Prefer JSON for all specs.  
- GitHub Actions workflows **must remain YAML**, but can invoke JSON-based validators.  
- Optional: include a converter step if you want workflows written in JSON locally.

---

## 7. Usage Guidance

1. Start every feature/design/ingestion doc with a JSON front-matter block.  
2. Maintain the schema in `/schema/spec-frontmatter.schema.json`.  
3. Keep contracts (`api/openapi.json`, `db/schema.json`) up to date.  
4. Validate automatically in CI/CD.  
5. Use the LLM for drafting/updating, but trust deterministic validators for enforcement.

```
