import { useRef, useState } from 'react'
import { usePlannerStore } from '../store/plannerStore'
import { getBoardById } from '../data/boards'
import { getModuleById } from '../data/modules'
import {
  boardToSvg, moduleToSvg, svgViewBox,
  PIN_RADIUS, PIN_SPACING, BOARD_OFFSET_X, BOARD_INSET, BOARD_OFFSET_Y, HEADER_GAP, MODULE_OFFSET_X,
  type PinLayout,
} from '../svg/breadboardLayout'
import { PinTooltip } from './PinTooltip'

// Adafruit-scheme function colors (adapted for dark mode)
const FUNC_COLORS: Record<string, string> = {
  gnd:     '#52525b',  // zinc-600
  power:   '#f87171',  // red-400
  control: '#a78bfa',  // violet-400
  adc:     '#4ade80',  // green-400  — matches Adafruit #24FF24
  i2c:     '#2dd4bf',  // teal-400   — matches Adafruit #009292
  spi:     '#93c5fd',  // blue-300   — matches Adafruit #B6DBFF
  uart:    '#60a5fa',  // blue-400   — matches Adafruit #6DB6FF
  pwm:     '#c084fc',  // purple-400 — matches Adafruit #B66DFF
  gpio:    '#facc15',  // yellow-400 — matches Adafruit #FFFF6D
}

const POWER_FNS = new Set(['POWER_3V3', 'POWER_5V', 'POWER_BAT', 'USB_5V'])
const CONTROL_FNS = new Set(['RESET', 'POWER_EN'])
const I2C_FNS = new Set(['I2C_SDA', 'I2C_SCL'])
const SPI_FNS = new Set(['SPI_SCK', 'SPI_MOSI', 'SPI_MISO', 'SPI_CS'])
const UART_FNS = new Set(['UART_TX', 'UART_RX'])
const PIN_FUNCTION_NAMES = new Set([
  'GPIO', 'ADC',
  'I2C_SDA', 'I2C_SCL',
  'SPI_SCK', 'SPI_MOSI', 'SPI_MISO', 'SPI_CS',
  'UART_TX', 'UART_RX',
  'PWM',
  'POWER_3V3', 'POWER_5V', 'POWER_BAT', 'POWER_EN',
  'GND', 'RESET', 'AREF', 'USB_5V',
])

function pinFunctionColor(fns: string[]): string {
  if (fns.includes('GND'))                    return FUNC_COLORS.gnd
  if (fns.some(f => POWER_FNS.has(f)))        return FUNC_COLORS.power
  if (fns.some(f => CONTROL_FNS.has(f)))      return FUNC_COLORS.control
  if (fns.includes('ADC') || fns.includes('AREF')) return FUNC_COLORS.adc
  if (fns.some(f => I2C_FNS.has(f)))          return FUNC_COLORS.i2c
  if (fns.some(f => SPI_FNS.has(f)))          return FUNC_COLORS.spi
  if (fns.some(f => UART_FNS.has(f)))         return FUNC_COLORS.uart
  if (fns.includes('PWM'))                    return FUNC_COLORS.pwm
  return FUNC_COLORS.gpio
}

const MODULE_BORDER: Record<string, string> = {
  healthy: '#0ea5e9',
  error:   '#f59e0b',
}

export function BreadboardView() {
  const { boardId, pinAssignments, moduleInstances } = usePlannerStore()
  const board = getBoardById(boardId)
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredPin, setHoveredPin] = useState<PinLayout | null>(null)

  if (!board) return <div className="text-zinc-500 p-8">Board not found.</div>

  const pinLayouts = boardToSvg(board, pinAssignments, moduleInstances)

  const gridRows = board.headerLength
  const leftX = BOARD_OFFSET_X
  const rightX = BOARD_OFFSET_X + PIN_SPACING + HEADER_GAP

  // Orthogonal wire routing with hop arcs at crossings
  const STUB            = PIN_SPACING          // horizontal extension before first turn
  const BOARD_RIGHT_EDGE = rightX + 16         // right edge of board rect
  const X_LEFT_CHAN     = BOARD_OFFSET_X - BOARD_INSET - STUB // left routing channel (outside board)
  const CHAN_START      = BOARD_RIGHT_EDGE + STUB // first vertical channel in gap
  const CHAN_STEP       = 16

  const totalWireChannels = moduleInstances
    .filter(inst => inst.status === 'healthy')
    .reduce((sum, inst) => {
      const mod = getModuleById(inst.moduleId)
      return sum + (mod?.requiredPinLabels.length ?? 0)
    }, 0)
  const moduleStartX = totalWireChannels > 0
    ? CHAN_START + totalWireChannels * CHAN_STEP + 16
    : MODULE_OFFSET_X

  let nextModuleY = BOARD_OFFSET_Y
  const MODULE_STACK_GAP = 24
  const allModuleLayouts = moduleInstances.map(inst => {
    const mod = getModuleById(inst.moduleId)
    if (!mod) return null
    const layout = moduleToSvg(mod, inst, moduleStartX, nextModuleY)
    nextModuleY += layout.height + MODULE_STACK_GAP
    return { layout, mod, inst }
  }).filter(Boolean) as { layout: ReturnType<typeof moduleToSvg>; mod: ReturnType<typeof getModuleById> & {}; inst: typeof moduleInstances[number] }[]
  const moduleBottomY = allModuleLayouts.reduce((max, { layout }) => Math.max(max, layout.y + layout.height), 0)

  const pinIdToLabel = new Map(pinLayouts.map(p => [p.id, p.label]))
  const HOP_R           = 4
  const BOARD_BOTTOM_Y  = BOARD_OFFSET_Y - 14 + gridRows * PIN_SPACING

  type WireSeg = { type: 'h' | 'v'; x1: number; y1: number; x2: number; y2: number; wire: string; si: number }
  const wireSegs: WireSeg[] = []
  let chanIdx = 0
  let chanLeftIdx = 0
  let maxWireBottomY = BOARD_BOTTOM_Y

  for (const { layout, mod, inst } of allModuleLayouts) {
    if (inst.status !== 'healthy') continue
    const assignedPins = pinLayouts.filter(p => p.moduleIds.includes(mod.id))
    const usedAssignedPinIds = new Set<string>()

    for (let i = 0; i < mod.requiredPinLabels.length; i++) {
      const requirement = mod.requiredPinLabels[i]
      const boardPin = assignedPins.find(pin => {
        if (usedAssignedPinIds.has(pin.id)) return false
        if (pin.label === requirement) return true
        return PIN_FUNCTION_NAMES.has(requirement) && pin.functions.includes(requirement)
      })
      if (!boardPin) continue
      usedAssignedPinIds.add(boardPin.id)
      const wKey = `${mod.id}-${requirement}-${boardPin.id}`
      const xChan = CHAN_START + chanIdx * CHAN_STEP
      const xLeftChan = X_LEFT_CHAN - chanLeftIdx * CHAN_STEP
      const dotX = layout.x
      const dotY = layout.y + 12 + i * 16
      const isLeft = boardPin.id.startsWith('left')
      const yBelow = isLeft ? BOARD_BOTTOM_Y + 16 + chanLeftIdx * CHAN_STEP : BOARD_BOTTOM_Y + 16
      maxWireBottomY = Math.max(maxWireBottomY, yBelow)

      const raw: Array<['h' | 'v', number, number, number, number]> = isLeft ? [
        ['h', boardPin.x, boardPin.y, xLeftChan, boardPin.y],
        ['v', xLeftChan, boardPin.y, xLeftChan, yBelow],
        ['h', xLeftChan, yBelow, xChan, yBelow],
        ['v', xChan, yBelow, xChan, dotY],
        ['h', xChan, dotY, dotX, dotY],
      ] : [
        ['h', boardPin.x, boardPin.y, xChan, boardPin.y],
        ['v', xChan, boardPin.y, xChan, dotY],
        ['h', xChan, dotY, dotX, dotY],
      ]

      raw.forEach(([type, x1, y1, x2, y2], si) => {
        wireSegs.push({ type, x1, y1, x2, y2, wire: wKey, si })
      })
      chanIdx++
      if (isLeft) chanLeftIdx++
    }
  }

  // For each horizontal segment, find crossing vertical segments from other wires
  const segHops = new Map<string, number[]>()
  for (const segH of wireSegs) {
    if (segH.type !== 'h') continue
    const xMin = Math.min(segH.x1, segH.x2), xMax = Math.max(segH.x1, segH.x2)
    const hits: number[] = []
    for (const segV of wireSegs) {
      if (segV.type !== 'v' || segV.wire === segH.wire) continue
      const xV = segV.x1
      const yMin = Math.min(segV.y1, segV.y2), yMax = Math.max(segV.y1, segV.y2)
      if (xV > xMin && xV < xMax && segH.y1 > yMin && segH.y1 < yMax) hits.push(xV)
    }
    if (hits.length) {
      hits.sort((a, b) => segH.x2 > segH.x1 ? a - b : b - a)
      segHops.set(`${segH.wire}-${segH.si}`, hits)
    }
  }

  // Build one SVG path string per wire
  const wirePaths = [...new Set(wireSegs.map(s => s.wire))].map(wKey => {
    const segs = wireSegs.filter(s => s.wire === wKey).sort((a, b) => a.si - b.si)
    const r = HOP_R
    let d = `M ${segs[0].x1} ${segs[0].y1}`
    for (let idx = 0; idx < segs.length; idx++) {
      const seg = segs[idx]
      const next = segs[idx + 1]
      const hops = segHops.get(`${seg.wire}-${seg.si}`) ?? []

      if (seg.type === 'h' && hops.length > 0) {
        const goRight = seg.x2 > seg.x1
        for (const cx of hops) {
          if (goRight) d += ` L ${cx - HOP_R} ${seg.y1} A ${HOP_R} ${HOP_R} 0 0 0 ${cx + HOP_R} ${seg.y1}`
          else         d += ` L ${cx + HOP_R} ${seg.y1} A ${HOP_R} ${HOP_R} 0 0 1 ${cx - HOP_R} ${seg.y1}`
        }
      }

      if (!next) {
        d += ` L ${seg.x2} ${seg.y2}`
        continue
      }

      // Rounded corner: stop r before the corner, arc into the next segment
      if (seg.type === 'h') {
        const goRight = seg.x2 > seg.x1
        const goDown  = next.y2 > next.y1
        const px = goRight ? seg.x2 - r : seg.x2 + r
        const sweep = (goRight && goDown) || (!goRight && !goDown) ? 1 : 0
        const ay = goDown ? seg.y2 + r : seg.y2 - r
        d += ` L ${px} ${seg.y2} A ${r} ${r} 0 0 ${sweep} ${seg.x2} ${ay}`
      } else {
        const goDown  = seg.y2 > seg.y1
        const goRight = next.x2 > next.x1
        const py = goDown ? seg.y2 - r : seg.y2 + r
        const sweep = goDown ? 0 : 1
        const ax = goRight ? seg.x2 + r : seg.x2 - r
        d += ` L ${seg.x2} ${py} A ${r} ${r} 0 0 ${sweep} ${ax} ${seg.y2}`
      }
    }
    return { key: wKey, d }
  })

  const originX = chanLeftIdx > 0 ? X_LEFT_CHAN - (chanLeftIdx - 1) * CHAN_STEP - 8 : 0
  const contentBottomY = Math.max(moduleBottomY, maxWireBottomY)
  const viewBox = svgViewBox(board, moduleInstances.length, moduleStartX, originX, contentBottomY)

  return (
    <div className="relative w-full h-full overflow-auto bg-zinc-900">
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full"
        style={{ minWidth: 400, minHeight: gridRows * PIN_SPACING + 80 }}
      >
        {/* Breadboard grid background */}
        {Array.from({ length: gridRows }, (_, i) => (
          <g key={i}>
            <line
              x1={leftX - BOARD_INSET} y1={BOARD_OFFSET_Y + i * PIN_SPACING}
              x2={rightX + BOARD_INSET} y2={BOARD_OFFSET_Y + i * PIN_SPACING}
              stroke="#3f3f46" strokeWidth={0.5}
            />
          </g>
        ))}

        {/* Board outline */}
        <rect
          x={leftX - 16}
          y={BOARD_OFFSET_Y - 14}
          width={rightX - leftX + 32}
          height={gridRows * PIN_SPACING}
          rx={4}
          fill="#27272a"
          stroke="#52525b"
          strokeWidth={1.5}
        />

        {/* Board label */}
        <text
          x={(leftX + rightX) / 2}
          y={BOARD_OFFSET_Y - 20}
          textAnchor="middle"
          fill="#a1a1aa"
          fontSize={10}
        >
          {board.name}
        </text>

        {/* Wires */}
        {wirePaths.map(({ key, d }) => (
          <path
            key={`wire-${key}`}
            d={d}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={1}
            strokeOpacity={0.6}
          />
        ))}

        {/* Module overlays */}
        {allModuleLayouts.map(({ layout, mod, inst }) => {
          const conflictLabels = new Set(inst.conflicts.map(id => pinIdToLabel.get(id) ?? id))
          return (
            <g key={layout.moduleId}>
              <rect
                x={layout.x}
                y={layout.y}
                width={layout.width}
                height={layout.height}
                rx={4}
                fill="#1c1c1f"
                stroke={MODULE_BORDER[inst.status]}
                strokeWidth={1.5}
                strokeDasharray={inst.status === 'error' ? '4,3' : undefined}
              />
              <text x={layout.x + layout.width / 2} y={layout.y - 6} textAnchor="middle" fill="#a1a1aa" fontSize={9}>
                {mod.name}
              </text>
              {inst.status === 'error' && (
                <text x={layout.x + layout.width / 2} y={layout.y + 14} textAnchor="middle" fill="#f59e0b" fontSize={8}>
                  ⚠ {inst.conflicts.length} conflict{inst.conflicts.length !== 1 ? 's' : ''}
                </text>
              )}
              {mod.requiredPinLabels.map((label, i) => {
                const isConflict = conflictLabels.has(label)
                const dotColor = isConflict ? '#f59e0b' : '#0ea5e9'
                const labelColor = isConflict ? '#f59e0b' : '#71717a'
                const rowY = layout.y + (inst.status === 'error' ? 24 : 12) + i * 16
                return (
                  <g key={label}>
                    <circle cx={layout.x} cy={rowY} r={3} fill={dotColor} />
                    <text x={layout.x + 8} y={rowY + 4} fill={labelColor} fontSize={8} fontFamily="monospace">
                      {label}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Pins */}
        {pinLayouts.map(pin => (
          <g
            key={pin.id}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredPin(pin)}
            onMouseLeave={() => setHoveredPin(null)}
            aria-label={`${pin.label} — ${pin.status}`}
          >
            <circle
              cx={pin.x}
              cy={pin.y}
              r={PIN_RADIUS}
              fill={pin.status === 'error' ? '#f59e0b' : pinFunctionColor(pin.functions)}
              fillOpacity={pin.status === 'available' ? 0.45 : 1}
              stroke={pin.status === 'in-use' ? '#ffffff' : 'none'}
              strokeWidth={1.5}
            />
            <text
              x={pin.x + (pin.id.startsWith('right') ? -10 : 10)}
              y={pin.y + 4}
              textAnchor={pin.id.startsWith('right') ? 'end' : 'start'}
              fill="#d4d4d8"
              fontSize={9}
              fontFamily="monospace"
            >
              {pin.label}
            </text>
          </g>
        ))}
      </svg>

      {hoveredPin && <PinTooltip pin={hoveredPin} svgRef={svgRef} />}
    </div>
  )
}
