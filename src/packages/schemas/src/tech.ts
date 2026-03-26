import { z } from 'zod'

// ---------- Effect types ----------

export const ResearchTechEffectSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('stat_bonus'),
    stat: z.string(),       // e.g. 'coin_income', 'flow_rate' — open string for extensibility
    mode: z.enum(['flat', 'multiplier']),
    amount: z.number().positive(),
  }),
  z.object({
    type: z.literal('unlock_card'),
    cardId: z.string(),
  }),
  z.object({
    type: z.literal('expand_item_slots'),
    itemId: z.string(),
    amount: z.number().int().positive(),
  }),
])

export type ResearchTechEffect = z.infer<typeof ResearchTechEffectSchema>

// ---------- Definition ----------

export const ResearchTechDefinitionSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  rpCost: z.number().positive(),
  // IDs of techs that must be researched before this one becomes available
  prerequisites: z.array(z.string()).default([]),
  // Techs can grant multiple bonuses simultaneously
  effects: z.array(ResearchTechEffectSchema).min(1),
})

export type ResearchTechDefinition = z.infer<typeof ResearchTechDefinitionSchema>
