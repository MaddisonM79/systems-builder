// Pure serialization helpers — no Vue, no Pinia imports
import type { SaveV1 } from '@system-builder/schemas'
import type { Card, Connection } from '@/engine/graph'

export type StoreSnapshot = {
  cards: Map<string, Card>
  connections: Map<string, Connection>
  coin: number
  researchPoints: number
  cardXp: Record<string, number>
  cardLevels: Record<string, number>
  poolLevels: Record<string, number>
  prestigeCount: number
  unlockedCardIds: string[]
}

export type HydratedState = {
  cards: Card[]
  connections: Connection[]
  coin: number
  researchPoints: number
  cardXp: Record<string, number>
  cardLevels: Record<string, number>
  poolLevels: Record<string, number>
  prestigeCount: number
  unlockedCardIds: string[]
}

export function serialize(snapshot: StoreSnapshot, prev: SaveV1 | null): SaveV1 {
  return {
    version: 1,
    saveVersion: (prev?.saveVersion ?? 0) + 1,
    lastSyncVersion: prev?.lastSyncVersion ?? 0,
    savedAt: Date.now(),
    board: {
      cards: Array.from(snapshot.cards.values()),
      connections: Array.from(snapshot.connections.values()),
    },
    sim: {
      coin: snapshot.coin,
      researchPoints: snapshot.researchPoints,
      cardXp: { ...snapshot.cardXp },
      cardLevels: { ...snapshot.cardLevels },
      poolLevels: { ...snapshot.poolLevels },
    },
    game: {
      prestigeCount: snapshot.prestigeCount,
      unlockedCardIds: [...snapshot.unlockedCardIds],
    },
  }
}

export function deserialize(save: SaveV1): HydratedState {
  return {
    cards: save.board.cards as Card[],
    connections: save.board.connections as Connection[],
    coin: save.sim.coin,
    researchPoints: save.sim.researchPoints,
    cardXp: save.sim.cardXp,
    cardLevels: save.sim.cardLevels,
    poolLevels: save.sim.poolLevels,
    prestigeCount: save.game.prestigeCount,
    unlockedCardIds: save.game.unlockedCardIds,
  }
}
