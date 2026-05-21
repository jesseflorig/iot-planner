# IoT Planner

A browser-based tool for planning IoT hardware packages built around Adafruit Feather-form-factor boards.

Select a board, add modules from the library, and get an SVG breadboard diagram showing pin assignments and wire routing — with conflict detection when modules compete for the same pins.

## Features

- **Board selection** — defaults to the Adafruit Feather RP2040
- **Module library** — add modules (e.g. Silicognition PoE FeatherWing) to a package
- **Auto pin assignment** — modules claim required pins automatically
- **Breadboard view** — SVG diagram with color-coded pins (Adafruit pinout scheme), orthogonal wire routing, rounded bends, and hop arcs at crossings
- **Conflict detection** — highlights pins and modules in conflict when assignments overlap
- **Persistence** — packages saved to `localStorage`
- **Import / export** — packages serialized as JSON

## Tech

React · TypeScript · Vite · Tailwind CSS · Zustand · Zod

## Development

```bash
npm install
npm run dev
```

## Extending

- **Boards** — add a file to `src/data/boards/`, implement the `Board` model, register in `index.ts`
- **Modules** — add a file to `src/data/modules/`, implement the `Module` model, register in `index.ts`
