import { z } from 'zod'

// ---------- Effect types ----------

export const UpgradeEffectSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('unlock_card'),
    cardId: z.string(),
  }),
  z.object({
    type: z.literal('expand_item_slots'),
    itemId: z.string(),
    amount: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('stat_bonus'),
    stat: z.string(),       // e.g. 'coin_income' — open string for extensibility
    mode: z.enum(['flat', 'multiplier']),
    amount: z.number().positive(),
  }),
])

export type UpgradeEffect = z.infer<typeof UpgradeEffectSchema>

// ---------- Cost ----------

export const UpgradeCostSchema = z.object({
  currencyType: z.string(), // open string — 'coin', 'researchPoints', etc.
  amount: z.number().positive(),
})

export type UpgradeCost = z.infer<typeof UpgradeCostSchema>

// Cost config — explicit tiers OR formula-based scaling
// tiers[0] = cost for 1st purchase, tiers[1] = 2nd, etc.
export const UpgradeCostConfigSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('tiers'),
    tiers: z.array(z.array(UpgradeCostSchema)).min(1),
  }),
  z.object({
    mode: z.literal('formula'),
    baseCost: z.array(UpgradeCostSchema).min(1),
    scalingFactor: z.number().positive(),
  }),
])

export type UpgradeCostConfig = z.infer<typeof UpgradeCostConfigSchema>

// ---------- Definition ----------

export const UpgradeDefinitionSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  category: z.string(),                          // for grouping in UI
  effect: UpgradeEffectSchema,
  costConfig: UpgradeCostConfigSchema,
  maxPurchases: z.number().int().positive(),      // 1 = one-time
  persistsOnPrestige: z.boolean(),
})

export type UpgradeDefinition = z.infer<typeof UpgradeDefinitionSchema>

// ---------- Helper ----------

// Returns the cost array for the Nth purchase (purchaseCount = purchases already made, 0-indexed).
// Returns null when the upgrade is maxed out (tiers exhausted or maxPurchases reached).
export function costForTier(config: UpgradeCostConfig, purchaseCount: number): UpgradeCost[] | null {
  if (config.mode === 'tiers') {
    return config.tiers[purchaseCount] ?? null
  }
  // formula: each tier costs baseCost * scalingFactor^purchaseCount
  return config.baseCost.map(c => ({
    ...c,
    amount: Math.round(c.amount * Math.pow(config.scalingFactor, purchaseCount)),
  }))
}
