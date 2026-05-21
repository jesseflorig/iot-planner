import { useRef, useState } from 'react'
import { usePlannerStore } from '../store/plannerStore'
import { getBoardById } from '../data/boards'
import { getModuleById } from '../data/modules'
import {
  boardToSvg, moduleToSvg, svgViewBox,
  PIN_RADIUS, PIN_SPACING, BOARD_OFFSET_X, BOARD_OFFSET_Y, HEADER_GAP,
  type PinLayout,
} from '../svg/breadboardLayout'
import { PinTooltip } from './PinTooltip'

const PIN_FILL: Record<string, string> = {
  available: '#a1a1aa',  // zinc-400
  'in-use':  '#0ea5e9',  // sky-500
  error:     '#f59e0b',  // amber-400
  power:     '#52525b',  // zinc-600
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
  const allModuleLayouts = moduleInstances.map((inst, idx) => {
    const mod = getModuleById(inst.moduleId)
    if (!mod) return null
    return { layout: moduleToSvg(mod, inst, idx), mod, inst }
  }).filter(Boolean) as { layout: ReturnType<typeof moduleToSvg>; mod: ReturnType<typeof getModuleById> & {}; inst: typeof moduleInstances[number] }[]

  const pinIdToLabel = new Map(pinLayouts.map(p => [p.id, p.label]))

  const viewBox = svgViewBox(board, moduleInstances.length)
  const gridRows = board.headerLength
  const leftX = BOARD_OFFSET_X
  const rightX = BOARD_OFFSET_X + PIN_SPACING + HEADER_GAP

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
              x1={leftX - 12} y1={BOARD_OFFSET_Y + i * PIN_SPACING}
              x2={rightX + 12} y2={BOARD_OFFSET_Y + i * PIN_SPACING}
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
                    <circle cx={layout.x + 12} cy={rowY} r={3} fill={dotColor} />
                    <text x={layout.x + 20} y={rowY + 4} fill={labelColor} fontSize={8} fontFamily="monospace">
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
              fill={PIN_FILL[pin.status]}
            />
            <text
              x={pin.x + (pin.id.startsWith('right') ? 10 : -10)}
              y={pin.y + 4}
              textAnchor={pin.id.startsWith('right') ? 'start' : 'end'}
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
