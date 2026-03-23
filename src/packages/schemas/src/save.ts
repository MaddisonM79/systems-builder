import { z } from 'zod'
import { CURRENT_SAVE_VERSION } from '@system-builder/constants'

// ---------- Nested schemas ----------

const PortSaveSchema = z.object({
  id: z.string(),
  side: z.enum(['input', 'output']),
  label: z.string(),
  resourceType: z.string(),
})

const CardSaveSchema = z.object({
  id: z.string(),
  archetype: z.string(),
  title: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  inputs: z.array(PortSaveSchema),
  outputs: z.array(PortSaveSchema),
})

const ConnectionSaveSchema = z.object({
  id: z.string(),
  sourceCardId: z.string(),
  sourcePortId: z.string(),
  targetCardId: z.string(),
  targetPortId: z.string(),
})

// ---------- Save V1 ----------

export const SaveV1Schema = z.object({
  // Schema format version — used by discriminatedUnion for migrations
  version: z.literal(1),
  // Write counter — increments on every local save; used for conflict detection
  saveVersion: z.number().int().positive(),
  // Write counter value at last successful cloud sync (0 = never synced)
  lastSyncVersion: z.number().int().nonnegative(),
  // Timestamp — display only (Save Snapshot UI); never used for conflict logic
  savedAt: z.number(),

  board: z.object({
    cards: z.array(CardSaveSchema),
    connections: z.array(ConnectionSaveSchema),
  }),

  sim: z.object({
    coin: z.number(),
    researchPoints: z.number(),
  }),

  game: z.object({
    prestigeCount: z.number().int().nonnegative(),
    unlockedCardIds: z.array(z.string()),
  }),
})

// ---------- Discriminated union (add new versions here) ----------

export const SaveSchema = z.discriminatedUnion('version', [
  SaveV1Schema,
])

export type Save = z.infer<typeof SaveSchema>
export type SaveV1 = z.infer<typeof SaveV1Schema>

export { CURRENT_SAVE_VERSION }
