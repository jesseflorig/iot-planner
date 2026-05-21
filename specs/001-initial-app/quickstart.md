# Quickstart: IoT Planner

**Validation guide for** `specs/001-initial-app`

---

## Prerequisites

- Node.js 20+ and npm
- A modern browser (Chrome, Firefox, Safari, Edge)

---

## Setup

```bash
# From repo root
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Validating User Story 1 — Board selection + SVG breadboard view

1. Open the app. The **Adafruit RP2040 Feather** should be pre-selected in the board selector.
2. The main view should show an SVG breadboard with the Feather board seated on it, all pins
   labeled (A0, SDA, SCL, etc.).
3. In the board selector, switch to **Silicognition RP2040 Shim**. The SVG should update to show
   the Shim's layout.
4. Hover over any pin — a tooltip should appear showing the pin's label, GPIO number, supported
   functions, and current status (available).

**Pass criteria**: SVG renders on load, updates on board switch, tooltip appears on hover.

---

## Validating User Story 2 — Add PoE Featherwing, see in-use pins

1. Select the **Adafruit RP2040 Feather** as the active board.
2. In the module library, click **Add** next to **Silicognition PoE-FeatherWing**.
3. The SVG should re-render showing the PoE Featherwing placed on the breadboard.
4. The following pins should now be visually marked in-use (sky/blue color): SCK, MO, MI, D10, SDA, SCL.
5. Hover over an in-use pin — tooltip should show status as "in-use" and the module that claims it.
6. Click **Remove** next to the PoE Featherwing in the active modules list. SVG re-renders, pins
   return to available (neutral color).

**Pass criteria**: Correct pins change color on add; revert on remove; tooltip shows correct status.

---

## Validating conflict state

1. Add a hypothetical second module that also requires SDA/SCL (or temporarily duplicate the PoE
   Featherwing in the module registry for testing).
2. The second module should appear in the active module list with an error indicator.
3. In the SVG, the conflicting module should render with a muted/amber color, not sky-blue.
4. Removing the first module should allow re-evaluation; if pins are now free, the second module
   resolves to healthy.

---

## Validating User Story 3 — Save, reload, export, import

**Reload test**:
1. Configure a package (Feather + PoE Featherwing).
2. Close the browser tab. Open a new tab and navigate to http://localhost:5173.
3. The same package should be restored — same board selected, same module present, SVG matches.

**Export test**:
1. Click **Export JSON**. A file named `iot-package.json` should download.
2. Open the file — it should contain `"schemaVersion": "1.0.0"`, the board ID, the module, and
   pin assignments.

**Import test**:
1. Clear the current package (switch board or remove all modules).
2. Click **Import JSON** and select the downloaded file.
3. The package should be fully restored to its previous state, including SVG.

**Invalid import test**:
1. Edit the JSON file to change `schemaVersion` to `"2.0.0"`.
2. Import the file — an error message should appear and the current package should be unchanged.

---

## Running tests

```bash
npm run test
```

Tests cover: pin allocation logic, conflict detection, Zod schema validation, package
serialization/deserialization round-trips.

---

## Building for production

```bash
npm run build
```

Output in `dist/` — fully static, no server required.
