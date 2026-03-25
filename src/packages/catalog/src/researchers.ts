import type { ResearcherDefinition } from '@system-builder/schemas'

export const researchers: ResearcherDefinition[] = [
  {
    id: 'basic_lab',
    archetype: 'researcher',
    displayName: 'Research Lab',
    description: 'Converts most items into Research Points. More valuable items yield more RP.',
    unlockCondition: { type: 'free' },
    placementCost: null,
    acceptedResources: [
      { resource: 'energy', flow: { mode: 'continuous', ratePerSecond: 1 } },
    ],
  },
]
