import type { ItemDefinition } from '@system-builder/schemas'

export const items: ItemDefinition[] = [
  {
    id: 'energy',
    displayName: 'Energy',
    description: 'Raw electrical energy ready to be sold or refined.',
    baseValue: 1,
    baseUpgradeSlots: 2,
    researchable: true,
  },
]
