# Feature Specification: IoT Planner — Initial Application

**Feature Branch**: `001-initial-app`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: "Create the initial application. Board should be selectable, but the
default is the Adafruit RP2040 Feather. The Silicognition PoE Featherwing is a selectable module.
View should show PINs in use if the user adds the PoE Featherwing to the package. The SVG
breadboard view is the main view."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select a Board and View Its SVG Breadboard Layout (Priority: P1)

A user opens the planner and sees the Adafruit RP2040 Feather pre-selected as the active board.
The main view is an SVG rendering of the board seated on a breadboard, with all pins labeled by
their designation. The user can open a board selector and choose a different supported board; the
SVG updates to reflect the new board's physical layout and pin labels.

**Why this priority**: Every other feature depends on a board being selected and rendered. The SVG
breadboard view is the primary interface — everything else (modules, pin status) is expressed
through it.

**Independent Test**: Can be fully tested by opening the app, verifying the RP2040 Feather SVG
is shown with labeled pins on a breadboard, and confirming the SVG updates when a different board
is selected.

**Acceptance Scenarios**:

1. **Given** the app loads for the first time, **When** the main view is displayed, **Then** an
   SVG breadboard view shows the Adafruit RP2040 Feather seated on a breadboard with all pins
   labeled by designation (GPIO number and special functions such as I2C, SPI, UART).
2. **Given** a board is active, **When** the user opens the board selector and picks a different
   board, **Then** the SVG breadboard view re-renders to show the new board's physical layout and
   pin labels.
3. **Given** a board is active, **When** the user hovers over a pin in the SVG, **Then** a tooltip
   appears showing the pin's designation, supported functions (e.g., GPIO, I2C, SPI), and current
   status (available or in-use).

---

### User Story 2 - Add the PoE Featherwing and See In-Use Pins in the Breadboard View (Priority: P2)

A user adds the Silicognition PoE Featherwing from the module library. The SVG breadboard view
updates immediately: the PoE Featherwing appears placed on the breadboard alongside the Feather,
and all pins it consumes are visually marked as in-use directly within the SVG. Available and
in-use pins are distinguishable at a glance.

**Why this priority**: This is the primary functional value of the planner — seeing how a module
physically occupies the breadboard and claims pins. The SVG is the medium through which this is
communicated.

**Independent Test**: Can be fully tested by adding the PoE Featherwing to a default RP2040 Feather
package and verifying the SVG shows the module placed on the breadboard with its consumed pins
marked in-use.

**Acceptance Scenarios**:

1. **Given** a package with the RP2040 Feather selected, **When** the user adds the PoE Featherwing
   from the module library, **Then** the SVG breadboard view re-renders to include the PoE
   Featherwing placed on the breadboard next to the Feather.
2. **Given** the PoE Featherwing has been added, **When** the SVG is viewed, **Then** all pins
   consumed by the PoE Featherwing are visually distinguished as "in use" (e.g., color-coded),
   and remaining pins are shown as available.
3. **Given** the PoE Featherwing has been added, **When** the user removes it from the package,
   **Then** the SVG re-renders without the module and the previously in-use pins revert to
   available.
4. **Given** two modules with overlapping pin requirements are both added, **When** the SVG is
   viewed, **Then** the conflicting module is rendered in an error/disconnected state and the
   conflict is indicated in the active module list.

---

### User Story 3 - Save and Load a Package via LocalStorage (Priority: P3)

A user builds a package (board + modules), saves it, closes the browser tab, and returns later.
The package is restored automatically from localStorage. The user can also export the package as
a JSON file and re-import it in a fresh session.

**Why this priority**: Persistence makes the tool useful across sessions. Without it, every
session starts from scratch.

**Independent Test**: Can be fully tested by saving a package, clearing app state, reloading the
page, and verifying the package is restored. Export/import can be tested without a page reload.

**Acceptance Scenarios**:

1. **Given** a package has been configured, **When** the user saves it, **Then** the package
   persists across a page reload and is restored to its previous state.
2. **Given** a saved package, **When** the user exports it, **Then** a JSON file is downloaded
   containing all package data (board, modules, pin assignments).
3. **Given** a valid exported JSON file, **When** the user imports it, **Then** the package is
   restored to the state described in the file.
4. **Given** an invalid or incompatible JSON file, **When** the user attempts to import it,
   **Then** a clear error is shown and the current package is not modified.

---

### Edge Cases

- What happens when the user switches boards while modules are already added? (Module list should
  be cleared or flagged as incompatible, since pin maps and physical layouts differ by board.)
- What happens if localStorage is unavailable or full? (User should be warned; export/import
  still works as fallback.)
- What if a module requires a pin already consumed by another module, or a pin not present on
  the selected board? The module is still added to the package but rendered in an error/disconnected
  state in both the module list and the SVG, clearly indicating unresolved conflicts. The user
  can resolve conflicts by removing the offending module.
- What if the SVG breadboard area is too small to display all placed modules legibly? (The view
  should scroll or scale to accommodate; no content should be clipped silently.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display the Adafruit RP2040 Feather as the default selected
  board on first load.
- **FR-002**: Users MUST be able to select from the two supported boards: the Adafruit RP2040
  Feather (default) and the Silicognition RP2040 Shim.
- **FR-003**: The main view MUST be an SVG rendering of the active board seated on a breadboard,
  with all pins labeled by designation (GPIO number and special functions).
- **FR-004**: The SVG breadboard view MUST update immediately whenever the board selection or
  module configuration changes.
- **FR-005**: Users MUST be able to browse a curated module library and add modules to the active
  package.
- **FR-006**: The Silicognition PoE Featherwing MUST be available in the module library.
- **FR-007**: When a module is added, the system MUST attempt to assign the pins required by that
  module. If all required pins are available, they are assigned and the module enters a normal
  state. If any required pins are unavailable or absent on the active board, the module is added
  in an error/disconnected state with the conflict identified.
- **FR-008**: When a module is added, the SVG breadboard view MUST re-render to show the module
  placed on the breadboard. Modules in an error state MUST be visually distinguished from
  healthy modules (e.g., muted color, error indicator).
- **FR-009**: In-use and available pins MUST be visually distinguishable within the SVG (e.g.,
  by color or label).
- **FR-010**: Hovering over any pin in the SVG MUST display a tooltip showing its designation,
  supported functions, and current status (available / in-use).
- **FR-011**: Users MUST be able to remove a module from the package; the SVG MUST re-render with
  the module removed and its pins returned to available.
- **FR-012**: The application MUST save the current package (board + modules + pin assignments)
  to localStorage on each change.
- **FR-013**: On load, the application MUST restore the last saved package from localStorage if
  one exists, including re-rendering the correct SVG state.
- **FR-014**: Users MUST be able to export the current package as a JSON file.
- **FR-015**: Users MUST be able to import a package from a JSON file, replacing the current
  package state and re-rendering the SVG accordingly.
- **FR-016**: Imported JSON MUST be validated; invalid or incompatible files MUST surface a
  user-facing error without corrupting the current package.

### Key Entities

- **Board**: A supported microcontroller board. Has a name, a list of pins, physical dimensions,
  and breadboard placement metadata. The RP2040 Feather is the default.
- **Pin**: A single electrical connection point on a board. Has a designation, supported functions
  (GPIO, I2C, SPI, UART, power, ground), a breadboard row/column position, and a status
  (available / in-use).
- **Module**: A hardware add-on (sensor, wing, etc.) that consumes one or more pins. Has a name,
  required pin list, physical breadboard footprint, and compatibility constraints.
- **Package**: The user's current configuration — one Board plus zero or more Modules, with all
  pin assignments resolved.
- **Breadboard View**: The SVG rendering of the current Package. Reflects board placement, module
  placement, and per-pin status. Re-renders deterministically from Package state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can select a board, add the PoE Featherwing, and see the module placed on the
  breadboard SVG with in-use pins marked — all within 60 seconds on first use, no documentation
  required.
- **SC-002**: All pins required by the PoE Featherwing are correctly marked in-use in the SVG
  immediately after the module is added (zero incorrect or missing pin indicators).
- **SC-003**: The SVG breadboard view accurately reflects the physical layout of the RP2040
  Feather and PoE Featherwing — pin positions and labels match the hardware datasheets.
- **SC-004**: A saved package survives a full page reload and is restored — including the correct
  SVG state — without any loss of board selection or module configuration.
- **SC-005**: A package exported as JSON can be imported in a fresh session and produce an
  identical package state and SVG rendering to the original.
- **SC-006**: Switching boards clears or flags incompatible modules — no invalid pin assignments
  remain silently after a board change.

## Clarifications

### Session 2026-05-20

- Q: What UI framework, CSS approach, build tooling, and state management patterns should this app adopt? → A: Adopt patterns from bracket-generator — React 18 + TypeScript, Tailwind CSS, Vite, Zustand for state (with localStorage persistence), Zod for schema validation, Vitest for tests. UI layout follows the bracket-generator pattern: a sidebar panel (board selector + module library + active modules) and a main central view (the SVG breadboard canvas).
- Q: What is the second supported board (beyond the RP2040 Feather)? → A: Silicognition RP2040 Shim.
- Q: How does the user inspect a pin in the SVG? → A: Hover tooltip showing pin designation, supported functions, and current status (available / in-use).
- Q: How are module pin conflicts surfaced to the user? → A: The module is added to the package but rendered in an error/disconnected state (visually flagged) to indicate unresolved conflicts; it is not blocked from being added.

## Assumptions

- The initial release supports exactly two boards: the Adafruit RP2040 Feather (default) and the
  Silicognition RP2040 Shim. The Feather is always the default selection.
- The Silicognition PoE Featherwing is the only module required for this initial release; the
  module library structure MUST support adding more in future iterations.
- The application runs entirely in the browser — no server, no user accounts, no cloud sync.
- The technology stack mirrors bracket-generator: React 18 + TypeScript, Tailwind CSS, Vite,
  Zustand (state + localStorage), Zod (schema validation), Vitest (tests).
- The UI layout follows the bracket-generator sidebar-plus-canvas pattern: a left sidebar
  (board selector, module library, active module list) and a main SVG breadboard canvas.
- Pin assignments for the PoE Featherwing are fixed and non-configurable in this release (it
  consumes the same pins on every RP2040 Feather installation).
- Export/import uses JSON with a `schemaVersion` field as required by the project constitution.
- The SVG breadboard view is the primary UI; there is no separate text-based pin list view.
- SVG breadboard layouts for the RP2040 Feather and PoE Featherwing are based on their published
  datasheets; physical accuracy is a first-class requirement.
