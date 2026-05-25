import { create } from 'zustand'
import { DEFAULT_BOARD_ID, getBoardById } from '../data/boards'
import { getModuleById } from '../data/modules'
import { reEvaluateAll } from '../logic/pinAllocation'
import { packageSchema } from '../models/package'
import type { ModuleInstance, PinAssignment } from '../models/package'

const STORAGE_KEY = 'iot-planner-package'

interface PlannerState {
  boardId: string
  moduleInstances: ModuleInstance[]
  pinAssignments: PinAssignment[]
  storageError: string | null
}

interface PlannerActions {
  setBoard: (boardId: string) => void
  addModule: (moduleId: string) => void
  removeModule: (instanceId: string) => void
  importPackage: (json: unknown) => { success: boolean; error?: string }
  clearStorageError: () => void
}

type PersistedModuleInstance = {
  instanceId?: string
  moduleId: string
  status: 'healthy' | 'error'
  conflicts: string[]
}

type PersistedPinAssignment = {
  pinId: string
  moduleInstanceId?: string
}

function createInstanceId(): string {
  return crypto.randomUUID()
}

function normalizePackageShape(pkg: {
  boardId: string
  modules: PersistedModuleInstance[]
  pinAssignments: PersistedPinAssignment[]
}): Omit<PlannerState, 'storageError'> {
  const moduleInstances = pkg.modules.map(module => ({
    ...module,
    instanceId: module.instanceId ?? createInstanceId(),
  }))

  const fallbackInstanceIdByModuleId = new Map(
    moduleInstances.map(instance => [instance.moduleId, instance.instanceId]),
  )

  const pinAssignments = pkg.pinAssignments.flatMap(assignment => {
    const moduleInstanceId = assignment.moduleInstanceId
      ?? fallbackInstanceIdByModuleId.get((assignment as PersistedPinAssignment & { moduleId?: string }).moduleId ?? '')
    return moduleInstanceId ? [{ pinId: assignment.pinId, moduleInstanceId }] : []
  })

  return {
    boardId: pkg.boardId,
    moduleInstances,
    pinAssignments,
  }
}

function recomputePackage(
  boardId: string,
  moduleInstances: ModuleInstance[],
): Omit<PlannerState, 'storageError'> | null {
  const board = getBoardById(boardId)
  if (!board) return null

  const modules = moduleInstances.map(module => ({
    instanceId: module.instanceId,
    moduleId: module.moduleId,
  }))
  const { instances, assignments } = reEvaluateAll(board, modules, getModuleById)

  return {
    boardId,
    moduleInstances: instances,
    pinAssignments: assignments,
  }
}

function saveToStorage(state: Omit<PlannerState, 'storageError'>): void {
  try {
    const pkg = {
      schemaVersion: '1.0.0' as const,
      boardId: state.boardId,
      modules: state.moduleInstances,
      pinAssignments: state.pinAssignments,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pkg))
  } catch {
    // storage full or unavailable — state stays in memory
  }
}

function loadFromStorage(): Omit<PlannerState, 'storageError'> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const result = packageSchema.safeParse(parsed)
    if (!result.success) return null
    const pkg = normalizePackageShape(result.data as {
      boardId: string
      modules: PersistedModuleInstance[]
      pinAssignments: PersistedPinAssignment[]
    })
    // verify boardId is known
    if (!getBoardById(pkg.boardId)) return null
    return recomputePackage(pkg.boardId, pkg.moduleInstances) ?? pkg
  } catch {
    return null
  }
}

const initial = loadFromStorage() ?? {
  boardId: DEFAULT_BOARD_ID,
  moduleInstances: [],
  pinAssignments: [],
}

export const usePlannerStore = create<PlannerState & PlannerActions>((set, get) => ({
  ...initial,
  storageError: null,

  setBoard(boardId) {
    const board = getBoardById(boardId)
    if (!board) return
    const modules = get().moduleInstances.map(m => ({ instanceId: m.instanceId, moduleId: m.moduleId }))
    const { instances, assignments } = reEvaluateAll(board, modules, getModuleById)
    const next = { boardId, moduleInstances: instances, pinAssignments: assignments }
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  addModule(moduleId) {
    const { boardId, moduleInstances } = get()
    const module = getModuleById(moduleId)
    if (!module) return
    const next = recomputePackage(boardId, [
      ...moduleInstances,
      {
        instanceId: createInstanceId(),
        moduleId: module.id,
        status: 'healthy',
        conflicts: [],
      },
    ])
    if (!next) return
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  removeModule(instanceId) {
    const { boardId, moduleInstances } = get()
    const remainingModules = moduleInstances
      .filter(m => m.instanceId !== instanceId)
      .map(m => ({ instanceId: m.instanceId, moduleId: m.moduleId }))
    const board = getBoardById(boardId)
    if (!board) return
    const { instances, assignments } = reEvaluateAll(board, remainingModules, getModuleById)
    const next = { boardId, moduleInstances: instances, pinAssignments: assignments }
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  importPackage(json) {
    const result = packageSchema.safeParse(json)
    if (!result.success) {
      return { success: false, error: 'Invalid package file. Check the schema version and format.' }
    }
    const pkg = normalizePackageShape(result.data as {
      boardId: string
      modules: PersistedModuleInstance[]
      pinAssignments: PersistedPinAssignment[]
    })
    if (!getBoardById(pkg.boardId)) {
      return { success: false, error: `Unknown board: "${pkg.boardId}"` }
    }
    const next = recomputePackage(pkg.boardId, pkg.moduleInstances)
    if (!next) {
      return { success: false, error: `Unknown board: "${pkg.boardId}"` }
    }
    set({ ...next, storageError: null })
    saveToStorage(next)
    return { success: true }
  },

  clearStorageError() {
    set({ storageError: null })
  },
}))
