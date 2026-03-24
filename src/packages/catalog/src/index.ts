import type { CardDefinition } from '@system-builder/schemas'
import { generators } from './generators'
import { refiners } from './refiners'
import { sellers } from './sellers'
import { splitters } from './splitters'
import { combiners } from './combiners'
import { converters } from './converters'
import { storage } from './storage'

// Full card catalog — imported by the app engine registry and the API catalog route
export const catalog: CardDefinition[] = [
  ...generators,
  ...refiners,
  ...sellers,
  ...splitters,
  ...combiners,
  ...converters,
  ...storage,
]

export type { CardDefinition }
export { generators, refiners, sellers, splitters, combiners, converters, storage }
