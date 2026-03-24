import { z } from 'zod'
import { CARD_ARCHETYPES } from '@system-builder/constants'

// ---------- Flow config ----------

const FlowConfigContinuousSchema = z.object({
  mode: z.literal('continuous'),
  ratePerSecond: z.number().positive(),
})

const FlowConfigTickSchema = z.object({
  mode: z.literal('tick'),
  batchSize: z.number().int().positive(),
  intervalSeconds: z.number().positive(),
})

export const FlowConfigSchema = z.discriminatedUnion('mode', [
  FlowConfigContinuousSchema,
  FlowConfigTickSchema,
])

export type FlowConfig = z.infer<typeof FlowConfigSchema>

// ---------- Unlock condition ----------

const UnlockConditionFreeSchema = z.object({
  type: z.literal('free'),
})

const UnlockConditionCoinSchema = z.object({
  type: z.literal('coin'),
  amount: z.number().positive(),
})

const UnlockConditionResearchPointsSchema = z.object({
  type: z.literal('researchPoints'),
  amount: z.number().positive(),
})

const UnlockConditionXpSchema = z.object({
  type: z.literal('xp'),
  cardTypeId: z.string(),
  xpThreshold: z.number().int().positive(),
})

const UnlockConditionStoryMilestoneSchema = z.object({
  type: z.literal('storyMilestone'),
  milestoneId: z.string(),
})

export const UnlockConditionSchema = z.discriminatedUnion('type', [
  UnlockConditionFreeSchema,
  UnlockConditionCoinSchema,
  UnlockConditionResearchPointsSchema,
  UnlockConditionXpSchema,
  UnlockConditionStoryMilestoneSchema,
])

export type UnlockCondition = z.infer<typeof UnlockConditionSchema>

// ---------- Placement cost ----------

const PlacementCostSchema = z.object({
  currencyType: z.string(), // CurrencyType — open string
  amount: z.number().positive(),
})

// ---------- Shared base fields (used via .extend on each archetype schema) ----------

const CardDefinitionBaseSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  unlockCondition: UnlockConditionSchema,
  placementCost: PlacementCostSchema.nullable(),
})

// ---------- Per-archetype definition schemas ----------

export const GeneratorDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.GENERATOR),
  outputResource: z.string(),
  defaultOutputPortCount: z.number().int().positive().default(1),
  flow: FlowConfigSchema,
})

// Refiner mode: transform (type change) or upgrade (value boost, costs a slot)
const RefinerModeTransformSchema = z.object({
  mode: z.literal('transform'),
  inputResource: z.string(),
  outputResource: z.string(),
  // e.g. { inputUnits: 2, outputUnits: 1 } means 2 input units → 1 output unit
  conversionRatio: z.object({
    inputUnits: z.number().positive(),
    outputUnits: z.number().positive(),
  }),
})

const RefinerModeUpgradeSchema = z.object({
  mode: z.literal('upgrade'),
  // 'any' = works on all item types; string[] = restricted to specific item type IDs
  acceptedResources: z.union([z.literal('any'), z.array(z.string()).min(1)]),
  resourceType: z.string(), // same resource type in and out
  valueBonus: z.number().positive(),    // flat coin value added per unit
  slotCost: z.number().int().nonnegative().default(1), // upgrade slots consumed
})

export const RefinerModeSchema = z.discriminatedUnion('mode', [
  RefinerModeTransformSchema,
  RefinerModeUpgradeSchema,
])

export const RefinerDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.REFINER),
  refinerMode: RefinerModeSchema,
  flow: FlowConfigSchema,
})

export const SellerDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.SELLER),
  outputCurrency: z.string(), // CurrencyType — open string
  // Each accepted resource is sold independently at its own rate
  // Revenue per unit = item.effectiveValue (computed by sim from item def + chain)
  acceptedResources: z.array(z.object({
    resource: z.string(),
    flow: FlowConfigSchema,
  })).min(1),
})

export const SplitterDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.SPLITTER),
  // Same resource type passes through all ports unchanged
  resourceType: z.string(),
  defaultOutputPortCount: z.number().int().min(2),
})

export const CombinerDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.COMBINER),
  // All inputs must carry the same resource type; output carries the same type
  resourceType: z.string(),
  defaultInputPortCount: z.number().int().min(2),
})

export const ConverterDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.CONVERTER),
  // Recipe is fixed per card type — different recipes are different card types
  recipe: z.object({
    inputs: z.array(z.object({
      resource: z.string(),
      units: z.number().positive(),
    })).min(2),
    output: z.object({
      resource: z.string(),
      units: z.number().positive(),
    }),
  }),
  flow: FlowConfigSchema,
})

export const StorageDefinitionSchema = CardDefinitionBaseSchema.extend({
  archetype: z.literal(CARD_ARCHETYPES.STORAGE),
  resourceType: z.string(),
  baseCapacity: z.number().positive(),
  // Input and output rates are independent — e.g. slow fill, fast release
  inputFlow: FlowConfigSchema,
  outputFlow: FlowConfigSchema,
})

// ---------- Union ----------

export const CardDefinitionSchema = z.discriminatedUnion('archetype', [
  GeneratorDefinitionSchema,
  RefinerDefinitionSchema,
  SellerDefinitionSchema,
  SplitterDefinitionSchema,
  CombinerDefinitionSchema,
  ConverterDefinitionSchema,
  StorageDefinitionSchema,
])

export type CardDefinition         = z.infer<typeof CardDefinitionSchema>
export type GeneratorDefinition    = z.infer<typeof GeneratorDefinitionSchema>
export type RefinerDefinition      = z.infer<typeof RefinerDefinitionSchema>
export type RefinerMode            = z.infer<typeof RefinerModeSchema>
export type SellerDefinition       = z.infer<typeof SellerDefinitionSchema>
export type SplitterDefinition     = z.infer<typeof SplitterDefinitionSchema>
export type CombinerDefinition     = z.infer<typeof CombinerDefinitionSchema>
export type ConverterDefinition    = z.infer<typeof ConverterDefinitionSchema>
export type StorageDefinition      = z.infer<typeof StorageDefinitionSchema>
