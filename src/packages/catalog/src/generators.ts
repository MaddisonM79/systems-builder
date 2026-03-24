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
    id: 'stuffie_fabricator',
    archetype: 'generator',
    displayName: 'Stuffie Machine',
    description: 'Produces stuffies for selling.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    outputResource: 'stuffie',
    defaultOutputPortCount: 1,
    flow: { mode: 'continuous', ratePerSecond: 1 },
  },
]
