import type { CardDefinition, ItemDefinition, ResearchTechDefinition } from '@system-builder/schemas'
import { generators } from './generators'
import { refiners } from './refiners'
import { sellers } from './sellers'
import { splitters } from './splitters'
import { combiners } from './combiners'
import { converters } from './converters'
import { storage } from './storage'
import { researchers } from './researchers'
import { items } from './items'
import { upgrades } from './upgrades'
import { techs } from './techs'

// Full card catalog — imported by the app engine registry and the API catalog route
export const catalog: CardDefinition[] = [
  ...generators,
  ...refiners,
  ...sellers,
  ...splitters,
  ...combiners,
  ...converters,
  ...storage,
  ...researchers,
]

export type { CardDefinition, ItemDefinition, ResearchTechDefinition }
export { generators, refiners, sellers, splitters, combiners, converters, storage, researchers, items, upgrades, techs }
