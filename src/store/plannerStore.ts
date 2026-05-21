import { create } from 'zustand'
import { DEFAULT_BOARD_ID, getBoardById } from '../data/boards'
import { getModuleById } from '../data/modules'
import { allocatePins, reEvaluateAll } from '../logic/pinAllocation'
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
  removeModule: (moduleId: string) => void
  importPackage: (json: unknown) => { success: boolean; error?: string }
  clearStorageError: () => void
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
    const pkg = result.data
    // verify boardId is known
    if (!getBoardById(pkg.boardId)) return null
    return {
      boardId: pkg.boardId,
      moduleInstances: pkg.modules,
      pinAssignments: pkg.pinAssignments,
    }
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
    const moduleIds = get().moduleInstances.map(m => m.moduleId)
    const { instances, assignments } = reEvaluateAll(board, moduleIds, getModuleById)
    const next = { boardId, moduleInstances: instances, pinAssignments: assignments }
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  addModule(moduleId) {
    const { boardId, moduleInstances, pinAssignments } = get()
    if (moduleInstances.some(m => m.moduleId === moduleId)) return
    const board = getBoardById(boardId)
    const module = getModuleById(moduleId)
    if (!board || !module) return
    const result = allocatePins(board, module, pinAssignments)
    const next = {
      boardId,
      moduleInstances: [...moduleInstances, result.instance],
      pinAssignments: [...pinAssignments, ...result.assignments],
    }
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  removeModule(moduleId) {
    const { boardId, moduleInstances } = get()
    const remainingIds = moduleInstances
      .filter(m => m.moduleId !== moduleId)
      .map(m => m.moduleId)
    const board = getBoardById(boardId)
    if (!board) return
    const { instances, assignments } = reEvaluateAll(board, remainingIds, getModuleById)
    const next = { boardId, moduleInstances: instances, pinAssignments: assignments }
    set({ ...next, storageError: null })
    saveToStorage(next)
  },

  importPackage(json) {
    const result = packageSchema.safeParse(json)
    if (!result.success) {
      return { success: false, error: 'Invalid package file. Check the schema version and format.' }
    }
    const pkg = result.data
    if (!getBoardById(pkg.boardId)) {
      return { success: false, error: `Unknown board: "${pkg.boardId}"` }
    }
    const next = {
      boardId: pkg.boardId,
      moduleInstances: pkg.modules,
      pinAssignments: pkg.pinAssignments,
    }
    set({ ...next, storageError: null })
    saveToStorage(next)
    return { success: true }
  },

  clearStorageError() {
    set({ storageError: null })
  },
}))
