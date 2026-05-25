import { z } from 'zod'

export const pinAssignmentSchema = z.object({
  pinId: z.string(),
  moduleInstanceId: z.string().optional(),
  moduleId: z.string().optional(),
})

export interface PinAssignment {
  pinId: string
  moduleInstanceId: string
}

export const moduleInstanceSchema = z.object({
  instanceId: z.string().optional(),
  moduleId: z.string(),
  status: z.enum(['healthy', 'error']),
  conflicts: z.array(z.string()),
})

export interface ModuleInstance {
  instanceId: string
  moduleId: string
  status: 'healthy' | 'error'
  conflicts: string[]
}

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
