// API response codes
export const API_CODES = {
  SAVE_CONFLICT: 'SAVE_CONFLICT',
} as const

// Device presence — heartbeat TTL while tab is open
export const DEVICE_HEARTBEAT_TTL_MS = 3 * 60 * 1000   // 3 minutes

// Kill Flag — only needs to outlive the losing tab's next heartbeat
export const KILL_FLAG_TTL_MS = 10 * 60 * 1000          // 10 minutes

// Save versioning
export const CURRENT_SAVE_VERSION = 1

// Card archetypes — canonical strings; use these everywhere, never inline literals
export const CARD_ARCHETYPES = {
  GENERATOR: 'generator',
  REFINER:   'refiner',
  SELLER:    'seller',
  SPLITTER:  'splitter',
  COMBINER:  'combiner',
  CONVERTER: 'converter',
  STORAGE:   'storage',
} as const

export type CardArchetype = typeof CARD_ARCHETYPES[keyof typeof CARD_ARCHETYPES]

// Currency types — open string type; named constants for known currencies
export const CURRENCY_TYPES = {
  COIN:             'coin',
  RESEARCH_POINTS:  'research_points',
} as const

export type CurrencyType = string
