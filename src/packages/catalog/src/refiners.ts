import type { RefinerDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'plank_refiner',
//   archetype: 'refiner',
//   displayName: 'Plank Refiner',
//   description: 'Converts raw wood into planks.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   inputResource: 'wood',
//   outputResource: 'plank',
//   conversionRatio: { inputUnits: 2, outputUnits: 1 },
//   flow: { mode: 'continuous', ratePerSecond: 0.5 },
// }

export const refiners: RefinerDefinition[] = []
