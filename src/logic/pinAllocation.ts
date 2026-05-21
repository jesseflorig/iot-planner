import type { Board } from '../models/board'
import type { Module } from '../models/module'
import type { ModuleInstance, PinAssignment } from '../models/package'

interface AllocationResult {
  instance: ModuleInstance
  assignments: PinAssignment[]
}

export function allocatePins(
  board: Board,
  module: Module,
  existingAssignments: PinAssignment[],
): AllocationResult {
  const claimedPinIds = new Set(existingAssignments.map(a => a.pinId))
  const conflicts: string[] = []
  const assignments: PinAssignment[] = []

  for (const label of module.requiredPinLabels) {
    const pin = board.pins.find(p => p.label === label)
    if (!pin) {
      conflicts.push(`missing:${label}`)
      continue
    }
    if (claimedPinIds.has(pin.id)) {
      conflicts.push(pin.id)
      continue
    }
    assignments.push({ pinId: pin.id, moduleId: module.id })
  }

  if (conflicts.length > 0) {
    return {
      instance: { moduleId: module.id, status: 'error', conflicts },
      assignments: [],
    }
  }

  return {
    instance: { moduleId: module.id, status: 'healthy', conflicts: [] },
    assignments,
  }
}

export function reEvaluateAll(
  board: Board,
  moduleIds: string[],
  getModule: (id: string) => Module | undefined,
): { instances: ModuleInstance[]; assignments: PinAssignment[] } {
  const instances: ModuleInstance[] = []
  const assignments: PinAssignment[] = []

  for (const moduleId of moduleIds) {
    const module = getModule(moduleId)
    if (!module) continue
    const result = allocatePins(board, module, assignments)
    instances.push(result.instance)
    assignments.push(...result.assignments)
  }

  return { instances, assignments }
}
