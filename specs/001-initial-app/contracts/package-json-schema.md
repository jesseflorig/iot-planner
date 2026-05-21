# Contract: Package JSON Export/Import Schema

**Interface type**: Data format (JSON file — browser download / file input)
**Used by**: FR-014 (export), FR-015/016 (import + validation)
**Version**: 1.0.0

---

## Purpose

This schema defines the canonical serialized form of a Package — both what is written to
localStorage and what is produced by JSON export / consumed by JSON import. The two formats
are identical (constitution Principle V: "localStorage and export/import use the same schema").

---

## Schema

```json
{
  "schemaVersion": "1.0.0",
  "boardId": "adafruit-feather-rp2040",
  "modules": [
    {
      "moduleId": "silicognition-poe-featherwing",
      "status": "healthy",
      "conflicts": []
    }
  ],
  "pinAssignments": [
    { "pinId": "right-12", "moduleId": "silicognition-poe-featherwing" },
    { "pinId": "right-11", "moduleId": "silicognition-poe-featherwing" },
    { "pinId": "right-10", "moduleId": "silicognition-poe-featherwing" },
    { "pinId": "left-14",  "moduleId": "silicognition-poe-featherwing" },
    { "pinId": "right-7",  "moduleId": "silicognition-poe-featherwing" },
    { "pinId": "right-6",  "moduleId": "silicognition-poe-featherwing" }
  ]
}
```

---

## Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `schemaVersion` | `"1.0.0"` (literal) | Yes | Identifies the schema version for forward-compat checks |
| `boardId` | string | Yes | ID of the active board (must match a known board definition) |
| `modules` | ModuleInstance[] | Yes | Ordered list of modules in the package |
| `modules[].moduleId` | string | Yes | ID of the module definition |
| `modules[].status` | `"healthy"` \| `"error"` | Yes | Pin allocation outcome |
| `modules[].conflicts` | string[] | Yes | Pin IDs that could not be assigned (empty if healthy) |
| `pinAssignments` | PinAssignment[] | Yes | All successfully assigned pin→module mappings |
| `pinAssignments[].pinId` | string | Yes | Pin ID (scoped to active board's header) |
| `pinAssignments[].moduleId` | string | Yes | Module that owns this pin |

---

## Validation Rules (enforced on import)

1. `schemaVersion` MUST equal `"1.0.0"` (exact string match) — incompatible version → error
2. `boardId` MUST match a known board ID in the app's board registry
3. Every `modules[].moduleId` MUST match a known module ID
4. Every `pinAssignments[].pinId` MUST exist on the resolved board
5. `pinAssignments` MUST NOT contain duplicate `pinId` values
6. Every `pinAssignments[].moduleId` MUST reference a `moduleId` present in `modules[]`

On any validation failure: surface error to user, do not apply the import.

---

## Versioning Policy

Schema version follows semver (constitution Principle V):
- **PATCH** (1.0.x): additive optional fields; loaders MUST ignore unknown fields
- **MINOR** (1.x.0): new required fields added; requires migration logic on load
- **MAJOR** (x.0.0): breaking structural change; old files rejected with clear user message

---

## Empty Package (initial state / after board switch)

```json
{
  "schemaVersion": "1.0.0",
  "boardId": "adafruit-feather-rp2040",
  "modules": [],
  "pinAssignments": []
}
```
