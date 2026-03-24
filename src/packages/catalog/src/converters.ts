import type { ConverterDefinition } from '@system-builder/schemas'

// Example:
// {
//   id: 'furniture_converter',
//   archetype: 'converter',
//   displayName: 'Furniture Converter',
//   description: 'Combines planks and iron to produce furniture.',
//   unlockCondition: { type: 'researchPoints', amount: 10 },
//   placementCost: { currencyType: 'coin', amount: 100 },
//   recipe: {
//     inputs: [
//       { resource: 'plank', units: 3 },
//       { resource: 'iron', units: 1 },
//     ],
//     output: { resource: 'furniture', units: 1 },
//   },
//   flow: { mode: 'tick', batchSize: 1, intervalSeconds: 5 },
// }

export const converters: ConverterDefinition[] = []
