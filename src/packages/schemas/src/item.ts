import { z } from 'zod'

// Definition of an item/resource type — loaded from the catalog
// Port.resourceType strings reference ItemDefinition.id
export const ItemDefinitionSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  // Base coin value before any chain modifiers
  baseValue: z.number().nonnegative(),
  // Number of upgrade-mode Refiner slots available by default
  // Expandable via upgrades; overflow Refiners are soft (no value effect)
  baseUpgradeSlots: z.number().int().nonnegative(),
})

export type ItemDefinition = z.infer<typeof ItemDefinitionSchema>

// A bonus locked in when a FlowItem passes through an upgrade-mode Refiner.
// refinerId is stored for display/audit only — the bonus value is captured at apply time.
export const AppliedBonusSchema = z.object({
  refinerId: z.string(),
  bonus: z.number(),
})

export type AppliedBonus = z.infer<typeof AppliedBonusSchema>

// A single unit of a resource in the flow system.
// effectiveValue = itemDef.baseValue + appliedBonuses.reduce((sum, b) => sum + b.bonus, 0)
// Computed by the sim engine — not stored on the item itself.
export const FlowItemSchema = z.object({
  resourceType: z.string(),
  appliedBonuses: z.array(AppliedBonusSchema).default([]),
})

export type FlowItem = z.infer<typeof FlowItemSchema>
