# Research: IoT Planner — Initial Application

**Phase 0 output for** `specs/001-initial-app/plan.md`
**Date**: 2026-05-20

---

## Hardware: Adafruit Feather RP2040

**Source**: https://learn.adafruit.com/adafruit-feather-rp2040-pico/pinouts

**Decision**: Use these pin definitions as the authoritative pin map for the SVG breadboard view.

### Left Header (USB end = pin 1)

| Position | Label | GPIO  | Functions |
|----------|-------|-------|-----------|
| 1  | GND  | —     | Ground |
| 2  | 3.3V | —     | 3.3V power out (500mA max) |
| 3  | AREF | —     | Analog reference |
| 4  | A0   | GP26  | ADC0, SPI1 SCK, I2C1 SDA, PWM5A |
| 5  | A1   | GP27  | ADC1, SPI1 MOSI, I2C1 SCL, PWM5B |
| 6  | A2   | GP28  | ADC2, SPI1 MISO, PWM6A |
| 7  | A3   | GP29  | ADC3, SPI1 CS, PWM6B |
| 8  | D24  | GP24  | UART1 TX, I2C0 SDA, PWM4A |
| 9  | D25  | GP25  | UART1 RX, I2C0 SCL, PWM4B |
| 10 | D4   | GP06  | SPI0 SCK, I2C1 SDA, PWM3A |
| 11 | D13  | GP13  | SPI1 CS, UART0 RX, I2C0 SCL, PWM6B |
| 12 | D12  | GP12  | SPI1 MISO, UART0 TX, I2C0 SDA, PWM6A |
| 13 | D11  | GP11  | SPI1 MOSI, I2C1 SCL, PWM5B |
| 14 | D10  | GP10  | SPI1 SCK, I2C1 SDA, PWM5A — **PoE CS (default)** |
| 15 | D9   | GP09  | SPI1 CS, UART1 RX, I2C0 SCL, PWM4B |
| 16 | GND  | —     | Ground |

### Right Header (USB end = pin 1)

| Position | Label | GPIO  | Functions |
|----------|-------|-------|-----------|
| 1  | BAT  | —     | LiPo battery voltage |
| 2  | EN   | —     | 3.3V regulator enable |
| 3  | USB  | —     | USB 5V (when connected) |
| 4  | D6   | GP08  | SPI1 MISO, UART1 TX, I2C0 SDA, PWM4A |
| 5  | D5   | GP07  | SPI0 MOSI, I2C1 SCL, PWM3B |
| 6  | SCL  | GP03  | I2C1 SCL, SPI0 MOSI, PWM1B — **PoE I2C SCL** |
| 7  | SDA  | GP02  | I2C1 SDA, SPI0 SCK, PWM1A — **PoE I2C SDA** |
| 8  | RX   | GP01  | UART0 RX, I2C0 SDA, SPI0 CS, PWM0B |
| 9  | TX   | GP00  | UART0 TX, I2C0 SCL, SPI0 MISO, PWM0A |
| 10 | MI   | GP20  | SPI0 MISO, UART1 TX, I2C0 SDA, PWM2A — **PoE SPI MISO** |
| 11 | MO   | GP19  | SPI0 MOSI, I2C1 SCL, PWM1B — **PoE SPI MOSI** |
| 12 | SCK  | GP18  | SPI0 SCK, I2C1 SDA, PWM1A — **PoE SPI SCK** |
| 13 | D7   | GP28* | (see silkscreen) |
| 14 | D8   | GP28* | (see silkscreen) |
| 15 | RST  | —     | Reset |
| 16 | GND  | —     | Ground |

**Special pins** (not on headers):
- NeoPixel: GPIO23
- D13 LED: GPIO13 (also on header left-11)
- STEMMA QT: I2C1 (SDA/SCL)
- BOOT button, Reset button

**Form factor**: 0.9" × 2.0", 0.8" between left and right header rows. Standard Feather.

---

## Hardware: Silicognition PoE-FeatherWing

**Sources**: Crowd Supply product page, Adafruit Ethernet FeatherWing pinouts

**Decision**: These are the pins consumed on the host Feather board when the PoE-FeatherWing is installed.

### Pins consumed on Feather host

| Pin Label | GPIO  | Function on PoE-FeatherWing |
|-----------|-------|-----------------------------|
| SCK       | GP18  | W5500 SPI clock |
| MO        | GP19  | W5500 SPI MOSI |
| MI        | GP20  | W5500 SPI MISO |
| D10       | GP10  | W5500 SPI CS (default; movable via SJ1 solder jumper) |
| SDA       | GP02  | 24AA02E48 MAC EEPROM I2C SDA |
| SCL       | GP03  | 24AA02E48 MAC EEPROM I2C SCL |
| 3.3V      | —     | Powers W5500 and MAC chip |
| GND       | —     | Ground reference (multiple pins) |
| USB (5V)  | —     | PoE power output when PoE active |

**Form factor**: Standard Feather wing — stacks on top of a Feather board, sharing the same
header footprint. The RJ45 connector extends past the board edge.

**Notes**:
- Drop-in compatible with Adafruit Ethernet FeatherWing (same W5500 chip, same SPI CS default)
- IRQ and RST pads available but not connected by default
- CS pin is reconfigurable but we treat D10 as fixed for this initial release

---

## Hardware: Silicognition RP2040 Shim

**Sources**: Tindie product page, silicognition.com, CircuitPython board definitions

**Decision**: Second supported board in the board selector. Uses Feather-compatible pin labels
in CircuitPython/Arduino but has different raw GPIO routing internally.

**Key notes**:
- Compact form factor (smaller than standard Feather)
- Two 20-pin single-row headers (snapable to 12 or 16 pin)
- Pin names (A0, SDA, SCL, etc.) are Feather-compatible when using CircuitPython/Arduino
- Raw GPIO numbers differ from standard Feather RP2040 internally
- Designed to stack on top of the PoE-FeatherWing with a spacer
- Pre-installed CircuitPython with W5500 drivers and `poe_featherwing.py`

**Implication for the planner**: The RP2040 Shim's pin label names are Feather-compatible, so
module definitions that target Feather pin labels (SDA, SCL, SCK, MO, MI, D10) work on both
boards. The SVG representation will show Shim-specific physical layout (compact, different header
geometry) but use the same functional pin labels.

**Action required before implementation**: Verify exact physical pin positions from the KiCAD
files at https://github.com/xorbit/RP2040-Shim or the CircuitPython board.py definitions to
ensure SVG accuracy matches the hardware.

---

## Tech Stack

**Decision**: Mirror bracket-generator's stack exactly.

| Concern | Choice | Version | Rationale |
|---------|--------|---------|-----------|
| Framework | React | 18.3.x | Established in bracket-generator; hooks-first |
| Language | TypeScript | 5.7.x | Type safety for hardware pin data is critical |
| Build | Vite | 5.4.x | Fast HMR; minimal config |
| State | Zustand | 5.0.x | Bracket-generator pattern; simple + localStorage-friendly |
| Validation | Zod | 3.23.x | Schema-first; used for JSON import validation (FR-016) |
| Styling | Tailwind CSS | 3.4.x | Bracket-generator dark zinc palette; utility-first |
| Testing | Vitest | 2.1.x | Consistent with bracket-generator; globals mode |
| Rendering | Plain SVG | — | No 3D required; SVG is natively scalable and embeddable |

**Alternatives considered**:
- D3.js for SVG: rejected — unnecessary abstraction for static layout with deterministic re-render
- React Three Fiber: bracket-generator uses it for 3D geometry; not applicable for 2D breadboard SVG
- Fabric.js / Konva: canvas-based; SVG preferred for accessibility and embeddability

---

## UI Layout

**Decision**: Sidebar-plus-canvas, mirroring bracket-generator's BracketPage layout.

```
PlannerPage
├── Left Sidebar (w-72, bg-zinc-900)
│   ├── BoardSelector        — board dropdown (RP2040 Feather | RP2040 Shim)
│   ├── ModuleLibrary        — scrollable list of available modules; add button per module
│   ├── ActiveModules        — list of modules in current package; remove button per module
│   └── ImportExportBar      — JSON export button, JSON import (file input)
└── Main Canvas (flex-1)
    └── BreadboardView       — SVG rendering of current package state + PinTooltip on hover
```

---

## localStorage Persistence Strategy

**Decision**: Mirror bracket-generator's manual save pattern (not zustand-persist middleware).

- Store key: `iot-planner-package`
- Stored value: full serialized Package (JSON, schemaVersion: "1.0.0")
- Save on every state change (board switch, module add/remove)
- Load on store initialization; validate with Zod before applying
- If stored JSON is invalid or incompatible schemaVersion: discard and start fresh (warn user)

**Rationale**: Manual save gives full control over what gets persisted; Zod validation on load
prevents corrupt state from crashing the app.

---

## SVG Rendering Strategy

**Decision**: Generate SVG as React JSX (SVG elements as components), not string templates.

- `BreadboardView` renders a `<svg>` element directly in React
- Board pins are rendered as positioned `<rect>` or `<circle>` elements with Tailwind-compatible
  `fill` attributes based on pin status (available = neutral, in-use = accent, error = warning)
- Module footprints are rendered as labeled overlays over the breadboard grid
- Breadboard grid (rows/columns) is a static SVG background layer
- Hover tooltip is a React component absolutely positioned over the SVG via a `title` attribute
  or a custom floating div triggered by `onMouseEnter/onMouseLeave`
- SVG re-renders deterministically from Zustand store state (no internal SVG state)
