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

export const sellers: SellerDefinition[] = []
