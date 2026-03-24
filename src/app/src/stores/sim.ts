import { defineStore } from 'pinia'
import { ref, shallowRef, triggerRef } from 'vue'
import type { BufferContents } from '@/engine/simulation'

export const useSimStore = defineStore('sim', () => {
  // Flat refs per scalar value — never a single deep reactive object
  const coin = ref(0)
  const researchPoints = ref(0)

  // Per-card-instance maps — shallowRef; call triggerRef after mutating
  const cardXp     = shallowRef<Record<string, number>>({})
  const cardLevels = shallowRef<Record<string, number>>({})
  const poolLevels = shallowRef<Record<string, number>>({})

  // Per-port EMA-smoothed flow rates (items/sec) — updated every tick
  const portRates  = shallowRef<Record<string, number>>({})

  // Loaded from save — consumed once by useGameLoop.start() to seed simulation buffers
  const bufferContents = shallowRef<BufferContents>({})

  // Per-port buffer fill ratios (0.0–1.0) and raw item counts — snapshot each tick
  const portFill   = shallowRef<Record<string, number>>({})
  const portCount  = shallowRef<Record<string, number>>({})

  function setCardXp(cardId: string, xp: number): void {
    cardXp.value[cardId] = xp
    triggerRef(cardXp)
  }

  function setCardLevel(cardId: string, level: number): void {
    cardLevels.value[cardId] = level
    triggerRef(cardLevels)
  }

  function setPoolLevel(cardId: string, level: number): void {
    poolLevels.value[cardId] = level
    triggerRef(poolLevels)
  }

  // portFlows: portId → items moved this tick (raw from SimDelta)
  // dt: seconds per tick (0.1 at 10 ticks/sec)
  const EMA_ALPHA = 0.2
  function updatePortRates(portFlows: Record<string, number>, dt: number): void {
    const rates = portRates.value
    // Decay all existing rates toward zero
    for (const portId in rates) {
      rates[portId] = (1 - EMA_ALPHA) * rates[portId]
    }
    // Apply new observations
    for (const [portId, count] of Object.entries(portFlows)) {
      const observed = count / dt
      rates[portId] = EMA_ALPHA * observed + (1 - EMA_ALPHA) * (rates[portId] ?? 0)
    }
    triggerRef(portRates)
  }

  return {
    coin,
    researchPoints,
    cardXp,
    cardLevels,
    poolLevels,
    setCardXp,
    setCardLevel,
    setPoolLevel,
    bufferContents,
    portRates,
    updatePortRates,
    portFill,
    portCount,
    updatePortFill(fills: Record<string, number>, counts: Record<string, number>): void {
      portFill.value  = fills
      portCount.value = counts
      triggerRef(portFill)
      triggerRef(portCount)
    },
  }
})
