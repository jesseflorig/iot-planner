import type { Board } from '../models/board'
import type { Pin, PinFunction } from '../models/pin'
import type { Module } from '../models/module'
import type { ModuleInstance, PinAssignment } from '../models/package'

interface AllocationResult {
  instance: ModuleInstance
  assignments: PinAssignment[]
}

function isFunctionRequirement(requirement: string): requirement is PinFunction {
  return [
    'GPIO', 'ADC',
    'I2C_SDA', 'I2C_SCL',
    'SPI_SCK', 'SPI_MOSI', 'SPI_MISO', 'SPI_CS',
    'UART_TX', 'UART_RX',
    'PWM',
    'POWER_3V3', 'POWER_5V', 'POWER_BAT', 'POWER_EN',
    'GND', 'RESET', 'AREF', 'USB_5V',
  ].includes(requirement)
}

function resolvePin(board: Board, requirement: string, claimedPinIds: Set<string>): Pin | undefined {
  const exactLabelMatch = board.pins.find(pin => pin.label === requirement)
  if (exactLabelMatch) return exactLabelMatch
  if (!isFunctionRequirement(requirement)) return undefined

  return board.pins.find(
    pin => pin.type === 'gpio' && pin.functions.includes(requirement) && !claimedPinIds.has(pin.id),
  )
}

export function allocatePins(
  board: Board,
  module: Module,
  instanceId: string,
  existingAssignments: PinAssignment[],
): AllocationResult {
  const claimedPinIds = new Set(existingAssignments.map(a => a.pinId))
  const conflicts: string[] = []
  const assignments: PinAssignment[] = []

  for (const requirement of module.requiredPinLabels) {
    const pin = resolvePin(board, requirement, claimedPinIds)
    if (!pin) {
      conflicts.push(`missing:${requirement}`)
      continue
    }
    if (claimedPinIds.has(pin.id)) {
      conflicts.push(pin.id)
      continue
    }
    assignments.push({ pinId: pin.id, moduleInstanceId: instanceId })
    claimedPinIds.add(pin.id)
  }

  if (conflicts.length > 0) {
    return {
      instance: { instanceId, moduleId: module.id, status: 'error', conflicts },
      assignments: [],
    }
  }

  return {
    instance: { instanceId, moduleId: module.id, status: 'healthy', conflicts: [] },
    assignments,
  }
}

export function reEvaluateAll(
  board: Board,
  modules: Array<{ instanceId: string; moduleId: string }>,
  getModule: (id: string) => Module | undefined,
): { instances: ModuleInstance[]; assignments: PinAssignment[] } {
  const instances: ModuleInstance[] = []
  const assignments: PinAssignment[] = []
  const prioritizedModules = [...modules].sort((a, b) => {
    const moduleA = getModule(a.moduleId)
    const moduleB = getModule(b.moduleId)
    const priorityA = moduleA?.type === 'hat' ? 0 : 1
    const priorityB = moduleB?.type === 'hat' ? 0 : 1
    return priorityA - priorityB
  })

  for (const entry of prioritizedModules) {
    const module = getModule(entry.moduleId)
    if (!module) continue
    const result = allocatePins(board, module, entry.instanceId, assignments)
    instances.push(result.instance)
    assignments.push(...result.assignments)
  }

  return { instances, assignments }
}
