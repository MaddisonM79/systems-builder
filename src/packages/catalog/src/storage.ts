import type { StorageDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'wood_storage',
//   archetype: 'storage',
//   displayName: 'Wood Storage',
//   description: 'Buffers wood between chain stages.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   resourceType: 'wood',
//   baseCapacity: 100,
//   inputFlow:  { mode: 'continuous', ratePerSecond: 10 },
//   outputFlow: { mode: 'continuous', ratePerSecond: 5 },
// }

export const storage: StorageDefinition[] = [
  {
    id: 'energy_storage',
    archetype: 'storage',
    displayName: 'Energy Storage',
    description: 'Buffers energy between chain stages.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    resourceType: 'energy',
    baseCapacity: 100,
    inputFlow:  { mode: 'continuous', ratePerSecond: 10 },
    outputFlow: { mode: 'continuous', ratePerSecond: 5 },
  },
]
