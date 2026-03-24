import type { CombinerDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'wood_combiner',
//   archetype: 'combiner',
//   displayName: 'Wood Combiner',
//   description: 'Merges multiple wood streams into one.',
//   unlockCondition: { type: 'coin', amount: 50 },
//   placementCost: null,
//   resourceType: 'wood',
//   defaultInputPortCount: 2,
// }

export const combiners: CombinerDefinition[] = []
