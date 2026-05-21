---
description: "Task list for IoT Planner — Initial Application"
---

# Tasks: IoT Planner — Initial Application

**Input**: Design documents from `specs/001-initial-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in all descriptions

## Path Conventions

All source files live under `src/` at the repository root.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold the project so development can begin.

- [ ] T001 Initialize Vite + React + TypeScript project at repo root (`npm create vite@latest . -- --template react-ts`)
- [ ] T002 [P] Install and configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, import in `src/index.css`)
- [ ] T003 [P] Install dependencies: Zustand 5, Zod 3, Vitest 2 (`package.json`)
- [ ] T004 [P] Configure Vitest in `vite.config.ts` (globals: true, environment: node — mirror bracket-generator config)
- [ ] T005 Create `src/main.tsx` entry point mounting `<App />` to `#root`
- [ ] T006 Create top-level `src/App.tsx` rendering `<PlannerPage />` placeholder

**Checkpoint**: `npm run dev` starts the dev server with a blank page; `npm run test` runs with no failures.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model, board/module definitions, and store — everything user stories build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 [P] Create `src/models/pin.ts` — `PinFunction` union type, `Pin` interface, `pinSchema` Zod schema (per data-model.md)
- [ ] T008 [P] Create `src/models/board.ts` — `Board` interface, `boardSchema` Zod schema
- [ ] T009 [P] Create `src/models/module.ts` — `Module` interface, `moduleSchema` Zod schema
- [ ] T010 Create `src/models/package.ts` — `PinAssignment`, `ModuleInstance`, `Package` interfaces and Zod schemas; `packageSchema` with `schemaVersion: "1.0.0"` literal (per contracts/package-json-schema.md)
- [ ] T011 Create `src/data/boards/feather-rp2040.ts` — full 32-pin definition for Adafruit Feather RP2040 (left header pins 1–16 and right header pins 1–16 per research.md pin tables)
- [ ] T012 Create `src/data/boards/rp2040-shim.ts` — Silicognition RP2040 Shim board definition with Feather-compatible pin labels (note: mark GPIO numbers as unverified pending KiCAD file review per research.md)
- [ ] T013 Create `src/data/modules/poe-featherwing.ts` — Silicognition PoE-FeatherWing definition; `requiredPinLabels: ["SCK", "MO", "MI", "D10", "SDA", "SCL"]`, `datasheetUrl` set per research.md
- [ ] T014 Create `src/logic/pinAllocation.ts` — `allocatePins(board, module, existingAssignments)` returns `{ assignments: PinAssignment[], conflicts: string[] }`; `reEvaluateAll(board, modules)` re-runs allocation for all modules after a board switch
- [ ] T015 Create `src/store/plannerStore.ts` — Zustand store with: `board`, `moduleInstances`, `pinAssignments` state; actions: `setBoard(boardId)`, `addModule(moduleId)`, `removeModule(moduleId)`; localStorage save on every state change (key: `iot-planner-package`); load + Zod-validate on initialization

**Checkpoint**: All models, data definitions, allocation logic, and store in place. `npm run test` passes unit tests for T014 and T015.

---

## Phase 3: User Story 1 — Board Selection + SVG Breadboard View (Priority: P1) 🎯 MVP

**Goal**: Render the RP2040 Feather on a breadboard SVG; switch to the RP2040 Shim; hover pins for a tooltip.

**Independent Test**: Open the app — see the Feather on a breadboard with labeled pins. Switch board — layout updates. Hover a pin — tooltip appears with designation, functions, and status.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create `src/svg/breadboardLayout.ts` — coordinate functions: `boardToSvg(board)` returns pin `{ x, y, label, status }` positions; `gridBackground(rows, cols)` returns SVG path data for the breadboard grid
- [ ] T017 [P] [US1] Create `src/components/PinTooltip.tsx` — floating div shown on `onMouseEnter` of a pin element; displays label, GPIO, functions[], status; hides on `onMouseLeave`
- [ ] T018 [US1] Create `src/components/BreadboardView.tsx` — `<svg>` component reading `board` and `pinAssignments` from Zustand store; renders grid background layer, board pin circles/rects with color by status (zinc-300 = available, sky-500 = in-use, amber-500 = error, slate-500 = power/GND), pin labels, and `<PinTooltip>` on hover (depends on T016, T017)
- [ ] T019 [US1] Create `src/components/BoardSelector.tsx` — dropdown `<select>` with "Adafruit RP2040 Feather" and "Silicognition RP2040 Shim" options; calls `setBoard(boardId)` on change; shows active board name
- [ ] T020 [US1] Create `src/components/PlannerPage.tsx` — sidebar (w-72, bg-zinc-900) + main canvas (flex-1) layout; renders `<BoardSelector>` at top of sidebar; renders `<BreadboardView>` in main area (depends on T018, T019)
- [ ] T021 [US1] Wire `<PlannerPage>` into `src/App.tsx` replacing placeholder

**Checkpoint**: App loads showing the RP2040 Feather SVG with labeled pins. Board switch re-renders SVG. Pin hover shows tooltip. All User Story 1 acceptance scenarios pass.

---

## Phase 4: User Story 2 — Add PoE Featherwing, See In-Use Pins (Priority: P2)

**Goal**: Add the PoE Featherwing from the module library; SVG re-renders with module placed and pins marked in-use; conflict state shown for overlapping modules.

**Independent Test**: Add PoE Featherwing — SVG shows module with sky-blue in-use pins (SCK, MO, MI, D10, SDA, SCL). Remove it — pins revert to available. Add a second conflicting module — it renders amber/error.

### Implementation for User Story 2

- [ ] T022 [P] [US2] Extend `src/svg/breadboardLayout.ts` — add `moduleToSvg(module, board, status)` returning positioned module overlay rect + label with color based on `ModuleInstance.status` (sky border = healthy, amber border = error)
- [ ] T023 [P] [US2] Create `src/components/ModuleLibrary.tsx` — scrollable list of all available modules (from `src/data/modules/`); each entry shows module name and an **Add** button; calls `addModule(moduleId)` on click; disables Add button if module already in package
- [ ] T024 [P] [US2] Create `src/components/ActiveModules.tsx` — list of `ModuleInstance[]` from store; each entry shows module name, a status indicator (healthy = sky dot, error = amber warning icon with tooltip listing conflicting pins), and a **Remove** button calling `removeModule(moduleId)`
- [ ] T025 [US2] Update `src/components/BreadboardView.tsx` — add module overlay rendering layer using `moduleToSvg()`; in-use pins now colored sky-500; conflicting module pins colored amber-500 (depends on T022)
- [ ] T026 [US2] Add `<ModuleLibrary>` and `<ActiveModules>` to sidebar in `src/components/PlannerPage.tsx` (depends on T023, T024)

**Checkpoint**: PoE Featherwing can be added and removed. Correct pins change color in SVG. Conflict scenario renders amber. All User Story 2 acceptance scenarios pass.

---

## Phase 5: User Story 3 — Save, Load, Export, Import (Priority: P3)

**Goal**: Package persists across page reloads via localStorage. JSON export downloads a valid package file. JSON import restores package state. Invalid JSON shows an error without corrupting state.

**Independent Test**: Build a package → reload page → same state restored. Export → valid JSON with schemaVersion. Import the file in a fresh session → identical state. Import bad JSON → error shown, state unchanged.

### Implementation for User Story 3

- [ ] T027 [P] [US3] Add localStorage persistence to `src/store/plannerStore.ts` — `saveToStorage(package)` serializes Package to `iot-planner-package` key; `loadFromStorage()` reads, Zod-validates, and returns Package or null (invalid → discard + warn)
- [ ] T028 [P] [US3] Create `src/components/ImportExportBar.tsx` — **Export JSON** button that calls `JSON.stringify(currentPackage)` and triggers a browser file download as `iot-package.json`; hidden `<input type="file" accept=".json">` triggered by **Import JSON** button; on file select: parse JSON, validate with `packageSchema`, on success call store action to load it, on failure show inline error message
- [ ] T029 [US3] Add `<ImportExportBar>` to bottom of sidebar in `src/components/PlannerPage.tsx` (depends on T028)
- [ ] T030 [US3] Verify `src/store/plannerStore.ts` auto-saves on every state change (setBoard, addModule, removeModule all trigger `saveToStorage`); verify `loadFromStorage()` is called on store initialization and populates state (depends on T027)

**Checkpoint**: Full reload restores package. Export produces valid JSON matching the contract schema. Import restores state. Invalid import shows error. All User Story 3 acceptance scenarios pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improve UX, edge cases, and production readiness across all stories.

- [ ] T031 [P] Handle localStorage unavailable/full — wrap all `localStorage` calls in try/catch in `src/store/plannerStore.ts`; show sidebar warning banner when storage fails
- [ ] T032 [P] Handle board-switch with active modules — when `setBoard()` is called with existing modules, call `reEvaluateAll()` and update `ModuleInstance.status` for all modules; show a brief sidebar notification if any modules became incompatible
- [ ] T033 [P] Handle SVG overflow — add `overflow: auto` scroll wrapper around `<BreadboardView>` in `src/components/PlannerPage.tsx` so large module stacks don't clip
- [ ] T034 [P] Accessibility — add `aria-label` to all interactive SVG pin elements; ensure board selector and module buttons are keyboard-navigable; verify WCAG 2.1 AA contrast for pin status colors
- [ ] T035 Run `quickstart.md` validation scenarios end-to-end in browser; fix any discrepancies
- [ ] T036 [P] Production build — run `npm run build`; verify `dist/` is self-contained static output with no server dependency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational completion — no dependency on US2/US3
- **US2 (Phase 4)**: Depends on Foundational completion — integrates with US1 SVG component
- **US3 (Phase 5)**: Depends on Foundational completion (store must exist) — independent of US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Can start after Foundational — extends BreadboardView from US1 (T025 depends on T018)
- **US3 (P3)**: Can start after Foundational — store persistence layer already scaffolded in T015

### Within Each User Story

- Utility/layout functions (breadboardLayout.ts) before rendering components
- Models before store actions
- Store actions before UI components that read from store
- Sub-components before page-level assembly tasks

### Parallel Opportunities

- T007, T008, T009 — model files have no cross-dependencies, run in parallel
- T016, T017 — utility and tooltip have no dependency on each other, run in parallel
- T022, T023, T024 — US2 leaf components have no cross-dependencies, run in parallel
- T027, T028 — storage logic and import/export UI are independent, run in parallel
- T031, T032, T033, T034 — all polish tasks touch different files

---

## Parallel Example: Phase 2 Foundational

```bash
# Run in parallel:
Task T007: Create src/models/pin.ts
Task T008: Create src/models/board.ts
Task T009: Create src/models/module.ts

# Then sequentially:
Task T010: Create src/models/package.ts  (needs pin + module types)
Task T011: Create src/data/boards/feather-rp2040.ts  (needs Board + Pin types)
Task T012: Create src/data/boards/rp2040-shim.ts
Task T013: Create src/data/modules/poe-featherwing.ts  (needs Module type)
Task T014: Create src/logic/pinAllocation.ts  (needs all models + data)
Task T015: Create src/store/plannerStore.ts  (needs logic + data)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **CRITICAL, blocks everything**
3. Complete Phase 3: User Story 1 (board selector + SVG breadboard + pin tooltip)
4. **STOP and VALIDATE**: Open app, verify SVG renders, board switch works, tooltips appear
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → SVG breadboard with board switching (MVP)
3. User Story 2 → Module add/remove with pin status in SVG
4. User Story 3 → Persistence, export, import
5. Polish → edge cases and production build

---

## Notes

- [P] tasks touch different files with no blocking dependencies
- [Story] label maps each task to its user story for traceability
- T012 (RP2040 Shim): mark GPIO numbers as provisional until KiCAD file verified (see research.md)
- US2 shares BreadboardView with US1 — T025 extends T018; do not rewrite from scratch
- Tests are not included in this task list; add a TDD pass with `/tdd` if desired
