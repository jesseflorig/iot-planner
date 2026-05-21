# Data Model: IoT Planner — Initial Application

**Phase 1 output for** `specs/001-initial-app/plan.md`
**Date**: 2026-05-20

---

## Entities

### PinFunction

Enum of electrical functions a pin may support.

```typescript
type PinFunction =
  | "GPIO"
  | "ADC"
  | "I2C_SDA"
  | "I2C_SCL"
  | "SPI_SCK"
  | "SPI_MOSI"
  | "SPI_MISO"
  | "SPI_CS"
  | "UART_TX"
  | "UART_RX"
  | "PWM"
  | "POWER_3V3"
  | "POWER_5V"
  | "POWER_BAT"
  | "POWER_EN"
  | "GND"
  | "RESET"
  | "AREF"
  | "USB_5V";
```

### Pin

A single electrical connection point on a board header.

```typescript
interface Pin {
  id: string;            // unique within a board, e.g. "left-4"
  label: string;         // silkscreen label, e.g. "A0", "SDA", "GND"
  gpio: number | null;   // RP2040 GPIO number; null for power/ground/control pins
  functions: PinFunction[];
  headerSide: "left" | "right";
  position: number;      // 1–N along the header (1 = USB/top end)
  type: "gpio" | "power" | "ground" | "control";
}
```

**Validation rules**:
- `id` must be unique within a board
- `position` must be ≥ 1
- `gpio` must be null when `type` is not "gpio"
- `functions` must be non-empty

### Board

A supported microcontroller board definition.

```typescript
interface Board {
  id: string;             // e.g. "adafruit-feather-rp2040"
  name: string;           // display name
  pins: Pin[];
  headerLength: number;   // number of pins per side (e.g. 16 for Feather)
  breadboardSpan: number; // number of breadboard rows the board occupies
  datasheetUrl: string;   // required per constitution Principle I
}
```

**Built-in boards** (defined in `src/data/boards/`):
- `adafruit-feather-rp2040` — 16-pin headers, Feather form factor
- `silicognition-rp2040-shim` — compact form, Feather-compatible pin labels

### Module

A hardware add-on that can be added to a package.

```typescript
interface Module {
  id: string;              // e.g. "silicognition-poe-featherwing"
  name: string;            // display name
  requiredPinLabels: string[];  // Feather pin labels required, e.g. ["SCK", "MO", "MI", "D10", "SDA", "SCL"]
  breadboardSpan: number;  // rows occupied on breadboard
  datasheetUrl: string;    // required per constitution Principle II
}
```

**Built-in modules** (defined in `src/data/modules/`):
- `silicognition-poe-featherwing` — consumes: SCK, MO, MI, D10, SDA, SCL (+ 3V3, GND, USB 5V)

### PinAssignment

Records which module has claimed a specific pin.

```typescript
interface PinAssignment {
  pinId: string;     // Pin.id
  moduleId: string;  // Module.id
}
```

### ModuleInstance

The runtime state of a module added to the current package.

```typescript
interface ModuleInstance {
  moduleId: string;
  status: "healthy" | "error";
  conflicts: string[];  // pin ids that could not be assigned
}
```

**State transitions**:
- Added with all pins available → `healthy`
- Added with one or more pins already claimed or absent → `error` (conflicts listed)
- Host board changed and pins no longer exist → `error`
- Conflicting module removed → re-evaluated → may transition to `healthy`

### Package

The complete user configuration — persisted to localStorage and exported as JSON.

```typescript
interface Package {
  schemaVersion: "1.0.0";
  boardId: string;
  modules: ModuleInstance[];
  pinAssignments: PinAssignment[];
}
```

**Invariants**:
- Exactly one `boardId` is active at all times
- `pinAssignments` contains at most one entry per `pinId` (enforced by allocation logic)
- Every `PinAssignment.moduleId` refers to a `ModuleInstance.moduleId` in `modules[]`
- A `ModuleInstance` with `status: "error"` has an empty `pinAssignments` entry (pins not claimed)

---

## Zod Schemas (implementation guide)

```typescript
// src/models/pin.ts
const pinSchema = z.object({
  id: z.string(),
  label: z.string(),
  gpio: z.number().nullable(),
  functions: z.array(pinFunctionSchema).min(1),
  headerSide: z.enum(["left", "right"]),
  position: z.number().int().min(1),
  type: z.enum(["gpio", "power", "ground", "control"]),
});

// src/models/module.ts
const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  requiredPinLabels: z.array(z.string()).min(1),
  breadboardSpan: z.number().int().min(1),
  datasheetUrl: z.string().url(),
});

// src/models/package.ts
const packageSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  boardId: z.string(),
  modules: z.array(moduleInstanceSchema),
  pinAssignments: z.array(pinAssignmentSchema),
});
```

---

## Pin Allocation Logic

When a module is added to a package:

```
1. Resolve board's pins by label for each label in module.requiredPinLabels
2. For each resolved pin:
   a. If pin not found on board → add to conflicts[]
   b. If pin already in pinAssignments → add to conflicts[]
   c. Otherwise → create PinAssignment(pinId, moduleId)
3. If conflicts[] is empty → ModuleInstance.status = "healthy"
   If conflicts[] is non-empty → ModuleInstance.status = "error", no PinAssignments created
```

When board is switched:
```
1. Clear all pinAssignments
2. For each existing ModuleInstance, re-run allocation against new board
3. Modules whose required pins don't exist on new board → status = "error"
```

---

## localStorage Schema

Key: `iot-planner-package`
Value: JSON-serialized `Package` (validated with `packageSchema` on load)

On load failure (invalid JSON or wrong schemaVersion): discard, initialize empty package,
surface warning to user.

---

## SVG Rendering Model

The `BreadboardView` component derives all visual state from `Package` + board/module definitions:

```
Pin color:
  available   → zinc-300 (neutral)
  in-use      → sky-500 (accent)
  error/conflict → amber-500 (warning)
  power/GND   → slate-500 (muted)

Module overlay:
  healthy     → border sky-500
  error       → border amber-500 with error icon

Breadboard:
  grid rows labeled A-E / F-J (or numeric) — static SVG layer
  board placement: fixed left column
  module placement: adjacent to board, stacked vertically
```
