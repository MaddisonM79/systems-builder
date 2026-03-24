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

export const storage: StorageDefinition[] = []
