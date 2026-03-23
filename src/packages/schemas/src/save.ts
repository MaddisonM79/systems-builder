import { z } from 'zod'
import { CURRENT_SAVE_VERSION } from '@system-builder/constants'

// SaveV1 — initial save shape
// Expand fields here as the save structure is designed
export const SaveV1Schema = z.object({
  version: z.literal(1),
  lastSyncVersion: z.number().int().nonnegative(),
  // TODO: cards, connections, currencies, XP, story progress
})

// SaveSchema — discriminated union across all versions
// Add new versions here as the save format evolves
// Use .transform() on each older version to normalise to current shape
export const SaveSchema = z.discriminatedUnion('version', [
  SaveV1Schema,
])

export type Save = z.infer<typeof SaveSchema>
export type SaveV1 = z.infer<typeof SaveV1Schema>

// Current version constant re-exported for convenience
export { CURRENT_SAVE_VERSION }
