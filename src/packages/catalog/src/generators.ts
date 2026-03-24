import type { GeneratorDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'wood_generator',
//   archetype: 'generator',
//   displayName: 'Wood Generator',
//   description: 'Produces wood at a steady rate.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   outputResource: 'wood',
//   defaultOutputPortCount: 1,
//   flow: { mode: 'continuous', ratePerSecond: 1 },
// }

export const generators: GeneratorDefinition[] = [
  {
    id: 'energy_plant',
    archetype: 'generator',
    displayName: 'Energy Plant',
    description: 'Generates a continuous stream of raw energy.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    outputResource: 'energy',
    defaultOutputPortCount: 1,
    flow: { mode: 'continuous', ratePerSecond: 1 },
  },
]
