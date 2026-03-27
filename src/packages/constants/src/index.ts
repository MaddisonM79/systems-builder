// Simulation tick timing — DT and INTERVAL_MS are coupled; always change together
export const TICK_CONFIG = {
  DT:          0.1,  // seconds per tick
  INTERVAL_MS: 100,  // milliseconds between ticks (must equal DT * 1000)
} as const

// Unlock condition discriminant values — mirrors the Zod union in schemas/card.ts
export const UNLOCK_CONDITION_TYPES = {
  FREE:             'free',
  COIN:             'coin',
  RESEARCH_POINTS:  'researchPoints',
  XP:               'xp',
  STORY_MILESTONE:  'storyMilestone',
} as const

// API response codes
export const API_CODES = {
  SAVE_CONFLICT: 'SAVE_CONFLICT',
} as const

// KV namespace keys
export const KV_KEYS = {
  APP_VERSION: 'app:version',
  KILL_FLAG: (deviceId: string) => `kill_flag:${deviceId}`,
} as const

// Device presence — heartbeat TTL while tab is open
export const DEVICE_HEARTBEAT_TTL_MS = 3 * 60 * 1000   // 3 minutes

// Kill Flag — only needs to outlive the losing tab's next heartbeat
export const KILL_FLAG_TTL_MS = 10 * 60 * 1000          // 10 minutes

// Save versioning
export const CURRENT_SAVE_VERSION = 1

// Card archetypes — canonical strings; use these everywhere, never inline literals
export const CARD_ARCHETYPES = {
  GENERATOR:  'generator',
  REFINER:    'refiner',
  SELLER:     'seller',
  SPLITTER:   'splitter',
  COMBINER:   'combiner',
  CONVERTER:  'converter',
  STORAGE:    'storage',
  RESEARCHER: 'researcher',
} as const

export type CardArchetype = typeof CARD_ARCHETYPES[keyof typeof CARD_ARCHETYPES]

// Currency types — open string type; named constants for known currencies
export const CURRENCY_TYPES = {
  COIN:             'coin',
  RESEARCH_POINTS:  'research_points',
} as const

export type CurrencyType = string

// Economy — global exchange rates between item value and each currency.
// All consuming cards (Seller, Researcher) read from here — no per-card rate fields.
// To rebalance the whole economy, change one number here.
export const ECONOMY = {
  COIN_PER_VALUE: 1,
  RP_PER_VALUE:   1,
} as const
