import { z } from 'zod'
import { CARD_ARCHETYPES, CURRENT_SAVE_VERSION } from '@system-builder/constants'

// ---------- Nested schemas ----------

// How flow is distributed across multiple output ports
const OutputRoutingSaveSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('even') }),
  z.object({
    mode: z.literal('weighted'),
    // One weight per output port; must sum to 100 — enforced by engine, not schema
    weights: z.array(z.number()),
  }),
])

const CardSaveSchema = z.object({
  id: z.string(),
  typeId: z.string(),                              // references CardDefinition.id in catalog
  archetype: z.enum([                              // denormalized — engine needs this without catalog
    CARD_ARCHETYPES.GENERATOR,
    CARD_ARCHETYPES.REFINER,
    CARD_ARCHETYPES.SELLER,
    CARD_ARCHETYPES.SPLITTER,
    CARD_ARCHETYPES.COMBINER,
    CARD_ARCHETYPES.CONVERTER,
    CARD_ARCHETYPES.STORAGE,
  ]),
  title: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  // Port count overrides — absent means use the catalog definition's default
  inputPortCount: z.number().int().positive().optional(),
  outputPortCount: z.number().int().positive().optional(),
  outputRouting: OutputRoutingSaveSchema,
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
    // Per-card-instance XP and level (CardId → value)
    cardXp: z.record(z.string(), z.number()),
    cardLevels: z.record(z.string(), z.number()),
    // Current pool amount per card (CardId → units stored)
    poolLevels: z.record(z.string(), z.number()),
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
