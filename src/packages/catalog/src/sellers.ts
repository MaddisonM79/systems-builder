import type { SellerDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'plank_seller',
//   archetype: 'seller',
//   displayName: 'Plank Seller',
//   description: 'Sells planks for coin.',
//   unlockCondition: { type: 'free' },
//   placementCost: null,
//   inputResource: 'plank',
//   outputCurrency: 'coin',
//   conversionRate: { resourceUnits: 1, currencyAmount: 5 },
//   flow: { mode: 'continuous', ratePerSecond: 1 },
// }

export const sellers: SellerDefinition[] = [
  {
    id: 'generic_store',
    archetype: 'seller',
    displayName: 'Store',
    description: 'Sells items like stuffies.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    outputCurrency: 'coin',
    acceptedResources: [
      { resource: 'stuffie', flow: { mode: 'continuous', ratePerSecond: 1 } },
    ],
  },
]
