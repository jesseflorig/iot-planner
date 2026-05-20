<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A — first fill of template
Added sections: Core Principles (5), Technology Constraints, Development Workflow, Governance
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md — Constitution Check gates align with principles below
  ✅ spec-template.md — no structural changes required; user story format compatible
  ✅ tasks-template.md — no structural changes required; phase model compatible
Follow-up TODOs: None — all placeholders resolved
-->

# IoT Planner Constitution

## Core Principles

### I. Hardware-Accurate Modeling

All pin definitions, module footprints, and board layouts MUST accurately reflect real hardware
specifications for the Feather RP2040 and Silicognition PoE Featherwing. Phantom pins, fabricated
capabilities, or undocumented behaviors MUST NOT be introduced. Any future board or module addition
MUST be backed by a datasheet or verified hardware reference before being added to the library.

**Rationale**: Inaccurate pin models produce invalid packages that fail at assembly time. The planner
is only useful if its output can be trusted on the bench.

### II. Curated Module Library

The module library MUST contain only validated, complete sensor/module definitions. Each entry MUST
declare: required pins (type, count), power requirements, physical breadboard footprint, and any
mutual-exclusion constraints with other modules. Partial or placeholder module definitions MUST NOT
be shipped in a release build.

**Rationale**: An incomplete module silently produces a broken package. Completeness is a
gate, not a goal.

### III. Automatic & Conflict-Free Pin Allocation

When a module is added to a package, the system MUST automatically assign available, non-conflicting
pins using the standard recommended assignments from the hardware datasheet. If no valid assignment
exists, the system MUST block the addition and surface a clear error — it MUST NOT silently assign
conflicting pins. Manual pin overrides are permitted but MUST be validated at save time; any
conflict MUST be flagged visually and in exported JSON.

**Rationale**: Silent pin conflicts are the hardest bug to catch post-assembly. Fail loud,
fail early.

### IV. Visual Fidelity (SVG Breadboard View)

The SVG breadboard representation MUST accurately reflect physical Feather pin positions, breadboard
row/column numbering, and module placement. Wire routing MUST be deterministic: identical package
state MUST always produce identical SVG output. The view is a planning artifact — it MUST be
accurate enough to serve as a physical assembly guide.

**Rationale**: If the visual disagrees with the actual wiring, the planner creates more risk
than it removes.

### V. Portable & Versioned Packages

All package state MUST be fully serializable to JSON and fully recoverable from that JSON in any
future session or browser. The JSON schema MUST carry a `schemaVersion` field. localStorage
persistence MUST use the same schema as JSON export/import — no separate internal format. Breaking
schema changes MUST increment the major version and MUST include a migration path or clear user
warning on load.

**Rationale**: A planning tool that locks data inside one session has no durability. JSON
portability is the persistence contract.

## Technology Constraints

- **Platform**: Pure frontend web application — HTML, CSS, and JavaScript (or a lightweight
  framework). No backend server required; the app MUST function fully offline after load.
- **Persistence**: `localStorage` is the only permitted storage mechanism for package data. No
  server-side state, no cookies for package data.
- **SVG generation**: MUST be produced client-side (no server rendering). SVG output MUST be
  self-contained and embeddable/exportable as a standalone file if needed.
- **Dependencies**: Prefer ecosystem-standard libraries. Avoid dependencies that require a build
  server or runtime to function (i.e., the app MUST be servable as static files).
- **Accessibility**: Interactive controls (module selection, pin overrides) MUST meet WCAG 2.1 AA
  contrast and keyboard-navigation requirements.

## Development Workflow

- Features are developed on branches following the `###-feature-name` naming convention.
- Every feature MUST have a spec (`spec.md`) before implementation begins.
- A Constitution Check gate in `plan.md` MUST be completed before Phase 0 research starts and
  re-checked after Phase 1 design.
- Complexity violations (e.g., a second storage backend, a build-time render step) MUST be
  documented in the plan's Complexity Tracking table with explicit justification.
- Module library additions MUST include a datasheet reference in their definition file.

## Governance

This constitution supersedes all other guidance documents when conflicts arise. Amendments require:
1. A written rationale citing the principle being changed and why.
2. A version bump following semantic versioning (MAJOR for principle removals/redefinitions,
   MINOR for additions or material expansions, PATCH for clarifications).
3. Updated `LAST_AMENDED_DATE`.
4. Propagation review across all dependent templates (plan, spec, tasks).

All pull requests and code reviews MUST verify compliance with Principles I–V. Complexity beyond
what these principles allow MUST be justified in the plan before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-05-20 | **Last Amended**: 2026-05-20
