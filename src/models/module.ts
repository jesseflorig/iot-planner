import { z } from 'zod'

export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['component', 'hat']),
  requiredPinLabels: z.array(z.string()).min(1),
  breadboardSpan: z.number().int().min(1),
  datasheetUrl: z.string().url(),
})

export type Module = z.infer<typeof moduleSchema>
