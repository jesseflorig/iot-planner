import type { Board } from '../models/board'
import type { Module } from '../models/module'
import type { PinAssignment, ModuleInstance } from '../models/package'

export const PIN_RADIUS = 5
export const PIN_SPACING = 24
export const HEADER_GAP = 60   // gap between left and right header columns
export const BOARD_OFFSET_X = 40
export const BOARD_INSET = 16  // half-width of board border margin (pins sit on this edge)
export const BOARD_OFFSET_Y = 30
export const MODULE_OFFSET_X = BOARD_OFFSET_X + PIN_SPACING + HEADER_GAP + PIN_SPACING + 40

export type PinStatus = 'available' | 'in-use' | 'error' | 'power'

export interface PinLayout {
  id: string
  label: string
  gpio: number | null
  functions: string[]
  status: PinStatus
  x: number
  y: number
  moduleIds: string[]
}

export interface ModuleLayout {
  moduleId: string
  name: string
  status: 'healthy' | 'error'
  x: number
  y: number
  width: number
  height: number
}

function pinStatus(pin: { id: string; type: string }, assignments: PinAssignment[]): PinStatus {
  if (pin.type === 'power' || pin.type === 'ground' || pin.type === 'control') return 'power'
  const assigned = assignments.find(a => a.pinId === pin.id)
  if (!assigned) return 'available'
  return 'in-use'
}

export function boardToSvg(board: Board, assignments: PinAssignment[], instances: ModuleInstance[]): PinLayout[] {
  const errorPinIds = new Set(instances.flatMap(i => i.conflicts))

  return board.pins.map(pin => {
    const col = pin.headerSide === 'left' ? 0 : 1
    const x = col === 0
      ? BOARD_OFFSET_X - BOARD_INSET
      : BOARD_OFFSET_X + PIN_SPACING + HEADER_GAP + BOARD_INSET
    const y = BOARD_OFFSET_Y + (pin.position - 1) * PIN_SPACING

    let status: PinStatus = pinStatus(pin, assignments)
    if (errorPinIds.has(pin.id)) status = 'error'

    return {
      id: pin.id,
      label: pin.label,
      gpio: pin.gpio,
      functions: pin.functions,
      status,
      x,
      y,
      moduleIds: assignments.filter(a => a.pinId === pin.id).map(a => a.moduleId),
    }
  })
}

export function moduleToSvg(
  module: Module,
  instance: ModuleInstance,
  x = MODULE_OFFSET_X,
  y = BOARD_OFFSET_Y,
): ModuleLayout {
  const width = 120
  const pinRows = module.requiredPinLabels.length * 16
  const height = 12 + 16 + pinRows + 10  // top padding + error-text reserve + pins + bottom

  return {
    moduleId: module.id,
    name: module.name,
    status: instance.status,
    x,
    y,
    width,
    height,
  }
}

export function svgViewBox(
  board: Board,
  moduleCount: number,
  moduleStartX = MODULE_OFFSET_X,
  originX = 0,
  moduleBottomY = 0,
): string {
  const moduleWidth = moduleCount > 0 ? 120 + 20 : 0
  const contentRight = moduleCount > 0 ? moduleStartX + moduleWidth : moduleStartX + 40
  const width = contentRight - originX
  const boardHeight = BOARD_OFFSET_Y * 2 + board.headerLength * PIN_SPACING
  const height = Math.max(boardHeight, moduleBottomY + BOARD_OFFSET_Y)
  return `${originX} 0 ${width} ${height}`
}
