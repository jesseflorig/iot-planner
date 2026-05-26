import { z } from 'zod'
import { pinSchema } from './pin'

export const boardSchema = z.object({
  id: z.string(),
  name: z.string(),
  manufacturer: z.string().optional(),
  pins: z.array(pinSchema),
  headerLength: z.number().int().min(1),
  breadboardSpan: z.number().int().min(1),
  datasheetUrl: z.string().url(),
})

export type Board = z.infer<typeof boardSchema>
