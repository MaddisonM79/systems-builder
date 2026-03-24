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
