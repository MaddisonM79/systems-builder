import { z } from 'zod'

export const HankoUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
})

export type HankoUser = z.infer<typeof HankoUserSchema>
