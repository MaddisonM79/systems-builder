import type { UpgradeDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'example_upgrade',
//   displayName: 'Example',
//   description: 'Does something useful.',
//   category: 'economy',
//   effect: { type: 'stat_bonus', stat: 'coin_income', mode: 'multiplier', amount: 1.1 },
//   costConfig: { mode: 'tiers', tiers: [[{ currencyType: 'coin', amount: 100 }]] },
//   maxPurchases: 1,
//   persistsOnPrestige: false,
// }

export const upgrades: UpgradeDefinition[] = [
  {
    id: 'unlock_oil_house',
    displayName: 'Oil House',
    description: 'Unlocks the Oil House — a more powerful energy refiner that adds 2 Coin per unit.',
    category: 'refinement',
    effect: { type: 'unlock_card', cardId: 'oil_house' },
    costConfig: {
      mode: 'tiers',
      tiers: [[{ currencyType: 'coin', amount: 200 }]],
    },
    maxPurchases: 1,
    persistsOnPrestige: false,
  },
  {
    id: 'expand_energy_slots',
    displayName: 'Energy Grid Expansion',
    description: 'Adds one additional refiner slot to all Energy items.',
    category: 'refinement',
    effect: { type: 'expand_item_slots', itemId: 'energy', amount: 1 },
    costConfig: {
      mode: 'tiers',
      tiers: [
        [{ currencyType: 'coin', amount: 150 }],
        [{ currencyType: 'coin', amount: 400 }],
        [{ currencyType: 'coin', amount: 900 }],
      ],
    },
    maxPurchases: 3,
    persistsOnPrestige: false,
  },
  {
    id: 'market_connections',
    displayName: 'Market Connections',
    description: 'Increases all Coin income by 10% per purchase.',
    category: 'economy',
    effect: { type: 'stat_bonus', stat: 'coin_income', mode: 'multiplier', amount: 1.1 },
    costConfig: {
      mode: 'formula',
      baseCost: [{ currencyType: 'coin', amount: 300 }],
      scalingFactor: 2.5,
    },
    maxPurchases: 5,
    persistsOnPrestige: false,
  },
]
