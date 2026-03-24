import type { SplitterDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'wood_splitter_2way',
//   archetype: 'splitter',
//   displayName: '2-Way Splitter',
//   description: 'Splits a resource stream evenly across two outputs.',
//   unlockCondition: { type: 'coin', amount: 50 },
//   placementCost: null,
//   resourceType: 'wood',
//   defaultOutputPortCount: 2,
// }

export const splitters: SplitterDefinition[] = [
  {
    id: 'energy_splitter',
    archetype: 'splitter',
    displayName: 'Energy Splitter',
    description: 'Splits an energy stream evenly across two outputs.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    resourceType: 'energy',
    defaultOutputPortCount: 2,
  },
]
