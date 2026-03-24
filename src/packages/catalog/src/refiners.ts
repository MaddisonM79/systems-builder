import type { RefinerDefinition } from '@system-builder/schemas'

// Transform mode example (type change — different resource in vs out):
// {
//   id: 'plank_refiner',
//   archetype: 'refiner',
//   displayName: 'Plank Refiner',
//   description: 'Converts raw wood into planks.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   refinerMode: {
//     mode: 'transform',
//     inputResource: 'wood',
//     outputResource: 'plank',
//     conversionRatio: { inputUnits: 2, outputUnits: 1 },
//   },
//   flow: { mode: 'continuous', ratePerSecond: 0.5 },
// }

// Upgrade mode example (value boost — same resource in and out, costs a slot):
// {
//   id: 'stuffie_fluffer',
//   archetype: 'refiner',
//   displayName: 'Fluffer',
//   description: 'Fluffs stuffies to increase their value.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   refinerMode: {
//     mode: 'upgrade',
//     acceptedResources: ['stuffie'],  // or 'any' for universal
//     resourceType: 'stuffie',
//     valueBonus: 5,
//     slotCost: 1,
//   },
//   flow: { mode: 'continuous', ratePerSecond: 1 },
// }

export const refiners: RefinerDefinition[] = [
  {
    id: 'oil_house',
    archetype: 'refiner',
    displayName: 'Oil House',
    description: 'Burns oil to further upgrade energy value by 2 Coin per unit.',
    unlockCondition: { type: 'coin', amount: 200 }, // non-free — hidden until upgrade purchased
    placementCost: null,
    refinerMode: {
      mode: 'upgrade',
      acceptedResources: ['energy'],
      resourceType: 'energy',
      valueBonus: 2,
      slotCost: 1,
    },
    flow: { mode: 'continuous', ratePerSecond: 1 },
  },
  {
    id: 'coal_house',
    archetype: 'refiner',
    displayName: 'Coal House',
    description: 'Burns coal to upgrade energy value by 1 coin per unit.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    refinerMode: {
      mode: 'upgrade',
      acceptedResources: ['energy'],
      resourceType: 'energy',
      valueBonus: 1,
      slotCost: 1,
    },
    flow: { mode: 'continuous', ratePerSecond: 1 },
  },
]
