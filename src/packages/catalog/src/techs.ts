import type { ResearchTechDefinition } from '@system-builder/schemas'

export const techs: ResearchTechDefinition[] = [
  // ── Root nodes (no prerequisites) ──────────────────────────────────────────

  {
    id: 'crude_extraction',
    displayName: 'Crude Extraction',
    description: 'Rudimentary digging techniques. Generator output ticks slightly faster.',
    rpCost: 30,
    prerequisites: [],
    effects: [
      { type: 'stat_bonus', stat: 'generator_tick_rate', mode: 'multiplier', amount: 1.1 },
    ],
  },
  {
    id: 'backroom_deals',
    displayName: 'Backroom Deals',
    description: 'Informal trade networks grease the wheels. Base coin income increased.',
    rpCost: 30,
    prerequisites: [],
    effects: [
      { type: 'stat_bonus', stat: 'coin_income', mode: 'flat', amount: 5 },
    ],
  },

  // ── Tier 1 ─────────────────────────────────────────────────────────────────

  {
    id: 'ore_processing',
    displayName: 'Ore Processing',
    description: 'Crush, sort, smelt. Refiner throughput improved across the board.',
    rpCost: 90,
    prerequisites: ['crude_extraction'],
    effects: [
      { type: 'stat_bonus', stat: 'refiner_throughput', mode: 'multiplier', amount: 1.2 },
    ],
  },
  {
    id: 'merchant_guilds',
    displayName: 'Merchant Guilds',
    description: 'Formalised trade routes. Seller cards earn more per unit sold.',
    rpCost: 80,
    prerequisites: ['backroom_deals'],
    effects: [
      { type: 'stat_bonus', stat: 'seller_output', mode: 'multiplier', amount: 1.25 },
    ],
  },

  // ── Tier 2 (convergent) ────────────────────────────────────────────────────

  {
    id: 'industrial_commerce',
    displayName: 'Industrial Commerce',
    description: 'Refined goods meet organised markets. Unlocks the Smelting Bazaar card.',
    rpCost: 250,
    prerequisites: ['ore_processing', 'merchant_guilds'],
    effects: [
      { type: 'unlock_card', cardId: 'smelting_bazaar' },
    ],
  },
]
