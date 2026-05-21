import { z } from 'zod'

export const pinAssignmentSchema = z.object({
  pinId: z.string(),
  moduleId: z.string(),
})

export type PinAssignment = z.infer<typeof pinAssignmentSchema>

export const moduleInstanceSchema = z.object({
  moduleId: z.string(),
  status: z.enum(['healthy', 'error']),
  conflicts: z.array(z.string()),
})

export type ModuleInstance = z.infer<typeof moduleInstanceSchema>

export const packageSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  boardId: z.string(),
  modules: z.array(moduleInstanceSchema),
  pinAssignments: z.array(pinAssignmentSchema),
})

export type Package = z.infer<typeof packageSchema>

export const emptyPackage = (boardId: string): Package => ({
  schemaVersion: '1.0.0',
  boardId,
  modules: [],
  pinAssignments: [],
})
